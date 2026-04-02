import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStateValue } from '../context/Stateprovider';
import { actionType } from '../context/reducer';
import { fetchPlaylists, deletePlaylist } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

export default function FavsPanel({ isOpen, onClose, defaultTab = 'favs' }) {
  const { user } = useAuth();
  const [{ playlists, allSongs }, dispatch] = useStateValue();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [favSongs, setFavSongs] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const userId = user?.id || user?.sub;

  // Update tab when defaultTab prop changes
  useEffect(() => {
    if (isOpen) setActiveTab(defaultTab);
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (!isOpen || !userId) return;
    const load = async () => {
      const data = await fetchPlaylists(userId);
      if (data) dispatch({ type: actionType.SET_PLAYLISTS, playlists: data });
    };
    load();
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen) return;
    const favIds = JSON.parse(localStorage.getItem('riff_favs') || '[]');
    setFavSongs(favIds.map((id) => allSongs.find((s) => (s._id || s.id) === id)).filter(Boolean));
    const recentIds = JSON.parse(localStorage.getItem('riff_recent') || '[]');
    setRecentSongs(recentIds.map((id) => allSongs.find((s) => (s._id || s.id) === id)).filter(Boolean));
  }, [isOpen, allSongs]);

  const removeFav = (songId) => {
    const favIds = JSON.parse(localStorage.getItem('riff_favs') || '[]');
    const updated = favIds.filter((id) => id !== songId);
    localStorage.setItem('riff_favs', JSON.stringify(updated));
    setFavSongs((prev) => prev.filter((s) => (s._id || s.id) !== songId));
  };

  const handleDeletePlaylist = async (playlistId) => {
    await deletePlaylist(playlistId);
    dispatch({ type: actionType.DELETE_PLAYLIST, playlistId });
    setDeleteConfirm(null);
  };

  const playSong = (song) => {
    dispatch({ type: actionType.SET_CURRENT_SONG, song });
    dispatch({ type: actionType.SET_IS_PLAYING, isPlaying: true });
  };

  const totalMinutes = parseFloat(localStorage.getItem('riff_minutes') || '0');
  const formatMinutes = (min) => {
    const m = Math.floor(min);
    const s = Math.round((min - m) * 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const TABS = [
    { key: 'favs', label: 'Favourites' },
    { key: 'recent', label: 'Recent' },
    { key: 'playlists', label: 'Playlists' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }}
          />

          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '340px', background: '#0a0a0f',
              borderLeft: '1px solid #1e1e3a', zIndex: 101,
              display: 'flex', flexDirection: 'column',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.8)',
            }}
          >
            {/* Header */}
            <div style={{ padding: '18px 18px 10px', borderBottom: '1px solid #1e1e3a' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <p style={{ color: 'white', fontWeight: '800', fontSize: '17px', margin: 0 }}>My Library</p>
                <button onClick={onClose}
                  style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
              </div>
              <p style={{ color: '#333', fontSize: '11px', margin: 0 }}>
                {formatMinutes(totalMinutes)} listened total
              </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', padding: '10px 14px', gap: '6px', borderBottom: '1px solid #1e1e3a' }}>
              {TABS.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '5px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '600',
                    border: 'none', cursor: 'pointer',
                    background: activeTab === tab.key ? '#06b6d4' : '#1a1a2e',
                    color: activeTab === tab.key ? 'black' : '#555',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>

              {/* Favourites */}
              {activeTab === 'favs' && (
                favSongs.length === 0 ? (
                  <EmptyTab icon="♡" text="No favourites yet." sub="Click the heart on any song." />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {favSongs.map((song) => (
                      <PanelSongRow key={song._id} song={song}
                        onPlay={() => playSong(song)}
                        onRemove={() => removeFav(song._id || song.id)}
                      />
                    ))}
                  </div>
                )
              )}

              {/* Recent */}
              {activeTab === 'recent' && (
                recentSongs.length === 0 ? (
                  <EmptyTab icon="♪" text="No recently played songs yet." />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {recentSongs.map((song) => (
                      <PanelSongRow key={song._id} song={song} onPlay={() => playSong(song)} />
                    ))}
                  </div>
                )
              )}

              {/* Playlists */}
              {activeTab === 'playlists' && (
                playlists.length === 0 ? (
                  <EmptyTab icon="+" text="No playlists yet." sub="Add songs using the playlist button." />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {playlists.map((pl) => (
                      <div key={pl._id} style={{
                        background: '#111118', borderRadius: '14px',
                        overflow: 'hidden', border: '1px solid #1e1e3a',
                      }}>
                        {/* Playlist header with delete */}
                        <div style={{ padding: '12px 14px', borderBottom: pl.songs?.length ? '1px solid #1a1a2e' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <p style={{ color: 'white', fontWeight: '700', fontSize: '13px', margin: 0 }}>{pl.name}</p>
                            <p style={{ color: '#444', fontSize: '11px', margin: '2px 0 0' }}>{pl.songs?.length || 0} songs</p>
                          </div>

                          {/* Delete button */}
                          {deleteConfirm === pl._id ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => handleDeletePlaylist(pl._id)}
                                style={{ padding: '4px 10px', borderRadius: '8px', background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', fontSize: '11px', cursor: 'pointer' }}
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                style={{ padding: '4px 10px', borderRadius: '8px', background: '#1a1a2e', border: '1px solid #333', color: '#666', fontSize: '11px', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(pl._id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: '4px', transition: 'color 0.15s' }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                              title="Delete playlist"
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Songs preview */}
                        {pl.songs?.slice(0, 3).map((song) => (
                          <div key={song._id} onClick={() => playSong(song)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a2e'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ width: '30px', height: '30px', borderRadius: '6px', overflow: 'hidden', background: '#1a1a2e', flexShrink: 0 }}>
                              {song.imageURL
                                ? <img src={song.imageURL} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '12px' }}>♪</div>
                              }
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                              <p style={{ color: '#bbb', fontSize: '12px', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</p>
                              <p style={{ color: '#444', fontSize: '10px', margin: 0 }}>{song.artist}</p>
                            </div>
                          </div>
                        ))}
                        {pl.songs?.length > 3 && (
                          <p style={{ color: '#333', fontSize: '11px', textAlign: 'center', padding: '6px' }}>
                            +{pl.songs.length - 3} more
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyTab({ icon, text, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: '#333' }}>
      <p style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</p>
      <p style={{ fontSize: '13px', margin: 0 }}>{text}</p>
      {sub && <p style={{ fontSize: '11px', color: '#222', marginTop: '4px' }}>{sub}</p>}
    </div>
  );
}

function PanelSongRow({ song, onPlay, onRemove }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', transition: 'background 0.15s' }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#111118'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div onClick={onPlay} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflow: 'hidden', cursor: 'pointer' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '8px', overflow: 'hidden', background: '#1a1a2e', flexShrink: 0 }}>
          {song.imageURL
            ? <img src={song.imageURL} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>♪</div>
          }
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ color: 'white', fontSize: '13px', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</p>
          <p style={{ color: '#555', fontSize: '11px', margin: 0 }}>{song.artist}</p>
        </div>
      </div>
      {onRemove && (
        <button onClick={onRemove}
          style={{ color: '#333', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '12px', flexShrink: 0, transition: 'color 0.15s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
        >✕</button>
      )}
    </div>
  );
}