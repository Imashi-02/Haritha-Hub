const Video = require('../models/Video');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../Uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const addVideo = async (req, res) => {
  try {
    if (!req.file || !req.body.title || !req.body.description) {
      return res.status(400).json({ message: 'Title, description, and video file are required' });
    }

    const { title, description } = req.body;
    const videoPath = `/uploads/${req.file.filename}`;

    const video = new Video({
      title,
      description,
      videoPath,
    });

    await video.save();

    res.status(201).json({
      video: {
        id: video._id,
        title: video.title,
        description: video.description,
        videoPath: video.videoPath,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().select('title description videoPath');
    res.json({
      videos: videos.map(video => ({
        id: video._id,
        title: video.title,
        description: video.description,
        videoPath: video.videoPath,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const videoId = req.params.id;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Delete the video file from uploads folder
    const videoPath = path.join(__dirname, '../', video.videoPath);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    await video.deleteOne();
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addVideo, getAllVideos, deleteVideo };