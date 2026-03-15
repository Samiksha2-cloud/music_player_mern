/**
 * Musics - Page to browse all songs and add them to playlist
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import { useStateValue } from '../context/Stateprovider';
import { actionType } from '../context/reducer';
import { fetchSongs } from '../api';
import { FaPlus } from 'react-icons/fa';
import VideoBackground from './VideoBackground';

export default function Musics() {
  // Global state: allSongs and playlist from StateProvider
  const [{ allSongs, playlist }, dispatch] = useStateValue();
  // Local state: search input value
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch songs from API on mount
  useEffect(() => {
    const load = async () => {
      const songs = await fetchSongs();
      if (songs?.length) dispatch({ type: actionType.SET_SONGS, songs });
    };
    load();
  }, [dispatch]);

  // Filter songs by title or artist (case-insensitive)
  const filteredSongs = allSongs.filter(
    (song) =>
      song.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add a song to the playlist (dispatches to global state)
  const addToPlaylist = (song) => {
    dispatch({ type: actionType.ADD_TO_PLAYLIST, song });
  };

  // Check if a song is already in the playlist
  const isInPlaylist = (song) =>
    playlist.some((s) => (s._id || s.id) === (song._id || song.id));

  return (
    <div className="min-h-screen text-white relative">
      {/* Full-screen video background */}
      <VideoBackground overlayOpacity="bg-black/50" />

      {/* Top navigation bar */}
      <Header />

      {/* Main content area */}
      <div className="pt-32 md:pt-36 px-6 md:px-12 relative z-10">
        {/* Page title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-6 text-cyan-400"
        >
          All Musics
        </motion.h1>

        {/* Search input - filters songs by title or artist */}
        <div className="max-w-3xl mb-8">
          <input
            type="text"
            placeholder="Search songs or artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 px-5 bg-gray-900/60 border border-indigo-600/40 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 backdrop-blur-sm"
          />
        </div>

        {/* Song cards grid with add-to-playlist button on hover */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredSongs.map((song, i) => (
            <motion.div
              key={song._id || song.id || i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-900/40 rounded-xl overflow-hidden hover:scale-[1.02] transition transform duration-300 border border-indigo-900/30 group backdrop-blur-sm"
            >
              {/* Song artwork with add button overlay */}
              <div className="aspect-square bg-gradient-to-br from-indigo-900 to-blue-950 flex items-center justify-center relative">
                <p className="text-5xl opacity-30">♪</p>
                {/* Add to playlist button - visible on hover */}
                <button
                  onClick={() => addToPlaylist(song)}
                  disabled={isInPlaylist(song)}
                  className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-cyan-500/90 hover:bg-cyan-400 flex items-center justify-center text-black shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isInPlaylist(song) ? 'In playlist' : 'Add to playlist'}
                >
                  <FaPlus className="w-4 h-4" />
                </button>
                {/* Badge when song is in playlist */}
                {isInPlaylist(song) && (
                  <span className="absolute top-2 left-2 text-xs bg-cyan-500/80 text-black px-2 py-0.5 rounded-full">
                    In playlist
                  </span>
                )}
              </div>
              {/* Song title and artist */}
              <div className="p-4">
                <h4 className="font-semibold truncate">{song.title}</h4>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message when no songs match search */}
        {filteredSongs.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No songs match "{searchTerm}"</p>
        )}

        {/* My Playlist section - shows when playlist has items */}
        {playlist.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 p-4 bg-gray-900/60 rounded-xl border border-indigo-900/30 backdrop-blur-sm"
          >
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">My Playlist ({playlist.length})</h2>
            <ul className="space-y-2">
              {playlist.map((s, i) => (
                <li key={s._id || s.id || i} className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-0">
                  <span>{s.title} – {s.artist}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}
