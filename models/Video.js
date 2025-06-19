const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  videoPath: {
    type: String,
    required: [true, 'Video file is required'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Video', videoSchema);