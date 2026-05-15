from datetime import datetime
from venv import logger

from app.models.session import Session
import app
from app.utils.email import send_announcement_notification, send_incident_notification
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models.activity_log import ActivityLog
from app.models.attendance import AttendanceLog
from app.models.camper import Camper
from app.models.enrollment import Enrollment
from app.models.group import Group
from app.models.incident import IncidentReport
from app.models.user import User
from app.utils.auth_helpers import role_required
from app.models.announcement import Announcement


staff_bp = Blueprint('staff', __name__)


def fail(message, status=400):
    return jsonify({'success': False, 'message': message}), status


def ok(data=None, message='Success', status=200):
    return jsonify({'success': True, 'data': data, 'message': message}), status


def staff_id():
    return int(get_jwt_identity())


def staff_groups():
    return Group.query.filter_by(staff_id=staff_id()).all()


def staff_group_ids():
    return [group.id for group in staff_groups()]


def first_staff_group():
    groups = staff_groups()
    return groups[0] if groups else None


def active_enrollment_for_staff(camper_id, session_id=None):
    group_ids = staff_group_ids()
    if not group_ids:
        return None

    query = Enrollment.query.filter(
        Enrollment.camper_id == camper_id,
        Enrollment.status == 'active',
        Enrollment.group_id.in_(group_ids),
    )
    if session_id:
        query = query.filter(Enrollment.session_id == session_id)
    return query.first()


def camper_details(camper, enrollment=None):
    data = camper.to_dict()
    data['group_id'] = enrollment.group_id if enrollment else None
    data['session_id'] = enrollment.session_id if enrollment else None
    data['session_name'] = enrollment.session.name if enrollment and enrollment.session else None
    data['emergency_contact_name'] = None
    data['emergency_contact_phone'] = None
    if getattr(camper, 'emergency_contacts', None):
        contact = camper.emergency_contacts[0] if camper.emergency_contacts else None
        if contact:
            data['emergency_contact_name'] = contact.contact_name
            data['emergency_contact_phone'] = contact.phone_number
    return data


def incident_details(incident):
    data = incident.to_dict()
    camper = Camper.query.get(incident.camper_id)
    reporter = User.query.get(incident.reported_by)
    session = incident.session if getattr(incident, 'session', None) else None
    data['camper_name'] = camper.full_name if camper else None
    data['reported_by_name'] = reporter.full_name if reporter else None
    data['session_name'] = session.name if session else None
    return data


def attendance_details(record):
    data = record.to_dict()
    camper = Camper.query.get(record.camper_id)
    data['camper_name'] = camper.full_name if camper else None
    data['group_name'] = record.group.name if getattr(record, 'group', None) else None
    data['session_name'] = record.session.name if getattr(record, 'session', None) else None

    # Aliases used by the updated staff dashboard ZIP.
    data['date'] = str(record.log_date) if record.log_date else None
    data['check_in_time'] = record.checked_in_at.isoformat() if record.checked_in_at else None
    data['check_out_time'] = record.checked_out_at.isoformat() if record.checked_out_at else None
    return data


def group_details(group):
    data = group.to_dict()
    data['session_name'] = group.session.name if group.session else None
    return data


def activity_details(activity):
    data = activity.to_dict()
    data['group_name'] = activity.group.name if getattr(activity, 'group', None) else None
    data['session_name'] = activity.group.session.name if getattr(activity, 'group', None) and activity.group.session else None
    reporter = User.query.get(activity.logged_by)
    data['logged_by_name'] = reporter.full_name if reporter else None
    return data


@staff_bp.get('/campers')
@role_required('staff')
def list_staff_campers():

    group_ids = staff_group_ids()

    if not group_ids:
        return ok([])

    enrollments = Enrollment.query.filter(
        Enrollment.group_id.in_(group_ids),
        Enrollment.status == 'active'
    ).all()

    campers_data = []

    for enrollment in enrollments:

        camper = enrollment.camper

        if not camper:
            continue

        camper_data = camper.to_dict()

        camper_data['session'] = (
            enrollment.session.to_dict()
            if enrollment.session else None
        )

        camper_data['group'] = (
            enrollment.group.to_dict()
            if enrollment.group else None
        )

        camper_data['activities'] = [
            ea.activity.to_dict()
            for ea in enrollment.activities
            if ea.activity
        ]

        campers_data.append(camper_data)

    return ok(campers_data)


