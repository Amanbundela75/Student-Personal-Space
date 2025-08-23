const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler.js');
const User = require('../models/User.js');

// Middleware 1: Protect (User ko authenticate karta hai)
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
        } catch (error) {
            console.error("Token parsing error:", error);
            res.status(401);
            throw new Error('Not authorized, token format is incorrect.');
        }
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user for this token not found.');
            }
            next();
        } catch (error) {
            console.error("Token verification failed:", error.message);
            res.status(401);
            throw new Error('Not authorized, token verification failed. Please log in again.');
        }
    } else {
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

// === ADMIN MIDDLEWARE UPDATE START ===
// Middleware 3: Admin (Sirf admin ko check karne ka shortcut)
const admin = (req, res, next) => {
    // .toLowerCase() add kiya gaya hai taaki 'admin' aur 'Admin' dono roles accept ho.
    if (req.user && req.user.role && req.user.role.toLowerCase() === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};
// === ADMIN MIDDLEWARE UPDATE END ===


// Teeno functions ko export karein
module.exports = { protect, authorize, admin };