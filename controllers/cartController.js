const Cart = require('../models/Cart');
const Product = require('../models/Product'); // Ensure product exists before adding

const addToCart = async (req, res) => {
    try {
        
        const userId = req.user._id; // Assuming user authentication middleware adds user to req
        const { productId, quantity } = req.body;
        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Find or create the user's cart
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // Create a new cart if one doesn't exist
            cart = new Cart({ user: userId, items: [{ product: productId, quantity }] });
        } else {
            // Find the product in the cart items
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

            if (itemIndex > -1) {
                // If product already exists, update the quantity
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Otherwise, add a new item to the cart
                cart.items.push({ product: productId, quantity });
            }
        }

        // Save the cart
        await cart.save();
        res.status(200).json({ message: 'Product added to cart successfully', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while adding to cart' });
    }
};

const getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find the cart for the current user and populate product details in items
        const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price'); // Only populate necessary fields

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching cart' });
    }
};

const removeProductFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        // Find the cart for the user
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Find the index of the item in the cart
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        // Remove the item from the cart
        cart.items.splice(itemIndex, 1);

        // Save the updated cart
        await cart.save();

        res.status(200).json({ message: 'Product removed from cart' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while removing product from cart' });
    }
};

module.exports = { addToCart, getCart, removeProductFromCart };