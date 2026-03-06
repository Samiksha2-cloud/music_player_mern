import React from 'react';
import riffLogo from '../assets/riff-logo.png';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';  // ← add this import

export default function Home() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-blue-950 text-white">
      {/* Full-screen container - no centering card, just padding */}
      <div className="h-full w-full px-6 md:px-12 py-8 flex flex-col items-center">
        {/* Riff Logo at top - bigger and animated */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10"
        >
          <img
            src={riffLogo}
            alt="Riff Logo"
            className="w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-2xl"
          />
        </motion.div>

        {/* Profile Section - wider, animated */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-3xl flex flex-col items-center gap-8"
        >
          {/* Profile Picture with glow */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative w-40 h-40 md:w-56 md:h-56"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 blur-3xl opacity-60 animate-pulse"></div>
            <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-4 border-cyan-500/50 shadow-2xl shadow-cyan-500/40">
              <img
                src={user?.user_metadata?.avatar_url || 'https://via.placeholder.com/200?text=Riff'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* User Info */}
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold">
              {user?.user_metadata?.full_name || 'Welcome to Riff'}
            </h2>
            <p className="text-gray-300 mt-3 text-lg md:text-xl">{user?.email}</p>
          </div>

          {/* Logout Button - animated */}
          <motion.button
            whileHover={{ scale: 1.02, boxshadow: "0 25px 50px -12px rgba(59,130,246,0.2"}}
            whileTap={{ scale: 0.98 }}
            transition = {{duration: 0.4, ease: "easeOut" }}
            onClick={signOut}
            className="mt-8 px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-full text-xl transition-all shadow-xl hover:shadow-2xl hover:shadow-blue-500/50"
          >
            Logout
          </motion.button>
        </motion.div>

        {/* Music Section - full-width placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 w-full max-w-4xl text-center"
        >
          <h3 className="text-3xl md:text-4xl font-semibold mb-8">Your Music</h3>
          <p className="text-gray-400 text-lg md:text-xl">
            Add songs, playlists, and your favorites here soon!
          </p>
          {/* You can add a button or list here later */}
        </motion.div>
      </div>
    </div>
  );
}