import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

const GetVideo = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/videos');
        setVideos(response.data.videos);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching videos');
        toast.error(err.response?.data?.message || 'Error fetching videos');
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await axios.delete(`http://localhost:5000/api/videos/${id}`);
        setVideos(videos.filter((video) => video.id !== id));
        toast.success('Video deleted successfully!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error deleting video');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Videos</h1>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 bg-red-100 p-4 rounded-lg mb-6"
          >
            {error}
          </motion.p>
        )}
        {loading ? (
          <div className="flex justify-center">
            <ClipLoader color="#4f46e5" size={50} />
          </div>
        ) : videos.length === 0 ? (
          <p className="text-gray-600 text-lg">No videos found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <video
                  src={`http://localhost:5000${video.videoPath}`}
                  controls
                  className="h-48 w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800">{video.title}</h3>
                  <p className="text-gray-500 mt-2 line-clamp-3">{video.description}</p>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
};

export default GetVideo;