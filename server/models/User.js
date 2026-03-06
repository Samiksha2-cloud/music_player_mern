// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Supabase user.id
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatarUrl: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  role: { type: String, default: 'user' }
});

module.exports = mongoose.model('User', userSchema);