import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import instance from '../utils/axios'; // Adjust path based on your project structure
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import 'react-toastify/dist/ReactToastify.css';

const Cart = () => {
  const navigate = useNavigate();
  const { currentUser, token } = useSelector((state) => state.user);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCart = async () => {
      if (!currentUser || !token) {
        toast.error('Please log in to view your cart');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const res = await instance.get('/api/orders/checkout', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const cart = res.data.products || [];
        setCartItems(cart);
      } catch (err) {
        if (err.response?.status === 400) {
          setCartItems([]);
          setError(err.response.data.message || 'Your cart is empty');
          toast.info(err.response.data.message || 'Your cart is empty');
        } else {
          const errorMsg = err.response?.data?.message || 'Failed to fetch cart';
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [currentUser, token, navigate]);

  const handleQuantityChange = async (productId, delta) => {
    const item = cartItems.find((item) => item.productId === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;

    if (newQuantity < 1) {
      toast.error('Quantity cannot be less than 1');
      return;
    }

    if (newQuantity > item.stockQuantity) {
      toast.error(`Only ${item.stockQuantity} items are available in stock`);
      return;
    }

    try {
      await instance.post(
        '/api/orders/cart',
        { productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success('Cart updated successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update cart';
      toast.error(errorMsg);
      console.error('Quantity change error:', err);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await instance.post(
        '/api/orders/cart',
        { productId, quantity: 0 }, // Setting quantity to 0 to remove the item
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setCartItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
      toast.success('Item removed from cart!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to remove item';
      toast.error(errorMsg);
      console.error('Remove item error:', err);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity || 0), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { cartItems } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>Continue Shopping</span>
          </button>
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 bg-red-100 p-4 rounded-lg mb-6"
          >
            {error}
          </motion.p>
        )}
        {loading ? (
          <div className="flex justify-center">
            <ClipLoader color="#4f46e5" size={50} />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-3/4">
              <h2 className="text-2xl font-semibold text-teal-800 mb-6">Your Cart</h2>
              {cartItems.length === 0 ? (
                <p className="text-gray-600 text-lg">Your cart is empty.</p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center bg-white p-4 rounded-lg shadow-md border border-teal-100"
                    >
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                        <img
                          src={`${instance.defaults.baseURL}${item.image}`}
                          alt={item.name}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-teal-700">{item.name}</h3>
                        <p className="text-gray-600">LKR {item.price.toFixed(2)}</p>
                        <p className="text-gray-500">
                          In Stock: {item.stockQuantity > 0 ? item.stockQuantity : 'Out of Stock'}
                        </p>
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() => handleQuantityChange(item.productId, -1)}
                            className="px-2 py-1 bg-gray-200 text-gray-800 rounded-l-lg hover:bg-gray-300"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-4 py-1 bg-gray-100">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, 1)}
                            className="px-2 py-1 bg-gray-200 text-gray-800 rounded-r-lg hover:bg-gray-300"
                            disabled={item.quantity >= item.stockQuantity}
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="ml-4 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="text-gray-600">LKR {(item.price * item.quantity).toFixed(2)}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:w-1/4 bg-white/90 rounded-xl p-6 shadow-lg border border-teal-100"
            >
              <h2 className="text-xl font-semibold text-teal-800 mb-6 border-b border-teal-200 pb-2">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">LKR {calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="text-gray-800">LKR {calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-teal-200 pt-2">
                  <span>Total</span>
                  <span>LKR {calculateTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300"
                >
                  Proceed to Checkout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
};

export default Cart;