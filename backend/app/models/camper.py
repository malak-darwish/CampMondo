from datetime import datetime
from app import db


class Camper(db.Model):
    __tablename__ = 'campers'

    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    emergency_contact_name = db.Column(db.String(120), nullable=False)
    emergency_contact_phone = db.Column(db.String(30), nullable=False)
    medical_alerts = db.Column(db.Text)
    medical_form_path = db.Column(db.String(255))
    consent_form_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payments = db.relationship('Payment', backref='camper', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'parent_id': self.parent_id,
            'full_name': self.full_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'emergency_contact_name': self.emergency_contact_name,
            'emergency_contact_phone': self.emergency_contact_phone,
            'medical_alerts': self.medical_alerts,
            'medical_form_path': self.medical_form_path,
            'consent_form_path': self.consent_form_path,
        }
