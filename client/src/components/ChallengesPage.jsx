import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';

const LEVELS = [
  { min: 0,    max: 99,       color: '#06b6d4', glow: '#0891b2', name: 'Newcomer'   },
  { min: 100,  max: 299,      color: '#6366f1', glow: '#4f46e5', name: 'Listener'   },
  { min: 300,  max: 599,      color: '#06b6d4', glow: '#0891b2', name: 'Enthusiast' },
  { min: 600,  max: 999,      color: '#6366f1', glow: '#4f46e5', name: 'Addict'     },
  { min: 1000, max: Infinity, color: '#67e8f9', glow: '#06b6d4', name: 'Legend'     },
];
const getLevel = (pts) => LEVELS.find((l) => pts >= l.min && pts <= l.max) || LEVELS[0];

// Challenge definitions — condition functions receive the history + current stats
const CHALLENGE_DEFS = [
  {
    id: 'play_5',
    title: 'Warm Up',
    desc: 'Play 5 songs this week',
    icon: '🎵',
    reward: 25,
    badge: '🎯',
    target: 5,
    getValue: (history) => history.length,
  },
  {
    id: 'play_20',
    title: 'Music Marathon',
    desc: 'Play 20 songs this week',
    icon: '🏃',
    reward: 60,
    badge: '🏅',
    target: 20,
    getValue: (history) => history.length,
  },
  {
    id: 'three_moods',
    title: 'Mood Explorer',
    desc: 'Listen to 3 different moods this week',
    icon: '🌈',
    reward: 40,
    badge: '🌟',
    target: 3,
    getValue: (history) => new Set(history.map((e) => e.mood).filter(Boolean)).size,
  },
  {
    id: 'three_artists',
    title: 'Artist Hopper',
    desc: 'Listen to 3 different artists this week',
    icon: '🎤',
    reward: 30,
    badge: '⭐',
    target: 3,
    getValue: (history) => new Set(history.map((e) => e.artist).filter(Boolean)).size,
  },
  {
    id: 'listen_10min',
    title: 'Deep Listen',
    desc: 'Listen for 10 minutes total this week',
    icon: '⏱',
    reward: 20,
    badge: '🎧',
    target: 10,
    getValue: (history) => history.length * 3.5, // rough estimate ~3.5min per song
  },
  {
    id: 'fav_3',
    title: 'Collector',
    desc: 'Add 3 songs to your favourites',
    icon: '❤️',
    reward: 35,
    badge: '💎',
    target: 3,
    getValue: () => JSON.parse(localStorage.getItem('riff_favs') || '[]').length,
  },
];

function getWeekHistory() {
  const raw = localStorage.getItem('riff_history');
  if (!raw) return [];
  const history = JSON.parse(raw);
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return history.filter((e) => e.playedAt > oneWeekAgo);
}

function getCompletedChallenges() {
  const raw = localStorage.getItem('riff_completed_challenges');
  return raw ? JSON.parse(raw) : [];
}

