import React from 'react';
import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NetworkErrorFallbackProps {
  error?: Error | null;
  onRetry?: () => void;
  message?: string;
}

export const NetworkErrorFallback: React.FC<NetworkErrorFallbackProps> = ({
  error,
  onRetry,
  message = "Unable to connect to the server"
}) => {
  const isOffline = !navigator.onLine;
  
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            {isOffline ? (
              <div className="bg-gray-100 p-4 rounded-full">
                <WifiOff className="h-12 w-12 text-gray-600" />
              </div>
            ) : (
              <div className="bg-orange-100 p-4 rounded-full">
                <AlertTriangle className="h-12 w-12 text-orange-600" />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {isOffline ? "You're Offline" : "Connection Error"}
            </h3>
            <p className="text-gray-600">
              {isOffline 
                ? "Please check your internet connection and try again." 
                : message}
            </p>
          </div>

          {error && process.env.NODE_ENV === 'development' && (
            <Alert variant="destructive" className="text-left">
              <AlertDescription className="font-mono text-xs">
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          {onRetry && (
            <Button 
              onClick={onRetry} 
              className="w-full sm:w-auto"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
