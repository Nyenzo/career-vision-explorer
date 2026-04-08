import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/components/ui/sonner';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CallbackSkeleton } from '@/components/ui/skeleton-loaders';

let oAuthCallbackStatus: 'idle' | 'processing' | 'done' = 'idle';

const OAuthCallback = () => {
  const { handleOAuthCallback } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (oAuthCallbackStatus === 'processing' || oAuthCallbackStatus === 'done') {
      return;
    }

    const processCallback = async () => {
      oAuthCallbackStatus = 'processing';

      try {
        await handleOAuthCallback();
        oAuthCallbackStatus = 'done';
        // The handleOAuthCallback function will handle the redirect
      } catch (error: any) {
        oAuthCallbackStatus = 'idle';
        console.error('OAuth callback error:', error);
        setError(error.message || 'Failed to complete authentication');
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [handleOAuthCallback]);

  if (isProcessing) {
    return <CallbackSkeleton />;
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-12">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-red-600">
                Authentication Failed
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-career-blue text-white px-4 py-2 rounded-md hover:bg-career-blue/90 transition-colors"
              >
                Return to Login
              </button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
};

export default OAuthCallback;
