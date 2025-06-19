import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from '../utils/axios';
import { FaPlay, FaPause } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import debounce from 'lodash/debounce';

const Tutorial = () => {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('');
  const [plantType, setPlantType] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [playbackStates, setPlaybackStates] = useState({});
  const videoRefs = useRef({});
  const observerRef = useRef(null);

  // Debounce search input
  const debouncedSetSearchTerm = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setPage(1); // Reset to first page on new search
    }, 300),
    []
  );

  // Fetch videos with pagination
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/videos', {
          params: { page, limit: 12 }, // Fetch 12 videos per page
        });
        const fetchedVideos = response.data.videos || [];
        setVideos(prev => (page === 1 ? fetchedVideos : [...prev, ...fetchedVideos]));
        setHasMore(fetchedVideos.length === 12);
        // Initialize playback states
        const initialStates = fetchedVideos.reduce((acc, video) => {
          acc[video.id] = false;
          return acc;
        }, {});
        setPlaybackStates(prev => ({ ...prev, ...initialStates }));
      } catch (err) {
        setError('Failed to fetch videos');
        toast.error('Failed to fetch videos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [page]);

  // Lazy-load videos using IntersectionObserver
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const videoId = entry.target.dataset.videoId;
            const videoElement = videoRefs.current[videoId];
            if (videoElement && !videoElement.src) {
              videoElement.src = `http://localhost:5000${videoElement.dataset.src}`;
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe video elements
    Object.values(videoRefs.current).forEach(video => {
      if (video) observerRef.current.observe(video);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [videos]);

  // Set up event listeners for play/pause
  const setupVideoListeners = useCallback((videoId, videoElement) => {
    const handlePlay = () => setPlaybackStates(prev => ({ ...prev, [videoId]: true }));
    const handlePause = () => setPlaybackStates(prev => ({ ...prev, [videoId]: false }));
    const handleError = () => {
      toast.error(`Failed to load video: ${videoId}`);
      setPlaybackStates(prev => ({ ...prev, [videoId]: false }));
    };

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('error', handleError);

    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('error', handleError);
    };
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback((videoId) => {
    const videoElement = videoRefs.current[videoId];
    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play().catch(err => {
          console.error('Error playing video:', err);
        });
      } else {
        videoElement.pause();
      }
    }
  }, []);

  // Memoize filtered videos
  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage = !language || video.language === language;
      const matchesPlantType = !plantType || video.plantType === plantType;
      const matchesSkillLevel = !skillLevel || video.skillLevel === skillLevel;
      return matchesSearch && matchesLanguage && matchesPlantType && matchesSkillLevel;
    });
  }, [videos, searchTerm, language, plantType, skillLevel]);

  // Handle infinite scroll
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
      !loading &&
      hasMore
    ) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h1 className="text-2xl font-bold text-green-700 border-b-2 border-green-500 pb-2 mb-4">Video Tutorials</h1>
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Language</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>
          <select
            value={plantType}
            onChange={(e) => setPlantType(e.target.value)}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Plant Type</option>
            <option value="Vegetable">Vegetable</option>
            <option value="Flower">Flower</option>
            <option value="Herb">Herb</option>
          </select>
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Skill Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <input
            type="text"
            onChange={(e) => debouncedSetSearchTerm(e.target.value)}
            placeholder="Search"
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto"
          />
        </div>
        {loading && page === 1 && <p className="text-center">Loading...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!loading && !error && filteredVideos.length === 0 && (
          <p className="text-center text-gray-600">No videos found.</p>
        )}
        {!loading && !error && filteredVideos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredVideos.map(video => (
              <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <video
                    ref={(el) => {
                      if (el) {
                        videoRefs.current[video.id] = el;
                        el.dataset.videoId = video.id;
                        el.dataset.src = video.videoPath;
                        setupVideoListeners(video.id, el);
                      }
                    }}
                    controls
                    preload="metadata"
                    className="w-full h-48 object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                  {playbackStates[video.id] === false && (
                    <div
                      className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-50"
                      onClick={() => togglePlayPause(video.id)}
                    >
                      <FaPlay className="text-white text-4xl opacity-80 hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-green-700">{video.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {loading && page > 1 && <p className="text-center mt-4">Loading more...</p>}
      </div>
    </div>
  );
};

export default Tutorial;