@staff_bp.get('/groups')
@role_required('staff')
def list_staff_groups():
    return ok([group_details(group) for group in staff_groups()])


@staff_bp.post('/attendance/checkin')
@staff_bp.post('/checkin')
@role_required('staff')
def check_in():
    current_staff_id = staff_id()
    data = request.get_json() or {}
    camper_id = data.get('camper_id')
    group_id = data.get('group_id')
    session_id = data.get('session_id')

    if not camper_id or not group_id:
        return fail('Camper and group are required')

    try:
        camper_id = int(camper_id)
        group_id = int(group_id)
        session_id = int(session_id) if session_id else None
    except (TypeError, ValueError):
        return fail('Camper, group, and session must be numeric IDs')

    group = Group.query.get(group_id)
    if not group:
        return fail('Group not found', 404)
    if group_id not in staff_group_ids():
        return fail('This group is not assigned to you', 403)

    session_id = session_id or group.session_id
    enrollment = active_enrollment_for_staff(camper_id, session_id)
    if not enrollment:
        return fail('This camper is not assigned to you for this session', 403)

    today = datetime.utcnow().date()
    active_record = AttendanceLog.query.filter_by(
        camper_id=camper_id,
        checked_out_at=None
    ).first()
    if active_record:
        return fail('Camper already checked in')

    attendance = AttendanceLog(
        camper_id=camper_id,
        group_id=group_id,
        session_id=session_id,
        log_date=today,
        recorded_by=current_staff_id,
        checked_in_at=datetime.utcnow(),
        status='present',
    )
    db.session.add(attendance)
    db.session.commit()

    return ok(attendance_details(attendance), 'Checked in successfully')


@staff_bp.post('/attendance/checkout')
@staff_bp.post('/checkout')
@role_required('staff')
def check_out():
    data = request.get_json() or {}
    camper_id = data.get('camper_id')

    if not camper_id:
        return fail('Camper is required')

    try:
        camper_id = int(camper_id)
    except (TypeError, ValueError):
        return fail('Camper must be a numeric ID')

    group_ids = staff_group_ids()
    if not group_ids:
        return fail('No groups are assigned to you', 403)

    attendance = AttendanceLog.query.filter(
        AttendanceLog.camper_id == camper_id,
        AttendanceLog.group_id.in_(group_ids),
        AttendanceLog.checked_out_at.is_(None),
    ).order_by(AttendanceLog.checked_in_at.desc()).first()

    if not attendance:
        return fail('No active check-in found', 404)

    attendance.checked_out_at = datetime.utcnow()
    db.session.commit()

    return ok(attendance_details(attendance), 'Checked out successfully')


@staff_bp.get('/attendance')
@role_required('staff')
def get_attendance():
    group_ids = staff_group_ids()
    if not group_ids:
        return ok([])

    records = AttendanceLog.query.filter(
        AttendanceLog.group_id.in_(group_ids)
    ).order_by(AttendanceLog.log_date.desc(), AttendanceLog.id.desc()).all()
    return ok([attendance_details(r) for r in records])


@staff_bp.get('/currently-inside')
@role_required('staff')
def currently_inside():
    group_ids = staff_group_ids()
    if not group_ids:
        return ok([])

    records = AttendanceLog.query.filter(
        AttendanceLog.group_id.in_(group_ids),
        AttendanceLog.checked_out_at.is_(None),
    ).order_by(AttendanceLog.checked_in_at.desc()).all()
    return ok([attendance_details(r) for r in records])


@staff_bp.get('/activity-logs')
@staff_bp.get('/activity-log')
@role_required('staff')
def list_activity_logs():
    group_ids = staff_group_ids()
    if not group_ids:
        return ok([])

    logs = ActivityLog.query.filter(
        ActivityLog.group_id.in_(group_ids)
    ).order_by(ActivityLog.log_date.desc(), ActivityLog.id.desc()).all()
    return ok([activity_details(log) for log in logs])


