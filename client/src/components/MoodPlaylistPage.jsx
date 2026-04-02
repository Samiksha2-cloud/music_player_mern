import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStateValue } from '../context/Stateprovider';
import { actionType } from '../context/reducer';
import { fetchSongs } from '../api';
import { motion } from 'framer-motion';
import Header from './Header';


const MOOD_GRADIENTS = {
  Happy:    'from-yellow-900/60 to-orange-900/40',
  Sad:      'from-blue-900/60 to-indigo-900/40',
  Chill:    'from-teal-900/60 to-cyan-900/40',
  Party:    'from-pink-900/60 to-purple-900/40',
  Romantic: 'from-rose-900/60 to-pink-900/40',
  Focus:    'from-indigo-900/60 to-blue-900/40',
  Workout:  'from-red-900/60 to-orange-900/40',
};

export default function MoodPlaylistPage() {
  const { mood } = useParams();
  const navigate = useNavigate();
  const [{ allSongs, moodSongs }, dispatch] = useStateValue();

  useEffect(() => {
    const load = async () => {
      if (!allSongs?.length) {
        const songs = await fetchSongs();
        if (songs?.length) dispatch({ type: actionType.SET_SONGS, songs });
      }
    };
    load();
  }, []);

  const songs = moodSongs?.[mood] || allSongs.filter(
    (s) => s.categories?.includes('mood') && s.mood === mood
  );

  const playSong = (song) => {
    dispatch({ type: actionType.SET_CURRENT_SONG, song });
    dispatch({ type: actionType.SET_IS_PLAYING, isPlaying: true });
  };

  const gradient = MOOD_GRADIENTS[mood] || 'from-indigo-900/60 to-cyan-900/40';

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Hero */}
      <div className={`pt-28 pb-10 px-6 md:px-12 bg-gradient-to-b ${gradient} to-black`}>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-white transition text-sm mb-6 flex items-center gap-2"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-black text-white mb-1">{mood}</h1>
        <p className="text-gray-400 text-sm">{songs.length} songs</p>

        {/* Play all button */}
        {songs.length > 0 && (
          <button
            onClick={() => playSong(songs[0])}
            className="mt-6 px-8 py-3 rounded-full bg-cyan-500 text-black font-bold text-sm hover:bg-cyan-400 hover:scale-105 transition-all duration-200"
          >
            Play All
          </button>
        )}
      </div>

      {/* Songs list */}
      <div className="px-6 md:px-12 pb-32">
        {songs.length === 0 ? (
          <p className="text-gray-600 py-16 text-center">No songs in this mood yet.</p>
        ) : (
          <div className="flex flex-col gap-2 max-w-3xl">
            {songs.map((song, i) => (
              <motion.div
                key={song._id || i}
                whileHover={{ scale: 1.01 }}
                onClick={() => playSong(song)}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all duration-200 cursor-pointer group"
              >
                <span className="text-gray-600 text-sm w-5 text-right flex-shrink-0">{i + 1}</span>
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-indigo-900/50 flex-shrink-0">
                  {song.imageURL
                    ? <img src={song.imageURL} alt={song.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-600">♪</div>
                  }
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-white font-semibold truncate group-hover:text-cyan-400 transition-colors">{song.title}</p>
                  <p className="text-gray-500 text-sm truncate">{song.artist}</p>
                </div>
                <p className="text-gray-600 text-sm flex-shrink-0">{song.album || ''}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      
    </div>
  );
}