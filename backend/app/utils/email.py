from flask_mail import Message
from app import mail


def send_email(to, subject, body):
    """Send email if mail settings are configured. In dev, print instead of crashing."""
    try:
        msg = Message(subject=subject, recipients=[to], body=body)
        mail.send(msg)
        return True
    except Exception as exc:
        print(f'[DEV EMAIL FALLBACK] To: {to}\nSubject: {subject}\n{body}\nError: {exc}')
        return False