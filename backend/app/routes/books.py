"""
Book management web routes.
"""

from flask import request, redirect, url_for, flash, render_template

from ..extensions import db
from ..models import Book, Transaction, Category
from ..forms import BookForm
from ..decorators import login_required
from .auth import auth_bp


@auth_bp.route('/books')
@login_required
def books():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')

    query = Book.query
    if search:
        like_query = f'%{search}%'
        query = query.filter(
            (Book.title.ilike(like_query)) |
            (Book.author.ilike(like_query)) |
            (Book.isbn.ilike(like_query))
        )

    books = query.paginate(page=page, per_page=10, error_out=False)

    form = BookForm()
    categories = Category.query.all()
    return render_template('pages/management/books.html', books=books, form=form, search=search, categories=categories)


@auth_bp.route('/books/add', methods=['POST'])
@login_required
def add_book():
    form = BookForm()
    if form.validate_on_submit():
        book = Book(
            title=form.title.data,
            author=form.author.data,
            publisher=form.publisher.data,
            isbn=form.isbn.data,
            category_id=form.category_id.data,
            total_copies=form.total_copies.data,
            available_copies=form.total_copies.data,
        )
        db.session.add(book)
        db.session.commit()
        flash('Book added successfully!', 'success')
    else:
        for field, errors in form.errors.items():
            for error in errors:
                flash(f'{field}: {error}', 'error')

    return redirect(url_for('web.books'))


@auth_bp.route('/books/<int:book_id>/edit', methods=['POST'])
@login_required
def edit_book(book_id):
    book = Book.query.get_or_404(book_id)
    form = BookForm()

    if form.validate_on_submit():
        book.title = form.title.data
        book.author = form.author.data
        book.publisher = form.publisher.data
        book.isbn = form.isbn.data
        book.category_id = form.category_id.data

        # Adjust available copies if total copies changed
        old_total = book.total_copies
        book.total_copies = form.total_copies.data
        if form.total_copies.data > old_total:
            book.available_copies += (form.total_copies.data - old_total)
        elif form.total_copies.data < old_total:
            book.available_copies = max(0, book.available_copies - (old_total - form.total_copies.data))

        db.session.commit()
        flash('Book updated successfully!', 'success')
    else:
        for field, errors in form.errors.items():
            for error in errors:
                flash(f'{field}: {error}', 'error')

    return redirect(url_for('web.books'))


@auth_bp.route('/books/<int:book_id>/delete', methods=['POST'])
@login_required
def delete_book(book_id):
    try:
        book = Book.query.get_or_404(book_id)

        # Check if book has active transactions
        active_transactions = Transaction.query.filter(
            Transaction.book_id == book_id,
            Transaction.status == 'issued'
        ).count()

        if active_transactions > 0:
            flash('Cannot delete book with active transactions', 'error')
        else:
            db.session.delete(book)
            db.session.commit()
            flash('Book deleted successfully!', 'success')

    except Exception as e:
        flash(f'Error deleting book: {str(e)}', 'error')

    return redirect(url_for('web.books'))
