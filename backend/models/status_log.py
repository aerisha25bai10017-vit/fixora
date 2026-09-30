from datetime import datetime
from models import db


class StatusLog(db.Model):
    __tablename__ = 'status_logs'

    id = db.Column(db.Integer, primary_key=True)
    issue_id = db.Column(db.Integer, db.ForeignKey('issues.id'), nullable=False)

    old_status = db.Column(db.String(20), nullable=True)
    new_status = db.Column(db.String(20), nullable=False)

    changed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    remark = db.Column(db.String(255), nullable=True)

    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    changer = db.relationship('User', foreign_keys=[changed_by])

    def __init__(
        self,
        issue_id=None,
        old_status=None,
        new_status=None,
        changed_by=None,
        remark=None,
        timestamp=None,
        **kwargs
    ):
        super().__init__(**kwargs)
        if issue_id is not None:
            self.issue_id = issue_id
        if old_status is not None:
            self.old_status = old_status
        if new_status is not None:
            self.new_status = new_status
        if changed_by is not None:
            self.changed_by = changed_by
        if remark is not None:
            self.remark = remark
        if timestamp is not None:
            self.timestamp = timestamp

    def to_dict(self):
        return {
            'id': self.id,
            'issue_id': self.issue_id,
            'old_status': self.old_status,
            'new_status': self.new_status,
            'changed_by': self.changed_by,
            'changed_by_name': self.changer.name if self.changer else None,
            'remark': self.remark,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
