"""
API authentication endpoints.
"""

from flask import request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity

from ...models import User
from ...decorators import api_user_required
from . import api_bp, user_schema, _serialize_user_for_app


@api_bp.route('/auth/register', methods=['POST'])
def api_register():
    """Register new library user."""
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Name, email and password required'}), 400

    email = data['email'].strip().lower()
    name = data['name'].strip()
    password = data['password']

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400

    user = User(name=name, email=email, role='user', is_active=True)
    user.set_password(password)
    
    from ...extensions import db
    db.session.add(user)
    db.session.commit()

    return jsonify({
        'message': 'Account created successfully',
        'user': user_schema.dump(user),
    }), 201


@api_bp.route('/auth/login', methods=['POST'])
def api_login():
    """Authenticate librarian users and issue JWT."""
    data = request.get_json()
    
    print(f"[API Login] Received request from {request.remote_addr}")
    print(f"[API Login] Request data: {data}")

    if not data or not data.get('email') or not data.get('password'):
        print("[API Login] Missing email or password")
        return jsonify({'error': 'Email and password required'}), 400

    email = data['email'].strip().lower()
    user = User.query.filter_by(email=email).first()
    
    print(f"[API Login] Looking up user: {email}")
    print(f"[API Login] User found: {user is not None}")
    
    if user:
        print(f"[API Login] User role: {user.role}")
        print(f"[API Login] Password check: {user.check_password(data['password'])}")

    if user and user.check_password(data['password']) and user.role == 'librarian':
        access_token = create_access_token(identity=str(user.id), additional_claims={'role': 'librarian'})
        print(f"[API Login] Login successful for {email}")
        return jsonify({
            'access_token': access_token,
            'user': user_schema.dump(user),
        }), 200
    else:
        print(f"[API Login] Login failed for {email}")
        return jsonify({'error': 'Invalid credentials'}), 401


@api_bp.route('/user/login', methods=['POST'])
def user_login():
    """Authenticate mobile app users (role=user) and issue JWT."""
    data = request.get_json() or {}

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    if user.role != 'user':
        return jsonify({'error': 'Access restricted to library users'}), 403

    if not user.is_active:
        return jsonify({'error': 'Account is inactive. Contact librarian.'}), 403

    access_token = create_access_token(identity=str(user.id), additional_claims={'role': 'user'})

    return jsonify({
        'token': access_token,
        'user': _serialize_user_for_app(user),
    }), 200


@api_bp.route('/user/profile', methods=['GET'])
@api_user_required
def user_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify({'user': _serialize_user_for_app(user)}), 200
