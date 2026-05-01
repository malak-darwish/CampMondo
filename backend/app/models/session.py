from app import db

class Session(db.Model):
    __tablename__ = 'sessions'

    id             = db.Column(db.Integer, primary_key=True)
    name           = db.Column(db.String(150), nullable=False)
    start_date     = db.Column(db.Date, nullable=False)
    end_date       = db.Column(db.Date, nullable=False)
    max_capacity   = db.Column(db.Integer, nullable=False)
    enrollment_fee = db.Column(db.Numeric(10,2), nullable=False, default=0.00)
    created_by     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at     = db.Column(db.DateTime, server_default=db.func.now())
    updated_at     = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    groups            = db.relationship('Group', backref='session', lazy=True)
    activity_programs = db.relationship('ActivityProgram', backref='session', lazy=True)