import React, { useState, useEffect } from 'react';
import { useComponentAnalytics } from '../hooks/useComponentAnalytics';
import { trackEvent } from '../analytics';

const Navbar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navRef = useComponentAnalytics('Navbar');
  const logoSrc = '/crunchy/Logo%20Mi%20Gusto%202025.png';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Mostrar navbar cuando se hace scroll hacia abajo desde la parte superior
      if (currentScrollY > 100) { // Aparece después de 100px de scroll
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle del scroll para mejor performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [lastScrollY]);

  return (
    <nav
      ref={navRef as any}
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-center bg-black/60 backdrop-blur-md supports-[backdrop-filter]:bg-black/50 border-b border-white/10 transition-all duration-300 ease-in-out ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-full opacity-0'
      }`}
      aria-label="Barra de navegación"
    >
      <a
        href="https://www.migusto.com.ar/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ir a Mi Gusto"
        className="inline-flex items-center justify-center"
        onClick={() => trackEvent('link_click', { link_url: 'https://www.migusto.com.ar/', link_domain: 'migusto.com.ar', location: 'navbar', outbound: true })}
      >
        <img
          src={logoSrc}
          alt="Mi Gusto"
          className="h-8 md:h-10 w-auto select-none transition-transform duration-200 ease-out hover:scale-110"
          draggable={false}
        />
      </a>
    </nav>
  );
};

export default Navbar;


