import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Alert } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, adminData, loading, error } = useAuth();
  const location = useLocation();

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-4 space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Handle authentication error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-4">
          <Alert variant="destructive">
            <div className="space-y-2">
              <h3 className="font-medium">Authentication Error</h3>
              <p className="text-sm text-gray-500">{error.message}</p>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but not an admin, show access denied
  if (!adminData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-4">
          <Alert variant="destructive">
            <div className="space-y-2">
              <h3 className="font-medium">Access Denied</h3>
              <p className="text-sm text-gray-500">
                You do not have permission to access the admin panel.
                Please contact your system administrator.
              </p>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;