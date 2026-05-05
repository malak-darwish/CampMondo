from app import db


class Camper(db.Model):
    __tablename__ = "campers"

    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.Enum("male", "female", "other"), nullable=False)
    medical_alerts = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    emergency_contacts = db.relationship("EmergencyContact", backref="camper", cascade="all, delete-orphan")
    enrollments = db.relationship("Enrollment", backref="camper", cascade="all, delete-orphan")

    def to_dict(self):
        first_contact = self.emergency_contacts[0] if self.emergency_contacts else None
        return {
            "id": self.id,
            "parent_id": self.parent_id,
            "full_name": self.full_name,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "gender": self.gender,
            "medical_alerts": self.medical_alerts,
            "emergency_contacts": [contact.to_dict() for contact in self.emergency_contacts],
            # Compatibility with your current frontend form.
            "emergency_contact_name": first_contact.contact_name if first_contact else None,
            "emergency_contact_phone": first_contact.phone_number if first_contact else None,
        }
