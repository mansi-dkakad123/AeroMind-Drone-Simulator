import { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { analyticsApi } from "../services/api";
import StatCard from "../components/StatCard";

const COLORS = ["#22c55e", "#ef4444"];

export default function Analytics() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    analyticsApi.summary().then((res) => setSummary(res.data));
  }, []);

  if (!summary) {
    return <div className="text-muted text-sm">Loading analytics...</div>;
  }

  const outcomeData = [
    { name: "Completed", value: summary.completed_missions },
    { name: "Aborted", value: summary.aborted_missions },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Analytics</h1>
      <p className="text-muted text-sm mb-6">Aggregated performance across all simulated missions.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Success rate" value={`${summary.success_rate_pct}%`} accent="green" />
        <StatCard label="Avg battery used" value={`${summary.avg_battery_used_pct}%`} accent="amber" />
        <StatCard label="Avg speed" value={`${summary.avg_speed_mps} m/s`} accent="blue" />
        <StatCard label="Obstacles encountered" value={summary.total_obstacles_encountered} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-5">
          <h3 className="text-xs uppercase tracking-wide text-muted mb-4">Missions per day</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={summary.daily_reports}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#8b8fa3" fontSize={11} />
              <YAxis stroke="#8b8fa3" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0b0f22", border: "1px solid rgba(255,255,255,0.1)" }} />
              <Line type="monotone" dataKey="missions" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="completed" stroke="#22d3ee" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-xs uppercase tracking-wide text-muted mb-4">Mission outcomes</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={outcomeData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                {outcomeData.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0b0f22", border: "1px solid rgba(255,255,255,0.1)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-xs uppercase tracking-wide text-muted mb-4">Missions by day (bar)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={summary.daily_reports}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" stroke="#8b8fa3" fontSize={11} />
            <YAxis stroke="#8b8fa3" fontSize={11} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#0b0f22", border: "1px solid rgba(255,255,255,0.1)" }} />
            <Bar dataKey="missions" fill="#3b82f6" radius={[4,4,0,0]} />
            <Bar dataKey="completed" fill="#a855f7" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
