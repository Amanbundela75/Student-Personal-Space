# Learning Management System (LMS) with Face 

A secure, full-stack platform for students to manage their academic and professional journey. This LMS features biometric face verification for login, a dynamic professional dashboard, and comprehensive admin controls.

## 🌟 Overview

This Learning Management System (LMS) is designed to be a central hub for a student's entire college lifecycle. It goes beyond simple course enrollment by integrating **biometric face verification** for secure, fraud-proof logins.

Once registered, students are welcomed to a **professional, LinkedIn-style dashboard** where they can manage their academic progress (semester, CGPA, SGPA), showcase their projects with GitHub links, and share updates and achievements in a dynamic activity feed. The platform ensures student privacy while providing powerful tools for administrators to manage users, courses, and platform content.

## 📸 Screenshots

Upload it Soon....

## ✨ Features

### 👨‍🎓 For Students:

*   **Secure Biometric Authentication:**
    *   **Registration with Face ID:** Users register their face during signup, creating a unique biometric profile.
    *   **Face Verification Login:** Login is protected by face recognition, ensuring that only the authorized user can access the account.
    *   **Specific Error Handling:** Clear error messages for face mismatch vs. other login issues.
*   **Dynamic Professional Dashboard:**
    *   **Academic Snapshot:** View and edit current semester, CGPA, and SGPA in a clean, card-based layout.
    *   **Project Showcase:** Add, edit, and display personal projects, including status (e.g., "In Progress", "Completed") and a direct link to the GitHub repository.
    *   **Activity Feed:** A social-media-style feed to share updates, achievements, or conference experiences. Users can add text, images, videos, and external links.
*   **Public/Private Portfolio:**
    *   A dedicated portfolio page to showcase coding profiles (LeetCode, GFG, etc.), badges earned, and a GitHub-style activity heatmap.
*   **Personalized Learning Path:**
    *   Select an academic branch (e.g., Computer Science) to see a curated list of relevant courses.
    *   Enroll in courses with a single click.

### 👮 For Administrators:

*   **Secure Admin Access:** Dedicated login for users with admin privileges.
*   **Comprehensive User Management:** View and manage all registered users.
*   **Student Activity Monitoring:** Track key student engagement metrics.
*   **Full CRUD for Content:**
    *   **Branches:** Create, Read, Update, and Delete academic branches.
    *   **Courses:** Create, Read, Update, and Delete courses and assign them to specific branches.
*   **Enrollment Oversight:** View which students are enrolled in which courses.

## 🛠️ Tech Stack

*   **Frontend:**
    *   React.js (with Vite)
    *   React Router for navigation
    *   Context API for state management
    *   Axios for API calls
    *   `react-webcam` for face capture
    *   `react-chartjs-2` & `react-calendar-heatmap` for data visualization
    *   `react-icons` for UI icons
*   **Backend:**
    *   Node.js & Express.js
    *   MongoDB with Mongoose
    *   JSON Web Tokens (JWT) for authentication
    *   Bcrypt.js for password hashing
    *   **Face Recognition Library** *(Bhai, yahan par jo library use kar rahe ho, jaise `face-api.js`, uska naam likh dena)*
    *   `multer` for handling image uploads
*   **Database:**
    *   MongoDB (Atlas or local)
*   **Version Control:**
    *   Git & GitHub

## 🚀 Getting Started

Follow these steps to get a local copy of the project up and running.

### Prerequisites

*   Node.js (v16.x or later)
*   npm or yarn
*   MongoDB (local instance or a cloud-based service like Atlas)
*   Git

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Amanbundela75/LMS-Plateform.git
    cd LMS-Plateform
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory and add the following:
    ```env
    PORT=5001
    MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
    JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY
    ```
    Start the backend server:
    ```bash
    npm start
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    ```
    Create a `.env` file in the `frontend` directory:
    ```env
    VITE_API_URL=http://localhost:5001/api
    ```
    Start the frontend development server:
    ```bash
    npm run dev
    ```

### Initial Admin User Setup

1.  **Register a New User:** Use the application's registration page to create a new account.
2.  **Promote to Admin in MongoDB:**
    *   Connect to your MongoDB database.
    *   In the `users` collection, find the user you just created.
    *   Change their `role` field from `"student"` to `"admin"`.
3.  **Log in as Admin:** You can now log in with the admin credentials to access the admin dashboard.

---
## 🔧 Project Structure
```bash
lms-project/
├── backend/
│   ├── controllers/    # Request handling logic
│   ├── middleware/     # Auth and admin middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   └── server.js       # Server entry point
│
└── frontend/
    ├── src/
    │   ├── api/          # API call functions
    │   ├── components/   # Reusable React components (auth, dashboard, etc.)
    │   ├── contexts/     # React Context (AuthContext)
    │   ├── pages/        # Page-level components
    │   ├── App.jsx       # Main app component with routing
    │   └── main.jsx      # Application entry point
    └── index.html
```

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📝 License

© 2025 Aman's Platform. All rights reserved.

## 🧑‍💻 Author

*   **Aman Bundela** - [Amanbundela75](https://github.com/Amanbundela75)
*   Project Link: [https://github.com/Amanbundela75/LMS-Plateform](https://github.com/Amanbundela75/LMS-Plateform)
