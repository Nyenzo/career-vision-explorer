import { useEffect } from 'react';

interface PreloadOptions {
  preloadImages?: string[];
  preloadRoutes?: string[];
  prefetchOnHover?: boolean;
}

export const usePreload = (options: PreloadOptions = {}) => {
  const { preloadImages = [], preloadRoutes = [], prefetchOnHover = true } = options;

  useEffect(() => {
    // Preload critical images
    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    // Preload critical routes
    preloadRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });

    // Add hover prefetch listeners
    if (prefetchOnHover) {
      const links = document.querySelectorAll('a[href^="/"]');
      const prefetchedRoutes = new Set<string>();

      const handleMouseEnter = (e: Event) => {
        const target = e.target as HTMLAnchorElement;
        const href = target.getAttribute('href');
        
        if (href && !prefetchedRoutes.has(href)) {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = href;
          document.head.appendChild(link);
          prefetchedRoutes.add(href);
        }
      };

      links.forEach(link => {
        link.addEventListener('mouseenter', handleMouseEnter);
      });

      return () => {
        links.forEach(link => {
          link.removeEventListener('mouseenter', handleMouseEnter);
        });
      };
    }
  }, [preloadImages, preloadRoutes, prefetchOnHover]);
};