import { useEffect, useState } from "react";
import { missionApi } from "../services/api";

export default function AIInsights() {
  const [missions, setMissions] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await missionApi.list();
      const list = res.data.missions;
      setMissions(list);
      const detailed = await Promise.all(list.slice(0, 15).map((m) => missionApi.get(m.id)));
      const logs = detailed.flatMap((d) => d.data.mission.logs.map((l) => ({ ...l, missionId: d.data.mission.id })));
      setAllLogs(logs);
      setLoading(false);
    }
    load().catch(() => setLoading(false));
  }, []);

  const rerouteCount = allLogs.filter((l) => l.message.toLowerCase().includes("alternative route")).length;
  const obstacleCount = allLogs.filter((l) => l.message.toLowerCase().includes("obstacle")).length;
  const completedCount = missions.filter((m) => m.status === "completed").length;
  const avgConfidence = missions.length
    ? (missions.reduce((s, m) => s + (m.ai_confidence || 0), 0) / missions.length).toFixed(1)
    : "0.0";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">AI insights</h1>
      <p className="text-muted text-sm mb-6">
        Patterns extracted from the autonomous navigation engine's decision logs.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted mb-1">Avg AI confidence</div>
          <div className="text-xl font-bold text-neon-cyan">{avgConfidence}%</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted mb-1">Reroutes triggered</div>
          <div className="text-xl font-bold text-amber-400">{rerouteCount}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted mb-1">Obstacles detected</div>
          <div className="text-xl font-bold">{obstacleCount}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted mb-1">Missions completed</div>
          <div className="text-xl font-bold text-green-400">{completedCount}</div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-xs uppercase tracking-wide text-muted mb-3">Recent AI decisions</h3>
        {loading ? (
          <p className="text-sm text-muted">Loading decision logs...</p>
        ) : allLogs.length === 0 ? (
          <p className="text-sm text-muted">No AI decisions logged yet — fly a mission first.</p>
        ) : (
          <div className="h-96 overflow-y-auto flex flex-col gap-1.5 font-mono text-xs">
            {allLogs
              .slice()
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((l) => (
                <div key={`${l.missionId}-${l.id}`} className={
                  l.level === "ai" ? "text-neon-cyan" :
                  l.level === "warn" ? "text-amber-400" :
                  l.level === "ok" ? "text-green-400" : "text-muted"
                }>
                  [Mission #{l.missionId}] {l.message}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
