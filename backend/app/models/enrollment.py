from app import db


class Enrollment(db.Model):
    __tablename__ = "enrollments"

    id = db.Column(db.Integer, primary_key=True)
    camper_id = db.Column(db.Integer, db.ForeignKey("campers.id"), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey("sessions.id"), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey("groups.id"))
    status = db.Column(db.Enum("active", "cancelled"), nullable=False, default="active")
    enrolled_at = db.Column(db.DateTime, server_default=db.func.now())
    cancelled_at = db.Column(db.DateTime)

    selected_activities = db.relationship("EnrollmentActivity", backref="enrollment", cascade="all, delete-orphan")
    documents = db.relationship("Document", backref="enrollment", cascade="all, delete-orphan")
    payments = db.relationship("Payment", backref="enrollment", cascade="all, delete-orphan")

    def calculate_total_fee(self):
        session_fee = float(self.session.enrollment_fee) if self.session else 0.0
        activities_fee = sum(float(item.activity.fee) for item in self.selected_activities if item.activity)
        return session_fee + activities_fee

    def to_dict(self):
        return {
            "id": self.id,
            "camper_id": self.camper_id,
            "camper_name": self.camper.full_name if self.camper else None,
            "session_id": self.session_id,
            "session": self.session.to_dict() if self.session else None,
            "group_id": self.group_id,
            "status": self.status,
            "enrolled_at": self.enrolled_at.isoformat() if self.enrolled_at else None,
            "cancelled_at": self.cancelled_at.isoformat() if self.cancelled_at else None,
            "activities": [item.activity.to_dict() for item in self.selected_activities if item.activity],
            "documents": [document.to_dict() for document in self.documents],
            "total_fee": self.calculate_total_fee(),
        }
