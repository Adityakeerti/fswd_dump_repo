"""
API category endpoints — CRUD.
"""

from flask import request, jsonify

from ...extensions import db
from ...models import Category
from ...decorators import api_librarian_required
from . import api_bp, category_schema, categories_schema


@api_bp.route('/categories', methods=['GET'])
@api_librarian_required
def get_categories():
    categories = Category.query.all()
    return jsonify(categories_schema.dump(categories))


@api_bp.route('/categories', methods=['POST'])
@api_librarian_required
def create_category():
    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({'error': 'name is required'}), 400

    try:
        category = Category(
            name=data['name'],
            description=data.get('description', ''),
        )
        db.session.add(category)
        db.session.commit()
        return jsonify(category_schema.dump(category)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@api_bp.route('/categories/<int:category_id>', methods=['GET'])
@api_librarian_required
def get_category(category_id):
    category = Category.query.get_or_404(category_id)
    return jsonify(category_schema.dump(category))


@api_bp.route('/categories/<int:category_id>', methods=['PUT'])
@api_librarian_required
def update_category(category_id):
    category = Category.query.get_or_404(category_id)
    data = request.get_json()

    try:
        category.name = data.get('name', category.name)
        category.description = data.get('description', category.description)
        db.session.commit()
        return jsonify(category_schema.dump(category))
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@api_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@api_librarian_required
def delete_category(category_id):
    category = Category.query.get_or_404(category_id)

    if category.books:
        return jsonify({'error': 'Cannot delete category with books'}), 400

    db.session.delete(category)
    db.session.commit()
    return jsonify({'message': 'Category deleted successfully'})
