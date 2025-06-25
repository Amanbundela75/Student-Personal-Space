const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler.js');
const User = require('../models/User.js');

// Middleware 1: Protect (Check karta hai ki user logged in hai ya nahi)
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Tareeka 1: HTTP-Only cookie se JWT token padhna
    token = req.cookies.jwt;

    // Tareeka 2: Agar cookie mein token nahi hai, to Authorization header se padhna
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Header se token nikalna (format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];
        } catch (error) {
            console.error("Bearer token ko parse karne mein error:", error);
            res.status(401);
            throw new Error('Not authorized, token ka format galat hai');
        }
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // --- YAHAN PAR FIX KIYA GAYA HAI ---
            // 'decoded.userId' ki jagah 'decoded.id' ka istemal karein
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Agle middleware par jaana
        } catch (error) {
            console.error(error); // Asli error ko console mein dekhne ke liye
            res.status(401);
            throw new Error('Not authorized, token fail ho gaya');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, koi token nahi mila'); // Error message ko aasan banaya
    }
});


// Middleware 2: Authorize (Check karta hai ki user ka role sahi hai ya nahi)
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized, user nahi mila');
        }
        if (!roles.includes(req.user.role)) {
            res.status(403); // Forbidden
            throw new Error(`User role '${req.user.role}' is not authorized for this route`);
        }
        next();
    };
};

// Middleware 3: Admin (Sirf admin ko check karne ka shortcut)
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

// Teeno functions ko export karein
module.exports = { protect, authorize, admin };