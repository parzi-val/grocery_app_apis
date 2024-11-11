// controllers/productController.js
const Product = require('../models/Product');
const Category = require('../models/Category');

// Create a new product
const createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a product
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.query.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const searchProducts = async (req, res) => {
    try {
        if (Object.keys(req.query).length === 0) {
            const products = await Product.find();
            return res.status(200).json(products);
        }
        const { name, category, minPrice, maxPrice } = req.query;
        console.log("Query params:", req.query); // For debugging
        const filter = {}; // Initialize an empty filter

        // Add to filter only if a query parameter is provided
        if (name) {
            filter.name = { $regex: name, $options: 'i' }; // Case-insensitive search
        }

        if (category) {
            // Check if category is a single string, then split it into an array
            const categoryArray = Array.isArray(category) ? category : category.split(',');
            filter.category = { $in: categoryArray }; // Exact match for any of the specified categories
        }
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // Check if filter is empty (no query params provided)
        if (Object.keys(filter).length === 0) {
            return res.status(400).json({ message: 'No filter criteria provided' });
        }

        const products = await Product.find(filter);
        return res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: 'Server error during search' });
    }
};


const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().select('name');
        
        // Use .map() to create an array of category names
        const categoryNames = categories.map(category => category.name);
        
        res.status(200).json(categoryNames);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving categories", error });
    }
};



module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, searchProducts, getCategories };