export default function ChallengesPage() {
  const navigate = useNavigate();
  const [points, setPoints] = useState(() => parseInt(localStorage.getItem('riff_points') || '0'));
  const level = getLevel(points);

  const weekHistory = getWeekHistory();
  const [completed, setCompleted] = useState(() => getCompletedChallenges());
  const [newlyCompleted, setNewlyCompleted] = useState(null);

  // Check if any challenges should be awarded now
  useEffect(() => {
    const updatedCompleted = [...completed];
    let pointsToAdd = 0;
    let justCompleted = null;

    CHALLENGE_DEFS.forEach((ch) => {
      if (updatedCompleted.includes(ch.id)) return;
      const val = ch.getValue(weekHistory);
      if (val >= ch.target) {
        updatedCompleted.push(ch.id);
        pointsToAdd += ch.reward;
        justCompleted = ch;
      }
    });

    if (pointsToAdd > 0) {
      const newPts = points + pointsToAdd;
      localStorage.setItem('riff_points', newPts.toString());
      localStorage.setItem('riff_completed_challenges', JSON.stringify(updatedCompleted));
      setPoints(newPts);
      setCompleted(updatedCompleted);
      setNewlyCompleted(justCompleted);
      setTimeout(() => setNewlyCompleted(null), 3000);
    }
  }, []);

  const totalEarnable = CHALLENGE_DEFS.reduce((sum, ch) => sum + ch.reward, 0);
  const totalEarned = CHALLENGE_DEFS.filter((ch) => completed.includes(ch.id)).reduce((sum, ch) => sum + ch.reward, 0);
  const completedCount = completed.length;

  // Days until weekly reset (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

  return (
    <div className="min-h-screen bg-black text-white" style={{ paddingTop: '144px' }}>
      <style>{`
        @keyframes badgePop {
          0%   { transform: scale(0.5) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.2) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <Header />

      {/* Newly completed toast */}
      {newlyCompleted && (
        <div style={{
          position: 'fixed', top: '160px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, animation: 'slideDown 0.4s ease',
          background: `${level.color}22`, border: `1px solid ${level.color}55`,
          borderRadius: '16px', padding: '14px 24px',
          display: 'flex', alignItems: 'center', gap: '12px',
          backdropFilter: 'blur(20px)',
        }}>
          <span style={{ fontSize: '24px', animation: 'badgePop 0.5s ease' }}>{newlyCompleted.badge}</span>
          <div>
            <p style={{ color: level.color, fontSize: '13px', fontWeight: '700', margin: 0 }}>Challenge complete! +{newlyCompleted.reward} pts</p>
            <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>{newlyCompleted.title}</p>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px 120px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ← Back
          </button>
          <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '900', margin: '0 0 4px' }}>Weekly Challenges</h1>
          <p style={{ color: '#444', fontSize: '13px', margin: 0 }}>Resets in {daysUntilMonday} day{daysUntilMonday !== 1 ? 's' : ''} · {completedCount}/{CHALLENGE_DEFS.length} completed</p>
        </motion.div>

        {/* Summary bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ marginBottom: '32px', padding: '20px 24px', borderRadius: '20px', background: '#ffffff04', border: '1px solid #ffffff08' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <p style={{ color: level.color, fontSize: '24px', fontWeight: '900', margin: 0 }}>{totalEarned} <span style={{ fontSize: '14px', color: '#444' }}>/ {totalEarnable} pts</span></p>
              <p style={{ color: '#555', fontSize: '12px', margin: '2px 0 0' }}>earned this week</p>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '180px' }}>
              {CHALLENGE_DEFS.filter((ch) => completed.includes(ch.id)).map((ch) => (
                <span key={ch.id} style={{ fontSize: '20px', animation: 'badgePop 0.4s ease' }}>{ch.badge}</span>
              ))}
            </div>
          </div>
          <div style={{ height: '6px', borderRadius: '99px', background: '#ffffff08', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '99px', width: `${totalEarnable > 0 ? Math.round((totalEarned / totalEarnable) * 100) : 0}%`, background: `linear-gradient(90deg, ${level.color}, ${level.glow})`, transition: 'width 1s ease' }} />
          </div>
        </motion.div>

        {/* Challenge cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {CHALLENGE_DEFS.map((ch, i) => {
            const isDone = completed.includes(ch.id);
            const current = ch.getValue(weekHistory);
            const pct = Math.min(100, Math.round((current / ch.target) * 100));

            return (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  padding: '20px 22px',
                  borderRadius: '20px',
                  background: isDone ? `${level.color}0d` : '#ffffff04',
                  border: `1px solid ${isDone ? level.color + '33' : '#ffffff08'}`,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Completed shimmer stripe */}
                {isDone && (
                  <div style={{
                    position: 'absolute', inset: 0, opacity: 0.04,
                    background: `linear-gradient(105deg, transparent 40%, ${level.color} 50%, transparent 60%)`,
                    backgroundSize: '200% auto',
                    animation: 'shimmer 3s linear infinite',
                    pointerEvents: 'none',
                  }} />
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  {/* Icon */}
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: isDone ? `${level.color}20` : '#ffffff08', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    {isDone ? ch.badge : ch.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <p style={{ color: isDone ? level.color : 'white', fontSize: '15px', fontWeight: '700', margin: 0 }}>{ch.title}</p>
                      <span style={{ color: isDone ? level.color : '#444', fontSize: '12px', fontWeight: '600', flexShrink: 0, marginLeft: '8px' }}>+{ch.reward} pts</span>
                    </div>
                    <p style={{ color: '#555', fontSize: '12px', margin: '0 0 12px' }}>{ch.desc}</p>

                    {/* Progress bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '4px', borderRadius: '99px', background: '#ffffff08', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '99px', width: `${pct}%`, background: isDone ? `linear-gradient(90deg, ${level.color}, ${level.glow})` : '#333', transition: 'width 0.8s ease', boxShadow: isDone ? `0 0 6px ${level.glow}` : 'none' }} />
                      </div>
                      <span style={{ color: isDone ? level.color : '#444', fontSize: '11px', fontWeight: '600', flexShrink: 0, minWidth: '60px', textAlign: 'right' }}>
                        {isDone ? '✓ Done' : `${Math.min(current, ch.target)} / ${ch.target}`}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <div style={{ marginTop: '48px', textAlign: 'center' }}>
          <p style={{ color: '#2a2a2a', fontSize: '12px', lineHeight: '1.6' }}>
            Challenges reset every Monday. Completed challenges are saved and points are permanently added to your balance.
          </p>
          <button
            onClick={() => navigate('/orb')}
            style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '99px', border: `1px solid ${level.color}33`, background: `${level.color}0d`, color: level.color, fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.background = `${level.color}1a`}
            onMouseLeave={(e) => e.currentTarget.style.background = `${level.color}0d`}
          >
            View your profile →
          </button>
        </div>
      </div>
    </div>
  );
}
