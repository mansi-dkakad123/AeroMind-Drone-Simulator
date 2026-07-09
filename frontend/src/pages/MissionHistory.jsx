import { useEffect, useState } from "react";
import { missionApi } from "../services/api";

export default function MissionHistory() {
  const [missions, setMissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    missionApi.list().then((res) => {
      setMissions(res.data.missions);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const openMission = async (id) => {
    const res = await missionApi.get(id);
    setSelected(res.data.mission);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Mission history</h1>
      <p className="text-muted text-sm mb-6">Every simulated flight, with its outcome and AI decision log.</p>

      {loading ? (
        <div className="text-muted text-sm">Loading missions...</div>
      ) : missions.length === 0 ? (
        <div className="glass-card p-8 text-center text-muted text-sm">
          No missions recorded yet. Fly one from the Simulation page.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="glass-card p-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted text-xs uppercase">
                  <th className="pb-2">Route</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Distance</th>
                  <th className="pb-2">Duration</th>
                  <th className="pb-2">Battery</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {missions.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => openMission(m.id)}
                    className="border-t border-white/5 cursor-pointer hover:bg-white/5"
                  >
                    <td className="py-2.5">({m.start.r},{m.start.c}) → ({m.destination.r},{m.destination.c})</td>
                    <td className="py-2.5 capitalize">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        m.status === "completed" ? "bg-green-500/15 text-green-400" :
                        m.status === "aborted" ? "bg-red-500/15 text-red-400" :
                        "bg-blue-500/15 text-blue-400"
                      }`}>
                        {m.status.replace("_"," ")}
                      </span>
                    </td>
                    <td className="py-2.5">{m.distance_m} m</td>
                    <td className="py-2.5">{m.duration_s}s</td>
                    <td className="py-2.5">{m.battery_used_pct}%</td>
                    <td className="py-2.5 text-muted">{m.created_at ? new Date(m.created_at).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-xs uppercase tracking-wide text-muted mb-3">Mission detail</h3>
            {!selected ? (
              <p className="text-sm text-muted">Click a row to view its full AI decision log.</p>
            ) : (
              <div>
                <div className="text-sm mb-3">
                  Mission #{selected.id} · <span className="capitalize">{selected.status.replace("_"," ")}</span>
                </div>
                <div className="h-64 overflow-y-auto flex flex-col gap-1.5 font-mono text-xs">
                  {selected.logs.map((l) => (
                    <div key={l.id} className={
                      l.level === "ai" ? "text-neon-cyan" :
                      l.level === "warn" ? "text-amber-400" :
                      l.level === "ok" ? "text-green-400" : "text-muted"
                    }>
                      [{new Date(l.created_at).toLocaleTimeString()}] {l.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
