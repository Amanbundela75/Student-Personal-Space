const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db.js');
const cookieParser = require('cookie-parser');
const faceapi = require('face-api.js');
const canvas = require('canvas');

// --- Route Files ---
const authRoutes = require('./routes/authRoutes.js');
const branchRoutes = require('./routes/branchRoutes.js');
const courseRoutes = require('./routes/courseRoutes.js');
const enrollmentRoutes = require('./routes/enrollmentRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const testRoutes = require('./routes/TestRoutes');
const userRoutes = require('./routes/userRoutes.js');
const feedbackRoutes = require('./routes/feedbackRoutes.js');
const portfolioRoutes = require('./routes/portfolioRoutes.js');
const achievementRoutes = require('./routes/achievementRoutes.js');
const roadmapRoutes = require('./routes/roadmapRoutes.js'); // <-- 1. Naya route import karein
// --- Face-API Setup ---
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

dotenv.config();

// --- Load Models ---
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

connectDB();
const app = express();

// --- Middleware ---
app.use(cors({ origin: 'http://localhost:5173', credentials: true, optionsSuccessStatus: 200 }));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- Automatically create 'uploads' directory ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log(`Created directory: ${uploadsDir}`);
}

// --- Static Folder for Uploads ---
app.use('/uploads', express.static(uploadsDir));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/roadmaps', roadmapRoutes); // <-- 2. Naye route ko register karein
app.use('/api/v1/portfolio', portfolioRoutes);

app.get('/', (req, res) => res.send('LMS API is alive and running...'));

// --- Error Handling ---
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err.message);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

const PORT = process.env.PORT || 5001;

loadModels().then(() => {
    app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
});

process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Rejection: ${err.message}`);
});
