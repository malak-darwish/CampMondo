from app import db


class ActivityProgram(db.Model):
    __tablename__ = "activity_programs"

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey("sessions.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    fee = db.Column(db.Numeric(10, 2), nullable=False, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "session_id": self.session_id,
            "name": self.name,
            "fee": float(self.fee),
        }
