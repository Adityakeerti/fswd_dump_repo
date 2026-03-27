"""
Book issuing and returning logic.
"""

from datetime import datetime, timezone, timedelta, date

from ..extensions import db
from ..models import User, Book, Transaction


def issue_book(user_id, book_id, due_date=None):
    """Issue a book to a user with race-condition protection."""
    user = User.query.get_or_404(user_id)
    book = Book.query.get_or_404(book_id)

    if not book.is_available():
        return False, "Book is not available"

    if due_date is None:
        due_date = datetime.now(timezone.utc) + timedelta(days=14)
    elif isinstance(due_date, date) and not isinstance(due_date, datetime):
        # Convert naive date to timezone-aware datetime at start of day (UTC)
        due_date = datetime.combine(due_date, datetime.min.time()).replace(tzinfo=timezone.utc)
    elif isinstance(due_date, datetime) and due_date.tzinfo is None:
        # Convert naive datetime to timezone-aware datetime
        due_date = due_date.replace(tzinfo=timezone.utc)

    # Check if user already has this book issued or overdue
    existing_transaction = Transaction.query.filter(
        Transaction.user_id == user_id,
        Transaction.book_id == book_id,
        Transaction.status.in_(['issued', 'overdue'])
    ).first()

    if existing_transaction:
        return False, "User already has this book issued"

    # Atomic decrement — prevents race condition where two concurrent
    # requests issue the last copy, leaving available_copies negative.
    result = db.session.execute(
        db.text(
            "UPDATE books SET available_copies = available_copies - 1 "
            "WHERE id = :id AND available_copies > 0"
        ),
        {"id": book.id}
    )

    if result.rowcount == 0:
        return False, "Book is not available (concurrent checkout)"

    # Create transaction
    transaction = Transaction(
        user_id=user_id,
        book_id=book_id,
        due_date=due_date
    )

    db.session.add(transaction)
    db.session.commit()

    return True, "Book issued successfully"


def return_book(transaction_id):
    """Return a book."""
    transaction = Transaction.query.get_or_404(transaction_id)

    if transaction.status not in ['issued', 'overdue']:
        return False, "Book is not currently issued or overdue"

    # Return the book
    transaction.return_book()

    db.session.commit()

    return True, "Book returned successfully"
