const Delivery = require('../models/Delivery');
const User = require('../models/User');
const Order = require('../models/Order');

// Controller to get all orders
exports.getAllOrders = async (req, res) => {
  try {
    // Fetch all orders and populate user and product details
    const orders = await Order.find()
      .populate('user', 'name') // Populating user with name (or other details like email)
      .populate('items.product', 'name price'); // Populating the product details for each order item

    if (!orders.length) {
      return res.status(404).json({ message: 'No orders found' });
    }

    // Format the response to ensure consistency and include customer info, product details, etc.
    const formattedOrders = orders.map(order => ({
      orderId: order._id.toString(),
      customerName: order.user ? order.user.name : 'N/A',  // Safe check for user details
      status: order.status || 'Pending Payment',
      items: order.items.map(item => ({
        productName: item.product ? item.product.name : 'N/A',
        productPrice: item.product ? item.product.price : 0,
        quantity: item.quantity,
        totalPrice: item.product ? item.product.price * item.quantity : 0,
      })),
      totalAmount: order.totalAmount,
    }));

    // Return the formatted orders
    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Controller to fetch all delivery partners
exports.getAllDeliveryPartners = async (req, res) => {
  try {
    // Find users with type 'delivery'
    const deliveryPartners = await User.find({ type: 'delivery' });

    if (!deliveryPartners.length) {
      return res.status(404).json({ message: 'No delivery partners found' });
    }

    // Return the list of delivery partners
    res.status(200).json(deliveryPartners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Controller to create a new delivery record
exports.assignDeliveryPartner = async (req, res) => {
  const { orderId, deliveryPersonId } = req.body;

  try {
    // Check if the order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the delivery person exists and is of type 'delivery'
    const deliveryPerson = await User.findById(deliveryPersonId);
    if (!deliveryPerson || deliveryPerson.type !== 'delivery') {
      return res.status(400).json({ message: 'Invalid delivery person' });
    }

    // Create the new delivery object
    const newDelivery = new Delivery({
      order: orderId,
      deliveryPersonnel: deliveryPersonId,
    });

    // Save the delivery record to the database
    await newDelivery.save();

    // Update the order with the delivery person's ID (optional)
    order.status = 'Shipped'; // Update the order status as shipped, or use any other relevant status
    await order.save();

    res.status(201).json({ message: 'Delivery created successfully', delivery: newDelivery });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

