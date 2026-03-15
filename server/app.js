// server/app.js

const express = require("express");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
require("dotenv").config(); // Load .env variables
console.log('Supabase key loaded:', process.env.SUPABASE_KEY ? 'YES (length ' + process.env.SUPABASE_KEY.length + ')' : 'MISSING');

const app = express();

// Middleware
app.use(cors({ origin: true }));          // Allow frontend (localhost:3000) to connect
app.use(express.json());                  // Parse JSON request bodies

// Simple root route for testing (open localhost:4000 in browser)
app.get("/", (req, res) => {
  res.json({
    message: "Riff Music App Backend is running!",
    status: "ok",
    port: process.env.PORT || 4000,
  });
});

// Test endpoint for frontend-backend connection
app.get("/api/test", (req, res) => {
  res.json({
    message: "Hello from backend! Frontend-backend connection works.",
    time: new Date().toISOString(),
  });
});

// Import routes
const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/songs");
const playlistRoutes = require("./routes/playlists");

// Use routes
app.use("/api/users", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected successfully!"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Stop server if DB fails
  });

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;