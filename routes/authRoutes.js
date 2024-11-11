// routes/userRoutes.js
const express = require('express');
const { registerUser, loginUser, getProfile, updateProfile, checkType } = require('../controllers/authController');
const authenticateJWT = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);
router.get('/role', authenticateJWT, checkType);

router.get('/verify-user', authenticateJWT);
router.get('/verify-admin', isAdmin);

module.exports = router;

