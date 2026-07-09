"""
routes/utils.py
----------------
Shared helper: a decorator that protects a route behind a valid
Bearer token, resolving it to the current User and passing it into
the wrapped view function.
"""

from functools import wraps
from flask import request, jsonify
from models import User
from routes.auth import verify_token


def login_required(view_func):
    @wraps(view_func)
    def wrapped(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authentication required."}), 401

        user_id = verify_token(auth_header.split(" ", 1)[1])
        if not user_id:
            return jsonify({"error": "Invalid or expired token."}), 401

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found."}), 404

        return view_func(user, *args, **kwargs)
    return wrapped
