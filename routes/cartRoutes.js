const express = require('express');
const { addToCart, getCart,removeProductFromCart } = require('../controllers/cartController');
const authenticateJWT = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/add', authenticateJWT, addToCart);
router.get('/', authenticateJWT, getCart);
router.delete('/:productId', authenticateJWT, removeProductFromCart);

module.exports = router;
