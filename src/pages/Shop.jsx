import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import instance from '../utils/axios';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import 'react-toastify/dist/ReactToastify.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9; // Number of products per page
  const navigate = useNavigate();
  const { currentUser, token } = useSelector((state) => state.user);

  // Filter states
  const [keyword, setKeyword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 3000 });
  const [selectedPlantTypes, setSelectedPlantTypes] = useState([]);
  const [selectedSunlightNeeds, setSelectedSunlightNeeds] = useState([]);
  const [selectedSpaces, setSelectedSpaces] = useState([]);
  const [selectedGrowthDurations, setSelectedGrowthDurations] = useState([]);

  useEffect(() => {
    const fetchProductsAndCart = async () => {
      try {
        setLoading(true);
        setError('');
        const productsRes = await instance.get('/api/products');
        const fetchedProducts = productsRes.data.products || [];
        if (fetchedProducts.length === 0) {
          setError('No products available at the moment.');
        }
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
        setCurrentPage(1); // Reset to first page on new product fetch

        if (currentUser && token) {
          try {
            const cartRes = await instance.get('/api/orders/checkout', {
              headers: { Authorization: `Bearer ${token}` },
            });
            const cartItems = cartRes.data.products || [];
            const totalItems = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
            setCartCount(totalItems);
          } catch (cartErr) {
            if (cartErr.response?.status === 400) {
              setCartCount(0);
              toast.info('Your cart is empty or not found.');
            } else {
              console.warn('Error fetching cart:', cartErr.response?.data?.message || cartErr.message);
              setCartCount(0);
              toast.error('Failed to fetch cart. Please try again later.');
            }
          }
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch products. Please try again later.';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCart();
  }, [currentUser, token]);

  useEffect(() => {
    applyFilters();
  }, [keyword, selectedCategories, priceRange, selectedPlantTypes, selectedSunlightNeeds, selectedSpaces, selectedGrowthDurations, products]);

  const handleAddToCart = async (product) => {
    if (!currentUser || !token) {
      toast.error('Please log in to add items to your cart');
      navigate('/login');
      return;
    }

    try {
      await instance.post(
        '/api/orders/cart',
        { productId: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartCount((prev) => prev + 1);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add to cart. Please try again.';
      toast.error(errorMsg);
      if (err.response?.status === 400) {
        toast.error(err.response.data.message || 'Invalid request. Check product availability.');
      } else if (err.response?.status === 500) {
        toast.error('Server error. Please contact support.');
      }
    }
  };

  const handleCartClick = () => {
    if (!currentUser || !token) {
      toast.error('Please log in to view your cart');
      navigate('/login');
      return;
    }
    navigate('/cart');
  };

  const handleKeywordChange = (e) => setKeyword(e.target.value);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategories((prev) =>
      prev.includes(value) ? prev.filter((cat) => cat !== value) : [...prev, value]
    );
  };

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    setPriceRange((prev) => ({ ...prev, max: value > 3000 ? 3000 : value }));
  };

  const handlePlantTypeChange = (e) => {
    const value = e.target.value;
    setSelectedPlantTypes((prev) =>
      prev.includes(value) ? prev.filter((type) => type !== value) : [...prev, value]
    );
  };

  const handleSunlightChange = (e) => {
    const value = e.target.value;
    setSelectedSunlightNeeds((prev) =>
      prev.includes(value) ? prev.filter((sun) => sun !== value) : [...prev, value]
    );
  };

  const handleSpaceChange = (e) => {
    const value = e.target.value;
    setSelectedSpaces((prev) =>
      prev.includes(value) ? prev.filter((space) => space !== value) : [...prev, value]
    );
  };

  const handleGrowthDurationChange = (e) => {
    const value = e.target.value;
    setSelectedGrowthDurations((prev) =>
      prev.includes(value) ? prev.filter((growth) => growth !== value) : [...prev, value]
    );
  };

  const resetFilters = () => {
    setKeyword('');
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 3000 });
    setSelectedPlantTypes([]);
    setSelectedSunlightNeeds([]);
    setSelectedSpaces([]);
    setSelectedGrowthDurations([]);
    setCurrentPage(1); // Reset to first page on filter reset
  };

  const applyFilters = () => {
    let updatedProducts = products.filter((product) => {
      const matchesKeyword =
        (product.name?.toLowerCase().includes(keyword.toLowerCase()) || false) ||
        (product.category?.toLowerCase().includes(keyword.toLowerCase()) || false);
      const matchesCategory =
        selectedCategories.length === 0 ||
        (product.category && selectedCategories.includes(product.category)) ||
        (selectedCategories.includes('All') && product.category);
      const matchesPrice = product.price != null && product.price >= priceRange.min && product.price <= priceRange.max;
      const matchesPlantType =
        selectedPlantTypes.length === 0 ||
        (product.plantType && selectedPlantTypes.includes(product.plantType));
      const matchesSunlight =
        selectedSunlightNeeds.length === 0 ||
        (product.sunlight && selectedSunlightNeeds.includes(product.sunlight));
      const matchesSpace =
        selectedSpaces.length === 0 ||
        (product.space && selectedSpaces.includes(product.space));
      const matchesGrowth =
        selectedGrowthDurations.length === 0 ||
        (product.growth && selectedGrowthDurations.includes(product.growth));

      return (
        matchesKeyword &&
        matchesCategory &&
        matchesPrice &&
        matchesPlantType &&
        matchesSunlight &&
        matchesSpace &&
        matchesGrowth
      );
    });
    setFilteredProducts(updatedProducts);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          } transition-colors duration-300`}
        >
          Previous
        </button>
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-4 py-2 rounded-lg text-gray-700 hover:bg-teal-100"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-600">...</span>}
          </>
        )}
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === number
                ? 'bg-teal-600 text-white'
                : 'text-gray-700 hover:bg-teal-100'
            } transition-colors duration-300`}
          >
            {number}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-600">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-4 py-2 rounded-lg text-gray-700 hover:bg-teal-100"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          } transition-colors duration-300`}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome{currentUser ? `, ${currentUser.fullName}` : ''} to Haritha Hub
          </h1>
          <button
            onClick={handleCartClick}
            className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 shadow-sm"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>Cart ({cartCount})</span>
          </button>
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 bg-red-50 p-4 rounded-lg mb-6 text-center font-medium"
          >
            {error}
          </motion.p>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <ClipLoader color="#4f46e5" size={50} />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:w-1/4 bg-white rounded-xl p-6 shadow-md border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-teal-800">Filters</h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                >
                  Reset All
                </button>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Keywords</h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={keyword}
                      onChange={handleKeywordChange}
                      placeholder="Search products..."
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Oils', 'Seeds', 'Kits'].map((tag) => (
                      <span key={tag} className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Category</h3>
                  <div className="space-y-3">
                    {['All', 'Seeds', 'Tools', 'Compost Kits'].map((category) => (
                      <label key={category} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={category}
                          onChange={handleCategoryChange}
                          checked={selectedCategories.includes(category)}
                          className="mr-2 accent-teal-600"
                        />
                        {category}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Price</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${(priceRange.max / 3000) * 100}%` }}></div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3000"
                    value={priceRange.max}
                    onChange={handlePriceChange}
                    className="w-full accent-teal-600"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>LKR 0</span>
                    <span>LKR {priceRange.max}</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Plant Type</h3>
                  <div className="space-y-3">
                    {['Vegetables', 'Herbs', 'Leafy Greens', 'Flowers'].map((type) => (
                      <label key={type} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={type}
                          onChange={handlePlantTypeChange}
                          checked={selectedPlantTypes.includes(type)}
                          className="mr-2 accent-teal-600"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Sunlight Needs</h3>
                  <div className="space-y-3">
                    {['Full Sun', 'Partial Shade', 'Low Light'].map((sunlight) => (
                      <label key={sunlight} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={sunlight}
                          onChange={handleSunlightChange}
                          checked={selectedSunlightNeeds.includes(sunlight)}
                          className="mr-2 accent-teal-600"
                        />
                        {sunlight}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Space</h3>
                  <div className="space-y-3">
                    {['Balcony', 'Backyard', 'Apartment', 'Indoor Gardening'].map((space) => (
                      <label key={space} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={space}
                          onChange={handleSpaceChange}
                          checked={selectedSpaces.includes(space)}
                          className="mr-2 accent-teal-600"
                        />
                        {space}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Growth Duration</h3>
                  <div className="space-y-3">
                    {['Fast Growing', 'Seasonal', 'Perennial'].map((growth) => (
                      <label key={growth} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={growth}
                          onChange={handleGrowthDurationChange}
                          checked={selectedGrowthDurations.includes(growth)}
                          className="mr-2 accent-teal-600"
                        />
                        {growth}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-gray-600">
                  Showing {indexOfFirstProduct + 1}–{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} items
                </span>
              </div>
              {currentProducts.length === 0 ? (
                <p className="text-gray-600 text-lg text-center">No products match your filters.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <img
                        src={`${instance.defaults.baseURL}${product.image}`}
                        alt={product.name}
                        className="h-48 w-full object-cover"
                        onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                      />
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                        <p className="text-gray-600 mt-1 font-medium">LKR {product.price.toFixed(2)}</p>
                        <p className="text-gray-500 mt-2 text-sm line-clamp-2">{product.description}</p>
                        <p className="text-gray-500 mt-2 text-sm">
                          In Stock: {product.quantity > 0 ? product.quantity : 'Out of Stock'}
                        </p>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`mt-4 w-full px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-300 text-sm font-medium ${
                            product.quantity > 0
                              ? 'bg-teal-600 text-white hover:bg-teal-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={product.quantity === 0}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              {totalPages > 1 && renderPagination()}
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
};

export default Shop;