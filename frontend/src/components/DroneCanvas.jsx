/**
 * DroneCanvas.jsx
 * ---------------
 * The interactive mission map: click to set start/destination, add or
 * drag obstacles, then run an A* flight with live dynamic rerouting.
 * Reports mission lifecycle events (start/complete/reroute) to the
 * backend via the callbacks passed in as props, and streams live
 * telemetry back up to the parent through onTelemetry.
 */

import { useEffect, useRef, useState, useCallback } from "react";

const COLS = 45;
const ROWS = 28;

function neighbors(grid, r, c) {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
  const out = [];
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] === 0) {
      out.push({ r: nr, c: nc, cost: (dr !== 0 && dc !== 0) ? 1.41 : 1 });
    }
  }
  return out;
}
function heuristic(a, b) { return Math.hypot(a.r - b.r, a.c - b.c); }

function astar(grid, from, to) {
  const key = (p) => `${p.r},${p.c}`;
  const open = new Map();
  const gScore = new Map();
  const fScore = new Map();
  const cameFrom = new Map();
  gScore.set(key(from), 0);
  fScore.set(key(from), heuristic(from, to));
  open.set(key(from), from);

  while (open.size > 0) {
    let currentKey = null, current = null, bestF = Infinity;
    for (const [k, v] of open) {
      const f = fScore.get(k) ?? Infinity;
      if (f < bestF) { bestF = f; currentKey = k; current = v; }
    }
    if (current.r === to.r && current.c === to.c) {
      const result = [current];
      let ck = currentKey;
      while (cameFrom.has(ck)) {
        const prev = cameFrom.get(ck);
        result.unshift(prev);
        ck = key(prev);
      }
      return result;
    }
    open.delete(currentKey);
    for (const n of neighbors(grid, current.r, current.c)) {
      const nk = key(n);
      const tentative = (gScore.get(currentKey) ?? Infinity) + n.cost;
      if (tentative < (gScore.get(nk) ?? Infinity)) {
        cameFrom.set(nk, current);
        gScore.set(nk, tentative);
        fScore.set(nk, tentative + heuristic(n, to));
        open.set(nk, n);
      }
    }
  }
  return null;
}

