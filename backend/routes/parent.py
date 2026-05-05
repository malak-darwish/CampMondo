from datetime import datetime, timedelta
from pathlib import Path
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

from app import db
from app.models.activity_program import ActivityProgram
from app.models.announcement import Announcement
from app.models.camper import Camper
from app.models.document import Document
from app.models.emergency_contact import EmergencyContact
from app.models.enrollment import Enrollment
from app.models.enrollment_activity import EnrollmentActivity
from app.models.payment import Payment
from app.models.session import Session
from app.utils.auth_helpers import current_user, role_required
from app.utils.email import send_email


parent_bp = Blueprint("parent", __name__)
ALLOWED_DOCUMENT_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}
ALLOWED_MIME_PREFIXES = ("image/",)
ALLOWED_MIME_TYPES = {"application/pdf"}


def fail(message, status=400):
    return jsonify({"success": False, "message": message}), status


def ok(data=None, message="Success", status=200):
    return jsonify({"success": True, "data": data, "message": message}), status


def parse_date(value, field_name):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be YYYY-MM-DD")


def parent_owns_enrollment(user_id, enrollment_id):
    return (
        Enrollment.query
        .join(Camper, Enrollment.camper_id == Camper.id)
        .filter(Enrollment.id == enrollment_id, Camper.parent_id == user_id)
        .first()
    )


@parent_bp.get("/dashboard")
@role_required("parent")
def dashboard():
    user = current_user()
    campers = Camper.query.filter_by(parent_id=user.id).all()
    enrollments = (
        Enrollment.query
        .join(Camper, Enrollment.camper_id == Camper.id)
        .filter(Camper.parent_id == user.id)
        .all()
    )
    payments = (
        Payment.query
        .join(Enrollment, Payment.enrollment_id == Enrollment.id)
        .join(Camper, Enrollment.camper_id == Camper.id)
        .filter(Camper.parent_id == user.id)
        .all()
    )
    return ok({
        "parent": user.to_dict(),
        "campers_count": len(campers),
        "enrollments_count": len(enrollments),
        "payments_count": len(payments),
        "campers": [camper.to_dict() for camper in campers],
    })


@parent_bp.post("/campers")
@role_required("parent")
def create_camper():
    user = current_user()
    data = request.get_json() or {}
    required = ["full_name", "date_of_birth", "gender", "emergency_contact_name", "emergency_contact_phone"]
    if any(not data.get(field) for field in required):
        return fail("Missing required camper information")

    try:
        dob = parse_date(data["date_of_birth"], "date_of_birth")
    except ValueError as exc:
        return fail(str(exc))

    gender = data["gender"].lower()
    if gender not in {"male", "female", "other"}:
        return fail("Gender must be male, female, or other")

    camper = Camper(
        parent_id=user.id,
        full_name=data["full_name"].strip(),
        date_of_birth=dob,
        gender=gender,
        medical_alerts=data.get("medical_alerts"),
    )
    db.session.add(camper)
    db.session.flush()

    contact = EmergencyContact(
        camper_id=camper.id,
        contact_name=data["emergency_contact_name"].strip(),
        phone_number=data["emergency_contact_phone"].strip(),
    )
    db.session.add(contact)
    db.session.commit()

    send_email(user.email, "Camper profile created", f"Camper profile for {camper.full_name} was created successfully.")
    return ok(camper.to_dict(), "Camper profile created", 201)


@parent_bp.get("/campers")
@role_required("parent")
def list_campers():
    user = current_user()
    campers = Camper.query.filter_by(parent_id=user.id).all()
    return ok([camper.to_dict() for camper in campers], "Campers retrieved successfully")


@parent_bp.put("/campers/<int:camper_id>")
@role_required("parent")
def update_camper(camper_id):
    user = current_user()
    camper = Camper.query.filter_by(id=camper_id, parent_id=user.id).first()
    if not camper:
        return fail("Camper not found", 404)

    data = request.get_json() or {}
    if data.get("full_name"):
        camper.full_name = data["full_name"].strip()
    if data.get("gender"):
        gender = data["gender"].lower()
        if gender not in {"male", "female", "other"}:
            return fail("Gender must be male, female, or other")
        camper.gender = gender
    if "medical_alerts" in data:
        camper.medical_alerts = data["medical_alerts"]
    if data.get("date_of_birth"):
        try:
            camper.date_of_birth = parse_date(data["date_of_birth"], "date_of_birth")
        except ValueError as exc:
            return fail(str(exc))

    if data.get("emergency_contact_name") or data.get("emergency_contact_phone"):
        contact = camper.emergency_contacts[0] if camper.emergency_contacts else EmergencyContact(camper_id=camper.id)
        if data.get("emergency_contact_name"):
            contact.contact_name = data["emergency_contact_name"].strip()
        if data.get("emergency_contact_phone"):
            contact.phone_number = data["emergency_contact_phone"].strip()
        db.session.add(contact)

    db.session.commit()
    return ok(camper.to_dict(), "Camper profile updated")


