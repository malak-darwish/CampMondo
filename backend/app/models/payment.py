from app import db


class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey("enrollments.id"), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.Enum("pending", "confirmed", "failed"), nullable=False, default="pending")
    card_last4 = db.Column(db.String(4))
    submitted_at = db.Column(db.DateTime, server_default=db.func.now())
    confirmed_at = db.Column(db.DateTime)
    admin_note = db.Column(db.Text)
    override_by = db.Column(db.Integer, db.ForeignKey("users.id"))

    def to_dict(self):
        camper = self.enrollment.camper if self.enrollment and self.enrollment.camper else None
        session = self.enrollment.session if self.enrollment and self.enrollment.session else None
        return {
            "id": self.id,
            "enrollment_id": self.enrollment_id,
            "camper_id": camper.id if camper else None,
            "camper_name": camper.full_name if camper else None,
            "session_id": session.id if session else None,
            "session_name": session.name if session else None,
            "amount": float(self.amount),
            "status": self.status,
            "card_last4": self.card_last4,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "confirmed_at": self.confirmed_at.isoformat() if self.confirmed_at else None,
            "admin_note": self.admin_note,
            "override_by": self.override_by,
        }
