from datetime import datetime
from app import db


class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'

    id               = db.Column(db.Integer, primary_key=True)
    group_id         = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    logged_by        = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    activity_name    = db.Column(db.String(150), nullable=False)
    log_date         = db.Column(db.Date, nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    description      = db.Column(db.Text, nullable=False)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':               self.id,
            'group_id':         self.group_id,
            'logged_by':        self.logged_by,
            'activity_name':    self.activity_name,
            'log_date':         str(self.log_date),
            'duration_minutes': self.duration_minutes,
            'description':      self.description,
            'created_at':       str(self.created_at),
        }