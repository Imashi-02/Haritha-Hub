import { useState } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaYoutube } from 'react-icons/fa';
import contactus from '../assets/contact us/contactus.jpg';

// Mock API call to simulate form submission
const mockSubmitMessage = async (formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Message sent successfully' });
    }, 1000);
  });
};

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors on input change
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await mockSubmitMessage(formData);
      if (response.success) {
        toast.success('We will let you know soon', {
          position: 'top-right',
          autoClose: 3000,
        });
        // Reset form
        setFormData({ name: '', email: '', message: '' });
      } else {
        toast.error('Failed to send message. Please try again.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 text-gray-800 py-16"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold text-teal-900 text-center mb-6"
          variants={fadeIn}
        >
          Contact Us
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 text-center mb-12"
          variants={fadeIn}
        >
          Have questions or need help? We’re here for you!
        </motion.p>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Contact Info Section with Image Background */}
          <motion.div
            className="lg:w-1/2 rounded-xl shadow-lg border border-teal-100 relative overflow-hidden"
            variants={fadeIn}
          >
            <img
              src={contactus}
              alt="Contact Us Background"
              className="w-full h-full object-cover absolute inset-0"
              style={{ transform: 'scale(1.1)' }}
            />
            <div className="absolute inset-0 bg-teal-900 bg-opacity-60"></div>
            <div className="relative z-10 p-8">
              <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-md">Reach Us On</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaPhone className="text-teal-200 w-5 h-5" />
                  <p className="text-white drop-shadow-sm">+94 77 123 4567</p>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-teal-200 w-5 h-5" />
                  <p className="text-white drop-shadow-sm">info@harithahub.lk</p>
                </div>
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-teal-200 w-5 h-5" />
                  <p className="text-white drop-shadow-sm">Colombo 07, Sri Lanka</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4 drop-shadow-md">Frequently Asked Questions</h2>
              <p className="text-teal-100 mb-4 drop-shadow-sm">
                Check out our <a href="/faq" className="text-teal-200 hover:underline">FAQ</a> page for quick answers.
              </p>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4 drop-shadow-md">Follow Us</h2>
              <div className="flex gap-4">
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-200 hover:text-white transition-colors duration-200"
                >
                  <FaYoutube className="w-6 h-6" />
                </a>
                <a
                  href="https://instagram.com/haritha.hub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-200 hover:text-white transition-colors duration-200"
                >
                  <FaInstagram className="w-6 h-6" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form Section */}
          <motion.div
            className="lg:w-1/2 bg-white rounded-xl shadow-lg p-8 border border-teal-100"
            variants={fadeIn}
          >
            <h2 className="text-2xl font-bold text-teal-800 mb-2">Send Us a Message</h2>
            <p className="text-gray-600 mb-6">We reply within 2 working days</p>
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Your name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Your email"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="5"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.message ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Your message"
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg text-white font-medium transition-colors duration-300 ${
                  isSubmitting
                    ? 'bg-teal-400 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
};

export default ContactUs;