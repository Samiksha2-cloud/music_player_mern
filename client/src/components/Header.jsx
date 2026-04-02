import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import riffLogo from '../assets/riff-logo.png';
import { NavLink } from 'react-router-dom';
import { isActiveStyles, isNotActiveStyles } from '../utils/style';
import { FaCrown } from 'react-icons/fa';
import FavsPanel from './FavsPanel';

const Header = () => {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFavs, setShowFavs] = useState(false);
  const [favsTab, setFavsTab] = useState('favs'); 

  const premiumKey = `riff_premium_${user?.email}`;
  const isPremium = localStorage.getItem(premiumKey) === 'true';
  const displayName = user?.name || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const initial = (user?.name?.[0] || user?.email?.[0] || user?.user_metadata?.full_name?.[0] || 'U').toUpperCase();

  const handleLogout = async () => {
    await signOut();
    setShowDropdown(false);
  };

  return (
    <>
      <FavsPanel isOpen={showFavs} onClose={() => setShowFavs(false)} defaultTab={favsTab} />
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-lg border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-10 md:gap-16">

          {/* Logo */}
          <NavLink to="/" className="flex-shrink-0">
            <img
              src={riffLogo}
              alt="Riff"
              className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-full shadow-lg hover:scale-110 transition-transform duration-200 border-2 border-indigo-500/30"
            />
          </NavLink>

          {/* Nav — only Home and Premium */}
          <ul className="hidden md:flex items-center gap-6 lg:gap-8 text-base lg:text-lg font-medium">
            {[
              { label: 'Home', to: '/' },
              { label: 'Premium', to: '/premium' },
            ].map(({ label, to }) => (
              <li key={label}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `${isActive ? isActiveStyles : isNotActiveStyles} hover:scale-105 transition-transform duration-150 inline-block`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex-1" />

          {/* Profile */}
          <div className="flex items-center gap-3 relative">
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold shadow-md hover:scale-110 transition-transform duration-200">
                {initial}
              </div>

              {/* Name + optional premium badge */}
              <div className="hidden md:flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-white">{displayName}</p>
                  {isPremium && (
                    <div className="flex items-center gap-1 text-yellow-500 text-xs">
                      <FaCrown className="text-yellow-400" />
                      <span>Premium</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
              </div>
            </div>

            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-14 w-44 bg-gray-900/95 border border-indigo-800/50 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden"
              >
                <button
                  onClick={() => { setShowFavs(true); setShowDropdown(false); }}
                  className="w-full px-4 py-3 text-left text-gray-300 hover:bg-indigo-950/60 hover:text-white transition-all duration-150 text-sm"
                >
                  My Library
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-red-400 hover:bg-indigo-950/60 hover:text-red-300 transition-all duration-150 border-t border-indigo-800/30 text-sm"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>
    </>
  );
};

export default Header;