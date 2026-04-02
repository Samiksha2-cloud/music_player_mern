import React, { useEffect, useRef, useState } from 'react';
import { useStateValue } from '../context/Stateprovider';
import { actionType } from '../context/reducer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PlaylistModal from './PlaylistModal';
import orbVideo from '../assets/orb_design.mp4';

const LEVELS = [
  { min: 0,    max: 99,       color: '#06b6d4', glow: '#0891b2', name: 'Newcomer'   },
  { min: 100,  max: 299,      color: '#6366f1', glow: '#4f46e5', name: 'Listener'   },
  { min: 300,  max: 599,      color: '#06b6d4', glow: '#0891b2', name: 'Enthusiast' },
  { min: 600,  max: 999,      color: '#6366f1', glow: '#4f46e5', name: 'Addict'     },
  { min: 1000, max: Infinity, color: '#67e8f9', glow: '#06b6d4', name: 'Legend'     },
];

const getLevel = (pts) => LEVELS.find((l) => pts >= l.min && pts <= l.max) || LEVELS[0];

export default function MusicPlayer() {
  const [{ currentSong, isPlaying, allSongs }, dispatch] = useStateValue();
  const navigate = useNavigate();
  const { user } = useAuth();
  const audioRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [points, setPoints] = useState(() => parseInt(localStorage.getItem('riff_points') || '0'));
  const [minutesListened, setMinutesListened] = useState(() => parseFloat(localStorage.getItem('riff_minutes') || '0'));
  const [pointsAnim, setPointsAnim] = useState('');
  const [orbTilt, setOrbTilt] = useState(0);
  const [orbHovered, setOrbHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isFav, setIsFav] = useState(false);

  const pointsTimerRef = useRef(null);
  const minuteTimerRef = useRef(null);
  const lastSongRef = useRef(null);
  const level = getLevel(points);

  const isPremium = localStorage.getItem(`riff_premium_${user?.email}`) === 'true';

  useEffect(() => {
    localStorage.setItem('riff_points', points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem('riff_minutes', minutesListened.toString());
  }, [minutesListened]);

  // +10 points when new song starts + track recent
  useEffect(() => {
    if (!currentSong) return;
    const id = currentSong._id || currentSong.id;
    if (id !== lastSongRef.current) {
      lastSongRef.current = id;
      addPoints(10, '+10');
    }
    const recent = JSON.parse(localStorage.getItem('riff_recent') || '[]');
    const updated = [id, ...recent.filter((r) => r !== id)].slice(0, 20);
    localStorage.setItem('riff_recent', JSON.stringify(updated));
    const favs = JSON.parse(localStorage.getItem('riff_favs') || '[]');
    setIsFav(favs.includes(id));
  }, [currentSong]);

  // +1 point per minute
  useEffect(() => {
    if (isPlaying) {
      pointsTimerRef.current = setInterval(() => addPoints(1, '+1'), 60000);
      minuteTimerRef.current = setInterval(() => {
        setMinutesListened((prev) => parseFloat((prev + 1 / 60).toFixed(4)));
      }, 1000);
    } else {
      clearInterval(pointsTimerRef.current);
      clearInterval(minuteTimerRef.current);
    }
    return () => {
      clearInterval(pointsTimerRef.current);
      clearInterval(minuteTimerRef.current);
    };
  }, [isPlaying]);

  const addPoints = (amount, label) => {
    setPoints((prev) => {
      setPointsAnim(label);
      setTimeout(() => setPointsAnim(''), 1200);
      return prev + amount;
    });
  };

  // Only play/pause — never change src unless song actually changes
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isPlaying]);

  // When song changes — update src and play
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    audioRef.current.src = currentSong.audioURL;
    audioRef.current.load();
    if (isPlaying) audioRef.current.play().catch(() => {});
  }, [currentSong?._id]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };

  const togglePlay = () =>
    dispatch({ type: actionType.SET_IS_PLAYING, isPlaying: !isPlaying });

  const playNext = () => {
    if (!allSongs?.length || !currentSong) return;
    const idx = allSongs.findIndex((s) => (s._id || s.id) === (currentSong._id || currentSong.id));
    const next = allSongs[(idx + 1) % allSongs.length];
    dispatch({ type: actionType.SET_CURRENT_SONG, song: next });
    dispatch({ type: actionType.SET_IS_PLAYING, isPlaying: true });
  };

  const playPrev = () => {
    if (!allSongs?.length || !currentSong) return;
    const idx = allSongs.findIndex((s) => (s._id || s.id) === (currentSong._id || currentSong.id));
    const prev = allSongs[(idx - 1 + allSongs.length) % allSongs.length];
    dispatch({ type: actionType.SET_CURRENT_SONG, song: prev });
    dispatch({ type: actionType.SET_IS_PLAYING, isPlaying: true });
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    audioRef.current.currentTime = val;
    setProgress(val);
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    audioRef.current.volume = val;
    setVolume(val);
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Heart — directly adds/removes from localStorage favs
  const toggleFav = () => {
    if (!currentSong) return;
    const id = currentSong._id || currentSong.id;
    const favs = JSON.parse(localStorage.getItem('riff_favs') || '[]');
    const updated = favs.includes(id)
      ? favs.filter((f) => f !== id)
      : [id, ...favs];
    localStorage.setItem('riff_favs', JSON.stringify(updated));
    setIsFav(!isFav);
  };

  const handleDownload = () => {
    if (!isPremium) { navigate('/premium'); return; }
    const a = document.createElement('a');
    a.href = currentSong.audioURL;
    a.download = `${currentSong.title} - ${currentSong.artist}.mp3`;
    a.target = '_blank';
    a.click();
  };

  if (!currentSong) return null;

  return (
    <>
      <style>{`
        @keyframes orbPulse {
          0%, 100% { box-shadow: 0 0 18px 6px ${level.glow}99; }
          50%       { box-shadow: 0 0 32px 14px ${level.glow}cc; }
        }
        @keyframes orbIdle {
          0%, 100% { box-shadow: 0 0 8px 2px ${level.glow}33; }
          50%       { box-shadow: 0 0 14px 5px ${level.glow}55; }
        }
        @keyframes pointsPop {
          0%   { opacity: 0; transform: translateX(-50%) translateY(0px) scale(0.7); }
          40%  { opacity: 1; transform: translateX(-50%) translateY(-18px) scale(1.2); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-36px) scale(1); }
        }
      `}</style>

      {showModal && currentSong && (
        <PlaylistModal song={currentSong} onClose={() => setShowModal(false)} />
      )}

      {/* Single persistent audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={playNext}
      />

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '10px 16px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>

          {/* Left — Orb + song info + action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '260px', flexShrink: 0 }}>

            {/* Orb */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {pointsAnim && (
                <div style={{
                  position: 'absolute', top: '-10px', left: '50%',
                  color: level.color, fontWeight: 'bold', fontSize: '13px',
                  pointerEvents: 'none',
                  animation: 'pointsPop 1.2s ease forwards',
                  zIndex: 100, whiteSpace: 'nowrap',
                }}>
                  {pointsAnim}
                </div>
              )}
              <div
                onClick={() => navigate('/orb')}
                onMouseEnter={() => setOrbHovered(true)}
                onMouseLeave={() => { setOrbTilt(0); setOrbHovered(false); }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setOrbTilt(e.clientX - (rect.left + rect.width / 2) > 0 ? 20 : -20);
                }}
                style={{
                  width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden',
                  cursor: 'pointer', transition: 'transform 0.2s ease',
                  transform: `rotate(${orbTilt}deg) scale(${orbHovered ? 1.12 : 1})`,
                  animation: isPlaying ? 'orbPulse 1.4s ease-in-out infinite' : 'orbIdle 3s ease-in-out infinite',
                }}
              >
                <video src={orbVideo} autoPlay loop muted playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {/* Song info */}
            <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
              <p style={{ color: 'white', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                {currentSong.title}
              </p>
              <p style={{ color: level.color, fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                {currentSong.artist}
              </p>
            </div>

            {/* Heart — directly toggles fav */}
            <button onClick={toggleFav} title="Add to Favourites"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFav ? '#06b6d4' : '#444', fontSize: '18px', padding: '4px', flexShrink: 0, transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isFav ? '♥' : '♡'}
            </button>

            {/* Add to playlist */}
            <button onClick={() => setShowModal(true)} title="Add to Playlist"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: '4px', flexShrink: 0, transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#06b6d4'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#444'}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>

            {/* Download */}
            <button onClick={handleDownload} title={isPremium ? 'Download' : 'Download (Premium)'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isPremium ? '#06b6d4' : '#444', padding: '4px', flexShrink: 0, transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#06b6d4'}
              onMouseLeave={(e) => e.currentTarget.style.color = isPremium ? '#06b6d4' : '#444'}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 3v13M5 16l7 7 7-7M3 21h18"/>
              </svg>
            </button>
          </div>

          {/* Center — controls + progress */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <button onClick={playPrev}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', transition: 'color 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>

              <button onClick={togglePlay}
                style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.15s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isPlaying
                  ? <svg width="18" height="18" fill="black" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  : <svg width="18" height="18" fill="black" viewBox="0 0 24 24" style={{ marginLeft: '2px' }}><path d="M8 5v14l11-7z"/></svg>
                }
              </button>

              <button onClick={playNext}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', transition: 'color 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zm2.5-6l5.5 3.93V8.07L8.5 12zM16 6h2v12h-2z"/></svg>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '480px' }}>
              <span style={{ color: '#666', fontSize: '11px', width: '32px', textAlign: 'right' }}>{formatTime(progress)}</span>
              <input type="range" min={0} max={duration || 0} value={progress} onChange={handleSeek}
                style={{ flex: 1, height: '4px', accentColor: level.color, cursor: 'pointer' }} />
              <span style={{ color: '#666', fontSize: '11px', width: '32px' }}>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right — Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px', flexShrink: 0 }}>
            <svg width="16" height="16" fill="#666" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={handleVolume}
              style={{ flex: 1, height: '4px', accentColor: level.color, cursor: 'pointer' }} />
          </div>
        </div>
      </div>
    </>
  );
}