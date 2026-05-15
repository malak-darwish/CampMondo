"""
Email utility for CampMondo.

In production: sends real emails via Flask-Mail (Gmail SMTP).
In dev (no MAIL_SERVER configured, or if SMTP fails):
    logs the email to the console so the demo doesn't crash.
"""

import logging
from html import escape
from typing import Optional

from flask import current_app
from flask_mail import Message
from app import mail


logger = logging.getLogger(__name__)


# ───────────────────────────────────────────────────────────
#  CORE SENDER
# ───────────────────────────────────────────────────────────

def send_email(to: str, subject: str, body: str, html: Optional[str] = None) -> bool:
    """
    Send an email. Returns True on success, False on failure.
    Failures are logged but never raised, so callers can fail soft.
    """
    if not to:
        logger.warning('send_email called with empty recipient')
        return False

    try:
        server = current_app.config.get('MAIL_SERVER')
    except Exception as exc:
        logger.error(f'send_email could not read config: {exc}')
        return False

    if not server:
        # Dev fallback — pretend we sent it.
        print('=' * 60)
        print('[DEV EMAIL — not sent, MAIL_SERVER not configured]')
        print(f'To: {to}')
        print(f'Subject: {subject}')
        print('-' * 60)
        print(body)
        print('=' * 60)
        return False

    try:
        msg = Message(subject=subject, recipients=[to], body=body, html=html)
        mail.send(msg)
        logger.info(f'Email sent to {to}: {subject}')
        print(f'[EMAIL SENT] To: {to} | Subject: {subject}')
        return True
    except Exception as exc:
        logger.error(f'[EMAIL FAILED] To: {to} | Subject: {subject} | Error: {exc}')
        print(f'[EMAIL FAILED] To: {to} | Subject: {subject} | Error: {exc}')
        return False

# ───────────────────────────────────────────────────────────
#  HTML WRAPPER (consistent CampMondo branding)
#  Plain string formatting — no Jinja involved.
# ───────────────────────────────────────────────────────────

_HTML_BEFORE = """<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f5f0e8;font-family:Arial,sans-serif;color:#2c1810;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff9f0;border-radius:8px;overflow:hidden;border:1px solid #e0d5c0;">
        <tr><td style="background:#2c4a2e;padding:24px 32px;">
          <h1 style="margin:0;color:#fff9f0;font-family:Georgia,serif;font-size:24px;">
            Camp<span style="color:#e8a838;">Mondo</span>
          </h1>
        </td></tr>
        <tr><td style="padding:32px;font-size:15px;line-height:1.6;">
"""

_HTML_AFTER = """
        </td></tr>
        <tr><td style="background:#f5f0e8;padding:16px 32px;font-size:12px;color:#8a7a65;border-top:1px solid #e0d5c0;">
          This is an automated message from CampMondo. Please do not reply.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
"""


def _wrap_html(inner_html: str) -> str:
    return _HTML_BEFORE + inner_html + _HTML_AFTER


