import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStateValue } from '../context/Stateprovider';
import { actionType } from '../context/reducer';
import { fetchPlaylists, createPlaylist, addSongToPlaylist } from '../api';
import { useNavigate } from 'react-router-dom';

const LEVEL_LIMITS = [
  { min: 0,    max: 99,       limit: 10, name: 'Newcomer'   },
  { min: 100,  max: 299,      limit: 15, name: 'Listener'   },
  { min: 300,  max: 599,      limit: 20, name: 'Enthusiast' },
  { min: 600,  max: 999,      limit: 25, name: 'Addict'     },
  { min: 1000, max: Infinity, limit: 30, name: 'Legend'     },
];

const getCurrentLimit = (points, isPremium) => {
  if (isPremium) return { limit: Infinity, name: 'Premium' };
  return LEVEL_LIMITS.find((l) => points >= l.min && points <= l.max) || LEVEL_LIMITS[0];
};

export default function PlaylistModal({ song, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [{ playlists }, dispatch] = useStateValue();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(false);

  const userId = user?.id || user?.sub;
  const points = parseInt(localStorage.getItem('riff_points') || '0');
  const isPremium = localStorage.getItem('riff_premium') === 'true';
  const currentLevel = getCurrentLimit(points, isPremium);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      const data = await fetchPlaylists(userId);
      if (data) dispatch({ type: actionType.SET_PLAYLISTS, playlists: data });
    };
    load();
  }, [userId]);

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
  };

  const handleAddToPlaylist = async (playlistId) => {
    setLoading(true);
    const result = await addSongToPlaylist(playlistId, song._id);
    if (result?.error) {
      showMessage(result.error, 'error');
      if (result.limitReached && !isPremium) {
        setTimeout(() => navigate('/premium'), 2000);
      }
    } else if (result?._id) {
      dispatch({ type: actionType.UPDATE_PLAYLIST, playlist: result });
      showMessage('Added to playlist!', 'success');
      setTimeout(onClose, 1200);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);

    const playlist = await createPlaylist(newName.trim(), userId, isPremium);
    if (playlist?.error) {
      showMessage(playlist.error, 'error');
      if (playlist.limitReached) {
        setTimeout(() => navigate('/premium'), 2000);
      }
      setLoading(false);
      return;
    }

    dispatch({ type: actionType.ADD_PLAYLIST, playlist });
    const updated = await addSongToPlaylist(playlist._id, song._id);
    if (updated?._id) dispatch({ type: actionType.UPDATE_PLAYLIST, playlist: updated });
    showMessage('Playlist created!', 'success');
    setTimeout(onClose, 1200);
    setLoading(false);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200 }} />

      <div style={{
        position: 'fixed', bottom: '90px', left: '50%',
        transform: 'translateX(-50%)', width: '320px',
        background: '#0f0f1a', border: '1px solid #1e1e3a',
        borderRadius: '20px', padding: '20px', zIndex: 201,
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <p style={{ color: 'white', fontWeight: '700', fontSize: '15px', margin: 0 }}>Add to Playlist</p>
          <button onClick={onClose} style={{ color: '#555', fontSize: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Song info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', padding: '10px', background: '#1a1a2e', borderRadius: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', background: '#1e1e3a', flexShrink: 0 }}>
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

        {/* Level info */}
        <div style={{ marginBottom: '12px', padding: '8px 12px', background: '#0a0a15', borderRadius: '10px', border: '1px solid #1e1e3a' }}>
          <p style={{ color: '#444', fontSize: '10px', margin: 0 }}>
            {isPremium
              ? 'Premium — unlimited songs per playlist'
              : `${currentLevel.name} level — up to ${currentLevel.limit} songs per playlist`
            }
          </p>
        </div>

        {/* Message */}
        {message && (
          <p style={{
            color: messageType === 'success' ? '#06b6d4' : '#ef4444',
            fontSize: '12px', textAlign: 'center', marginBottom: '10px',
            padding: '8px', background: messageType === 'success' ? '#06b6d410' : '#ef444410',
            borderRadius: '8px',
          }}>
            {message}
          </p>
        )}

        {/* Existing playlists */}
        {playlists.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: '#444', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Your Playlists</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '150px', overflowY: 'auto' }}>
              {playlists.map((pl) => (
                <button
                  key={pl._id}
                  onClick={() => handleAddToPlaylist(pl._id)}
                  disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 12px', borderRadius: '10px',
                    background: '#1a1a2e', border: '1px solid #1e1e3a',
                    color: 'white', fontSize: '13px', cursor: 'pointer',
                    transition: 'all 0.15s ease', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#06b6d4'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e1e3a'}
                >
                  <span>{pl.name}</span>
                  <span style={{ color: '#444', fontSize: '10px' }}>{pl.songs?.length || 0} songs</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create new */}
        <div style={{ borderTop: '1px solid #1e1e3a', paddingTop: '12px' }}>
          {creating ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Playlist name..."
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: '10px',
                  background: '#1a1a2e', border: '1px solid #06b6d4',
                  color: 'white', fontSize: '13px', outline: 'none',
                }}
              />
              <button
                onClick={handleCreate}
                disabled={loading}
                style={{
                  padding: '9px 14px', borderRadius: '10px',
                  background: '#06b6d4', color: 'black',
                  fontWeight: '700', fontSize: '13px', cursor: 'pointer', border: 'none',
                }}
              >
                {loading ? '...' : 'Create'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              style={{
                width: '100%', padding: '10px',
                borderRadius: '10px', border: '1px dashed #1e1e3a',
                color: '#06b6d4', fontSize: '13px', fontWeight: '600',
                background: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#06b6d4'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e1e3a'}
            >
              + Create new playlist
            </button>
          )}
        </div>
      </div>
    </>
  );
}