const Cart = require('../models/Cart');
const Order = require('../models/Order');
const User = require('../models/User');
const Delivery = require('../models/Delivery'); // Adjust path if necessary


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
            status: 'Pending Payment',  // Initial status
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
        const userId = order.user._id;

        // Fetch the full user data from the users collection
        fullUser = await User.findById(userId).select('name email phoneNumber address');
            // Calculate the estimated delivery time
            estimatedDeliveryTime.setDate(estimatedDeliveryTime.getDate() + 5);
        
            res.status(200).json({
                orderId: order._id,
                user: {
                    name: fullUser.name,
                    email: fullUser.email,
                    phoneNumber: fullUser.phoneNumber, // Access phone number
                    address: fullUser.address ? {  // Access address fields if available
                        street: fullUser.address.street,
                        city: fullUser.address.city,
                        state: fullUser.address.state,
                        postalCode: fullUser.address.postalCode,
                        country: fullUser.address.country
                    } : null,  // If no address, return null
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

const getOrderHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all orders for the user
        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 }) // Sort by most recent orders first
            .select('items totalAmount status createdAt') // Only fetch relevant fields
            .populate('items.product', 'name price'); // Populate product name and price

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user.' });
        }

        // Format the response to include necessary order details
        const orderHistory = orders.map(order => ({
            orderId: order._id,
            items: order.items.map(item => ({
                product: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity,
            })),
            totalAmount: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt,
        }));

        res.status(200).json(orderHistory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching order history' });
    }
};

// Get all orders, optionally by user
const getAllOrders = async (req, res) => {
    try {
        const userId = req.query.userId;
        const filter = userId ? { user: userId } : {};

        const orders = await Order.find(filter)
            .populate('user', 'name email') // populate user details if needed
            .populate('items.product', 'name price'); // populate product details in items

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving orders', error });
    }
};

// Update an order's status or fields
const updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // Find order by ID and update the status
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true, runValidators: true }
        ).populate('user', 'name email')
         .populate('items.product', 'name price');

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error updating order', error });
    }
};

// Delete an order
const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const deletedOrder = await Order.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order', error });
    }
};


// Controller to retrieve orders assigned to a specific delivery person
const getOrdersAssignedToDeliveryPerson = async (req, res) => {
    try {
        const deliveryPersonId = req.user._id;

        // Find all deliveries assigned to the delivery person
        const deliveries = await Delivery.find({ deliveryPersonnel: deliveryPersonId })
            .populate('order') // Populate the order details
            .exec();

        // Check if any deliveries are found
        if (deliveries.length === 0) {
            return res.status(404).json({ message: 'No orders assigned to this delivery person' });
        }

        // Extract order details from the populated deliveries
        const orders = deliveries.map(delivery => delivery.order);

        // Return the list of orders assigned to the delivery person
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving orders' });
    }
};


module.exports = { checkoutOrder, getOrderById, getOrderHistory, getAllOrders, updateOrder, deleteOrder,getOrdersAssignedToDeliveryPerson };