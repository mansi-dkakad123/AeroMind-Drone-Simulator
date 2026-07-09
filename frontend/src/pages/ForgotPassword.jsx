import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-card w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-8">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-primary shadow-glow" />
          <span className="font-bold text-lg">AeroMind</span>
        </div>

        {!sent ? (
          <>
            <h1 className="text-2xl font-bold mb-1">Reset your password</h1>
            <p className="text-muted text-sm mb-6">
              Enter your account email and we'll send a reset link.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-neon-blue/60"
                placeholder="you@example.com"
              />
              <button type="submit" className="btn-gradient rounded-xl py-2.5 font-semibold">
                Send reset link
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-3xl mb-3">📬</div>
            <h2 className="font-semibold mb-2">Check your inbox</h2>
            <p className="text-sm text-muted mb-1">
              If an account exists for <span className="text-white">{email}</span>, a reset link is on its way.
            </p>
            <p className="text-xs text-muted mt-4">
              Note: email delivery is not wired up in this simulator build — this screen demonstrates
              the intended UX flow.
            </p>
          </div>
        )}

        <p className="text-sm text-muted text-center mt-6">
          <Link to="/login" className="text-neon-cyan hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
