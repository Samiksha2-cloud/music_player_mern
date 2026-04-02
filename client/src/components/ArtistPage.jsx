import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStateValue } from '../context/Stateprovider';
import { actionType } from '../context/reducer';
import { fetchSongs } from '../api';
import { motion } from 'framer-motion';
import Header from './Header';


export default function ArtistPage() {
  const { artistName } = useParams();
  const navigate = useNavigate();
  const [{ allSongs }, dispatch] = useStateValue();

  useEffect(() => {
    const load = async () => {
      if (!allSongs?.length) {
        const songs = await fetchSongs();
        if (songs?.length) dispatch({ type: actionType.SET_SONGS, songs });
      }
    };
    load();
  }, []);

  const decodedArtist = decodeURIComponent(artistName);
  const songs = allSongs.filter((s) => s.artist === decodedArtist);
  const coverImage = songs.find((s) => s.imageURL)?.imageURL;

  const playSong = (song) => {
    dispatch({ type: actionType.SET_CURRENT_SONG, song });
    dispatch({ type: actionType.SET_IS_PLAYING, isPlaying: true });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Hero */}
      <div className="relative pt-28 pb-10 px-6 md:px-12">
        {/* Background blur from artist image */}
        {coverImage && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url(${coverImage})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(40px) brightness(0.3)',
          }} />
        )}
        <div className="relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-white transition text-sm mb-6 flex items-center gap-2"
          >
            ← Back
          </button>

          <div className="flex items-end gap-6 mb-6">
            {/* Artist image */}
            <div className="w-32 h-32 rounded-full overflow-hidden bg-indigo-900/50 flex-shrink-0 shadow-2xl border-2 border-white/10">
              {coverImage
                ? <img src={coverImage} alt={decodedArtist} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-4xl text-gray-600">♪</div>
              }
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Artist</p>
              <h1 className="text-5xl font-black text-white mb-2">{decodedArtist}</h1>
              <p className="text-gray-400 text-sm">{songs.length} songs</p>
            </div>
          </div>

          {songs.length > 0 && (
            <button
              onClick={() => playSong(songs[0])}
              className="px-8 py-3 rounded-full bg-cyan-500 text-black font-bold text-sm hover:bg-cyan-400 hover:scale-105 transition-all duration-200"
            >
              Play All
            </button>
          )}
        </div>
      </div>

      {/* Songs list */}
      <div className="px-6 md:px-12 pb-32 relative z-10">
        {songs.length === 0 ? (
          <p className="text-gray-600 py-16 text-center">No songs found for this artist.</p>
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
                  <p className="text-gray-500 text-sm truncate">{song.album || ''}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      
    </div>
  );
}