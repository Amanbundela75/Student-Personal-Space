const User = require('../models/User.js');
const Attendance = require('../models/Attendance');
const Branch = require('../models/Branch.js'); // For validating branchId on registration
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const { firstName, lastName, email, password, branchId } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        let branch = null;
        if (branchId) {
            branch = await Branch.findById(branchId);
            if (!branch) {
                return res.status(400).json({ success: false, message: 'Invalid Branch ID provided' });
            }
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password, // Hashing is handled by pre-save hook in User model
            branch: branch ? branch._id : null,
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                branch: user.branch, // Will be ObjectId or null
            },
        });
    } catch (error) {
        console.error('Registration Error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server Error during registration' });
    }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    try {
        const user = await User.findOne({ email }).select('+password'); // Include password for comparison

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user && isMatch /* && faceVerified (अगर लागू हो) */) {
            // ... (टोकन जेनरेट करने से पहले) ...

            // अटेंडेंस रिकॉर्ड करें (सिर्फ स्टूडेंट्स के लिए, अगर एडमिन के लिए नहीं चाहते)
            if (user.role === 'student') {
                try {
                    await Attendance.create({user: user._id});
                    console.log(`Attendance recorded for user: ${user.email}`);
                } catch (attendanceError) {
                    console.error("Error recording attendance:", attendanceError);
                    // इसे लॉगिन को फेल नहीं करना चाहिए, बस एक एरर लॉग करें
                }
            }
        }

        user.lastLoginTimestamp = new Date();
        // For isActiveNow, you might set it true here and manage via WebSockets or heartbeat
        await user.save();

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                branch: user.branch,
                lastLogin: user.lastLoginTimestamp,
            },
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server Error during login' });
    }
};

// @desc    Get current logged-in user profile
// @route   GET /api/auth/profile
// @access  Private (requires token)
exports.getUserProfile = async (req, res) => {
    try {
        // req.user is attached by the 'protect' middleware
        const user = await User.findById(req.user.id).populate('branch', 'name description'); // Populate branch details
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update user profile (e.g., name, branch, password)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
    const { firstName, lastName, branchId, password } = req.body;
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;

        if (branchId) {
            const branchExists = await Branch.findById(branchId);
            if (!branchExists) {
                return res.status(400).json({ success: false, message: 'Invalid Branch ID' });
            }
            user.branch = branchId;
        } else if (branchId === null || branchId === '') { // Allow unsetting branch
            user.branch = null;
        }


        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
            }
            user.password = password; // Pre-save hook will hash it
        }

        const updatedUser = await user.save(); // Triggers pre-save hook for password and updatedAt

        // Re-populate branch details if needed for the response
        const populatedUser = await User.findById(updatedUser._id).populate('branch', 'name');

        res.status(200).json({
            success: true,
            user: {
                _id: populatedUser._id,
                firstName: populatedUser.firstName,
                lastName: populatedUser.lastName,
                email: populatedUser.email,
                role: populatedUser.role,
                branch: populatedUser.branch,
            },
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};