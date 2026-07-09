/**
 * Sidebar.jsx
 * -----------
 * Left navigation rail shown on every authenticated page. Highlights the
 * active route and exposes a logout action.
 */

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/simulation", label: "Simulation", icon: "🛰️" },
  { to: "/analytics", label: "Analytics", icon: "📊" },
  { to: "/history", label: "Mission history", icon: "🗂️" },
  { to: "/insights", label: "AI insights", icon: "🧠" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 shrink-0 min-h-screen glass-card !rounded-none border-r border-white/10 flex flex-col p-5">
      <div className="flex items-center gap-2 mb-8 px-1">
        <span className="w-2.5 h-2.5 rounded-full bg-gradient-primary shadow-glow" />
        <span className="font-bold text-lg">AeroMind</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? "bg-gradient-primary text-white shadow-glow"
                  : "text-muted hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 pt-4 mt-4">
        <p className="text-xs text-muted px-1 mb-2 truncate">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="w-full text-sm px-3 py-2 rounded-xl border border-white/10 hover:border-red-400/50 hover:bg-red-500/10 transition-all"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
