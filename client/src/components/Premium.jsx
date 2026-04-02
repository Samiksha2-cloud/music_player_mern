import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './Header';

export default function Premium() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Store premium per user email so it doesn't show for everyone
  const premiumKey = `riff_premium_${user?.email}`;
  const isPremium = localStorage.getItem(premiumKey) === 'true';

  const [step, setStep] = useState('plans');
  const [form, setForm] = useState({ card: '', expiry: '', cvv: '', name: '' });
  const [errors, setErrors] = useState({});
  const [showCancel, setShowCancel] = useState(false);

  const formatCard = (val) => val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (val) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length >= 2) return clean.slice(0, 2) + '/' + clean.slice(2, 4);
    return clean;
  };

  const validate = () => {
    const e = {};
    if (form.card.replace(/\s/g, '').length < 16) e.card = 'Enter a valid 16-digit card number';
    if (form.expiry.length < 5) e.expiry = 'Enter valid expiry (MM/YY)';
    if (form.cvv.length < 3) e.cvv = 'Enter valid CVV';
    if (!form.name.trim()) e.name = 'Enter cardholder name';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    if (!validate()) return;
    setStep('processing');
    setTimeout(() => {
      // Store premium tied to user email
      localStorage.setItem(premiumKey, 'true');
      // Also keep global key for quick checks
      localStorage.setItem('riff_premium', 'true');
      setStep('success');
    }, 2500);
  };

  const handleCancel = () => {
    localStorage.removeItem(premiumKey);
    localStorage.removeItem('riff_premium');
    setShowCancel(false);
    setStep('plans');
    window.location.reload();
  };

  // Already premium — show management page
  if (isPremium && step === 'plans') {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6">
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px',
          }}>
            👑
          </div>
          <h1 className="text-3xl font-black text-white">You're on Premium</h1>
          <p className="text-gray-400 text-center max-w-sm">
            Enjoying unlimited playlists and downloads. Your subscription renews monthly.
          </p>

          {/* Active features */}
          <div className="flex flex-col gap-2 bg-gray-900/40 rounded-2xl p-5 border border-cyan-900/30 w-full max-w-xs">
            <p className="text-cyan-400 font-semibold text-sm mb-1">Active Features:</p>
            {['Unlimited playlists', 'Unlimited songs per playlist', 'Download songs'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <span className="text-cyan-400 text-sm">✓</span>
                <span className="text-gray-300 text-sm">{f}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-full bg-cyan-500 text-black font-bold hover:bg-cyan-400 hover:scale-105 transition-all duration-200"
            >
              Back to Riff
            </button>
            <button
              onClick={() => setShowCancel(true)}
              className="px-6 py-3 rounded-full bg-transparent border border-red-800/50 text-red-500 font-semibold hover:bg-red-900/20 hover:scale-105 transition-all duration-200 text-sm"
            >
              Cancel Subscription
            </button>
          </div>

          {/* Cancel confirmation modal */}
          {showCancel && (
            <>
              <div
                onClick={() => setShowCancel(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200 }}
              />
              <div style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#0f0f1a', border: '1px solid #1e1e3a',
                borderRadius: '20px', padding: '28px', zIndex: 201,
                width: '300px', textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              }}>
                <p style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '8px' }}>
                  Cancel Subscription?
                </p>
                <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>
                  You will lose access to unlimited playlists and downloads immediately.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setShowCancel(false)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '12px',
                      background: '#1a1a2e', border: '1px solid #1e1e3a',
                      color: '#aaa', fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    Keep Premium
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '12px',
                      background: '#ef444420', border: '1px solid #ef4444',
                      color: '#ef4444', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                    }}
                  >
                    Yes, Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="pt-28 pb-20 px-6 flex flex-col items-center">

        {/* Plans */}
        {step === 'plans' && (
          <div className="w-full max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-black text-white mb-3">Riff Premium</h1>
              <p className="text-gray-400">Unlock the full experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto">
              {/* Free */}
              <div className="bg-gray-900/40 rounded-2xl p-6 border border-gray-800/40">
                <h2 className="text-lg font-bold text-white mb-1">Free</h2>
                <p className="text-3xl font-black text-white mb-6">₹0</p>
                <div className="flex flex-col gap-3">
                  {[
                    { text: 'Unlimited song streaming', ok: true },
                    { text: 'Orb points and levels', ok: true },
                    { text: 'Level-based playlist limits (10–30 songs)', ok: true },
                    { text: '1 playlist only', ok: false },
                    { text: 'Download songs', ok: false },
                  ].map((f) => (
                    <div key={f.text} className="flex items-center gap-3">
                      <span style={{ color: f.ok ? '#06b6d4' : '#333', fontSize: '14px' }}>
                        {f.ok ? '✓' : '✗'}
                      </span>
                      <span style={{ color: f.ok ? '#ccc' : '#444', fontSize: '13px' }}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium */}
              <div className="bg-gradient-to-br from-cyan-900/30 to-indigo-900/30 rounded-2xl p-6 border border-cyan-500/30 relative overflow-hidden">
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-cyan-500 text-black text-xs font-bold">
                  RECOMMENDED
                </div>
                <h2 className="text-lg font-bold text-white mb-1">Premium</h2>
                <div className="flex items-end gap-1 mb-6">
                  <p className="text-3xl font-black text-white">₹99</p>
                  <p className="text-gray-400 text-sm mb-1">/month</p>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    'Unlimited song streaming',
                    'Orb points and levels',
                    'Unlimited playlists',
                    'Unlimited songs per playlist',
                    'Download songs',
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <span style={{ color: '#06b6d4', fontSize: '14px' }}>✓</span>
                      <span className="text-gray-200 text-sm">{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep('payment')}
                  className="w-full mt-6 py-3 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 hover:scale-105 transition-all duration-200"
                >
                  Subscribe for ₹99/month
                </button>
              </div>
            </div>

            {/* Level limits info */}
            <div className="max-w-2xl mx-auto bg-gray-900/30 rounded-2xl p-5 border border-gray-800/30">
              <p className="text-gray-400 text-sm font-semibold mb-3">Free User Playlist Limits by Level:</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { name: 'Newcomer', limit: 10, color: '#06b6d4' },
                  { name: 'Listener', limit: 15, color: '#6366f1' },
                  { name: 'Enthusiast', limit: 20, color: '#06b6d4' },
                  { name: 'Addict', limit: 25, color: '#6366f1' },
                  { name: 'Legend', limit: 30, color: '#67e8f9' },
                ].map((l) => (
                  <div key={l.name} style={{ textAlign: 'center', padding: '10px', background: '#0a0a15', borderRadius: '12px', border: `1px solid ${l.color}22` }}>
                    <p style={{ color: l.color, fontSize: '18px', fontWeight: '900', margin: 0 }}>{l.limit}</p>
                    <p style={{ color: '#444', fontSize: '10px', margin: '2px 0 0' }}>songs</p>
                    <p style={{ color: '#333', fontSize: '10px', margin: 0 }}>{l.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-gray-600 text-xs mt-6">Cancel anytime. No hidden fees.</p>
          </div>
        )}

        {/* Payment */}
        {step === 'payment' && (
          <div className="w-full max-w-md">
            <button onClick={() => setStep('plans')} className="text-gray-500 hover:text-white transition text-sm mb-6 flex items-center gap-2">
              ← Back
            </button>

            <div className="bg-gray-900/60 rounded-2xl p-6 border border-indigo-900/30 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white mb-1">Payment Details</h2>
              <p className="text-gray-500 text-sm mb-6">Riff Premium · ₹99/month</p>

              {/* Card preview */}
              <div style={{
                background: 'linear-gradient(135deg, #1e1e3a 0%, #0f0f1a 100%)',
                borderRadius: '16px', padding: '20px', marginBottom: '24px',
                border: '1px solid #ffffff0a', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: '#06b6d422' }} />
                <div style={{ position: 'absolute', bottom: '-30px', left: '-10px', width: '100px', height: '100px', borderRadius: '50%', background: '#6366f122' }} />
                <p style={{ color: '#555', fontSize: '10px', letterSpacing: '2px', marginBottom: '16px' }}>RIFF PREMIUM</p>
                <p style={{ color: 'white', fontSize: '18px', fontFamily: 'monospace', letterSpacing: '3px', marginBottom: '16px' }}>
                  {form.card || '•••• •••• •••• ••••'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: '#444', fontSize: '9px', letterSpacing: '1px' }}>CARDHOLDER</p>
                    <p style={{ color: '#aaa', fontSize: '13px' }}>{form.name || 'YOUR NAME'}</p>
                  </div>
                  <div>
                    <p style={{ color: '#444', fontSize: '9px', letterSpacing: '1px' }}>EXPIRES</p>
                    <p style={{ color: '#aaa', fontSize: '13px' }}>{form.expiry || 'MM/YY'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <input
                    type="text" placeholder="Card number"
                    value={form.card}
                    onChange={(e) => setForm({ ...form, card: formatCard(e.target.value) })}
                    maxLength={19}
                    className="w-full py-3 px-4 bg-gray-800/60 rounded-xl border border-gray-700/40 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition font-mono"
                  />
                  {errors.card && <p className="text-red-400 text-xs mt-1">{errors.card}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text" placeholder="MM/YY"
                      value={form.expiry}
                      onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                      maxLength={5}
                      className="w-full py-3 px-4 bg-gray-800/60 rounded-xl border border-gray-700/40 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition"
                    />
                    {errors.expiry && <p className="text-red-400 text-xs mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <input
                      type="text" placeholder="CVV"
                      value={form.cvv}
                      onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                      maxLength={3}
                      className="w-full py-3 px-4 bg-gray-800/60 rounded-xl border border-gray-700/40 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition"
                    />
                    {errors.cvv && <p className="text-red-400 text-xs mt-1">{errors.cvv}</p>}
                  </div>
                </div>

                <div>
                  <input
                    type="text" placeholder="Cardholder name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full py-3 px-4 bg-gray-800/60 rounded-xl border border-gray-700/40 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                <button
                  onClick={handlePay}
                  className="w-full py-4 rounded-xl bg-cyan-500 text-black font-bold text-base hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all duration-200 mt-2"
                >
                  Pay ₹99
                </button>

                <p className="text-center text-gray-600 text-xs">
                  Secured · Your card details are encrypted
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Processing */}
        {step === 'processing' && (
          <div className="flex flex-col items-center gap-6 py-20">
            <div className="w-16 h-16 border-4 border-t-cyan-500 border-gray-800 rounded-full animate-spin" />
            <p className="text-white font-semibold text-lg">Processing payment...</p>
            <p className="text-gray-500 text-sm">Please wait, do not close this tab</p>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="flex flex-col items-center gap-6 py-20 text-center">
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '36px',
            }}>
              👑
            </div>
            <h2 className="text-3xl font-black text-white">Welcome to Premium!</h2>
            <p className="text-gray-400 max-w-sm">Your subscription is active. Enjoy unlimited playlists and downloads!</p>
            <div className="flex flex-col gap-2 bg-gray-900/40 rounded-2xl p-5 border border-cyan-900/30 w-full max-w-xs">
              <p className="text-cyan-400 font-semibold text-sm mb-1">Active Features:</p>
              {['Unlimited playlists', 'Unlimited songs per playlist', 'Download songs'].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <span className="text-cyan-400 text-sm">✓</span>
                  <span className="text-gray-300 text-sm">{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 rounded-full bg-cyan-500 text-black font-bold hover:bg-cyan-400 hover:scale-105 transition-all duration-200"
            >
              Start Listening
            </button>
          </div>
        )}
      </div>
    </div>
  );
}