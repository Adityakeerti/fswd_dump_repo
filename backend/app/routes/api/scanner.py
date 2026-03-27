"""
API scanner endpoints — mobile scan, issue/return via barcode, quick scan, latest scan, test.
"""

from flask import request, jsonify, session
from flask_jwt_extended import jwt_required
from datetime import datetime, timezone

from ...extensions import db, csrf
from ...models import Book, User, Transaction
from ...utils import issue_book, return_book
from ...decorators import login_required
from . import api_bp
from ...scan_store import set_latest_scan, get_latest_scan, clear_latest_scan


@api_bp.route('/scan', methods=['POST', 'OPTIONS'])
@csrf.exempt
def mobile_scan():
    """Process scanned barcode from mobile scanner."""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response

    try:
        data = request.get_json()
        if not data:
            response = jsonify({'error': 'No JSON data provided'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400

        code = data.get('code')
        code_type = data.get('type', 'BARCODE')

        if not code:
            response = jsonify({'error': 'No code provided'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400

        # Try to find book by ISBN or barcode_id
        book = Book.query.filter(
            (Book.isbn == code) | (Book.barcode_id == code)
        ).first()

        if book:
            active_transaction = Transaction.query.filter(
                Transaction.book_id == book.id,
                Transaction.status.in_(['issued', 'overdue'])
            ).first()

            book_info = {
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'barcode_id': book.barcode_id,
                'isbn': book.isbn,
                'total_copies': book.total_copies,
                'available_copies': book.available_copies,
                'is_available': book.is_available(),
            }

            result = {
                'found': True,
                'book_info': book_info,
                'transaction_info': None,
                'action': 'issue' if book.is_available() else 'unavailable',
            }

            if active_transaction:
                result['transaction_info'] = {
                    'id': active_transaction.id,
                    'user_name': active_transaction.user.name,
                    'issue_date': active_transaction.issue_date.isoformat() if active_transaction.issue_date else None,
                    'due_date': active_transaction.due_date.isoformat() if active_transaction.due_date else None,
                }
                result['action'] = 'return'

            # Store in scan store for dashboard polling
            set_latest_scan(book.id, book_info, code)

            response = jsonify(result)
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        else:
            response = jsonify({'found': False, 'message': f'No book found with barcode: {code}'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response

    except Exception as e:
        response = jsonify({'error': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500


@api_bp.route('/scan/issue', methods=['POST'])
@csrf.exempt
def scan_issue_book():
    """Issue book using scanned barcode."""
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401

    try:
        data = request.get_json()
        user_id = data.get('user_id')
        barcode_id = data.get('barcode_id')

        if not user_id or not barcode_id:
            return jsonify({'success': False, 'error': 'user_id and barcode_id required'}), 400

        book = Book.query.filter_by(barcode_id=barcode_id).first()
        if not book:
            return jsonify({'success': False, 'error': 'Book not found'}), 404

        success, message = issue_book(user_id, book.id)

        if success:
            return jsonify({'success': True, 'message': message})
        else:
            return jsonify({'success': False, 'error': message}), 400

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api_bp.route('/scan/return', methods=['POST'])
@csrf.exempt
def scan_return_book():
    """Return book using scanned barcode."""
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401

    try:
        data = request.get_json()
        barcode_id = data.get('barcode_id')

        if not barcode_id:
            return jsonify({'success': False, 'error': 'barcode_id required'}), 400

        book = Book.query.filter_by(barcode_id=barcode_id).first()
        if not book:
            return jsonify({'success': False, 'error': 'Book not found'}), 404

        transaction = Transaction.query.filter(
            Transaction.book_id == book.id,
            Transaction.status.in_(['issued', 'overdue'])
        ).first()

        if not transaction:
            return jsonify({'success': False, 'error': 'This book is not currently issued'}), 400

        success, message = return_book(transaction.id)

        if success:
            return jsonify({'success': True, 'message': message})
        else:
            return jsonify({'success': False, 'error': message}), 400

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# --- Quick scan (JWT-protected) ---

@api_bp.route('/quick-scan', methods=['POST'])
@jwt_required()
def quick_scan():
    """Handle quick scan input for books or users."""
    data = request.get_json()

    if not data or 'value' not in data:
        return jsonify({'error': 'Scan value required'}), 400

    scan_value = data['value'].strip()
    now = datetime.now(timezone.utc)

    try:
        if scan_value.upper().startswith('BOOK'):
            book_id = scan_value.upper().replace('BOOK', '').strip()
            if not book_id.isdigit():
                return jsonify({'error': 'Invalid book ID format'}), 400

            book_id = int(book_id)
            book = Book.query.get(book_id)
            if not book:
                return jsonify({'error': f'Book with ID {book_id} not found'}), 404

            kind = 'book_available' if book.available_copies > 0 else 'book_unavailable'
            action = 'checkout' if book.available_copies > 0 else 'unavailable'
            msg = f'Book "{book.title}" is {"available for checkout" if action == "checkout" else "not available (0 copies left)"}'

            return jsonify({
                'success': True, 'type': kind, 'message': msg,
                'book_id': book.id, 'book_title': book.title,
                'available_copies': book.available_copies, 'action': action,
            })

        elif scan_value.isdigit() and len(scan_value) == 7:
            user_id = int(scan_value)
            user = User.query.get(user_id)
            if not user:
                return jsonify({'error': f'User with ID {user_id} not found'}), 404

            current_transactions = Transaction.query.filter(
                Transaction.user_id == user_id,
                Transaction.status.in_(['issued', 'overdue'])
            ).all()

            if current_transactions:
                transaction_list = [{
                    'id': t.id, 'book_title': t.book.title, 'book_id': t.book_id,
                    'due_date': t.due_date.isoformat() if t.due_date else None,
                    'days_overdue': max(0, (now - t.due_date).days) if t.due_date and t.due_date < now else 0,
                } for t in current_transactions]

                return jsonify({
                    'success': True, 'type': 'user_transactions',
                    'message': f'User "{user.name}" has {len(current_transactions)} active transactions',
                    'user_id': user.id, 'user_name': user.name,
                    'transactions': transaction_list, 'action': 'return',
                })
            else:
                return jsonify({
                    'success': True, 'type': 'user_no_transactions',
                    'message': f'User "{user.name}" has no active transactions',
                    'user_id': user.id, 'user_name': user.name, 'action': 'checkout',
                })

        elif scan_value.isdigit():
            book_id = int(scan_value)
            book = Book.query.get(book_id)
            if not book:
                return jsonify({'error': f'Book with ID {book_id} not found'}), 404

            kind = 'book_available' if book.available_copies > 0 else 'book_unavailable'
            action = 'checkout' if book.available_copies > 0 else 'unavailable'
            msg = f'Book "{book.title}" is {"available for checkout" if action == "checkout" else "not available (0 copies left)"}'

            return jsonify({
                'success': True, 'type': kind, 'message': msg,
                'book_id': book.id, 'book_title': book.title,
                'available_copies': book.available_copies, 'action': action,
            })

        else:
            return jsonify({'error': 'Invalid scan format. Use BOOK123, 7-digit user ID, or book ID'}), 400

    except ValueError:
        return jsonify({'error': 'Invalid ID format'}), 400
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


# --- Latest scan and test ---

@api_bp.route('/latest-scan', methods=['GET'])
@jwt_required()
def get_latest_scan_data():
    """Get the most recent scan for dashboard polling."""
    scan_data = get_latest_scan()
    return jsonify(scan_data)


@api_bp.route('/clear-scan', methods=['POST'])
@jwt_required()
def clear_scan_data():
    """Clear the latest scan data after it's been used."""
    clear_latest_scan()
    return jsonify({'success': True})


@api_bp.route('/update-latest-scan', methods=['POST', 'OPTIONS'])
@csrf.exempt
def update_latest_scan():
    """Update the latest scan data from mobile scanner."""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response

    try:
        # In production, store in Redis or DB instead of memory
        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    except Exception as e:
        response = jsonify({'error': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500


@api_bp.route('/test', methods=['GET', 'OPTIONS'])
def test_connection():
    """Simple test endpoint for mobile scanner."""
    response = jsonify({'status': 'ok', 'message': 'Backend connected'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return response
