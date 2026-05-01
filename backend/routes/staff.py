from flask import Blueprint, request, jsonify
from datetime import datetime
from app import db
from app.models.attendance import Attendance

staff_bp = Blueprint('staff', __name__)

# ✅ CHECK IN
@staff_bp.route('/checkin', methods=['POST'])
def check_in():
    data = request.get_json()

    camper_id = data.get('camper_id')
    group_id = data.get('group_id')

    existing = Attendance.query.filter_by(
        camper_id=camper_id,
        date=datetime.today().date()
    ).first()

    if existing:
        return jsonify({"success": False, "message": "Already checked in"}), 400

    attendance = Attendance(
        camper_id=camper_id,
        group_id=group_id,
        check_in_time=datetime.now(),
        date=datetime.today().date()
    )

    db.session.add(attendance)
    db.session.commit()

    return jsonify({"success": True, "message": "Checked in successfully"})


# ✅ CHECK OUT
@staff_bp.route('/checkout', methods=['POST'])
def check_out():
    data = request.get_json()

    camper_id = data.get('camper_id')

    attendance = Attendance.query.filter_by(
        camper_id=camper_id,
        date=datetime.today().date()
    ).first()

    if not attendance:
        return jsonify({"success": False, "message": "No check-in found"}), 404

    if attendance.check_out_time:
        return jsonify({"success": False, "message": "Already checked out"}), 400

    attendance.check_out_time = datetime.now()
    db.session.commit()

    return jsonify({"success": True, "message": "Checked out successfully"})


# ✅ GET ALL ATTENDANCE
@staff_bp.route('/attendance', methods=['GET'])
def get_attendance():
    records = Attendance.query.all()

    result = []
    for r in records:
        result.append({
            "camper_id": r.camper_id,
            "group_id": r.group_id,
            "date": str(r.date),
            "check_in_time": str(r.check_in_time),
            "check_out_time": str(r.check_out_time) if r.check_out_time else None
        })

    return jsonify({"success": True, "data": result})


# 🔥 NEW: CURRENTLY INSIDE CAMP
@staff_bp.route('/currently-inside', methods=['GET'])
def currently_inside():
    records = Attendance.query.filter_by(check_out_time=None).all()

    result = []
    for r in records:
        result.append({
            "camper_id": r.camper_id,
            "group_id": r.group_id,
            "date": str(r.date),
            "check_in_time": str(r.check_in_time)
        })

    return jsonify({"success": True, "data": result})