@parent_bp.delete("/campers/<int:camper_id>")
@role_required("parent")
def delete_camper(camper_id):
    user = current_user()
    camper = Camper.query.filter_by(id=camper_id, parent_id=user.id).first()
    if not camper:
        return fail("Camper not found", 404)
    db.session.delete(camper)
    db.session.commit()
    return ok(None, "Camper profile removed")


@parent_bp.get("/sessions")
@role_required("parent")
def get_sessions():
    sessions = Session.query.order_by(Session.start_date.asc()).all()
    return ok([session.to_dict() for session in sessions], "Sessions retrieved successfully")


@parent_bp.post("/enrollments")
@role_required("parent")
def create_enrollment():
    user = current_user()
    data = request.get_json() or {}
    camper_id = data.get("camper_id")
    session_id = data.get("session_id")
    activity_ids = data.get("activity_ids", []) or []

    if not camper_id or not session_id:
        return fail("Camper and session are required")

    camper = Camper.query.filter_by(id=camper_id, parent_id=user.id).first()
    if not camper:
        return fail("Camper not found", 404)

    session = Session.query.get(session_id)
    if not session:
        return fail("Session not found", 404)

    active_count = Enrollment.query.filter_by(session_id=session.id, status="active").count()
    if active_count >= session.max_capacity:
        return fail("Session is full", 400)

    existing = Enrollment.query.filter_by(camper_id=camper.id, session_id=session.id).first()
    if existing and existing.status == "active":
        return fail("Camper is already enrolled in this session", 400)

    overlapping = (
        Enrollment.query
        .join(Session, Enrollment.session_id == Session.id)
        .filter(
            Enrollment.camper_id == camper.id,
            Enrollment.status == "active",
            Session.start_date <= session.end_date,
            Session.end_date >= session.start_date,
        )
        .first()
    )
    if overlapping:
        return fail("Camper is already enrolled in an overlapping session", 400)

    enrollment = Enrollment(camper_id=camper.id, session_id=session.id, status="active")
    db.session.add(enrollment)
    db.session.flush()

    for activity_id in activity_ids:
        activity = ActivityProgram.query.filter_by(id=activity_id, session_id=session.id).first()
        if not activity:
            db.session.rollback()
            return fail("Invalid activity selected", 400)
        db.session.add(EnrollmentActivity(enrollment_id=enrollment.id, activity_id=activity.id))

    db.session.commit()
    send_email(user.email, "Camper enrolled", f"{camper.full_name} was enrolled in {session.name}.")
    return ok(enrollment.to_dict(), "Camper enrolled successfully", 201)


@parent_bp.get("/enrollments")
@role_required("parent")
def get_enrollments():
    user = current_user()
    enrollments = (
        Enrollment.query
        .join(Camper, Enrollment.camper_id == Camper.id)
        .filter(Camper.parent_id == user.id)
        .order_by(Enrollment.enrolled_at.desc())
        .all()
    )
    return ok([enrollment.to_dict() for enrollment in enrollments], "Enrollments retrieved successfully")


@parent_bp.delete("/enrollments/<int:enrollment_id>")
@role_required("parent")
def cancel_enrollment(enrollment_id):
    user = current_user()
    enrollment = parent_owns_enrollment(user.id, enrollment_id)
    if not enrollment:
        return fail("Enrollment not found", 404)
    if enrollment.status == "cancelled":
        return fail("Enrollment is already cancelled", 400)
    if enrollment.session.start_date - datetime.utcnow().date() < timedelta(days=7):
        return fail("Registration can only be cancelled at least 7 days before the session start date", 400)

    enrollment.status = "cancelled"
    enrollment.cancelled_at = datetime.utcnow()
    db.session.commit()
    return ok(enrollment.to_dict(), "Enrollment cancelled successfully")


