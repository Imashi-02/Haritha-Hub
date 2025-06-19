const Product = require('../models/Product');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const addProduct = async (req, res) => {
  try {
    // Validate required fields
    if (
      !req.file ||
      !req.body.name ||
      !req.body.price ||
      !req.body.description ||
      req.body.quantity === undefined ||
      !req.body.category
    ) {
      return res.status(400).json({ message: 'Name, price, description, image, quantity, and category are required' });
    }

    const { name, price, description, quantity, category, plantType, sunlight, space, growth } = req.body;

    // Validate numeric fields
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }
    if (isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ message: 'Stock quantity must be a non-negative number' });
    }

    // Validate category
    const validCategories = ['Seeds', 'Tools', 'Compost Kits'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Validate optional fields (if provided)
    if (plantType && !['Vegetables', 'Herbs', 'Leafy Greens', 'Flowers', ''].includes(plantType)) {
      return res.status(400).json({ message: 'Invalid plant type' });
    }
    if (sunlight && !['Full Sun', 'Partial Shade', 'Low Light', ''].includes(sunlight)) {
      return res.status(400).json({ message: 'Invalid sunlight needs' });
    }
    if (space && !['Balcony', 'Backyard', 'Apartment', 'Indoor Gardening', ''].includes(space)) {
      return res.status(400).json({ message: 'Invalid space' });
    }
    if (growth && !['Fast Growing', 'Seasonal', 'Perennial', ''].includes(growth)) {
      return res.status(400).json({ message: 'Invalid growth duration' });
    }

    // Compress image
    const compressedImagePath = `/Uploads/compressed-${req.file.filename}`;
    const compressedFilePath = path.join(__dirname, '../', compressedImagePath);
    try {
      await sharp(req.file.path)
        .jpeg({ quality: 80 })
        .toFile(compressedFilePath);
    } catch (imageError) {
      return res.status(500).json({ message: 'Failed to compress image', details: imageError.message });
    }

    // Clean up original file
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkError) {
      console.warn('Failed to delete original file:', unlinkError.message);
    }

    // Create and save new product
    const product = new Product({
      name,
      price: parseFloat(price),
      description,
      image: compressedImagePath,
      quantity: parseInt(quantity),
      category,
      plantType: plantType || '',
      sunlight: sunlight || '',
      space: space || '',
      growth: growth || '',
    });

    const savedProduct = await product.save();
    if (!savedProduct._id) {
      throw new Error('Failed to generate product ID');
    }

    res.status(201).json({
      product: {
        id: savedProduct._id,
        name: savedProduct.name,
        price: savedProduct.price,
        description: savedProduct.description,
        image: savedProduct.image,
        quantity: savedProduct.quantity,
        category: savedProduct.category,
        plantType: savedProduct.plantType,
        sunlight: savedProduct.sunlight,
        space: savedProduct.space,
        growth: savedProduct.growth,
      },
    });
  } catch (error) {
    console.error('Error in addProduct:', error);
    // Clean up compressed image if save fails
    const compressedFilePath = path.join(__dirname, '../', `/Uploads/compressed-${req.file.filename}`);
    if (fs.existsSync(compressedFilePath)) {
      fs.unlinkSync(compressedFilePath);
    }
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    // Check if the product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete the associated image file
    if (product.image) {
      const imagePath = path.join(__dirname, '../', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .select('name price description image quantity category plantType sunlight space growth')
      .lean(); // Use lean to improve performance
    const validProducts = products.filter(product => product._id && mongoose.Types.ObjectId.isValid(product._id.toString()));
    if (products.length !== validProducts.length) {
      console.warn(`Filtered out ${products.length - validProducts.length} products with invalid IDs`);
    }
    res.json({
      products: validProducts.map((product) => ({
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,
        quantity: product.quantity,
        category: product.category,
        plantType: product.plantType,
        sunlight: product.sunlight,
        space: product.space,
        growth: product.growth,
      })),
    });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    const product = await Product.findById(productId)
      .select('name price description image quantity category plantType sunlight space growth')
      .lean();
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      quantity: product.quantity,
      category: product.category,
      plantType: product.plantType,
      sunlight: product.sunlight,
      space: product.space,
      growth: product.growth,
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { addProduct, deleteProduct, getAllProducts, getProductById };