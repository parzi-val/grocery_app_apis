const Order = require('../models/Order'); // Assuming the Order model is located here

// Confirm payment and update the order status
const confirmPayment = async (req, res) => {
    try {
        const { orderId } = req.params; // Order ID passed in the URL

        // Find the order by its ID
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the order is already confirmed
        if (order.status === 'Confirmed') {
            return res.status(400).json({ message: 'Order is already confirmed' });
        }

        // Here, you'd typically have payment processing logic, e.g., contacting a payment gateway
        // For this example, we'll assume payment was successful

        // Update the order status to 'Confirmed'
        order.status = 'Confirmed';
        await order.save();

        // Respond with the updated order details
        res.status(200).json({
            message: 'Payment confirmed and order status updated',
            order,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error. Could not confirm payment.' });
    }
};

module.exports = {
    confirmPayment,
};
