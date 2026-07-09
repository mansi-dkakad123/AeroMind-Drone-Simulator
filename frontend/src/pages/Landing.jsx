/**
 * Landing.jsx
 * -----------
 * Public marketing page. Hero, feature grid, stats strip and footer.
 * No auth required.
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  {
    title: "A* path planning",
    desc: "Every mission is routed with an A* search over a live obstacle grid, always finding the shortest safe path.",
    icon: "🧭",
  },
  {
    title: "Dynamic rerouting",
    desc: "New obstacles detected mid-flight trigger an instant recalculation, no restart required.",
    icon: "🔄",
  },
  {
    title: "Virtual sensor suite",
    desc: "Simulated GPS, IMU, ultrasonic, altitude and compass readings stream in real time.",
    icon: "📡",
  },
  {
    title: "Mission analytics",
    desc: "Track success rate, battery usage, average speed and obstacle counts across every flight.",
    icon: "📈",
  },
];

const stats = [
  { value: "100%", label: "Software-only, zero hardware" },
  { value: "8-directional", label: "A* search space" },
  { value: "<50ms", label: "Route recalculation" },
  { value: "6", label: "Simulated sensor feeds" },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-primary shadow-glow" />
          <span className="font-bold text-lg">AeroMind</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-muted hover:text-white transition-colors px-3 py-2">
            Log in
          </Link>
          <Link to="/signup" className="text-sm px-4 py-2 rounded-xl btn-gradient font-semibold">
            Get started
          </Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto text-center px-6 pt-20 pb-16">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block text-xs px-3 py-1 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan mb-6"
        >
          Software-only simulation · no drone hardware required
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-extrabold leading-tight mb-6"
        >
          Autonomous flight,<br />
          <span className="bg-gradient-primary bg-clip-text text-transparent">planned by AI.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted text-lg max-w-2xl mx-auto mb-10"
        >
          AeroMind simulates an autonomous drone finding its way through obstacles using
          A* path planning and real-time rerouting — entirely in software.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4"
        >
          <Link to="/signup" className="px-6 py-3 rounded-xl btn-gradient font-semibold">
            Launch simulator
          </Link>
          <Link to="/login" className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
            I have an account
          </Link>
        </motion.div>
      </section>

      <section className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 px-6 pb-20">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5 text-center">
            <div className="text-2xl font-bold text-neon-cyan">{s.value}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-center mb-10">Built for autonomous navigation</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f) => (
            <div key={f.title} className="glass-card p-6 hover:border-neon-blue/50 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-muted">
        AeroMind — Autonomous Drone Navigation Simulator. A software-only final year project.
      </footer>
    </div>
  );
}
