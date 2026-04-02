const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  artist:     { type: String, required: true },
  imageURL:   { type: String, default: '' },
  audioURL:   { type: String, default: '' },
  duration:   { type: Number, default: 0 },
  album:      { type: String, default: '' },
  categories: { type: [String], default: [] }, // ['new', 'mood', 'language', 'artist']
  mood:       { type: String, default: '' },   // Happy, Sad, Chill, Party, Romantic, Focus, Workout
  language:   { type: String, default: '' },   // Hindi, English
});

module.exports = mongoose.model('Song', songSchema);