from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
from flask import Blueprint, request, jsonify
from app import db
from app.models.camper import Camper, EmergencyContact
from app.models.enrollment import Enrollment, EnrollmentActivity
from app.models.payment import Payment
from app.models.session import Session, ActivityProgram
from app.models.announcement import Announcement
from app.utils.auth_helpers import role_required, current_user
from app.utils.email import send_email, send_payment_submitted_email
from app.utils.email import send_enrollment_confirmation
from app.utils.email import send_camper_registration_email

parent_bp = Blueprint('parent', __name__)


MONEY = Decimal('0.01')


def fail(message, status=400):
    return jsonify({'success': False, 'message': message}), status


def ok(data=None, message='Success', status=200):
    return jsonify({'success': True, 'data': data, 'message': message}), status


def decimal_money(value):
    if value is None or value == '':
        return Decimal('0.00')
    try:
        return Decimal(str(value)).quantize(MONEY)
    except (InvalidOperation, ValueError):
        return Decimal('0.00')


def float_money(value):
    return float(decimal_money(value))


def calculate_age_on_date(date_of_birth, reference_date):
    if not date_of_birth or not reference_date:
        return None
    return (
        reference_date.year
        - date_of_birth.year
        - ((reference_date.month, reference_date.day) < (date_of_birth.month, date_of_birth.day))
    )


def activity_allowed_for_camper(activity, camper, reference_date):
    age = calculate_age_on_date(camper.date_of_birth, reference_date)
    if age is None:
        return False
    if activity.min_age is not None and age < activity.min_age:
        return False
    if activity.max_age is not None and age > activity.max_age:
        return False
    return True


def camper_with_contact(camper):
    data = camper.to_dict()
    contact = camper.emergency_contacts[0] if camper.emergency_contacts else None
    data['emergency_contact_name'] = contact.contact_name if contact else None
    data['emergency_contact_phone'] = contact.phone_number if contact else None
    return data


def selected_activity_programs(enrollment):
    programs = []
    for link in enrollment.activities or []:
        if link.activity:
            programs.append(link.activity)
    return programs


def enrollment_fee_breakdown(enrollment):
    session = enrollment.session
    session_fee = decimal_money(session.enrollment_fee if session else 0)
    activities = []
    activity_total = Decimal('0.00')

    for activity in selected_activity_programs(enrollment):
        fee = decimal_money(activity.fee)
        activity_total += fee
        activities.append({
            'id': activity.id,
            'name': activity.name,
            'fee': float(fee),
        })

    total_due = (session_fee + activity_total).quantize(MONEY)
    return {
        'session_fee': float(session_fee),
        'activities': activities,
        'activity_total': float(activity_total.quantize(MONEY)),
        'total_due': float(total_due),
    }


def parent_payment_query(parent_id):
    return (
        Payment.query
        .join(Enrollment, Payment.enrollment_id == Enrollment.id)
        .join(Camper, Enrollment.camper_id == Camper.id)
        .filter(Camper.parent_id == parent_id)
    )


def payment_with_camper(payment):
    data = payment.to_dict()
    enrollment = payment.enrollment
    camper = enrollment.camper if enrollment else None
    session = enrollment.session if enrollment else None
    data['camper_name'] = camper.full_name if camper else None
    data['session_name'] = session.name if session else None
    data['payment_date'] = data.get('submitted_at')
    data['card_last4'] = None
    if enrollment:
        data['fee_breakdown'] = enrollment_fee_breakdown(enrollment)
    return data


def cancellation_metadata(enrollment):
    session = enrollment.session
    if not session:
        return {
            'can_cancel': False,
            'cancellation_deadline': None,
        }

    today = datetime.utcnow().date()
    deadline = session.start_date - timedelta(days=7)
    return {
        'can_cancel': enrollment.status == 'active' and today <= deadline,
        'cancellation_deadline': str(deadline),
    }


def enrollment_with_details(enrollment):
    item = enrollment.to_dict()
    item['camper_name'] = enrollment.camper.full_name if enrollment.camper else None
    item['session'] = enrollment.session.to_dict() if getattr(enrollment, 'session', None) else None
    selected = [activity.to_dict() for activity in selected_activity_programs(enrollment)]
    item['selected_activities'] = selected
    item['selected_activity_ids'] = [activity['id'] for activity in selected]
    item['fee_breakdown'] = enrollment_fee_breakdown(enrollment)
    item['total_fee'] = item['fee_breakdown']['total_due']
    item.update(cancellation_metadata(enrollment))
    return item


