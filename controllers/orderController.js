const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Order = require('../models/order');
const Product = require('../models/Product');

const addToCart = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { productId, quantity } = req.body;
    const userId = req.user._id;

    if (!productId || (quantity !== 0 && (!Number.isInteger(quantity) || quantity < 1))) {
      return res.status(400).json({ message: 'Valid product ID and quantity (minimum 1, or 0 to remove) are required' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (quantity === 0) {
      if (existingItemIndex > -1) {
        cart.items.splice(existingItemIndex, 1);
      } else {
        return res.status(404).json({ message: 'Product not found in cart' });
      }
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      if (product.quantity < quantity) {
        return res.status(400).json({ message: `Only ${product.quantity} items available in stock` });
      }
      if (existingItemIndex > -1) {
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (product.quantity < newQuantity) {
          return res.status(400).json({ message: `Only ${product.quantity} items available in stock` });
        }
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        cart.items.push({ productId, quantity, price: product.price });
      }
    }

    await cart.save();
    res.status(200).json({ message: 'Cart updated successfully', cart: cart.items });
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};

const syncCart = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user._id;
    const { cartItems } = req.body;

    if (!Array.isArray(cartItems)) {
      return res.status(400).json({ message: 'Cart items must be an array' });
    }

    const productIds = cartItems.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    for (const item of cartItems) {
      if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }
      if (item.quantity !== 0 && (!Number.isInteger(item.quantity) || item.quantity < 1)) {
        return res.status(400).json({ message: 'Quantity must be at least 1 or 0 for removal' });
      }
      if (item.quantity > 0) {
        const product = productMap.get(item.productId.toString());
        if (!product) {
          return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
        }
        if (product.quantity < item.quantity) {
          return res.status(400).json({ message: `Only ${product.quantity} items of ${product.name} available` });
        }
      }
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const updatedItems = cartItems
      .filter(item => item.quantity > 0)
      .map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: productMap.get(item.productId.toString())?.price || 0,
      }));

    cart.items = updatedItems;
    await cart.save();
    res.status(200).json({ message: 'Cart synced successfully', cart: cart.items });
  } catch (error) {
    console.error('Error in syncCart:', error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};

const checkout = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user._id;
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || !cart.items.length) {
      return res.status(400).json({ message: 'Cart is empty or not found' });
    }

    const products = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.price,
      stockQuantity: item.productId.quantity,
      name: item.productId.name,
      image: item.productId.image,
    }));

    const totalAmount = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.status(200).json({ products, totalAmount });
  } catch (error) {
    console.error('Error in checkout:', error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};

const saveShippingDetails = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { firstName, lastName, contactNumber, email, streetAddress, zip, city, province } = req.body;

    if (!firstName || !lastName || !contactNumber || !email || !streetAddress || !zip || !city || !province) {
      return res.status(400).json({ message: 'All shipping details are required' });
    }

    const shippingDetails = { firstName, lastName, contactNumber, email, streetAddress, zip, city, province };
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { shippingDetails } },
      { new: true, upsert: true, runValidators: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json({ message: 'Shipping details saved', shippingDetails });
  } catch (error) {
    console.error('Error in saveShippingDetails:', error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};

const processPayment = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { paymentMethod, nameOnCard, cardNumber, expiration, cvc } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    if (paymentMethod === 'card_payment' && (!nameOnCard || !cardNumber || !expiration || !cvc)) {
      return res.status(400).json({ message: 'All card details are required for card payment' });
    }

    const paymentDetails = {
      paymentMethod,
      ...(paymentMethod === 'card_payment' ? { nameOnCard, cardNumber, expiration, cvc } : {}),
    };

    const updatedCart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { paymentDetails } },
      { new: true, upsert: true, runValidators: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json({ message: 'Payment details saved', paymentDetails });
  } catch (error) {
    console.error('Error in processPayment:', error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};

const confirmOrder = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user._id;
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (!cart.shippingDetails || Object.keys(cart.shippingDetails).length === 0) {
      return res.status(400).json({ message: 'Shipping details are required' });
    }

    if (!cart.paymentDetails || !cart.paymentDetails.paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    const validProducts = cart.items.filter(item => item.quantity >= 1);
    if (validProducts.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or contains no valid items' });
    }

    const order = new Order({
      user: userId,
      products: validProducts.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingDetails: cart.shippingDetails,
      paymentDetails: cart.paymentDetails,
      totalAmount: validProducts.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'confirmed', // This is now valid due to schema update
    });

    await order.save();

    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [], shippingDetails: {}, paymentDetails: {} } }
    );

    res.status(201).json({ orderId: order._id, message: 'Order confirmed successfully' });
  } catch (error) {
    console.error('Error in confirmOrder:', error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).populate('products.productId', 'name price image');
    res.status(200).json({
      orders: orders.map(order => ({
        id: order._id,
        products: order.products.map(p => ({
          name: p.productId.name,
          price: p.price,
          quantity: p.quantity,
          image: p.productId.image,
        })),
        shippingDetails: order.shippingDetails,
        paymentDetails: order.paymentDetails,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error in getMyOrders:', error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};

module.exports = { addToCart, syncCart, checkout, saveShippingDetails, processPayment, confirmOrder, getMyOrders };