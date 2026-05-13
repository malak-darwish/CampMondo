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