@staff_bp.post('/activity-logs')
@staff_bp.post('/activity-log')
@role_required('staff')
def create_activity_log():
    current_staff_id = staff_id()
    data = request.get_json() or {}

    # Full form used by the original project.
    group_id = data.get('group_id')
    activity_name = data.get('activity_name')
    log_date = data.get('log_date')
    duration_minutes = data.get('duration_minutes')
    description = data.get('description')

    # Compact form used by the updated staff dashboard ZIP.
    if description and not group_id:
        group = first_staff_group()
        if not group:
            return fail('No groups are assigned to you', 403)
        group_id = group.id
        activity_name = activity_name or 'Camp Activity'
        log_date = log_date or datetime.utcnow().strftime('%Y-%m-%d')
        duration_minutes = duration_minutes or 60

    required = [group_id, activity_name, log_date, duration_minutes, description]
    if any(value in (None, '') for value in required):
        return fail('Group, activity name, date, duration, and description are required')

    try:
        group_id = int(group_id)
        parsed_log_date = datetime.strptime(log_date, '%Y-%m-%d').date()
        parsed_duration = int(duration_minutes)
    except (TypeError, ValueError):
        return fail('Date must be YYYY-MM-DD and duration must be a number')

    if group_id not in staff_group_ids():
        return fail('This group is not assigned to you', 403)
    if parsed_duration <= 0:
        return fail('Duration must be greater than zero')

    log = ActivityLog(
        group_id=group_id,
        logged_by=current_staff_id,
        activity_name=str(activity_name).strip(),
        log_date=parsed_log_date,
        duration_minutes=parsed_duration,
        description=str(description).strip(),
    )
    db.session.add(log)
    db.session.commit()

    return ok(activity_details(log), 'Activity added successfully', 201)


@staff_bp.put('/activity-logs/<int:log_id>')
@staff_bp.put('/activity-log/<int:log_id>')
@role_required('staff')
def update_activity_log(log_id):
    log = ActivityLog.query.get(log_id)
    if not log:
        return fail('Activity not found', 404)
    if log.group_id not in staff_group_ids():
        return fail('This activity is not assigned to you', 403)

    data = request.get_json() or {}
    for field in ['activity_name', 'description']:
        if field in data:
            setattr(log, field, str(data[field]).strip())
    if data.get('duration_minutes'):
        try:
            duration = int(data['duration_minutes'])
        except (TypeError, ValueError):
            return fail('Duration must be a number')
        if duration <= 0:
            return fail('Duration must be greater than zero')
        log.duration_minutes = duration
    if data.get('log_date'):
        try:
            log.log_date = datetime.strptime(data['log_date'], '%Y-%m-%d').date()
        except ValueError:
            return fail('Date must be YYYY-MM-DD')

    db.session.commit()
    return ok(activity_details(log), 'Activity updated successfully')


@staff_bp.delete('/activity-logs/<int:log_id>')
@staff_bp.delete('/activity-log/<int:log_id>')
@role_required('staff')
def delete_activity_log(log_id):
    log = ActivityLog.query.get(log_id)
    if not log:
        return fail('Activity not found', 404)
    if log.group_id not in staff_group_ids():
        return fail('This activity is not assigned to you', 403)

    db.session.delete(log)
    db.session.commit()
    return ok(None, 'Activity deleted successfully')


@staff_bp.get('/incidents')
@role_required('staff')
def list_incidents():
    group_ids = staff_group_ids()
    if not group_ids:
        return ok([])

    incidents = IncidentReport.query.join(
        Enrollment,
        (Enrollment.camper_id == IncidentReport.camper_id) &
        (Enrollment.session_id == IncidentReport.session_id)
    ).filter(
        Enrollment.group_id.in_(group_ids)
    ).order_by(IncidentReport.created_at.desc()).all()

    return ok([incident_details(i) for i in incidents])


