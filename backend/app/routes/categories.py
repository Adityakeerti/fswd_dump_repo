"""
Category management web routes.
"""

from flask import redirect, url_for, flash, render_template

from ..extensions import db
from ..models import Category
from ..forms import CategoryForm
from ..decorators import login_required
from .auth import auth_bp


@auth_bp.route('/categories')
@login_required
def categories():
    categories = Category.query.all()
    form = CategoryForm()
    return render_template('pages/management/categories.html', categories=categories, form=form)


@auth_bp.route('/categories/add', methods=['POST'])
@login_required
def add_category():
    form = CategoryForm()
    if form.validate_on_submit():
        category = Category(
            name=form.name.data,
            description=form.description.data,
        )
        db.session.add(category)
        db.session.commit()
        flash('Category added successfully!', 'success')
    else:
        for field, errors in form.errors.items():
            for error in errors:
                flash(f'{field}: {error}', 'error')

    return redirect(url_for('web.categories'))


@auth_bp.route('/categories/<int:category_id>/delete', methods=['POST'])
@login_required
def delete_category(category_id):
    category = Category.query.get_or_404(category_id)

    if category.books:
        flash('Cannot delete category with books', 'error')
    else:
        db.session.delete(category)
        db.session.commit()
        flash('Category deleted successfully!', 'success')

    return redirect(url_for('web.categories'))
