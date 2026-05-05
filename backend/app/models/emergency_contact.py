from app import db


class EmergencyContact(db.Model):
    __tablename__ = "emergency_contacts"

    id = db.Column(db.Integer, primary_key=True)
    camper_id = db.Column(db.Integer, db.ForeignKey("campers.id"), nullable=False)
    contact_name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "camper_id": self.camper_id,
            "contact_name": self.contact_name,
            "phone_number": self.phone_number,
        }
