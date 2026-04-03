import React, { useState, useRef, useEffect } from 'react';
import { useStateValue } from '../context/Stateprovider';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import orbVideo from '../assets/orb_design.mp4';

const LEVELS = [
  { min: 0,    max: 99,       color: '#06b6d4', glow: '#0891b2', name: 'Newcomer'   },
  { min: 100,  max: 299,      color: '#6366f1', glow: '#4f46e5', name: 'Listener'   },
  { min: 300,  max: 599,      color: '#06b6d4', glow: '#0891b2', name: 'Enthusiast' },
  { min: 600,  max: 999,      color: '#6366f1', glow: '#4f46e5', name: 'Addict'     },
  { min: 1000, max: Infinity, color: '#67e8f9', glow: '#06b6d4', name: 'Legend'     },
];

const getLevel = (pts) => LEVELS.find((l) => pts >= l.min && pts <= l.max) || LEVELS[0];

// Build listening stats from riff_history localStorage
function buildStats() {
  const raw = localStorage.getItem('riff_history');
  if (!raw) return { topArtists: [], topGenres: [], mostPlayed: null, weeklyPlays: 0 };

  const history = JSON.parse(raw);
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekHistory = history.filter((e) => e.playedAt > oneWeekAgo);

  // Top artists
  const artistCount = {};
  history.forEach((e) => {
    if (e.artist) artistCount[e.artist] = (artistCount[e.artist] || 0) + 1;
  });
  const topArtists = Object.entries(artistCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  // Top genres/moods
  const genreCount = {};
  history.forEach((e) => {
    const g = e.genre || e.mood || 'Unknown';
    if (g && g !== 'Unknown') genreCount[g] = (genreCount[g] || 0) + 1;
  });
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  // Most played song
  const songCount = {};
  const songMeta = {};
  history.forEach((e) => {
    songCount[e.id] = (songCount[e.id] || 0) + 1;
    if (!songMeta[e.id]) songMeta[e.id] = e;
  });
  const topSongId = Object.entries(songCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const mostPlayed = topSongId ? { ...songMeta[topSongId], count: songCount[topSongId] } : null;

  return { topArtists, topGenres, mostPlayed, weeklyPlays: weekHistory.length };
}

export default function OrbPage() {
  const [{ isPlaying }] = useStateValue();
  const navigate = useNavigate();

  const [points] = useState(() => parseInt(localStorage.getItem('riff_points') || '0'));
  const [minutesListened] = useState(() => parseFloat(localStorage.getItem('riff_minutes') || '0'));
  const [showStats, setShowStats] = useState(false);
  const [listeningStats] = useState(() => buildStats());

  const level = getLevel(points);
  const levelIndex = LEVELS.indexOf(level);
  const nextLevel = LEVELS[levelIndex + 1];
  const levelProgress = nextLevel
    ? Math.round(((points - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;

  // Drag rotation
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animFrame = useRef(null);
  const orbRef = useRef(null);

  const applyMomentum = () => {
    velocity.current.x *= 0.93;
    velocity.current.y *= 0.93;
    setRotation((prev) => ({
      x: prev.x + velocity.current.y * 0.3,
      y: prev.y + velocity.current.x * 0.3,
    }));
    if (Math.abs(velocity.current.x) > 0.05 || Math.abs(velocity.current.y) > 0.05) {
      animFrame.current = requestAnimationFrame(applyMomentum);
    }
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    cancelAnimationFrame(animFrame.current);
    if (orbRef.current) orbRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    velocity.current = { x: dx, y: dy };
    setRotation((prev) => ({
      x: prev.x + dy * 0.35,
      y: prev.y + dx * 0.35,
    }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (orbRef.current) orbRef.current.style.cursor = 'grab';
    animFrame.current = requestAnimationFrame(applyMomentum);
  };

  const handleTouchStart = (e) => {
    isDragging.current = true;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    cancelAnimationFrame(animFrame.current);
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - lastPos.current.x;
    const dy = e.touches[0].clientY - lastPos.current.y;
    velocity.current = { x: dx, y: dy };
    setRotation((prev) => ({
      x: prev.x + dy * 0.35,
      y: prev.y + dx * 0.35,
    }));
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    animFrame.current = requestAnimationFrame(applyMomentum);
  };

  useEffect(() => { return () => cancelAnimationFrame(animFrame.current); }, []);

  const formatMinutes = (min) => {
    const hrs = Math.floor(min / 60);
    const mins = Math.floor(min % 60);
    const secs = Math.floor((min * 60) % 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div
      className="min-h-screen bg-black text-white overflow-x-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <style>{`
        @keyframes scrollHint {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50%       { transform: translateY(8px); opacity: 0.8; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatStat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
        @keyframes barGrow {
          from { width: 0%; }
          to   { width: var(--bar-w); }
        }
      `}</style>

      <Header />

      {/* SECTION 1 — Full screen orb — pt-32 to account for header + player bar */}
      <section style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        paddingTop: '144px',
      }}>

        {/* Floating stats on hover */}
        {showStats && (
          <>
            <div style={{ position: 'absolute', top: 'calc(50% - 240px)', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 5, animation: 'fadeInUp 0.3s ease' }}>
              <p style={{ color: level.color, fontSize: '28px', fontWeight: '900', margin: 0 }}>{points}</p>
              <p style={{ color: '#555', fontSize: '11px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Points</p>
            </div>
            <div style={{ position: 'absolute', top: '50%', left: 'calc(50% - 280px)', transform: 'translateY(-50%)', textAlign: 'center', zIndex: 5, animation: 'fadeInUp 0.3s ease 0.05s both' }}>
              <p style={{ color: level.color, fontSize: '20px', fontWeight: '900', margin: 0 }}>{level.name}</p>
              <p style={{ color: '#555', fontSize: '11px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Level</p>
            </div>
            <div style={{ position: 'absolute', top: '50%', right: 'calc(50% - 280px)', transform: 'translateY(-50%)', textAlign: 'center', zIndex: 5, animation: 'fadeInUp 0.3s ease 0.1s both' }}>
              <p style={{ color: level.color, fontSize: '20px', fontWeight: '900', margin: 0 }}>{formatMinutes(minutesListened)}</p>
              <p style={{ color: '#555', fontSize: '11px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Listened</p>
            </div>
            {nextLevel && (
              <div style={{ position: 'absolute', top: 'calc(50% + 230px)', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 5, width: '200px', animation: 'fadeInUp 0.3s ease 0.15s both' }}>
                <div style={{ height: '4px', borderRadius: '99px', background: '#ffffff11', overflow: 'hidden', marginBottom: '4px' }}>
                  <div style={{ height: '100%', borderRadius: '99px', width: `${levelProgress}%`, background: `linear-gradient(90deg, ${level.color}, ${nextLevel?.color})` }} />
                </div>
                <p style={{ color: '#444', fontSize: '10px', margin: 0 }}>{nextLevel.min - points} pts to {nextLevel.name}</p>
              </div>
            )}
          </>
        )}

        {/* THE ORB — no glow border, no background glow */}
        <div
          ref={orbRef}
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setShowStats(true)}
          onMouseLeave={() => setShowStats(false)}
          onClick={() => setShowStats(!showStats)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            width: '380px', height: '380px',
            borderRadius: '50%',
            overflow: 'hidden',
            cursor: 'grab',
            position: 'relative', zIndex: 2,
            transform: `perspective(900px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            userSelect: 'none',
          }}
        >
          <video
            key={orbVideo}
            src={orbVideo}
            autoPlay loop muted playsInline
            onError={() => {}} onAbort={() => {}}
            style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
          />
          {/* 3D shine overlay */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.15) 0%, transparent 55%)', pointerEvents: 'none' }} />
        </div>

        {/* Drag hint */}
        <p style={{ color: '#ffffff33', fontSize: '12px', marginTop: '20px', letterSpacing: '2px', textTransform: 'uppercase', zIndex: 2, position: 'relative' }}>
          drag to rotate · hover for stats
        </p>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: '28px', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', animation: 'scrollHint 2s ease-in-out infinite' }}>
          <p style={{ color: '#ffffff22', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>scroll for stats</p>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff33" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* SECTION 2 — Full stats + listening stats */}
      <section style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, #000000 0%, ${level.glow}0d 50%, #000000 100%)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '80px 24px 60px',
      }}>

        {/* 3 stat cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '56px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Total Points', value: `${points}`, sub: 'pts earned' },
            { label: 'Time Listened', value: formatMinutes(minutesListened), sub: 'real time tracked' },
            { label: 'Current Level', value: level.name, sub: `${levelProgress}% to next` },
          ].map((stat) => (
            <div key={stat.label} style={{ padding: '24px 32px', borderRadius: '20px', background: '#ffffff05', border: `1px solid ${level.color}22`, textAlign: 'center', minWidth: '140px', animation: 'floatStat 3s ease-in-out infinite' }}>
              <p style={{ color: level.color, fontSize: '28px', fontWeight: '900', margin: 0 }}>{stat.value}</p>
              <p style={{ color: 'white', fontSize: '13px', fontWeight: '600', margin: '4px 0 2px' }}>{stat.label}</p>
              <p style={{ color: '#444', fontSize: '11px', margin: 0 }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {nextLevel && (
          <div style={{ width: '100%', maxWidth: '420px', marginBottom: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: level.color, fontSize: '13px', fontWeight: '700' }}>{level.name}</span>
              <span style={{ color: nextLevel.color, fontSize: '13px', fontWeight: '700' }}>{nextLevel.name}</span>
            </div>
            <div style={{ height: '10px', borderRadius: '99px', background: '#ffffff0d', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '99px', width: `${levelProgress}%`, background: `linear-gradient(90deg, ${level.color}, ${nextLevel.color})`, boxShadow: `0 0 12px ${level.glow}`, transition: 'width 1s ease' }} />
            </div>
            <p style={{ color: '#444', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>{nextLevel.min - points} pts to {nextLevel.name}</p>
          </div>
        )}

        {/* All levels */}
        <div style={{ width: '100%', maxWidth: '420px', marginBottom: '48px' }}>
          <p style={{ color: '#2a2a2a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center', marginBottom: '16px' }}>All Levels</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {LEVELS.map((l) => (
              <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderRadius: '16px', background: level.name === l.name ? `${l.color}15` : '#ffffff03', border: `1px solid ${level.name === l.name ? l.color + '44' : '#ffffff06'}`, transform: level.name === l.name ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.3s ease' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: level.name === l.name ? l.color : '#444', fontSize: '14px', fontWeight: '700', margin: 0 }}>{l.name}</p>
                  <p style={{ color: '#2a2a2a', fontSize: '11px', margin: 0 }}>{l.min} – {l.max === Infinity ? '∞' : l.max} pts</p>
                </div>
                {points >= l.min && (
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `${l.color}18`, border: `1px solid ${l.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: l.color, fontSize: '12px' }}>✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* How to earn */}
        <div style={{ width: '100%', maxWidth: '420px', padding: '20px', borderRadius: '18px', background: '#ffffff04', border: '1px solid #ffffff06', textAlign: 'center', marginBottom: '60px' }}>
          <p style={{ color: '#333', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>How to earn points</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px' }}>
            <div>
              <p style={{ color: level.color, fontSize: '28px', fontWeight: '900', margin: 0 }}>+10</p>
              <p style={{ color: '#333', fontSize: '11px', margin: '4px 0 0' }}>per song</p>
            </div>
            <div style={{ width: '1px', background: '#ffffff06' }} />
            <div>
              <p style={{ color: level.color, fontSize: '28px', fontWeight: '900', margin: 0 }}>+1</p>
              <p style={{ color: '#333', fontSize: '11px', margin: '4px 0 0' }}>per minute</p>
            </div>
          </div>
        </div>

        {/* ── LISTENING STATS SECTION ── */}
        <div style={{ width: '100%', maxWidth: '520px', marginBottom: '60px' }}>
          <p style={{ color: '#2a2a2a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center', marginBottom: '24px' }}>Your Listening Stats</p>

          {listeningStats.topArtists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px solid #ffffff06', borderRadius: '20px', background: '#ffffff03' }}>
              <p style={{ color: '#2a2a2a', fontSize: '14px', margin: 0 }}>Play some songs to see your stats here</p>
            </div>
          ) : (
            <>
              {/* Weekly plays */}
              <div style={{ marginBottom: '28px', padding: '20px', borderRadius: '16px', background: '#ffffff04', border: '1px solid #ffffff08', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>This week</p>
                  <p style={{ color: level.color, fontSize: '32px', fontWeight: '900', margin: 0 }}>{listeningStats.weeklyPlays}</p>
                  <p style={{ color: '#444', fontSize: '12px', margin: '2px 0 0' }}>songs played</p>
                </div>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={level.color} strokeWidth="1.5" opacity="0.4">
                  <path d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
                </svg>
              </div>

              {/* Top artists */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: '#333', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Top Artists</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {listeningStats.topArtists.map((artist, i) => {
                    const maxCount = listeningStats.topArtists[0].count;
                    const pct = Math.round((artist.count / maxCount) * 100);
                    return (
                      <div key={artist.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: '#333', fontSize: '12px', fontWeight: '700', width: '16px', textAlign: 'right' }}>{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#aaa', fontSize: '13px', fontWeight: '600' }}>{artist.name}</span>
                            <span style={{ color: '#444', fontSize: '11px' }}>{artist.count} plays</span>
                          </div>
                          <div style={{ height: '3px', borderRadius: '99px', background: '#ffffff08', overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: '99px', width: `${pct}%`, background: `linear-gradient(90deg, ${level.color}, ${level.glow})`, transition: 'width 0.8s ease' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top genres */}
              {listeningStats.topGenres.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ color: '#333', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Top Moods / Genres</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {listeningStats.topGenres.map((g, i) => (
                      <div key={g.name} style={{ padding: '6px 14px', borderRadius: '99px', background: i === 0 ? `${level.color}22` : '#ffffff06', border: `1px solid ${i === 0 ? level.color + '44' : '#ffffff0a'}` }}>
                        <span style={{ color: i === 0 ? level.color : '#555', fontSize: '12px', fontWeight: '600' }}>{g.name}</span>
                        <span style={{ color: '#333', fontSize: '11px', marginLeft: '6px' }}>{g.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Most played song */}
              {listeningStats.mostPlayed && (
                <div style={{ padding: '16px', borderRadius: '16px', background: '#ffffff04', border: '1px solid #ffffff08', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#111' }}>
                    {listeningStats.mostPlayed.imageURL
                      ? <img src={listeningStats.mostPlayed.imageURL} alt={listeningStats.mostPlayed.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '20px' }}>♪</div>
                    }
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ color: '#333', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px' }}>Most Played</p>
                    <p style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listeningStats.mostPlayed.title}</p>
                    <p style={{ color: '#555', fontSize: '12px', margin: '2px 0 0' }}>{listeningStats.mostPlayed.artist} · {listeningStats.mostPlayed.count} plays</p>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <p style={{ color: level.color, fontSize: '22px', fontWeight: '900', margin: 0 }}>🔥</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* CTA to Challenges */}
        <div style={{ width: '100%', maxWidth: '420px', marginBottom: '40px', padding: '24px', borderRadius: '20px', background: `${level.color}08`, border: `1px solid ${level.color}22`, textAlign: 'center' }}>
          <p style={{ color: level.color, fontSize: '13px', fontWeight: '700', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Weekly Challenges</p>
          <p style={{ color: '#444', fontSize: '12px', margin: '0 0 16px' }}>Complete challenges to earn bonus points and badges</p>
          <button
            onClick={() => navigate('/challenges')}
            style={{ padding: '10px 24px', borderRadius: '99px', border: `1px solid ${level.color}44`, background: `${level.color}15`, color: level.color, fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.background = `${level.color}25`}
            onMouseLeave={(e) => e.currentTarget.style.background = `${level.color}15`}
          >
            View Challenges →
          </button>
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{ padding: '12px 28px', borderRadius: '99px', border: `1px solid ${level.color}33`, background: `${level.color}0d`, color: level.color, fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.background = `${level.color}1a`}
          onMouseLeave={(e) => e.currentTarget.style.background = `${level.color}0d`}
        >
          Back to music
        </button>
      </section>
    </div>
  );
}
