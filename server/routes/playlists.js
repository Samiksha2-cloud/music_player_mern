const router = require('express').Router();
const Playlist = require('../models/Playlist');

const getUserId = (req) => req.headers['x-user-id'] || req.body?.userId || req.query.userId || null;

// Level-based song limits
const getSongLimit = (points, isPremium) => {
  if (isPremium) return Infinity;
  if (points >= 1000) return 30;
  if (points >= 600)  return 25;
  if (points >= 300)  return 20;
  if (points >= 100)  return 15;
  return 10;
};

// Free user playlist limit
const FREE_PLAYLIST_LIMIT = 1;

// GET user's playlists
router.get('/', async (req, res) => {
  try {
    const userId = getUserId(req);
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
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const isPremium = req.body.isPremium === true;

    // Free user limit: 1 playlist only
    if (!isPremium) {
      const existing = await Playlist.countDocuments({ userId });
      if (existing >= FREE_PLAYLIST_LIMIT) {
        return res.status(403).json({
          message: 'Free users can only create 1 playlist. Upgrade to Premium for unlimited playlists.',
          limitReached: true,
        });
      }
    }

    const playlist = new Playlist({
      name: req.body.name || 'My Playlist',
      userId,
      songs: [],
    });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add song to playlist
router.post('/:id/songs', async (req, res) => {
  try {
    const { songId, points, isPremium } = req.body;
    if (!songId) return res.status(400).json({ message: 'songId required' });

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    // Check song limit based on level
    const limit = getSongLimit(points || 0, isPremium || false);
    if (playlist.songs.length >= limit) {
      return res.status(403).json({
        message: isPremium
          ? 'Something went wrong.'
          : `Your current level allows ${limit} songs per playlist. Listen more to level up!`,
        limitReached: true,
        currentLimit: limit,
      });
    }

    if (!playlist.songs.includes(songId)) playlist.songs.push(songId);
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
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    playlist.songs = playlist.songs.filter((s) => s.toString() !== req.params.songId);
    await playlist.save();
    await playlist.populate('songs');
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE entire playlist
router.delete('/:id', async (req, res) => {
  try {
    await Playlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;