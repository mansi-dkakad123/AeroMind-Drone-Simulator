import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { analyticsApi, missionApi } from "../services/api";
import StatCard from "../components/StatCard";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentMissions, setRecentMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [summaryRes, missionsRes] = await Promise.all([
          analyticsApi.summary(),
          missionApi.list(),
        ]);
        if (!mounted) return;
        setSummary(summaryRes.data);
        setRecentMissions(missionsRes.data.missions.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0] || "pilot"}</h1>
          <p className="text-muted text-sm mt-1">Here's how your missions are performing.</p>
        </div>
        <Link to="/simulation" className="btn-gradient px-5 py-2.5 rounded-xl font-semibold text-sm">
          New simulation
        </Link>
      </div>

      {loading ? (
        <div className="text-muted text-sm">Loading dashboard...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total missions" value={summary?.total_missions ?? 0} />
            <StatCard label="Success rate" value={`${summary?.success_rate_pct ?? 0}%`} accent="green" />
            <StatCard label="Avg battery used" value={`${summary?.avg_battery_used_pct ?? 0}%`} accent="amber" />
            <StatCard label="Obstacles encountered" value={summary?.total_obstacles_encountered ?? 0} accent="blue" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard label="Avg distance / mission" value={`${summary?.avg_distance_m ?? 0} m`} />
            <StatCard label="Avg mission time" value={`${summary?.avg_duration_s ?? 0} s`} />
            <StatCard label="Avg speed" value={`${summary?.avg_speed_mps ?? 0} m/s`} accent="blue" />
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Recent missions</h2>
              <Link to="/history" className="text-xs text-neon-cyan hover:underline">
                View all
              </Link>
            </div>
            {recentMissions.length === 0 ? (
              <p className="text-sm text-muted">
                No missions yet. Head to the simulator to fly your first route.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted text-xs uppercase">
                    <th className="pb-2">Route</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Distance</th>
                    <th className="pb-2">Battery used</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMissions.map((m) => (
                    <tr key={m.id} className="border-t border-white/5">
                      <td className="py-2.5">
                        ({m.start.r},{m.start.c}) → ({m.destination.r},{m.destination.c})
                      </td>
                      <td className="py-2.5 capitalize">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            m.status === "completed"
                              ? "bg-green-500/15 text-green-400"
                              : m.status === "aborted"
                              ? "bg-red-500/15 text-red-400"
                              : "bg-blue-500/15 text-blue-400"
                          }`}
                        >
                          {m.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-2.5">{m.distance_m} m</td>
                      <td className="py-2.5">{m.battery_used_pct}%</td>
                      <td className="py-2.5 text-muted">
                        {m.created_at ? new Date(m.created_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
