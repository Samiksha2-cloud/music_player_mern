import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Home, Login } from './components';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthCallback from './components/AuthCallback';   

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log('ProtectedRoute - loading:', loading, 'user:', user?.email ?? user);
  
  // Wait until loading is complete
  if (loading || user === undefined) {
    return (
      <div className='w-screen h-screen flex items-center justify-center'>
        <p>Loading...</p>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log('PublicRoute - loading:', loading, 'user:', user?.email ?? user);
  
  // Wait until loading is complete
  if (loading || user === undefined) {
    return (
      <div className='w-screen h-screen flex items-center justify-center'>
        <p>Loading...</p>
      </div>
    );
  }
  
  return user ? <Navigate to="/" replace /> : children;
};

const AppContent = () => {
  return (
    <div className='w-screen h-screen bg-primary flex justify-center items-center'>
      <Routes>
        <Route 
          path='/login' 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route
          path="/Auth/callback"
          element={<AuthCallback />}
         />
        <Route 
          path='*' 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;