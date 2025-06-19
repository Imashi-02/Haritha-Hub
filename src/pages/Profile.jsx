import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import {
  updateSuccess,
  updateFailure,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} from '../slices/userSlice';
import { FaUserCircle, FaEdit, FaSignOutAlt, FaShoppingCart, FaLock, FaBell, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Profile = () => {
  const { currentUser, error, token } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    contactNumber: currentUser?.contactNumber || '',
    address: currentUser?.address || '',
  });
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isSignoutLoading, setIsSignoutLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sync formData with currentUser whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        contactNumber: currentUser.contactNumber || '',
        address: currentUser.address || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) {
      dispatch(updateFailure(null));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      dispatch(updateFailure('Full name and email are required'));
      toast.error('Full name and email are required');
      return;
    }
    setIsUpdateLoading(true);
    const toastId = toast.loading('Saving changes...');
    try {
      console.log('Updating profile with token:', token);
      const res = await axios.put('/api/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Update response:', res.data);
      dispatch(updateSuccess(res.data.user));
      console.log('Updated currentUser in Redux:', currentUser);
      toast.success('Profile updated successfully!', { id: toastId });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Update failed';
      console.error('Update error:', err);
      dispatch(updateFailure(errorMessage));
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const handleSignout = async () => {
    setIsSignoutLoading(true);
    const toastId = toast.loading('Signing out...');
    try {
      dispatch(signoutSuccess());
      toast.success('Signed out successfully!', { id: toastId });
      navigate('/');
    } catch (err) {
      toast.error('Sign out failed', { id: toastId });
    } finally {
      setIsSignoutLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setIsDeleteLoading(true);
      const toastId = toast.loading('Deleting account...');
      try {
        await axios.delete('/api/users/account', {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(deleteUserSuccess());
        toast.success('Account deleted successfully!', { id: toastId });
        navigate('/');
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Deletion failed';
        dispatch(deleteUserFailure(errorMessage));
        toast.error(errorMessage, { id: toastId });
      } finally {
        setIsDeleteLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-xl overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-8 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <FaUserCircle className="w-20 h-20 text-gray-200" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{currentUser?.fullName || 'User'}</h1>
              <p className="text-sm text-gray-200 mt-1">
                Member since: {currentUser?.createdAt?.split('T')[0] || 'N/A'}
              </p>
            </div>
          </div>
          <div className="text-sm">
            <a
              href="#"
              className="flex items-center text-white hover:text-gray-200 transition duration-300"
            >
              <FaEdit className="mr-1" /> Edit Profile
            </a>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {error && (
            <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>
          )}
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400 transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400 transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400 transition-all duration-300"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isUpdateLoading}
              className={`w-full flex items-center justify-center bg-teal-700 text-white py-3 rounded-xl hover:bg-teal-800 transition-all duration-300 shadow-md ${isUpdateLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUpdateLoading ? (
                <>
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>

          {/* Account Actions */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Account Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="#"
                className="flex items-center text-teal-600 hover:text-teal-800 font-medium transition duration-300"
              >
                <FaLock className="mr-2" /> Change Password
              </a>
              <a
                href="#"
                className="flex items-center text-teal-600 hover:text-teal-800 font-medium transition duration-300"
              >
                <FaBell className="mr-2" /> Notifications
              </a>
            </div>
          </div>

          {/* Account Menu */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Account Menu
            </h2>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="flex items-center text-gray-700 hover:text-teal-600 transition duration-300"
                >
                  <FaShoppingCart className="mr-2" /> My Orders
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center text-gray-700 hover:text-teal-600 transition duration-300"
                >
                  <FaEdit className="mr-2" /> My Profile
                </a>
              </li>
              <li>
                <button
                  onClick={handleSignout}
                  className={`flex items-center text-gray-700 hover:text-teal-600 w-full text-left transition duration-300 ${isSignoutLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isSignoutLoading}
                >
                  <FaSignOutAlt className="mr-2" /> Sign Out
                </button>
              </li>
              <li>
                <button
                  onClick={handleDelete}
                  className={`flex items-center text-red-600 hover:text-red-800 w-full text-left transition duration-300 ${isDeleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isDeleteLoading}
                >
                  <FaTrash className="mr-2" /> Delete Account
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom Styles Embedded in Component */}
      <style>{`
        /* Professional and Modern Styles */
        .bg-gradient-to-br {
          background: linear-gradient(to bottom right, #059669, #14b8a6);
        }

        input {
          font-family: 'Inter', sans-serif;
          transition: all 0.3s ease;
        }

        input:focus {
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
        }

        button {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        h1, h2 {
          font-family: 'Inter', sans-serif;
        }

        /* Hover Effects */
        a:hover, button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        /* Error Message Styling */
        .bg-red-50 {
          background-color: #fef2f2;
        }
      `}</style>
    </div>
  );
};

export default Profile;