<p align="center">
  <b>A modern MERN-based Learning Management System that verifies identity with Face ID, showcases a live coding portfolio, and empowers administrators with powerful tools.</b>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-0284C7.svg?style=flat-square" alt="License: MIT"/></a>
  <a href="https://github.com/Amanbundela75/LMS-Plateform/stargazers"><img src="https://img.shields.io/github/stars/Amanbundela75/LMS-Plateform.svg?style=flat-square&color=10B981" alt="GitHub stars"/></a>
  <a href="https://github.com/Amanbundela75/LMS-Plateform/issues"><img src="https://img.shields.io/github/issues/Amanbundela75/LMS-Plateform.svg?style=flat-square&color=F59E0B" alt="GitHub issues"/></a>
  <img src="https://img.shields.io/github/last-commit/Amanbundela75/LMS-Plateform?style=flat-square&color=6366F1" alt="Last commit"/>
  <img src="https://img.shields.io/badge/PRs-welcome-22C55E.svg?style=flat-square" alt="PRs welcome"/>
</p>

<p align="center">
  <a href="#-live-deployment">🚀 Live Demo</a> •
  <a href="#-core-features">✨ Features</a> •
  <a href="#-tech-stack">🛠️ Tech Stack</a> •
  <a href="#-getting-started">⚙️ Setup</a> •
  <a href="#-how-to-contribute">🤝 Contribute</a>
</p>

---

## 🚀 Live Deployment
This project is live on **Render**!  

## ✨ Core Features  

### 👨‍🎓 For Students
- 🔐 **Biometric Authentication:** Register/login with **Face ID** for real-time, secure access.  
- 📊 **Dynamic Portfolio:** Syncs coding stats from **LeetCode, GFG, GitHub**.  
- 📈 **Progress Heatmap:** Track daily coding activity (GitHub-style).  
- 🏆 **Achievement Showcase:** Display badges & coding milestones.  
- 🎓 **Academic Dashboard:** Manage semesters, CGPA, projects & certifications.  
- 📚 **Personalized Learning Path:** Enroll in branch-specific courses with one click.  

### 👮 For Administrators
- 🛡️ **Secure Admin Dashboard:** Advanced protected admin controls.  
- 👥 **User Management:** View, filter & manage all registered students.  
- 🔧 **Full CRUD Operations:**  
  - Branches (e.g., CS, Mechanical, etc.)  
  - Courses per branch  
- 👀 **Enrollment Oversight:** Monitor student enrollments & activities.  

---

## 🛠️ Tech Stack

**Frontend:**  
- React.js + Vite  
- TailwindCSS + ShadCN/UI  
- Axios  

**Backend:**  
- Node.js + Express.js  
- JWT Authentication  
- Multer (for file & face data)  

**Database & Auth:**  
- MongoDB Atlas  
- Face Recognition API  
- bcrypt.js  

**Deployment:**  
- Render (Frontend & Backend)  
- MongoDB Atlas (Database)  

---

## ⚙️ Getting Started  

### Prerequisites  
- Node.js **v18+**  
- npm **v9+** or yarn  
- MongoDB (local/Atlas)  
- Git  

---

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/Amanbundela75/LMS-Plateform.git
cd LMS-Plateform

### 2️⃣ Backend Setup
cd backend
npm install


Create a .env file in backend/ with:

PORT=5001
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password


Start backend:

npm start


Runs at 👉 http://localhost:5001

3️⃣ Frontend Setup
cd frontend
npm install


Create .env file in frontend/ with:

VITE_API_URL=http://localhost:5001


Start frontend:

npm run dev


Runs at 👉 http://localhost:5173

🔑 Initial Admin Setup

Register a user from frontend (includes Face ID).

In MongoDB → users collection → update role: "student" → role: "admin".

Re-login → Access Admin Dashboard.

🗺️ Roadmap

 OTP fallback for biometric login

 Real-time notifications (Socket.io)

 Public portfolio links

 Analytics dashboard for admins

 Integration with more coding platforms

🤝 How to Contribute

Fork the repo

Create your branch → git checkout -b feat/YourAmazingFeature

Commit changes → git commit -m "feat: Add YourAmazingFeature"

Push → git push origin feat/YourAmazingFeature

Open a Pull Request 🎉

📝 License

This project is licensed under the MIT License. See LICENSE
 for details.

``` 

<p align="center"> Made with ❤️ by <a href="https://github.com/Amanbundela75">Aman Bundela</a> </p> 
