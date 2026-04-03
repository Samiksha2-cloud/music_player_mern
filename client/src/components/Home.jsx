import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStateValue } from '../context/Stateprovider';
import { actionType } from '../context/reducer';
import { fetchSongs, fetchMoodSongs, fetchPlaylists } from '../api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import FavsPanel from './FavsPanel';
import PlaylistModal from './PlaylistModal';
import orbVideo from '../assets/orb_design.mp4';

const ADMIN_EMAIL = 'samikshayadav112@gmail.com';
const MOODS = ['Happy', 'Sad', 'Chill', 'Party', 'Romantic', 'Focus', 'Workout'];

const MOOD_GRADIENTS = {
  Happy:    'from-yellow-800/80 to-orange-900/60',
  Sad:      'from-blue-900/80 to-indigo-900/60',
  Chill:    'from-teal-900/80 to-cyan-900/60',
  Party:    'from-pink-900/80 to-purple-900/60',
  Romantic: 'from-rose-900/80 to-pink-900/60',
  Focus:    'from-indigo-900/80 to-blue-900/60',
  Workout:  'from-red-900/80 to-orange-900/60',
};

const LEVELS = [
  { min: 0,    max: 99,       color: '#06b6d4', name: 'Newcomer'   },
  { min: 100,  max: 299,      color: '#6366f1', name: 'Listener'   },
  { min: 300,  max: 599,      color: '#06b6d4', name: 'Enthusiast' },
  { min: 600,  max: 999,      color: '#6366f1', name: 'Addict'     },
  { min: 1000, max: Infinity, color: '#67e8f9', name: 'Legend'     },
];
const getLevel = (pts) => LEVELS.find((l) => pts >= l.min && pts <= l.max) || LEVELS[0];