@parent_bp.post("/enrollments/<int:enrollment_id>/documents")
@role_required("parent")
def upload_document(enrollment_id):
    user = current_user()
    enrollment = parent_owns_enrollment(user.id, enrollment_id)
    if not enrollment:
        return fail("Enrollment not found", 404)

    document_type = request.form.get("document_type")
    if document_type not in {"medical_form", "consent_form"}:
        return fail("document_type must be medical_form or consent_form")

    uploaded_file = request.files.get("file")
    if not uploaded_file or not uploaded_file.filename:
        return fail("File is required")

    extension = uploaded_file.filename.rsplit(".", 1)[-1].lower() if "." in uploaded_file.filename else ""
    if extension not in ALLOWED_DOCUMENT_EXTENSIONS:
        return fail("Only PDF or image files are allowed")

    uploaded_file.seek(0, 2)
    file_size = uploaded_file.tell()
    uploaded_file.seek(0)
    if file_size > 5 * 1024 * 1024:
        return fail("File size must not exceed 5 MB")

    mime_type = uploaded_file.mimetype or ""
    if mime_type not in ALLOWED_MIME_TYPES and not mime_type.startswith(ALLOWED_MIME_PREFIXES):
        return fail("Only PDF or image files are allowed")

    upload_root = Path(current_app.config["UPLOAD_FOLDER"])
    upload_root.mkdir(parents=True, exist_ok=True)
    safe_name = secure_filename(uploaded_file.filename)
    stored_name = f"enrollment_{enrollment.id}_{document_type}_{uuid4().hex}_{safe_name}"
    file_path = upload_root / stored_name
    uploaded_file.save(file_path)

    existing = Document.query.filter_by(enrollment_id=enrollment.id, document_type=document_type).first()
    if existing:
        existing.file_path = str(file_path)
        existing.original_name = uploaded_file.filename
        existing.mime_type = mime_type
        existing.file_size = file_size
        document = existing
    else:
        document = Document(
            enrollment_id=enrollment.id,
            document_type=document_type,
            file_path=str(file_path),
            original_name=uploaded_file.filename,
            mime_type=mime_type,
            file_size=file_size,
        )
        db.session.add(document)

    db.session.commit()
    return ok(document.to_dict(), "Document uploaded successfully", 201)


@parent_bp.post("/payments")
@role_required("parent")
def submit_payment():
    user = current_user()
    data = request.get_json() or {}
    enrollment_id = data.get("enrollment_id")

    # Temporary compatibility: current old frontend may send camper_id/session_id instead.
    if not enrollment_id and data.get("camper_id"):
        query = Enrollment.query.join(Camper, Enrollment.camper_id == Camper.id).filter(
            Camper.parent_id == user.id,
            Enrollment.camper_id == data.get("camper_id"),
            Enrollment.status == "active",
        )
        if data.get("session_id"):
            query = query.filter(Enrollment.session_id == data.get("session_id"))
        enrollment = query.first()
    else:
        enrollment = parent_owns_enrollment(user.id, enrollment_id)

    if not enrollment:
        return fail("Enrollment not found. Create an enrollment before payment.", 404)

    card_number = "".join(ch for ch in str(data.get("card_number", "")) if ch.isdigit())
    cvv = str(data.get("cvv", ""))
    if len(card_number) < 12 or len(cvv) not in [3, 4]:
        return fail("Payment could not be processed. Please verify your card details and try again.")

    amount = data.get("amount") or enrollment.calculate_total_fee()
    payment = Payment(
        enrollment_id=enrollment.id,
        amount=amount,
        status="pending",
        card_last4=card_number[-4:],
    )
    db.session.add(payment)
    db.session.commit()

    send_email(user.email, "CampMondo payment submitted", f"Payment of ${float(payment.amount):.2f} was submitted and is pending confirmation.")
    return ok(payment.to_dict(), "Payment submitted", 201)


@parent_bp.get("/payments")
@role_required("parent")
def list_payments():
    user = current_user()
    payments = (
        Payment.query
        .join(Enrollment, Payment.enrollment_id == Enrollment.id)
        .join(Camper, Enrollment.camper_id == Camper.id)
        .filter(Camper.parent_id == user.id)
        .order_by(Payment.submitted_at.desc())
        .all()
    )
    return ok([payment.to_dict() for payment in payments], "Payments retrieved successfully")


@parent_bp.get("/announcements")
@role_required("parent")
def announcements():
    user = current_user()
    enrollments = (
        Enrollment.query
        .join(Camper, Enrollment.camper_id == Camper.id)
        .filter(Camper.parent_id == user.id, Enrollment.status == "active")
        .all()
    )
    session_ids = {enrollment.session_id for enrollment in enrollments}
    group_ids = {enrollment.group_id for enrollment in enrollments if enrollment.group_id}

    results = Announcement.query.filter(Announcement.target_type == "system_wide").all()
    if session_ids:
        results += Announcement.query.filter(Announcement.target_type == "session", Announcement.target_id.in_(session_ids)).all()
    if group_ids:
        results += Announcement.query.filter(Announcement.target_type == "group", Announcement.target_id.in_(group_ids)).all()

    unique = {announcement.id: announcement for announcement in results}.values()
    sorted_announcements = sorted(unique, key=lambda item: item.published_at, reverse=True)
    return ok([announcement.to_dict() for announcement in sorted_announcements], "Announcements retrieved successfully")
