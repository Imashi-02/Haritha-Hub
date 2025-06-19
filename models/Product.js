const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Image is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock quantity cannot be negative'],
    default: 0,
  },
  category: {
    type: String,
    enum: ['Seeds', 'Tools', 'Compost Kits'],
    required: [true, 'Category is required'],
  },
  plantType: {
    type: String,
    enum: ['Vegetables', 'Herbs', 'Leafy Greens', 'Flowers', ''],
    default: '',
  },
  sunlight: {
    type: String,
    enum: ['Full Sun', 'Partial Shade', 'Low Light', ''],
    default: '',
  },
  space: {
    type: String,
    enum: ['Balcony', 'Backyard', 'Apartment', 'Indoor Gardening', ''],
    default: '',
  },
  growth: {
    type: String,
    enum: ['Fast Growing', 'Seasonal', 'Perennial', ''],
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);