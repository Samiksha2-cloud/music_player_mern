// src/components/Header.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import riffLogo from '../assets/riff-logo.png'; // your icon-only logo
import { NavLink } from 'react-router-dom';

const Header = () => {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'User';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-lg border-b border-indigo-900/30"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-start gap-10 md:gap-16">
        {/* Big logo - centered or left, no text */}
        <div className="flex items-center gap-8 md:gap-12">
        <NavLink to="/" className="flex-shrink-0">
        <img
            src={riffLogo}
            alt="Riff"
            className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain drop-shadow-x1 transtion-transform hover:scale-105"
          />
        </NavLink>

        {/* Navigation Links - center, hidden on mobile */}
    <nav className="hidden md:flex flex-1 justify-center items-center gap-4 text-lg font-medium">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive
            ? 'text-cyan-400 underline underline-offset-8 font-semibold'
            : 'text-gray-300 hover:text-cyan-300 transition'
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/musics"
        className={({ isActive }) =>
          isActive
            ? 'text-cyan-400 underline underline-offset-8 font-semibold'
            : 'text-gray-300 hover:text-cyan-300 transition'
        }
      >
        Musics
      </NavLink>
      <NavLink
        to="/premium"
        className={({ isActive }) =>
          isActive
            ? 'text-cyan-400 underline underline-offset-8 font-semibold'
            : 'text-gray-300 hover:text-cyan-300 transition'
        }
      >
        Premium
      </NavLink>
      <NavLink
        to="/contact"
        className={({ isActive }) =>
          isActive
            ? 'text-cyan-400 underline underline-offset-8 font-semibold'
            : 'text-gray-300 hover:text-cyan-300 transition'
        }
      >
        Contact
      </NavLink>
    </nav>
    </div>

        {/* Right side: Greeting + small profile + future dropdown */}
        <div className="flex items-center gap-4 relative ml-auto">
          <div className="text-right hidden sm:block">
            <p className="text-lg font-medium text-cyan-300">Hey, {firstName}!</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 hover:opacity-80 tansition"
            >
              
              <img
                src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${firstName}&background=0D47A1&color=fff&size=128`}
                alt="Profile"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border-2 border-cyan-500/60 shadow-md object-cover"
              />
            </button>

            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 mt-3 w-44 bg-gray-900/95 border border-indigo-800/50 rounded-xl shadow-2xl backdrop-blur-sm overflow-hidden"
              >
                <button className="w-full px-4 py-3 text-left text-gray-300 hover:bg-indigo-950/50 transition text-sm">
                  Profile (coming soon)
                </button>
                <button className="w-full px-4 py-3 text-left text-red-400 hover:bg-indigo-950/50 transition border-t border-indigo-800/30 text-sm">
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;