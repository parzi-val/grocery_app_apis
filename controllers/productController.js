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
        const { name, categories, minPrice, maxPrice } = req.query; // Changed `category` to `categories`
        const filter = {};

        // Check if any search criteria are provided
        if (name || categories || minPrice || maxPrice) {
            // If a name query parameter is provided, use it as a case-insensitive regex
            if (name) {
                filter.name = { $regex: name, $options: 'i' }; // Case-insensitive search
            }

            // If categories are provided, filter by multiple categories
            if (categories) {
                const categoryArray = Array.isArray(categories) ? categories : [categories]; // Ensure categories is an array
                filter.category = { $in: categoryArray }; // Use $in for multiple categories
            }

            // If price range is provided, filter by min and/or max price
            if (minPrice || maxPrice) {
                filter.price = {};
                if (minPrice) filter.price.$gte = parseFloat(minPrice); // Ensure price is a number
                if (maxPrice) filter.price.$lte = parseFloat(maxPrice); // Ensure price is a number
            }

            // Find products based on the filter criteria
            const products = await Product.find(filter);
            return res.status(200).json(products);
        } else {
            // If no query parameters are provided, return all products
            const allProducts = await Product.find();
            return res.status(200).json(allProducts);
        }
    } catch (error) {
        console.error(error);
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