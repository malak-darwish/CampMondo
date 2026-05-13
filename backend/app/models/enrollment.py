from datetime import datetime
from app import db


class Enrollment(db.Model):
    __tablename__ = 'enrollments'

    id           = db.Column(db.Integer, primary_key=True)
    camper_id    = db.Column(db.Integer, db.ForeignKey('campers.id'), nullable=False)
    session_id   = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    group_id     = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=True)
    status       = db.Column(db.Enum('active', 'cancelled'), nullable=False, default='active')
    enrolled_at  = db.Column(db.DateTime, default=datetime.utcnow)
    cancelled_at = db.Column(db.DateTime, nullable=True)

    activities = db.relationship('EnrollmentActivity', backref='enrollment', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id':           self.id,
            'camper_id':    self.camper_id,
            'session_id':   self.session_id,
            'group_id':     self.group_id,
            'status':       self.status,
            'enrolled_at':  str(self.enrolled_at),
            'cancelled_at': str(self.cancelled_at) if self.cancelled_at else None,
        }


class EnrollmentActivity(db.Model):
    __tablename__ = 'enrollment_activities'

    id            = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey('enrollments.id'), nullable=False)
    activity_id   = db.Column(db.Integer, db.ForeignKey('activity_programs.id'), nullable=False)

    def to_dict(self):
        return {
            'id':            self.id,
            'enrollment_id': self.enrollment_id,
            'activity_id':   self.activity_id,
        }


class Document(db.Model):
    __tablename__ = 'documents'

    id            = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey('enrollments.id'), nullable=False)
    document_type = db.Column(db.Enum('medical_form', 'consent_form'), nullable=False)
    file_path     = db.Column(db.String(255), nullable=False)
    uploaded_at   = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':            self.id,
            'enrollment_id': self.enrollment_id,
            'document_type': self.document_type,
            'file_path':     self.file_path,
            'uploaded_at':   str(self.uploaded_at),
        }