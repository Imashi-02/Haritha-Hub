import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import instance from '../utils/axios'; // Adjust the import path as needed
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import 'react-toastify/dist/ReactToastify.css';

const GetProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await instance.get('/api/products');
        const fetchedProducts = Array.isArray(response.data.products)
          ? response.data.products
          : [];
        // Debug: Log the fetched products to inspect their structure
        console.log('Fetched products from API:', fetchedProducts);
        // Filter out any products with undefined or invalid _id
        const validProducts = fetchedProducts.filter(product => product.id && typeof product.id === 'string');
        if (fetchedProducts.length !== validProducts.length) {
          console.warn(`Skipped ${fetchedProducts.length - validProducts.length} products due to invalid IDs`);
          toast.warn('Some products were skipped due to missing or invalid IDs.');
        }
        setProducts(validProducts);
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || 'Failed to fetch products. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
        console.error('Fetch products error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (_id) => {
    if (!_id || typeof _id !== 'string' || _id === 'undefined') {
      toast.error('Invalid product ID. Cannot delete this product.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await instance.delete(`/api/products/${_id}`);
        setProducts(products.filter((product) => product.id !== _id));
        toast.success('Product deleted successfully!');
      } catch (err) {
        const status = err.response?.status;
        let errorMsg = err.response?.data?.message || 'Error deleting product';
        if (status === 400) {
          errorMsg = 'Invalid request. Please try again.';
        } else if (status === 403) {
          errorMsg = 'You do not have permission to delete this product.';
        } else if (status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        toast.error(errorMsg);
        console.error('Delete product error:', err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-teal-50 to-gray-100 min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold text-teal-800 mb-10 text-center">Our Products</h1>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 bg-red-100 p-4 rounded-lg mb-8 text-center"
          >
            {error}
          </motion.p>
        )}
        {loading ? (
          <div className="flex justify-center items-center min-h-[20rem]">
            <ClipLoader color="#38b2ac" size={50} />
          </div>
        ) : products.length === 0 ? (
          <p className="text-gray-600 text-lg text-center">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <motion.div
                key={product.id || Math.random()} // Fallback key in case id is undefined
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-teal-100"
              >
                <img
                  src={
                    product.image
                      ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${product.image}`
                      : 'https://via.placeholder.com/300x200?text=No+Image'
                  }
                  alt={product.name ? `${product.name} image` : 'Product image'}
                  className="h-56 w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {product.name || 'Unnamed Product'}
                  </h3>
                  <p className="text-teal-600 font-medium mb-2">LKR {(product.price || 0).toFixed(2)}</p>
                  <p className="text-gray-600 mb-2 line-clamp-3">
                    {product.description || 'No description available'}
                  </p>
                  <p className="text-gray-500 mb-1">
                    In Stock: {product.quantity > 0 ? product.quantity : 'Out of Stock'}
                  </p>
                  <p className="text-gray-500 mb-1">Category: {product.category || 'N/A'}</p>
                  {product.plantType && (
                    <p className="text-gray-500 mb-1">Plant Type: {product.plantType}</p>
                  )}
                  {product.sunlight && (
                    <p className="text-gray-500 mb-1">Sunlight: {product.sunlight}</p>
                  )}
                  {product.space && (
                    <p className="text-gray-500 mb-1">Space: {product.space}</p>
                  )}
                  {product.growth && (
                    <p className="text-gray-500 mb-1">Growth: {product.growth}</p>
                  )}
                  <button
                    onClick={() => handleDelete(product.id)}
                    aria-label={`Delete ${product.name || 'product'}`}
                    className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </motion.div>
  );
};

export default GetProduct;