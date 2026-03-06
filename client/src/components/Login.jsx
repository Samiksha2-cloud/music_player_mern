import React from 'react';
import { supabase } from '../config/supabase.config';
import riffLogo from '../assets/riff-logo.png';  // your logo

export default function Login() {
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* 3D Tilt Card Wrapper */}
      <div
        className="w-full max-w-md perspective-1000"
        style={{ perspective: '1000px' }} // enables 3D space
      >
        <div
          className="relative bg-[#0a0a0a] rounded-2xl p-10 md:p-14 shadow-2xl border border-gray-800 transform transition-all duration-500hover:scale-102 hover:shadow-[0_35px_60px_-15px_rgba(59,130,246,0.4)] group prespective-1000"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.4s ease-out, box-shadow 0.4s ease-out'
          }}
        >
          {/* Subtle background glow for 3D feel */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-indigo-900/10 to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Logo with blue glow circle */}
          <div className="relative flex justify-center mb-8 z-10">
            <div className="relative">
              {/* Glow ring behind logo */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-black-500/40 to-black blur-xl opacity-70 animate-pulse"></div>
              {/* Logo itself */}
              <img
                src={riffLogo}
                alt="Riff Logo"
                className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-black shadow-xl shadow-cyan-500/40 z-10"
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 z-10 relative">
            Log in to Riff
          </h1>

          {/* Tagline */}
          <p className="text-gray-400 text-center mb-10 text-lg z-10 relative">
            Your personal music world awaits
          </p>

          {/* Google Button */}
          <button
           onClick={loginWithGoogle}
           className="w-full flex items-center justify-center gap-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-6 px-10 rounded-full text-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 transform hover:scale-102"
>
           <svg className="w-8 h-8 md:w-9 md:h-9" viewBox="0 0 24 24">
            <path
              fill="#ffffff"
              d="M12.545,10.239v3.821h9.43c-0.383,2.541-1.437,4.704-3.323,6.608l-0.002-0.002l-0.001,0.001c-1.886,1.904-4.575,3.058-7.104,3.058c-5.797,0-10.5-4.703-10.5-10.5c0-5.797,4.703-10.5,10.5-10.5c3.078,0,5.922,1.125,8.051,2.972l-3.272,3.272c-1.482-1.482-3.595-2.4-5.779-2.4c-4.686,0-8.5,3.814-8.5,8.5c0,4.686,3.814,8.5,8.5,8.5c2.184,0,4.297-0.918,5.779-2.4l3.272,3.272c-2.129,1.847-4.973,2.972-8.051,2.972c-5.797,0-10.5-4.703-10.5-10.5C1.545,10.239,6.248,5.536,12.545,5.536z"
            />
           </svg>
            Continue with Google
        </button>
          {/* Legal text */}
          <p className="mt-12 text-center text-sm text-gray-500 z-10 relative">
            By continuing, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}