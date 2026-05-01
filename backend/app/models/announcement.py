from datetime import datetime
from app import db


class Announcement(db.Model):
    __tablename__ = 'announcements'

    id           = db.Column(db.Integer, primary_key=True)
    author_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title        = db.Column(db.String(200), nullable=False)
    body         = db.Column(db.Text, nullable=False)
    target_type  = db.Column(db.Enum('system_wide', 'session', 'group'), nullable=False, default='system_wide')
    target_id    = db.Column(db.Integer, nullable=True)
    published_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':          self.id,
            'author_id':   self.author_id,
            'title':       self.title,
            'body':        self.body,
            'target_type': self.target_type,
            'target_id':   self.target_id,
            'published_at': str(self.published_at),
        }