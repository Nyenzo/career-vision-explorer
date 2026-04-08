
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Simple preloading strategy - let Vite handle the heavy lifting
const preloadCriticalResources = () => {
  // Just preload the most critical components after a delay
  setTimeout(() => {
    // These will be loaded on-demand by React Router
    // No need for manual preloading that might cause warnings
  }, 100);
};

// Optimize font loading
const optimizeFonts = () => {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = 'https://fonts.googleapis.com';
  document.head.appendChild(link);

  const link2 = document.createElement('link');
  link2.rel = 'preconnect';
  link2.href = 'https://fonts.gstatic.com';
  link2.crossOrigin = 'anonymous';
  document.head.appendChild(link2);
};

// Service Worker registration for caching
const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => {
        console.log('SW registered');
      })
      .catch(() => {
        console.log('SW registration failed');
      });
  });
};

const root = createRoot(document.getElementById("root")!);

// Start optimizations immediately
optimizeFonts();
registerServiceWorker();

root.render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Start preloading after the main app has mounted
setTimeout(preloadCriticalResources, 50);
