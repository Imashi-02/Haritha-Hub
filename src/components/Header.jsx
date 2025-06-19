import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { signoutSuccess } from '../slices/userSlice';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/tutorials', label: 'Tutorials' },
    { path: '/contact-us', label: 'Contact Us' },
    { path: '/my-orders', label: 'My Orders' },
  ];

  const handleSignout = () => {
    dispatch(signoutSuccess());
    navigate('/login');
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  // Safely get the first name, with a fallback
  const firstName = currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'User';

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/src/assets/LoginRegister/logo.jpg"
            alt="Haritha Hub Logo"
            className="w-10 h-10 rounded-full object-cover shadow-sm"
            onError={(e) => (e.target.src = '/placeholder-logo.png')} // Fallback for missing logo
          />
          <span className="text-xl font-extrabold tracking-tight">Haritha Hub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="text-sm font-medium text-gray-300 hover:text-green-400 transition-colors duration-200 relative group"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
          {currentUser ? (
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <span className="text-sm font-medium text-gray-300 hover:text-green-400 transition-colors duration-200 flex items-center gap-2 cursor-pointer">
                <FaUserCircle className="w-7 h-7 text-green-400" />
                {firstName}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="absolute top-full left-0 bg-gray-800 text-white rounded-xl shadow-2xl mt-2 w-48 p-2 z-50 border border-gray-700"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-green-400 rounded-md transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleSignout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-green-400 rounded-md transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <span className="text-sm font-medium text-gray-300 hover:text-green-400 transition-colors duration-200 flex items-center gap-2 cursor-pointer">
                <FaUserCircle className="w-7 h-7 text-green-400" />
                Account
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="absolute top-full left-0 bg-gray-800 text-white rounded-xl shadow-2xl mt-2 w-48 p-2 z-50 border border-gray-700"
                  >
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-green-400 rounded-md transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-green-400 rounded-md transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Register
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-green-400 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="lg:hidden bg-gray-800 px-6 py-4 shadow-inner"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block py-2 text-sm font-medium text-gray-300 hover:text-green-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {currentUser ? (
              <>
                <Link
                  to="/profile"
 boreder                  className="block py-2 text-sm font-medium text-gray-300 hover:text-green-400 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignout}
                  className="w-full text-left block py-2 text-sm font-medium text-gray-300 hover:text-green-400 transition-colors duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-sm font-medium text-gray-300 hover:text-green-400 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block py-2 text-sm font-medium text-gray-300 hover:text-green-400 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;