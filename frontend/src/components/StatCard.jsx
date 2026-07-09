/**
 * StatCard.jsx
 * ------------
 * Small metric tile used across the Dashboard and Analytics pages.
 * accent controls the value color: "blue" | "green" | "amber" | "red".
 */

const accentClasses = {
  blue: "text-neon-cyan",
  green: "text-green-400",
  amber: "text-amber-400",
  red: "text-red-400",
  default: "text-slate-100",
};

export default function StatCard({ label, value, accent = "default", sub }) {
  return (
    <div className="glass-card p-4">
      <div className="text-[11px] uppercase tracking-wide text-muted mb-1">{label}</div>
      <div className={`text-xl font-bold ${accentClasses[accent] || accentClasses.default}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}
