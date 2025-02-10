import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/error/ErrorBoundary';
import ProtectedRoute from './components/routing/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginForm from './components/auth/LoginForm';
import HostManagement from './components/hosts/HostManagement';
import SubscriptionManagement from './components/subscriptions/SubscriptionManagement';
import SubscriptionHistory from './components/subscriptions/SubscriptionHistory';
import SystemSettings from './components/settings/SystemSettings';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginForm />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard Index - Redirect to hosts */}
              <Route 
                index 
                element={<Navigate to="/dashboard/hosts" replace />} 
              />

              {/* Host Management */}
              <Route
                path="hosts"
                element={
                  <ErrorBoundary>
                    <HostManagement />
                  </ErrorBoundary>
                }
              />

              {/* Subscription Management */}
              <Route
                path="subscriptions"
                element={
                  <ErrorBoundary>
                    <SubscriptionManagement />
                  </ErrorBoundary>
                }
              />

              {/* Subscription History */}
              <Route
                path="subscription-history"
                element={
                  <ErrorBoundary>
                    <SubscriptionHistory />
                  </ErrorBoundary>
                }
              />

              {/* System Settings */}
              <Route
                path="settings"
                element={
                  <ErrorBoundary>
                    <SystemSettings />
                  </ErrorBoundary>
                }
              />
            </Route>

            {/* Root Redirect */}
            <Route 
              path="/" 
              element={<Navigate to="/dashboard" replace />} 
            />

            {/* 404 - Not Found */}
            <Route
              path="*"
              element={
                <div className="flex items-center justify-center min-h-screen bg-gray-100">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900">404</h1>
                    <p className="mt-2 text-lg text-gray-600">Page not found</p>
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;

// Initialize global error handling
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error });
  // Implement error logging service integration here
  return false;
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Implement error logging service integration here
});