def session_with_availability(session, parent_id=None):
    active_count = Enrollment.query.filter_by(session_id=session.id, status='active').count()
    data = session.to_dict()
    data['active_enrollments'] = active_count
    data['spots_left'] = max(session.max_capacity - active_count, 0)
    data['is_full'] = active_count >= session.max_capacity

    if parent_id:
        parent_camper_ids = [
            c.id for c in Camper.query.filter_by(parent_id=parent_id).all()
        ]
        if parent_camper_ids:
            parent_enrollments = Enrollment.query.filter(
                Enrollment.session_id == session.id,
                Enrollment.status == 'active',
                Enrollment.camper_id.in_(parent_camper_ids)
            ).all()
            data['enrolled_camper_ids'] = [e.camper_id for e in parent_enrollments]
            data['parent_enrollments'] = [enrollment_with_details(e) for e in parent_enrollments]
        else:
            data['enrolled_camper_ids'] = []
            data['parent_enrollments'] = []
    return data


def parse_activity_ids(raw_activity_ids):
    if raw_activity_ids in (None, ''):
        return []
    if not isinstance(raw_activity_ids, list):
        raise ValueError('activity_program_ids must be a list')

    parsed = []
    for raw_id in raw_activity_ids:
        try:
            activity_id = int(raw_id)
        except (TypeError, ValueError):
            raise ValueError('Invalid activity program selected')
        if activity_id not in parsed:
            parsed.append(activity_id)
    return parsed


def validate_selected_activities(session, raw_activity_ids, camper=None):
    activity_ids = parse_activity_ids(raw_activity_ids)
    session_activities = list(session.activity_programs or [])
    session_activity_ids = {activity.id for activity in session_activities}

    invalid_ids = [activity_id for activity_id in activity_ids if activity_id not in session_activity_ids]
    if invalid_ids:
        raise ValueError('One or more selected activities do not belong to this session')

    eligible_activities = session_activities
    if camper:
        eligible_activities = [
            activity for activity in session_activities
            if activity_allowed_for_camper(activity, camper, session.start_date)
        ]

    eligible_activity_ids = {activity.id for activity in eligible_activities}
    if eligible_activity_ids and not activity_ids:
        raise ValueError('Select at least one age-eligible activity program')

    ineligible_ids = [activity_id for activity_id in activity_ids if activity_id not in eligible_activity_ids]
    if ineligible_ids:
        raise ValueError('One or more selected activities are not available for this camper age')

    return [activity for activity in eligible_activities if activity.id in activity_ids]


def replace_enrollment_activities(enrollment, selected_activities):
    for link in list(enrollment.activities or []):
        db.session.delete(link)
    db.session.flush()

    for activity in selected_activities:
        db.session.add(EnrollmentActivity(
            enrollment_id=enrollment.id,
            activity_id=activity.id,
        ))


def overlapping_active_enrollment(camper, session):
    return (
        Enrollment.query
        .join(Session, Enrollment.session_id == Session.id)
        .filter(
            Enrollment.camper_id == camper.id,
            Enrollment.status == 'active',
            Enrollment.session_id != session.id,
            Session.start_date <= session.end_date,
            Session.end_date >= session.start_date,
        )
        .first()
    )


@parent_bp.get('/dashboard')
@role_required('parent')
def dashboard():
    user = current_user()
    campers = Camper.query.filter_by(parent_id=user.id).all()
    payments = parent_payment_query(user.id).all()
    return ok({
        'parent': user.to_dict(),
        'campers_count': len(campers),
        'payments_count': len(payments),
        'campers': [camper_with_contact(c) for c in campers],
    })


@parent_bp.post('/campers')
@role_required('parent')
def create_camper():
    user = current_user()
    data = request.get_json() or {}
    required = ['full_name', 'date_of_birth', 'gender', 'emergency_contact_name', 'emergency_contact_phone']
    if any(not data.get(field) for field in required):
        return fail('Missing required camper information')

    try:
        dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
    except ValueError:
        return fail('date_of_birth must be YYYY-MM-DD')

    if dob > datetime.utcnow().date():
        return fail('Date of birth cannot be in the future')

    camper = Camper(
        parent_id=user.id,
        full_name=data['full_name'].strip(),
        date_of_birth=dob,
        gender=data['gender'].strip().lower(),
        medical_alerts=data.get('medical_alerts')
    )
    db.session.add(camper)
    db.session.flush()

    contact = EmergencyContact(
        camper_id=camper.id,
        contact_name=data['emergency_contact_name'].strip(),
        phone_number=data['emergency_contact_phone'].strip()
    )
    db.session.add(contact)
    db.session.commit()
    try:
        send_camper_registration_email(
            parent_email=user.email,
            parent_name=user.full_name or 'Parent',
            camper_name=camper.full_name,
            date_of_birth=camper.date_of_birth.strftime('%B %d, %Y'),
            gender=camper.gender,
            medical_alerts=camper.medical_alerts
        )
    except Exception as e:
        print(f'[EMAIL] Camper registration email failed: {e}')
    return ok(camper_with_contact(camper), 'Camper profile created', 201)


