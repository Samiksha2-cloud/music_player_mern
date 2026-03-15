const router = require('express').Router();
const Playlist = require('../models/Playlist');
const Song = require('../models/Song');

// Helper to get userId from auth header (simplified - you can add proper JWT verify)
const getUserId = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  // For now we'll pass userId in body/query or use a simple token decode
  return req.headers['x-user-id'] || req.body?.userId || null;
};

// GET user's playlists
router.get('/', async (req, res) => {
  try {
    const userId = getUserId(req) || req.query.userId;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const playlists = await Playlist.find({ userId }).populate('songs').lean();
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create playlist
router.post('/', async (req, res) => {
  try {
    const userId = getUserId(req) || req.body.userId;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const playlist = new Playlist({ name: req.body.name || 'My Playlist', userId, songs: [] });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add song to playlist
router.post('/:id/songs', async (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    if (!songId) return res.status(400).json({ message: 'songId required' });
    const playlist = await Playlist.findById(id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.songs.includes(songId)) {
      return res.json(playlist);
    }
    playlist.songs.push(songId);
    await playlist.save();
    await playlist.populate('songs');
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE remove song from playlist
router.delete('/:id/songs/:songId', async (req, res) => {
  try {
    const { id, songId } = req.params;
    const playlist = await Playlist.findById(id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    playlist.songs = playlist.songs.filter((s) => s.toString() !== songId);
    await playlist.save();
    await playlist.populate('songs');
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
