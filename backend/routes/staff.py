from flask import Blueprint, request, jsonify
from datetime import datetime

from app import db
from app.models.attendance import AttendanceLog
from app.models.activity_log import ActivityLog
from app.models.camper import Camper
from app.models.incident import IncidentReport
from app.models.group import Group
from app.models.session import Session



staff_bp = Blueprint('staff', __name__)

# ✅ GET ALL CAMPERS
@staff_bp.route('/campers', methods=['GET'])
def get_campers():

    campers = Camper.query.all()

    result = []

    for camper in campers:

       result.append({
         "id": camper.id,
         "full_name": camper.full_name,
         "medical_alerts": camper.medical_alerts
        })

    return jsonify({
        "success": True,
        "data": result
    }) 

# ✅ GET ALL GROUPS
@staff_bp.route('/groups', methods=['GET'])
def get_groups():

    groups = Group.query.all()

    result = []

    for g in groups:

        result.append({
            "id": g.id,
            "name": g.name
        })

    return jsonify({
        "success": True,
        "data": result
    })

# ✅ CHECK IN
@staff_bp.route('/checkin', methods=['POST'])
def check_in():

    data = request.get_json()

    camper_id = data.get('camper_id')
    group_id = data.get('group_id')

    existing = AttendanceLog.query.filter_by(
        camper_id=camper_id,
        checked_out_at=None
    ).first()

    if existing:

        return jsonify({
            "success": False,
            "message": "Camper already checked in"
        }), 400
    session = Session.query.first()

    if not session:

     return jsonify({
        "success": False,
        "message": "No session found"
    }), 400

    attendance = AttendanceLog(

        camper_id=camper_id,

        group_id=group_id,

        session_id=session.id,

        log_date=datetime.today().date(),

        checked_in_at=datetime.now(),

        checked_out_at=None,

        status='present',

        recorded_by=1
    )

    db.session.add(attendance)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Checked in successfully"
    })

# ✅ CHECK OUT

@staff_bp.route('/checkout', methods=['POST'])
def check_out():

    data = request.get_json()

    camper_id = data.get('camper_id')

    attendance = AttendanceLog.query.filter_by(
        camper_id=camper_id,
        checked_out_at=None
    ).first()

    if not attendance:

        return jsonify({
            "success": False,
            "message": "No active attendance found"
        }), 404

    attendance.checked_out_at = datetime.now()

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Checked out successfully"
    })



# ✅ GET ALL ATTENDANCE

@staff_bp.route('/attendance', methods=['GET'])
def get_attendance():

    records = AttendanceLog.query.all()

    result = []

    for r in records:

        camper = Camper.query.get(r.camper_id)

        result.append({

            "camper_id": r.camper_id,

            "camper_name": (
                camper.full_name
                if camper else "Unknown"
            ),

           "group_name": (
                r.group.name
                if r.group else "Unknown"
),

            "date": str(r.log_date),

            "check_in_time": (
                str(r.checked_in_at)
                if r.checked_in_at else None
            ),

            "check_out_time": (
                str(r.checked_out_at)
                if r.checked_out_at else None
            ),

            "status": r.status
        })

    return jsonify({
        "success": True,
        "data": result
    })


# ✅ CURRENTLY INSIDE CAMP
@staff_bp.route('/currently-inside', methods=['GET'])
def currently_inside():

    records = AttendanceLog.query.filter_by(
        checked_out_at=None
    ).all()

    result = []

    for r in records:

        camper = Camper.query.get(r.camper_id)

        result.append({

            "camper_id": r.camper_id,

            "camper_name": (
                camper.full_name
                if camper else "Unknown"
            ),

           "group_name": (
                 r.group.name
                if r.group else "Unknown"
),

            "check_in_time": (
                str(r.checked_in_at)
                if r.checked_in_at else None
            )
        })

    return jsonify({
        "success": True,
        "data": result
    })



# ✅ GET INCIDENT REPORTS
@staff_bp.route('/incidents', methods=['GET'])
def get_incidents():

    incidents = IncidentReport.query.order_by(
        IncidentReport.created_at.desc()
    ).all()

    result = []

    for incident in incidents:

        camper = Camper.query.get(
            incident.camper_id
        )

        result.append({

            "id": incident.id,

            "camper_name": (
                camper.full_name
                if camper else "Unknown"
            ),

            "description": incident.description,

            "incident_date": str(
                incident.incident_date
            ),

            "incident_time": str(
                incident.incident_time
            ),

            "created_at": str(
                incident.created_at
            )
        })

    return jsonify({
        "success": True,
        "data": result
    })



# ✅ CREATE INCIDENT REPORT
@staff_bp.route('/incidents', methods=['POST'])
def create_incident():

    data = request.get_json()

    camper_id = data.get("camper_id")
    description = data.get("description")

    if not camper_id or not description:

        return jsonify({
            "success": False,
            "message": "Missing fields"
        }), 400
    session = Session.query.first()

    if not session:

     return jsonify({
        "success": False,
        "message": "No session found"
    }), 400

    incident = IncidentReport(

        camper_id=camper_id,

        reported_by=1,

        session_id=session.id,

        incident_date=datetime.today().date(),

        incident_time=datetime.now().time(),

        description=description,

        action_taken=None
    )

    db.session.add(incident)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Incident report submitted"
    })

