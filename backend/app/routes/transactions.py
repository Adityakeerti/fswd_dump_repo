"""
Transaction management web routes — issue, return, overdue.
"""

from flask import request, redirect, url_for, flash, render_template

from ..extensions import db
from ..models import User, Book, Transaction
from ..forms import IssueBookForm, ReturnBookForm
from ..utils import issue_book, return_book, calculate_overdue_fines, update_all_transaction_fines, get_dashboard_stats
from ..decorators import login_required
from .auth import auth_bp

from datetime import datetime, timezone, timedelta


@auth_bp.route('/dashboard')
@login_required
def dashboard():
    update_all_transaction_fines()

    stats = get_dashboard_stats()

    recent_transactions = Transaction.query.order_by(Transaction.created_at.desc()).limit(10).all()

    three_days_from_now = datetime.now(timezone.utc) + timedelta(days=3)
    due_soon_books = Transaction.query.filter(
        Transaction.status.in_(['issued', 'overdue']),
        Transaction.due_date <= three_days_from_now
    ).order_by(Transaction.due_date.asc()).limit(5).all()

    return render_template('pages/management/dashboard.html',
                           stats=stats,
                           recent_transactions=recent_transactions,
                           due_soon_books=due_soon_books)


@auth_bp.route('/transactions')
@login_required
def transactions():
    update_all_transaction_fines()

    page = request.args.get('page', 1, type=int)
    status_filter = request.args.get('status', '')

    query = Transaction.query
    if status_filter:
        query = query.filter(Transaction.status == status_filter)

    transactions = query.order_by(Transaction.created_at.desc()).paginate(
        page=page, per_page=10, error_out=False
    )

    issue_form = IssueBookForm()
    return_form = ReturnBookForm()

    issue_form.user_id.choices = [(u.id, u.name) for u in User.query.filter_by(role='user', is_active=True).all()]
    issue_form.book_id.choices = [(b.id, f"{b.title} by {b.author}") for b in Book.query.filter(Book.available_copies > 0).all()]
    return_form.transaction_id.choices = [(t.id, f"{t.user.name} - {t.book.title}") for t in Transaction.query.filter(Transaction.status.in_(['issued', 'overdue'])).all()]

    return render_template('pages/management/transactions.html',
                           transactions=transactions,
                           issue_form=issue_form,
                           return_form=return_form,
                           status_filter=status_filter)


@auth_bp.route('/transactions/issue', methods=['POST'])
@login_required
def issue_transaction():
    form = IssueBookForm()

    form.user_id.choices = [(u.id, u.name) for u in User.query.filter_by(role='user', is_active=True).all()]
    form.book_id.choices = [(b.id, f"{b.title} by {b.author}") for b in Book.query.filter(Book.available_copies > 0).all()]

    if form.validate_on_submit():
        success, message = issue_book(
            form.user_id.data,
            form.book_id.data,
            form.due_date.data,
        )
        if success:
            flash(message, 'success')
        else:
            flash(message, 'error')
    else:
        for field, errors in form.errors.items():
            for error in errors:
                flash(f'{field}: {error}', 'error')

    return redirect(url_for('web.transactions'))


@auth_bp.route('/transactions/return', methods=['POST'])
@login_required
def return_transaction():
    form = ReturnBookForm()

    form.transaction_id.choices = [(t.id, f"{t.user.name} - {t.book.title}") for t in Transaction.query.filter(Transaction.status.in_(['issued', 'overdue'])).all()]

    if form.validate_on_submit():
        success, message = return_book(form.transaction_id.data)
        if success:
            flash(message, 'success')
        else:
            flash(message, 'error')
    else:
        for field, errors in form.errors.items():
            for error in errors:
                flash(f'{field}: {error}', 'error')

    return redirect(url_for('web.transactions'))


@auth_bp.route('/overdue')
@login_required
def overdue():
    update_all_transaction_fines()

    page = request.args.get('page', 1, type=int)
    overdue_transactions = Transaction.query.filter(
        Transaction.status == 'overdue'
    ).order_by(Transaction.due_date.asc()).paginate(
        page=page, per_page=10, error_out=False
    )

    return render_template('pages/management/overdue.html', overdue_transactions=overdue_transactions)


@auth_bp.route('/overdue/recalculate', methods=['POST'])
@login_required
def recalculate_overdue_fines():
    try:
        updated_count = calculate_overdue_fines()
        flash(f'Overdue fines recalculated successfully! Updated {updated_count} transactions.', 'success')
    except Exception as e:
        flash(f'Error recalculating fines: {str(e)}', 'error')

    return redirect(url_for('web.overdue'))
