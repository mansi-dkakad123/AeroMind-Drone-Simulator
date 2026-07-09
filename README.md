# AeroMind — Autonomous Drone Navigation Simulator

A software-only autonomous drone navigation simulator. No real drone, no
IoT hardware, no Arduino/Raspberry Pi/ESP32 — everything is simulated in
the browser and a Python backend.

The drone plans a route from a start point to a destination using the
**A\* search algorithm**, avoids obstacles, and **recalculates its route
in real time** if a new obstacle appears mid-flight.

---

## Project structure

```
project/
├── backend/                 Flask REST API + SQLite database
│   ├── app.py                App factory, blueprint registration
│   ├── models.py             SQLAlchemy models (User, Mission, logs)
│   ├── pathfinding.py        A* algorithm (pure Python)
│   ├── requirements.txt
│   ├── instance/              SQLite database file lives here (created at runtime)
│   └── routes/
│       ├── auth.py           Register / login / me
│       ├── missions.py       Mission CRUD, route calculation, lifecycle
│       ├── analytics.py      Aggregated mission statistics
│       └── utils.py          @login_required decorator
│
└── frontend/                 React + Vite + Tailwind SPA
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx           React entry point
        ├── App.jsx            Route definitions
        ├── pages/              One file per page (see below)
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── AppLayout.jsx   Auth-guarded layout wrapper
        │   ├── StatCard.jsx
        │   └── DroneCanvas.jsx The core simulation engine (A*, canvas, animation)
        ├── hooks/
        │   └── useAuth.jsx     Auth context (login/register/logout)
        ├── services/
        │   └── api.js          Axios client + all backend calls
        └── styles/
            └── index.css       Tailwind + glassmorphism utility classes
```

### Pages
Landing, Login, Signup, Forgot Password, Dashboard, Simulation, Mission
History, Analytics, AI Insights, Settings, Profile, About, Help.

---

## How it works

1. **Simulation page** renders `DroneCanvas`, a 45×28 grid. You click to
   place a start point, a destination, and obstacles (or drag them).
2. Pressing **Start mission** runs A* client-side (for instant response)
   and also calls the backend to create + start a `Mission` row.
3. The drone animates along the path frame-by-frame. If you add an
   obstacle while it's flying, the AI detects the block and reruns A*
   from the drone's current cell to the destination — logged live in the
   AI decision panel.
4. On arrival, the mission is marked `completed` in the backend with its
   distance, duration, average AI confidence and battery used.
5. **Dashboard**, **Mission History**, **Analytics** and **AI Insights**
   all read this data back from the Flask API.

---

## Running it locally

### 1. Backend (Flask + SQLite)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The API starts on `http://localhost:5000`. A SQLite file is created
automatically at `backend/instance/drone_sim.db` on first run.

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies any `/api/*`
request to the Flask backend on port 5000 (see `vite.config.js`), so no
CORS configuration is needed while developing.

### 3. Using the app

1. Sign up for an account.
2. Go to **Simulation**, set a start point, destination, and a few
   obstacles.
3. Click **Start mission** and watch the AI plan and fly the route.
4. Check **Dashboard**, **Mission History**, **Analytics**, and
   **AI Insights** to see the recorded data.

---

## API reference (all under `/api`)

| Method | Endpoint                          | Description                          |
|--------|------------------------------------|---------------------------------------|
| POST   | `/auth/register`                  | Create an account                     |
| POST   | `/auth/login`                     | Log in, returns a bearer token         |
| GET    | `/auth/me`                        | Get the current user                  |
| POST   | `/route/calculate`                | Run A* on a grid, return the path      |
| POST   | `/missions`                       | Create (plan) a mission                |
| GET    | `/missions`                       | List the current user's missions       |
| GET    | `/missions/<id>`                  | Get one mission + its logs             |
| POST   | `/missions/<id>/start`            | Mark in progress                       |
| POST   | `/missions/<id>/pause`            | Pause                                   |
| POST   | `/missions/<id>/resume`           | Resume                                  |
| POST   | `/missions/<id>/stop`             | Abort                                   |
| POST   | `/missions/<id>/complete`         | Mark completed with final stats        |
| POST   | `/missions/<id>/log`              | Append an AI decision log line          |
| POST   | `/missions/<id>/battery`          | Record a battery reading                |
| GET    | `/analytics/summary`              | Aggregated stats across all missions    |

All endpoints except `/auth/*` require an `Authorization: Bearer <token>`
header.

---

## Known limitations / next steps

- Password reset (`Forgot Password`) is a UI-only flow — no email
  delivery is wired up.
- PDF/analytics export and keyboard shortcuts are not yet implemented.
- The frontend runs A* client-side for a snappy UI; `/route/calculate`
  on the backend is the same algorithm and is available for
  server-authoritative route planning if you want to move calculation
  server-side.
