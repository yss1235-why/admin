import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/error/ErrorBoundary';
import ProtectedRoute from './components/routing/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginForm from './components/auth/LoginForm';
import HostManagement from './components/hosts/HostManagement';
import SubscriptionManagement from './components/subscriptions/SubscriptionManagement';
import SubscriptionHistory from './components/subscriptions/SubscriptionHistory';
import SystemSettings from './components/settings/SystemSettings';
import { initializeDatabase } from './utils/initializeDatabase';

const App: React.FC = () => {
  // Initialize database on app startup
  useEffect(() => {
    initializeDatabase().catch(error => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Routes remain unchanged */}
            <Route path="/login" element={<LoginForm />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route 
                index 
                element={<Navigate to="/dashboard/hosts" replace />} 
              />
              <Route path="hosts" element={<HostManagement />} />
              <Route path="subscriptions" element={<SubscriptionManagement />} />
              <Route path="subscription-history" element={<SubscriptionHistory />} />
              <Route path="settings" element={<SystemSettings />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route
              path="*"
              element={
                <div className="flex items-center justify-center min-h-screen bg-gray-100">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900">404</h1>
                    <p className="mt-2 text-lg text-gray-600">Page not found</p>
                    <button
                      onClick={() => window.location.href = '/#/dashboard'}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              }
            />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
