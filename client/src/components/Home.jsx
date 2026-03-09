// src/pages/Home.jsx (or wherever it is)
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import riffLogo from '../assets/riff-logo.png'; // if you want fallback

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-cyan-500 border-gray-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-blue-950 text-white">
      <Header />

      <div className="pt-32 md-pt-36 px-6 md:px-12"> {/* space for fixed header */}

        {/* Search Bar - like instructor */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search songs, artists, albums..."
              className="w-full py-4 px-6 bg-gray-900/60 border border-indigo-600/40 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition backdrop-blur-sm"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Category Filters - like Artist / Albums / Language */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-10 justify-center md:justify-start"
        >
          <button className="px-5 py-2 bg-indigo-900/50 hover:bg-indigo-800/70 rounded-full text-sm font-medium transition">Artist</button>
          <button className="px-5 py-2 bg-indigo-900/50 hover:bg-indigo-800/70 rounded-full text-sm font-medium transition">Albums</button>
          <button className="px-5 py-2 bg-indigo-900/50 hover:bg-indigo-800/70 rounded-full text-sm font-medium transition">Language</button>
          <button className="px-5 py-2 bg-indigo-900/50 hover:bg-indigo-800/70 rounded-full text-sm font-medium transition">Mood</button>
          <button className="px-5 py-2 bg-cyan-900/50 hover:bg-cyan-800/70 rounded-full text-sm font-medium transition">New</button>
        </motion.div>

        {/* Song Grid Placeholder - will fill with real data later */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {/* Repeat this block for each song later */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-900/40 rounded-xl overflow-hidden hover:scale-105 transition transform duration-300 border border-indigo-900/30"
            >
              <div className="aspect-square bg-gradient-to-br from-indigo-900 to-blue-950 flex items-center justify-center">
                <p className="text-5xl opacity-30">♪</p> {/* placeholder art */}
              </div>
              <div className="p-4">
                <h4 className="font-semibold truncate">Song Title {i + 1}</h4>
                <p className="text-sm text-gray-400 truncate">Artist Name</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty space / message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16 text-gray-500 text-lg"
        >
          Your favorite tracks will appear here soon...
        </motion.p>
      </div>
    </div>
  );
}