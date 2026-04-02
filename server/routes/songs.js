const router = require('express').Router();
const Song = require('../models/Song');
const { supabase } = require('../config/supabase.config');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// GET all songs (with optional category/mood/language filters)
router.get('/', async (req, res) => {
  try {
    const { category, mood, language } = req.query;
    let query = {};

    if (category === 'mood' && mood) {
      query = { categories: 'mood', mood };
    } else if (category === 'language' && language) {
      query = { categories: 'language', language };
    } else if (category) {
      query = { categories: category };
    }

    const songs = await Song.find(query).lean();
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET songs grouped by mood (for mood playlists)
router.get('/moods', async (req, res) => {
  try {
    const moods = ['Happy', 'Sad', 'Chill', 'Party', 'Romantic', 'Focus', 'Workout'];
    const result = {};
    for (const mood of moods) {
      result[mood] = await Song.find({ categories: 'mood', mood }).lean();
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST upload a new song (admin only)
router.post('/upload', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, artist, album, categories, mood, language } = req.body;
    const audioFile = req.files['audio']?.[0];
    const imageFile = req.files['image']?.[0];

    if (!audioFile) return res.status(400).json({ message: 'Audio file is required' });

    // Upload audio to Supabase Storage
    const audioFileName = `audio/${Date.now()}_${audioFile.originalname}`;
    const { error: audioError } = await supabase.storage
      .from('songs')
      .upload(audioFileName, audioFile.buffer, { contentType: audioFile.mimetype });
    if (audioError) throw audioError;

    const { data: audioData } = supabase.storage.from('songs').getPublicUrl(audioFileName);

    // Upload image if provided
    let imageURL = '';
    if (imageFile) {
      const imageFileName = `images/${Date.now()}_${imageFile.originalname}`;
      const { error: imageError } = await supabase.storage
        .from('songs')
        .upload(imageFileName, imageFile.buffer, { contentType: imageFile.mimetype });
      if (imageError) throw imageError;

      const { data: imageData } = supabase.storage.from('songs').getPublicUrl(imageFileName);
      imageURL = imageData.publicUrl;
    }

    // Parse categories (sent as JSON string or array)
    let parsedCategories = [];
    if (categories) {
      parsedCategories = typeof categories === 'string'
        ? JSON.parse(categories)
        : categories;
    }

    const song = new Song({
      title,
      artist,
      album,
      audioURL: audioData.publicUrl,
      imageURL,
      categories: parsedCategories,
      mood: mood || '',
      language: language || '',
    });
    await song.save();

    res.status(201).json({ message: 'Song uploaded successfully', song });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE a song
router.delete('/:id', async (req, res) => {
  try {
    await Song.findByIdAndDelete(req.params.id);
    res.json({ message: 'Song deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;