import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateValue } from '../context/Stateprovider';
import { actionType } from '../context/reducer';
import { fetchSongs, fetchMoodSongs } from '../api';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const LEVELS = [
  { min: 0,    max: 99,       color: '#06b6d4', glow: '#0891b2', name: 'Newcomer'   },
  { min: 100,  max: 299,      color: '#6366f1', glow: '#4f46e5', name: 'Listener'   },
  { min: 300,  max: 599,      color: '#06b6d4', glow: '#0891b2', name: 'Enthusiast' },
  { min: 600,  max: 999,      color: '#6366f1', glow: '#4f46e5', name: 'Addict'     },
  { min: 1000, max: Infinity, color: '#67e8f9', glow: '#06b6d4', name: 'Legend'     },
];
const getLevel = (pts) => LEVELS.find((l) => pts >= l.min && pts <= l.max) || LEVELS[0];

// ── Mood intelligence engine (no API needed) ────────────────────────────────
const MOOD_MAP = {
  Happy: {
    keywords: ['happy', 'joy', 'fun', 'upbeat', 'cheerful', 'bright', 'sunny', 'good vibes', 'celebrate', 'dance', 'party', 'smile', 'laugh', 'excitement', 'energetic', 'positive', 'wedding', 'birthday'],
    emoji: '😊',
    gradient: 'from-yellow-900/60 to-orange-900/40',
    color: '#f59e0b',
  },
  Sad: {
    keywords: ['sad', 'cry', 'heartbreak', 'lonely', 'miss', 'lost', 'broken', 'tears', 'melancholy', 'rain', 'night drive', 'dark', 'empty', 'grief', 'moody', 'gloomy', 'hurt', 'pain', 'sorrow', 'blue'],
    emoji: '🌧',
    gradient: 'from-blue-900/60 to-indigo-900/40',
    color: '#6366f1',
  },
  Chill: {
    keywords: ['chill', 'relax', 'calm', 'peaceful', 'lofi', 'lo-fi', 'study', 'coffee', 'afternoon', 'lazy', 'slow', 'evening', 'sunset', 'mellow', 'laid back', 'background', 'soft', 'cozy', 'home', 'weekend'],
    emoji: '☕',
    gradient: 'from-teal-900/60 to-cyan-900/40',
    color: '#06b6d4',
  },
  Party: {
    keywords: ['party', 'club', 'dance', 'hype', 'banger', 'turn up', 'wild', 'night out', 'disco', 'rave', 'dj', 'bass', 'bounce', 'lit', 'dj set', 'weekend night', 'friends', 'festival', 'edm', 'remix'],
    emoji: '🎉',
    gradient: 'from-pink-900/60 to-purple-900/40',
    color: '#ec4899',
  },
  Romantic: {
    keywords: ['love', 'romantic', 'romance', 'date', 'dinner', 'couple', 'crush', 'feelings', 'heart', 'passionate', 'intimate', 'together', 'sweet', 'serenade', 'lover', 'kiss', 'anniversary', 'valentines'],
    emoji: '💕',
    gradient: 'from-rose-900/60 to-pink-900/40',
    color: '#f43f5e',
  },
  Focus: {
    keywords: ['focus', 'study', 'work', 'concentrate', 'productive', 'coding', 'reading', 'deep work', 'flow', 'grind', 'homework', 'deadline', 'brain', 'think', 'serious', 'mindful', 'meditation', 'zen'],
    emoji: '🎯',
    gradient: 'from-indigo-900/60 to-blue-900/40',
    color: '#818cf8',
  },
  Workout: {
    keywords: ['workout', 'gym', 'run', 'running', 'exercise', 'training', 'cardio', 'lift', 'weights', 'fitness', 'energy', 'pump', 'motivation', 'hustle', 'beast', 'power', 'strong', 'intense', 'sweat', 'sprint'],
    emoji: '💪',
    gradient: 'from-red-900/60 to-orange-900/40',
    color: '#ef4444',
  },
};

// Playlist title generators per mood
const TITLE_TEMPLATES = {
  Happy:    ['Good Vibes Only ✨', 'Sunshine Mix ☀️', 'Feel Good Station 😊', 'Happy Hour 🎶'],
  Sad:      ['Late Night Feels 🌧', 'In My Feelings 💙', 'Rainy Day Mix 🌦', 'Quiet Storm 🌙'],
  Chill:    ['Sunday Morning ☕', 'Lo-fi Afternoon 🍃', 'Easy Does It 🌿', 'Slow Down 🌅'],
  Party:    ['Turn It Up 🎉', 'Night Mode 🌃', 'Banger Alert 🔥', 'Party Starter 🕺'],
  Romantic: ['Love Language 💕', 'For You ❤️', 'Candlelight Mix 🕯', 'In Love 🌹'],
  Focus:    ['Deep Work Mode 🎯', 'Flow State 🧠', 'Study Session 📚', 'In The Zone ⚡'],
  Workout:  ['Beast Mode 💪', 'Push It Hard 🏋️', 'No Days Off 🔥', 'Power Up ⚡'],
};

