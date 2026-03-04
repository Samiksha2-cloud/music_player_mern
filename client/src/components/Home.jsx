import React from 'react';
import riffLogo from '../assets/riff-logo.png';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-blue-950 text-white flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl overflow-hidden">
      {/* Riff Logo at top */}
      <div className="flex justify-center mb-8">
      <img
        src={riffLogo}
        alt="Riff Logo"
        className="w-32 h-32 md:w-40 md:h-40 object-contain"
      />
      </div>
        {/* Profile Section */}
        <div className="flex flex-col items-center gap-6">
          {/* Profile Picture with glow */}
          <div className="relative w-40 h-40 md:w-48 md:h-48">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 blur-3xl opacity-60 animate-pulse"></div>
            <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-4 border-cyan-500/50 shadow-2xl shadow-cyan-500/40">
              <img
                src={user?.user_metadata?.avatar_url || 'https://via.placeholder.com/200?text=Riff'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* User Info */}
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              {user?.user_metadata?.full_name || 'Welcome to Riff'}
            </h2>
            <p className="text-gray-300 mt-2">{user?.email}</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={signOut}
            className="mt-6 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-full text-lg transition-all shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105"
          >
            Logout
          </button>
        </div>

        {/* Music Placeholder */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-semibold mb-4">Your Music</h3>
          <p className="text-gray-400">
            Add songs, playlists, and your favorites here soon!
          </p>
        </div>
      </div>
    </div>
  );
}