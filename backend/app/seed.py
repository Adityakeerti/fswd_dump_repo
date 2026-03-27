"""
Database seeding and CLI helper commands.

Extracted from run.py to keep the entry point slim.
"""

from .extensions import db
from .models import User, Book, Category


def register_cli_commands(app):
    """Register all CLI commands with the Flask app."""

    @app.cli.command()
    def init_db():
        """Initialize the database with sample data."""
        print("Initializing database...")

        db.create_all()

        # Default categories
        categories = [
            Category(name='Fiction', description='Fictional books and novels'),
            Category(name='Non-Fiction', description='Non-fictional books'),
            Category(name='Science', description='Science and technology books'),
            Category(name='History', description='Historical books'),
            Category(name='Biography', description='Biographical books'),
            Category(name='Reference', description='Reference materials and dictionaries'),
        ]

        for category in categories:
            existing = Category.query.filter_by(name=category.name).first()
            if not existing:
                db.session.add(category)

        # Default librarian
        librarian = User.query.filter_by(email='librarian@pustak.com').first()
        if not librarian:
            librarian = User(
                name='Librarian',
                email='librarian@pustak.com',
                role='librarian',
            )
            librarian.set_password('admin123')
            db.session.add(librarian)

        # Sample users
        sample_users = [
            User(name='John Doe', email='john@example.com', role='user'),
            User(name='Jane Smith', email='jane@example.com', role='user'),
            User(name='Bob Johnson', email='bob@example.com', role='user'),
            User(name='Alice Brown', email='alice@example.com', role='user'),
        ]

        for user in sample_users:
            existing = User.query.filter_by(email=user.email).first()
            if not existing:
                user.set_password('password123')
                db.session.add(user)

        # Sample books
        fiction_category = Category.query.filter_by(name='Fiction').first()
        science_category = Category.query.filter_by(name='Science').first()

        sample_books = [
            Book(
                title='The Great Gatsby',
                author='F. Scott Fitzgerald',
                publisher='Scribner',
                isbn='9780743273565',
                category_id=fiction_category.id if fiction_category else 1,
                total_copies=3,
                available_copies=3,
            ),
            Book(
                title='To Kill a Mockingbird',
                author='Harper Lee',
                publisher='J.B. Lippincott & Co.',
                isbn='9780061120084',
                category_id=fiction_category.id if fiction_category else 1,
                total_copies=2,
                available_copies=2,
            ),
            Book(
                title='A Brief History of Time',
                author='Stephen Hawking',
                publisher='Bantam Books',
                isbn='9780553380163',
                category_id=science_category.id if science_category else 3,
                total_copies=1,
                available_copies=1,
            ),
            Book(
                title='The Selfish Gene',
                author='Richard Dawkins',
                publisher='Oxford University Press',
                isbn='9780192860927',
                category_id=science_category.id if science_category else 3,
                total_copies=2,
                available_copies=2,
            ),
        ]

        for book in sample_books:
            existing = Book.query.filter_by(isbn=book.isbn).first()
            if not existing:
                db.session.add(book)

        db.session.commit()
        print("Database initialized successfully!")
        print("Default login credentials:")
        print("Email: librarian@pustak.com")
        print("Password: admin123")

    @app.cli.command()
    def calculate_fines():
        """Calculate overdue fines for all transactions."""
        from .services.fine_service import calculate_overdue_fines, send_overdue_reminders

        print("Calculating overdue fines...")
        updated_count = calculate_overdue_fines()
        print(f"Updated {updated_count} transactions with new fines")

        print("Sending overdue reminders...")
        reminders_sent = send_overdue_reminders()
        print(f"Sent {reminders_sent} reminder notifications")

    @app.cli.command()
    def create_admin():
        """Create a new librarian account."""
        name = input("Enter librarian name: ")
        email = input("Enter email: ")
        password = input("Enter password: ")

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print(f"User with email {email} already exists!")
            return

        librarian = User(
            name=name,
            email=email,
            role='librarian',
        )
        librarian.set_password(password)

        db.session.add(librarian)
        db.session.commit()

        print(f"Librarian account created successfully for {email}")
