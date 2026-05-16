import logging
import secrets
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.session import Session, ActivityProgram
from app.models.group import Group
from app.models.user import User
from app.models.camper import Camper
from app.models.payment import Payment
from app.models.announcement import Announcement
from app.models.incident import IncidentReport
from app.utils.auth_helpers import role_required, hash_password
from app.utils.email import send_staff_welcome_email
from datetime import datetime
from app.models.enrollment import Enrollment
from app.utils.email import send_announcement_notification


admin_bp = Blueprint('admin', __name__)
staff_bp = Blueprint('staff', __name__)
logger = logging.getLogger(__name__)


def fail(message, status=400):
    return jsonify({'success': False, 'message': message}), status


def ok(data=None, message='Success', status=200):
    return jsonify({'success': True, 'data': data, 'message': message}), status


def parse_optional_age(value, field_label):
    if value in (None, ''):
        return None
    try:
        age = int(value)
    except (TypeError, ValueError):
        raise ValueError(f'{field_label} must be a valid number')
    if age < 0:
        raise ValueError(f'{field_label} cannot be negative')
    return age


def parse_activity_age_range(data):
    min_age = parse_optional_age(data.get('min_age'), 'Minimum age')
    max_age = parse_optional_age(data.get('max_age'), 'Maximum age')
    if min_age is not None and max_age is not None and min_age > max_age:
        raise ValueError('Minimum age cannot be greater than maximum age')
    return min_age, max_age


def payment_details(payment):
    data = payment.to_dict()
    enrollment = payment.enrollment
    camper = enrollment.camper if enrollment else None
    session = enrollment.session if enrollment else None
    data['camper_id'] = camper.id if camper else None
    data['camper_name'] = camper.full_name if camper else None
    data['session_id'] = session.id if session else None
    data['session_name'] = session.name if session else None
    return data


def incident_details(incident):
    data = incident.to_dict()
    camper = incident.camper if getattr(incident, 'camper', None) else None
    reporter = User.query.get(incident.reported_by)
    session = incident.session if getattr(incident, 'session', None) else None
    data['camper_name'] = camper.full_name if camper else None
    data['reported_by_name'] = reporter.full_name if reporter else None
    data['session_name'] = session.name if session else None
    return data


# ═══════════════════════════════════════════════════════════
#  SESSIONS
# ═══════════════════════════════════════════════════════════

@admin_bp.get('/sessions')
@role_required('admin')
def get_sessions():
    sessions = Session.query.all()
    return ok([s.to_dict() for s in sessions])

@admin_bp.post('/sessions')
@role_required('admin')
def create_session():
    from datetime import date                          # move this to top of file ideally

    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    required = ['name', 'start_date', 'end_date', 'max_capacity', 'enrollment_fee']
    if any(not data.get(f) for f in required):
        return fail('All session fields are required')

    # date validation — must come before anything touches the DB
    today = str(date.today())
    if data['start_date'] < today:
        return fail('Session start date cannot be in the past')
    if data['end_date'] <= data['start_date']:
        return fail('End date must be after start date')

    # FR 4.6: prevent overlapping session dates
    overlap = Session.query.filter(
        Session.start_date <= data['end_date'],
        Session.end_date   >= data['start_date']
    ).first()
    if overlap:
        return fail(f"Date range overlaps with existing session: '{overlap.name}'")

    new_session = Session(
        name           = data['name'],
        start_date     = data['start_date'],
        end_date       = data['end_date'],
        max_capacity   = data['max_capacity'],
        enrollment_fee = data['enrollment_fee'],
        created_by     = current_user_id
    )
    db.session.add(new_session)
    db.session.flush()

    for activity in data.get('activities', []):
        try:
            min_age, max_age = parse_activity_age_range(activity)
        except ValueError as exc:
            return fail(str(exc))

        ap = ActivityProgram(
            session_id = new_session.id,
            name       = activity['name'],
            fee        = activity.get('fee', 0.00),
            min_age    = min_age,
            max_age    = max_age
        )
        db.session.add(ap)

    db.session.commit()
    return ok(new_session.to_dict(), 'Session created', 201)