def _frontend_url(path: str = '') -> str:
    base = current_app.config.get('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    return f'{base}/{path.lstrip("/")}' if path else base


# ───────────────────────────────────────────────────────────
#  TEMPLATED EMAILS
#  Each wrapped in try/except so the caller never crashes.
# ───────────────────────────────────────────────────────────
def send_incident_notification(parent_email, parent_name, camper_name,
                                incident_date, description, session_name) -> bool:
    """Sent to a parent when staff files an incident report for their child."""
    try:
        subject = f"Incident Report – {camper_name} at CampMondo"
        body = (
            f'Hi {parent_name},\n\n'
            f'An incident involving your child {camper_name} was recorded on '
            f'{incident_date} during the {session_name} session.\n\n'
            f'Details: {description}\n\n'
            f'Please contact us if you have any questions.\n\n'
            f'— The CampMondo Team'
        )

        safe_parent   = escape(parent_name or 'Parent')
        safe_camper   = escape(camper_name or 'your child')
        safe_date     = escape(str(incident_date))
        safe_session  = escape(session_name or 'your session')
        safe_desc     = escape(description or '')

        html_inner = (
            f'<h2 style="margin:0 0 12px;color:#2c1810;font-family:Georgia,serif;">'
            f'Incident Report for {safe_camper}</h2>'
            f'<p>Hi {safe_parent},</p>'
            f'<p>We want to inform you that an incident involving your child '
            f'<strong>{safe_camper}</strong> was recorded on '
            f'<strong>{safe_date}</strong> during the '
            f'<strong>{safe_session}</strong> session.</p>'
            f'<div style="background:#f5f0e8;border-left:4px solid #e8a838;'
            f'padding:16px;margin:20px 0;border-radius:4px;">'
            f'<p style="margin:0;"><strong>Details:</strong></p>'
            f'<p style="margin:8px 0 0;">{safe_desc}</p>'
            f'</div>'
            f'<p>A staff member has been notified. Please contact us if you have any questions.</p>'
            f'<p style="margin-top:24px;">— The CampMondo Team</p>'
        )

        return send_email(parent_email, subject, body, html=_wrap_html(html_inner))
    except Exception as exc:
        logger.error(f'send_incident_notification crashed: {exc}')
        print(f'[EMAIL HELPER CRASHED] send_incident_notification: {exc}')
        return False

def send_staff_welcome_email(user, temp_password: str) -> bool:
    """Sent when an admin creates a new staff account (FR 4.8)."""
    try:
        subject = 'Your CampMondo Staff Account'
        body = (
            f'Hi {user.full_name},\n\n'
            f'Your CampMondo staff account has been created.\n\n'
            f'Login email: {user.email}\n'
            f'Temporary password: {temp_password}\n\n'
            f'For security, you will be required to choose a new password the first '
            f'time you log in.\n\n'
            f'— The CampMondo Team'
        )

        safe_name = escape(user.full_name or 'Staff Member')
        safe_email = escape(user.email or '')
        safe_password = escape(temp_password or '')

        html_inner = (
            f'<p>Hi {safe_name},</p>'
            f'<p>Your CampMondo staff account has been created.</p>'
            f'<table cellpadding="8" cellspacing="0" style="background:#f5f0e8;border-radius:6px;margin:16px 0;width:100%;">'
            f'<tr><td><strong>Login email:</strong></td><td>{safe_email}</td></tr>'
            f'<tr><td><strong>Temporary password:</strong></td>'
            f'<td><code style="background:#fff9f0;padding:4px 8px;border-radius:4px;'
            f'border:1px solid #e0d5c0;font-size:14px;">{safe_password}</code></td></tr>'
            f'</table>'
            f'<p>For security, you will be required to choose a new password the first time you log in.</p>'
            f'<p style="margin-top:24px;">— The CampMondo Team</p>'
        )

        return send_email(user.email, subject, body, html=_wrap_html(html_inner))
    except Exception as exc:
        logger.error(f'send_staff_welcome_email crashed: {exc}')
        print(f'[EMAIL HELPER CRASHED] send_staff_welcome_email: {exc}')
        return False


def send_parent_registration_email(user) -> bool:
    """Sent when a parent creates a CampMondo account."""
    try:
        login_link = _frontend_url('/login')

        subject = 'Welcome to CampMondo'
        body = (
            f'Hi {user.full_name},\n\n'
            f'Your CampMondo parent account has been created successfully.\n\n'
            f'Login email: {user.email}\n'
            f'Login here: {login_link}\n\n'
            f'— The CampMondo Team'
        )

        safe_name = escape(user.full_name or 'Parent')
        safe_email = escape(user.email or '')
        safe_login_link = escape(login_link, quote=True)

        html_inner = (
            f'<h2 style="margin:0 0 12px;color:#2c1810;font-family:Georgia,serif;">Welcome to CampMondo</h2>'
            f'<p>Hi {safe_name},</p>'
            f'<p>Your CampMondo parent account has been created successfully. '
            f'You can now manage camper profiles, enrollments, and payments.</p>'
            f'<table cellpadding="8" cellspacing="0" style="background:#f5f0e8;border-radius:6px;margin:16px 0;width:100%;">'
            f'<tr><td><strong>Login email:</strong></td><td>{safe_email}</td></tr>'
            f'</table>'
            f'<p style="margin:24px 0;">'
            f'<a href="{safe_login_link}" '
            f'style="background:#3d6b45;color:#fff9f0;padding:12px 24px;'
            f'text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">'
            f'Login to CampMondo</a></p>'
            f'<p style="margin-top:24px;">— The CampMondo Team</p>'
        )

        return send_email(user.email, subject, body, html=_wrap_html(html_inner))
    except Exception as exc:
        logger.error(f'send_parent_registration_email crashed: {exc}')
        print(f'[EMAIL HELPER CRASHED] send_parent_registration_email: {exc}')
        return False

def send_camper_registration_email(parent_email, parent_name, camper_name,
                                    date_of_birth, gender, medical_alerts=None) -> bool:
    """Sent to a parent when they create a new camper profile."""
    try:
        subject = f'Camper Profile Created – {camper_name}'
        body = (
            f'Hi {parent_name},\n\n'
            f'The camper profile for {camper_name} has been created successfully.\n\n'
            f'Date of Birth: {date_of_birth}\n'
            f'Gender: {gender.title()}\n\n'
            f'You can now enroll {camper_name} in an upcoming session.\n\n'
            f'— The CampMondo Team'
        )

        safe_parent  = escape(parent_name or 'Parent')
        safe_camper  = escape(camper_name or '')
        safe_dob     = escape(str(date_of_birth))
        safe_gender  = escape(gender.title() if gender else '')
        safe_alerts  = escape(medical_alerts or 'None')

        html_inner = (
            f'<h2 style="margin:0 0 12px;color:#2c1810;font-family:Georgia,serif;">'
            f'Camper Profile Created!</h2>'
            f'<p>Hi {safe_parent},</p>'
            f'<p>The camper profile for <strong>{safe_camper}</strong> has been created successfully.</p>'
            f'<table cellpadding="10" cellspacing="0" style="background:#f5f0e8;'
            f'border-radius:8px;margin:20px 0;width:100%;">'
            f'<tr><td><strong>Full Name:</strong></td><td>{safe_camper}</td></tr>'
            f'<tr><td><strong>Date of Birth:</strong></td><td>{safe_dob}</td></tr>'
            f'<tr><td><strong>Gender:</strong></td><td>{safe_gender}</td></tr>'
            f'<tr><td><strong>Medical Alerts:</strong></td>'
            f'<td style="color:{"#c62828" if medical_alerts else "#3d6b45"};font-weight:600;">'
            f'{safe_alerts}</td></tr>'
            f'</table>'
            f'<p>You can now enroll <strong>{safe_camper}</strong> in an upcoming session.</p>'
            f'<p style="margin-top:24px;">— The CampMondo Team</p>'
        )

        return send_email(parent_email, subject, body, html=_wrap_html(html_inner))
    except Exception as exc:
        logger.error(f'send_camper_registration_email crashed: {exc}')
        print(f'[EMAIL HELPER CRASHED] send_camper_registration_email: {exc}')
        return False
def send_payment_submitted_email(user, payment, enrollment=None) -> bool:
    """Sent when a parent submits a payment."""
    try:
        payments_link = _frontend_url('/parent/payments')

        amount = f'{float(payment.amount):.2f}'
        status = payment.status or 'pending'

        camper_name = 'N/A'
        session_name = 'N/A'

        if enrollment:
            camper = getattr(enrollment, 'camper', None)
            session = getattr(enrollment, 'session', None)

            if camper and getattr(camper, 'full_name', None):
                camper_name = camper.full_name

            if session and getattr(session, 'name', None):
                session_name = session.name

        subject = 'CampMondo Payment Submitted'
        body = (
            f'Hi {user.full_name},\n\n'
            f'Your payment of ${amount} was submitted successfully and is pending confirmation.\n\n'
            f'Camper: {camper_name}\n'
            f'Session: {session_name}\n'
            f'Status: {status}\n\n'
            f'View payments: {payments_link}\n\n'
            f'— The CampMondo Team'
        )

        safe_name = escape(user.full_name or 'Parent')
        safe_camper = escape(camper_name)
        safe_session = escape(session_name)
        safe_status = escape(status.title())
        safe_payments_link = escape(payments_link, quote=True)

        html_inner = (
            f'<h2 style="margin:0 0 12px;color:#2c1810;font-family:Georgia,serif;">Payment Submitted</h2>'
            f'<p>Hi {safe_name},</p>'
            f'<p>Your payment was submitted successfully and is now pending confirmation.</p>'
            f'<table cellpadding="8" cellspacing="0" style="background:#f5f0e8;border-radius:6px;margin:16px 0;width:100%;">'
            f'<tr><td><strong>Amount:</strong></td><td>${amount}</td></tr>'
            f'<tr><td><strong>Status:</strong></td><td>{safe_status}</td></tr>'
            f'<tr><td><strong>Camper:</strong></td><td>{safe_camper}</td></tr>'
            f'<tr><td><strong>Session:</strong></td><td>{safe_session}</td></tr>'
            f'</table>'
            f'<p style="margin:24px 0;">'
            f'<a href="{safe_payments_link}" '
            f'style="background:#3d6b45;color:#fff9f0;padding:12px 24px;'
            f'text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">'
            f'View Payments</a></p>'
            f'<p style="font-size:13px;color:#8a7a65;">'
            f'Your payment will remain pending until reviewed by CampMondo administration.</p>'
            f'<p style="margin-top:24px;">— The CampMondo Team</p>'
        )

        return send_email(user.email, subject, body, html=_wrap_html(html_inner))
    except Exception as exc:
        logger.error(f'send_payment_submitted_email crashed: {exc}')
        print(f'[EMAIL HELPER CRASHED] send_payment_submitted_email: {exc}')
        return False

def send_enrollment_confirmation(parent_email, parent_name, camper_name,
                                  session_name, session_start, session_end,
                                  enrollment_fee) -> bool:
    """Sent to a parent when their camper is successfully enrolled in a session."""
    try:
        subject = f'Enrollment Confirmed – {camper_name} at CampMondo'
        body = (
            f'Hi {parent_name},\n\n'
            f'{camper_name} has been successfully enrolled in {session_name}.\n\n'
            f'Session dates: {session_start} – {session_end}\n'
            f'Enrollment fee: ${enrollment_fee:.2f}\n\n'
            f'— The CampMondo Team'
        )

        safe_parent  = escape(parent_name)
        safe_camper  = escape(camper_name)
        safe_session = escape(session_name)
        safe_start   = escape(session_start)
        safe_end     = escape(session_end)

        html_inner = (
            f'<h2 style="margin:0 0 12px;color:#2c1810;font-family:Georgia,serif;">'
            f'Enrollment Confirmed!</h2>'
            f'<p>Hi {safe_parent},</p>'
            f'<p><strong>{safe_camper}</strong> has been successfully enrolled in '
            f'<strong>{safe_session}</strong>.</p>'
            f'<table cellpadding="10" cellspacing="0" style="background:#f5f0e8;'
            f'border-radius:8px;margin:20px 0;width:100%;">'
            f'<tr><td><strong>Session:</strong></td><td>{safe_session}</td></tr>'
            f'<tr><td><strong>Start Date:</strong></td><td>{safe_start}</td></tr>'
            f'<tr><td><strong>End Date:</strong></td><td>{safe_end}</td></tr>'
            f'<tr><td><strong>Enrollment Fee:</strong></td>'
            f'<td style="color:#3d6b45;font-weight:600;">${enrollment_fee:.2f}</td></tr>'
            f'</table>'
            f'<p>We look forward to seeing {safe_camper} at camp!</p>'
            f'<p style="margin-top:24px;">— The CampMondo Team</p>'
        )

        return send_email(parent_email, subject, body, html=_wrap_html(html_inner))
    except Exception as exc:
        logger.error(f'send_enrollment_confirmation crashed: {exc}')
        print(f'[EMAIL HELPER CRASHED] send_enrollment_confirmation: {exc}')
        return False

def send_password_reset_email(user, raw_token: str) -> bool:
    """Sent when a user requests a password reset."""
    try:
        reset_link = _frontend_url(f'/reset-password?token={raw_token}')

        subject = 'CampMondo Password Reset'
        body = (
            f'Hi {user.full_name},\n\n'
            f'We received a request to reset your CampMondo password. '
            f'Use the link below within the next hour:\n\n'
            f'{reset_link}\n\n'
            f'If you did not request this, you can ignore this email.\n\n'
            f'— The CampMondo Team'
        )

        safe_name = escape(user.full_name or 'CampMondo User')
        safe_reset_link = escape(reset_link, quote=True)

        html_inner = (
            f'<p>Hi {safe_name},</p>'
            f'<p>We received a request to reset your CampMondo password. '
            f'This link expires in <strong>1 hour</strong>.</p>'
            f'<p style="margin:24px 0;">'
            f'<a href="{safe_reset_link}" '
            f'style="background:#3d6b45;color:#fff9f0;padding:12px 24px;'
            f'text-decoration:none;border-radius:6px;display:inline-block;">'
            f'Reset Password</a></p>'
            f'<p style="font-size:13px;color:#8a7a65;">'
            f'Or copy this link: <br><code style="word-break:break-all;">{safe_reset_link}</code></p>'
            f'<p>If you did not request this, you can safely ignore this email.</p>'
            f'<p style="margin-top:24px;">— The CampMondo Team</p>'
        )

        return send_email(user.email, subject, body, html=_wrap_html(html_inner))
    except Exception as exc:
        logger.error(f'send_password_reset_email crashed: {exc}')
        print(f'[EMAIL HELPER CRASHED] send_password_reset_email: {exc}')
        return False


def send_account_locked_email(user) -> bool:
    """Sent when an account hits 5 failed attempts."""
    try:
        subject = 'CampMondo Account Temporarily Locked'
        body = (
            f'Hi {user.full_name},\n\n'
            f'Your CampMondo account was temporarily locked after 5 failed login attempts. '
            f'It will automatically unlock in 15 minutes.\n\n'
            f'If this was not you, we recommend resetting your password.\n\n'
            f'— The CampMondo Team'
        )
        safe_name = escape(user.full_name or 'CampMondo User')
        html_inner = (
            f'<p>Hi {safe_name},</p>'
            f'<p>Your CampMondo account was <strong>temporarily locked</strong> after 5 failed '
            f'login attempts. It will automatically unlock in <strong>15 minutes</strong>.</p>'
            f'<p>If this was not you, we recommend resetting your password.</p>'
            f'<p style="margin-top:24px;">— The CampMondo Team</p>'
        )
        return send_email(user.email, subject, body, html=_wrap_html(html_inner))
    except Exception as exc:
        logger.error(f'send_account_locked_email crashed: {exc}')
        print(f'[EMAIL HELPER CRASHED] send_account_locked_email: {exc}')
        return False
    
def send_announcement_notification(parent_email, parent_name,
                                    title, body_text, target_label) -> bool:
    """Sent to parents when admin posts an announcement targeting them."""
    try:
        subject = f'CampMondo Announcement: {title}'
        body = (
            f'Hi {parent_name},\n\n'
            f'{title}\n\n'
            f'{body_text}\n\n'
            f'— The CampMondo Team'
        )

        safe_parent  = escape(parent_name or 'Parent')
        safe_title   = escape(title or '')
        safe_body    = escape(body_text or '')
        safe_label   = escape(target_label or 'CampMondo')

        html_inner = (
            f'<p style="color:#8a7a65;font-size:13px;margin:0 0 8px;">Announcement · {safe_label}</p>'
            f'<h2 style="margin:0 0 16px;color:#2c1810;font-family:Georgia,serif;">{safe_title}</h2>'
            f'<p>Hi {safe_parent},</p>'
            f'<div style="background:#f5f0e8;padding:20px;border-radius:6px;margin:16px 0;">'
            f'<p style="margin:0;white-space:pre-line;">{safe_body}</p>'
            f'</div>'
            f'<p style="margin-top:24px;">— The CampMondo Team</p>'
        )

        return send_email(parent_email, subject, body, html=_wrap_html(html_inner))
    except Exception as exc:
        logger.error(f'send_announcement_notification crashed: {exc}')
        print(f'[EMAIL HELPER CRASHED] send_announcement_notification: {exc}')
        return False

    

    