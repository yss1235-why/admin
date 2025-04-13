import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ref, set } from 'firebase/database';
import { database, ADMIN_UID } from '../../config/firebase.config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // Helper function to ensure admin record exists
  const ensureAdminExists = async () => {
    try {
      // Create admin record directly - will be allowed if user UID matches ADMIN_UID
      await set(ref(database, `admins/${ADMIN_UID}`), {
        username: email.split('@')[0] || 'admin',
        role: 'admin',
        lastLogin: Date.now()
      });
      console.log('Admin record created/updated successfully');
    } catch (error) {
      console.log('Failed to create/update admin record:', error);
      // Continue anyway - verification will be attempted in AuthContext
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      // Ensure admin record exists first
      await ensureAdminExists();
      
      // Then attempt login
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error: any) {
      setLoginError(
        error.message || 'Failed to sign in. Please check your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // The rest of the component remains unchanged
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;