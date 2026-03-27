"""
API routes subpackage.

Houses the ``api`` blueprint, Marshmallow schemas, and shared serialization
helpers. Domain-specific endpoints are registered by importing the sibling
modules at the bottom of this file.
"""

from flask import Blueprint, jsonify as _jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from marshmallow import Schema, fields
from datetime import timedelta

from ...models import Reservation

# ---------------------------------------------------------------------------
# Blueprint
# ---------------------------------------------------------------------------
api_bp = Blueprint('api', __name__)


# ---------------------------------------------------------------------------
# Marshmallow Schemas
# ---------------------------------------------------------------------------
class UserSchema(Schema):
    id = fields.Int()
    name = fields.Str()
    email = fields.Str()
    role = fields.Str()
    is_active = fields.Bool()
    created_at = fields.DateTime()


class BookSchema(Schema):
    id = fields.Int()
    title = fields.Str()
    author = fields.Str()
    publisher = fields.Str()
    isbn = fields.Str()
    category_id = fields.Int()
    category_name = fields.Str()
    description = fields.Str()
    total_copies = fields.Int()
    available_copies = fields.Int()
    created_at = fields.DateTime()


class TransactionSchema(Schema):
    id = fields.Int()
    user_id = fields.Int()
    user_name = fields.Str()
    book_id = fields.Int()
    book_title = fields.Str()
    issue_date = fields.DateTime()
    due_date = fields.DateTime()
    return_date = fields.DateTime()
    fine_amount = fields.Float()
    status = fields.Str()
    created_at = fields.DateTime()


class CategorySchema(Schema):
    id = fields.Int()
    name = fields.Str()
    description = fields.Str()
    created_at = fields.DateTime()


# Schema instances
user_schema = UserSchema()
users_schema = UserSchema(many=True)
book_schema = BookSchema()
books_schema = BookSchema(many=True)
transaction_schema = TransactionSchema()
transactions_schema = TransactionSchema(many=True)
category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)


# ---------------------------------------------------------------------------
# Shared serialization helpers (used by multiple API modules)
# ---------------------------------------------------------------------------

def _serialize_user_for_app(user):
    """Serialize user data in the format expected by the mobile app."""
    membership_id = user.membership_id or f"USER{user.id:05d}"
    return {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'membership_id': membership_id,
    }


def _serialize_book_for_app(book):
    """Serialize book data with fields expected by the mobile app."""
    pending_reservations = Reservation.query.filter_by(
        book_id=book.id, status='pending'
    ).count()
    available = max(0, book.available_copies - pending_reservations)
    return {
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'category': book.category.name if getattr(book, 'category', None) else 'General',
        'available_copies': available,
        'total_copies': book.total_copies,
        'description': book.description or book.publisher or 'No description available.',
        'cover_url': book.cover_url,
    }


def _serialize_transaction_for_app(transaction):
    """Serialize transaction details for the mobile app borrowed books view."""
    book = transaction.book
    return {
        'id': transaction.id,
        'book': _serialize_book_for_app(book),
        'issue_date': transaction.issue_date.isoformat() if transaction.issue_date else None,
        'due_date': transaction.due_date.isoformat() if transaction.due_date else None,
        'status': transaction.status,
    }


def _serialize_reservation_for_app(reservation):
    """Serialize reservation information to align with borrowed book structure."""
    book = reservation.book
    if not book:
        return {
            'id': reservation.id,
            'book': None,
            'issue_date': reservation.created_at.isoformat() if reservation.created_at else None,
            'due_date': (reservation.created_at + timedelta(days=3)).isoformat() if reservation.created_at else None,
            'status': 'reserved',
        }
    expected_pickup = reservation.created_at + timedelta(days=3) if reservation.created_at else None
    return {
        'id': reservation.id,
        'book': _serialize_book_for_app(book),
        'issue_date': reservation.created_at.isoformat() if reservation.created_at else None,
        'due_date': expected_pickup.isoformat() if expected_pickup else None,
        'status': 'reserved',
    }


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@api_bp.route('/health', methods=['GET'])
def health_check():
    return _jsonify({'status': 'healthy'}), 200


@api_bp.route('/test', methods=['GET'])
def test_endpoint():
    """Simple test endpoint to verify API is accessible."""
    return _jsonify({
        'status': 'ok',
        'message': 'API is working',
        'timestamp': str(__import__('datetime').datetime.now())
    }), 200


@api_bp.route('/test-auth', methods=['GET'])
@jwt_required()
def test_auth():
    return _jsonify({
        'status': 'authenticated',
        'user_id': get_jwt_identity(),
        'claims': get_jwt()
    }), 200


# ---------------------------------------------------------------------------
# Import sub-modules to register their routes on api_bp
# ---------------------------------------------------------------------------
from . import auth          # noqa: E402, F401
from . import books         # noqa: E402, F401
from . import users         # noqa: E402, F401
from . import transactions  # noqa: E402, F401
from . import categories    # noqa: E402, F401
from . import scanner       # noqa: E402, F401
from . import notifications # noqa: E402, F401
from . import fines         # noqa: E402, F401
from . import dashboard     # noqa: E402, F401
