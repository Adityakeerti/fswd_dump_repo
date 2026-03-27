"""
API book endpoints — CRUD, search, available, reserve, cancel.
"""

from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from ...extensions import db
from ...models import Book, Transaction, Reservation
from ...decorators import api_librarian_required, api_user_required
from . import api_bp, book_schema, books_schema, _serialize_book_for_app


# --- Librarian CRUD ---

@api_bp.route('/books', methods=['GET'])
@jwt_required()
def get_books():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    search = request.args.get('search', '')

    query = Book.query
    if search:
        like_query = f'%{search}%'
        query = query.filter(
            (Book.title.ilike(like_query)) |
            (Book.author.ilike(like_query)) |
            (Book.isbn.ilike(like_query))
        )

    books = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'books': books_schema.dump(books.items),
        'total': books.total,
        'pages': books.pages,
        'current_page': books.page,
    })


@api_bp.route('/books', methods=['POST'])
@api_librarian_required
def create_book():
    data = request.get_json()

    if not data or not data.get('title') or not data.get('author'):
        return jsonify({'error': 'title and author are required'}), 400

    try:
        book = Book(
            title=data['title'],
            author=data['author'],
            publisher=data.get('publisher', ''),
            isbn=data.get('isbn', ''),
            category_id=data.get('category_id'),
            description=data.get('description', ''),
            total_copies=data.get('total_copies', 1),
            available_copies=data.get('total_copies', 1),
        )
        db.session.add(book)
        db.session.commit()
        return jsonify(book_schema.dump(book)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@api_bp.route('/books/<int:book_id>', methods=['GET'])
@jwt_required()
def get_book(book_id):
    book = Book.query.get_or_404(book_id)
    return jsonify(book_schema.dump(book))


@api_bp.route('/books/<int:book_id>', methods=['PUT'])
@api_librarian_required
def update_book(book_id):
    book = Book.query.get_or_404(book_id)
    data = request.get_json()

    try:
        book.title = data.get('title', book.title)
        book.author = data.get('author', book.author)
        book.publisher = data.get('publisher', book.publisher)
        book.isbn = data.get('isbn', book.isbn)
        book.category_id = data.get('category_id', book.category_id)
        book.description = data.get('description', book.description)

        old_total = book.total_copies
        book.total_copies = data.get('total_copies', book.total_copies)
        if book.total_copies > old_total:
            book.available_copies += (book.total_copies - old_total)
        elif book.total_copies < old_total:
            book.available_copies = max(0, book.available_copies - (old_total - book.total_copies))

        db.session.commit()
        return jsonify(book_schema.dump(book))
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@api_bp.route('/books/<int:book_id>', methods=['DELETE'])
@api_librarian_required
def delete_book(book_id):
    book = Book.query.get_or_404(book_id)

    active_transactions = Transaction.query.filter(
        Transaction.book_id == book_id,
        Transaction.status.in_(['issued', 'overdue'])
    ).count()

    if active_transactions > 0:
        return jsonify({'error': 'Cannot delete book with active transactions'}), 400

    db.session.delete(book)
    db.session.commit()
    return jsonify({'message': 'Book deleted successfully'})


# --- Mobile / user-facing ---

@api_bp.route('/books/available', methods=['GET'])
@jwt_required(optional=True)
def books_available():
    """List books available for users."""
    books = Book.query.filter(Book.available_copies > 0).order_by(Book.title.asc()).all()
    serialized = [_serialize_book_for_app(book) for book in books]
    return jsonify({'books': serialized}), 200


@api_bp.route('/books/search', methods=['GET'])
@jwt_required(optional=True)
def books_search():
    """Search books by title, author, or ISBN for mobile users."""
    query_str = request.args.get('query', '').strip()

    q = Book.query
    if query_str:
        like_query = f"%{query_str}%"
        q = q.filter(
            (Book.title.ilike(like_query)) |
            (Book.author.ilike(like_query)) |
            (Book.isbn.ilike(like_query))
        )

    books = q.order_by(Book.title.asc()).all()
    serialized = [_serialize_book_for_app(book) for book in books]
    return jsonify({'books': serialized}), 200


@api_bp.route('/books/reserve', methods=['POST'])
@api_user_required
def reserve_book_user():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    book_id = data.get('book_id')

    if not book_id:
        return jsonify({'error': 'book_id is required'}), 400

    book = Book.query.get(book_id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404

    if book.available_copies <= 0:
        return jsonify({'error': 'Book not available for reservation'}), 400

    existing_transaction = Transaction.query.filter(
        Transaction.user_id == user_id,
        Transaction.book_id == book_id,
        Transaction.status.in_(['issued', 'overdue'])
    ).first()

    if existing_transaction:
        return jsonify({'error': 'You already have this book issued or reserved'}), 400

    existing_reservation = Reservation.query.filter_by(
        user_id=user_id, book_id=book_id, status='pending'
    ).first()

    if existing_reservation:
        return jsonify({'error': 'You already have a pending reservation for this book'}), 400

    pending_reservations = Reservation.query.filter_by(
        book_id=book_id, status='pending'
    ).count()

    if (book.available_copies - pending_reservations) <= 0:
        return jsonify({'error': 'All copies are already reserved'}), 400

    try:
        reservation = Reservation(user_id=user_id, book_id=book_id, status='pending')
        db.session.add(reservation)
        db.session.commit()
        return jsonify({'success': True, 'reservation_id': reservation.id}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({'error': str(exc)}), 500


@api_bp.route('/books/cancel-reservation/<int:reservation_id>', methods=['DELETE'])
@api_user_required
def cancel_reservation_user(reservation_id):
    user_id = int(get_jwt_identity())
    reservation = Reservation.query.get_or_404(reservation_id)

    if reservation.user_id != user_id or reservation.status != 'pending':
        return jsonify({'error': 'Reservation not found'}), 404

    try:
        reservation.status = 'cancelled'
        db.session.commit()
        return jsonify({'success': True}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({'error': str(exc)}), 500
