// routes/userRoutes.js
const express = require('express');
const { registerUser, loginUser, getProfile, updateProfile, checkType } = require('../controllers/authController');
const authenticateJWT = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);
router.get('/role', authenticateJWT, checkType);
module.exports = router;
