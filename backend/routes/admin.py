from flask import Blueprint, jsonify, request
from app import db
from app.models.session import Session
from app.models.group import Group

admin_bp = Blueprint('admin', __name__)

# ── GET ALL SESSIONS ────────────────────────────────────────
@admin_bp.route('/sessions', methods=['GET'])
def get_sessions():
    sessions = Session.query.all()
    return jsonify({
        "success": True,
        "data": [
            {
                "id":             s.id,
                "name":           s.name,
                "start_date":     str(s.start_date),
                "end_date":       str(s.end_date),
                "max_capacity":   s.max_capacity,
                "enrollment_fee": float(s.enrollment_fee)
            }
            for s in sessions
        ]
    }), 200

# ── CREATE SESSION ──────────────────────────────────────────
@admin_bp.route('/sessions', methods=['POST'])
def create_session():
    data = request.get_json()
    
    # FR 4.6: prevent overlapping session dates
    overlap = Session.query.filter(
        Session.start_date <= data['end_date'],
        Session.end_date   >= data['start_date']
    ).first()
    if overlap:
        return jsonify({"success": False, "message": "A session already exists in this date range"}), 400

    new_session = Session(
        name           = data['name'],
        start_date     = data['start_date'],
        end_date       = data['end_date'],
        max_capacity   = data['max_capacity'],
        enrollment_fee = data['enrollment_fee'],
        created_by     = 1  # hardcoded admin id until Person 1 finishes auth
    )
    db.session.add(new_session)
    db.session.commit()
    return jsonify({"success": True, "message": "Session created"}), 201

# ── EDIT SESSION ────────────────────────────────────────────
@admin_bp.route('/sessions/<int:session_id>', methods=['PUT'])
def edit_session(session_id):
    # FR 4.2: only edit if no campers enrolled
    from app.models.enrollment import Enrollment
    enrolled = Enrollment.query.filter_by(session_id=session_id, status='active').first()
    if enrolled:
        return jsonify({"success": False, "message": "Cannot edit a session with enrolled campers"}), 400

    session = Session.query.get_or_404(session_id)
    data    = request.get_json()

    session.name           = data.get('name',           session.name)
    session.start_date     = data.get('start_date',     session.start_date)
    session.end_date       = data.get('end_date',       session.end_date)
    session.max_capacity   = data.get('max_capacity',   session.max_capacity)
    session.enrollment_fee = data.get('enrollment_fee', session.enrollment_fee)

    db.session.commit()
    return jsonify({"success": True, "message": "Session updated"}), 200

# ── DELETE SESSION ──────────────────────────────────────────
@admin_bp.route('/sessions/<int:session_id>', methods=['DELETE'])
def delete_session(session_id):
    # FR 4.2: only delete if no campers enrolled
    from app.models.enrollment import Enrollment
    enrolled = Enrollment.query.filter_by(session_id=session_id, status='active').first()
    if enrolled:
        return jsonify({"success": False, "message": "Cannot delete a session with enrolled campers"}), 400

    session = Session.query.get_or_404(session_id)
    db.session.delete(session)
    db.session.commit()
    return jsonify({"success": True, "message": "Session deleted"}), 200

# ── GET ALL GROUPS IN A SESSION ─────────────────────────────
@admin_bp.route('/sessions/<int:session_id>/groups', methods=['GET'])
def get_groups(session_id):
    groups = Group.query.filter_by(session_id=session_id).all()
    return jsonify({
        "success": True,
        "data": [
            {
                "id":         g.id,
                "name":       g.name,
                "staff_id":   g.staff_id,
                "session_id": g.session_id
            }
            for g in groups
        ]
    }), 200

# ── CREATE GROUP ────────────────────────────────────────────
@admin_bp.route('/sessions/<int:session_id>/groups', methods=['POST'])
def create_group(session_id):
    data      = request.get_json()
    new_group = Group(
        session_id = session_id,
        name       = data['name'],
        staff_id   = data.get('staff_id', None)
    )
    db.session.add(new_group)
    db.session.commit()
    return jsonify({"success": True, "message": "Group created"}), 201

# ── ASSIGN STAFF TO GROUP ───────────────────────────────────
@admin_bp.route('/groups/<int:group_id>/assign-staff', methods=['PUT'])
def assign_staff(group_id):
    # FR 4.5: one staff per group per session
    data     = request.get_json()
    staff_id = data.get('staff_id')
    group    = Group.query.get_or_404(group_id)

    already_assigned = Group.query.filter_by(
        session_id = group.session_id,
        staff_id   = staff_id
    ).first()
    if already_assigned and already_assigned.id != group_id:
        return jsonify({"success": False, "message": "Staff already assigned to another group in this session"}), 400

    group.staff_id = staff_id
    db.session.commit()
    return jsonify({"success": True, "message": "Staff assigned to group"}), 200

# ── ASSIGN CAMPER TO GROUP ──────────────────────────────────
@admin_bp.route('/groups/<int:group_id>/assign-camper', methods=['PUT'])
def assign_camper(group_id):
    # FR 4.3 + 4.4
    from app.models.enrollment import Enrollment
    data       = request.get_json()
    camper_id  = data.get('camper_id')
    session_id = Group.query.get_or_404(group_id).session_id

    enrollment = Enrollment.query.filter_by(
        camper_id  = camper_id,
        session_id = session_id,
        status     = 'active'
    ).first()
    if not enrollment:
        return jsonify({"success": False, "message": "Camper not enrolled in this session"}), 400

    enrollment.group_id = group_id
    db.session.commit()
    return jsonify({"success": True, "message": "Camper assigned to group"}), 200

# ── GET ALL STAFF ACCOUNTS ──────────────────────────────────
@admin_bp.route('/staff', methods=['GET'])
def get_staff():
    from app.models.user import User
    staff_list = User.query.filter_by(role='staff').all()
    return jsonify({
        "success": True,
        "data": [
            {
                "id":        s.id,
                "full_name": s.full_name,
                "email":     s.email,
                "is_active": s.is_active
            }
            for s in staff_list
        ]
    }), 200

# ── CREATE STAFF ACCOUNT ────────────────────────────────────
@admin_bp.route('/staff', methods=['POST'])
def create_staff():
    from app.models.user import User
    from app.utils.email import send_staff_temp_password
    import bcrypt, secrets

    data         = request.get_json()
    temp_password = secrets.token_urlsafe(8)  # random 8 char password
    hashed        = bcrypt.hashpw(temp_password.encode(), bcrypt.gensalt()).decode()

    new_staff = User(
        full_name            = data['full_name'],
        email                = data['email'],
        password_hash        = hashed,
        role                 = 'staff',
        phone_number         = data.get('phone_number'),
        must_change_password = True
    )
    db.session.add(new_staff)
    db.session.commit()

    send_staff_temp_password(new_staff.email, new_staff.full_name, temp_password)

    return jsonify({"success": True, "message": "Staff account created"}), 201

# ── DEACTIVATE STAFF ACCOUNT ────────────────────────────────
@admin_bp.route('/staff/<int:staff_id>/deactivate', methods=['PUT'])
def deactivate_staff(staff_id):
    from app.models.user import User
    staff = User.query.get_or_404(staff_id)
    staff.is_active = False
    db.session.commit()
    return jsonify({"success": True, "message": "Staff account deactivated"}), 200