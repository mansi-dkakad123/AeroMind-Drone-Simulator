export default function About() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">About AeroMind</h1>
      <p className="text-muted text-sm mb-6">Autonomous Drone Navigation Simulator — software-only.</p>

      <div className="glass-card p-6 mb-6">
        <h3 className="font-semibold mb-2">What this project is</h3>
        <p className="text-sm text-muted leading-relaxed">
          AeroMind simulates an autonomous drone that plans and flies routes through obstacle
          fields entirely in software. It uses the A* search algorithm for path planning and
          recalculates routes in real time when new obstacles appear — demonstrating the core
          decision-making a real autonomous drone would perform, without any physical hardware.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-2">Technology</h3>
          <ul className="text-sm text-muted space-y-1.5">
            <li>React, Vite, Tailwind CSS, Framer Motion — frontend</li>
            <li>Python, Flask, REST API — backend</li>
            <li>SQLite — persistence</li>
            <li>A* search with 8-directional movement — AI path planning</li>
          </ul>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-2">What's simulated</h3>
          <ul className="text-sm text-muted space-y-1.5">
            <li>GPS, altitude, ultrasonic, compass, IMU and camera sensors</li>
            <li>Battery drain over the course of a mission</li>
            <li>Dynamic obstacle detection and rerouting</li>
            <li>Mission history and analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
