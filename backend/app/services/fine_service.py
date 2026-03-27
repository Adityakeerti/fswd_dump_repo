"""
Fine calculation and overdue reminder logic.
"""

from datetime import datetime, timezone

from flask import current_app

from ..extensions import db
from ..models import Transaction


def calculate_overdue_fines():
    """Calculate fines for all overdue transactions and update their status."""
    now = datetime.now(timezone.utc)
    overdue_transactions = Transaction.query.filter(
        Transaction.status == 'issued',
        Transaction.due_date < now
    ).all()

    fine_rate = current_app.config.get('FINE_RATE', 5)
    updated_count = 0

    for transaction in overdue_transactions:
        old_fine = transaction.fine_amount
        old_status = transaction.status

        transaction.calculate_fine(fine_rate)

        if transaction.fine_amount != old_fine or old_status != transaction.status:
            updated_count += 1

    db.session.commit()
    return updated_count


def update_all_transaction_fines():
    """Update fines for all active transactions (issued and overdue)."""
    active_transactions = Transaction.query.filter(
        Transaction.status.in_(['issued', 'overdue'])
    ).all()

    fine_rate = current_app.config.get('FINE_RATE', 5)
    updated_count = 0

    for transaction in active_transactions:
        old_fine = transaction.fine_amount
        old_status = transaction.status

        transaction.calculate_fine(fine_rate)

        if transaction.fine_amount != old_fine or old_status != transaction.status:
            updated_count += 1

    db.session.commit()
    return updated_count


def send_overdue_reminders():
    """Send reminders for overdue books (placeholder for email functionality)."""
    overdue_transactions = Transaction.query.filter(
        Transaction.status == 'overdue'
    ).all()

    reminders_sent = 0
    for transaction in overdue_transactions:
        print(f"REMINDER: {transaction.user.name} has overdue book '{transaction.book.title}' "
              f"due on {transaction.due_date.strftime('%Y-%m-%d')}. "
              f"Fine: ₹{transaction.fine_amount}")
        reminders_sent += 1

    return reminders_sent
