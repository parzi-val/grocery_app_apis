const express = require('express');
const router = express.Router();

// Import the controller methods
const {
  getAllDeliveryPartners,
    createDelivery,
    assignDeliveryPartner,
    getAllOrders
} = require('../controllers/deliveryController');

router.get('/orders', getAllOrders);    

// Route to fetch all delivery partners
router.get('/delivery-partners', getAllDeliveryPartners);


// Route to assign a delivery partner to an order
router.post('/assign-delivery-partner', assignDeliveryPartner);

module.exports = router;
