import re
from functools import wraps
from datetime import datetime, timedelta
import bcrypt
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt, get_jwt_identity
from app.models.user import User


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def check_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def is_strong_password(password: str) -> bool:
    return bool(password and len(password) >= 8
                and re.search(r'[A-Z]', password)
                and re.search(r'[a-z]', password)
                and re.search(r'\d', password))


def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get('role') not in roles:
                return jsonify({'success': False, 'message': 'Unauthorized access'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def current_user():
    user_id = get_jwt_identity()
    return User.query.get(user_id)


def account_is_locked(user: User) -> bool:
    if user.account_status == 'deactivated':
        return True
    if user.locked_until and user.locked_until > datetime.utcnow():
        return True
    if user.account_status == 'locked' and user.locked_until and user.locked_until <= datetime.utcnow():
        user.account_status = 'active'
        user.failed_login_attempts = 0
        user.locked_until = None
    return False


def lock_account(user: User):
    user.account_status = 'locked'
    user.locked_until = datetime.utcnow() + timedelta(minutes=15)
