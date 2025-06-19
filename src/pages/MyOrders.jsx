import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import instance from '../utils/axios'; 
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyOrders = () => {
  const { currentUser, token } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser || !token) {
        toast.error('Please log in to view your orders');
        return;
      }

      try {
        const response = await instance.get('/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setOrders(response.data.orders || []);
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch orders';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, token]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-6 py-12 text-center text-teal-800"
      >
        <p>Loading your orders...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-6 py-12"
    >
      <div className="bg-white/90 rounded-xl p-8 shadow-lg border border-teal-100">
        <h2 className="text-3xl font-bold text-teal-800 text-center mb-8">My Orders</h2>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 bg-red-100 p-4 rounded-lg mb-6 text-center"
          >
            {error}
          </motion.p>
        )}
        {orders.length === 0 ? (
          <p className="text-gray-600 text-center">You have no orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-teal-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-teal-700">Order #{order.id}</span>
                  <span className="text-gray-600 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="space-y-4">
                  {order.products.map((product) => (
                    <div key={product.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-gray-800 mr-4">{product.name}</span>
                        <span className="text-gray-600">x{product.quantity}</span>
                      </div>
                      <span className="text-gray-800">LKR {(product.price * product.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-teal-200 pt-4 mt-4">
                    <div className="flex justify-between text-gray-700">
                      <span>Total Amount</span>
                      <span>LKR {order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Status</span>
                      <span className="capitalize">{order.status}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Payment Method</span>
                      <span className="capitalize">{order.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p><strong>Shipping to:</strong> {order.shippingDetails.firstName} {order.shippingDetails.lastName}</p>
                    <p>{order.shippingDetails.streetAddress}, {order.shippingDetails.city}, {order.shippingDetails.province}, {order.shippingDetails.zip}</p>
                    <p>Email: {order.shippingDetails.email} | Contact: {order.shippingDetails.contactNumber}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
};

export default MyOrders;