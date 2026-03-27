"""
Database models for Pustak Tracker — Library Management System.

All models are kept in sync with the live MySQL schema.
"""

from datetime import datetime, timezone, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from .extensions import db


def _utcnow():
    """Return timezone-aware UTC now."""
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), default='user')  # 'user' or 'librarian'
    membership_id = db.Column(db.String(100), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=_utcnow)
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow)

    # Relationships
    transactions = db.relationship('Transaction', backref='user', lazy=True)
    reservations = db.relationship('Reservation', backref='user', lazy=True)

    __table_args__ = (
        db.Index('idx_users_role_active', 'role', 'is_active'),
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ---------------------------------------------------------------------------
# Category
# ---------------------------------------------------------------------------
class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=_utcnow)
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow)

    # Relationships
    books = db.relationship('Book', backref='category', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ---------------------------------------------------------------------------
# Book
# ---------------------------------------------------------------------------
class Book(db.Model):
    __tablename__ = 'books'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(255), nullable=False)
    publisher = db.Column(db.String(255))
    isbn = db.Column(db.String(50), unique=True)
    barcode_id = db.Column(db.String(50), unique=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    description = db.Column(db.Text)           # Exists in live DB
    cover_url = db.Column(db.Text)             # Exists in live DB
    total_copies = db.Column(db.Integer, nullable=False, default=1)
    available_copies = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, default=_utcnow)
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow)

    # Relationships
    transactions = db.relationship('Transaction', backref='book', lazy=True)
    reservations = db.relationship('Reservation', backref='book', lazy=True)

    __table_args__ = (
        db.Index('idx_books_available', 'available_copies'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'publisher': self.publisher,
            'isbn': self.isbn,
            'barcode_id': self.barcode_id,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'description': self.description,
            'total_copies': self.total_copies,
            'available_copies': self.available_copies,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def is_available(self):
        return self.available_copies > 0


# ---------------------------------------------------------------------------
# Transaction
# ---------------------------------------------------------------------------
class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    issue_date = db.Column(db.DateTime, default=_utcnow)
    due_date = db.Column(db.DateTime, nullable=False)
    return_date = db.Column(db.DateTime)
    fine_amount = db.Column(db.Numeric(10, 2), default=0.00)
    status = db.Column(db.String(50), nullable=False, default='issued')  # issued, returned, overdue
    created_at = db.Column(db.DateTime, default=_utcnow)
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow)

    __table_args__ = (
        db.Index('idx_txn_status', 'status'),
        db.Index('idx_txn_user_status', 'user_id', 'status'),
        db.Index('idx_txn_book_status', 'book_id', 'status'),
    )

    def __init__(self, **kwargs):
        super(Transaction, self).__init__(**kwargs)
        if not self.due_date:
            self.due_date = _utcnow() + timedelta(days=14)

    def _ensure_aware(self, dt):
        """Ensure datetime is timezone-aware (UTC)."""
        if dt is None:
            return None
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt

    def calculate_fine(self, fine_rate=5):
        """Calculate fine based on overdue days."""
        now = _utcnow()
        due_date = self._ensure_aware(self.due_date)
        return_date = self._ensure_aware(self.return_date)
        
        if return_date:
            if return_date > due_date:
                overdue_days = (return_date - due_date).days
                self.fine_amount = overdue_days * fine_rate
            else:
                self.fine_amount = 0.00
        else:
            if now > due_date:
                overdue_days = (now - due_date).days
                self.fine_amount = overdue_days * fine_rate
                self.status = 'overdue'
            else:
                self.fine_amount = 0.00
        return self.fine_amount

    def return_book(self):
        """Mark book as returned and calculate fine."""
        self.return_date = _utcnow()
        self.calculate_fine()
        self.status = 'returned'
        self.book.available_copies += 1

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'book_id': self.book_id,
            'book_title': self.book.title if self.book else None,
            'issue_date': self.issue_date.isoformat() if self.issue_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'return_date': self.return_date.isoformat() if self.return_date else None,
            'fine_amount': float(self.fine_amount) if self.fine_amount else 0.0,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ---------------------------------------------------------------------------
# Reservation
# ---------------------------------------------------------------------------
class Reservation(db.Model):
    __tablename__ = 'reservations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='pending')  # pending, cancelled, fulfilled
    created_at = db.Column(db.DateTime, default=_utcnow)
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow)

    __table_args__ = (
        db.Index('idx_res_user_book_status', 'user_id', 'book_id', 'status'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'book_id': self.book_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ---------------------------------------------------------------------------
# Fine  (matches existing `fines` table in live DB)
# ---------------------------------------------------------------------------
class Fine(db.Model):
    __tablename__ = 'fines'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    borrowed_book_id = db.Column(db.Integer, nullable=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    reason = db.Column(db.String(255), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='pending')
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow)

    # Relationship
    user = db.relationship('User', backref='fines', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amount': float(self.amount),
            'reason': self.reason,
            'date': self.date.isoformat() if self.date else None,
            'status': self.status,
        }


# ---------------------------------------------------------------------------
# Notification  (matches existing `notifications` table in live DB)
# ---------------------------------------------------------------------------
class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)
    seen = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, default=_utcnow)
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow)

    # Relationship
    user = db.relationship('User', backref='notifications', lazy=True)

    __table_args__ = (
        db.Index('idx_notif_user', 'user_id', 'seen'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'body': self.body,
            'type': self.type,
            'seen': self.seen,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
