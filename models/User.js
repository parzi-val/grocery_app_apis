// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String },
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
    },
    type: {
        type: String,
        enum: ['customer', 'admin', 'delivery'],
        default: 'customer',
        required: true,
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
