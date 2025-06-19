const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
  }],
  shippingDetails: {
    firstName: { type: String, trim: true, required: true },
    lastName: { type: String, trim: true, required: true },
    contactNumber: { type: String, trim: true, required: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
      required: true,
    },
    streetAddress: { type: String, trim: true, required: true },
    zip: { type: String, trim: true, required: true },
    city: { type: String, trim: true, required: true },
    province: { type: String, trim: true, required: true },
  },
  paymentDetails: {
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery', 'card_payment'],
      required: [true, 'Payment method is required'],
    },
    nameOnCard: { type: String, trim: true },
    cardNumber: { type: String, trim: true },
    expiration: { type: String, trim: true },
    cvc: { type: String, trim: true },
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative'],
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'confirmed'], // Added 'confirmed'
  },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);