import secrets
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.session import Session, ActivityProgram
from app.models.group import Group
from app.models.user import User
from app.models.payment import Payment
from app.models.announcement import Announcement
from app.models.incident import IncidentReport
from app.utils.auth_helpers import role_required, hash_password
from app.utils.email import send_email


admin_bp = Blueprint('admin', __name__)


def fail(message, status=400):
    return jsonify({'success': False, 'message': message}), status


def ok(data=None, message='Success', status=200):
    return jsonify({'success': True, 'data': data, 'message': message}), status


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
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    required = ['name', 'start_date', 'end_date', 'max_capacity', 'enrollment_fee']
    if any(not data.get(f) for f in required):
        return fail('All session fields are required')

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
        ap = ActivityProgram(
            session_id = new_session.id,
            name       = activity['name'],
            fee        = activity.get('fee', 0.00)
        )
        db.session.add(ap)

    db.session.commit()
    return ok(new_session.to_dict(), 'Session created', 201)


@admin_bp.put('/sessions/<int:session_id>')
@role_required('admin')
def edit_session(session_id):
    from app.models.enrollment import Enrollment
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
    from app.models.enrollment import Enrollment
    enrolled = Enrollment.query.filter_by(session_id=session_id, status='active').first()
    if enrolled:
        return fail('Cannot delete a session that has active enrollments')

    session = Session.query.get_or_404(session_id)
    db.session.delete(session)
    db.session.commit()
    return ok(None, 'Session deleted')


# ═══════════════════════════════════════════════════════════
#  GROUPS
# ═══════════════════════════════════════════════════════════

@admin_bp.get('/sessions/<int:session_id>/groups')
@role_required('admin')
def get_groups(session_id):
    groups = Group.query.filter_by(session_id=session_id).all()
    return ok([g.to_dict() for g in groups])


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
    from app.models.enrollment import Enrollment
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

    if User.query.filter_by(email=data['email'].lower()).first():
        return fail('Email is already registered', 409)

    temp_password = secrets.token_urlsafe(8)

    new_staff = User(
        full_name            = data['full_name'],
        email                = data['email'].lower(),
        password_hash        = hash_password(temp_password),
        role                 = 'staff',
        phone_number         = data.get('phone_number'),
        must_change_password = True
    )
    db.session.add(new_staff)
    db.session.commit()

    # FR 4.8: send temp password via email
    send_email(
        new_staff.email,
        'Your CampMondo Staff Account',
        f'Hi {new_staff.full_name},\n\n'
        f'Your staff account has been created.\n\n'
        f'Temporary password: {temp_password}\n\n'
        f'Please log in and change your password immediately.\n\n'
        f'CampMondo Team'
    )
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


# ═══════════════════════════════════════════════════════════
#  PAYMENTS (admin view)
# ═══════════════════════════════════════════════════════════

@admin_bp.get('/payments')
@role_required('admin')
def get_payments():
    session_id = request.args.get('session_id')
    status     = request.args.get('status')

    query = Payment.query
    if session_id:
        from app.models.enrollment import Enrollment
        enrollment_ids = [e.id for e in Enrollment.query.filter_by(session_id=int(session_id)).all()]
        query = query.filter(Payment.enrollment_id.in_(enrollment_ids))
    if status:
        query = query.filter_by(status=status)

    payments = query.order_by(Payment.submitted_at.desc()).all()
    return ok([p.to_dict() for p in payments])


@admin_bp.put('/payments/<int:payment_id>/status')
@role_required('admin')
def update_payment_status(payment_id):
    from datetime import datetime
    current_user_id = int(get_jwt_identity())
    data    = request.get_json() or {}
    status  = data.get('status')

    if status not in ['pending', 'confirmed', 'failed']:
        return fail('Status must be pending, confirmed, or failed')

    payment             = Payment.query.get_or_404(payment_id)
    payment.status      = status
    payment.admin_note  = data.get('note')
    payment.override_by = current_user_id
    if status == 'confirmed':
        payment.confirmed_at = datetime.utcnow()

    db.session.commit()
    return ok(payment.to_dict(), 'Payment status updated')


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

    if not data.get('title') or not data.get('body'):
        return fail('Title and body are required')

    announcement = Announcement(
        author_id   = current_user_id,
        title       = data['title'],
        body        = data['body'],
        target_type = data.get('target_type', 'system_wide'),
        target_id   = data.get('target_id')
    )
    db.session.add(announcement)
    db.session.commit()
    return ok(announcement.to_dict(), 'Announcement posted', 201)


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
    return ok([i.to_dict() for i in incidents])