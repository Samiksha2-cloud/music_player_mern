const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  imageURL: { type: String, default: '' },
  audioURL: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  album: String,
});

module.exports = mongoose.model('Song', songSchema);
