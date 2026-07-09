/**
 * Simulation.jsx
 * --------------
 * Hosts the interactive DroneCanvas plus the live telemetry, virtual
 * sensor readout, and AI decision log panels. Persists mission
 * start/complete events to the backend.
 */

import { useCallback, useRef, useState } from "react";
import DroneCanvas from "../components/DroneCanvas";
import { missionApi } from "../services/api";

export default function Simulation() {
  const [logs, setLogs] = useState([]);
  const [telemetry, setTelemetry] = useState({
    status: "Idle", battery: 100, speed: 0, confidence: 0,
    distanceRemaining: 0, obstacles: 0, progress: 0, heading: 0,
  });
  const logBoxRef = useRef(null);

  const handleLog = useCallback((message, level = "info") => {
    setLogs((prev) => {
      const next = [...prev, { message, level, id: Date.now() + Math.random() }];
      return next.slice(-60);
    });
    requestAnimationFrame(() => {
      if (logBoxRef.current) logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    });
  }, []);

  const handleTelemetry = useCallback((patch) => {
    setTelemetry((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleMissionEvent = useCallback(async (type, payload) => {
    try {
      if (type === "start") {
        const created = await missionApi.create({
          start: payload.start,
          destination: payload.destination,
          obstacle_count: payload.obstacle_count,
        });
        const missionId = created.data.mission.id;
        await missionApi.start(missionId);
        return missionId;
      }
      if (type === "complete" && payload.missionId) {
        await missionApi.complete(payload.missionId, {
          distance_m: payload.distance_m,
          duration_s: payload.duration_s,
          ai_confidence: payload.ai_confidence,
          battery_used_pct: payload.battery_used_pct,
        });
      }
    } catch (err) {
      handleLog("Could not sync mission with backend — is the Flask server running?", "warn");
      console.error(err);
    }
    return null;
  }, [handleLog]);

  const levelColor = {
    ai: "text-neon-cyan",
    warn: "text-amber-400",
    ok: "text-green-400",
    info: "text-muted",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Drone simulation</h1>
      <p className="text-muted text-sm mb-6">
        Set a start point, destination, and obstacles, then launch an autonomous A* flight.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        <div className="glass-card p-5">
          <DroneCanvas onLog={handleLog} onTelemetry={handleTelemetry} onMissionEvent={handleMissionEvent} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass-card p-5">
            <h3 className="text-xs uppercase tracking-wide text-muted mb-3">Flight telemetry</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Stat label="Status" value={telemetry.status} />
              <Stat label="Battery" value={`${(telemetry.battery ?? 100).toFixed(0)}%`} accent={telemetry.battery < 30 ? "amber" : "green"} />
              <Stat label="Speed" value={`${(telemetry.speed ?? 0).toFixed(1)} m/s`} accent="blue" />
              <Stat label="AI confidence" value={telemetry.confidence ? `${telemetry.confidence.toFixed(1)}%` : "—"} accent="blue" />
              <Stat label="Distance left" value={`${(telemetry.distanceRemaining ?? 0).toFixed(0)} m`} />
              <Stat label="Obstacles" value={telemetry.obstacles ?? 0} accent="amber" />
            </div>
            <div className="text-[10px] uppercase tracking-wide text-muted mb-1">Mission progress</div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-primary transition-all duration-300"
                style={{ width: `${telemetry.progress ?? 0}%` }}
              />
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-xs uppercase tracking-wide text-muted mb-3">Virtual sensors</h3>
            <SensorRow name="Compass heading" value={`${(telemetry.heading ?? 0).toFixed(0)}°`} />
            <SensorRow name="Altitude" value={telemetry.status === "En route" ? "22.4 m" : "0.0 m"} />
            <SensorRow name="Ultrasonic" value={telemetry.status === "En route" ? "2.8 m" : "—"} />
            <SensorRow name="Camera" value={telemetry.status === "En route" ? "Streaming · clear view" : "Standby"} />
          </div>

          <div className="glass-card p-5">
            <h3 className="text-xs uppercase tracking-wide text-muted mb-3">AI decision log</h3>
            <div ref={logBoxRef} className="h-44 overflow-y-auto flex flex-col gap-1.5 font-mono text-xs">
              {logs.map((l) => (
                <div key={l.id} className={levelColor[l.level] || levelColor.info}>{l.message}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  const colors = { blue: "text-neon-cyan", green: "text-green-400", amber: "text-amber-400" };
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
      <div className="text-[10px] uppercase text-muted mb-0.5">{label}</div>
      <div className={`text-sm font-bold ${colors[accent] || ""}`}>{value}</div>
    </div>
  );
}

function SensorRow({ name, value }) {
  return (
    <div className="flex justify-between text-xs py-1.5 border-b border-dashed border-white/10 last:border-none">
      <span className="text-muted">{name}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
