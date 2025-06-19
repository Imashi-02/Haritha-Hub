import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

const AddVideo = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!title.trim()) return 'Video title is required';
    if (!description.trim()) return 'Description is required';
    if (!video) return 'Video file is required';
    if (video && video.size > 100 * 1024 * 1024) return 'Video size must be less than 100MB';
    return null;
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 100 * 1024 * 1024) {
      toast.error('Video size must be less than 100MB');
      return;
    }
    setVideo(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('video', video);

    try {
      const response = await axios.post('http://localhost:5000/api/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Video added successfully!');
      setTitle('');
      setDescription('');
      setVideo(null);
      setPreview(null);
      setTimeout(() => navigate('/videos'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Add New Video</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Video Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              placeholder="Enter video title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              rows="5"
              placeholder="Enter video description"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Video File</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="w-full p-4 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition duration-200"
            />
            {preview && (
              <motion.video
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={preview}
                controls
                className="mt-4 h-48 w-full object-cover rounded-lg shadow-md"
              />
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-4 rounded-lg font-semibold text-white transition duration-200 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? <ClipLoader color="#fff" size={20} /> : 'Add Video'}
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
};

export default AddVideo;