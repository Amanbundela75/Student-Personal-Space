const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db.js');
const cookieParser = require('cookie-parser');
const faceapi = require('face-api.js');
const canvas = require('canvas');

// --- (1) Saare Route Files ko Sahi se Import Karein ---
const authRoutes = require('./routes/authRoutes.js');
const branchRoutes = require('./routes/branchRoutes.js');
const courseRoutes = require('./routes/courseRoutes.js');
const enrollmentRoutes = require('./routes/enrollmentRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const testRoutes = require('./routes/testRoutes');
const userRoutes = require('./routes/userRoutes.js');
const feedbackRoutes = require('./routes/feedbackRoutes.js');
const portfolioRoutes = require('./routes/portfolioRoutes.js');

// --- Face-API.js ke liye zaroori setup ---
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load environment variables
dotenv.config();

// --- Models ko load karne ka function ---
async function loadModels() {
    console.log("Loading Face-API models...");
    try {
        const modelPath = path.join(__dirname, 'models');
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
        console.log("Face-API models loaded successfully.");
    } catch (error) {
        console.error("Error loading Face-API models:", error);
        process.exit(1);
    }
}

// Database connection
connectDB();

const app = express();

// --- CORS Middleware ---
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(cookieParser());

// --- Body Parser Middleware ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- ROUTES KO REGISTER KAREIN ---
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/portfolio', portfolioRoutes);

// Simple root route
app.get('/', (req, res) => {
    res.send('LMS API is alive and running...');
});

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Error Handling Middleware
// 'next' ko '_next' kar diya gaya hai taaki linter warning na de
app.use((err, req, res, _next) => {
    console.error("Global Error Handler:", err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

const PORT = process.env.PORT || 5001;

loadModels().then(() => {
    app.listen(PORT, () =>
        console.log(
            `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
        )
    );
});

// Handle unhandled promise rejections
// 'promise' ko '_promise' kar diya gaya hai
process.on('unhandledRejection', (err, _promise) => {
    console.error(`Unhandled Rejection: ${err.message}`);
});