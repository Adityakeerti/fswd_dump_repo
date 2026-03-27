"""
API notification endpoints for mobile users.
"""

from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timezone

from ...models import Transaction, Reservation, Notification
from ...extensions import db
from ...decorators import api_user_required
from . import api_bp


@api_bp.route('/user/notifications', methods=['GET'])
@api_user_required
def user_notifications():
    user_id = int(get_jwt_identity())
    now = datetime.now(timezone.utc)

    notifications = []

    # Check DB notifications first
    db_notifications = Notification.query.filter_by(user_id=user_id).order_by(
        Notification.created_at.desc()
    ).limit(50).all()

    for notif in db_notifications:
        notifications.append({
            'id': notif.id,
            'title': notif.title,
            'body': notif.body,
            'type': notif.type,
            'created_at': notif.created_at.isoformat() if notif.created_at else None,
            'seen': notif.seen,
        })

    # Also generate dynamic notifications from transactions
    transactions = Transaction.query.filter(Transaction.user_id == user_id).all()

    for tx in transactions:
        due_date = tx.due_date
        if not due_date:
            continue

        if tx.status == 'overdue':
            notif_id = tx.id * 10 + 1
            notifications.append({
                'id': notif_id,
                'title': 'Overdue Book',
                'body': f"'{tx.book.title}' is overdue. Please return it as soon as possible.",
                'type': 'overdue',
                'created_at': due_date.isoformat(),
                'seen': False,
            })

        if tx.status in ('issued', 'reserved'):
            days_left = (due_date - now).days
            if 0 <= days_left <= 3:
                notif_id = tx.id * 10 + 2
                notifications.append({
                    'id': notif_id,
                    'title': 'Return Reminder',
                    'body': f"'{tx.book.title}' is due in {days_left} day(s).",
                    'type': 'reminder',
                    'created_at': now.isoformat(),
                    'seen': False,
                })

    reservations = Reservation.query.filter_by(user_id=user_id, status='pending').all()

    for reservation in reservations:
        notif_id = reservation.id * 10 + 5
        notifications.append({
            'id': notif_id,
            'title': 'Reservation Confirmed',
            'body': f"You reserved '{reservation.book.title if reservation.book else 'a book'}'. We will hold it for 3 days.",
            'type': 'reservation',
            'created_at': reservation.created_at.isoformat() if reservation.created_at else None,
            'seen': False,
        })

    notifications.sort(key=lambda n: n['created_at'] or '', reverse=True)

    return jsonify({'notifications': notifications}), 200


@api_bp.route('/user/notifications/<int:notification_id>/read', methods=['PUT'])
@api_user_required
def mark_notification_read(notification_id):
    user_id = int(get_jwt_identity())

    # Try to mark a DB notification as read
    notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if notif:
        notif.seen = True
        db.session.commit()

    return jsonify({'success': True}), 200
