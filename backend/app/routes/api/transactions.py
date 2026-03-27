"""
API transaction endpoints — list, issue, return, overdue, borrowed books.
"""

from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone

from ...extensions import db
from ...models import Transaction, Reservation
from ...utils import issue_book, return_book, calculate_overdue_fines
from ...decorators import api_librarian_required, api_user_required
from . import (api_bp, transaction_schema, transactions_schema,
               _serialize_transaction_for_app, _serialize_reservation_for_app)


@api_bp.route('/transactions', methods=['GET'])
@api_librarian_required
def get_transactions():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    status = request.args.get('status', '')

    query = Transaction.query
    if status:
        query = query.filter(Transaction.status == status)

    transactions = query.order_by(Transaction.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'transactions': transactions_schema.dump(transactions.items),
        'total': transactions.total,
        'pages': transactions.pages,
        'current_page': transactions.page,
    })


@api_bp.route('/transactions/issue', methods=['POST'])
@api_librarian_required
def issue_book_api():
    data = request.get_json()

    if not data or not data.get('user_id') or not data.get('book_id'):
        return jsonify({'error': 'user_id and book_id required'}), 400

    due_date = None
    if data.get('due_date'):
        due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))

    success, message = issue_book(data['user_id'], data['book_id'], due_date)

    if success:
        transaction = Transaction.query.filter(
            Transaction.user_id == data['user_id'],
            Transaction.book_id == data['book_id'],
            Transaction.status == 'issued'
        ).order_by(Transaction.created_at.desc()).first()
        return jsonify(transaction_schema.dump(transaction)), 201
    else:
        return jsonify({'error': message}), 400


@api_bp.route('/transactions/return', methods=['POST'])
@api_librarian_required
def return_book_api():
    data = request.get_json()

    if not data or not data.get('transaction_id'):
        return jsonify({'error': 'transaction_id required'}), 400

    success, message = return_book(data['transaction_id'])

    if success:
        transaction = Transaction.query.get(data['transaction_id'])
        return jsonify(transaction_schema.dump(transaction))
    else:
        return jsonify({'error': message}), 400


@api_bp.route('/transactions/overdue', methods=['GET'])
@api_librarian_required
def get_overdue_transactions():
    calculate_overdue_fines()

    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)

    overdue_transactions = Transaction.query.filter(
        Transaction.status == 'overdue'
    ).order_by(Transaction.due_date.asc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'transactions': transactions_schema.dump(overdue_transactions.items),
        'total': overdue_transactions.total,
        'pages': overdue_transactions.pages,
        'current_page': overdue_transactions.page,
    })


# --- Mobile user endpoints ---

@api_bp.route('/user/borrowed-books', methods=['GET'])
@api_user_required
def user_borrowed_books():
    user_id = int(get_jwt_identity())
    calculate_overdue_fines()

    transactions = Transaction.query.filter(
        Transaction.user_id == user_id,
        Transaction.status.in_(['issued', 'overdue'])
    ).order_by(Transaction.due_date.asc()).all()

    reservations = Reservation.query.filter_by(
        user_id=user_id, status='pending'
    ).order_by(Reservation.created_at.asc()).all()

    borrowed_items = [_serialize_transaction_for_app(tx) for tx in transactions]
    borrowed_items.extend(_serialize_reservation_for_app(res) for res in reservations)

    return jsonify({'books': borrowed_items}), 200
