"""
Barcode scanner web routes — mobile scanner, quick scan, barcode lookup.
"""

import os

from flask import request, redirect, url_for, jsonify, session, send_from_directory, render_template
from datetime import datetime, timezone

from ..extensions import csrf
from ..models import Book, User, Transaction
from ..decorators import login_required
from .auth import auth_bp


@auth_bp.route('/mobile_scanner.html')
def mobile_scanner():
    """Serve mobile scanner HTML."""
    backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    return send_from_directory(backend_root, 'mobile_scanner.html')


@auth_bp.route('/scan')
@login_required
def scanner():
    """Render the barcode scanner page."""
    return render_template('pages/scanner.html')


@auth_bp.route('/api/barcode/<barcode>')
@login_required
def lookup_barcode(barcode):
    """Look up a book by barcode/ISBN."""
    try:
        clean_barcode = barcode.strip().replace('-', '').replace(' ', '')
        book = Book.query.filter_by(isbn=clean_barcode).first()

        if book:
            return jsonify({
                'found': True,
                'book': {
                    'id': book.id,
                    'title': book.title,
                    'author': book.author,
                    'publisher': book.publisher,
                    'isbn': book.isbn,
                    'category_name': book.category.name if book.category else None,
                    'total_copies': book.total_copies,
                    'available_copies': book.available_copies,
                    'is_available': book.is_available(),
                    'status': 'Available' if book.is_available() else 'Not Available',
                },
            })
        else:
            return jsonify({
                'found': False,
                'message': f'No book found with ISBN: {barcode}',
            })

    except Exception as e:
        return jsonify({
            'found': False,
            'error': f'Error looking up barcode: {str(e)}',
        }), 500


@auth_bp.route('/quick-scan', methods=['POST'])
@csrf.exempt
def quick_scan_web():
    """Handle quick scan input for books or users (web version without JWT)."""
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401

    data = request.get_json()

    if not data or 'value' not in data:
        return jsonify({'error': 'Scan value required'}), 400

    scan_value = data['value'].strip()

    try:
        # Check if it's a book scan (starts with BOOK)
        if scan_value.upper().startswith('BOOK'):
            book_id = scan_value.upper().replace('BOOK', '').strip()
            if not book_id.isdigit():
                return jsonify({'error': 'Invalid book ID format'}), 400

            book_id = int(book_id)
            book = Book.query.get(book_id)

            if not book:
                return jsonify({'error': f'Book with ID {book_id} not found'}), 404

            if book.available_copies > 0:
                return jsonify({
                    'success': True,
                    'type': 'book_available',
                    'message': f'Book "{book.title}" is available for checkout',
                    'book_id': book.id,
                    'book_title': book.title,
                    'available_copies': book.available_copies,
                    'action': 'checkout',
                })
            else:
                return jsonify({
                    'success': True,
                    'type': 'book_unavailable',
                    'message': f'Book "{book.title}" is not available (0 copies left)',
                    'book_id': book.id,
                    'book_title': book.title,
                    'available_copies': book.available_copies,
                    'action': 'unavailable',
                })

        # Check if it's a user scan (7-digit number)
        elif scan_value.isdigit() and len(scan_value) == 7:
            user_id = int(scan_value)
            user = User.query.get(user_id)

            if not user:
                return jsonify({'error': f'User with ID {user_id} not found'}), 404

            now = datetime.now(timezone.utc)
            current_transactions = Transaction.query.filter(
                Transaction.user_id == user_id,
                Transaction.status == 'issued'
            ).all()

            if current_transactions:
                transaction_list = [{
                    'id': trans.id,
                    'book_title': trans.book.title,
                    'book_id': trans.book_id,
                    'due_date': trans.due_date.isoformat(),
                    'days_overdue': max(0, (now - trans.due_date).days) if trans.due_date < now else 0,
                } for trans in current_transactions]

                return jsonify({
                    'success': True,
                    'type': 'user_transactions',
                    'message': f'User "{user.name}" has {len(current_transactions)} active transactions',
                    'user_id': user.id,
                    'user_name': user.name,
                    'transactions': transaction_list,
                    'action': 'return',
                })
            else:
                return jsonify({
                    'success': True,
                    'type': 'user_no_transactions',
                    'message': f'User "{user.name}" has no active transactions',
                    'user_id': user.id,
                    'user_name': user.name,
                    'action': 'checkout',
                })

        # Check if it's a regular book ID (just a number)
        elif scan_value.isdigit():
            book_id = int(scan_value)
            book = Book.query.get(book_id)

            if not book:
                return jsonify({'error': f'Book with ID {book_id} not found'}), 404

            if book.available_copies > 0:
                return jsonify({
                    'success': True,
                    'type': 'book_available',
                    'message': f'Book "{book.title}" is available for checkout',
                    'book_id': book.id,
                    'book_title': book.title,
                    'available_copies': book.available_copies,
                    'action': 'checkout',
                })
            else:
                return jsonify({
                    'success': True,
                    'type': 'book_unavailable',
                    'message': f'Book "{book.title}" is not available (0 copies left)',
                    'book_id': book.id,
                    'book_title': book.title,
                    'available_copies': book.available_copies,
                    'action': 'unavailable',
                })

        else:
            return jsonify({'error': 'Invalid scan format. Use BOOK123, 7-digit user ID, or book ID'}), 400

    except ValueError:
        return jsonify({'error': 'Invalid ID format'}), 400
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500
