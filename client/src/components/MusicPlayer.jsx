import React, { useEffect, useRef, useState } from 'react';
import { useStateValue } from '../context/Stateprovider';
import { actionType } from '../context/reducer';

const LEVELS = [
  { min: 0,    max: 99,        color: '#60a5fa', glow: '#3b82f6', name: 'Newcomer',   emoji: '🌱' },
  { min: 100,  max: 299,       color: '#a78bfa', glow: '#8b5cf6', name: 'Listener',   emoji: '🎧' },
  { min: 300,  max: 599,       color: '#f472b6', glow: '#ec4899', name: 'Enthusiast', emoji: '🎵' },
  { min: 600,  max: 999,       color: '#fb923c', glow: '#f97316', name: 'Addict',     emoji: '🔥' },
  { min: 1000, max: Infinity,  color: '#fbbf24', glow: '#f59e0b', name: 'Legend',     emoji: '✨' },
];

const getLevel = (pts) => LEVELS.find((l) => pts >= l.min && pts <= l.max) || LEVELS[0];

export default function MusicPlayer() {
  const [{ currentSong, isPlaying, allSongs }, dispatch] = useStateValue();
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [points, setPoints] = useState(() => parseInt(localStorage.getItem('riff_points') || '0'));
  const [showPoints, setShowPoints] = useState(false);
  const [pointsAnim, setPointsAnim] = useState('');
  const [orbTilt, setOrbTilt] = useState(0);
  const [orbHovered, setOrbHovered] = useState(false);
  const pointsTimerRef = useRef(null);
  const lastSongRef = useRef(null);

  const level = getLevel(points);
  const levelIndex = LEVELS.indexOf(level);
  const nextLevel = LEVELS[levelIndex + 1];
  const levelProgress = nextLevel
    ? Math.round(((points - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;

  useEffect(() => {
    localStorage.setItem('riff_points', points.toString());
  }, [points]);

  useEffect(() => {
    if (currentSong && currentSong._id !== lastSongRef.current) {
      lastSongRef.current = currentSong._id;
      addPoints(10, '+10');
    }
  }, [currentSong]);

  useEffect(() => {
    if (isPlaying) {
      pointsTimerRef.current = setInterval(() => addPoints(1, '+1'), 30000);
    } else {
      clearInterval(pointsTimerRef.current);
    }
    return () => clearInterval(pointsTimerRef.current);
  }, [isPlaying]);

  const addPoints = (amount, label) => {
    setPoints((prev) => {
      setPointsAnim(label);
      setTimeout(() => setPointsAnim(''), 1200);
      return prev + amount;
    });
  };

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };

  const togglePlay = () => dispatch({ type: actionType.SET_IS_PLAYING, isPlaying: !isPlaying });

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

  const handleOrbMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    setOrbTilt(e.clientX - centerX > 0 ? 25 : -25);
  };

  const handleOrbMouseLeave = () => {
    setOrbTilt(0);
    setOrbHovered(false);
  };

  if (!currentSong) return null;

  return (
    <>
      <style>{`
        @keyframes orbPulse {
          0%, 100% { box-shadow: 0 0 18px 6px ${level.glow}99; transform: scale(1) rotate(${orbTilt}deg); }
          50%       { box-shadow: 0 0 32px 14px ${level.glow}cc; transform: scale(1.13) rotate(${orbTilt}deg); }
        }
        @keyframes orbIdle {
          0%, 100% { box-shadow: 0 0 10px 3px ${level.glow}55; }
          50%       { box-shadow: 0 0 18px 7px ${level.glow}88; }
        }
        @keyframes pointsPop {
          0%   { opacity: 0; transform: translateX(-50%) translateY(0px) scale(0.7); }
          40%  { opacity: 1; transform: translateX(-50%) translateY(-18px) scale(1.2); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-36px) scale(1); }
        }
      `}</style>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-t border-white/10 px-4 py-3">
        <audio
          ref={audioRef}
          src={currentSong.audioURL}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onEnded={playNext}
        />

        <div className="max-w-7xl mx-auto flex items-center gap-4">

          {/* Orb + Song info */}
          <div className="flex items-center gap-3 w-56 flex-shrink-0">

            {/* Orb */}
            <div className="relative flex-shrink-0">

              {/* Floating points animation */}
              {pointsAnim && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  color: level.color,
                  fontWeight: 'bold',
                  fontSize: '13px',
                  pointerEvents: 'none',
                  animation: 'pointsPop 1.2s ease forwards',
                  zIndex: 100,
                  whiteSpace: 'nowrap',
                }}>
                  {pointsAnim}
                </div>
              )}

              {/* The orb */}
              <div
                onClick={() => setShowPoints(!showPoints)}
                onMouseMove={handleOrbMouseMove}
                onMouseEnter={() => setOrbHovered(true)}
                onMouseLeave={handleOrbMouseLeave}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 35%, white 0%, ${level.color} 40%, ${level.glow} 100%)`,
                  cursor: 'pointer',
                  transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1)',
                  transform: `rotate(${orbTilt}deg) scale(${orbHovered ? 1.15 : 1})`,
                  animation: isPlaying ? 'orbPulse 1.4s ease-in-out infinite' : 'orbIdle 3s ease-in-out infinite',
                }}
              />

              {/* Points tooltip */}
              {showPoints && (
                <div style={{
                  position: 'absolute',
                  bottom: '54px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.95)',
                  border: `1px solid ${level.color}55`,
                  borderRadius: '14px',
                  padding: '12px 16px',
                  minWidth: '170px',
                  zIndex: 200,
                  boxShadow: `0 0 20px ${level.glow}44`,
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '22px' }}>{level.emoji}</span>
                    <p style={{ color: level.color, fontWeight: 'bold', fontSize: '14px', margin: '2px 0' }}>
                      {level.name}
                    </p>
                    <p style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                      {points} pts
                    </p>
                  </div>

                  {nextLevel && (
                    <>
                      <div style={{ height: '5px', borderRadius: '99px', background: '#ffffff22', overflow: 'hidden', marginBottom: '4px' }}>
                        <div style={{
                          height: '100%',
                          borderRadius: '99px',
                          width: `${levelProgress}%`,
                          background: `linear-gradient(90deg, ${level.color}, ${nextLevel.color})`,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <p style={{ color: '#aaa', fontSize: '10px', textAlign: 'center' }}>
                        {nextLevel.min - points} pts to {nextLevel.name} {nextLevel.emoji}
                      </p>
                    </>
                  )}

                  {!nextLevel && (
                    <p style={{ color: level.color, fontSize: '11px', textAlign: 'center' }}>
                      Max level reached! {level.emoji}
                    </p>
                  )}

                  <div style={{ marginTop: '8px', borderTop: '1px solid #ffffff11', paddingTop: '6px' }}>
                    <p style={{ color: '#666', fontSize: '10px', textAlign: 'center' }}>
                      +10 per song • +1 per 30s
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Song title + artist */}
            <div className="overflow-hidden">
              <p className="text-white text-sm font-semibold truncate">{currentSong.title}</p>
              <p className="text-xs truncate" style={{ color: level.color }}>{currentSong.artist}</p>
            </div>
          </div>

          {/* Center controls + progress */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="flex items-center gap-6">

              {/* Prev */}
              <button onClick={playPrev} className="text-gray-400 hover:text-white transition hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition"
              >
                {isPlaying
                  ? <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  : <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                }
              </button>

              {/* Next */}
              <button onClick={playNext} className="text-gray-400 hover:text-white transition hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zm2.5-6l5.5 3.93V8.07L8.5 12zM16 6h2v12h-2z"/>
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2 w-full max-w-lg">
              <span className="text-gray-400 text-xs w-8 text-right">{formatTime(progress)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={progress}
                onChange={handleSeek}
                style={{ accentColor: level.color }}
                className="flex-1 h-1 cursor-pointer"
              />
              <span className="text-gray-400 text-xs w-8">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 w-32 flex-shrink-0">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolume}
              style={{ accentColor: level.color }}
              className="flex-1 h-1 cursor-pointer"
            />
          </div>

        </div>
      </div>
    </>
  );
}