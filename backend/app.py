import os
import sys

_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
load_dotenv()
from models import db
from routes.auth_routes import auth_bp
from routes.issue_routes import issue_bp
from routes.admin_routes import admin_bp
from routes.academic_routes import academic_bp

def create_app():
    basedir = os.path.abspath(os.path.dirname(__file__))

    # Detect frontend distribution folder (backend/frontend_dist or ../frontend/dist)
    dist_candidates = [
        os.path.join(basedir, 'frontend_dist'),
        os.path.abspath(os.path.join(basedir, '..', 'frontend', 'dist')),
    ]
    static_dist_folder = next((p for p in dist_candidates if os.path.isdir(p)), os.path.join(basedir, 'frontend_dist'))

    app = Flask(__name__, static_folder=None)
    app.config.from_object('config.Config')
    app.static_dist_folder = static_dist_folder

    # Ensure folders exist
    os.makedirs(os.path.join(basedir, 'database'), exist_ok=True)
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    db.init_app(app)
    JWTManager(app)
    CORS(app)  # allow all origins - fine for hackathon; restrict in production

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(issue_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')
    app.register_blueprint(academic_bp, url_prefix='/api')

    @app.route('/static/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {'status': 'ok', 'message': 'Grievance Tracker API is running'}, 200

    # Serve React frontend for all non-API routes
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path.startswith('api'):
            return {'error': 'Endpoint not found', 'path': f'/{path}'}, 404

        dist_folder = app.static_dist_folder
        if dist_folder and os.path.isdir(dist_folder):
            if path != "" and os.path.isfile(os.path.join(dist_folder, path)):
                return send_from_directory(dist_folder, path)
            index_path = os.path.join(dist_folder, 'index.html')
            if os.path.isfile(index_path):
                return send_from_directory(dist_folder, 'index.html')

        return {
            'status': 'backend_ready',
            'message': 'Fixora API is running. Build the frontend or visit /api/health.'
        }, 200

    with app.app_context():
        db.create_all()
        _ensure_default_superadmin()

    return app


def _ensure_default_superadmin():
    """
    Guarantees at least one Super Admin account exists so the app is usable
    right after setup. Super admins can't be created via /register, so we
    seed one here (idempotent - safe to run on every startup).

    Override the defaults with SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD /
    SUPERADMIN_NAME in your .env for anything beyond local/demo use.
    """
    from models.user import User

    email = os.environ.get('SUPERADMIN_EMAIL', 'superadmin@fixora.edu')
    if User.query.filter_by(role='superadmin').first():
        return

    name = os.environ.get('SUPERADMIN_NAME', 'Super Admin')
    password = os.environ.get('SUPERADMIN_PASSWORD', 'ChangeMe@123')

    superadmin = User(name=name, email=email, role='superadmin', department=None)
    superadmin.set_password(password)
    db.session.add(superadmin)
    db.session.commit()
    print(f'[FIXora] Seeded default Super Admin -> {email} / {password} '
          f'(change this via SUPERADMIN_PASSWORD env var)')

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1')
    app.run(debug=debug, host='0.0.0.0', port=port)
