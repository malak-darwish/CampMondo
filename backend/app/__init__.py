from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from datetime import timedelta

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()

def create_app():
    app = Flask(__name__)

    # CONFIG
    app.config.from_object('app.config')

    app.config.setdefault('SECRET_KEY', 'dev-secret-change-me')
    app.config.setdefault('JWT_SECRET_KEY', 'jwt-dev-secret-change-me')
    app.config.setdefault('JWT_ACCESS_TOKEN_EXPIRES', timedelta(minutes=30))
    app.config.setdefault('SQLALCHEMY_TRACK_MODIFICATIONS', False)

    # ✅ CORS FIX (FINAL)
    CORS(
        app,
        resources={r"/api/*": {"origins": "http://localhost:5173"}},
        supports_credentials=True
    )

    @app.after_request
    def add_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
        return response

    # INIT EXTENSIONS
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    # ✅ VERY IMPORTANT FIX (LOAD MODELS FIRST)
    from app.models import camper

    # ROUTES
    from routes.auth import auth_bp
    from routes.parent import parent_bp
    from routes.staff import staff_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(parent_bp, url_prefix='/api/parent')
    app.register_blueprint(staff_bp, url_prefix='/api/staff')

    # HEALTH
    @app.get('/api/health')
    def health():
        return {
            'success': True,
            'message': 'CampMondo API is running'
        }

    return app