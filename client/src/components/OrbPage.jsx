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

export default function OrbPage() {
  const [{ isPlaying }] = useStateValue();
  const navigate = useNavigate();

  const [points] = useState(() => parseInt(localStorage.getItem('riff_points') || '0'));
  const [minutesListened] = useState(() => parseFloat(localStorage.getItem('riff_minutes') || '0'));
  const [showStats, setShowStats] = useState(false);

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

  useEffect(() => {
    return () => cancelAnimationFrame(animFrame.current);
  }, []);

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
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.06); }
        }
        @keyframes scrollHint {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50%       { transform: translateY(8px); opacity: 0.8; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatStat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
      `}</style>

      <Header />

      {/* SECTION 1 — Full screen orb */}
      <section style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Background glow */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: `radial-gradient(ellipse at 50% 50%, ${level.glow}22 0%, transparent 65%)`,
          animation: isPlaying ? 'glowPulse 1.8s ease-in-out infinite' : 'none',
          pointerEvents: 'none',
        }} />

        {/* Stats floating around orb — shown on hover/click */}
        {showStats && (
          <>
            {/* Top — total points */}
            <div style={{
              position: 'absolute', top: 'calc(50% - 260px)', left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center', zIndex: 5,
              animation: 'fadeInUp 0.3s ease',
            }}>
              <p style={{ color: level.color, fontSize: '28px', fontWeight: '900', margin: 0 }}>{points}</p>
              <p style={{ color: '#555', fontSize: '11px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Points</p>
            </div>

            {/* Left — level */}
            <div style={{
              position: 'absolute', top: '50%', left: 'calc(50% - 280px)',
              transform: 'translateY(-50%)',
              textAlign: 'center', zIndex: 5,
              animation: 'fadeInUp 0.3s ease 0.05s both',
            }}>
              <p style={{ color: level.color, fontSize: '20px', fontWeight: '900', margin: 0 }}>{level.name}</p>
              <p style={{ color: '#555', fontSize: '11px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Level</p>
            </div>

            {/* Right — minutes */}
            <div style={{
              position: 'absolute', top: '50%', right: 'calc(50% - 280px)',
              transform: 'translateY(-50%)',
              textAlign: 'center', zIndex: 5,
              animation: 'fadeInUp 0.3s ease 0.1s both',
            }}>
              <p style={{ color: level.color, fontSize: '20px', fontWeight: '900', margin: 0 }}>{formatMinutes(minutesListened)}</p>
              <p style={{ color: '#555', fontSize: '11px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Listened</p>
            </div>

            {/* Bottom — progress to next */}
            {nextLevel && (
              <div style={{
                position: 'absolute', top: 'calc(50% + 240px)', left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center', zIndex: 5, width: '200px',
                animation: 'fadeInUp 0.3s ease 0.15s both',
              }}>
                <div style={{ height: '4px', borderRadius: '99px', background: '#ffffff11', overflow: 'hidden', marginBottom: '4px' }}>
                  <div style={{
                    height: '100%', borderRadius: '99px',
                    width: `${levelProgress}%`,
                    background: `linear-gradient(90deg, ${level.color}, ${nextLevel?.color})`,
                  }} />
                </div>
                <p style={{ color: '#444', fontSize: '10px', margin: 0 }}>
                  {nextLevel.min - points} pts to {nextLevel.name}
                </p>
              </div>
            )}
          </>
        )}

        {/* THE ORB */}
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
            boxShadow: isPlaying
              ? `0 0 70px 25px ${level.glow}66, 0 0 140px 50px ${level.glow}22`
              : `0 0 40px 12px ${level.glow}33`,
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
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.15) 0%, transparent 55%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Drag hint */}
        <p style={{
          color: '#ffffff33', fontSize: '12px', marginTop: '20px',
          letterSpacing: '2px', textTransform: 'uppercase', zIndex: 2, position: 'relative',
        }}>
          drag to rotate · hover for stats
        </p>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: '28px', zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          animation: 'scrollHint 2s ease-in-out infinite',
        }}>
          <p style={{ color: '#ffffff22', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>scroll for stats</p>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff33" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* SECTION 2 — Full stats */}
      <section style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, #000000 0%, ${level.glow}0d 50%, #000000 100%)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '80px 24px 120px',
      }}>

        {/* 3 stat cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '56px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Total Points', value: `${points}`, sub: 'pts earned' },
            { label: 'Time Listened', value: formatMinutes(minutesListened), sub: 'real time tracked' },
            { label: 'Current Level', value: level.name, sub: `${levelProgress}% to next` },
          ].map((stat) => (
            <div key={stat.label} style={{
              padding: '24px 32px', borderRadius: '20px',
              background: '#ffffff05', border: `1px solid ${level.color}22`,
              textAlign: 'center', minWidth: '140px',
              animation: 'floatStat 3s ease-in-out infinite',
            }}>
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
              <div style={{
                height: '100%', borderRadius: '99px',
                width: `${levelProgress}%`,
                background: `linear-gradient(90deg, ${level.color}, ${nextLevel.color})`,
                boxShadow: `0 0 12px ${level.glow}`,
                transition: 'width 1s ease',
              }} />
            </div>
            <p style={{ color: '#444', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>
              {nextLevel.min - points} pts to {nextLevel.name}
            </p>
          </div>
        )}

        {/* All levels */}
        <div style={{ width: '100%', maxWidth: '420px', marginBottom: '40px' }}>
          <p style={{ color: '#2a2a2a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center', marginBottom: '16px' }}>
            All Levels
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {LEVELS.map((l) => (
              <div key={l.name} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 18px', borderRadius: '16px',
                background: level.name === l.name ? `${l.color}15` : '#ffffff03',
                border: `1px solid ${level.name === l.name ? l.color + '44' : '#ffffff06'}`,
                transform: level.name === l.name ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease',
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: level.name === l.name ? l.color : '#444', fontSize: '14px', fontWeight: '700', margin: 0 }}>
                    {l.name}
                  </p>
                  <p style={{ color: '#2a2a2a', fontSize: '11px', margin: 0 }}>
                    {l.min} – {l.max === Infinity ? '∞' : l.max} pts
                  </p>
                </div>
                {points >= l.min && (
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: `${l.color}18`, border: `1px solid ${l.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: l.color, fontSize: '12px',
                  }}>✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* How to earn */}
        <div style={{
          width: '100%', maxWidth: '420px',
          padding: '20px', borderRadius: '18px',
          background: '#ffffff04', border: '1px solid #ffffff06',
          textAlign: 'center', marginBottom: '40px',
        }}>
          <p style={{ color: '#333', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>
            How to earn points
          </p>
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

        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 28px', borderRadius: '99px',
            border: `1px solid ${level.color}33`,
            background: `${level.color}0d`, color: level.color,
            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = `${level.color}1a`}
          onMouseLeave={(e) => e.currentTarget.style.background = `${level.color}0d`}
        >
          Back to music
        </button>
      </section>
    </div>
  );
}