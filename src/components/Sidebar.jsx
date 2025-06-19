import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBox, FaVideo, FaList, FaPlus, FaBars, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { path: '/add-product', label: 'Add Product', icon: <FaPlus /> },
    { path: '/products', label: 'View Products', icon: <FaBox /> },
    { path: '/add-video', label: 'Add Video', icon: <FaPlus /> },
    { path: '/videos', label: 'View Videos', icon: <FaVideo /> },
  ];

  return (
    <motion.div
      initial={{ width: isOpen ? 256 : 80 }}
      animate={{ width: isOpen ? 256 : 80 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-xl z-50 overflow-hidden`}
    >
      <div className="flex items-center justify-between p-6">
        {isOpen && (
          <h1 className="text-xl font-bold">Dashboard</h1>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>
      <nav className="mt-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center py-3 px-6 my-1 text-sm font-medium transition-colors duration-200 ${
              location.pathname === item.path
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </motion.div>
  );
};

export default Sidebar;