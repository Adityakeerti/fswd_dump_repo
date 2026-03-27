"""
Backward-compatible re-exports from the services package.

Existing code that does ``from app.utils import ...`` will continue to work.
"""

from .services.book_service import issue_book, return_book
from .services.fine_service import calculate_overdue_fines, update_all_transaction_fines, send_overdue_reminders
from .services.stats_service import get_dashboard_stats

__all__ = [
    'issue_book',
    'return_book',
    'calculate_overdue_fines',
    'update_all_transaction_fines',
    'send_overdue_reminders',
    'get_dashboard_stats',
]
