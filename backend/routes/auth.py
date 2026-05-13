from datetime import datetime, timedelta
from hashlib import sha256
from secrets import token_urlsafe

from flask import Blueprint, current_app, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required
from app import db
from app.models.user import User
from app.utils.auth_helpers import (
    hash_password, check_password, is_strong_password,
    current_user, account_is_locked, lock_account
)
from app.utils.email import (
    send_password_reset_email,
    send_account_locked_email,
    send_parent_registration_email,
)



auth_bp = Blueprint('auth', __name__)


def fail(message, status=400):
    return jsonify({'success': False, 'message': message}), status


def ok(data=None, message='Success', status=200):
    return jsonify({'success': True, 'data': data, 'message': message}), status

def _hash_reset_token(raw: str) -> str:
    """Reset tokens are stored hashed so a DB leak doesn't expose live tokens."""
    return sha256(raw.encode('utf-8')).hexdigest()


# ───────────────────────────────────────────────────────────
#  REGISTRATION (parents only — staff/admin are created by admin)
# ───────────────────────────────────────────────────────────

@auth_bp.post('/register-parent')
def register_parent():
    data = request.get_json() or {}
    required = ['full_name', 'email', 'password']
    if any(not data.get(field) for field in required):
        return fail('Full name, email, and password are required')

    if not is_strong_password(data['password']):
        return fail('Password must be at least 8 characters and include uppercase, lowercase, and a digit')


    if User.query.filter_by(email=data['email'].lower()).first():
        return fail('Email is already registered', 409)

    user = User(
        full_name     = data['full_name'],
        email         = data['email'].lower(),
        password_hash = hash_password(data['password']),
        role          = 'parent',
        phone_number  = data.get('phone_number')

    )
    db.session.add(user)
    db.session.commit()
    send_parent_registration_email(user)
    return ok(user.to_dict(), 'Parent account created', 201)

# ───────────────────────────────────────────────────────────
#  LOGIN
# ───────────────────────────────────────────────────────────

@auth_bp.post('/login')
def login():
    data     = request.get_json() or {}
    email    = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return fail('Email and password are required')

    user = User.query.filter_by(email=email).first()

    # Use generic message to avoid email enumeration
    if not user:
        return fail('Invalid email or password', 401)

    # FR 4.9: deactivated accounts must NOT be able to log in.
    # Distinguish from temp-lockout so the frontend can show a clear message.
    if not user.is_active:
        return fail('This account has been deactivated. Please contact an administrator.', 403)

    # Temporary lockout from failed attempts
    if account_is_locked(user):
        db.session.commit()  # account_is_locked may have auto-unlocked on expiry
        return fail('Account is temporarily locked. Please try again in a few minutes.', 423)

    if not check_password(password, user.password_hash):
        user.failed_attempts += 1
        locked_now = False
        if user.failed_attempts >= 5:
            lock_account(user)
            locked_now = True
        db.session.commit()
        if locked_now:
            try:
                send_account_locked_email(user)
            except Exception as exc:
                current_app.logger.error(f'Failed to send lockout email: {exc}')
        return fail('Invalid email or password', 401)

    # Successful login — reset counters
    user.failed_attempts = 0
    user.locked_until    = None
    db.session.commit()

    token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role}
    )

    # FR 4.8: surface must_change_password so frontend can hard-block until it's done.
    return ok(
        {
            'token': token,
            'user': user.to_dict(),
            'must_change_password': bool(user.must_change_password),
        },
        'Login successful'
    )


# ───────────────────────────────────────────────────────────
#  CURRENT USER
# ───────────────────────────────────────────────────────────

@auth_bp.get('/me')
@jwt_required()
def me():
    user = current_user()
    if not user:
        return fail('User not found', 404)
    # If the account was deactivated mid-session, refuse further work.
    if not user.is_active:
        return fail('This account has been deactivated.', 403)
    return ok(user.to_dict())


# ───────────────────────────────────────────────────────────
#  PROFILE UPDATE (no password change here anymore)
# ───────────────────────────────────────────────────────────