@staff_bp.post('/incidents')
@role_required('staff')
def create_incident():
    current_staff_id = staff_id()
    data = request.get_json() or {}
    camper_id = data.get('camper_id')
    session_id = data.get('session_id')
    incident_date = data.get('incident_date')
    incident_time = data.get('incident_time')
    description = data.get('description')

    if not camper_id or not description:
        return fail('Camper and description are required')

    try:
        camper_id = int(camper_id)
        session_id = int(session_id) if session_id else None
    except (TypeError, ValueError):
        return fail('Camper and session must be numeric IDs')

    enrollment = active_enrollment_for_staff(camper_id, session_id)
    if not enrollment:
        return fail('This camper is not assigned to you', 403)
    session_id = session_id or enrollment.session_id

    try:
        parsed_date = (
            datetime.strptime(incident_date, '%Y-%m-%d').date()
            if incident_date else datetime.utcnow().date()
        )
        parsed_time = (
            datetime.strptime(incident_time, '%H:%M').time()
            if incident_time else datetime.utcnow().time()
        )
    except ValueError:
        return fail('Incident date must be YYYY-MM-DD and time must be HH:MM')

    incident = IncidentReport(
        camper_id=camper_id,
        reported_by=current_staff_id,
        session_id=session_id,
        incident_date=parsed_date,
        incident_time=parsed_time,
        description=str(description).strip(),
        action_taken=(data.get('action_taken') or '').strip() or None,
    )
    db.session.add(incident)
    db.session.commit()

    try:
        camper = Camper.query.get(incident.camper_id)
        if camper and camper.parent_id:
            parent = User.query.get(camper.parent_id)
            session = Session.query.get(incident.session_id)
            if parent and parent.email:
                send_incident_notification(
                    parent_email=parent.email,
                    parent_name=parent.full_name or 'Parent',
                    camper_name=camper.full_name or 'your child',
                    incident_date=incident.incident_date.strftime('%B %d, %Y'),
                    description=incident.description,
                    session_name=session.name if session else 'your session'
                )
    except Exception as e:
        print(f'[EMAIL] Incident notification failed: {e}')

    return ok(incident_details(incident), 'Incident report submitted', 201)


@staff_bp.put('/incidents/<int:incident_id>')
@role_required('staff')
def update_incident(incident_id):
    incident = IncidentReport.query.get(incident_id)
    if not incident:
        return fail('Incident not found', 404)
    if not active_enrollment_for_staff(incident.camper_id, incident.session_id):
        return fail('This incident is not assigned to you', 403)

    data = request.get_json() or {}
    for field in ['description', 'action_taken']:
        if field in data:
            setattr(incident, field, str(data[field]).strip() or None)
    if data.get('incident_date'):
        try:
            incident.incident_date = datetime.strptime(data['incident_date'], '%Y-%m-%d').date()
        except ValueError:
            return fail('Incident date must be YYYY-MM-DD')
    if data.get('incident_time'):
        try:
            incident.incident_time = datetime.strptime(data['incident_time'], '%H:%M').time()
        except ValueError:
            return fail('Incident time must be HH:MM')

    db.session.commit()
    return ok(incident_details(incident), 'Incident updated successfully')


@staff_bp.delete('/incidents/<int:incident_id>')
@role_required('staff')
def delete_incident(incident_id):
    incident = IncidentReport.query.get(incident_id)
    if not incident:
        return fail('Incident not found', 404)
    if not active_enrollment_for_staff(incident.camper_id, incident.session_id):
        return fail('This incident is not assigned to you', 403)

    db.session.delete(incident)
    db.session.commit()
    return ok(None, 'Incident deleted successfully')
@staff_bp.get('/dashboard-stats')
@role_required('staff')
def dashboard_stats():
    group_ids = staff_group_ids()
    if not group_ids:
        return ok({
            'total_campers': 0,
            'present_today': 0,
            'total_incidents': 0,
            'total_activities': 0,
        })

    camper_ids = [
        row[0] for row in db.session.query(Enrollment.camper_id).filter(
            Enrollment.group_id.in_(group_ids),
            Enrollment.status == 'active'
        ).distinct().all()
    ]

    total_campers = len(camper_ids)
    present_today = AttendanceLog.query.filter(
        AttendanceLog.group_id.in_(group_ids),
        AttendanceLog.checked_out_at.is_(None),
    ).count()
    total_activities = ActivityLog.query.filter(ActivityLog.group_id.in_(group_ids)).count()

    total_incidents = 0
    if camper_ids:
        total_incidents = IncidentReport.query.filter(
            IncidentReport.camper_id.in_(camper_ids)
        ).count()

    return ok({
        'total_campers': total_campers,
        'present_today': present_today,
        'total_incidents': total_incidents,
        'total_activities': total_activities,
    })

