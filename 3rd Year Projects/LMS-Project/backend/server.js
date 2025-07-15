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
const feedbackRoutes = require('./routes/feedbackRoutes.js'); // <-- Feedback route import

// --- Face-API.js ke liye zaroori setup ---
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load environment variables
dotenv.config();

// --- Models ko load karne ka function ---
async function loadModels() {
    console.log("Loading Face-API models...");
    try {
        // Models ko 'backend/models' directory se load karein
        const modelPath = path.join(__dirname, 'models');
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
        console.log("Face-API models loaded successfully.");
    } catch (error) {
        console.error("Error loading Face-API models:", error);
        // Agar model load na ho to server ko band kar dein
        process.exit(1);
    }
}

// Database connection
connectDB();

const app = express();

// --- CORS Middleware ---
const corsOptions = {
    origin: 'http://localhost:5173', // Aapka frontend ka URL
    credentials: true, // Cookies ke liye zaroori
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(cookieParser());

// --- Body Parser Middleware ---
// JSON payload ke size ko badhayein (face-api base64 string ke liye)
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
app.use('/api/feedback', feedbackRoutes); // <-- Feedback route register

// Simple root route
app.get('/', (req, res) => {
    res.send('LMS API is alive and running...');
});

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

const PORT = process.env.PORT || 5001;

// --- Server start karne se pehle models load karein ---
loadModels().then(() => {
    app.listen(PORT, () =>
        console.log(
            `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
        )
    );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Rejection: ${err.message}`);
});