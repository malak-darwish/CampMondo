from datetime import datetime
from app import db


class Payment(db.Model):
    __tablename__ = 'payments'

    id            = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey('enrollments.id'), nullable=False)
    amount        = db.Column(db.Numeric(10, 2), nullable=False)
    status        = db.Column(db.Enum('pending', 'confirmed', 'failed'), nullable=False, default='pending')
    submitted_at  = db.Column(db.DateTime, default=datetime.utcnow)
    confirmed_at  = db.Column(db.DateTime, nullable=True)
    admin_note    = db.Column(db.Text, nullable=True)
    override_by   = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    enrollment = db.relationship('Enrollment', backref='payment', lazy=True)

    def to_dict(self):
        return {
            'id':            self.id,
            'enrollment_id': self.enrollment_id,
            'amount':        float(self.amount),
            'status':        self.status,
            'submitted_at':  str(self.submitted_at),
            'confirmed_at':  str(self.confirmed_at) if self.confirmed_at else None,
            'admin_note':    self.admin_note,
            'override_by':   self.override_by,
        }