from datetime import timedelta
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()


def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config")

    app.config.setdefault("SECRET_KEY", "dev-secret-change-me")
    app.config.setdefault("JWT_SECRET_KEY", "jwt-dev-secret-change-me")
    app.config.setdefault("JWT_ACCESS_TOKEN_EXPIRES", timedelta(minutes=30))
    app.config.setdefault("SQLALCHEMY_TRACK_MODIFICATIONS", False)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    # Import models so SQLAlchemy knows the tables/relationships.
    from app.models.user import User  # noqa: F401
    from app.models.camper import Camper  # noqa: F401
    from app.models.emergency_contact import EmergencyContact  # noqa: F401
    from app.models.session import Session  # noqa: F401
    from app.models.activity_program import ActivityProgram  # noqa: F401
    from app.models.group import Group  # noqa: F401
    from app.models.enrollment import Enrollment  # noqa: F401
    from app.models.enrollment_activity import EnrollmentActivity  # noqa: F401
    from app.models.document import Document  # noqa: F401
    from app.models.payment import Payment  # noqa: F401
    from app.models.announcement import Announcement  # noqa: F401
    from app.models.audit_log import AuditLog  # noqa: F401

    from routes.auth import auth_bp
    from routes.parent import parent_bp
    from routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(parent_bp, url_prefix="/api/parent")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.get("/api/health")
    def health():
        return {"success": True, "message": "CampMondo API is running"}

    return app
