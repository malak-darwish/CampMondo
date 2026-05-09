from app import db

class AttendanceLog(db.Model):
    __tablename__ = 'attendance_logs'

    id             = db.Column(db.Integer, primary_key=True)
    camper_id      = db.Column(db.Integer, db.ForeignKey('campers.id'),  nullable=False)
    group_id       = db.Column(db.Integer, db.ForeignKey('groups.id'),   nullable=False)
    session_id     = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    log_date       = db.Column(db.Date,    nullable=False)
    checked_in_at  = db.Column(db.DateTime)
    checked_out_at = db.Column(db.DateTime)
    status         = db.Column(db.Enum('present', 'absent', 'pending'), nullable=False, default='pending')
    recorded_by    = db.Column(db.Integer, db.ForeignKey('users.id'),    nullable=False)

    def to_dict(self):
        return {
            'id':             self.id,
            'camper_id':      self.camper_id,
            'group_id':       self.group_id,
            'session_id':     self.session_id,
            'log_date':       str(self.log_date),
            'checked_in_at':  self.checked_in_at.isoformat()  if self.checked_in_at  else None,
            'checked_out_at': self.checked_out_at.isoformat() if self.checked_out_at else None,
            'status':         self.status,
            'recorded_by':    self.recorded_by,
<<<<<<< HEAD
        }
=======
        }
>>>>>>> origin/malak
