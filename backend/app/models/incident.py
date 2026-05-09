from datetime import datetime
from app import db


class IncidentReport(db.Model):
    __tablename__ = 'incident_reports'

    id            = db.Column(db.Integer, primary_key=True)
    camper_id     = db.Column(db.Integer, db.ForeignKey('campers.id'), nullable=False)
    reported_by   = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    session_id    = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    incident_date = db.Column(db.Date, nullable=False)
    incident_time = db.Column(db.Time, nullable=False)
    description   = db.Column(db.Text, nullable=False)
    action_taken  = db.Column(db.Text, nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':            self.id,
            'camper_id':     self.camper_id,
            'reported_by':   self.reported_by,
            'session_id':    self.session_id,
            'incident_date': str(self.incident_date),
            'incident_time': str(self.incident_time),
            'description':   self.description,
            'action_taken':  self.action_taken,
            'created_at':    str(self.created_at),
        }