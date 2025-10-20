import { useState, useEffect, useCallback, useRef } from 'react';

interface UseOptimizedScrollOptions {
  throttleMs?: number;
  passive?: boolean;
}

export const useOptimizedScroll = (options: UseOptimizedScrollOptions = {}) => {
  const { throttleMs = 16, passive = true } = options;
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const lastScrollTime = useRef(0);
  const rafId = useRef<number>();

  const updateScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = documentHeight > 0 ? Math.min(currentScrollY / documentHeight, 1) : 0;
    
    setScrollY(currentScrollY);
    setScrollProgress(progress);
  }, []);

  const throttledScroll = useCallback(() => {
    const now = Date.now();
    if (now - lastScrollTime.current < throttleMs) return;
    
    lastScrollTime.current = now;
    
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(updateScroll);
  }, [throttleMs, updateScroll]);

  useEffect(() => {
    // Initial scroll position
    updateScroll();
    
    window.addEventListener('scroll', throttledScroll, { passive });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [throttledScroll, passive, updateScroll]);

  return { scrollY, scrollProgress };
};




