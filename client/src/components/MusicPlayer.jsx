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
  const [showModal, setShowModal] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [justStarted, setJustStarted] = useState(false);

  const pointsTimerRef = useRef(null);
  const minuteTimerRef = useRef(null);
  const lastSongRef = useRef(null);
  const level = getLevel(points);
  const isPremium = localStorage.getItem(`riff_premium_${user?.email}`) === 'true';

  useEffect(() => { localStorage.setItem('riff_points', points.toString()); }, [points]);
  useEffect(() => { localStorage.setItem('riff_minutes', minutesListened.toString()); }, [minutesListened]);

  // New song started
  useEffect(() => {
    if (!currentSong) return;
    const id = currentSong._id || currentSong.id;
    if (id !== lastSongRef.current) {
      lastSongRef.current = id;
      addPoints(10, '+10');

      // Pulse animation to draw attention when new song starts
      setJustStarted(true);
      setTimeout(() => setJustStarted(false), 800);

      // Write to riff_history for listening stats
      try {
        const historyRaw = localStorage.getItem('riff_history');
        const history = historyRaw ? JSON.parse(historyRaw) : [];
        const entry = {
          id,
          title: currentSong.title || 'Unknown',
          artist: currentSong.artist || 'Unknown',
          genre: currentSong.genre || currentSong.mood || 'Unknown',
          mood: currentSong.mood || '',
          imageURL: currentSong.imageURL || '',
          playedAt: Date.now(),
        };
        localStorage.setItem('riff_history', JSON.stringify([entry, ...history].slice(0, 200)));
      } catch (e) {}
    }

    const recent = JSON.parse(localStorage.getItem('riff_recent') || '[]');
    localStorage.setItem('riff_recent', JSON.stringify([id, ...recent.filter(r => r !== id)].slice(0, 20)));
    setIsFav(JSON.parse(localStorage.getItem('riff_favs') || '[]').includes(id));
  }, [currentSong]);

  useEffect(() => {
    if (isPlaying) {
      pointsTimerRef.current = setInterval(() => addPoints(1, '+1'), 60000);
      minuteTimerRef.current = setInterval(() => {
        setMinutesListened(prev => parseFloat((prev + 1 / 60).toFixed(4)));
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
    setPoints(prev => {
      setPointsAnim(label);
      setTimeout(() => setPointsAnim(''), 1200);
      return prev + amount;
    });
  };

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isPlaying]);

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

  const togglePlay = (e) => {
    e.stopPropagation();
    dispatch({ type: actionType.SET_IS_PLAYING, isPlaying: !isPlaying });
  };

  const playNext = (e) => {
    if (e) e.stopPropagation();
    if (!allSongs?.length || !currentSong) return;
    const idx = allSongs.findIndex(s => (s._id || s.id) === (currentSong._id || currentSong.id));
    const next = allSongs[(idx + 1) % allSongs.length];
    dispatch({ type: actionType.SET_CURRENT_SONG, song: next });
    dispatch({ type: actionType.SET_IS_PLAYING, isPlaying: true });
  };

  const playPrev = (e) => {
    if (e) e.stopPropagation();
    if (!allSongs?.length || !currentSong) return;
    const idx = allSongs.findIndex(s => (s._id || s.id) === (currentSong._id || currentSong.id));
    const prev = allSongs[(idx - 1 + allSongs.length) % allSongs.length];
    dispatch({ type: actionType.SET_CURRENT_SONG, song: prev });
    dispatch({ type: actionType.SET_IS_PLAYING, isPlaying: true });
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const val = parseFloat(e.target.value);
    audioRef.current.currentTime = val;
    setProgress(val);
  };

  const handleVolume = (e) => {
    e.stopPropagation();
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

  const toggleFav = (e) => {
    e.stopPropagation();
    if (!currentSong) return;
    const id = currentSong._id || currentSong.id;
    const favs = JSON.parse(localStorage.getItem('riff_favs') || '[]');
    const updated = favs.includes(id) ? favs.filter(f => f !== id) : [id, ...favs];
    localStorage.setItem('riff_favs', JSON.stringify(updated));
    setIsFav(!isFav);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (!isPremium) { navigate('/premium'); return; }
    const a = document.createElement('a');
    a.href = currentSong.audioURL;
    a.download = `${currentSong.title} - ${currentSong.artist}.mp3`;
    a.target = '_blank';
    a.click();
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  if (!currentSong) return (
    <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleTimeUpdate} onEnded={playNext} />
  );

  return (
    <>
      <style>{`
        @keyframes pointsPop {
          0%   { opacity: 0; transform: translateX(-50%) translateY(0) scale(0.7); }
          40%  { opacity: 1; transform: translateX(-50%) translateY(-16px) scale(1.2); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-32px) scale(1); }
        }
        @keyframes playerSlideUp {
          from { transform: translateY(120px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes playerPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.025); }
          100% { transform: scale(1); }
        }
        @keyframes orbPulse {
          0%, 100% { opacity: 0.85; }
          50%       { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .player-seek::-webkit-slider-thumb { width: 0; height: 0; }
        .player-seek:hover::-webkit-slider-thumb { width: 14px; height: 14px; }
        .player-seek::-webkit-slider-thumb {
          -webkit-appearance: none;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          transition: width 0.15s, height 0.15s;
        }
        .player-vol::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #888;
          cursor: pointer;
        }
        .player-action {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, transform 0.15s;
          flex-shrink: 0;
        }
        .player-action:hover { background: rgba(255,255,255,0.08); transform: scale(1.1); }
        .player-action:active { transform: scale(0.95); }
      `}</style>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={playNext}
      />

      {showModal && currentSong && (
        <PlaylistModal song={currentSong} onClose={() => setShowModal(false)} />
      )}

      {/*
        FLOATING PLAYER — position: fixed so it never moves with scroll.
        bottom: 20px keeps it floating above the page edge, always in viewport.
        The player slides up with an animation when it first appears.
        Clicking the pill expands it to show seek bar + volume.
      */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          width: expanded ? 'min(720px, calc(100vw - 32px))' : 'min(480px, calc(100vw - 32px))',
          animation: justStarted
            ? 'playerPop 0.5s ease'
            : `playerSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)`,
          transition: 'width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Progress bar — thin line at top of player */}
        <div style={{
          height: '3px',
          borderRadius: '3px 3px 0 0',
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
          marginBottom: '-1px',
          borderRadius: '16px 16px 0 0',
        }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${level.color}, ${level.glow})`,
            transition: 'width 0.3s linear',
            borderRadius: '16px 16px 0 0',
          }} />
        </div>

        {/* Main pill body */}
        <div style={{
          background: 'rgba(10, 10, 20, 0.96)',
          backdropFilter: 'blur(30px)',
          border: `1px solid rgba(255,255,255,0.1)`,
          borderTop: `1px solid ${level.color}44`,
          borderRadius: '0 0 20px 20px',
          padding: expanded ? '14px 20px 16px' : '10px 16px',
          transition: 'padding 0.3s ease',
          boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), 0 -2px 20px ${level.glow}22`,
        }}>

          {/* Always-visible row: cover + title + controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Song cover + playing indicator */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '10px',
                overflow: 'hidden', background: '#111',
                boxShadow: isPlaying ? `0 0 12px ${level.glow}66` : 'none',
                transition: 'box-shadow 0.3s ease',
              }}>
                {currentSong.imageURL
                  ? <img src={currentSong.imageURL} alt={currentSong.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover',
                        animation: isPlaying ? 'orbPulse 2s ease-in-out infinite' : 'none' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '18px' }}>♪</div>
                }
              </div>
              {/* Playing spinner ring */}
              {isPlaying && (
                <div style={{
                  position: 'absolute', inset: '-3px', borderRadius: '13px',
                  border: `2px solid transparent`,
                  borderTopColor: level.color,
                  borderRightColor: level.color + '44',
                  animation: 'spin 2s linear infinite',
                  pointerEvents: 'none',
                }} />
              )}
            </div>

            {/* Title + artist */}
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <p style={{
                color: 'white', fontSize: '13px', fontWeight: '700',
                margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {currentSong.title}
              </p>
              <p style={{
                color: level.color, fontSize: '11px', margin: '2px 0 0',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {currentSong.artist}
              </p>
            </div>

            {/* Controls — always visible */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>

              {/* Heart */}
              <button className="player-action" onClick={toggleFav} title="Favourite"
                style={{ color: isFav ? level.color : '#555', fontSize: '16px' }}>
                {isFav ? '♥' : '♡'}
              </button>

              {/* Prev */}
              <button className="player-action" onClick={playPrev} title="Previous">
                <svg width="18" height="18" fill="#888" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
              </button>

              {/* Play / Pause — main CTA */}
              <button
                onClick={togglePlay}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'white', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'transform 0.15s ease, box-shadow 0.15s',
                  boxShadow: isPlaying ? `0 0 16px ${level.glow}88` : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isPlaying
                  ? <svg width="16" height="16" fill="black" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  : <svg width="16" height="16" fill="black" viewBox="0 0 24 24" style={{ marginLeft: '2px' }}><path d="M8 5v14l11-7z"/></svg>
                }
              </button>

              {/* Next */}
              <button className="player-action" onClick={playNext} title="Next">
                <svg width="18" height="18" fill="#888" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 3.93V8.07L8.5 12zM16 6h2v12h-2z"/></svg>
              </button>

              {/* Orb — points indicator */}
              <div style={{ position: 'relative' }}>
                {pointsAnim && (
                  <div style={{
                    position: 'absolute', top: '-8px', left: '50%',
                    color: level.color, fontWeight: 'bold', fontSize: '11px',
                    pointerEvents: 'none', whiteSpace: 'nowrap',
                    animation: 'pointsPop 1.2s ease forwards', zIndex: 10,
                  }}>
                    {pointsAnim}
                  </div>
                )}
                <button
                  className="player-action"
                  onClick={e => { e.stopPropagation(); navigate('/orb'); }}
                  title="My Profile"
                  style={{ padding: '4px' }}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden' }}>
                    <video src={orbVideo} autoPlay loop muted playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Expanded section — seek bar + extra actions + volume */}
          {expanded && (
            <div style={{ marginTop: '14px' }} onClick={e => e.stopPropagation()}>

              {/* Seek bar with timestamps */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ color: '#555', fontSize: '11px', width: '32px', textAlign: 'right', flexShrink: 0 }}>
                  {formatTime(progress)}
                </span>
                <input
                  type="range" className="player-seek"
                  min={0} max={duration || 0} value={progress}
                  onChange={handleSeek}
                  style={{ flex: 1, height: '4px', accentColor: level.color, cursor: 'pointer', appearance: 'none', background: `linear-gradient(to right, ${level.color} ${pct}%, rgba(255,255,255,0.12) ${pct}%)`, borderRadius: '99px', outline: 'none' }}
                />
                <span style={{ color: '#555', fontSize: '11px', width: '32px', flexShrink: 0 }}>
                  {formatTime(duration)}
                </span>
              </div>

              {/* Extra actions + volume row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {/* Add to playlist */}
                  <button className="player-action" onClick={e => { e.stopPropagation(); setShowModal(true); }} title="Add to Playlist">
                    <svg width="16" height="16" fill="none" stroke="#777" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </button>
                  {/* Download */}
                  <button className="player-action" onClick={handleDownload} title={isPremium ? 'Download' : 'Premium only'}>
                    <svg width="16" height="16" fill="none" stroke={isPremium ? level.color : '#555'} strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 3v13M5 16l7 7 7-7M3 21h18"/>
                    </svg>
                  </button>
                </div>

                {/* Volume */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '140px' }}>
                  <svg width="14" height="14" fill="#555" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                  </svg>
                  <input
                    type="range" className="player-vol"
                    min={0} max={1} step={0.01} value={volume}
                    onChange={handleVolume}
                    style={{ flex: 1, height: '3px', accentColor: '#888', cursor: 'pointer', appearance: 'none', background: `linear-gradient(to right, #888 ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`, borderRadius: '99px', outline: 'none' }}
                  />
                </div>

                {/* Tap to collapse hint */}
                <p style={{ color: '#2a2a2a', fontSize: '10px', margin: 0 }}>tap to collapse</p>
              </div>
            </div>
          )}

          {/* Collapsed hint */}
          {!expanded && (
            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <p style={{ color: '#2a2a2a', fontSize: '10px', margin: 0, letterSpacing: '0.5px' }}>
                tap for more controls
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
