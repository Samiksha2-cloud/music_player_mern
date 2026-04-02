import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Login from './components/Login';
import AuthCallback from './components/AuthCallback';
import Home from './components/Home';
import OrbPage from './components/OrbPage';
import AdminDashboard from './components/AdminDashboard';
import AdminUpload from './components/AdminUpload';
import MoodPlaylistPage from './components/MoodPlaylistPage';
import ArtistPage from './components/ArtistPage';
import Premium from './components/Premium';
import MusicPlayer from './components/MusicPlayer';
import { StateProvider } from './context/Stateprovider';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* MusicPlayer is OUTSIDE Routes — never unmounts, audio never restarts */}
      {user && <MusicPlayer />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={user ? <Home /> : <Login />} />
          <Route path="/orb" element={user ? <OrbPage /> : <Login />} />
          <Route path="/admin" element={user ? <AdminDashboard /> : <Login />} />
          <Route path="/admin/upload" element={<AdminUpload />} />
          <Route path="/mood/:mood" element={user ? <MoodPlaylistPage /> : <Login />} />
          <Route path="/artist/:artistName" element={user ? <ArtistPage /> : <Login />} />
          <Route path="/premium" element={user ? <Premium /> : <Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <StateProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </StateProvider>
  );
}

export default App;