@staff_bp.get('/announcements')
@role_required('staff')
def staff_get_announcements():
    announcements = Announcement.query.order_by(
        Announcement.published_at.desc()
    ).all()

    return ok([a.to_dict() for a in announcements])

@staff_bp.post('/announcements')
@role_required('staff')
def staff_create_announcement():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    body  = data.get('body', '').strip()

    if not title or not body:
        return fail('Title and body are required')

    if len(body) < 10:
        return fail('Announcement body must be at least 10 characters')

    announcement = Announcement(
        author_id   = current_user_id,
        title       = title,
        body        = body,
        target_type = data.get('target_type', 'system_wide'),
        target_id   = data.get('target_id')
    )

    db.session.add(announcement)
    db.session.commit()
    try:
        target_type = data.get('target_type', 'system_wide')
        target_id   = data.get('target_id')

        if target_type == 'system_wide':
            parents = User.query.filter_by(role='parent', is_active=True).all()
            label   = 'All Families'

        elif target_type == 'session':
            parents = (
                db.session.query(User)
                .join(Camper, Camper.parent_id == User.id)
                .join(Enrollment, Enrollment.camper_id == Camper.id)
                .filter(Enrollment.session_id == target_id, Enrollment.status == 'active')
                .distinct().all()
            )
            s     = Session.query.get(target_id)
            label = f'Session: {s.name}' if s else 'Your Session'

        elif target_type == 'group':
            parents = (
                db.session.query(User)
                .join(Camper, Camper.parent_id == User.id)
                .join(Enrollment, Enrollment.camper_id == Camper.id)
                .filter(Enrollment.group_id == target_id, Enrollment.status == 'active')
                .distinct().all()
            )
            g     = Group.query.get(target_id)
            label = f'Group: {g.name}' if g else 'Your Group'

        else:
            parents = []
            label   = 'CampMondo'

        for parent in parents:
            if parent.email:
                send_announcement_notification(
                    parent_email = parent.email,
                    parent_name  = parent.full_name or 'Parent',
                    title        = data['title'],
                    body_text    = data['body'],
                    target_label = label
                )
    except Exception as e:
        logger.warning(f'Announcement email(s) failed: {e}')
    # ────────────────────────────────────────────────────────
    return ok(announcement.to_dict(), 'Announcement posted', 201)
@staff_bp.get('/recent-activity')
@role_required('staff')
def recent_activity():
    group_ids = staff_group_ids()
    if not group_ids:
        return ok([])

    feed = []

    activities = ActivityLog.query.filter(
        ActivityLog.group_id.in_(group_ids)
    ).order_by(ActivityLog.created_at.desc()).limit(5).all()
    for activity in activities:
        feed.append({
            'type': 'activity',
            'message': f'Activity added: {activity.activity_name}',
            'time': activity.created_at.isoformat() if activity.created_at else None,
        })

    attendance = AttendanceLog.query.filter(
        AttendanceLog.group_id.in_(group_ids)
    ).order_by(AttendanceLog.id.desc()).limit(5).all()
    for record in attendance:
        camper = Camper.query.get(record.camper_id)
        camper_name = camper.full_name if camper else 'Unknown Camper'
        feed.append({
            'type': 'attendance',
            'message': f'{camper_name} checked in',
            'time': record.checked_in_at.isoformat() if record.checked_in_at else None,
        })

    camper_ids = [
        row[0] for row in db.session.query(Enrollment.camper_id).filter(
            Enrollment.group_id.in_(group_ids),
            Enrollment.status == 'active'
        ).distinct().all()
    ]
    if camper_ids:
        incidents = IncidentReport.query.filter(
            IncidentReport.camper_id.in_(camper_ids)
        ).order_by(IncidentReport.created_at.desc()).limit(5).all()
        for incident in incidents:
            camper = Camper.query.get(incident.camper_id)
            camper_name = camper.full_name if camper else 'Unknown Camper'
            feed.append({
                'type': 'incident',
                'message': f'Incident reported for {camper_name}',
                'time': incident.created_at.isoformat() if incident.created_at else None,
            })

    feed.sort(key=lambda item: item.get('time') or '', reverse=True)
    return ok(feed[:10])
