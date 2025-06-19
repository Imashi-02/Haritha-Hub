import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';
import { signInSuccess, signInFailure } from '../slices/userSlice';
import toast from 'react-hot-toast';
import image2 from '../assets/LoginRegister/2.jpg';
import image3 from '../assets/LoginRegister/3.jpg';
import image4 from '../assets/LoginRegister/4.jpg';

// Custom Animations
const styles = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeInDelay { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes bounceIn { 0% { transform: scale(0.9); opacity: 0; } 50% { transform: scale(1.05); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes pulseOnce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

  .animate-fadeIn { animation: fadeIn 1s ease-in-out; }
  .animate-fadeInDelay { animation: fadeInDelay 1.2s ease-in-out; }
  .animate-slideIn { animation: slideIn 1s ease-out; }
  .animate-bounceIn { animation: bounceIn 1s ease-out; }
  .animate-pulseOnce { animation: pulseOnce 2s ease-in-out; }
  .animate-spin { animation: spin 1s linear infinite; }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(signInFailure(null));
  };

  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      toast.error('Please enter your password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading || !validateInputs()) return;

    setIsLoading(true);
    const toastId = toast.loading('Logging you in...');

    try {
      console.log('Attempting login with:', formData);
      const res = await axios.post('/api/users/login', {
        email: formData.email,
        password: formData.password,
      }, { timeout: 10000 });

      console.log('Login response:', res.data);
      toast.success('Login successful! Redirecting...', { id: toastId });
      dispatch(signInSuccess(res.data));
      navigate('/profile');
    } catch (err) {
      console.error('Login error:', err);
      console.log('Server response:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.message || 'Network error or login failed';
      toast.error(errorMessage, { id: toastId });
      dispatch(signInFailure(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (error) dispatch(signInFailure(null));
    };
  }, [dispatch, error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col md:flex-row transition-all duration-500 ease-in-out">
        {/* Left Side - Login Form */}
        <div className="md:w-1/2 p-8 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-teal-100 transform transition-all duration-500 hover:shadow-2xl">
            <h2 className="text-4xl font-extrabold text-teal-700 mb-4 text-center animate-slideIn">
              Haritha Hub
            </h2>
            <p className="text-sm text-gray-600 mb-6 text-center font-light animate-fadeInDelay">
              Grow Fresh. Live Healthy.
            </p>
            <p className="text-center text-gray-500 mb-6 animate-fadeIn">Welcome back! Access your account</p>
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400 transition-all duration-300"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400 transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors duration-300 flex items-center justify-center"
                >
                </button>
                <Link to="#" className="text-sm text-teal-600 hover:underline block mt-1">
                  Forgot password
                </Link>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                  Remember for 30 days
                </label>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center bg-teal-700 text-white py-3 rounded-xl hover:bg-teal-800 transition-all duration-300 shadow-md animate-pulseOnce ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>
            <button
              className="w-full flex items-center justify-center gap-3 bg-gray-50 text-teal-700 py-3 rounded-xl border border-teal-200 hover:bg-teal-700 hover:text-white transition-all duration-300 mt-6 animate-bounceIn"
              onClick={() => toast.error('Google Sign-In not implemented yet')}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                />
              </svg>
              Sign in with Google
            </button>
            <p className="text-center text-sm text-teal-600 mt-6 font-medium animate-fadeInDelay">
              Don’t have an account?{' '}
              <Link to="/register" className="hover:underline text-teal-800">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Image Grid */}
        <div className="md:w-1/2 p-8 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-4">
            <div className="w-48 h-48"></div>
            <img
              src={image2}
              alt="Image 2"
              className="rounded-xl object-cover w-48 h-48 shadow-lg hover:scale-105 transition-transform duration-300 animate-fadeIn"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/192'; }}
            />
            <img
              src={image3}
              alt="Image 3"
              className="rounded-xl object-cover w-48 h-48 shadow-lg hover:scale-105 transition-transform duration-300 animate-fadeInDelay"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/192'; }}
            />
            <img
              src={image4}
              alt="Image 4"
              className="rounded-xl object-cover w-48 h-48 shadow-lg hover:scale-105 transition-transform duration-300 animate-fadeIn"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/192'; }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;