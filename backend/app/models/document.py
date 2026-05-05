from app import db


class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey("enrollments.id"), nullable=False)
    document_type = db.Column(db.Enum("medical_form", "consent_form"), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    original_name = db.Column(db.String(255))
    mime_type = db.Column(db.String(100))
    file_size = db.Column(db.Integer)
    uploaded_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "enrollment_id": self.enrollment_id,
            "document_type": self.document_type,
            "file_path": self.file_path,
            "original_name": self.original_name,
            "mime_type": self.mime_type,
            "file_size": self.file_size,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
        }
