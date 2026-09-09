from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db
from models.issue import Issue
from models.status_log import StatusLog
from models.user import User
from utils.auth_helper import role_required
from utils.sla_checker import check_and_escalate_issues

admin_bp = Blueprint('admin', __name__)

# The four grievance "blocks". Every admin manages exactly one; the super
# admin oversees and assigns across all of them.
VALID_BLOCKS = {'Health', 'Maintenance', 'Academic', 'Personal'}


@admin_bp.route('/issues/<int:issue_id>/assign', methods=['PUT'])
@jwt_required()
@role_required('superadmin')
def assign_issue(issue_id):
    """
    Only the Super Admin can assign a raised query to a specific admin.
    Regular admins can update the status of issues once assigned to them,
    but they cannot re-route or hand off a query themselves.
    """
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    assignee_id = data.get('assigned_to')
    if not assignee_id:
        return jsonify({'error': 'assigned_to (admin user id) is required'}), 400

    staff = User.query.get(assignee_id)
    if not staff or staff.role != 'admin':
        return jsonify({'error': 'assigned_to must be an existing Admin account'}), 400

    issue = Issue.query.get_or_404(issue_id)
    issue.assigned_to = assignee_id

    old_status = issue.status
    if issue.status == 'pending':
        issue.status = 'in_progress'

    log = StatusLog(
        issue_id=issue.id,
        old_status=old_status,
        new_status=issue.status,
        changed_by=user_id,
        remark=f'Assigned to {staff.name} ({staff.department or "-"} block)'
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({'message': 'Issue assigned', 'issue': issue.to_dict()}), 200


@admin_bp.route('/issues/escalated', methods=['GET'])
@jwt_required()
@role_required('admin', 'superadmin')
def get_escalated_issues():
    check_and_escalate_issues()

    issues = Issue.query.filter_by(status='escalated') \
        .order_by(Issue.sla_deadline.asc()).all()

    return jsonify({'issues': [i.to_dict() for i in issues]}), 200


@admin_bp.route('/staff', methods=['GET'])
@jwt_required()
@role_required('admin', 'superadmin')
def get_staff_list():
    """
    Returns admin (and superadmin) accounts.
    Super Admin can filter by block/department, e.g. /api/staff?department=Health
    to see only the admins who handle that block - handy when picking who to
    assign a query to.
    """
    query = User.query.filter(User.role.in_(['admin', 'superadmin']))

    department = request.args.get('department')
    if department:
        query = query.filter_by(department=department)

    staff = query.order_by(User.role.desc(), User.department).all()

    result = []
    for s in staff:
        d = s.to_dict()
        d['open_issue_count'] = Issue.query.filter(
            Issue.assigned_to == s.id,
            Issue.status.in_(['pending', 'in_progress'])
        ).count()
        result.append(d)

    return jsonify({'staff': result}), 200


@admin_bp.route('/admins', methods=['GET'])
@jwt_required()
@role_required('superadmin')
def list_admins():
    """Super Admin only: list every admin account grouped implicitly by block."""
    admins = User.query.filter_by(role='admin').order_by(User.department, User.name).all()
    result = []
    for a in admins:
        d = a.to_dict()
        d['open_issue_count'] = Issue.query.filter(
            Issue.assigned_to == a.id,
            Issue.status.in_(['pending', 'in_progress'])
        ).count()
        result.append(d)
    return jsonify({'admins': result, 'blocks': sorted(VALID_BLOCKS)}), 200


@admin_bp.route('/admins', methods=['POST'])
@jwt_required()
@role_required('superadmin')
def create_admin():
    """Super Admin only: create a new admin account for a given block."""
    data = request.get_json(silent=True) or {}

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    department = data.get('department')

    if not name or not email or not password:
        return jsonify({'error': 'name, email and password are required'}), 400

    if department not in VALID_BLOCKS:
        return jsonify({
            'error': f'department must be one of: {", ".join(sorted(VALID_BLOCKS))}'
        }), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    admin = User(name=name, email=email, role='admin', department=department)
    admin.set_password(password)
    db.session.add(admin)
    db.session.commit()

    return jsonify({'message': 'Admin created', 'admin': admin.to_dict()}), 201


@admin_bp.route('/blocks', methods=['GET'])
@jwt_required()
def get_blocks():
    """Simple lookup of the grievance blocks, for populating dropdowns."""
    return jsonify({'blocks': sorted(VALID_BLOCKS)}), 200


@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@role_required('admin', 'superadmin')
def get_stats():
    """Quick counts for dashboard charts (Recharts on the frontend)."""
    check_and_escalate_issues()

    total = Issue.query.count()
    pending = Issue.query.filter_by(status='pending').count()
    in_progress = Issue.query.filter_by(status='in_progress').count()
    resolved = Issue.query.filter_by(status='resolved').count()
    escalated = Issue.query.filter_by(status='escalated').count()

    category_counts = {}
    for cat, count in db.session.query(Issue.category, db.func.count(Issue.id)) \
            .group_by(Issue.category).all():
        category_counts[cat] = count

    return jsonify({
        'total': total,
        'by_status': {
            'pending': pending,
            'in_progress': in_progress,
            'resolved': resolved,
            'escalated': escalated
        },
        'by_category': category_counts
    }), 200
