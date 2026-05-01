from datetime import datetime
from flask import Blueprint, request, jsonify
from app import db
from app.models.payment import Payment
from app.utils.auth_helpers import role_required, current_user
from app.utils.email import send_email


parent_bp = Blueprint('parent', __name__)


def fail(message, status=400):
    return jsonify({'success': False, 'message': message}), status


def ok(data=None, message='Success', status=200):
    return jsonify({'success': True, 'data': data, 'message': message}), status


# ================= DASHBOARD =================
@parent_bp.get('/dashboard')
@role_required('parent')
def dashboard():
    from app.models.camper import Camper  # ✅ moved here

    user = current_user()
    campers = Camper.query.filter_by(parent_id=user.id).all()
    payments = Payment.query.filter_by(parent_id=user.id).all()

    return ok({
        'parent': user.to_dict(),
        'campers_count': len(campers),
        'payments_count': len(payments),
        'campers': [c.to_dict() for c in campers],
    })


# ================= CREATE CAMPER =================
@parent_bp.post('/campers')
@role_required('parent')
def create_camper():
    from app.models.camper import Camper  # ✅ moved here

    user = current_user()
    data = request.get_json() or {}

    required = [
        'full_name',
        'date_of_birth',
        'gender',
        'emergency_contact_name',
        'emergency_contact_phone'
    ]

    if any(not data.get(field) for field in required):
        return fail('Missing required camper information')

    try:
        dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
    except ValueError:
        return fail('date_of_birth must be YYYY-MM-DD')

    camper = Camper(
        parent_id=user.id,
        full_name=data['full_name'],
        date_of_birth=dob,
        gender=data['gender'],
        emergency_contact_name=data['emergency_contact_name'],
        emergency_contact_phone=data['emergency_contact_phone'],
        medical_alerts=data.get('medical_alerts')
    )

    db.session.add(camper)
    db.session.commit()

    send_email(
        user.email,
        'Camper Created',
        f'Camper {camper.full_name} was successfully created.'
    )

    return ok(camper.to_dict(), 'Camper created', 201)


# ================= LIST CAMPERS =================
@parent_bp.get('/campers')
@role_required('parent')
def list_campers():
    from app.models.camper import Camper  # ✅ moved here

    user = current_user()
    campers = Camper.query.filter_by(parent_id=user.id).all()

    return ok([c.to_dict() for c in campers])


# ================= UPDATE CAMPER =================
@parent_bp.put('/campers/<int:camper_id>')
@role_required('parent')
def update_camper(camper_id):
    from app.models.camper import Camper  # ✅ moved here

    user = current_user()
    camper = Camper.query.filter_by(id=camper_id, parent_id=user.id).first()

    if not camper:
        return fail('Camper not found', 404)

    data = request.get_json() or {}

    for field in [
        'full_name',
        'gender',
        'emergency_contact_name',
        'emergency_contact_phone',
        'medical_alerts'
    ]:
        if field in data:
            setattr(camper, field, data[field])

    if data.get('date_of_birth'):
        try:
            camper.date_of_birth = datetime.strptime(
                data['date_of_birth'], '%Y-%m-%d'
            ).date()
        except ValueError:
            return fail('Invalid date format (YYYY-MM-DD required)')

    db.session.commit()

    return ok(camper.to_dict(), 'Camper updated')


# ================= DELETE CAMPER =================
@parent_bp.delete('/campers/<int:camper_id>')
@role_required('parent')
def delete_camper(camper_id):
    from app.models.camper import Camper  # ✅ moved here

    user = current_user()
    camper = Camper.query.filter_by(id=camper_id, parent_id=user.id).first()

    if not camper:
        return fail('Camper not found', 404)

    db.session.delete(camper)
    db.session.commit()

    return ok(None, 'Camper deleted')


# ================= CREATE PAYMENT =================
@parent_bp.post('/payments')
@role_required('parent')
def submit_payment():
    from app.models.camper import Camper  # ✅ moved here

    user = current_user()
    data = request.get_json() or {}

    required = ['camper_id', 'amount', 'card_number', 'expiry_date', 'cvv']

    if any(not data.get(field) for field in required):
        return fail('Incomplete payment data')

    camper = Camper.query.filter_by(
        id=data['camper_id'],
        parent_id=user.id
    ).first()

    if not camper:
        return fail('Camper not found', 404)

    card_number = ''.join(filter(str.isdigit, str(data['card_number'])))

    if len(card_number) < 12 or len(str(data['cvv'])) not in [3, 4]:
        return fail('Invalid card details')

    payment = Payment(
        parent_id=user.id,
        camper_id=camper.id,
        session_id=data.get('session_id'),
        amount=data['amount'],
        status='Pending',
        card_last4=card_number[-4:]
    )

    db.session.add(payment)
    db.session.commit()

    send_email(
        user.email,
        'Payment Submitted',
        f'Payment of ${payment.amount} was submitted successfully.'
    )

    return ok(payment.to_dict(), 'Payment submitted', 201)


# ================= LIST PAYMENTS =================
@parent_bp.get('/payments')
@role_required('parent')
def list_payments():
    user = current_user()

    payments = Payment.query.filter_by(parent_id=user.id) \
        .order_by(Payment.payment_date.desc()) \
        .all()

    return ok([p.to_dict() for p in payments])


# ================= ANNOUNCEMENTS =================
@parent_bp.get('/announcements')
@role_required('parent')
def announcements():
    return ok([
        {
            'id': 1,
            'title': 'Welcome to CampMondo',
            'body': 'Announcements will appear here.'
        }
    ])