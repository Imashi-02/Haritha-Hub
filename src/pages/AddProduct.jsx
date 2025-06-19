import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import instance from '../utils/axios'; // Adjust the import path as needed
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import 'react-toastify/dist/ReactToastify.css';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [plantType, setPlantType] = useState('');
  const [sunlight, setSunlight] = useState('');
  const [space, setSpace] = useState('');
  const [growth, setGrowth] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim()) return 'Product name is required';
    if (!price || price <= 0) return 'Price must be a positive number';
    if (!description.trim()) return 'Description is required';
    if (quantity === '' || quantity < 0) return 'Stock quantity must be a non-negative number';
    if (!category) return 'Category is required';
    if (plantType && !['Vegetables', 'Herbs', 'Leafy Greens', 'Flowers'].includes(plantType))
      return 'Invalid plant type';
    if (sunlight && !['Full Sun', 'Partial Shade', 'Low Light'].includes(sunlight))
      return 'Invalid sunlight needs';
    if (space && !['Balcony', 'Backyard', 'Apartment', 'Indoor Gardening'].includes(space))
      return 'Invalid space';
    if (growth && !['Fast Growing', 'Seasonal', 'Perennial'].includes(growth))
      return 'Invalid growth duration';
    if (!image) return 'Image is required';
    return null;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('quantity', quantity);
    formData.append('category', category);
    if (plantType) formData.append('plantType', plantType);
    if (sunlight) formData.append('sunlight', sunlight);
    if (space) formData.append('space', space);
    if (growth) formData.append('growth', growth);
    formData.append('image', image);

    try {
      await instance.post('/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Product added successfully!');
      setName('');
      setPrice('');
      setDescription('');
      setQuantity('');
      setCategory('');
      setPlantType('');
      setSunlight('');
      setSpace('');
      setGrowth('');
      setImage(null);
      setPreview(null);
      setTimeout(() => navigate('/products'), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error adding product';
      toast.error(errorMsg);
      if (err.response?.status === 400) {
        toast.error(err.response.data.message || 'Invalid request');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-teal-50 to-gray-100 min-h-screen"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-10 my-12 border border-teal-200">
        <h1 className="text-4xl font-extrabold text-teal-800 mb-8 text-center">Add New Product</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
              placeholder="Enter product name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Price (LKR)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
              placeholder="Enter price"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Stock Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
              placeholder="Enter stock quantity"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
              required
            >
              <option value="">Select category</option>
              <option value="Seeds">Seeds</option>
              <option value="Tools">Tools</option>
              <option value="Compost Kits">Compost Kits</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Plant Type (Optional)</label>
            <select
              value={plantType}
              onChange={(e) => setPlantType(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
            >
              <option value="">Select plant type</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Herbs">Herbs</option>
              <option value="Leafy Greens">Leafy Greens</option>
              <option value="Flowers">Flowers</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Sunlight Needs (Optional)</label>
            <select
              value={sunlight}
              onChange={(e) => setSunlight(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
            >
              <option value="">Select sunlight needs</option>
              <option value="Full Sun">Full Sun</option>
              <option value="Partial Shade">Partial Shade</option>
              <option value="Low Light">Low Light</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Space (Optional)</label>
            <select
              value={space}
              onChange={(e) => setSpace(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
            >
              <option value="">Select space</option>
              <option value="Balcony">Balcony</option>
              <option value="Backyard">Backyard</option>
              <option value="Apartment">Apartment</option>
              <option value="Indoor Gardening">Indoor Gardening</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Growth Duration (Optional)</label>
            <select
              value={growth}
              onChange={(e) => setGrowth(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
            >
              <option value="">Select growth duration</option>
              <option value="Fast Growing">Fast Growing</option>
              <option value="Seasonal">Seasonal</option>
              <option value="Perennial">Perennial</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
              rows="5"
              placeholder="Enter product description"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 transition duration-200"
            />
            {preview && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={preview}
                alt="Preview"
                className="mt-4 h-48 w-full object-cover rounded-lg shadow-md border border-teal-200"
              />
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-4 rounded-lg font-semibold text-white transition duration-200 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {loading ? <ClipLoader color="#fff" size={20} /> : 'Add Product'}
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
};

export default AddProduct;