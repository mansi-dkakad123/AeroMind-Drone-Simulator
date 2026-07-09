import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();
  const initials = (user?.name || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="glass-card p-6 flex items-center gap-5 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-xl font-bold shadow-glow">
          {initials}
        </div>
        <div>
          <div className="font-semibold text-lg">{user?.name}</div>
          <div className="text-muted text-sm">{user?.email}</div>
        </div>
      </div>
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold mb-3">About this account</h3>
        <p className="text-sm text-muted leading-relaxed">
          This account is used to plan and log simulated autonomous drone missions within AeroMind.
          All flights are software simulations — no physical drone or hardware is involved.
        </p>
      </div>
    </div>
  );
}
