const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js');

// Load env vars (MUST be at the very top before any other imports that might use them)
dotenv.config();

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes.js');
const branchRoutes = require('./routes/branchRoutes.js');
const courseRoutes = require('./routes/courseRoutes.js');
const enrollmentRoutes = require('./routes/enrollmentRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes (configure specific origins in production)
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded request bodies

// Mount routers
app.use('/api/auth.js', authRoutes);
app.use('/api/branches.js', branchRoutes);
app.use('/api/courses.js', courseRoutes);
app.use('/api/enrollments.js', enrollmentRoutes);
app.use('/api/admin.js', adminRoutes);

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


const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
    console.log(
        `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    // Close server & exit process (optional: might want a more graceful shutdown)
    // server.close(() => process.exit(1));
});