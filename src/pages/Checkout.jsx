import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import instance from '../utils/axios';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, token } = useSelector((state) => state.user);
  const { cartItems = [] } = location.state || {};

  const [shippingInfo, setShippingInfo] = useState({
    firstName: currentUser?.fullName?.split(' ')[0] || '',
    lastName: currentUser?.fullName?.split(' ')[1] || '',
    contactNumber: currentUser?.contactNumber || '',
    email: currentUser?.email || '',
    streetAddress: currentUser?.address || '',
    zip: '',
    city: '',
    province: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [cardInfo, setCardInfo] = useState({
    nameOnCard: '',
    cardNumber: '',
    expiration: '',
    cvc: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!currentUser || !token) {
      toast.error('Please log in to proceed with checkout');
      navigate('/login');
    }
  }, [navigate, currentUser, token]);

  // Format card number as 4242 4242 4242 4242
  const formatCardNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add space after every 4 digits
    const formatted = digits
      .match(/.{1,4}/g)
      ?.join(' ')
      .substring(0, 19) || '';
    return formatted;
  };

  // Handle card number input change
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardInfo({ ...cardInfo, cardNumber: formattedValue });
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Shipping Info Validation
    if (!shippingInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingInfo.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    else if (!/^\d{10}$/.test(shippingInfo.contactNumber)) newErrors.contactNumber = 'Contact number must be 10 digits';
    if (!shippingInfo.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) newErrors.email = 'Invalid email format';
    if (!shippingInfo.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!shippingInfo.zip.trim()) newErrors.zip = 'Zip code is required';
    else if (!/^\d{5}$/.test(shippingInfo.zip)) newErrors.zip = 'Zip code must be 5 digits';
    if (!shippingInfo.city) newErrors.city = 'City is required';
    if (!shippingInfo.province) newErrors.province = 'Province is required';

    // Payment Info Validation
    if (paymentMethod === 'card_payment') {
      if (!cardInfo.nameOnCard.trim()) newErrors.nameOnCard = 'Name on card is required';

      // Validate card number: must be exactly "4242 4242 4242 4242"
      const cleanCardNumber = cardInfo.cardNumber.replace(/\s/g, '');
      if (!cardInfo.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (cardInfo.cardNumber !== '4242 4242 4242 4242') {
        newErrors.cardNumber = 'Card number must be 4242 4242 4242 4242';
      } else if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }

      if (!cardInfo.expiration.trim()) newErrors.expiration = 'Expiration date is required';
      else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardInfo.expiration)) newErrors.expiration = 'Expiration must be MM/YY';

      if (!cardInfo.cvc.trim()) newErrors.cvc = 'CVC is required';
      else if (!/^\d{3}$/.test(cardInfo.cvc)) newErrors.cvc = 'CVC must be 3 digits';
    }

    // Terms Acceptance
    if (!termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Validate cart items
    const validCartItems = cartItems.filter(item => item.quantity >= 1);
    if (validCartItems.length === 0) {
      toast.error('Your cart is empty. Please add items to proceed.');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Step 1: Sync cart items with backend
      await instance.put(
        '/api/orders/cart/sync',
        { cartItems: validCartItems },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      // Step 2: Save shipping details
      const shippingRes = await instance.post(
        '/api/orders/shipping',
        shippingInfo,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      if (!shippingRes.data?.shippingDetails) {
        throw new Error('Failed to save shipping details');
      }

      // Step 3: Save payment details
      const paymentData = {
        paymentMethod,
        ...(paymentMethod === 'card_payment' ? cardInfo : {}),
      };
      const paymentRes = await instance.post(
        '/api/orders/payment',
        paymentData,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      if (!paymentRes.data?.paymentDetails) {
        throw new Error('Failed to save payment details');
      }

      // Step 4: Confirm order
      const confirmRes = await instance.post(
        '/api/orders/confirm',
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      toast.success('Order placed successfully!');
      navigate('/my-orders', { state: { orderId: confirmRes.data.orderId } });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to place order due to a server issue';
      const errorDetails = err.response?.data?.details || '';
      setErrors({ general: `${errorMsg}${errorDetails ? `: ${errorDetails}` : ''}` });
      toast.error(errorMsg);
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle payment method change
  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
    if (e.target.value !== 'card_payment') {
      setCardInfo({ nameOnCard: '', cardNumber: '', expiration: '', cvc: '' });
      setErrors(prev => ({
        ...prev,
        nameOnCard: undefined,
        cardNumber: undefined,
        expiration: undefined,
        cvc: undefined,
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-6 py-12"
    >
      <div className="bg-white/90 rounded-xl p-8 shadow-2xl border border-teal-100">
        <h2 className="text-3xl font-bold text-teal-800 text-center mb-8">Confirm & Pay</h2>
        {errors.general && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 bg-red-100 p-4 rounded-lg mb-6"
          >
            {errors.general}
          </motion.p>
        )}

        {/* Shipping Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-teal-700 mb-4">Shipping</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                value={shippingInfo.firstName}
                onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter First Name"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                value={shippingInfo.lastName}
                onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter Last Name"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Contact Number</label>
              <input
                type="tel"
                value={shippingInfo.contactNumber}
                onChange={(e) => setShippingInfo({ ...shippingInfo, contactNumber: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter Contact Number"
              />
              {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={shippingInfo.email}
                onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter Email Address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Street Address</label>
              <input
                type="text"
                value={shippingInfo.streetAddress}
                onChange={(e) => setShippingInfo({ ...shippingInfo, streetAddress: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.streetAddress ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter Full Address"
              />
              {errors.streetAddress && <p className="text-red-500 text-sm mt-1">{errors.streetAddress}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Zip Code</label>
              <input
                type="text"
                value={shippingInfo.zip}
                onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.zip ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter Zip Code"
              />
              {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">City</label>
              <select
                value={shippingInfo.city}
                onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select City</option>
                <option value="Colombo">Colombo</option>
                <option value="Kandy">Kandy</option>
                <option value="Galle">Galle</option>
              </select>
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Province</label>
              <select
                value={shippingInfo.province}
                onChange={(e) => setShippingInfo({ ...shippingInfo, province: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.province ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Province</option>
                <option value="Western">Western</option>
                <option value="Central">Central</option>
                <option value="Southern">Southern</option>
              </select>
              {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-teal-700 mb-4">Payment</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cash_on_delivery"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={handlePaymentChange}
                  className="mr-2 accent-teal-600"
                />
                <span className="text-gray-700">
                  Cash on Delivery (COD) <span className="text-sm text-gray-500">(delivery charges vary by province)</span>
                </span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="card_payment"
                  checked={paymentMethod === 'card_payment'}
                  onChange={handlePaymentChange}
                  className="mr-2 accent-teal-600"
                />
                <span className="text-gray-700">Credit / Debit Card</span>
              </label>
            </div>
            {paymentMethod === 'card_payment' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">Name on Card</label>
                  <input
                    type="text"
                    value={cardInfo.nameOnCard}
                    onChange={(e) => setCardInfo({ ...cardInfo, nameOnCard: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.nameOnCard ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter Name on Card"
                  />
                  {errors.nameOnCard && <p className="text-red-500 text-sm mt-1">{errors.nameOnCard}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Card Number</label>
                  <input
                    type="text"
                    value={cardInfo.cardNumber}
                    onChange={handleCardNumberChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="4242 4242 4242 4242"
                    maxLength="19" // 16 digits + 3 spaces
                  />
                  {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Expiration (MM/YY)</label>
                  <input
                    type="text"
                    value={cardInfo.expiration}
                    onChange={(e) => setCardInfo({ ...cardInfo, expiration: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.expiration ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="MM/YY"
                  />
                  {errors.expiration && <p className="text-red-500 text-sm mt-1">{errors.expiration}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">CVC</label>
                  <input
                    type="text"
                    value={cardInfo.cvc}
                    onChange={(e) => setCardInfo({ ...cardInfo, cvc: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.cvc ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="XXX"
                  />
                  {errors.cvc && <p className="text-red-500 text-sm mt-1">{errors.cvc}</p>}
                </div>
              </div>
            )}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mr-2 accent-teal-600"
              />
              <span className="text-gray-700">I accept the terms</span>
              <a href="#" className="text-teal-600 hover:underline ml-1">
                Read our T&Cs
              </a>
              {errors.termsAccepted && <p className="text-red-500 text-sm ml-2">{errors.termsAccepted}</p>}
            </div>
          </div>
        </div>

        {/* Cart Summary Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-teal-700 mb-4">Cart Summary</h3>
          {cartItems.length === 0 ? (
            <p className="text-gray-600">Your cart is empty. Please add items to proceed.</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <span className="text-gray-700 mr-4">{item.name}</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <span className="px-4 py-1">{item.quantity}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500">
                      In Stock: {item.stockQuantity > 0 ? item.stockQuantity : 'Out of Stock'}
                    </p>
                    <span className="text-gray-800">LKR {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </motion.div>
              ))}
              <div className="flex justify-between font-semibold text-lg border-t border-teal-200 pt-4">
                <span>Subtotal</span>
                <span>LKR {calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Tax (10%)</span>
                <span>LKR {calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-xl border-t border-teal-200 pt-4">
                <span>Estimated Total</span>
                <span>LKR {calculateTotal().toFixed(2)}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isLoading || cartItems.length === 0}
                className={`w-full mt-6 p-3 rounded-lg transition-all duration-300 ${
                  isLoading || cartItems.length === 0
                    ? 'bg-teal-500 cursor-not-allowed'
                    : 'bg-teal-800 hover:bg-teal-900 text-white'
                }`}
              >
                {isLoading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
};

export default Checkout;