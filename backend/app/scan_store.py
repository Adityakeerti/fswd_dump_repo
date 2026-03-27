# Simple in-memory store for latest scan data
# In production, use Redis or database

latest_scan_data = {
    'timestamp': 0,
    'book_id': None,
    'book_info': None,
    'isbn': None,
}

def set_latest_scan(book_id, book_info, isbn):
    """Store the latest scan data."""
    import time
    global latest_scan_data
    latest_scan_data = {
        'timestamp': int(time.time() * 1000),  # milliseconds
        'book_id': book_id,
        'book_info': book_info,
        'isbn': isbn,
    }

def get_latest_scan():
    """Get the latest scan data."""
    return latest_scan_data.copy()

def clear_latest_scan():
    """Clear the latest scan data."""
    global latest_scan_data
    latest_scan_data = {
        'timestamp': 0,
        'book_id': None,
        'book_info': None,
        'isbn': None,
    }
