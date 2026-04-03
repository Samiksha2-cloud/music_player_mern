const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Read allowed origins from env or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'https://riff-music-streaming-app.vercel.app',
      'https://music-player-mern-theta.vercel.app',
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  credentials: true,
}));

// Handle preflight requests for ALL routes
app.options('*', cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Riff Music App Backend is running!", status: "ok" });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend connection works.", time: new Date().toISOString() });
});

const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/songs");
const playlistRoutes = require("./routes/playlists");

app.use("/api/users", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected!"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;