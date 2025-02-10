import React, { Component, ErrorInfo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { RefreshCcw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to your error tracking service
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // Implementation for error logging
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleNavigateHome = () => {
    window.location.href = '/dashboard';
  };

  private getErrorMessage = (error: Error | null): string => {
    if (!error) return 'An unknown error occurred';

    switch (error.name) {
      case 'AuthError':
        return 'Authentication error. Please try logging in again.';
      case 'DatabaseError':
        return 'Database operation failed. Please try again later.';
      case 'NetworkError':
        return 'Network connection issue. Please check your internet connection.';
      default:
        return error.message || 'An unexpected error occurred';
    }
  };

  private getErrorAction = (error: Error | null): string => {
    if (!error) return 'Please try again or contact support if the problem persists.';

    switch (error.name) {
      case 'AuthError':
        return 'Please log out and log back in to resolve this issue.';
      case 'DatabaseError':
        return 'Our team has been notified. Please try again in a few minutes.';
      case 'NetworkError':
        return 'Check your internet connection and reload the page.';
      default:
        return 'Try refreshing the page or contact support if the issue continues.';
    }
  };

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.getErrorMessage(this.state.error);
      const errorAction = this.getErrorAction(this.state.error);

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <CardTitle>System Error</CardTitle>
              </div>
              <CardDescription>
                We've encountered an unexpected issue
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="mt-2">
                  {errorMessage}
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Recommended Action</h3>
                <p className="text-gray-600">
                  {errorAction}
                </p>
              </div>

              {this.state.errorInfo && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Technical Details</h3>
                  <pre className="text-sm text-gray-600 overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={this.handleNavigateHome}
              >
                <Home className="w-4 h-4 mr-2" />
                Return to Dashboard
              </Button>
              <Button
                onClick={this.handleReload}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Higher-order component for error boundary wrapping
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return class WithErrorBoundary extends Component<P> {
    render() {
      return (
        <ErrorBoundary>
          <WrappedComponent {...this.props} />
        </ErrorBoundary>
      );
    }
  };
};