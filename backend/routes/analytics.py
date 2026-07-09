"""
routes/analytics.py
--------------------
Aggregates a user's mission history into summary statistics consumed by
the Analytics page: success rate, average battery usage, average speed,
distance over time, and obstacle counts.
"""

from flask import Blueprint, jsonify
from models import Mission
from routes.utils import login_required

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/analytics/summary", methods=["GET"])
@login_required
def summary(user):
    missions = Mission.query.filter_by(user_id=user.id).all()
    total = len(missions)
    completed = [m for m in missions if m.status == "completed"]
    aborted = [m for m in missions if m.status == "aborted"]

    success_rate = round((len(completed) / total) * 100, 1) if total else 0.0
    avg_battery = round(sum(m.battery_used_pct for m in completed) / len(completed), 1) if completed else 0.0
    avg_distance = round(sum(m.distance_m for m in completed) / len(completed), 1) if completed else 0.0
    avg_duration = round(sum(m.duration_s for m in completed) / len(completed), 1) if completed else 0.0
    avg_speed = round(avg_distance / avg_duration, 2) if avg_duration else 0.0
    total_obstacles = sum(m.obstacle_count for m in missions)

    daily = {}
    for m in missions:
        day = m.created_at.strftime("%Y-%m-%d")
        daily.setdefault(day, {"date": day, "missions": 0, "completed": 0})
        daily[day]["missions"] += 1
        if m.status == "completed":
            daily[day]["completed"] += 1

    return jsonify({
        "total_missions": total,
        "completed_missions": len(completed),
        "aborted_missions": len(aborted),
        "success_rate_pct": success_rate,
        "avg_battery_used_pct": avg_battery,
        "avg_distance_m": avg_distance,
        "avg_duration_s": avg_duration,
        "avg_speed_mps": avg_speed,
        "total_obstacles_encountered": total_obstacles,
        "daily_reports": sorted(daily.values(), key=lambda d: d["date"]),
    }), 200