function analyzeMood(input) {
  const lower = input.toLowerCase();
  const scores = {};

  Object.entries(MOOD_MAP).forEach(([mood, data]) => {
    let score = 0;
    data.keywords.forEach((kw) => {
      if (lower.includes(kw)) score += kw.split(' ').length > 1 ? 3 : 1;
    });
    scores[mood] = score;
  });

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topMood = best[0][1] > 0 ? best[0][0] : 'Chill'; // default to Chill
  const title = TITLE_TEMPLATES[topMood][Math.floor(Math.random() * TITLE_TEMPLATES[topMood].length)];

  return { mood: topMood, title, scores };
}

function buildPlaylist(mood, allSongs, moodSongs) {
  // First try tagged mood songs from DB
  const tagged = moodSongs?.[mood] || allSongs.filter((s) => s.mood === mood || s.categories?.includes(mood.toLowerCase()));
  if (tagged.length >= 3) return tagged.slice(0, 15);

  // Fallback: pick songs somewhat randomly, weighted by mood keywords in title/artist
  const keywords = MOOD_MAP[mood]?.keywords || [];
  const scored = allSongs.map((s) => {
    const text = `${s.title} ${s.artist} ${s.genre || ''}`.toLowerCase();
    let score = Math.random() * 0.4; // add randomness
    keywords.forEach((kw) => { if (text.includes(kw)) score += 1; });
    return { song: s, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, 15).map((x) => x.song);
}

const EXAMPLE_PROMPTS = [
  'late night drive in the rain',
  'working out at the gym',
  'sunday morning coffee',
  'heartbreak at 2am',
  'celebrating with friends',
  'deep focus coding session',
];

export default function MoodcastPage() {
  const [{ allSongs, moodSongs }, dispatch] = useStateValue();
  const navigate = useNavigate();
  const points = parseInt(localStorage.getItem('riff_points') || '0');
  const level = getLevel(points);

  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null); // { mood, title, songs }
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!allSongs?.length) {
        const songs = await fetchSongs();
        if (songs?.length) dispatch({ type: actionType.SET_SONGS, songs });
      }
      if (!moodSongs || Object.keys(moodSongs).length === 0) {
        const moods = await fetchMoodSongs();
        if (moods) dispatch({ type: actionType.SET_MOOD_SONGS, moodSongs: moods });
      }
    };
    load();
  }, []);

  const handleGenerate = async (promptOverride) => {
    const prompt = promptOverride || input;
    if (!prompt.trim()) return;
    setGenerating(true);
    setResult(null);

    // Simulate a brief "thinking" delay for UX
    await new Promise((r) => setTimeout(r, 1200));

    const { mood, title } = analyzeMood(prompt);
    const songs = buildPlaylist(mood, allSongs, moodSongs);

    setResult({ mood, title, songs, prompt });
    setGenerating(false);
  };

  const playSong = (song) => {
    dispatch({ type: actionType.SET_CURRENT_SONG, song });
    dispatch({ type: actionType.SET_IS_PLAYING, isPlaying: true });
  };

  const playAll = () => {
    if (!result?.songs?.length) return;
    dispatch({ type: actionType.SET_CURRENT_SONG, song: result.songs[0] });
    dispatch({ type: actionType.SET_IS_PLAYING, isPlaying: true });
  };

  const moodData = result ? MOOD_MAP[result.mood] : null;

  return (
    <div className="min-h-screen bg-black text-white" style={{ paddingTop: '144px' }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 1; transform: scale(1.05); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .moodcast-input::placeholder { color: #333; }
        .moodcast-input:focus { outline: none; border-color: ${level.color}88; box-shadow: 0 0 0 3px ${level.color}18; }
      `}</style>

      <Header />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px 120px' }}>

        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '40px', textAlign: 'center' }}>
          <p style={{ color: level.color, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 10px' }}>AI Moodcast</p>
          <h1 style={{ color: 'white', fontSize: '36px', fontWeight: '900', margin: '0 0 10px', lineHeight: 1.1 }}>What's your vibe?</h1>
          <p style={{ color: '#444', fontSize: '14px', margin: 0 }}>Describe how you feel or what you're doing — we'll build a playlist for it.</p>
        </motion.div>

        {/* Input area */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: '24px' }}>
          <textarea
            className="moodcast-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
            placeholder="e.g. late night drive in the rain, feeling nostalgic..."
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#ffffff06', border: `1px solid #ffffff12`,
              borderRadius: '18px', color: 'white',
              fontSize: '16px', padding: '18px 22px',
              resize: 'none', fontFamily: 'inherit',
              lineHeight: '1.6', transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
          />
          <button
            onClick={() => handleGenerate()}
            disabled={generating || !input.trim()}
            style={{
              marginTop: '12px', width: '100%', padding: '16px',
              borderRadius: '14px', border: 'none',
              background: input.trim() && !generating ? `linear-gradient(135deg, ${level.color}, ${level.glow})` : '#1a1a1a',
              color: input.trim() && !generating ? 'black' : '#333',
              fontSize: '15px', fontWeight: '700', cursor: input.trim() && !generating ? 'pointer' : 'not-allowed',
              transition: 'all 0.25s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}
          >
            {generating ? (
              <>
                <div style={{ width: '18px', height: '18px', border: '2px solid #444', borderTopColor: level.color, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Analyzing your vibe...
              </>
            ) : (
              <>✨ Generate Moodcast</>
            )}
          </button>
        </motion.div>

        {/* Example prompts */}
        {!result && !generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ marginBottom: '40px' }}>
            <p style={{ color: '#2a2a2a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', textAlign: 'center' }}>Try one of these</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setInput(p); handleGenerate(p); }}
                  style={{
                    padding: '8px 16px', borderRadius: '99px',
                    background: '#ffffff06', border: '1px solid #ffffff0a',
                    color: '#555', fontSize: '13px', cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ffffff0f'; e.currentTarget.style.color = '#888'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff06'; e.currentTarget.style.color = '#555'; }}
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Generating animation */}
        {generating && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              {['Happy', 'Sad', 'Chill', 'Party', 'Focus', 'Workout', 'Romantic'].map((m, i) => (
                <div key={m} style={{ width: '10px', height: '10px', borderRadius: '50%', background: MOOD_MAP[m].color, animation: `pulse 1.4s ease-in-out ${i * 0.1}s infinite` }} />
              ))}
            </div>
            <p style={{ color: '#444', fontSize: '13px' }}>Reading between the lines...</p>
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && !generating && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Playlist header */}
              <div style={{
                padding: '28px', borderRadius: '24px',
                background: `linear-gradient(135deg, ${moodData.color}18 0%, #0a0a0a 100%)`,
                border: `1px solid ${moodData.color}33`,
                marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '28px' }}>{moodData.emoji}</span>
                      <span style={{ color: moodData.color, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>{result.mood} Mood</span>
                    </div>
                    <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '900', margin: '0 0 4px' }}>{result.title}</h2>
                    <p style={{ color: '#444', fontSize: '13px', margin: '0 0 20px', fontStyle: 'italic' }}>"{result.prompt}"</p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={playAll}
                        style={{ padding: '12px 28px', borderRadius: '99px', border: 'none', background: moodData.color, color: 'black', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        ▶ Play All
                      </button>
                      <button
                        onClick={() => { setResult(null); setInput(''); }}
                        style={{ padding: '12px 20px', borderRadius: '99px', border: `1px solid ${moodData.color}33`, background: 'transparent', color: moodData.color, fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        New cast
                      </button>
                    </div>
                    {savedMessage && <p style={{ color: level.color, fontSize: '12px', marginTop: '10px' }}>{savedMessage}</p>}
                  </div>
                  <div style={{ fontSize: '64px', opacity: 0.15, flexShrink: 0 }}>{moodData.emoji}</div>
                </div>
              </div>

              {/* Song list */}
              {result.songs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#333', fontSize: '14px' }}>
                  No songs found for this mood yet. Try adding songs with mood tags in the admin panel.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {result.songs.map((song, i) => (
                    <motion.div
                      key={song._id || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => playSong(song)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '12px 16px', borderRadius: '16px',
                        cursor: 'pointer', transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#ffffff07'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ color: '#2a2a2a', fontSize: '12px', width: '18px', textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                      <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', background: '#111', flexShrink: 0 }}>
                        {song.imageURL
                          ? <img src={song.imageURL} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>♪</div>
                        }
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</p>
                        <p style={{ color: '#555', fontSize: '12px', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist}</p>
                      </div>
                      <svg width="16" height="16" fill="none" stroke="#333" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Try different mood */}
              <div style={{ marginTop: '32px', padding: '20px', borderRadius: '18px', background: '#ffffff04', border: '1px solid #ffffff06', textAlign: 'center' }}>
                <p style={{ color: '#333', fontSize: '12px', margin: '0 0 14px' }}>Not the right vibe? Try a different mood:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                  {Object.entries(MOOD_MAP).filter(([m]) => m !== result.mood).map(([mood, data]) => (
                    <button
                      key={mood}
                      onClick={() => {
                        const newTitle = TITLE_TEMPLATES[mood][Math.floor(Math.random() * TITLE_TEMPLATES[mood].length)];
                        const songs = buildPlaylist(mood, allSongs, moodSongs);
                        setResult({ mood, title: newTitle, songs, prompt: mood.toLowerCase() });
                      }}
                      style={{ padding: '7px 14px', borderRadius: '99px', border: `1px solid ${data.color}33`, background: `${data.color}0d`, color: data.color, fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = `${data.color}1a`}
                      onMouseLeave={(e) => e.currentTarget.style.background = `${data.color}0d`}
                    >
                      {data.emoji} {mood}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