export default function Home() {
  const { user, loading } = useAuth();
  const [{ allSongs, moodSongs, playlists }, dispatch] = useStateValue();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [playlistModalSong, setPlaylistModalSong] = useState(null);
  const [favIds, setFavIds] = useState(() => JSON.parse(localStorage.getItem('riff_favs') || '[]'));
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryTab, setLibraryTab] = useState('playlists');
  const navigate = useNavigate();

  const isPremium = localStorage.getItem('riff_premium') === 'true';
  const points = parseInt(localStorage.getItem('riff_points') || '0');
  const level = getLevel(points);

  const newRef = useRef(null);
  const moodRef = useRef(null);
  const languageRef = useRef(null);
  const artistRef = useRef(null);
  const albumRef = useRef(null);
  const playlistRef = useRef(null);
  const songsRef = useRef(null);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  useEffect(() => {
    const load = async () => {
      const songs = await fetchSongs();
      if (songs?.length) dispatch({ type: actionType.SET_SONGS, songs });
      const moods = await fetchMoodSongs();
      if (moods) dispatch({ type: actionType.SET_MOOD_SONGS, moodSongs: moods });
      const userId = user?.id || user?.sub;
      if (userId) {
        const pls = await fetchPlaylists(userId);
        if (pls) dispatch({ type: actionType.SET_PLAYLISTS, playlists: pls });
      }
    };
    load();
  }, [dispatch, user]);

  const filteredSongs = allSongs.filter(
    (s) =>
      s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.artist?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const newSongs = allSongs.filter((s) => s.categories?.includes('new'));
  const languageSongs = allSongs.filter(
    (s) => s.categories?.includes('language') && (!selectedLanguage || s.language === selectedLanguage)
  );

  const artistMap = {};
  allSongs.filter((s) => s.categories?.includes('artist')).forEach((s) => {
    if (!artistMap[s.artist]) artistMap[s.artist] = [];
    artistMap[s.artist].push(s);
  });

  const playSong = (song) => {
    dispatch({ type: actionType.SET_CURRENT_SONG, song });
    dispatch({ type: actionType.SET_IS_PLAYING, isPlaying: true });
  };

  const toggleFav = (e, song) => {
    e.stopPropagation();
    const id = song._id || song.id;
    const current = JSON.parse(localStorage.getItem('riff_favs') || '[]');
    let updated;
    if (current.includes(id)) {
      updated = current.filter((f) => f !== id);
    } else {
      updated = [id, ...current];
    }
    localStorage.setItem('riff_favs', JSON.stringify(updated));
    setFavIds(updated);
  };

  const handleDownload = (e, song) => {
    e.stopPropagation();
    if (!isPremium) { navigate('/premium'); return; }
    const a = document.createElement('a');
    a.href = song.audioURL;
    a.download = `${song.title} - ${song.artist}.mp3`;
    a.target = '_blank';
    a.click();
  };

  const handleAddToPlaylist = (e, song) => {
    e.stopPropagation();
    setPlaylistModalSong(song);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-cyan-500 border-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  // Group songs into albums by extracting name from imageURL filename
  const albumMap = {};
  allSongs.forEach((song) => {
    if (!song.imageURL) return;
    const urlParts = song.imageURL.split('/');
    const filename = urlParts[urlParts.length - 1];
    const rawName = filename.replace(/\.[^.]+$/, '');
    const albumName = rawName
      .replace(/[_-]/g, ' ')
      .replace(/\d+$/, '')
      .trim()
      .split(' ')
      .slice(0, 3)
      .join(' ')
      .trim();
    if (!albumName || albumName.length < 2) return;
    if (!albumMap[albumName]) albumMap[albumName] = [];
    albumMap[albumName].push(song);
  });
  const albums = Object.entries(albumMap).filter(([, songs]) => songs.length >= 2);

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Header />

      {showLibrary && (
        <FavsPanel
          isOpen={showLibrary}
          onClose={() => setShowLibrary(false)}
          defaultTab={libraryTab}
        />
      )}

      {playlistModalSong && (
        <PlaylistModal song={playlistModalSong} onClose={() => setPlaylistModalSong(null)} />
      )}

      {/*
        pt-44 = 176px top padding
        header is ~72px, player bar is ~64px → total ~136px
        pt-44 gives comfortable breathing room below both bars
      */}
      <div className="pt-44 px-6 md:px-12 pb-16 relative z-10">

        {/* Orb strip */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/orb')}
          className="flex items-center gap-3 mb-6 cursor-pointer w-fit hover:scale-105 transition-all duration-200"
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: `0 0 12px 4px ${level.color}66` }}>
            <video src={orbVideo} autoPlay loop muted playsInline onError={() => {}} onAbort={() => {}}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <p style={{ color: level.color }} className="text-xs font-bold uppercase tracking-widest">{level.name}</p>
            <p className="text-white text-sm font-bold">{points} pts</p>
          </div>
          <svg className="w-4 h-4 text-gray-500 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>

        {/* Admin button */}
        {user?.email === ADMIN_EMAIL && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => navigate('/admin')}
            className="mb-6 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/30 hover:scale-105 transition-all duration-200"
          >
            Admin Dashboard
          </motion.button>
        )}

        {/* Search bar */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto mb-8">
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

        {/* Section nav */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-10 justify-center"
        >
          {[
            { label: 'New', ref: newRef },
            { label: 'Mood', ref: moodRef },
            { label: 'Language', ref: languageRef },
            { label: 'Artist', ref: artistRef },
            { label: 'Albums', ref: albumRef },
            { label: 'My Playlists', ref: playlistRef },
            { label: 'All Songs', ref: songsRef },
          ].map(({ label, ref }) => (
            <button
              key={label}
              onClick={() => scrollTo(ref)}
              className="px-5 py-2 rounded-full text-sm font-medium bg-indigo-900/50 hover:bg-cyan-900/50 border border-indigo-800/30 hover:border-cyan-700/40 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* Search results */}
        {searchTerm && (
          <div className="mb-12">
            <h2 className="text-lg font-bold mb-4 text-gray-300">
              Results for "<span className="text-cyan-400">{searchTerm}</span>"
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
              {filteredSongs.map((song, i) => (
                <SongCard
                  key={song._id || i} song={song}
                  isFav={favIds.includes(song._id || song.id)}
                  onPlay={() => playSong(song)}
                  onFav={(e) => toggleFav(e, song)}
                  onDownload={(e) => handleDownload(e, song)}
                  onPlaylist={(e) => handleAddToPlaylist(e, song)}
                />
              ))}
              {filteredSongs.length === 0 && <p className="text-gray-500 py-10">No songs found.</p>}
            </div>
          </div>
        )}

        {/* NEW SONGS */}
        <section ref={newRef} className="mb-14 scroll-mt-48">
          <SectionTitle title="New Releases" />
          {newSongs.length === 0
            ? <EmptyState text="No new releases yet." />
            : <HorizontalRow songs={newSongs} favIds={favIds} onPlay={playSong} onFav={toggleFav} onDownload={handleDownload} onPlaylist={handleAddToPlaylist} />
          }
        </section>

        {/* MOOD */}
        <section ref={moodRef} className="mb-14 scroll-mt-48">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-2 flex-1">
              <h2 className="text-xl font-bold text-white">Mood Playlists</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-cyan-900/40 to-transparent ml-3" />
            </div>
            {/* AI Moodcast shortcut */}
            <button
              onClick={() => navigate('/moodcast')}
              style={{ padding: '7px 16px', borderRadius: '99px', border: '1px solid #06b6d433', background: '#06b6d410', color: '#06b6d4', fontSize: '12px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#06b6d420'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#06b6d410'}
            >
              ✨ AI Moodcast
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
            {MOODS.map((mood) => {
              const count = moodSongs?.[mood]?.length || 0;
              const coverSong = moodSongs?.[mood]?.[0];
              return (
                <motion.div
                  key={mood}
                  whileHover={{ scale: 1.04 }}
                  onClick={() => navigate(`/mood/${mood}`)}
                  className={`flex-shrink-0 w-40 rounded-2xl overflow-hidden cursor-pointer border border-indigo-800/30 hover:border-cyan-700/40 transition-all duration-200 bg-gradient-to-br ${MOOD_GRADIENTS[mood]}`}
                >
                  <div className="w-full aspect-square relative">
                    {coverSong?.imageURL
                      ? <img src={coverSong.imageURL} alt={mood} className="w-full h-full object-cover opacity-60" />
                      : <div className="w-full h-full bg-black/40" />
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-white text-sm">{mood}</p>
                    <p className="text-xs text-gray-400">{count} song{count !== 1 ? 's' : ''}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* LANGUAGE */}
        <section ref={languageRef} className="mb-14 scroll-mt-48">
          <SectionTitle title="Browse by Language" />
          <div className="flex gap-3 mb-5">
            {['', 'Hindi', 'English'].map((lang) => (
              <button
                key={lang || 'all'}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105
                  ${selectedLanguage === lang
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-gray-900/60 text-gray-400 border border-gray-700 hover:border-cyan-700'
                  }`}
              >
                {lang || 'All'}
              </button>
            ))}
          </div>
          {languageSongs.length === 0
            ? <EmptyState text="No songs in this language yet." />
            : <HorizontalRow songs={languageSongs} favIds={favIds} onPlay={playSong} onFav={toggleFav} onDownload={handleDownload} onPlaylist={handleAddToPlaylist} />
          }
        </section>

        {/* ARTIST */}
        <section ref={artistRef} className="mb-14 scroll-mt-48">
          <SectionTitle title="Artists" />
          {Object.keys(artistMap).length === 0 ? (
            <EmptyState text="No artist songs yet." />
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-3 scrollbar-hide">
              {Object.entries(artistMap).map(([artist, artistSongs]) => (
                <motion.div
                  key={artist}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate(`/artist/${encodeURIComponent(artist)}`)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-indigo-900/50 border-2 border-indigo-800/30 hover:border-cyan-700/40 transition-all duration-200">
                    {artistSongs[0]?.imageURL
                      ? <img src={artistSongs[0].imageURL} alt={artist} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xl">♪</div>
                    }
                  </div>
                  <p className="text-xs text-gray-300 font-semibold text-center w-20 truncate">{artist}</p>
                  <p className="text-xs text-gray-600">{artistSongs.length} songs</p>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ALBUMS */}
        <section ref={albumRef} className="mb-14 scroll-mt-48">
          <SectionTitle title="Albums" />
          {albums.length === 0 ? (
            <EmptyState text="No albums yet. Albums appear when multiple songs share the same cover image name." />
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
              {albums.map(([albumName, albumSongs]) => (
                <motion.div
                  key={albumName}
                  whileHover={{ scale: 1.04 }}
                  onClick={() => playSong(albumSongs[0])}
                  className="flex-shrink-0 w-44 bg-zinc-900/80 rounded-2xl overflow-hidden border border-zinc-800 hover:border-cyan-500/40 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-full aspect-square">
                    {albumSongs.length >= 4 ? (
                      <div className="w-full h-full grid grid-cols-2 gap-0.5">
                        {albumSongs.slice(0, 4).map((s, i) => (
                          <div key={i} className="overflow-hidden">
                            {s.imageURL
                              ? <img src={s.imageURL} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-indigo-900/50" />
                            }
                          </div>
                        ))}
                      </div>
                    ) : (
                      albumSongs[0]?.imageURL
                        ? <img src={albumSongs[0].imageURL} alt={albumName} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-cyan-900/30 flex items-center justify-center text-4xl opacity-20">♪</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm truncate text-white capitalize">{albumName}</p>
                    <p className="text-xs text-gray-400">{albumSongs.length} songs</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* MY PLAYLISTS */}
        <section ref={playlistRef} className="mb-14 scroll-mt-48">
          <SectionTitle title="My Playlists" />
          {!playlists || playlists.length === 0 ? (
            <EmptyState text="No playlists yet. Click the playlist icon on any song." />
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
              {playlists.map((pl) => (
                <motion.div
                  key={pl._id}
                  whileHover={{ scale: 1.04 }}
                  onClick={() => pl.songs?.[0] && playSong(pl.songs[0])}
                  className="flex-shrink-0 w-40 bg-gray-900/40 rounded-2xl overflow-hidden border border-indigo-900/30 cursor-pointer hover:border-cyan-800/40 transition-all duration-200"
                >
                  <div className="w-full aspect-square bg-gradient-to-br from-indigo-900 to-cyan-900/30 grid grid-cols-2 gap-0.5 p-0.5">
                    {pl.songs?.slice(0, 4).map((song, i) => (
                      <div key={i} className="overflow-hidden rounded-sm">
                        {song.imageURL
                          ? <img src={song.imageURL} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-indigo-900/50 flex items-center justify-center text-xs text-gray-600">♪</div>
                        }
                      </div>
                    ))}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm truncate text-white">{pl.name}</p>
                    <p className="text-xs text-gray-400">{pl.songs?.length || 0} songs</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ALL SONGS */}
        <section ref={songsRef} className="scroll-mt-48">
          <SectionTitle title="All Songs" />
          {allSongs.length === 0
            ? <EmptyState text="No songs yet." />
            : <HorizontalRow songs={allSongs} favIds={favIds} onPlay={playSong} onFav={toggleFav} onDownload={handleDownload} onPlaylist={handleAddToPlaylist} />
          }
        </section>
      </div>
    </div>
  );
}

// ── Reusable components ──────────────────────────────────────────────────────

function SectionTitle({ title }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-cyan-900/40 to-transparent ml-3" />
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="text-gray-600 text-sm py-6">{text}</p>;
}

function SongCard({ song, isFav, onPlay, onFav, onDownload, onPlaylist }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className="flex-shrink-0 w-44 bg-zinc-900/80 rounded-2xl overflow-hidden cursor-pointer border border-zinc-800 hover:border-cyan-500/40 transition-all duration-200 group"
    >
      <div className="w-full aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden relative" onClick={onPlay}>
        {song.imageURL
          ? <img src={song.imageURL} alt={song.title} className="w-full h-full object-cover" />
          : <span className="text-5xl opacity-20">♪</span>
        }
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <svg width="16" height="16" fill="black" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
      <div className="p-3" onClick={onPlay}>
        <p className="font-semibold text-white text-sm truncate">{song.title}</p>
        <p className="text-xs text-zinc-400 truncate mt-0.5">{song.artist}</p>
      </div>
      <div className="flex items-center justify-between px-3 pb-3 gap-1">
        <button onClick={onFav}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFav ? '#06b6d4' : '#444', fontSize: '16px', padding: '4px', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Add to Favourites"
        >{isFav ? '♥' : '♡'}</button>
        <button onClick={onPlaylist}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', fontSize: '14px', padding: '4px', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#06b6d4'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#444'}
          title="Add to Playlist"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <button onClick={onDownload}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', fontSize: '14px', padding: '4px', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#06b6d4'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#444'}
          title="Download (Premium)"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3v13M5 16l7 7 7-7M3 21h18"/></svg>
        </button>
      </div>
    </motion.div>
  );
}

function HorizontalRow({ songs, favIds, onPlay, onFav, onDownload, onPlaylist }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
      {songs.map((song) => (
        <SongCard
          key={song._id}
          song={song}
          isFav={favIds.includes(song._id || song.id)}
          onPlay={() => onPlay(song)}
          onFav={(e) => onFav(e, song)}
          onDownload={(e) => onDownload(e, song)}
          onPlaylist={(e) => onPlaylist(e, song)}
        />
      ))}
    </div>
  );
}
