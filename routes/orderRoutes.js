const express = require('express');
const { checkoutOrder, getOrderById, getOrderHistory, getAllOrders,updateOrder,deleteOrder,getOrdersAssignedToDeliveryPerson } = require('../controllers/orderController');
const authenticateJWT = require('../middlewares/authMiddleware'); // Import the authentication middleware
const isAdmin = require('../middlewares/isAdmin'); // Import the admin middleware

const router = express.Router();

// Route to place an order
router.post('/checkout', authenticateJWT, checkoutOrder);
router.get('/history', authenticateJWT, getOrderHistory);
router.get('/delivery', isAdmin, getOrdersAssignedToDeliveryPerson); 
router.get('/:orderId', authenticateJWT, getOrderById); // Fetch order details
router.get('/', isAdmin, getAllOrders); // Fetch all orders
router.put('/:orderId', isAdmin, updateOrder); // Update order status
router.delete('/:orderId', isAdmin, deleteOrder); // Delete an order
// Fetch orders assigned to a delivery person

module.exports = router;