@parent_bp.get('/campers')
@role_required('parent')
def list_campers():
    user = current_user()
    campers = Camper.query.filter_by(parent_id=user.id).all()
    return ok([camper_with_contact(c) for c in campers])


@parent_bp.get('/sessions')
@role_required('parent')
def list_sessions():
    user = current_user()
    sessions = Session.query.order_by(Session.start_date.asc()).all()
    return ok([session_with_availability(s, user.id) for s in sessions])


@parent_bp.get('/enrollments')
@role_required('parent')
def list_enrollments():
    user = current_user()
    enrollments = (
        Enrollment.query
        .join(Camper, Enrollment.camper_id == Camper.id)
        .filter(Camper.parent_id == user.id)
        .order_by(Enrollment.enrolled_at.desc())
        .all()
    )
    data = [enrollment_with_details(enrollment) for enrollment in enrollments]
    return ok(data)


@parent_bp.post('/enrollments')
@role_required('parent')
def create_enrollment():
    user = current_user()
    data = request.get_json() or {}
    camper_id = data.get('camper_id')
    session_id = data.get('session_id')

    if not camper_id or not session_id:
        return fail('Camper and session are required')

    camper = Camper.query.filter_by(id=camper_id, parent_id=user.id).first()
    if not camper:
        return fail('Camper not found', 404)

    session = Session.query.get(session_id)
    if not session:
        return fail('Session not found', 404)

    try:
        selected_activities = validate_selected_activities(session, data.get('activity_program_ids', data.get('activity_ids')), camper)
    except ValueError as exc:
        return fail(str(exc))

    active_count = Enrollment.query.filter_by(session_id=session.id, status='active').count()
    if active_count >= session.max_capacity:
        return fail('Session is full')

    existing = Enrollment.query.filter_by(camper_id=camper.id, session_id=session.id).first()
    if existing and existing.status == 'active':
        return fail('This camper is already enrolled in this session', 409)

    overlapping = overlapping_active_enrollment(camper, session)
    if overlapping:
        return fail('Camper is already enrolled in an overlapping camp session', 409)

    if existing:
        existing.status = 'active'
        existing.cancelled_at = None
        enrollment = existing
    else:
        enrollment = Enrollment(
            camper_id=camper.id,
            session_id=session.id,
            status='active'
        )
        db.session.add(enrollment)
        db.session.flush()

    replace_enrollment_activities(enrollment, selected_activities)
    db.session.commit()

    # ── Notify parent ───────────────────────────────────
    try:
        send_enrollment_confirmation(
            parent_email=user.email,
            parent_name=user.full_name or 'Parent',
            camper_name=camper.full_name,
            session_name=session.name,
            session_start=session.start_date.strftime('%B %d, %Y') if session.start_date else 'TBD',
            session_end=session.end_date.strftime('%B %d, %Y') if session.end_date else 'TBD',
            enrollment_fee=float(session.enrollment_fee or 0)
        )
    except Exception as e:
        print(f'[EMAIL] Enrollment confirmation failed: {e}')
    # ────────────────────────────────────────────────────

    item = enrollment.to_dict()
    item['camper_name'] = camper.full_name
    item['session'] = session.to_dict()
    return ok(item, 'Camper enrolled in session', 201)


@parent_bp.delete('/enrollments/<int:enrollment_id>')
@role_required('parent')
def cancel_enrollment(enrollment_id):
    user = current_user()
    enrollment = (
        Enrollment.query
        .join(Camper, Enrollment.camper_id == Camper.id)
        .filter(
            Enrollment.id == enrollment_id,
            Camper.parent_id == user.id
        )
        .first()
    )

    if not enrollment:
        return fail('Enrollment not found', 404)

    if enrollment.status != 'active':
        return fail('Enrollment is already cancelled')

    session = enrollment.session
    if not session:
        return fail('Session not found', 404)

    deadline = session.start_date - timedelta(days=7)
    today = datetime.utcnow().date()
    if today > deadline:
        return fail('Registration can only be cancelled at least 7 days before the session start date', 403)

    enrollment.status = 'cancelled'
    enrollment.cancelled_at = datetime.utcnow()
    enrollment.group_id = None
    db.session.commit()

    return ok(enrollment_with_details(enrollment), 'Enrollment cancelled successfully')


