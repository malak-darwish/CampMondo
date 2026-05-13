import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

def _bool(name: str, default: bool = False) -> bool:
    """Parse a boolean env var (accepts true/1/yes)."""
    val = os.getenv(name)
    if val is None:
        return default
    return val.strip().lower() in {'1', 'true', 'yes', 'on'}


# ───── Core ─────
SECRET_KEY     = os.getenv('SECRET_KEY', 'dev-secret-change-me')
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-dev-secret-change-me')
JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.getenv('JWT_EXPIRES_MINUTES', 30)))

# Frontend URL — used for building reset-password links in emails
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')


# ───── Database ─────
# Allow either a full DATABASE_URL or individual DB_* parts.
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    DB_USER     = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'root123')
    DB_PORT     = os.getenv('DB_PORT', '3307')
    DB_HOST     = os.getenv('DB_HOST', 'localhost')
    DB_NAME     = os.getenv('DB_NAME', 'campmondo')
    DATABASE_URL = (
        f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    )

SQLALCHEMY_DATABASE_URI        = DATABASE_URL
SQLALCHEMY_TRACK_MODIFICATIONS = False


# ───── Mail (Gmail SMTP) ─────
MAIL_SERVER         = os.getenv('MAIL_SERVER')                  # e.g. smtp.gmail.com
MAIL_PORT           = int(os.getenv('MAIL_PORT', 587))
MAIL_USE_TLS        = _bool('MAIL_USE_TLS', True)
MAIL_USE_SSL        = _bool('MAIL_USE_SSL', False)
MAIL_USERNAME       = os.getenv('MAIL_USERNAME')
MAIL_PASSWORD       = os.getenv('MAIL_PASSWORD')                # Gmail App Password (not regular password)
MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER') or MAIL_USERNAME
MAIL_SUPPRESS_SEND  = _bool('MAIL_SUPPRESS_SEND', False)         # True for tests

