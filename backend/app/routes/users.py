"""
User management web routes.
"""

from flask import request, redirect, url_for, flash, render_template, session, jsonify

from ..extensions import db
from ..models import User, Transaction
from ..forms import UserForm
from ..decorators import login_required, librarian_web_required, debug_only
from .auth import auth_bp


@auth_bp.route('/users')
@librarian_web_required
def users():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')

    query = User.query
    if search:
        query = query.filter(
            (User.name.ilike(f'%{search}%')) |
            (User.email.ilike(f'%{search}%'))
        )

    users = query.paginate(page=page, per_page=10, error_out=False)

    form = UserForm()
    return render_template('pages/management/users.html', users=users, form=form, search=search, current_user_role=session.get('user_role'))


@auth_bp.route('/users/add', methods=['POST'])
@librarian_web_required
def add_user():
    form = UserForm()
    if form.validate_on_submit():
        existing_user = User.query.filter_by(email=form.email.data).first()
        if existing_user:
            flash('Email already exists', 'error')
        else:
            selected_role = form.role.data
            if selected_role not in ['user', 'librarian']:
                flash('Invalid role selected', 'error')
                return redirect(url_for('web.users'))

            try:
                user = User(
                    name=form.name.data,
                    email=form.email.data,
                    role=selected_role,
                )
                user.set_password(form.password.data)
                db.session.add(user)
                db.session.commit()
                flash(f'User added successfully with role: {selected_role}!', 'success')
            except Exception:
                db.session.rollback()
                flash('Error adding user. Please try again.', 'error')
    else:
        for field, errors in form.errors.items():
            for error in errors:
                flash(f'{field}: {error}', 'error')

    return redirect(url_for('web.users'))


@auth_bp.route('/users/delete/<int:user_id>', methods=['POST'])
@librarian_web_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)

    if user.role == 'librarian':
        flash('Cannot delete librarian accounts.', 'error')
        return redirect(url_for('web.users'))

    if user.id == session.get('user_id'):
        flash('Cannot delete your own account.', 'error')
        return redirect(url_for('web.users'))

    try:
        active_transactions = Transaction.query.filter_by(
            user_id=user_id,
            status='issued'
        ).count()

        if active_transactions > 0:
            flash(f'Cannot delete user. They have {active_transactions} active book(s) issued.', 'error')
            return redirect(url_for('web.users'))

        user_name = user.name
        Transaction.query.filter_by(user_id=user_id).delete()
        db.session.delete(user)
        db.session.commit()
        flash(f'User "{user_name}" has been successfully deleted.', 'success')

    except Exception:
        db.session.rollback()
        flash('Error deleting user. Please try again.', 'error')

    return redirect(url_for('web.users'))


@auth_bp.route('/users/<int:user_id>/toggle', methods=['POST'])
@librarian_web_required
def toggle_user_status(user_id):
    user = User.query.get_or_404(user_id)

    if user.role == 'librarian':
        flash('Cannot modify librarian status.', 'error')
        return redirect(url_for('web.users'))

    user.is_active = not user.is_active
    db.session.commit()

    status = 'activated' if user.is_active else 'deactivated'
    flash(f'User {status} successfully!', 'success')

    return redirect(url_for('web.users'))


@auth_bp.route('/users/json')
@login_required
def users_json():
    """JSON endpoint for users dropdown."""
    users = User.query.filter_by(role='user', is_active=True).all()
    user_data = [{'id': u.id, 'name': u.name, 'email': u.email} for u in users]
    return jsonify(user_data)


@auth_bp.route('/debug/users')
@login_required
@debug_only
def debug_users():
    """Debug route — only available when DEBUG=True."""
    users = User.query.all()
    user_data = [{
        'id': u.id,
        'name': u.name,
        'email': u.email,
        'role': u.role,
        'is_active': u.is_active,
        'created_at': u.created_at.strftime('%Y-%m-%d %H:%M:%S') if u.created_at else None,
    } for u in users]

    return jsonify({'total_users': len(user_data), 'users': user_data})