@parent_bp.put('/campers/<int:camper_id>')
@role_required('parent')
def update_camper(camper_id):
    user = current_user()
    camper = Camper.query.filter_by(id=camper_id, parent_id=user.id).first()
    if not camper:
        return fail('Camper not found', 404)
    data = request.get_json() or {}
    for field in ['full_name', 'gender', 'medical_alerts']:
        if field in data:
            value = data[field]
            setattr(camper, field, value.strip().lower() if field == 'gender' and value else value)
    if 'emergency_contact_name' in data or 'emergency_contact_phone' in data:
        contact = camper.emergency_contacts[0] if camper.emergency_contacts else EmergencyContact(camper_id=camper.id)
        contact.contact_name = data.get('emergency_contact_name', contact.contact_name)
        contact.phone_number = data.get('emergency_contact_phone', contact.phone_number)
        db.session.add(contact)
    if data.get('date_of_birth'):
        try:
            dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        except ValueError:
            return fail('date_of_birth must be YYYY-MM-DD')
        if dob > datetime.utcnow().date():
            return fail('Date of birth cannot be in the future')
        camper.date_of_birth = dob
    db.session.commit()
    return ok(camper_with_contact(camper), 'Camper profile updated')


@parent_bp.delete('/campers/<int:camper_id>')
@role_required('parent')
def delete_camper(camper_id):
    user = current_user()
    camper = Camper.query.filter_by(id=camper_id, parent_id=user.id).first()
    if not camper:
        return fail('Camper not found', 404)
    db.session.delete(camper)
    db.session.commit()
    return ok(None, 'Camper profile removed')


@parent_bp.post('/payments')
@role_required('parent')
def submit_payment():
    user = current_user()
    data = request.get_json() or {}
    required = ['enrollment_id', 'card_number', 'expiry_date', 'cvv']
    if any(not data.get(field) for field in required):
        return fail('Payment information is incomplete')

    enrollment = (
        Enrollment.query
        .join(Camper, Enrollment.camper_id == Camper.id)
        .filter(
            Enrollment.id == data['enrollment_id'],
            Enrollment.status == 'active',
            Camper.parent_id == user.id
        )
        .first()
    )
    if not enrollment:
        return fail('Enrollment not found for this parent', 404)

    total_due = decimal_money(enrollment_fee_breakdown(enrollment)['total_due'])
    if total_due <= 0:
        return fail('Payment amount must be greater than zero')

    submitted_amount = data.get('amount')
    if submitted_amount not in (None, '') and decimal_money(submitted_amount) != total_due:
        return fail('Payment amount must match the selected session and activity fees')

    card_number = ''.join(ch for ch in str(data['card_number']) if ch.isdigit())
    if len(card_number) < 12 or len(str(data['cvv'])) not in [3, 4]:
        return fail('Payment could not be processed. Please verify your card details and try again.')

    payment = Payment(
        enrollment_id=enrollment.id,
        amount=total_due,
        status='pending'
    )
    db.session.add(payment)
    db.session.commit()
    send_payment_submitted_email(user, payment, enrollment)
    return ok(payment_with_camper(payment), 'Payment submitted', 201)


@parent_bp.get('/payments')
@role_required('parent')
def list_payments():
    user = current_user()
    payments = parent_payment_query(user.id).order_by(Payment.submitted_at.desc()).all()
    return ok([payment_with_camper(p) for p in payments])


@parent_bp.get('/announcements')
@role_required('parent')
def announcements():
    user = current_user()
    enrollments = (
        Enrollment.query
        .join(Camper, Enrollment.camper_id == Camper.id)
        .filter(Camper.parent_id == user.id, Enrollment.status == 'active')
        .all()
    )
    session_ids = {e.session_id for e in enrollments}
    group_ids = {e.group_id for e in enrollments if e.group_id}

    announcements_query = Announcement.query.filter(
        (Announcement.target_type == 'system_wide')
        | ((Announcement.target_type == 'session') & (Announcement.target_id.in_(session_ids) if session_ids else False))
        | ((Announcement.target_type == 'group') & (Announcement.target_id.in_(group_ids) if group_ids else False))
    ).order_by(Announcement.published_at.desc())

    return ok([a.to_dict() for a in announcements_query.all()])
