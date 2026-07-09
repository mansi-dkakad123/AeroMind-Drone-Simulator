"""
routes/missions.py
-------------------
Core mission endpoints:

  POST   /api/route/calculate      - run A* on a grid, return the waypoint path
  POST   /api/missions             - create (plan) a new mission
  GET    /api/missions              - list the current user's missions
  GET    /api/missions/<id>         - get one mission with its logs
  POST   /api/missions/<id>/start   - mark a mission in_progress, seed AI logs
  POST   /api/missions/<id>/pause   - pause an in-progress mission
  POST   /api/missions/<id>/resume  - resume a paused mission
  POST   /api/missions/<id>/stop    - abort a mission
  POST   /api/missions/<id>/complete- mark a mission completed with final stats
  POST   /api/missions/<id>/log     - append a log line (e.g. obstacle detected)
"""

from datetime import datetime
from flask import Blueprint, request, jsonify
from models import db, Mission, SimulationLog, BatteryLog
from pathfinding import find_path, path_length
from routes.utils import login_required

missions_bp = Blueprint("missions", __name__)


@missions_bp.route("/route/calculate", methods=["POST"])
@login_required
def calculate_route(user):
    data = request.get_json(silent=True) or {}
    grid = data.get("grid")
    start = data.get("start")
    dest = data.get("destination")

    if not grid or not start or not dest:
        return jsonify({"error": "grid, start and destination are required."}), 400

    path = find_path(grid, start, dest)
    if path is None:
        return jsonify({"path": None, "distance_m": 0,
                         "message": "No viable path found for the given obstacle layout."}), 200

    return jsonify({
        "path": path,
        "distance_m": path_length(path),
        "waypoints": len(path),
        "message": f"Path found with {len(path)} waypoints.",
    }), 200


@missions_bp.route("/missions", methods=["POST"])
@login_required
def create_mission(user):
    data = request.get_json(silent=True) or {}
    start = data.get("start") or {}
    dest = data.get("destination") or {}
    obstacle_count = int(data.get("obstacle_count") or 0)

    if "r" not in start or "c" not in start or "r" not in dest or "c" not in dest:
        return jsonify({"error": "start and destination need r/c coordinates."}), 400

    mission = Mission(
        user_id=user.id,
        start_r=start["r"], start_c=start["c"],
        dest_r=dest["r"], dest_c=dest["c"],
        obstacle_count=obstacle_count,
        status="planned",
    )
    db.session.add(mission)
    db.session.commit()

    return jsonify({"mission": mission.to_dict()}), 201


@missions_bp.route("/missions", methods=["GET"])
@login_required
def list_missions(user):
    missions = (Mission.query
                .filter_by(user_id=user.id)
                .order_by(Mission.created_at.desc())
                .all())
    return jsonify({"missions": [m.to_dict() for m in missions]}), 200


@missions_bp.route("/missions/<int:mission_id>", methods=["GET"])
@login_required
def get_mission(user, mission_id):
    mission = Mission.query.filter_by(id=mission_id, user_id=user.id).first()
    if not mission:
        return jsonify({"error": "Mission not found."}), 404

    payload = mission.to_dict()
    payload["logs"] = [log.to_dict() for log in
                        sorted(mission.logs, key=lambda l: l.created_at)]
    payload["battery_logs"] = [b.to_dict() for b in
                                sorted(mission.battery_logs, key=lambda b: b.recorded_at)]
    return jsonify({"mission": payload}), 200


def _add_log(mission_id, message, level="info"):
    db.session.add(SimulationLog(mission_id=mission_id, message=message, level=level))


@missions_bp.route("/missions/<int:mission_id>/start", methods=["POST"])
@login_required
def start_mission(user, mission_id):
    mission = Mission.query.filter_by(id=mission_id, user_id=user.id).first()
    if not mission:
        return jsonify({"error": "Mission not found."}), 404

    mission.status = "in_progress"
    _add_log(mission.id, "Calculating shortest path...", "ai")
    _add_log(mission.id, "Path found. Beginning autonomous flight.", "ok")
    db.session.commit()
    return jsonify({"mission": mission.to_dict()}), 200


@missions_bp.route("/missions/<int:mission_id>/pause", methods=["POST"])
@login_required
def pause_mission(user, mission_id):
    mission = Mission.query.filter_by(id=mission_id, user_id=user.id).first()
    if not mission:
        return jsonify({"error": "Mission not found."}), 404
    mission.status = "paused"
    _add_log(mission.id, "Mission paused by operator.", "warn")
    db.session.commit()
    return jsonify({"mission": mission.to_dict()}), 200


@missions_bp.route("/missions/<int:mission_id>/resume", methods=["POST"])
@login_required
def resume_mission(user, mission_id):
    mission = Mission.query.filter_by(id=mission_id, user_id=user.id).first()
    if not mission:
        return jsonify({"error": "Mission not found."}), 404
    mission.status = "in_progress"
    _add_log(mission.id, "Mission resumed.", "ai")
    db.session.commit()
    return jsonify({"mission": mission.to_dict()}), 200


@missions_bp.route("/missions/<int:mission_id>/stop", methods=["POST"])
@login_required
def stop_mission(user, mission_id):
    mission = Mission.query.filter_by(id=mission_id, user_id=user.id).first()
    if not mission:
        return jsonify({"error": "Mission not found."}), 404
    mission.status = "aborted"
    _add_log(mission.id, "Mission aborted by operator.", "warn")
    db.session.commit()
    return jsonify({"mission": mission.to_dict()}), 200


@missions_bp.route("/missions/<int:mission_id>/complete", methods=["POST"])
@login_required
def complete_mission(user, mission_id):
    mission = Mission.query.filter_by(id=mission_id, user_id=user.id).first()
    if not mission:
        return jsonify({"error": "Mission not found."}), 404

    data = request.get_json(silent=True) or {}
    mission.status = "completed"
    mission.distance_m = float(data.get("distance_m", mission.distance_m))
    mission.duration_s = int(data.get("duration_s", mission.duration_s))
    mission.ai_confidence = float(data.get("ai_confidence", mission.ai_confidence))
    mission.battery_used_pct = float(data.get("battery_used_pct", mission.battery_used_pct))
    mission.completed_at = datetime.utcnow()
    _add_log(mission.id, "Destination reached. Mission completed.", "ok")
    db.session.commit()
    return jsonify({"mission": mission.to_dict()}), 200


@missions_bp.route("/missions/<int:mission_id>/log", methods=["POST"])
@login_required
def add_log(user, mission_id):
    mission = Mission.query.filter_by(id=mission_id, user_id=user.id).first()
    if not mission:
        return jsonify({"error": "Mission not found."}), 404

    data = request.get_json(silent=True) or {}
    message = data.get("message")
    level = data.get("level", "info")
    if not message:
        return jsonify({"error": "message is required."}), 400

    _add_log(mission.id, message, level)
    db.session.commit()
    return jsonify({"ok": True}), 201


@missions_bp.route("/missions/<int:mission_id>/battery", methods=["POST"])
@login_required
def log_battery(user, mission_id):
    mission = Mission.query.filter_by(id=mission_id, user_id=user.id).first()
    if not mission:
        return jsonify({"error": "Mission not found."}), 404

    data = request.get_json(silent=True) or {}
    pct = data.get("battery_pct")
    if pct is None:
        return jsonify({"error": "battery_pct is required."}), 400

    db.session.add(BatteryLog(mission_id=mission.id, battery_pct=float(pct)))
    db.session.commit()
    return jsonify({"ok": True}), 201
