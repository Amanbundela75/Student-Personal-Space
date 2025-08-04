const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler.js');
const User = require('../models/User.js');

// Middleware 1: Protect (User ko authenticate karta hai)
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Step 1: Request se token nikalne ki koshish karein.
    // Hum pehle 'Authorization' header check karenge, jo standard tareeka hai.
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token ko "Bearer <token>" string se alag karein
            token = req.headers.authorization.split(' ')[1];
        } catch (error) {
            console.error("Token parsing error:", error);
            res.status(401);
            throw new Error('Not authorized, token format is incorrect.');
        }
    }
    // Agar header mein token nahi hai, to cookie check karein (alternative method)
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    // Step 2: Agar token mil gaya hai, to use verify karein.
    if (token) {
        try {
            // Token ko secret key ke saath verify karein
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Decoded token se user ID nikal kar database se user ka data fetch karein
            // Aur use `req.user` mein save kar dein taaki aage ke routes use istemal kar sakein
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user for this token not found.');
            }

            next(); // Sab theek hai, agle function par jaayein
        } catch (error) {
            console.error("Token verification failed:", error.message);
            res.status(401);
            // Error message ko saaf rakhein
            throw new Error('Not authorized, token verification failed. Please log in again.');
        }
    } else {
        // Step 3: Agar koi bhi token nahi mila.
        res.status(401);
        throw new Error('Not authorized, no token provided.');
    }
});


// Middleware 2: Authorize (Check karta hai ki user ka role sahi hai ya nahi)
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized, user not found');
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