# ✅ DELETE INCIDENT
@staff_bp.route('/incidents/<int:id>', methods=['DELETE'])
def delete_incident(id):

    incident = IncidentReport.query.get(id)

    if not incident:

        return jsonify({
            "success": False,
            "message": "Incident not found"
        }), 404

    db.session.delete(incident)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Incident deleted successfully"
    })

# ✅ UPDATE INCIDENT
@staff_bp.route('/incidents/<int:id>', methods=['PUT'])
def update_incident(id):

    incident = IncidentReport.query.get(id)

    if not incident:

        return jsonify({
            "success": False,
            "message": "Incident not found"
        }), 404

    data = request.get_json()

    incident.description = data.get(
        "description",
        incident.description
    )

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Incident updated successfully"
    })



# ✅ GET ACTIVITY LOGS
@staff_bp.route('/activity-log', methods=['GET'])
def get_activity_logs():

    logs = ActivityLog.query.order_by(
        ActivityLog.created_at.desc()
    ).all()

    result = []

    for log in logs:

        result.append({

            "id": log.id,

            "activity_name": log.activity_name,

            "description": log.description,

            "duration_minutes": log.duration_minutes,

            "log_date": str(log.log_date),

            "created_at": str(log.created_at)
        })

    return jsonify({
        "success": True,
        "data": result
    })

# ✅ CREATE ACTIVITY LOG
@staff_bp.route('/activity-log', methods=['POST'])
def create_activity_log():

    data = request.get_json()

    description = data.get("description")

    if not description:

        return jsonify({
            "success": False,
            "message": "Description required"
        }), 400

    group = Group.query.first()

    if not group:

     return jsonify({
        "success": False,
        "message": "No groups found"
    }), 400
    new_log = ActivityLog(

        group_id=group.id,
       
        logged_by=1,

        activity_name="Camp Activity",

        log_date=datetime.today().date(),

        duration_minutes=60,

        description=description
    )

    db.session.add(new_log)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Activity added successfully"
    })

# ✅ DELETE ACTIVITY LOG
@staff_bp.route('/activity-log/<int:id>', methods=['DELETE'])
def delete_activity_log(id):

    log = ActivityLog.query.get(id)

    if not log:

        return jsonify({
            "success": False,
            "message": "Activity not found"
        }), 404

    db.session.delete(log)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Activity deleted successfully"
    })

# ✅ UPDATE ACTIVITY LOG
@staff_bp.route('/activity-log/<int:id>', methods=['PUT'])
def update_activity_log(id):

    log = ActivityLog.query.get(id)

    if not log:

        return jsonify({
            "success": False,
            "message": "Activity not found"
        }), 404

    data = request.get_json()

    log.description = data.get(
        "description",
        log.description
    )

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Activity updated successfully"
    })

# ✅ DASHBOARD STATS
@staff_bp.route('/dashboard-stats', methods=['GET'])
def dashboard_stats():

    total_campers = Camper.query.count()

    present_today = AttendanceLog.query.filter_by(
        checked_out_at=None
    ).count()

    total_incidents = IncidentReport.query.count()

    total_activities = ActivityLog.query.count()

    return jsonify({

        "success": True,

        "data": {

            "total_campers": total_campers,

            "present_today": present_today,

            "total_incidents": total_incidents,

            "total_activities": total_activities
        }
    })

# ✅ RECENT SYSTEM ACTIVITY
@staff_bp.route('/recent-activity', methods=['GET'])
def recent_activity():

    activities = ActivityLog.query.order_by(
        ActivityLog.created_at.desc()
    ).limit(5).all()

    incidents = IncidentReport.query.order_by(
        IncidentReport.created_at.desc()
    ).limit(5).all()

    attendance = AttendanceLog.query.order_by(
        AttendanceLog.id.desc()
    ).limit(5).all()

    feed = []

    # Activities
    for a in activities:

        feed.append({
            "type": "activity",
            "message": f"Activity added: {a.activity_name}",
            "time": str(a.created_at)
        })

# Incidents
    for i in incidents:

     camper = Camper.query.get(i.camper_id)

    camper_name = (
        camper.full_name
        if camper else "Unknown Camper"
    )

    feed.append({
        "type": "incident",
        "message": f"Incident reported for {camper_name}",
        "time": str(i.created_at)
    })
# Attendance
    for att in attendance:

     camper = Camper.query.get(att.camper_id)

     camper_name = (
        camper.full_name
        if camper else "Unknown Camper"
    )

    feed.append({
        "type": "attendance",
        "message": f"{camper_name} checked in",
        "time": str(att.checked_in_at)
    })

    # Sort newest first
    feed.sort(
        key=lambda x: x["time"],
        reverse=True
    )

    return jsonify({
        "success": True,
        "data": feed[:10]
    })