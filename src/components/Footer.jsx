import { FaInstagram, FaEnvelope, FaMapMarkerAlt, FaPhone, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer = () => {
  const footerLinks = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/tutorials', label: 'Tutorials' },
    { path: '/contact-us', label: 'Contact Us' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12"
    >
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand and Contact Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/LoginRegister/logo.jpg"
              alt="Haritha Hub Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-xl font-bold tracking-tight">Haritha Hub</span>
          </div>
          <p className="text-sm text-gray-300">Grow Green with Us</p>
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm">
              <FaInstagram className="text-green-400" />
              <a href="https://instagram.com/haritha.hub" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition">
                @haritha.hub
              </a>
            </p>
            <p className="flex items-center gap-2 text-sm">
              <FaEnvelope className="text-green-400" />
              <a href="mailto:info@harithahub.lk" className="hover:text-green-400 transition">
                info@harithahub.lk
              </a>
            </p>
            <p className="flex items-center gap-2 text-sm">
              <FaMapMarkerAlt className="text-green-400" />
              Colombo, Sri Lanka
            </p>
            <p className="flex items-center gap-2 text-sm">
              <FaPhone className="text-green-400" />
              <a href="tel:+94112567777" className="hover:text-green-400 transition">
                011 256 7777
              </a>
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {footerLinks.map((link) => (
              <li key={link.path}>
                <a
                  href={link.path}
                  className="text-sm text-gray-300 hover:text-green-400 transition duration-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
          <div className="flex gap-4">
            <FaMoneyBillWave className="text-green-400 w-8 h-8" title="Cash on Delivery" />
            <FaCreditCard className="text-green-400 w-8 h-8" title="Visa" />
            <FaCreditCard className="text-green-400 w-8 h-8" title="MasterCard" />
          </div>
          <p className="text-sm text-gray-300 mt-4">Secure payments with trusted providers.</p>
        </div>
      </div>
      <div className="mt-8 border-t border-gray-700 pt-4 text-center">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Haritha Hub. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;