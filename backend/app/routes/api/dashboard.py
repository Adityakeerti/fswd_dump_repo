"""
API dashboard endpoints.
"""

from flask import jsonify

from ...utils import get_dashboard_stats, update_all_transaction_fines
from ...decorators import api_librarian_required
from . import api_bp


@api_bp.route('/dashboard/stats', methods=['GET'])
@api_librarian_required
def get_dashboard_stats_api():
    update_all_transaction_fines()
    stats = get_dashboard_stats()
    return jsonify(stats)
