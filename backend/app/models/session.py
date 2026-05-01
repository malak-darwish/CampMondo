from app import db


class Session(db.Model):
    __tablename__ = 'sessions'

    id             = db.Column(db.Integer, primary_key=True)
    name           = db.Column(db.String(150), nullable=False)
    start_date     = db.Column(db.Date, nullable=False)
    end_date       = db.Column(db.Date, nullable=False)
    max_capacity   = db.Column(db.Integer, nullable=False)
    enrollment_fee = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    created_by     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at     = db.Column(db.DateTime, server_default=db.func.now())
    updated_at     = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    groups             = db.relationship('Group', backref='session', lazy=True)
    activity_programs  = db.relationship('ActivityProgram', backref='session', lazy=True)

    def to_dict(self):
        return {
            'id':             self.id,
            'name':           self.name,
            'start_date':     str(self.start_date),
            'end_date':       str(self.end_date),
            'max_capacity':   self.max_capacity,
            'enrollment_fee': float(self.enrollment_fee),
            'created_by':     self.created_by,
        }


class ActivityProgram(db.Model):
    __tablename__ = 'activity_programs'

    id         = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    name       = db.Column(db.String(100), nullable=False)
    fee        = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)

    def to_dict(self):
        return {
            'id':         self.id,
            'session_id': self.session_id,
            'name':       self.name,
            'fee':        float(self.fee),
        }