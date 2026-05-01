from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from datetime import timedelta


db   = SQLAlchemy()
jwt  = JWTManager()
mail = Mail()


def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config')

    app.config.setdefault('SECRET_KEY',                'dev-secret-change-me')
    app.config.setdefault('JWT_SECRET_KEY',            'jwt-dev-secret-change-me')
    app.config.setdefault('JWT_ACCESS_TOKEN_EXPIRES',  timedelta(minutes=30))
    app.config.setdefault('SQLALCHEMY_TRACK_MODIFICATIONS', False)

    CORS(app, resources={r'/api/*': {'origins': '*'}})
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    from app.routes.auth   import auth_bp
    from app.routes.parent import parent_bp
    from app.routes.admin  import admin_bp
    from app.routes.staff  import staff_bp

    app.register_blueprint(auth_bp,   url_prefix='/api/auth')
    app.register_blueprint(parent_bp, url_prefix='/api/parent')
    app.register_blueprint(admin_bp,  url_prefix='/api/admin')
    app.register_blueprint(staff_bp,  url_prefix='/api/staff')

    @app.get('/api/health')
    def health():
        return {'success': True, 'message': 'CampMondo API is running'}

    return app