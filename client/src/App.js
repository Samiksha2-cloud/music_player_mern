import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import AuthCallback from './components/AuthCallback'
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './components/Home';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute check:', { 
    loading, 
    user: user?.email || 'no user' 
  });

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p>Loading protected content...</p>
      </div>
    );
  }

  // If no user after loading finished → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider> {}
    <Routes>
      {/* Public route - anyone can see login */}
      <Route path="/login" element={<Login />} />

      {/* Callback route - public, no protection */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected home route */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Home/>
            {/* Later replace this with your real <Home /> component */}
          </ProtectedRoute>
        }
      />
    </Routes>
    </AuthProvider>
  );
}

export default App;