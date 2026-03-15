import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStateValue } from '../context/Stateprovider';
import { actionType } from '../context/reducer';
import { fetchSongs } from '../api';
import { motion } from 'framer-motion';
import Header from './Header';
import MusicPlayer from './MusicPlayer';
import homepageVideo from '../assets/Homepage.mp4';

export default function Home() {
  const { user, loading } = useAuth();
  const [{ allSongs }, dispatch] = useStateValue();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      const songs = await fetchSongs();
      if (songs?.length) dispatch({ type: actionType.SET_SONGS, songs });
    };
    load();
  }, [dispatch]);

  const filteredSongs = allSongs.filter(
    (song) =>
      song.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-cyan-500 border-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative">

      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover -z-10"
      >
        <source src={homepageVideo} type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/55 -z-10" />

      {/* Header */}
      <Header />

      {/* Main content */}
      <div className="pt-32 md:pt-36 px-6 md:px-12 pb-32 relative z-10">

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 8 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search songs, artists, albums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 px-6 bg-gray-900/60 border border-indigo-600/40 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition backdrop-blur-sm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Filter buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-10 justify-center"
        >
          {['Artist', 'Songs', 'Language', 'Mood', 'New'].map((label) => (
            <button
              key={label}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95
                ${label === 'New'
                  ? 'bg-cyan-900/50 hover:bg-cyan-800/70'
                  : 'bg-indigo-900/50 hover:bg-indigo-800/70'
                }`}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* Song cards - 3 per row, clickable to play */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {filteredSongs.map((song, i) => (
            <motion.div
              key={song._id || song.id || i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                dispatch({ type: actionType.SET_CURRENT_SONG, song });
                dispatch({ type: actionType.SET_IS_PLAYING, isPlaying: true });
              }}
              className="bg-gray-900/40 rounded-2xl overflow-hidden border border-indigo-900/30 backdrop-blur-sm
                         hover:scale-105 hover:shadow-2xl hover:shadow-indigo-900/40 transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-square bg-gradient-to-br from-indigo-900 to-blue-950 flex items-center justify-center">
                {song.imageURL
                  ? <img src={song.imageURL} alt={song.title} className="w-full h-full object-cover" />
                  : <p className="text-6xl opacity-30">♪</p>
                }
              </div>
              <div className="p-4">
                <h4 className="font-semibold truncate text-base">{song.title}</h4>
                <p className="text-sm text-gray-400 truncate mt-1">{song.artist}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No results */}
        {filteredSongs.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-16 text-gray-500 text-lg"
          >
            No songs match "{searchTerm}"
          </motion.p>
        )}
      </div>

      {/* Music player - fixed at bottom */}
      <MusicPlayer />

    </div>
  );
}