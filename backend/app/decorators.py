"""
Authentication and authorization decorators.

Web routes : login_required, librarian_web_required
API routes : api_librarian_required, api_user_required
"""

from functools import wraps
from flask import session, redirect, url_for, flash, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt


# ---------------------------------------------------------------------------
# Web (session-based) decorators
# ---------------------------------------------------------------------------

def login_required(fn):
    """Redirect to login page if user is not logged in."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('web.login'))
        return fn(*args, **kwargs)
    return wrapper


def librarian_web_required(fn):
    """Ensure the logged-in user is a librarian (web routes)."""
    @wraps(fn)
    @login_required
    def wrapper(*args, **kwargs):
        if session.get('user_role') != 'librarian':
            flash('Access denied. Librarian privileges required.', 'error')
            return redirect(url_for('web.dashboard'))
        return fn(*args, **kwargs)
    return wrapper


def debug_only(fn):
    """Only register route when app is in debug mode."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not current_app.debug:
            return jsonify({'error': 'Not available'}), 404
        return fn(*args, **kwargs)
    return wrapper


# ---------------------------------------------------------------------------
# API (JWT-based) decorators
# ---------------------------------------------------------------------------

def api_librarian_required(fn):
    """Ensure the JWT token belongs to a librarian."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get('role') != 'librarian':
            return jsonify({'error': 'Librarian access required'}), 403
        return fn(*args, **kwargs)
    return wrapper


def api_user_required(fn):
    """Ensure the JWT token belongs to a regular user."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get('role') != 'user':
            return jsonify({'error': 'User access required'}), 403
        return fn(*args, **kwargs)
    return wrapper
