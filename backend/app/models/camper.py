from datetime import datetime

from app.models.user import User
from app import db


class Camper(db.Model):
    __tablename__ = 'campers'
    id             = db.Column(db.Integer, primary_key=True)
    parent_id      = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    full_name      = db.Column(db.String(100), nullable=False)
    date_of_birth  = db.Column(db.Date, nullable=False)
    gender         = db.Column(db.Enum('male', 'female', 'other'), nullable=False)
    medical_alerts = db.Column(db.Text, nullable=True)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at     = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    emergency_contacts = db.relationship('EmergencyContact', backref='camper', lazy=True, cascade='all, delete-orphan')
    enrollments        = db.relationship('Enrollment', backref='camper', lazy=True)

    def to_dict(self):
        from datetime import date

        age = None
        if self.date_of_birth:
            today = date.today()
            age = (
                today.year
                - self.date_of_birth.year
                - (
                    (today.month, today.day)
                    < (self.date_of_birth.month, self.date_of_birth.day)
                )
            )

        parent = User.query.get(self.parent_id)

        return {
            'id': self.id,
            'parent_id': self.parent_id,

            'parent_name': parent.full_name if parent else None,
            'parent_email': parent.email if parent else None,
            'parent_phone': parent.phone_number if parent else None,

            'full_name': self.full_name,
            'date_of_birth': str(self.date_of_birth),
            'age': age,
            'gender': self.gender,
            'medical_alerts': self.medical_alerts,

            'emergency_contacts': [
                contact.to_dict()
                for contact in self.emergency_contacts
            ],
        }


class EmergencyContact(db.Model):
    __tablename__ = 'emergency_contacts'

    id           = db.Column(db.Integer, primary_key=True)
    camper_id    = db.Column(db.Integer, db.ForeignKey('campers.id'), nullable=False)
    contact_name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)

    def to_dict(self):
        return {
            'id':           self.id,
            'camper_id':    self.camper_id,
            'contact_name': self.contact_name,
            'phone_number': self.phone_number,
        }