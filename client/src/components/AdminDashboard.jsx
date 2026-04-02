import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchSongs, deleteSong, uploadSong } from '../api';
import { useStateValue } from '../context/Stateprovider';
import { actionType } from '../context/reducer';

const ADMIN_EMAIL = 'samikshayadav112@gmail.com';
const MOODS = ['Happy', 'Sad', 'Chill', 'Party', 'Romantic', 'Focus', 'Workout'];
const LANGUAGES = ['Hindi', 'English'];
const CATEGORIES = ['new', 'mood', 'language', 'artist'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [, dispatch] = useStateValue();

  const [songs, setSongs] = useState([]);
  const [activeTab, setActiveTab] = useState('songs');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Upload form state
  const [form, setForm] = useState({ title: '', artist: '', album: '', mood: '', language: '' });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (user && user.email !== ADMIN_EMAIL) {
      navigate('/');
    }
  }, [user, navigate]);

  // Load songs
  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    setLoading(true);
    const data = await fetchSongs();
    setSongs(data || []);
    dispatch({ type: actionType.SET_SONGS, songs: data || [] });
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await deleteSong(id);
    setDeleteConfirm(null);
    await loadSongs();
    setMessage('Song deleted successfully.');
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleUpload = async () => {
    if (!form.title || !form.artist || !audioFile) {
      setMessage('Title, artist and audio file are required!');
      return;
    }
    setUploadLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('artist', form.artist);
    formData.append('album', form.album);
    formData.append('mood', form.mood);
    formData.append('language', form.language);
    formData.append('categories', JSON.stringify(selectedCategories));
    formData.append('audio', audioFile);
    if (imageFile) formData.append('image', imageFile);

    const result = await uploadSong(formData);
    if (result?.song) {
      setMessage('Song uploaded successfully!');
      setForm({ title: '', artist: '', album: '', mood: '', language: '' });
      setSelectedCategories([]);
      setAudioFile(null);
      setImageFile(null);
      await loadSongs();
    } else {
      setMessage('Upload failed. Try again.');
    }
    setUploadLoading(false);
  };

  // Stats
  const totalSongs = songs.length;
  const moodSongs = songs.filter((s) => s.categories?.includes('mood')).length;
  const newSongs = songs.filter((s) => s.categories?.includes('new')).length;
  const languageSongs = songs.filter((s) => s.categories?.includes('language')).length;

  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
      `}</style>

      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-lg border-b border-cyan-900/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-sm font-bold">
            A
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-400 hover:text-cyan-400 transition hover:scale-105"
        >
          ← Back to App
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-6">
        {[
          { label: 'Total Songs', value: totalSongs, color: 'cyan' },
          { label: 'New Releases', value: newSongs, color: 'indigo' },
          { label: 'Mood Songs', value: moodSongs, color: 'cyan' },
          { label: 'Language Songs', value: languageSongs, color: 'indigo' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-gray-900/60 rounded-2xl p-5 border border-${stat.color}-900/30 backdrop-blur-sm`}
          >
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-3xl font-black text-${stat.color}-400`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-6 flex gap-3 mb-6">
        {['songs', 'upload'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 capitalize
              ${activeTab === tab
                ? 'bg-cyan-500 text-black'
                : 'bg-gray-900/60 text-gray-400 hover:text-white border border-gray-700'
              }`}
          >
            {tab === 'songs' ? '🎵 Manage Songs' : '⬆️ Upload Song'}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-6 mb-4 px-4 py-3 rounded-xl text-sm font-medium fade-in
          ${message.includes('success') || message.includes('deleted')
            ? 'bg-green-900/40 text-green-400 border border-green-800/40'
            : 'bg-red-900/40 text-red-400 border border-red-800/40'
          }`}>
          {message}
        </div>
      )}

      <div className="px-6 pb-32">

        {/* ── SONGS TAB ── */}
        {activeTab === 'songs' && (
          <div className="fade-in">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-t-cyan-500 border-gray-700 rounded-full animate-spin" />
              </div>
            ) : songs.length === 0 ? (
              <p className="text-center text-gray-500 py-20">No songs yet. Upload some!</p>
            ) : (
              <div className="flex flex-col gap-3">
                {songs.map((song) => (
                  <div
                    key={song._id}
                    className="flex items-center gap-4 bg-gray-900/50 rounded-2xl p-4 border border-gray-800/40 hover:border-cyan-900/40 transition-all duration-200 fade-in"
                  >
                    {/* Cover art */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-indigo-900/50 flex-shrink-0">
                      {song.imageURL
                        ? <img src={song.imageURL} alt={song.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">♪</div>
                      }
                    </div>

                    {/* Song info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{song.title}</p>
                      <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                      {/* Category tags */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {song.categories?.map((cat) => (
                          <span
                            key={cat}
                            className="text-xs px-2 py-0.5 rounded-full bg-cyan-900/40 text-cyan-400 border border-cyan-800/30"
                          >
                            {cat}
                          </span>
                        ))}
                        {song.mood && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-400 border border-indigo-800/30">
                            {song.mood}
                          </span>
                        )}
                        {song.language && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700/60 text-gray-300 border border-gray-600/30">
                            {song.language}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete button */}
                    {deleteConfirm === song._id ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400">Sure?</span>
                        <button
                          onClick={() => handleDelete(song._id)}
                          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition hover:scale-105"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs transition hover:scale-105"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(song._id)}
                        className="flex-shrink-0 p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200 hover:scale-110"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── UPLOAD TAB ── */}
        {activeTab === 'upload' && (
          <div className="fade-in max-w-xl">
            <div className="bg-gray-900/60 rounded-2xl p-6 border border-indigo-900/30 backdrop-blur-sm flex flex-col gap-4">

              {/* Title + Artist + Album */}
              {[
                { key: 'title', placeholder: 'Song title *' },
                { key: 'artist', placeholder: 'Artist name *' },
                { key: 'album', placeholder: 'Album (optional)' },
              ].map(({ key, placeholder }) => (
                <input
                  key={key}
                  type="text"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full py-3 px-4 bg-gray-800/60 rounded-xl border border-indigo-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
                />
              ))}

              {/* Categories */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 capitalize
                        ${selectedCategories.includes(cat)
                          ? 'bg-cyan-500 text-black'
                          : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-cyan-700'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood dropdown (only if mood category selected) */}
              {selectedCategories.includes('mood') && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Mood</p>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((mood) => (
                      <button
                        key={mood}
                        onClick={() => setForm({ ...form, mood })}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105
                          ${form.mood === mood
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-indigo-700'
                          }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Language dropdown (only if language category selected) */}
              {selectedCategories.includes('language') && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Language</p>
                  <div className="flex gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setForm({ ...form, language: lang })}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105
                          ${form.language === lang
                            ? 'bg-cyan-500 text-black'
                            : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-cyan-700'
                          }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio file */}
              <div className="w-full py-3 px-4 bg-gray-800/60 rounded-xl border border-indigo-900/30">
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-cyan-400">🎵</span>
                  <span className="text-gray-400 text-sm truncate">
                    {audioFile ? audioFile.name : 'Choose MP3 file *'}
                  </span>
                  <input type="file" accept="audio/*" className="hidden" onChange={(e) => setAudioFile(e.target.files[0])} />
                </label>
              </div>

              {/* Image file */}
              <div className="w-full py-3 px-4 bg-gray-800/60 rounded-xl border border-indigo-900/30">
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-cyan-400">🖼️</span>
                  <span className="text-gray-400 text-sm truncate">
                    {imageFile ? imageFile.name : 'Choose cover image (optional)'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
                </label>
              </div>

              {/* Submit */}
              <button
                onClick={handleUpload}
                disabled={uploadLoading}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
              >
                {uploadLoading ? 'Uploading...' : '⬆️ Upload Song'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}