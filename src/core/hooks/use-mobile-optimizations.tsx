
import { useEffect } from 'react';

export const useMobileOptimizations = () => {
  useEffect(() => {
    // Prevent zoom on input focus (iOS)
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }

    // Handle safe area insets for mobile devices
    const handleSafeArea = () => {
      const root = document.documentElement;
      if (window.CSS && CSS.supports('padding-top: env(safe-area-inset-top)')) {
        root.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
        root.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
        root.style.setProperty('--safe-area-left', 'env(safe-area-inset-left)');
        root.style.setProperty('--safe-area-right', 'env(safe-area-inset-right)');
      }
    };

    handleSafeArea();
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', handleSafeArea);
    
    return () => {
      window.removeEventListener('orientationchange', handleSafeArea);
    };
  }, []);
};
