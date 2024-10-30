const express = require('express');
const cors = require('cors'); // Import CORS
const connectDB = require('./config/db'); // Adjust the path as necessary
const authRoutes = require('./routes/authRoutes'); // Import authRoutes
const productRoutes = require('./routes/productRoutes'); // Import productRoutes
const cartRoutes = require('./routes/cartRoutes'); // Import cartRoutes
const orderRoutes = require('./routes/orderRoutes'); // Import orderRoutes

const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());

app.use(cors({
    origin: '*', // Change this to your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true // Allow credentials (e.g., cookies)
}));

// Logging middleware
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode}`);
    });
    next();
});

// Removed session middleware since we're using JWT for authentication
app.use('/api/auth', authRoutes); // Use authRoutes
app.use('/api/products', productRoutes); // Use productRoutes
app.use('/api/cart', cartRoutes); // Use cartRoutes
app.use('/api/orders', orderRoutes); // Use orderRoutes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
