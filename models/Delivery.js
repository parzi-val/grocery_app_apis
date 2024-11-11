const mongoose = require('mongoose');
const User = require('./User');  // Assuming the User model is in the same folder
const Order = require('./Order');  // Assuming the Order model is in the same folder

// Delivery Schema
const deliverySchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',  // Reference to the Order model
        required: true,
    },
    deliveryPersonnel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Referencing the User model (should be a delivery personnel)
        required: true,
        validate: {
            validator: async function(userId) {
                // Ensure the assigned user is of type 'delivery'
                const user = await User.findById(userId);
                return user && user.type === 'delivery';
            },
            message: 'The assigned user must be a delivery personnel (type: delivery).',
        },
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],  // Delivery status
        default: 'Pending',
    },
}, { timestamps: true });

const Delivery = mongoose.model('Delivery', deliverySchema);
module.exports = Delivery;
