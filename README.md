# Learning Management System (LMS) Platform

A comprehensive full-stack platform for students to register, enroll in branches, and access relevant courses, with an admin panel for user and content management. Now includes a feedback system for student suggestions and platform improvement!

## 🌟 Overview

This Learning Management System (LMS) is designed to provide a seamless educational experience. Students can register, choose their academic branch or stream, and are then presented with a curated list of courses relevant to their selection. The system prioritizes student privacy, ensuring that individual progress and activities are not visible to other students. Administrators have a dedicated dashboard to manage users, branches, courses, monitor student activity, and review feedback submitted by students.

## 📸 Screenshots

<img width="1366" height="609" alt="Screenshot (47)" src="https://github.com/user-attachments/assets/4cbe00e5-686a-41f6-bfe9-2bad6cedcfd1" />

<img width="1366" height="593" alt="Screenshot (48)" src="https://github.com/user-attachments/assets/987dcde0-ef85-4f4c-bb49-fe4800c67288" />


![Screenshot (20)](https://github.com/user-attachments/assets/3f9bf9d3-309f-49ec-b00c-a0cd42867ece)


![2025-06-05 (7)](https://github.com/user-attachments/assets/1a32b15b-5aec-4e71-a421-62d615843978)


![Screenshot (21)](https://github.com/user-attachments/assets/8ad945ed-f19e-4f13-8f4d-14b6fe3aeba4)


![2025-06-05 (9)](https://github.com/user-attachments/assets/7ec9d91e-9eba-4aa4-9a00-57cb426701dc)


<img width="1366" height="585" alt="Screenshot (51)" src="https://github.com/user-attachments/assets/003edb05-4ddc-467f-bf74-c2609b1ad1fa" />

## ✨ Features

This LMS platform offers a robust set of features for both students and administrators, making learning and management efficient and user-friendly.

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

After starting the backend and frontend, follow these steps to set up your first admin user:
1. **Register a New User:**  
   - Go to the frontend application (or use Postman) and register a new user (e.g., `admin@example.com`).
2. **Promote User to Admin in MongoDB:**  
   - Open your MongoDB database using **MongoDB Compass** or the **mongosh** shell.
   - Navigate to the `users` collection in your LMS database.
   - Locate the user you just registered.
   - Change the user's `role` field from `"student"` (default) to `"admin"`.
Example in MongoDB Compass:  
   - Find the user document, click "Edit", and update `"role": "admin"`.
 Example in mongosh:
   ```js
   use lms_database
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )

   ```
3. **Log in as Admin:**  
   - Go back to the frontend and log in using the updated admin credentials.
   - You now have access to all admin functionalities, including user/course/branch management and viewing student feedback.

---

## 🔧 Usage

**For Students:**
- Register an account and log in.
- Select your academic branch/stream.
- Browse and enroll in courses relevant to your branch.
- Track your progress in each course from the dashboard.
- Manage your profile and update branch/password details.
- Submit feedback to help improve the platform (feedback is only visible to admins).
  
**For Admins:**
- Log in using admin credentials.
- Access the **Admin Dashboard** for complete control over users, branches, courses, and enrollments.
- Create, edit, or delete branches and courses.
- Assign courses to branches and monitor student enrollments.
- View detailed activity logs and feedback submitted by students to enhance platform quality.
- Manage user roles and oversee platform engagement.

**Best Practice:**  
Admins should create branches first, then add courses, and assign each course to the appropriate branch for a structured catalog.
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

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Your involvement in this project—whether you're fixing bugs, adding features, improving documentation, or sharing feedback—is highly valued and helps make the LMS better for everyone.

We welcome contributions from everyone, regardless of experience level. If you have ideas or improvements, please don't hesitate to get involved!

**How to contribute:**

1. **Fork the Repository**  
   Click the **Fork** button at the top right of this repo to create your own copy.
**2. Clone Your Fork & Create a Feature Branch**  
Clone your fork locally and create a new branch for your changes:
```bash
git clone https://github.com/YOUR-USERNAME/LMS-Plateform.git
cd LMS-Plateform
git checkout -b feature/YourFeatureName
```
**3. Make Your Changes**  
- Write clear, well-documented code.
- If adding a feature, update the README and relevant docs.
- Try to keep each pull request focused on a single change or improvement.
**4. Test Your Changes**  
- Run tests (if available) and make sure your code works as expected.
- Test the affected frontend or backend portions locally.
**5. Commit Your Changes**  
Use clear, descriptive commit messages:
```bash
git add .
git commit -m "feat: Brief description of your change"
```
**6. Push to Your Fork**  
```bash
git push origin feature/YourFeatureName
```
**7. Open a Pull Request**  
- Go to your forked repository on GitHub.
- Click **New Pull Request**.
- Select your feature branch and clearly describe your changes.
- Link any related issues if applicable.
- Wait for review and feedback from maintainers.
  
### Contribution Guidelines  
- **Open an issue** for discussions on major changes or new features before submitting a pull request.
- **Follow the existing coding style and conventions** in the project.

## 📝 License
© 2025 Aman's Platform. All rights reserved.

## 🧑‍💻 Author
    * Aman Bundela
    
* **Aman Bundela** - [Amanbundela75](https://github.com/Amanbundela75)
    * Project Link: [https://github.com/Amanbundela75/LMS-Plateform](https://github.com/Amanbundela75/LMS-Plateform)
