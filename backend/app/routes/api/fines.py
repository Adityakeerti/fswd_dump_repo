"""
API fine endpoints.
"""

from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timezone

from ...models import Transaction
from ...utils import calculate_overdue_fines, update_all_transaction_fines
from ...decorators import api_user_required, api_librarian_required
from . import api_bp


@api_bp.route('/user/fines', methods=['GET'])
@api_user_required
def user_fines():
    user_id = int(get_jwt_identity())
    calculate_overdue_fines()

    transactions = Transaction.query.filter(
        Transaction.user_id == user_id,
        Transaction.fine_amount > 0
    ).order_by(Transaction.due_date.desc()).all()

    fines = []
    for tx in transactions:
        status = 'pending' if tx.status in ('issued', 'overdue') else 'paid'
        fines.append({
            'id': tx.id,
            'amount': float(tx.fine_amount) if tx.fine_amount else 0.0,
            'reason': f"Fine for '{tx.book.title}'",
            'date': (tx.due_date or tx.issue_date or datetime.now(timezone.utc)).isoformat(),
            'status': status,
        })

    return jsonify({'fines': fines}), 200


@api_bp.route('/fines/update', methods=['POST'])
@api_librarian_required
def update_fines():
    """Manually update all transaction fines."""
    updated_count = update_all_transaction_fines()
    return jsonify({
        'success': True,
        'message': f'Updated {updated_count} transactions with current fines',
    })
