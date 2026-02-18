import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '../config/supabase.config';

const Login = () => {
  
  // In Login.jsx
const loginWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',          // forces fresh consent → helps debug
        },
      },
    });
    if (error) console.error('OAuth start error:', error.message);
  } catch (err) {
    console.error('Login crash:', err);
  }
};

  return (
    <div className='relative w-screen h-screen'>
      <div className='absolute inset-0 bg-darkOverlay flex items-center justify-center p-4'>
        <div className='w-full md:w-375 p-10 bg-lightOverlay shadow-2xl rounded-md backdrop-blur-md flex-col items-center justify-center'>
          <div 
            className='flex items-center justify-center gap-4 px-2 py-4 rounded-md bg-cardOverlay cursor-pointer hover:bg-card hover:shadow-md duration-100 ease-in-out transition-all'
            onClick={loginWithGoogle}
          >
            <FcGoogle className='text-xl'/>
            Sign in with Google
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;