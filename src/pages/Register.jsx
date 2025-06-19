import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { signInFailure } from '../slices/userSlice';
import toast from 'react-hot-toast';
import image1 from '../assets/LoginRegister/1.jpg';

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

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    reenterPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showReenterPassword, setShowReenterPassword] = useState(false);
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
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!passwordRegex.test(formData.password)) {
      toast.error('Password must be at least 8 characters long and contain at least one letter and one number');
      return false;
    }
    if (formData.password !== formData.reenterPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading || !validateInputs()) return;

    setIsLoading(true);
    const toastId = toast.loading('Creating your account...');

    try {
      console.log('Sending registration data:', formData);
      const res = await axios.post('/api/users/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        reenterPassword: formData.reenterPassword,
      }, { timeout: 10000 });

      console.log('Registration response:', res.data);
      toast.success('Registration successful! Redirecting to login...', { id: toastId });
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      console.log('Server response:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.message || 'Network error or registration failed';
      toast.error(errorMessage, { id: toastId });
      dispatch(signInFailure(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleReenterPasswordVisibility = () => setShowReenterPassword(!showReenterPassword);

  useEffect(() => {
    return () => {
      if (error) dispatch(signInFailure(null));
    };
  }, [dispatch, error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col md:flex-row transition-all duration-500 ease-in-out">
        {/* Left Side - Large Image */}
        <div className="md:w-1/2 p-5 flex items-center justify-center">
          <div className="w-full max-w-md transform hover:scale-105 transition-transform duration-700 ease-out rounded-2xl overflow-hidden">
            <img
              src={image1}
              alt="Hero Image"
              className="rounded-2xl object-cover w-full h-full shadow-2xl animate-fadeIn"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/512'; }}
            />
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-5 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="bg-white p-5 rounded-2xl shadow-lg w-full max-w-md border border-teal-100 transform transition-all duration-500 hover:shadow-xl">
            <h2 className="text-4xl font-extrabold text-teal-700 mb-3 text-center animate-slideIn">
              Haritha Hub
            </h2>
            <p className="text-sm text-gray-600 mb-5 text-center font-light animate-fadeInDelay">
              Grow Fresh. Live Healthy.
            </p>
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            <button
              className="w-full flex items-center justify-center gap-3 bg-gray-50 text-teal-700 py-3 rounded-xl border border-teal-200 hover:bg-teal-700 hover:text-white transition-all duration-300 mb-5 animate-bounceIn"
              onClick={() => toast.error('Google Sign-In not implemented yet')}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                />
              </svg>
              Sign up with Google
            </button>
            <div className="flex items-center my-5">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-4 text-gray-400 text-sm font-medium">— OR —</span>
              <hr className="flex-grow border-gray-300" />
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                name="fullName"
                placeholder="Fullname"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400 transition-all duration-300"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
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
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors duration-300"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c-4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c-4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showReenterPassword ? 'text' : 'password'}
                  name="reenterPassword"
                  placeholder="Re-enter Password"
                  value={formData.reenterPassword}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400 transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={toggleReenterPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors duration-300"
                >
                  {showReenterPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c-4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c-4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-md animate-pulseOnce ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
            <p className="text-center text-sm text-teal-600 mt-5 font-medium animate-fadeInDelay">
              Already have an account?{' '}
              <Link to="/login" className="hover:underline text-teal-800">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;