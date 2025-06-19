const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    index: true, // Add index for performance
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity must be at least 0'], // Allow 0 for removal
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
  }],
  shippingDetails: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    streetAddress: { type: String, trim: true },
    zip: { type: String, trim: true },
    city: { type: String, trim: true },
    province: { type: String, trim: true },
  },
  paymentDetails: {
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery', 'card_payment'],
    },
    nameOnCard: { type: String, trim: true },
    cardNumber: { type: String, trim: true },
    expiration: { type: String, trim: true },
    cvc: { type: String, trim: true },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

cartSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Cart', cartSchema);