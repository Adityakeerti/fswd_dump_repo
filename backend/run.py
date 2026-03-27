#!/usr/bin/env python3
"""
Pustak Tracker — Library Management System
Application entry point.
"""

import os
from app import create_app
from app.extensions import db
from app.models import User, Book, Transaction, Category, Reservation, Fine, Notification

app = create_app()


@app.shell_context_processor
def make_shell_context():
    """Make database models available in Flask shell."""
    return {
        'db': db,
        'User': User,
        'Book': Book,
        'Transaction': Transaction,
        'Category': Category,
        'Reservation': Reservation,
        'Fine': Fine,
        'Notification': Notification,
    }


def _get_local_ip():
    """Get local IP address."""
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return 'localhost'


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    is_dev = os.getenv('FLASK_ENV') != 'production'
    local_ip = _get_local_ip()

    if is_dev:
        print("\n" + "=" * 70)
        print("  Pustak Tracker - Library Management System")
        print("=" * 70)
        print(f"\n  🌐 Access URLs:")
        print(f"     Desktop:  https://localhost:5173")
        print(f"     Mobile:   https://{local_ip}:5173/login")
        print(f"\n  🔑 Login:     librarian@pustak.com / admin123")
        print("\n" + "=" * 70 + "\n")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=is_dev,
        ssl_context=('cert.pem', 'key.pem') if is_dev else None,
    )
