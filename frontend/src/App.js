import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import VoiceStudio from './pages/VoiceStudio';
import FamilyTree from './pages/FamilyTree';
import ProfilePage from './pages/ProfilePage';
import MemoriesPage from './pages/MemoriesPage';
import MemoryDetail from './pages/MemoryDetail';
import ExportPage from './pages/ExportPage';
import SettingsPage from './pages/SettingsPage';
import DemoPage from './pages/DemoPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-emerald/10 animate-pulse flex items-center justify-center">
          <span className="text-emerald font-serif text-xl">H</span>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

// App Routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/voice-studio" element={
        <ProtectedRoute>
          <VoiceStudio />
        </ProtectedRoute>
      } />
      
      <Route path="/family-tree" element={
        <ProtectedRoute>
          <FamilyTree />
        </ProtectedRoute>
      } />
      
      <Route path="/profile/:memberId" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      
      <Route path="/memories" element={
        <ProtectedRoute>
          <MemoriesPage />
        </ProtectedRoute>
      } />
      
      <Route path="/memories/:memoryId" element={
        <ProtectedRoute>
          <MemoryDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/export/:memberId" element={
        <ProtectedRoute>
          <ExportPage />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-center" 
          richColors 
          toastOptions={{
            style: {
              fontFamily: 'Manrope, sans-serif',
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
