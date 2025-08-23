<!--
  Apex LMS — Enhanced README (single-file version)
  Notes:
  - This README references optional assets (assets/banner.gif and assets/demo/*.gif). If you don't add them yet, the README still works—images will just not render.
  - The CI badge will become live only if/when you add a workflow at .github/workflows/ci.yml.
-->

<p align="center">
  <img src="assets/banner.gif" alt="Apex LMS Banner" width="100%"/>
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=28&duration=3500&pause=1200&color=4F46E5&center=true&vCenter=true&multiline=true&repeat=true&width=900&lines=Apex+LMS+—+Secure+Biometric+Learning+%26+Portfolio+Platform;Face+Login+%7C+Real-time+Portfolio+%7C+Admin+Controls" alt="Apex LMS Typing Banner"/>
</p>

<p align="center">
  <a href="https://github.com/Amanbundela75/LMS-Plateform/actions/workflows/ci.yml"><img src="https://github.com/Amanbundela75/LMS-Plateform/actions/workflows/ci.yml/badge.svg" alt="CI Status"/></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-4F46E5.svg?style=flat-square" alt="License: MIT"/></a>
  <a href="https://github.com/Amanbundela75/LMS-Plateform/stargazers"><img src="https://img.shields.io/github/stars/Amanbundela75/LMS-Plateform.svg?style=flat-square&color=10B981" alt="GitHub stars"/></a>
  <a href="https://github.com/Amanbundela75/LMS-Plateform/issues"><img src="https://img.shields.io/github/issues/Amanbundela75/LMS-Plateform.svg?style=flat-square&color=F59E0B" alt="GitHub issues"/></a>
  <img src="https://img.shields.io/github/last-commit/Amanbundela75/LMS-Plateform?style=flat-square" alt="Last commit"/>
  <img src="https://img.shields.io/badge/PRs-welcome-22C55E.svg?style=flat-square" alt="PRs welcome"/>
</p>

<p align="center">
  <b>A modern MERN-based Learning Management System that verifies identity with Face ID, showcases a live coding portfolio, and gives administrators powerful control over branches and courses.</b>
</p>

<p align="center">
  <a href="#-live-demo--screenshots">Demo</a> •
  <a href="#-core-features">Features</a> •
  <a href="#-architecture--workflows">Architecture</a> •
  <a href="#-getting-started">Setup</a> •
  <a href="#-how-to-contribute">Contribute</a> •
  <a href="#-license">License</a>
</p>

---

# 🎓 Apex LMS: Secure Biometric Learning & Portfolio Platform

Apex LMS is a modern, full-stack Learning Management System designed to be a student's central hub for their entire academic and professional journey. It features secure biometric face verification for logins, a dynamic professional portfolio tracker, and comprehensive administrative controls.

- Repository: https://github.com/Amanbundela75/LMS-Plateform
- License: MIT
- Stack: React (Vite) • Node.js • Express • MongoDB • face-api.js

---

## ✨ Why This Project?

In today's competitive world, a student's profile is more than just grades. Apex LMS was built to address this by:

1. Enhancing Security: Robust biometric verification eliminates password fraud and unauthorized access.
2. Centralizing Professional Growth: Unified tracking of courses, coding stats, projects, and achievements.
3. Bridging Academia and Industry: Mentors and university reps get real-time insight and can guide effectively.

---

## 🚀 Live Demo & Screenshots

[🚀 Live Demo — Coming Soon]

Place your GIFs in assets/demo and update paths as needed:

| Face Recognition Login | Student Portfolio Dashboard | Admin Course Management |
| :--------------------: | :-------------------------: | :---------------------: |
| <img src="assets/demo/login.gif" width="100%" alt="Face Login Demo"/> | <img src="assets/demo/dashboard.gif" width="100%" alt="Dashboard Demo"/> | <img src="assets/demo/admin.gif" width="100%" alt="Admin Demo"/> |

<details>
  <summary>See more demos</summary>
  <br/>
  <img src="assets/demo/portfolio-heatmap.gif" width="49%" alt="Portfolio Heatmap"/>
  <img src="assets/demo/course-enroll.gif" width="49%" alt="Course Enrollment"/>
</details>

Tips for lightweight GIFs:
- Keep each clip 6–12 seconds, under ~6–10 MB.
- 1280x720 or 1080p; trim extra frames; compress with Gifsicle/Ezgif.
- Tools: ScreenToGif (Win), Kap (macOS), Peek (Linux), OBS/ffmpeg.

---

## 🌟 Core Features

### 👨‍🎓 For Students
- Secure Biometric Authentication
  - Face ID Registration to create a unique biometric template.
  - Real-time Face Login for accurate and secure access.
  - Intelligent Error Handling for mismatches, no face detected, etc.
- Dynamic Professional Portfolio
  - Live Coding Stats Sync (LeetCode, GFG, etc.).
  - GitHub-style Activity Heatmap to visualize daily progress.
  - Achievement & Badge Showcase from multiple platforms.
- Academic & Project Dashboard
  - Card-based overview for semester, CGPA, SGPA.
  - Project Showcase with status and GitHub links.
- Personalized Learning Path
  - Curated courses per academic branch with one-click enrollment.

### 👮 For Administrators
- Secure Admin Dashboard with protected routes.
- Comprehensive User Management with filtering and pagination.
- Full CRUD
  - Branch Management (e.g., Mechanical, Electronics).
  - Course Management with descriptions and branch assignment.
- Enrollment Oversight across courses and students.

---

## 🛠️ Tech Stack & Architecture

- Frontend: React (Vite), React Router, Context API, face-api.js, Axios, Chart.js, React Calendar Heatmap
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt.js, express-validator, Multer
- DevOps: GitHub Actions CI, Prettier

### Architecture at a Glance

```mermaid
flowchart LR
  A[Browser (React + Vite)] --> B[face-api.js Models]
  A -->|JWT| C[REST API (Express)]
  C --> D[(MongoDB)]
  C -->|Images/Uploads| E[Multer Storage]
  A --> F[3rd Party Stats APIs\n(LeetCode/GFG/GitHub)]
  subgraph Frontend
    A
    B
  end
  subgraph Backend
    C
    E
  end
  D:::db
classDef db fill:#F5F3FF,stroke:#A78BFA,stroke-width:1px;
```

### Face Login Workflow

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant FE as Frontend (React)
  participant FAI as face-api.js
  participant BE as Backend (Express)
  participant DB as MongoDB

  U->>FE: Open Login
  FE->>FAI: Load face models
  FE->>U: Request camera permission
  U-->>FE: Grant access
  FE->>FAI: Capture face embedding
  FE->>BE: POST /api/auth/face {embedding}
  BE->>DB: Find user by embedding (nearest match)
  DB-->>BE: User match / no match
  BE-->>FE: JWT token or error
  FE-->>U: Login success or error message
```

---

## ⚙️ Continuous Integration (Optional)

A CI badge is shown above and will go live if you add a GitHub Actions workflow at:
- .github/workflows/ci.yml

Suggested CI steps (backend and frontend):
- Install dependencies
- Lint, Test, Build (use npm run <script> --if-present so it won’t fail if a script is missing)
- Cache node_modules for speed

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+) or yarn
- MongoDB (local or Atlas)
- Git

### Installation & Setup

1) Clone the Repository
```bash
git clone https://github.com/Amanbundela75/LMS-Plateform.git
cd LMS-Plateform
```

2) Backend Setup
```bash
cd backend
npm install
```

Create backend/.env:
```env
PORT=5001
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY_OF_32_CHARACTERS
```

- Face Recognition Models: Ensure face-api.js models are available (e.g., public/models or a models directory you load from).
- Start backend:
```bash
npm start
```
Server: http://localhost:5001

3) Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Vite proxies /api to http://localhost:5001 by default.
App: http://localhost:5173

### Initial Admin User Setup

1) Register a new user (with face verification)  
2) Promote to Admin
   - Open MongoDB (Atlas UI, Compass, or mongosh)
   - users collection → your user → set role: "admin"
3) Login as Admin to access admin routes

---

## 🧩 Tips for Great Demos (Animated)

- Add your GIFs to assets/demo and update the paths above.
- Keep each GIF under ~6–10 MB for fast loading.
- Tools: ScreenToGif (Windows), Kap (macOS), Peek (Linux), OBS/ffmpeg.

Quick ffmpeg commands:
```bash
# Basic
ffmpeg -i input.mp4 -vf "fps=12,scale=1280:-1:flags=lanczos" -loop 0 output.gif

# Higher quality with palette
ffmpeg -i input.mp4 -vf "fps=12,scale=1280:-1:flags=lanczos,palettegen" -y palette.png
ffmpeg -i input.mp4 -i palette.png -lavfi "fps=12,scale=1280:-1:flags=lanczos,paletteuse" -loop 0 output.gif
```

---

## 🗺️ Roadmap

- [ ] Add OTP fallback for biometric login
- [ ] WebAuthn passkeys integration
- [ ] Real-time notifications (Socket.io)
- [ ] Public student portfolio links
- [ ] Role-based analytics dashboard

---

## 🤝 How to Contribute

1) Fork
2) Create a feature branch: git checkout -b feat/amazing
3) Commit: git commit -m "feat: add amazing feature"
4) Push: git push origin feat/amazing
5) Open a Pull Request

---

## 📝 License

MIT © 2025 Aman Bundela — See LICENSE for details.

---

## 🧑‍💻 Author

- Aman Bundela
- GitHub: @Amanbundela75
- Project: https://github.com/Amanbundela75/LMS-Plateform
