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
    from app.models.user import User  
    from app.models.camper import Camper  
    from app.models.session import Session  
    from app.models.group import Group  
    from app.models.enrollment import Enrollment  
    ## from app.models.document import Document  
    from app.models.payment import Payment  
    from app.models.announcement import Announcement  
    from app.models.audit_log import AuditLog  
    from app.models.attendance import AttendanceLog  
    from app.models.incident import IncidentReport  
    from app.models.activity_log import ActivityLog  


    from routes.auth import auth_bp
    from routes.parent import parent_bp
    from routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(parent_bp, url_prefix="/api/parent")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.get("/api/health")
    def health():
        return {"success": True, "message": "CampMondo API is running"}

<<<<<<< HEAD
    return app
=======
    return app
>>>>>>> origin/malak
