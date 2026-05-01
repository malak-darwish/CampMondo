from app import db

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    camper_id = db.Column(db.Integer, nullable=False)
    group_id = db.Column(db.Integer, nullable=False)
    check_in_time = db.Column(db.DateTime)
    check_out_time = db.Column(db.DateTime)
    date = db.Column(db.Date)