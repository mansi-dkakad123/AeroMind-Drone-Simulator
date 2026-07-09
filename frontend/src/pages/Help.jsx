const faqs = [
  {
    q: "How do I run a simulation?",
    a: "Go to the Simulation page, click \"Set start\" and choose a point on the grid, then \"Set destination\" and choose another point, then press \"Start mission\".",
  },
  {
    q: "How do I add obstacles?",
    a: "Click \"Add obstacle\" then click any cell on the grid. You can drag a placed obstacle to move it, or use \"Erase obstacle\" to remove one.",
  },
  {
    q: "What happens if I add an obstacle while the drone is flying?",
    a: "The AI detects the new obstacle immediately and recalculates the route using A* from the drone's current position to the destination.",
  },
  {
    q: "Is a real drone required?",
    a: "No. This entire project is a software simulation — there is no hardware, IoT device, or physical drone involved.",
  },
  {
    q: "Where is my mission data stored?",
    a: "Every mission you run is saved to the backend's SQLite database and can be reviewed on the Mission History and Analytics pages.",
  },
];

export default function Help() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Help & FAQ</h1>
      <p className="text-muted text-sm mb-6">Common questions about using the simulator.</p>

      <div className="flex flex-col gap-4">
        {faqs.map((f) => (
          <div key={f.q} className="glass-card p-5">
            <h3 className="font-semibold text-sm mb-1.5">{f.q}</h3>
            <p className="text-sm text-muted leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