@auth_bp.put('/profile')
@jwt_required()
def update_profile():
    user = current_user()
 
    if not user:
        return fail('User not found', 404)
    if not user.is_active:
        return fail('This account has been deactivated.', 403)

    data = request.get_json() or {}

    if data.get('full_name'):
        user.full_name = data['full_name'].strip()
    if data.get('phone_number') is not None:
        user.phone_number = data['phone_number'] or None


    db.session.commit()
    return ok(user.to_dict(), 'Profile updated')

# ───────────────────────────────────────────────────────────
#  CHANGE PASSWORD (logged-in user)
#  Used both for forced first-login change and normal change.
#  Requires current password UNLESS must_change_password is True.
# ───────────────────────────────────────────────────────────

@auth_bp.post('/change-password')
@jwt_required()
def change_password():
    user = current_user()
    if not user:
        return fail('User not found', 404)
    if not user.is_active:
        return fail('This account has been deactivated.', 403)

    data             = request.get_json() or {}
    current_pw       = data.get('current_password') or ''
    new_pw           = data.get('new_password') or ''

    if not new_pw:
        return fail('New password is required')
    if not is_strong_password(new_pw):
        return fail('Password must be at least 8 characters and include uppercase, lowercase, and a digit')

    # On forced first-login change, the temp password from staff creation is enough proof
    # (it's how they just logged in). For normal changes, require current password.
    if not user.must_change_password:
        if not current_pw:
            return fail('Current password is required')
        if not check_password(current_pw, user.password_hash):
            return fail('Current password is incorrect', 401)

    # Don't let users "change" to the same password
    if check_password(new_pw, user.password_hash):
        return fail('New password must be different from the current password')

    user.password_hash        = hash_password(new_pw)
    user.must_change_password = False
    db.session.commit()

    return ok(user.to_dict(), 'Password changed successfully')


# ───────────────────────────────────────────────────────────
#  FORGOT PASSWORD
# ───────────────────────────────────────────────────────────

@auth_bp.post('/forgot-password')
def forgot_password():
    data  = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    user  = User.query.filter_by(email=email).first() if email else None

    # Only issue tokens for active accounts. Always return the same response
    # to avoid leaking which emails exist.
    if user and user.is_active:
        raw_token                   = token_urlsafe(32)
        user.password_reset_token   = _hash_reset_token(raw_token)
        user.password_reset_expires = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()
        try:
            send_password_reset_email(user, raw_token)
        except Exception as exc:
            current_app.logger.error(f'Failed to send password reset email: {exc}')

    return ok(None, 'If an account exists for that email, a reset link has been sent.')


# ───────────────────────────────────────────────────────────
#  RESET PASSWORD
# ───────────────────────────────────────────────────────────

@auth_bp.post('/reset-password')
def reset_password():
    data         = request.get_json() or {}
    raw_token    = (data.get('token') or '').strip()
    new_password = data.get('password') or ''

    if not raw_token:
        return fail('Reset token is required')
    if not is_strong_password(new_password):
        return fail('Password must be at least 8 characters and include uppercase, lowercase, and a digit')

    hashed = _hash_reset_token(raw_token)
    user   = User.query.filter_by(password_reset_token=hashed).first()

    if (not user
            or not user.password_reset_expires
            or user.password_reset_expires < datetime.utcnow()):
        return fail('Invalid or expired reset token', 400)

    if not user.is_active:
        return fail('This account has been deactivated.', 403)

    user.password_hash          = hash_password(new_password)
    user.password_reset_token   = None
    user.password_reset_expires = None
    user.must_change_password   = False
    user.failed_attempts        = 0
    user.locked_until           = None
    db.session.commit()

    return ok(None, 'Password reset successful. You can now log in.')


# ───────────────────────────────────────────────────────────
#  LOGOUT (stateless — client deletes token)
# ───────────────────────────────────────────────────────────
@auth_bp.post('/logout')
@jwt_required()
def logout():

    return ok(None, 'Logout successful')