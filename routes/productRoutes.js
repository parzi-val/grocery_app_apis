const express = require('express');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, searchProducts } = require('../controllers/productController');
const isAdmin = require('../middlewares/isAdmin');  // Import isAdmin middleware
const authenticateJWT = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/',authenticateJWT, getAllProducts);                 // Get all products (public access)
router.get('/search',authenticateJWT, searchProducts);
router.get('/:id',authenticateJWT, getProductById);              // Get a single product by ID (public access)


// Admin-restricted routes
router.post('/', isAdmin, createProduct);        // Create a new product (admin only)
router.put('/:id', isAdmin, updateProduct);      // Update a product (admin only)
router.delete('/', isAdmin, deleteProduct);   // Delete a product (admin only)

module.exports = router;
