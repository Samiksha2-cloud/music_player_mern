import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Login from './components/Login';
import AuthCallback from './components/AuthCallback';
import Home from './components/Home';
import Musics from './components/Musics';
import { StateProvider } from './context/Stateprovider';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminUpload from './components/AdminUpload';

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
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={user ? <Home /> : <Login />} />
        <Route path="/musics" element={user ? <Musics /> : <Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/admin/upload" element={<AdminUpload />} />
      </Routes>
    </AnimatePresence>
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
