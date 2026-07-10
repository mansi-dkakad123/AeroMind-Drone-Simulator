# 🚁 AeroMind – Autonomous Drone Navigation Simulator

A software-based autonomous drone navigation simulator built using **React, Flask, SQLite, Docker, and GitHub Actions**. The application simulates autonomous drone navigation using the **A* Pathfinding Algorithm**, enabling intelligent route planning, obstacle avoidance, and real-time path recalculation without any physical drone hardware.

---

## ✨ Features

- Autonomous Drone Navigation
- A* Pathfinding Algorithm
- Dynamic Obstacle Avoidance
- Real-time Route Recalculation
- User Authentication (Login & Signup)
- Mission Management
- Analytics Dashboard
- AI Decision Logs
- Responsive User Interface
- Dockerized Application
- CI/CD Pipeline using GitHub Actions

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS

### Backend
- Flask
- SQLAlchemy
- SQLite

### DevOps
- Docker
- Docker Compose
- GitHub Actions

---

## 📁 Project Structure

```text
project/
├── backend/
├── frontend/
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci-cd.yml
└── README.md
```

---

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/mansidhakad/AeroMind-Drone-Simulator.git
cd AeroMind-Drone-Simulator/project
```

### Run Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Application URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 🐳 Docker

Build and start the application:

```bash
docker compose up --build
```

Stop containers:

```bash
docker compose down
```

---

## 🔄 CI/CD Pipeline

GitHub Actions automatically:

- Builds Docker images
- Pushes images to Docker Hub
- Automates the build workflow on every push to the `main` branch

---

## 📌 Future Enhancements

- Email-based Password Reset
- PDF Report Export
- Cloud Deployment (AWS/Azure)
- Live Drone Telemetry
- Advanced AI Navigation

---

## 👩‍💻 Author

**Mansi Dhakad**

B.Tech – Computer Science & Engineering

Jaypee University of Engineering and Technology, Guna

GitHub: https://github.com/mansi-dkakad123