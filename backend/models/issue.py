from datetime import datetime, timedelta
from models import db


class Issue(db.Model):
    __tablename__ = 'issues'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    # electrical | plumbing | it | hostel | furniture | other
    category = db.Column(db.String(50), nullable=False, default='other')
    attachment_url = db.Column(db.String(255), nullable=True)
    # pending | in_progress | resolved | escalated
    status = db.Column(db.String(20), nullable=False, default='pending')
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    sla_deadline = db.Column(db.DateTime, nullable=False)

    student_name = db.Column(db.String(120))
    reg_no = db.Column(db.String(50))
    block_no = db.Column(db.String(50))
    location_type = db.Column(db.String(30))

    logs = db.relationship(
        'StatusLog', backref='issue', lazy=True,
        cascade='all, delete-orphan', order_by='StatusLog.timestamp'
    )

    def __init__(
        self,
        title=None,
        description=None,
        category='other',
        attachment_url=None,
        status='pending',
        created_by=None,
        assigned_to=None,
        student_name=None,
        reg_no=None,
        block_no=None,
        location_type=None,
        sla_hours=24,
        sla_deadline=None,
        **kwargs
    ):
        super().__init__(**kwargs)
        if title is not None:
            self.title = title
        if description is not None:
            self.description = description
        if category is not None:
            self.category = category
        if attachment_url is not None:
            self.attachment_url = attachment_url
        if status is not None:
            self.status = status
        if created_by is not None:
            self.created_by = created_by
        if assigned_to is not None:
            self.assigned_to = assigned_to
        if student_name is not None:
            self.student_name = student_name
        if reg_no is not None:
            self.reg_no = reg_no
        if block_no is not None:
            self.block_no = block_no
        if location_type is not None:
            self.location_type = location_type

        if sla_deadline is not None:
            self.sla_deadline = sla_deadline
        elif not self.sla_deadline:
            self.sla_deadline = datetime.utcnow() + timedelta(hours=sla_hours or 24)

    def is_overdue(self):
        return (
            self.status in ('pending', 'in_progress')
            and datetime.utcnow() > self.sla_deadline
        )

    @property
    def supporters_count(self):
        # +1 so the original reporter always counts as the first "me too".
        return len(self.joins) + 1 if self.joins is not None else 1

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'attachment_url': self.attachment_url,
            'status': self.status,
            'created_by': self.created_by,
            'creator_name': self.creator.name if self.creator else None,
            'assigned_to': self.assigned_to,
            'assignee_name': self.assignee.name if self.assignee else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'sla_deadline': self.sla_deadline.isoformat() if self.sla_deadline else None,
            'is_overdue': self.is_overdue(),
            'student_name': self.student_name,
            'reg_no': self.reg_no,
            'block_no': self.block_no,
            'location_type': self.location_type,
            'supporters_count': self.supporters_count,
        }
