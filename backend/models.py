"""
models.py
---------
SQLAlchemy ORM models backing the SQLite database. Each class maps
directly to a table:

  User          - registered accounts
  Mission       - one row per simulated flight (start, dest, outcome)
  SimulationLog - AI decision / event log lines tied to a mission
  BatteryLog    - per-second battery readings recorded during a mission
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    missions = db.relationship("Mission", backref="user", lazy=True)

    def set_password(self, raw_password):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password_hash, raw_password)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email}


class Mission(db.Model):
    __tablename__ = "missions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    start_r = db.Column(db.Integer, nullable=False)
    start_c = db.Column(db.Integer, nullable=False)
    dest_r = db.Column(db.Integer, nullable=False)
    dest_c = db.Column(db.Integer, nullable=False)

    status = db.Column(db.String(30), default="planned")
    # planned | in_progress | completed | aborted | paused

    distance_m = db.Column(db.Float, default=0.0)
    duration_s = db.Column(db.Integer, default=0)
    obstacle_count = db.Column(db.Integer, default=0)
    ai_confidence = db.Column(db.Float, default=0.0)
    battery_used_pct = db.Column(db.Float, default=0.0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    logs = db.relationship("SimulationLog", backref="mission", lazy=True,
                            cascade="all, delete-orphan")
    battery_logs = db.relationship("BatteryLog", backref="mission", lazy=True,
                                    cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "start": {"r": self.start_r, "c": self.start_c},
            "destination": {"r": self.dest_r, "c": self.dest_c},
            "status": self.status,
            "distance_m": self.distance_m,
            "duration_s": self.duration_s,
            "obstacle_count": self.obstacle_count,
            "ai_confidence": self.ai_confidence,
            "battery_used_pct": self.battery_used_pct,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }


class SimulationLog(db.Model):
    __tablename__ = "simulation_logs"

    id = db.Column(db.Integer, primary_key=True)
    mission_id = db.Column(db.Integer, db.ForeignKey("missions.id"), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    level = db.Column(db.String(20), default="info")  # info | ai | warn | ok
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "message": self.message,
            "level": self.level,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class BatteryLog(db.Model):
    __tablename__ = "battery_logs"

    id = db.Column(db.Integer, primary_key=True)
    mission_id = db.Column(db.Integer, db.ForeignKey("missions.id"), nullable=False)
    battery_pct = db.Column(db.Float, nullable=False)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "battery_pct": self.battery_pct,
            "recorded_at": self.recorded_at.isoformat() if self.recorded_at else None,
        }
