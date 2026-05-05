from app import db


class Session(db.Model):
    __tablename__ = "sessions"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    max_capacity = db.Column(db.Integer, nullable=False)
    enrollment_fee = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    activity_programs = db.relationship("ActivityProgram", backref="session", cascade="all, delete-orphan")
    enrollments = db.relationship("Enrollment", backref="session", cascade="all, delete-orphan")

    def active_enrollment_count(self):
        return len([enrollment for enrollment in self.enrollments if enrollment.status == "active"])

    def to_dict(self):
        enrolled_count = self.active_enrollment_count()
        return {
            "id": self.id,
            "name": self.name,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "max_capacity": self.max_capacity,
            "enrolled_count": enrolled_count,
            "remaining_capacity": max(self.max_capacity - enrolled_count, 0),
            "enrollment_fee": float(self.enrollment_fee),
            "activities": [activity.to_dict() for activity in self.activity_programs],
        }
