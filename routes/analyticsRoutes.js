// routes/analytics.js
const express = require('express');
const router = express.Router();
const { getOrderFrequency, getProductCategoryBreakdown } = require('../controllers/analyticsController');
const isAdmin = require('../middlewares/isAdmin');


// Route to get total sales
router.get('/sales',isAdmin, getOrderFrequency);

// Route to get orders by status
router.get('/products',isAdmin, getProductCategoryBreakdown);
module.exports = router;
