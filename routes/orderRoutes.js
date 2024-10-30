const express = require('express');
const { checkoutOrder, getOrderById } = require('../controllers/orderController');
const authenticateJWT = require('../middlewares/authMiddleware'); // Import the authentication middleware

const router = express.Router();

// Route to place an order
router.post('/checkout', authenticateJWT, checkoutOrder);
router.get('/:orderId', authenticateJWT, getOrderById); // Fetch order details

module.exports = router;
