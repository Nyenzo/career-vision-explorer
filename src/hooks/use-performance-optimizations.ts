
import { useEffect } from 'react';

export const usePerformanceOptimizations = () => {
  useEffect(() => {
    // Optimize images
    const optimizeImages = () => {
      const images = document.querySelectorAll('img[loading="lazy"]');
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));
    };

    // Prefetch next page resources
    const prefetchNextPage = () => {
      const currentPath = window.location.pathname;
      let nextPath = '';

      if (currentPath === '/') nextPath = '/jobs';
      else if (currentPath === '/jobs') nextPath = '/profile';
      else if (currentPath === '/career-paths') nextPath = '/skills';

      if (nextPath) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = nextPath;
        document.head.appendChild(link);
      }
    };

    // Debounce scroll events
    let scrollTimeout: NodeJS.Timeout;
    const optimizedScrollHandler = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Actual scroll handling logic here
      }, 16); // ~60fps
    };

    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });

    optimizeImages();
    prefetchNextPage();

    return () => {
      window.removeEventListener('scroll', optimizedScrollHandler);
    };
  }, []);
};
