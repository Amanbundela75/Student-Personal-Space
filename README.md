# Learning Management System (LMS) Platform

A comprehensive full-stack platform for students to register, enroll in branches, and access relevant courses, with an admin panel for user and content management.

## 🌟 Overview

This Learning Management System (LMS) is designed to provide a seamless educational experience. Students can register, choose their academic branch or stream, and are then presented with a curated list of courses relevant to their selection. The system prioritizes student privacy, ensuring that individual progress and activities are not visible to other students. Administrators have a dedicated dashboard to manage users, branches, courses, and monitor student activity status on the platform.

## 📸 Screenshots

![2025-06-16](https://github.com/user-attachments/assets/cb1d0603-17ed-4494-9bcc-1bcf7fe131a5)

![Screenshot (20)](https://github.com/user-attachments/assets/3f9bf9d3-309f-49ec-b00c-a0cd42867ece)

![2025-06-05 (7)](https://github.com/user-attachments/assets/1a32b15b-5aec-4e71-a421-62d615843978)

![Screenshot (21)](https://github.com/user-attachments/assets/8ad945ed-f19e-4f13-8f4d-14b6fe3aeba4)

![2025-06-05 (9)](https://github.com/user-attachments/assets/7ec9d91e-9eba-4aa4-9a00-57cb426701dc)


## ✨ Features

This LMS platform is packed with features designed for both students and administrators, ensuring a smooth and effective learning and management experience.

### 👨‍🎓 For Students:

* **Secure User Authentication:**
    * Easy-to-use registration with email and password.
    * Secure login with JWT (JSON Web Tokens) based sessions.
    * Password hashing for enhanced security.
    * (Future Plane: Email verification for new accounts).
* **Personalized Learning Path:**
    * **Branch/Stream Selection:** Students can select their preferred academic branch (e.g., Computer Science, Business Administration) upon registration or from their profile.
    * **Tailored Course Catalog:** The system dynamically displays courses relevant only to the student's chosen branch, providing a focused learning environment.
* **Course Interaction:**
    * **Detailed Course Information:** View descriptions, (optional: instructors, modules) for each course.
    * **Simple Enrollment:** One-click enrollment into available courses within their branch.
* **Student Dashboard & Profile:**
    * **My Courses:** A dedicated section to view all enrolled courses.
    * **Progress Tracking:** Monitor progress within each course.
    * **(Future Plane: Access Course Materials:** Direct access to course content like videos, documents, etc.)
    * **Profile Management:** Students can view and update their personal details (name, and optionally, their selected branch or password).
* **Privacy First:**
    * Student activities, course enrollments, and progress are kept private and are not visible to other students.

### 👮 For Administrators:

* **Secure Admin Access:** Dedicated login for users with admin privileges.
* **Comprehensive User Management:**
    * View a complete list of all registered users (students and other administrators).
    * Access detailed information for each user.
* **Student Activity Monitoring:**
    * Track key student activity indicators, such as their last login timestamp, to gauge platform engagement.
* **Branch & Stream Management (Full CRUD):**
    * **Create:** Add new academic branches or streams to the platform.
    * **Read:** View a list of all available branches.
    * **Update:** Modify the name or description of existing branches.
    * **Delete:** Remove branches (with considerations for associated courses).
* **Course Management (Full CRUD):**
    * **Create:** Add new courses, including title, detailed description, and (optional) instructor information.
    * **Assign to Branch:** Link each course to a specific academic branch.
    * **Read:** View all courses, with options to filter by branch.
    * **Update:** Modify details of existing courses.
    * **Delete:** Remove courses from the platform (with considerations for student enrollments).
* **Enrollment Oversight:**
    * View a comprehensive list of all student enrollments across all courses.
    * See which students are enrolled in which courses.
    
* **Backend:**
    * Node.js
    * Express.js
    * MongoDB (with Mongoose ODM)
    * JSON Web Tokens (JWT) for authentication
    * Bcrypt.js for password hashing
    * CORS
      
* **Database:**
    * MongoDB (e.g., MongoDB Atlas or local instance)

* **Version Control:**
    * Git & GitHub

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v14.x or later recommended)
* npm (Node Package Manager)
* MongoDB (Ensure you have a running instance - local or Atlas)
* Git

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Amanbundela75/LMS-Plateform.git](https://github.com/Amanbundela75/LMS-Plateform.git)
    cd LMS-Plateform
    ```
    2.  **Backend Setup:**
    * Navigate to the backend directory:
        ```bash
        cd backend
        ```
    * Install backend dependencies:
        ```bash
        npm install
        ```
    * Create a `.env` file in the `backend` directory and add the following environment variables:
        ```env
        PORT=5001
        MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
        JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY
        ```
        *(Replace `YOUR_MONGODB_CONNECTION_STRING` and `YOUR_SUPER_SECRET_JWT_KEY` with your actual values.)*
    * Start the backend server:
        ```bash
        npm start
        ```
        *(The backend server should now be running, typically on `http://localhost:5001`)*

3.  **Frontend Setup:**
    * Open a new terminal and navigate to the frontend directory:
        ```bash
        cd ../frontend
        # Or from the root: cd frontend
        ```
    * Install frontend dependencies:
        ```bash
        npm install
        ```
    * Create a `.env` file in the `frontend` directory and add the following environment variable:
        ```env
        VITE_API_URL=http://localhost:5001/api
        ```
        *(Ensure this matches your backend API's base URL.)*
    * Start the frontend development server:
        ```bash
        npm run dev
        # Or npm start, depending on your package.json script for Vite
        ```
        *(The frontend should now be running, typically on `http://localhost:5173` and will open in your browser.)*

### Initial Admin User Setup

1.  After starting the backend, register a new user via the frontend application or Postman (e.g., `admin@example.com`).
2.  Manually access your MongoDB database (using MongoDB Compass or `mongosh`).
3.  Navigate to the `users` collection in your `lms_database`.
4.  Find the user you just registered and update their `role` field from `"student"` (default) to `"admin"`.
5.  You can now log in with these admin credentials to access admin functionalities.

## 🔧 Usage

* **Students:** Register, log in, select a branch, browse courses for that branch, and enroll.
* **Admin:** Log in with admin credentials. Navigate to the "Admin Dashboard" to manage users, branches, and courses.
    * **Creating Branches/Courses:** It's recommended to create branches first, then courses, assigning them to the appropriate branch.
      
```bash
lms-project/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Request handling logic
│   ├── middleware/     # Custom middleware (auth, admin)
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API route definitions
│   ├── .env            # Environment variables
│   └── server.js       # Main backend server entry point
│
└── frontend/
    ├── public/         # Static assets (index.html, favicon)
    ├── src/
    │   ├── api/          # Functions for backend API calls
    │   ├── assets/       # Local images, fonts, etc.
    │   ├── components/   # Reusable React components
    │   ├── contexts/     # React Context (AuthContext etc.)
    │   ├── pages/        # Page-level components
    │   ├── App.jsx       # Main app component
    │   ├── main.jsx      # Vite entry point
    │   ├── index.css     # Global styles
    │   └── .env          # Frontend env variables
    └── index.html      # Root HTML for Vite
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📝 License
© 2025 Aman's Platform. All rights reserved.

## 🧑‍💻 Author
    * Aman Bundela
    
* **Aman Bundela** - [Amanbundela75](https://github.com/Amanbundela75)
    * Project Link: [https://github.com/Amanbundela75/LMS-Plateform](https://github.com/Amanbundela75/LMS-Plateform)
