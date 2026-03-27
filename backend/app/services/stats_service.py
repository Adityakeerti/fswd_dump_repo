"""
Dashboard statistics aggregation.
"""

from datetime import datetime, timezone, timedelta

from sqlalchemy import func

from ..extensions import db
from ..models import Transaction, User, Book, Category


def get_dashboard_stats():
    """Get statistics for the dashboard."""
    now = datetime.now(timezone.utc)

    # Basic counts
    total_books = Book.query.count()
    total_users = User.query.filter_by(role='user').count()
    issued_books = Transaction.query.filter(Transaction.status == 'issued').count()
    overdue_books = Transaction.query.filter(Transaction.status == 'overdue').count()
    total_fines = db.session.query(func.sum(Transaction.fine_amount)).scalar() or 0

    # Calculate total copies and available copies
    total_copies = db.session.query(func.sum(Book.total_copies)).scalar() or 0
    available_copies = db.session.query(func.sum(Book.available_copies)).scalar() or 0

    # Calculate availability percentage
    availability_percentage = round((available_copies / total_copies * 100), 1) if total_copies > 0 else 0

    # Get new users this week
    one_week_ago = now - timedelta(days=7)
    new_users_this_week = User.query.filter(
        User.created_at >= one_week_ago,
        User.role == 'user'
    ).count()

    # Get monthly circulation data for the last 10 months
    circulation_data = []
    for i in range(9, -1, -1):
        month_start = now.replace(day=1) - timedelta(days=30 * i)
        month_end = month_start + timedelta(days=30)

        issued_count = Transaction.query.filter(
            Transaction.issue_date >= month_start,
            Transaction.issue_date < month_end
        ).count()

        returned_count = Transaction.query.filter(
            Transaction.return_date >= month_start,
            Transaction.return_date < month_end,
            Transaction.status == 'returned'
        ).count()

        circulation_data.append({
            'month': month_start.strftime('%b'),
            'issued': issued_count,
            'returned': returned_count
        })

    # Get top 5 categories by borrow count
    category_stats = db.session.query(
        Category.name,
        func.count(Transaction.id).label('borrow_count')
    ).join(Book, Book.category_id == Category.id) \
     .join(Transaction, Transaction.book_id == Book.id) \
     .group_by(Category.id, Category.name) \
     .order_by(func.count(Transaction.id).desc()) \
     .limit(5) \
     .all()

    stats = {
        'total_books': total_books,
        'total_copies': total_copies,
        'available_copies': available_copies,
        'availability_percentage': availability_percentage,
        'total_users': total_users,
        'new_users_this_week': new_users_this_week,
        'total_issued': issued_books,
        'overdue_count': overdue_books,
        'total_fines': round(float(total_fines), 2),
        'circulation_data': circulation_data,
        'category_stats': [{'name': name, 'count': count} for name, count in category_stats]
    }
    return stats
