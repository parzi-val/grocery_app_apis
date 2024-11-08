const express = require('express');
const router = express.Router();
const { confirmPayment } = require('../controllers/PaymentController');
const authenticateJWT = require('../middlewares/authMiddleware');

// Route to confirm payment for an order
router.put('/confirm-payment/:orderId', authenticateJWT, confirmPayment);

module.exports = router;
