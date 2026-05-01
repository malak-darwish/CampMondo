from datetime import datetime, timedelta
from secrets import token_urlsafe
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required
from app import db
from app.models.user import User
from app.utils.auth_helpers import (
    hash_password, check_password, is_strong_password,
    current_user, account_is_locked, lock_account
)
from app.utils.email import send_email


auth_bp = Blueprint('auth', __name__)


def fail(message, status=400):
    return jsonify({'success': False, 'message': message}), status


def ok(data=None, message='Success', status=200):
    return jsonify({'success': True, 'data': data, 'message': message}), status


@auth_bp.post('/register-parent')
def register_parent():
    data = request.get_json() or {}
    required = ['full_name', 'email', 'password']
    if any(not data.get(field) for field in required):
        return fail('Full name, email, and password are required')

    if not is_strong_password(data['password']):
        return fail('Password must be at least 8 characters and include uppercase, lowercase, and digit')

    if User.query.filter_by(email=data['email'].lower()).first():
        return fail('Email is already registered', 409)

    user = User(
        full_name=data['full_name'],
        email=data['email'].lower(),
        password_hash=hash_password(data['password']),
        role='parent',
        phone=data.get('phone')
    )
    db.session.add(user)
    db.session.commit()
    return ok(user.to_dict(), 'Parent account created', 201)


@auth_bp.post('/login')
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').lower()
    password = data.get('password') or ''
    user = User.query.filter_by(email=email).first()

    if not user:
        return fail('Invalid email or password', 401)

    if account_is_locked(user):
        db.session.commit()
        return fail('Account is locked. Please try again later.', 423)

    if not check_password(password, user.password_hash):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= 5:
            lock_account(user)
            send_email(user.email, 'CampMondo account locked', 'Your account was locked for 15 minutes after 5 failed login attempts.')
        db.session.commit()
        return fail('Invalid email or password', 401)

    user.failed_login_attempts = 0
    user.locked_until = None
    user.account_status = 'active'
    db.session.commit()

    token = create_access_token(identity=str(user.id), additional_claims={'role': user.role})
    return ok({'token': token, 'user': user.to_dict()}, 'Login successful')


@auth_bp.get('/me')
@jwt_required()
def me():
    user = current_user()
    if not user:
        return fail('User not found', 404)
    return ok(user.to_dict())


@auth_bp.put('/profile')
@jwt_required()
def update_profile():
    user = current_user()
    data = request.get_json() or {}
    if data.get('full_name'):
        user.full_name = data['full_name']
    if data.get('phone'):
        user.phone = data['phone']
    if data.get('password'):
        if not is_strong_password(data['password']):
            return fail('Password must be at least 8 characters and include uppercase, lowercase, and digit')
        user.password_hash = hash_password(data['password'])
    db.session.commit()
    return ok(user.to_dict(), 'Profile updated')


@auth_bp.post('/forgot-password')
def forgot_password():
    data = request.get_json() or {}
    user = User.query.filter_by(email=(data.get('email') or '').lower()).first()
    if user:
        raw_token = token_urlsafe(32)
        user.reset_token = raw_token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()
        send_email(user.email, 'CampMondo password reset', f'Use this reset token within 1 hour: {raw_token}')
    return ok(None, 'If the email exists, a reset link has been sent')


@auth_bp.post('/reset-password')
def reset_password():
    data = request.get_json() or {}
    token = data.get('token')
    new_password = data.get('password')
    if not is_strong_password(new_password):
        return fail('Password must be at least 8 characters and include uppercase, lowercase, and digit')
    user = User.query.filter_by(reset_token=token).first()
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        return fail('Invalid or expired reset token', 400)
    user.password_hash = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.session.commit()
    return ok(None, 'Password reset successful')


@auth_bp.post('/logout')
@jwt_required()
def logout():
    # Stateless JWT logout is handled client-side by deleting token.
    return ok(None, 'Logout successful')
