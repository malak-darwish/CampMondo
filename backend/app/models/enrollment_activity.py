from app import db


class EnrollmentActivity(db.Model):
    __tablename__ = "enrollment_activities"

    id = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey("enrollments.id"), nullable=False)
    activity_id = db.Column(db.Integer, db.ForeignKey("activity_programs.id"), nullable=False)

    activity = db.relationship("ActivityProgram")
