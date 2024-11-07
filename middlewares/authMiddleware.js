const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const authenticateJWT = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access' });
    }

    try {
        // Verify the token and decode the payload
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find the user in the database by the userId
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Attach the entire user object to req.user
        req.user = user;
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

module.exports = authenticateJWT;