@admin_bp.put('/sessions/<int:session_id>')
@role_required('admin')
def edit_session(session_id):
    enrolled = Enrollment.query.filter_by(session_id=session_id, status='active').first()
    if enrolled:
        return fail('Cannot edit a session that has active enrollments')

    session = Session.query.get_or_404(session_id)
    data    = request.get_json() or {}

    session.name           = data.get('name',           session.name)
    session.start_date     = data.get('start_date',     session.start_date)
    session.end_date       = data.get('end_date',       session.end_date)
    session.max_capacity   = data.get('max_capacity',   session.max_capacity)
    session.enrollment_fee = data.get('enrollment_fee', session.enrollment_fee)

    db.session.commit()
    return ok(session.to_dict(), 'Session updated')


@admin_bp.delete('/sessions/<int:session_id>')
@role_required('admin')
def delete_session(session_id):
    enrolled = Enrollment.query.filter_by(session_id=session_id, status='active').first()
    if enrolled:
        return fail('Cannot delete a session that has active enrollments')

    session = Session.query.get_or_404(session_id)
    db.session.delete(session)
    db.session.commit()
    return ok(None, 'Session deleted')

@admin_bp.get('/sessions/<int:session_id>/activities')
@role_required('admin')
def get_session_activities(session_id):
    Session.query.get_or_404(session_id)
    activities = ActivityProgram.query.filter_by(session_id=session_id).all()
    return ok([a.to_dict() for a in activities])


@admin_bp.post('/sessions/<int:session_id>/activities')
@role_required('admin')
def add_session_activity(session_id):
    Session.query.get_or_404(session_id)
    data = request.get_json() or {}

    if not data.get('name'):
        return fail('Activity name is required')

    try:
        min_age, max_age = parse_activity_age_range(data)
    except ValueError as exc:
        return fail(str(exc))

    activity = ActivityProgram(
        session_id = session_id,
        name       = data['name'].strip(),
        fee        = float(data.get('fee', 0.00)),
        min_age    = min_age,
        max_age    = max_age
    )
    db.session.add(activity)
    db.session.commit()
    return ok(activity.to_dict(), 'Activity added', 201)


@admin_bp.delete('/sessions/<int:session_id>/activities/<int:activity_id>')
@role_required('admin')
def delete_session_activity(session_id, activity_id):
    activity = ActivityProgram.query.filter_by(id=activity_id, session_id=session_id).first()
    if not activity:
        return fail('Activity not found', 404)
    db.session.delete(activity)
    db.session.commit()
    return ok(None, 'Activity deleted')


# ═══════════════════════════════════════════════════════════
#  GROUPS
# ═══════════════════════════════════════════════════════════

@admin_bp.get('/sessions/<int:session_id>/groups')
@role_required('admin')
def get_groups(session_id):
    groups = Group.query.filter_by(session_id=session_id).all()
    return ok([g.to_dict() for g in groups])


@admin_bp.get('/sessions/<int:session_id>/enrollments')
@role_required('admin')
def get_session_enrollments(session_id):
    enrollments = Enrollment.query.filter_by(session_id=session_id, status='active').all()
    data = []
    for enrollment in enrollments:
        item = enrollment.to_dict()
        item['camper_name'] = enrollment.camper.full_name if enrollment.camper else None
        data.append(item)
    return ok(data)


@admin_bp.post('/sessions/<int:session_id>/groups')
@role_required('admin')
def create_group(session_id):
    Session.query.get_or_404(session_id)
    data = request.get_json() or {}

    if not data.get('name'):
        return fail('Group name is required')

    new_group = Group(
        session_id = session_id,
        name       = data['name'],
        staff_id   = data.get('staff_id')
    )
    db.session.add(new_group)
    db.session.commit()
    return ok(new_group.to_dict(), 'Group created', 201)


@admin_bp.put('/groups/<int:group_id>/assign-staff')
@role_required('admin')
def assign_staff(group_id):
    data     = request.get_json() or {}
    staff_id = data.get('staff_id')
    group    = Group.query.get_or_404(group_id)

    # FR 4.5: one staff per group per session
    already_assigned = Group.query.filter_by(
        session_id = group.session_id,
        staff_id   = staff_id
    ).first()
    if already_assigned and already_assigned.id != group_id:
        return fail('This staff member is already assigned to another group in this session')

    group.staff_id = staff_id
    db.session.commit()
    return ok(group.to_dict(), 'Staff assigned to group')


