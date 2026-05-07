from app import db

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    action       = db.Column(db.String(100), nullable=False)
    target_table = db.Column(db.String(50))
    target_id    = db.Column(db.Integer)
    details      = db.Column(db.Text)
    created_at   = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            'id':           self.id,
            'user_id':      self.user_id,
            'action':       self.action,
            'target_table': self.target_table,
            'target_id':    self.target_id,
            'details':      self.details,
            'created_at':   self.created_at.isoformat() if self.created_at else None,
        }
