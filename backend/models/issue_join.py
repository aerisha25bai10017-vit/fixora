from datetime import datetime
from models import db


class IssueJoin(db.Model):
    """
    Records a student saying "I have this problem too" on an issue someone
    else already raised. Powers the community grid on the Student Dashboard
    so duplicate reports collapse into one tracked ticket with a supporter
    count, instead of disappearing into separate silos.
    """
    __tablename__ = 'issue_joins'
    __table_args__ = (
        db.UniqueConstraint('issue_id', 'user_id', name='uq_issue_joins_issue_user'),
    )

    id = db.Column(db.Integer, primary_key=True)
    issue_id = db.Column(db.Integer, db.ForeignKey('issues.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    issue = db.relationship('Issue', backref=db.backref('joins', cascade='all, delete-orphan', lazy=True))
    user = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'issue_id': self.issue_id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
