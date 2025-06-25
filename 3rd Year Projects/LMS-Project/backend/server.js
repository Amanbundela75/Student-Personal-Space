const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db.js');
const cookieParser = require('cookie-parser');
// --- (1) Saare Route Files ko Sahi se Import Karein ---
const authRoutes = require('./routes/authRoutes.js');
const branchRoutes = require('./routes/branchRoutes.js');
const courseRoutes = require('./routes/courseRoutes.js');
const enrollmentRoutes = require('./routes/enrollmentRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const testRoutes = require('./routes/testRoutes');
const userRoutes = require('./routes/userRoutes.js'); // <-- YAHAN JODEIN (1/2)

// Load environment variables
dotenv.config();

// Database connection
connectDB();

const app = express();

// --- (2) CORS Middleware ---
const corsOptions = {
    origin: 'http://localhost:5173', // Aapka frontend ka URL
    credentials: true, // Cookies ke liye zaroori
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(cookieParser());
// --- (3) Body Parser Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- (4) ROUTES KO REGISTER KAREIN ---
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/users', userRoutes); // <-- YAHAN JODEIN (2/2)

// Simple root route
app.get('/', (req, res) => {
    res.send('LMS API is alive and running...');
});

// Basic Error Handling Middleware (example - can be more sophisticated)
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
    console.log(
        `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Rejection: ${err.message}`);
});