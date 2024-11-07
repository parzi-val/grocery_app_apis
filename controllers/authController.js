// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');


// Registration Controller
const registerUser = async (req, res) => {
    // Validate input
    await body('name').notEmpty().withMessage('Name is required').run(req);
    await body('email').isEmail().withMessage('Valid email is required').run(req);
    await body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').run(req);
    await body('type').isIn(['customer', 'admin', 'delivery person']).withMessage('Invalid user type').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, type } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        user = new User({ name, email, password: hashedPassword, type });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }Toke
};


const loginUser = async (req, res) => {
    // Validate input
    await body('email').isEmail().withMessage('Valid email is required').run(req);
    await body('password').notEmpty().withMessage('Password is required').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create and sign JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret_key', { expiresIn: '1h' });

        // Send response including user type
        res.status(200).json({ 
            message: 'Logged in successfully', 
            token, 
            userType: user.type  // Include the type here
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        // Find the user by ID
        const user = await User.findById(req.user._id).select('-password'); // Use req.userId set by the middleware
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const updateProfile = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, address, phoneNumber } = req.body; // Destructure address from body

        // Find and update the user
        const user = await User.findById(req.user._id); // Use req.userId set by the middleware

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(phoneNumber)
        // Update user fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;

        // Update address fields if provided
        if (address) {
            user.address = {
                ...(user.address || {}), // Keep existing address if available
                ...address // Merge with new address data
            };
        }

        await user.save(); // Save the updated user

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const checkType = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
    res. status(200).json({ userType: user.type });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { registerUser, loginUser, getProfile, updateProfile, checkType };
