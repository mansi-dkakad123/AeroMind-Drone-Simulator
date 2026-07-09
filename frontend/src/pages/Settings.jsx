import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Settings() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [units, setUnits] = useState("metric");
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-muted text-sm mb-6">Manage your account and simulation preferences.</p>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4">Account</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted mb-1 block">Name</label>
              <input
                defaultValue={user?.name}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-neon-blue/60"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Email</label>
              <input
                defaultValue={user?.email}
                disabled
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 outline-none opacity-60"
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4">Preferences</h3>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">Dark mode</span>
            <Toggle checked={darkMode} onChange={setDarkMode} />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">Mission notifications</span>
            <Toggle checked={notifications} onChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">Distance units</span>
            <select
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none"
            >
              <option value="metric">Metric (m, m/s)</option>
              <option value="imperial">Imperial (ft, mph)</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-gradient rounded-xl py-2.5 font-semibold self-start px-6">
          Save changes
        </button>
        {saved && <p className="text-xs text-green-400">Preferences saved.</p>}
      </form>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full relative transition-colors ${checked ? "bg-gradient-primary" : "bg-white/10"}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? "left-5" : "left-0.5"}`}
      />
    </button>
  );
}
