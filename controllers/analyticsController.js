const Order = require('../models/Order');
const moment = require('moment'); // For easy date manipulation
const Product = require('../models/Product');


// Controller for getting the number of orders in a given time period
const getOrderFrequency = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        console.log("Received startDate:", startDate, "endDate:", endDate);

        // Validate the dates
        const start = moment(startDate, "YYYY-MM-DD", true);  // Strict parsing
        const end = moment(endDate, "YYYY-MM-DD", true);      // Strict parsing
        console.log(start,end)
        // Check if the dates are valid
        if (!start.isValid() || !end.isValid()) {
            return res.status(400).json({ message: "Invalid date format. Please use 'YYYY-MM-DD'." });
        }

        // Parse the start and end dates properly
        const startOfDay = start.startOf('day').toDate();
        const endOfDay = end.endOf('day').toDate();
        console.log("Parsed start date:", startOfDay);
        console.log("Parsed end date:", endOfDay);

        // Query orders within the specified date range
        const orders = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay, $lte: endOfDay }, // Match orders within the date range
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by date (daily granularity)
                    totalOrders: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 }, // Sort by date
            },
        ]);

        // Return data for the graph (e.g., in a JSON format)
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error getting order data." });
    }
};

module.exports = { getOrderFrequency };



// Controller for getting product categories sold
const getProductCategoryBreakdown = async (req, res) => {
    try {
        // Fetch all orders and populate the product details within items
        const orders = await Order.find().populate('items.product');

        const categoryCounts = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                const product = item.product;

                // Ensure that the product exists and has a category
                if (product && product.category) {
                    if (categoryCounts[product.category]) {
                        categoryCounts[product.category] += item.quantity;
                    } else {
                        categoryCounts[product.category] = item.quantity;
                    }
                } else {
                    console.warn('Product or product category is missing for item:', item);
                }
            });
        });

        // Prepare the data for the pie chart
        const categoryData = Object.keys(categoryCounts).map(category => ({
            category,
            quantity: categoryCounts[category],
        }));

        res.json(categoryData); // Return the data for the pie chart
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching product category breakdown.' });
    }
};

module.exports = { getOrderFrequency, getProductCategoryBreakdown  };