@admin_bp.put('/groups/<int:group_id>/assign-camper')
@role_required('admin')
def assign_camper(group_id):
    data      = request.get_json() or {}
    camper_id = data.get('camper_id')
    group     = Group.query.get_or_404(group_id)

    enrollment = Enrollment.query.filter_by(
        camper_id  = camper_id,
        session_id = group.session_id,
        status     = 'active'
    ).first()
    if not enrollment:
        return fail('Camper is not enrolled in this session')

    enrollment.group_id = group_id
    db.session.commit()
    return ok(None, 'Camper assigned to group')


# ═══════════════════════════════════════════════════════════
#  STAFF MANAGEMENT
# ═══════════════════════════════════════════════════════════

@admin_bp.get('/staff')
@role_required('admin')
def get_staff():
    staff_list = User.query.filter_by(role='staff').all()
    return ok([s.to_dict() for s in staff_list])


@admin_bp.post('/staff')
@role_required('admin')
def create_staff():
    data = request.get_json() or {}

    if not data.get('full_name') or not data.get('email'):
        return fail('Full name and email are required')

    email = data['email'].strip().lower()
    if User.query.filter_by(email=email).first():
        return fail('Email is already registered', 409)

    # Generate a temp password that satisfies is_strong_password
    # (8+ chars, upper, lower, digit).
    temp_password = 'Cm1' + secrets.token_urlsafe(9)

    new_staff = User(
        full_name            = data['full_name'].strip(),
        email                = email,
        password_hash        = hash_password(temp_password),
        role                 = 'staff',
        phone_number         = data.get('phone_number'),
        must_change_password = True,
        is_active            = True,
    )
    db.session.add(new_staff)
    db.session.commit()

    # FR 4.8: send temp password via email
    send_staff_welcome_email(new_staff, temp_password)

    return ok(new_staff.to_dict(), 'Staff account created', 201)


@admin_bp.put('/staff/<int:staff_id>/deactivate')
@role_required('admin')
def deactivate_staff(staff_id):
    staff = User.query.get_or_404(staff_id)
    if staff.role != 'staff':
        return fail('User is not a staff member')
    staff.is_active = False
    db.session.commit()
    return ok(staff.to_dict(), 'Staff account deactivated')


@admin_bp.put('/staff/<int:staff_id>/reactivate')
@role_required('admin')
def reactivate_staff(staff_id):
    staff = User.query.get_or_404(staff_id)
    if staff.role != 'staff':
        return fail('User is not a staff member')
    staff.is_active = True
    db.session.commit()
    return ok(staff.to_dict(), 'Staff account reactivated')

@admin_bp.delete('/staff/<int:staff_id>')
@role_required('admin')
def delete_staff(staff_id):
    from app.models.user import User
    staff = User.query.filter_by(id=staff_id, role='staff').first()
    if not staff:
        return fail('Staff member not found', 404)
    db.session.delete(staff)
    db.session.commit()
    return ok(None, 'Staff account deleted')
# ═══════════════════════════════════════════════════════════
#  CAMPERS (admin lookup — used by Reports filter dropdowns)
# ═══════════════════════════════════════════════════════════

@admin_bp.get('/campers')
@role_required('admin')
def get_campers():

    session_id = request.args.get('session_id', type=int)
    group_id   = request.args.get('group_id', type=int)

    query = Enrollment.query.filter_by(status='active')

    if session_id:
        query = query.filter_by(session_id=session_id)

    if group_id:
        query = query.filter_by(group_id=group_id)

    enrollments = query.all()

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


# ═══════════════════════════════════════════════════════════
#  PAYMENTS (admin view)
# ═══════════════════════════════════════════════════════════