export default function DroneCanvas({ onLog, onTelemetry, onMissionEvent }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const cellRef = useRef(20);

  const gridRef = useRef(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const startRef = useRef({ r: 5, c: 4 });
  const destRef = useRef({ r: 22, c: 40 });
  const pathRef = useRef([]);
  const droneRef = useRef(null);
  const trailRef = useRef([]);
  const flyingRef = useRef(false);
  const propAngleRef = useRef(0);
  const missionIdRef = useRef(null);
  const missionStartTimeRef = useRef(null);
  const batteryRef = useRef(100);
  const draggingRef = useRef(null);

  const [mode, setMode] = useState("start");
  const [obstacleCount, setObstacleCount] = useState(0);
  const [flying, setFlying] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const CELL = cellRef.current;
    const grid = gridRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255,255,255,0.035)";
    ctx.lineWidth = 1;
    for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c*CELL,0); ctx.lineTo(c*CELL,canvas.height); ctx.stroke(); }
    for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0,r*CELL); ctx.lineTo(canvas.width,r*CELL); ctx.stroke(); }

    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === 1) {
        ctx.fillStyle = "#3a3f55";
        ctx.fillRect(c*CELL+1, r*CELL+1, CELL-2, CELL-2);
        ctx.strokeStyle = "rgba(148,163,184,0.3)";
        ctx.strokeRect(c*CELL+1, r*CELL+1, CELL-2, CELL-2);
      }
    }

    const path = pathRef.current;
    if (path && path.length > 1) {
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#22d3ee";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(path[0].c*CELL + CELL/2, path[0].r*CELL + CELL/2);
      for (const p of path) ctx.lineTo(p.c*CELL + CELL/2, p.r*CELL + CELL/2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    const drawNode = (node, color, label) => {
      const x = node.c*CELL + CELL/2, y = node.r*CELL + CELL/2;
      ctx.beginPath();
      ctx.arc(x, y, CELL*0.38, 0, Math.PI*2);
      ctx.fillStyle = color;
      ctx.shadowColor = color; ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#05081a";
      ctx.font = `bold ${CELL*0.5}px sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(label, x, y+1);
    };
    drawNode(startRef.current, "#22c55e", "S");
    drawNode(destRef.current, "#ef4444", "D");

    const trail = trailRef.current;
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      const age = i / trail.length;
      ctx.beginPath();
      ctx.arc(t.x, t.y, CELL*0.12*age, 0, Math.PI*2);
      ctx.fillStyle = `rgba(34,211,238,${0.35*age})`;
      ctx.fill();
    }

    const drone = droneRef.current;
    if (drone) {
      propAngleRef.current += flyingRef.current ? 0.9 : 0.15;
      ctx.save();
      ctx.translate(drone.pixelPos.x, drone.pixelPos.y);
      if (flyingRef.current) {
        const pulse = 0.5 + Math.sin(Date.now()/180)*0.5;
        ctx.beginPath();
        ctx.arc(0,0, CELL*(0.75+pulse*0.15), 0, Math.PI*2);
        ctx.fillStyle = `rgba(168,85,247,${0.10+pulse*0.08})`;
        ctx.fill();
      }
      ctx.rotate(drone.heading);
      const armLen = CELL*0.48;
      const armOffsets = [[-armLen,-armLen*0.6],[armLen,-armLen*0.6],[-armLen,armLen*0.25],[armLen,armLen*0.25]];
      for (const [ax, ay] of armOffsets) {
        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(propAngleRef.current);
        ctx.beginPath();
        ctx.ellipse(0,0, CELL*0.30, CELL*0.09, 0, 0, Math.PI*2);
        ctx.fillStyle = flyingRef.current ? "rgba(34,211,238,0.35)" : "rgba(148,163,184,0.25)";
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.moveTo(0,-CELL*0.55);
      ctx.lineTo(CELL*0.4, CELL*0.45);
      ctx.lineTo(0, CELL*0.2);
      ctx.lineTo(-CELL*0.4, CELL*0.45);
      ctx.closePath();
      ctx.fillStyle = "#a855f7";
      ctx.shadowColor = "#a855f7"; ctx.shadowBlur = flyingRef.current ? 20 : 10;
      ctx.fill();
      ctx.restore();
      ctx.shadowBlur = 0;
    }
  }, []);

  const parkDrone = useCallback(() => {
    if (flyingRef.current) return;
    const CELL = cellRef.current;
    droneRef.current = {
      pathIndex: 0,
      pixelPos: { x: startRef.current.c*CELL+CELL/2, y: startRef.current.r*CELL+CELL/2 },
      heading: 0,
    };
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const w = container.clientWidth;
    canvas.width = w;
    canvas.height = w * (ROWS / COLS);
    cellRef.current = canvas.width / COLS;
    parkDrone();
    draw();
  }, [draw, parkDrone]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    onLog?.("Simulator initialized. Configure start, destination and obstacles, then start mission.", "ai");
    const spin = setInterval(() => { if (droneRef.current) draw(); }, 45);
    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(spin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateObstacleCount = useCallback(() => {
    let n = 0;
    for (const row of gridRef.current) for (const v of row) if (v === 1) n++;
    setObstacleCount(n);
  }, []);

  const cellFromEvent = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const CELL = cellRef.current;
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const c = Math.floor(x / CELL), r = Math.floor(y / CELL);
    return { r: Math.max(0, Math.min(ROWS-1, r)), c: Math.max(0, Math.min(COLS-1, c)) };
  };

  const recalcIfFlying = useCallback((msg) => {
    if (!flyingRef.current || !droneRef.current) return;
    onLog?.(msg, "warn");
    const currentCell = pathRef.current[droneRef.current.pathIndex] || startRef.current;
    const newPath = astar(gridRef.current, currentCell, destRef.current);
    if (!newPath) {
      onLog?.("Alternative route not found — holding position.", "warn");
      return;
    }
    pathRef.current = newPath;
    droneRef.current.pathIndex = 0;
    onLog?.(`Alternative route calculated (${newPath.length} waypoints). Resuming flight.`, "ai");
  }, [onLog]);

  const applyModeAt = useCallback((cell) => {
    const grid = gridRef.current;
    if (mode === "start") {
      if (grid[cell.r][cell.c] === 1) return;
      startRef.current = cell;
      parkDrone();
    } else if (mode === "dest") {
      if (grid[cell.r][cell.c] === 1) return;
      destRef.current = cell;
    } else if (mode === "obstacle") {
      if ((cell.r===startRef.current.r && cell.c===startRef.current.c) ||
          (cell.r===destRef.current.r && cell.c===destRef.current.c)) return;
      grid[cell.r][cell.c] = 1;
      recalcIfFlying("Obstacle detected in flight path...");
    } else if (mode === "erase") {
      grid[cell.r][cell.c] = 0;
    }
    updateObstacleCount();
    draw();
  }, [mode, draw, parkDrone, recalcIfFlying, updateObstacleCount]);

  const handleMouseDown = (e) => {
    const cell = cellFromEvent(e);
    if (mode === "obstacle" && gridRef.current[cell.r][cell.c] === 1) {
      draggingRef.current = cell;
      return;
    }
    applyModeAt(cell);
  };
  const handleMouseMove = (e) => {
    if (draggingRef.current) {
      const cell = cellFromEvent(e);
      const grid = gridRef.current;
      if (grid[cell.r][cell.c] === 0 &&
          !(cell.r===startRef.current.r && cell.c===startRef.current.c) &&
          !(cell.r===destRef.current.r && cell.c===destRef.current.c)) {
        grid[draggingRef.current.r][draggingRef.current.c] = 0;
        draggingRef.current = cell;
        grid[cell.r][cell.c] = 1;
        recalcIfFlying("Obstacle repositioned — recalculating route...");
        draw();
      }
    }
  };
  const handleMouseUp = () => { draggingRef.current = null; };

  const randomObstacles = () => {
    const grid = gridRef.current;
    for (let i = 0; i < 70; i++) {
      const r = Math.floor(Math.random()*ROWS), c = Math.floor(Math.random()*COLS);
      if ((r===startRef.current.r && c===startRef.current.c) ||
          (r===destRef.current.r && c===destRef.current.c)) continue;
      grid[r][c] = 1;
    }
    updateObstacleCount(); draw();
  };

  const randomMap = () => {
    gridRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    startRef.current = { r: Math.floor(Math.random()*ROWS), c: 2 };
    destRef.current = { r: Math.floor(Math.random()*ROWS), c: COLS-3 };
    for (let i = 0; i < 80; i++) {
      const r = Math.floor(Math.random()*ROWS), c = Math.floor(Math.random()*COLS);
      if ((r===startRef.current.r && c===startRef.current.c) ||
          (r===destRef.current.r && c===destRef.current.c)) continue;
      gridRef.current[r][c] = 1;
    }
    pathRef.current = [];
    flyingRef.current = false;
    setFlying(false);
    parkDrone();
    updateObstacleCount(); draw();
  };

  const resetMap = () => {
    gridRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    pathRef.current = [];
    flyingRef.current = false;
    setFlying(false);
    parkDrone();
    updateObstacleCount(); draw();
  };

  const runDroneLoop = useCallback(() => {
    const CELL = cellRef.current;
    function step() {
      if (!flyingRef.current || !droneRef.current) return;
      const path = pathRef.current;
      const drone = droneRef.current;
      const target = path[Math.min(drone.pathIndex+1, path.length-1)];
      const targetX = target.c*CELL + CELL/2, targetY = target.r*CELL + CELL/2;
      const dx = targetX - drone.pixelPos.x, dy = targetY - drone.pixelPos.y;
      const dist = Math.hypot(dx, dy);
      const speed = CELL * 0.09;
      if (dist < speed) {
        drone.pixelPos.x = targetX; drone.pixelPos.y = targetY;
        drone.pathIndex++;
        if (drone.pathIndex >= path.length-1) {
          missionComplete();
          return;
        }
      } else {
        drone.heading = Math.atan2(dx, -dy);
        drone.pixelPos.x += dx/dist*speed;
        drone.pixelPos.y += dy/dist*speed;
      }
      trailRef.current.push({ x: drone.pixelPos.x, y: drone.pixelPos.y });
      if (trailRef.current.length > 22) trailRef.current.shift();
      draw();
      requestAnimationFrame(step);
    }
    step();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw]);

  const missionComplete = useCallback(() => {
    flyingRef.current = false;
    setFlying(false);
    onLog?.("Destination reached. Mission completed.", "ok");
    const durationS = missionStartTimeRef.current
      ? Math.round((Date.now() - missionStartTimeRef.current) / 1000)
      : 0;
    onMissionEvent?.("complete", {
      distance_m: pathRef.current.length * 3.1,
      duration_s: durationS,
      ai_confidence: 91 + Math.random()*8,
      battery_used_pct: 100 - batteryRef.current,
      missionId: missionIdRef.current,
    });
    onTelemetry?.({ status: "Mission complete", progress: 100 });
  }, [onLog, onMissionEvent, onTelemetry]);

  const startMission = useCallback(async () => {
    if (flyingRef.current) return;
    onLog?.("Calculating shortest path...", "ai");
    const p = astar(gridRef.current, startRef.current, destRef.current);
    if (!p) {
      onLog?.("No viable path found — mission aborted.", "warn");
      onTelemetry?.({ status: "No path" });
      return;
    }
    pathRef.current = p;
    const CELL = cellRef.current;
    droneRef.current = {
      pathIndex: 0,
      pixelPos: { x: startRef.current.c*CELL+CELL/2, y: startRef.current.r*CELL+CELL/2 },
      heading: 0,
    };
    trailRef.current = [];
    flyingRef.current = true;
    setFlying(true);
    batteryRef.current = 100;
    missionStartTimeRef.current = Date.now();

    onLog?.(`Path found: ${p.length} waypoints. Beginning autonomous flight.`, "ok");
    onTelemetry?.({ status: "En route", progress: 0 });
    draw();

    const missionId = await onMissionEvent?.("start", {
      start: startRef.current,
      destination: destRef.current,
      obstacle_count: obstacleCount,
    });
    missionIdRef.current = missionId || null;

    runDroneLoop();
  }, [draw, obstacleCount, onLog, onMissionEvent, onTelemetry, runDroneLoop]);

  useEffect(() => {
    if (!flying) return;
    const tick = setInterval(() => {
      batteryRef.current = Math.max(2, batteryRef.current - (0.4 + Math.random()*0.3));
      const drone = droneRef.current;
      const path = pathRef.current;
      const remaining = drone && path.length > 1 ? path.length - drone.pathIndex : 0;
      onTelemetry?.({
        status: "En route",
        battery: batteryRef.current,
        speed: 3.2 + Math.random()*0.6,
        confidence: 91 + Math.random()*8,
        distanceRemaining: remaining * 3.1,
        obstacles: obstacleCount,
        progress: path.length > 1 ? (drone.pathIndex / (path.length-1)) * 100 : 0,
        heading: drone ? ((drone.heading*180/Math.PI + 360) % 360) : 0,
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [flying, obstacleCount, onTelemetry]);

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex flex-wrap gap-2 mb-3">
        {[
          { id: "start", label: "Set start" },
          { id: "dest", label: "Set destination" },
          { id: "obstacle", label: "Add obstacle" },
          { id: "erase", label: "Erase obstacle" },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setMode(btn.id)}
            className={`text-xs px-3 py-2 rounded-lg border transition-all ${
              mode === btn.id
                ? "bg-gradient-primary border-transparent text-white shadow-glow"
                : "border-white/10 hover:border-neon-blue/50 hover:bg-white/5"
            }`}
          >
            {btn.label}
          </button>
        ))}
        <button onClick={randomObstacles} className="text-xs px-3 py-2 rounded-lg border border-white/10 hover:border-neon-blue/50 hover:bg-white/5">
          Random obstacles
        </button>
        <button onClick={randomMap} className="text-xs px-3 py-2 rounded-lg border border-white/10 hover:border-neon-blue/50 hover:bg-white/5">
          Random map
        </button>
        <button onClick={resetMap} className="text-xs px-3 py-2 rounded-lg border border-white/10 hover:border-neon-blue/50 hover:bg-white/5">
          Reset map
        </button>
        <button
          onClick={startMission}
          disabled={flying}
          className="text-xs px-4 py-2 rounded-lg btn-gradient font-semibold disabled:opacity-40"
        >
          Start mission
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full rounded-xl border border-white/10 bg-[#070b1a] cursor-crosshair block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-green-500" />Start</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500" />Destination</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-600" />Obstacle</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-neon-cyan" />Planned path</span>
      </div>
    </div>
  );
}
