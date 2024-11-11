// middleware/isAdmin.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isAdmin = async (req, res, next) => {
    // Get token from headers
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No token provided' });
    }

    try {
        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
        
        // Find the user by ID and check type
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(user.type)
        if (user.type !== 'admin' && user.type !== 'delivery') {
            return res.status(403).json({ message: 'Access Denied: Admins only' });
        }

        // If admin, proceed to the next middleware or route handler
        req.user = user; // Optionally add user info to req for further use
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.error(error);
            res.status(403).json({ message: 'Token expired' }); // Handle token expiration specifically
        } else {
            console.error(error);
            res.status(500).json({ message: 'Server error' }); // Handle all other errors
        }
    }
};

module.exports = isAdmin;
