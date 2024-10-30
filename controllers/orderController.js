const Cart = require('../models/Cart');
const Order = require('../models/Order');

const checkoutOrder = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find the user's cart
        const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        // Calculate total amount
        let totalAmount = 0;
        const items = cart.items.map(item => {
            totalAmount += item.product.price * item.quantity;
            return {
                product: item.product._id,
                name: item.product.name, // Store product name as a snapshot
                price: item.product.price, // Store product price at time of order
                quantity: item.quantity,
            };
        });

        // Create the order with embedded item snapshots
        const newOrder = new Order({
            user: userId,
            items,
            totalAmount,
            status: 'Pending',  // Initial status
        });

        await newOrder.save();

        // Optionally clear the cart after checkout
        cart.items = [];
        await cart.save();

        res.status(201).json({ 
            message: 'Order placed successfully', 
            orderId: newOrder._id,
            totalAmount,
            status: newOrder.status,
        });

        // TODO: Integrate payment initiation here if using a payment gateway

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while placing order' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find the order by ID and populate the user information
        const order = await Order.findById(orderId).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Define estimated delivery time (e.g., 5 days from order creation)
        const estimatedDeliveryTime = new Date(order.createdAt);
        estimatedDeliveryTime.setDate(estimatedDeliveryTime.getDate() + 5);

        res.status(200).json({
            orderId: order._id,
            user: {
                name: order.user.name,
                email: order.user.email,
            },
            items: order.items.map(item => ({
                product: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity,
            })),
            totalAmount: order.totalAmount,
            status: order.status,
            estimatedDelivery: estimatedDeliveryTime,
            createdAt: order.createdAt,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching order details' });
    }
};

module.exports = { checkoutOrder, getOrderById };