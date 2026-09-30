import os
import json
from flask import Blueprint, request, jsonify

academic_bp = Blueprint('academic', __name__)

# Cache loaded cabins
_CACHED_CABINS = None

def _load_cabins():
    global _CACHED_CABINS
    if _CACHED_CABINS is not None:
        return _CACHED_CABINS

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(base_dir, 'database', 'faculty_cabins.json')
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            _CACHED_CABINS = json.load(f)
    else:
        _CACHED_CABINS = []
    return _CACHED_CABINS

@academic_bp.route('/academic/cabins', methods=['GET'])
def get_faculty_cabins():
    cabins = _load_cabins()

    search = request.args.get('search', '').strip().lower()
    block = request.args.get('block', '').strip()
    status = request.args.get('status', '').strip()

    filtered = cabins

    if search:
        filtered = [
            c for c in filtered
            if search in c.get('name', '').lower()
            or search in c.get('cabinNo', '').lower()
            or search in c.get('phone', '').lower()
            or search in c.get('fullLocation', '').lower()
            or search in c.get('remark', '').lower()
        ]

    if block and block != 'All Blocks':
        filtered = [c for c in filtered if c.get('block') == block]

    if status and status != 'All Status':
        filtered = [c for c in filtered if c.get('status', '').lower() == status.lower()]

    return jsonify({
        'total': len(filtered),
        'cabins': filtered
    }), 200

@academic_bp.route('/academic/stats', methods=['GET'])
def get_academic_stats():
    cabins = _load_cabins()
    total = len(cabins)
    occupied = sum(1 for c in cabins if c.get('status') == 'Occupied')
    vacant = sum(1 for c in cabins if c.get('status') == 'Vacant')
    allotted = sum(1 for c in cabins if c.get('status') == 'Allotted')
    pending = sum(1 for c in cabins if c.get('status') == 'Handover Pending')

    return jsonify({
        'total': total,
        'occupied': occupied,
        'vacant': vacant,
        'allotted': allotted,
        'handoverPending': pending
    }), 200
