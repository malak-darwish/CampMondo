from app import db


class Group(db.Model):
    __tablename__ = 'groups'

    id         = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    name       = db.Column(db.String(100), nullable=False)
    staff_id   = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    attendance_logs = db.relationship('AttendanceLog', backref='group', lazy=True)
    activity_logs   = db.relationship('ActivityLog',   backref='group', lazy=True)

    def to_dict(self):
        return {
            'id':         self.id,
            'session_id': self.session_id,
            'name':       self.name,
            'staff_id':   self.staff_id,
        }