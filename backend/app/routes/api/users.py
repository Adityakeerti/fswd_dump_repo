"""
API user endpoints — CRUD.
"""

from flask import request, jsonify
from flask_jwt_extended import jwt_required

from ...extensions import db
from ...models import User, Transaction, Reservation
from ...decorators import api_librarian_required
from . import api_bp, user_schema, users_schema


@api_bp.route('/users', methods=['GET'])
@api_librarian_required
def get_users():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    search = request.args.get('search', '')

    query = User.query.filter(User.role == 'user')
    if search:
        like_query = f'%{search}%'
        query = query.filter(
            (User.name.ilike(like_query)) |
            (User.email.ilike(like_query))
        )

    users = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'users': users_schema.dump(users.items),
        'total': users.total,
        'pages': users.pages,
        'current_page': users.page,
    })


@api_bp.route('/users', methods=['POST'])
@api_librarian_required
def create_user():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('name') or not data.get('password'):
        return jsonify({'error': 'name, email, and password are required'}), 400

    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'Email already exists'}), 400

    try:
        user = User(
            name=data['name'],
            email=data['email'],
            role=data.get('role', 'user'),
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        return jsonify(user_schema.dump(user)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@api_bp.route('/users/<int:user_id>', methods=['GET'])
@api_librarian_required
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user_schema.dump(user))


@api_bp.route('/users/<int:user_id>', methods=['PUT'])
@api_librarian_required
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    try:
        user.name = data.get('name', user.name)
        user.email = data.get('email', user.email)
        user.role = data.get('role', user.role)
        user.is_active = data.get('is_active', user.is_active)

        if 'password' in data:
            user.set_password(data['password'])

        db.session.commit()
        return jsonify(user_schema.dump(user))
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@api_bp.route('/users/<int:user_id>', methods=['DELETE'])
@api_librarian_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)

    # Auto-return all issued books
    active_transactions = Transaction.query.filter(
        Transaction.user_id == user_id,
        Transaction.status.in_(['issued', 'overdue'])
    ).all()

    for transaction in active_transactions:
        transaction.return_book()

    # Cancel pending reservations
    pending_reservations = Reservation.query.filter_by(
        user_id=user_id, status='pending'
    ).all()

    for reservation in pending_reservations:
        reservation.status = 'cancelled'

    db.session.delete(user)
    db.session.commit()

    return jsonify({
        'message': 'User deleted successfully',
        'books_returned': len(active_transactions),
        'reservations_cancelled': len(pending_reservations),
    })
