"""
Authentication web routes — login, logout, index redirect.
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash, session

from ..extensions import db
from ..models import User
from ..forms import LoginForm

auth_bp = Blueprint('web', __name__)


@auth_bp.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('web.login'))
    return redirect(url_for('web.dashboard'))


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('web.dashboard'))

    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.check_password(form.password.data) and user.role == 'librarian':
            session['user_id'] = user.id
            session['user_name'] = user.name
            session['user_role'] = user.role
            flash('Login successful!', 'success')
            return redirect(url_for('web.dashboard'))
        else:
            flash('Invalid email or password', 'error')

    return render_template('pages/auth/login.html', form=form)


@auth_bp.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out', 'info')
    return redirect(url_for('web.login'))
