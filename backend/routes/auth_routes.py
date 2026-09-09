from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models import db
from models.user import User

auth_bp = Blueprint('auth', __name__)

# The four grievance "blocks" a query can belong to. Admins each look after
# one of these blocks; the super admin can see and assign across all of them.
VALID_BLOCKS = {'Health', 'Maintenance', 'Academic', 'Personal'}


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')
    department = data.get('department')

    if not name or not email or not password:
        return jsonify({'error': 'name, email and password are required'}), 400

    # Super admin accounts are never created through public self-registration.
    # There should only be one (or a few) trusted super admin(s), seeded
    # directly on the server — see backend/seed_superadmin.py.
    if role == 'superadmin':
        return jsonify({'error': 'Super Admin accounts cannot be self-registered'}), 403

    if role not in ('student', 'admin'):
        return jsonify({'error': 'Invalid role'}), 400

    # Admins must pick which block/desk they handle so the super admin
    # knows who to route each grievance to.
    if role == 'admin':
        if department not in VALID_BLOCKS:
            return jsonify({
                'error': f'Admins must select a valid block: {", ".join(sorted(VALID_BLOCKS))}'
            }), 400
    else:
        department = None

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    user = User(name=name, email=email, role=role, department=department)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'email and password are required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role, 'name': user.name}
    )

    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200
