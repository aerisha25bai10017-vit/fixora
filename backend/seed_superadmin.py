"""
Creates (or updates) the one trusted Super Admin account for FIXora.

Super admin accounts are intentionally NOT available through the public
/register endpoint — they're created here, on the server, so only someone
with access to the backend/environment can mint one.

Usage:
    cd backend
    python seed_superadmin.py

Configure via environment variables (or a .env file, already loaded by
config/app):
    SUPERADMIN_NAME      (default: "Super Admin")
    SUPERADMIN_EMAIL     (default: "superadmin@fixora.edu")
    SUPERADMIN_PASSWORD  (default: "ChangeMe@123")

Run this again any time to reset the super admin's password to whatever
SUPERADMIN_PASSWORD currently is.
"""
import os
from dotenv import load_dotenv

load_dotenv()

from app import create_app
from models import db
from models.user import User

DEFAULT_NAME = os.environ.get('SUPERADMIN_NAME', 'Super Admin')
DEFAULT_EMAIL = os.environ.get('SUPERADMIN_EMAIL', 'superadmin@fixora.edu')
DEFAULT_PASSWORD = os.environ.get('SUPERADMIN_PASSWORD', 'ChangeMe@123')


def seed():
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(email=DEFAULT_EMAIL).first()
        if user:
            user.role = 'superadmin'
            user.name = DEFAULT_NAME
            user.department = None
            user.set_password(DEFAULT_PASSWORD)
            db.session.commit()
            print(f'Updated existing Super Admin: {DEFAULT_EMAIL}')
        else:
            user = User(
                name=DEFAULT_NAME,
                email=DEFAULT_EMAIL,
                role='superadmin',
                department=None
            )
            user.set_password(DEFAULT_PASSWORD)
            db.session.add(user)
            db.session.commit()
            print(f'Created new Super Admin: {DEFAULT_EMAIL}')

        print('Password:', DEFAULT_PASSWORD)
        print('⚠️  Change this password / set SUPERADMIN_PASSWORD in your .env for production.')


if __name__ == '__main__':
    seed()