@admin_bp.get('/payments')
@role_required('admin')
def get_payments():
    session_id = request.args.get('session_id')
    camper_id  = request.args.get('camper_id')
    status     = request.args.get('status')
    start_raw  = request.args.get('start_date')
    end_raw    = request.args.get('end_date')

    query = Payment.query

    # When session_id or camper_id is given, narrow by enrollment ids.
    if session_id or camper_id:
        enr_q = Enrollment.query
        if session_id:
            enr_q = enr_q.filter_by(session_id=int(session_id))
        if camper_id:
            enr_q = enr_q.filter_by(camper_id=int(camper_id))
        enrollment_ids = [e.id for e in enr_q.all()]
        if not enrollment_ids:
            return ok([])
        query = query.filter(Payment.enrollment_id.in_(enrollment_ids))

    if status:
        if status not in ('pending', 'confirmed', 'failed'):
            return fail('Status must be pending, confirmed, or failed')
        query = query.filter_by(status=status)

    if start_raw:
        try:
            start = datetime.strptime(start_raw, '%Y-%m-%d')
        except ValueError:
            return fail('Invalid start_date (YYYY-MM-DD)')
        query = query.filter(Payment.submitted_at >= start)

    if end_raw:
        try:
            end = datetime.strptime(end_raw, '%Y-%m-%d').replace(
                hour=23, minute=59, second=59
            )
        except ValueError:
            return fail('Invalid end_date (YYYY-MM-DD)')
        query = query.filter(Payment.submitted_at <= end)

    payments = query.order_by(Payment.submitted_at.desc()).all()
    return ok([payment_details(p) for p in payments])


@admin_bp.put('/payments/<int:payment_id>/status')
@role_required('admin')
def update_payment_status(payment_id):
    current_user_id = int(get_jwt_identity())
    data   = request.get_json() or {}
    status = data.get('status')

    # Accept either "note" (existing convention) or "admin_note"
    note = (data.get('note') or data.get('admin_note') or '').strip()

    if status not in ('pending', 'confirmed', 'failed'):
        return fail('Status must be pending, confirmed, or failed')

    # FR 4.12: justification note is REQUIRED for any manual override.
    if not note:
        return fail('A justification note is required when overriding a payment status')

    payment             = Payment.query.get_or_404(payment_id)
    payment.status      = status
    payment.admin_note  = note
    payment.override_by = current_user_id
    payment.confirmed_at = datetime.utcnow() if status == 'confirmed' else None

    db.session.commit()
    return ok(payment_details(payment), 'Payment status updated')


# ═══════════════════════════════════════════════════════════
#  ANNOUNCEMENTS
# ═══════════════════════════════════════════════════════════

@admin_bp.get('/announcements')
@role_required('admin')
def get_announcements():
    announcements = Announcement.query.order_by(Announcement.published_at.desc()).all()
    return ok([a.to_dict() for a in announcements])


@admin_bp.post('/announcements')
@role_required('admin')
def create_announcement():
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

   # ── Notify users ──────────────────────────────────────
    try:
        target_type = data.get('target_type', 'system_wide')

        if target_type == 'system_wide':
            users = User.query.filter_by(
                role='parent',
                is_active=True
            ).all()

            label = 'All Families'

        elif target_type == 'staff':
            users = User.query.filter_by(
                role='staff',
                is_active=True
            ).all()

            label = 'Staff Members'

        else:
            users = []
            label = 'CampMondo'

        for user in users:
            if user.email:
                send_announcement_notification(
                    parent_email = user.email,
                    parent_name  = user.full_name or 'User',
                    title        = data['title'],
                    body_text    = data['body'],
                    target_label = label
                )

    except Exception as e:
        logger.warning(f'Announcement email(s) failed: {e}')
    return ok(announcement.to_dict(), 'Announcement posted', 201)
    # ────────────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════
#  INCIDENT REPORTS (admin view)
# ═══════════════════════════════════════════════════════════

@admin_bp.get('/incidents')
@role_required('admin')
def get_incidents():
    session_id = request.args.get('session_id')
    camper_id  = request.args.get('camper_id')
    date       = request.args.get('date')

    query = IncidentReport.query
    if session_id:
        query = query.filter_by(session_id=int(session_id))
    if camper_id:
        query = query.filter_by(camper_id=int(camper_id))
    if date:
        query = query.filter_by(incident_date=date)

    incidents = query.order_by(IncidentReport.incident_date.desc()).all()
    return ok([incident_details(i) for i in incidents])