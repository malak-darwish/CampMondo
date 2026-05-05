from datetime import datetime

from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required

from app import db
from app.models.audit_log import AuditLog
from app.models.camper import Camper
from app.models.enrollment import Enrollment
from app.models.payment import Payment
from app.models.session import Session
from app.utils.auth_helpers import current_user, role_required
from app.utils.pdf_export import build_financial_report_pdf


admin_bp = Blueprint("admin", __name__)


def fail(message, status=400):
    return jsonify({"success": False, "message": message}), status


def ok(data=None, message="Success", status=200):
    return jsonify({"success": True, "data": data, "message": message}), status


def payment_query_from_filters():
    query = Payment.query.join(Enrollment, Payment.enrollment_id == Enrollment.id).join(Camper, Enrollment.camper_id == Camper.id).join(Session, Enrollment.session_id == Session.id)

    session_id = request.args.get("session_id")
    status = request.args.get("status")
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")

    if session_id:
        query = query.filter(Enrollment.session_id == int(session_id))
    if status:
        query = query.filter(Payment.status == status.lower())
    if date_from:
        query = query.filter(Payment.submitted_at >= datetime.strptime(date_from, "%Y-%m-%d"))
    if date_to:
        query = query.filter(Payment.submitted_at <= datetime.strptime(date_to, "%Y-%m-%d"))

    return query


@admin_bp.get("/payments")
@role_required("admin")
def list_payments():
    payments = payment_query_from_filters().order_by(Payment.submitted_at.desc()).all()
    return ok([payment.to_dict() for payment in payments], "Payments retrieved successfully")


@admin_bp.put("/payments/<int:payment_id>/status")
@role_required("admin")
def update_payment_status(payment_id):
    user = current_user()
    data = request.get_json() or {}
    status = (data.get("status") or "").lower()
    note = data.get("admin_note") or data.get("justification_note")

    if status not in {"confirmed", "failed"}:
        return fail("Status must be confirmed or failed")
    if not note:
        return fail("Justification note is required")

    payment = Payment.query.get(payment_id)
    if not payment:
        return fail("Payment not found", 404)

    payment.status = status
    payment.admin_note = note
    payment.override_by = user.id
    payment.confirmed_at = datetime.utcnow() if status == "confirmed" else None

    db.session.add(AuditLog(
        user_id=user.id,
        action="PAYMENT_STATUS_CHANGE",
        target_table="payments",
        target_id=payment.id,
        details=f"Payment marked as {status}. Note: {note}",
    ))
    db.session.commit()
    return ok(payment.to_dict(), "Payment status updated")


def build_financial_report_data():
    payments = payment_query_from_filters().all()
    total_collected = sum(float(payment.amount) for payment in payments if payment.status == "confirmed")
    total_due = sum(float(payment.amount) for payment in payments)
    total_outstanding = sum(float(payment.amount) for payment in payments if payment.status == "pending")

    return {
        "total_collected": total_collected,
        "total_due": total_due,
        "total_outstanding": total_outstanding,
        "payments": [payment.to_dict() for payment in payments],
    }


@admin_bp.get("/reports/financial")
@role_required("admin")
def financial_report():
    return ok(build_financial_report_data(), "Financial report generated successfully")


@admin_bp.get("/reports/financial/pdf")
@role_required("admin")
def financial_report_pdf():
    report_data = build_financial_report_data()
    pdf_buffer = build_financial_report_pdf(report_data)
    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name="campmondo_financial_report.pdf",
    )
