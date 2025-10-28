import React, { useEffect, useState, useRef } from 'react';
import { useComponentAnalytics } from '../hooks/useComponentAnalytics';
import FlameCanvas from './FlameCanvas';
import { trackEvent } from '../analytics';

// 🔥 CONFIGURACIÓN DEL EFECTO DE FUEGO - FÁCIL DE MODIFICAR
const FIRE_EFFECT_CONFIG = {
  // Posición vertical del efecto (top)
  position: {
    mobile: '-top-16',     // -64px desde arriba (más sobre el logo)
    small: 'sm:-top-20',   // -80px desde arriba (más sobre el logo)
    medium: 'md:-top-28'   // -112px desde arriba (más sobre el logo)
  },
  
  // Ancho del efecto (el doble de ancho)
  width: {
    mobile: 'w-40',        // 160px de ancho (el doble de w-20)
    small: 'sm:w-48',      // 192px de ancho (el doble de w-24)
    medium: 'md:w-56'      // 224px de ancho (el doble de w-28)
  },
  
  // Altura del efecto
  height: {
    mobile: 'h-12',      // 48px de altura
    small: 'sm:h-16',    // 64px de altura
    medium: 'md:h-20'    // 80px de altura
  },
  
  // Configuración del FlameCanvas
  flameCanvas: {
    density: 0.8,
    colorAlpha: 0.8,
    shadowBlur: 20
  },
  
  // Forma del efecto (redondeado)
  shape: {
    borderRadius: 'rounded-full',  // Forma completamente redonda
    overflow: 'overflow-hidden'    // Para que el contenido respete los bordes redondeados
  }
};

const Hero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollFade, setScrollFade] = useState(0); // 0: sin fade, 1: full fade
  const [curtainProgress, setCurtainProgress] = useState(0); // 0: cerrado, 1: abierto
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [videoTime, setVideoTime] = useState(0);
  const [diagonalAngle, setDiagonalAngle] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useComponentAnalytics('Hero');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Efectos cinematográficos avanzados: parallax, curtain reveal y sincronización con video
  useEffect(() => {
    let rafId: number;
    let lastScrollTime = 0;
    const SCROLL_THROTTLE = 33; // ~30fps para mejor performance
    
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime < SCROLL_THROTTLE) return;
      lastScrollTime = now;
      
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const vh = window.innerHeight || 1;
        const y = window.scrollY || window.pageYOffset || 0;
        
        // Parallax: el video se mueve más lento que el scroll
        const parallaxFactor = 0.5;
        setParallaxOffset(y * parallaxFactor);
        
        // Curtain reveal: barra negra que sube desde abajo
        const curtainStart = vh * 0.3;
        const curtainEnd = vh * 0.8;
        const curtainRaw = (y - curtainStart) / Math.max(1, (curtainEnd - curtainStart));
        const curtainClamped = Math.max(0, Math.min(1, curtainRaw));
        setCurtainProgress(curtainClamped);
        
        // Fade del video con curva más suave
        const fadeStart = vh * 0.2;
        const fadeEnd = vh * 0.7;
        const fadeRaw = (y - fadeStart) / Math.max(1, (fadeEnd - fadeStart));
        const fadeClamped = Math.max(0, Math.min(1, fadeRaw));
        setScrollFade(fadeClamped);
      });
    };
    
    // Sincronización con el video para efectos dinámicos - OPTIMIZADO
    let videoUpdateId: number;
    const handleVideoTimeUpdate = () => {
      if (videoUpdateId) cancelAnimationFrame(videoUpdateId);
      videoUpdateId = requestAnimationFrame(() => {
        if (videoRef.current) {
          setVideoTime(videoRef.current.currentTime);
        }
      });
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true } as any);
    window.addEventListener('resize', handleScroll);
    
    if (videoRef.current) {
      videoRef.current.addEventListener('timeupdate', handleVideoTimeUpdate);
    }
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (videoUpdateId) cancelAnimationFrame(videoUpdateId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (videoRef.current) {
        videoRef.current.removeEventListener('timeupdate', handleVideoTimeUpdate);
      }
    };
  }, []);

  // Calcular el ángulo de la diagonal del viewport para alinear las cintas con las esquinas
  useEffect(() => {
    const computeAngle = () => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const deg = (Math.atan2(h, w) * 180) / Math.PI;
      setDiagonalAngle(deg);
    };
    computeAngle();
    window.addEventListener('resize', computeAngle);
    return () => window.removeEventListener('resize', computeAngle);
  }, []);

  // Offsets (en vh) para posicionar cada cinta con precisión
  const ribbonOffsetLeftVh = 52;   // franja que sale desde la izquierda
  const ribbonOffsetRightVh = 36;  // franja que sale desde la derecha (ajustable)
  const showMarquees = false; // bandera para ocultar/mostrar las franjas

  return (
    <section ref={heroRef as any} data-section="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pb-16 md:pb-24">
      {/* Video de fondo con parallax */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-75"
          src="/crunchy/Main-video.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{
            transform: `translateY(${parallaxOffset}px) scale(1.1)`,
            filter: `brightness(${1 - scrollFade * 0.3}) contrast(${1 + scrollFade * 0.2})`,
            willChange: 'transform, filter'
          }}
        />
        
        {/* Viñeta cinematográfica dinámica */}
        <div
          className="pointer-events-none absolute inset-0 transition-all duration-500"
          style={{
            background: `radial-gradient(120% 80% at 50% 20%, 
              rgba(0,0,0,${0.0 + scrollFade * 0.3}), 
              rgba(0,0,0,${0.25 + scrollFade * 0.4}) 55%, 
              rgba(0,0,0,${0.45 + scrollFade * 0.5}) 85%)`
          }}
        />
        
        {/* Overlay dinámico que cambia con el tiempo del video */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-5"
          style={{
            background: `linear-gradient(135deg, 
              rgba(255,0,128,${0.05 + Math.sin(videoTime * 2) * 0.02}) 0%, 
              rgba(147,51,234,${0.03 + Math.cos(videoTime * 1.5) * 0.01}) 50%, 
              rgba(255,94,0,${0.04 + Math.sin(videoTime * 3) * 0.015}) 100%)`
          }}
        />
        
        {/* Curtain reveal: barra negra que sube desde abajo */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 transition-all duration-700 ease-out"
          style={{
            height: `${curtainProgress * 100}%`,
            background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 70%, transparent 100%)',
            transform: `translateY(${curtainProgress * 20}px)`
          }}
        />
        
        {/* Overlay de fade por scroll con gradiente dinámico */}
        <div
          className="pointer-events-none absolute inset-0 transition-all duration-500"
          style={{
            background: `linear-gradient(180deg, 
              transparent 0%, 
              rgba(0,0,0,${scrollFade * 0.3}) 30%, 
              rgba(0,0,0,${scrollFade * 0.7}) 70%, 
              rgba(0,0,0,${scrollFade * 0.9}) 100%)`
          }}
        />
        
        {/* Gradiente inferior mejorado para transición suave */}
        <div 
          className="pointer-events-none absolute inset-x-0 bottom-0 transition-all duration-500"
          style={{
            height: '60vh',
            background: `linear-gradient(to top, 
              rgba(0,0,0,1) 0%, 
              rgba(0,0,0,0.9) 20%, 
              rgba(0,0,0,0.6) 50%, 
              rgba(0,0,0,0.2) 80%, 
              transparent 100%)`
          }}
        />
        
        {/* Efecto de partículas sutiles que se mueven con el scroll */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at ${20 + parallaxOffset * 0.1}% ${30 + parallaxOffset * 0.05}%, rgba(255,0,128,0.1) 0%, transparent 50%),
                             radial-gradient(circle at ${80 - parallaxOffset * 0.1}% ${70 - parallaxOffset * 0.05}%, rgba(147,51,234,0.08) 0%, transparent 50%)`
          }}
        />
      </div>
      {/* Sin overlays: el video queda limpio, sin viñeta ni fades */}

      {/* Main Content con parallax */}
      <div 
        className="relative z-10 text-center px-4 max-w-6xl mx-auto transition-transform duration-75"
        style={{
          transform: `translateY(${-parallaxOffset * 0.3}px)`
        }}
      >
        <div className={`transition-all duration-1000 ${isLoaded ? 'fade-in-up' : 'opacity-0 translate-y-10'}`}>

          {/* Main Title - CON DEGRADADO - Optimizado para mobile */}
          <div className="relative z-50 mb-6 sm:mb-8 px-4">
            {/* Logo Mi Gusto - EFECTOS ÉPICOS OPTIMIZADOS */}
            <div className="relative mb-4">
              {/* Efectos de fuego removidos por solicitud de marketing */}

              {/* Logo principal optimizado */}
              <img
                src="/crunchy/Logo Mi Gusto 2025.png"
                alt="Mi Gusto"
                className="block mx-auto h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 w-auto relative z-10"
                style={{
                  position: 'relative',
                  zIndex: 10
                }}
              />
            </div>
            {/* Logo FlaminHot */}
            <img
              src="/crunchy/FlaminHotLogo.png"
              alt="Flamin' Hot"
              className="block mx-auto h-14 sm:h-20 md:h-24 lg:h-28 w-auto"
              style={{
                position: 'relative',
                zIndex: 10
              }}
            />
          </div>

          {/* Efectos de fuego removidos por solicitud de marketing */}

          {/* CTA Button - Tubito con efectos impresionantes */}
          <div className="relative flex flex-col items-center gap-4">
            <button 
              className="group relative focus:outline-none rounded-full transition-transform duration-300 hover:scale-105 active:scale-95"
              onClick={() => { 
                trackEvent('select_promotion', { promotion_id: 'hero_cta', promotion_name: 'Hero CTA Descubrir', creative_name: 'Tubito', location_id: 'hero' });
                // Scroll suave a la sección del contador
                const countdownSection = document.getElementById('countdown-section');
                if (countdownSection) {
                  countdownSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }}
            >
              {/* Efectos removidos por solicitud de marketing */}

              {/* Imagen principal del Tubito - Optimizada para mobile (ligeramente más grande) */}
              <div className="relative z-10">
                <img 
                  src="/crunchy/TubitoMecha.png" 
                  alt="Descubrir Ahora" 
                  className="w-48 h-48 sm:w-48 sm:h-48 md:w-64 md:h-64"
                  style={{ 
                    cursor: 'pointer'
                  }}
                  title="Descubrir Ahora"
                />
                
                {/* Efectos de resplandor removidos por solicitud de marketing */}

                {/* Texto con efectos flame - Optimizado para mobile */}
                <span className="absolute text-white font-bold text-lg sm:text-xl md:text-3xl tracking-tight whitespace-nowrap pointer-events-none font-['Bebas_Neue'] z-50 flame-fire"
                      style={{
                        top: '55%',
                        left: '15%',
                        right: '15%',
                        background: 'linear-gradient(45deg, #FF0040, #FF6B00, #FFFF00, #FF0080)',
                        backgroundSize: '400% 400%',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        color: '#ffffff',
                        animation: 'flameGradient 2s ease-in-out infinite, fireFlicker 0.1s ease-in-out infinite alternate',
                        textShadow: `
                          0 0 5px rgba(255, 0, 64, 0.8),
                          0 0 10px rgba(255, 94, 0, 0.7),
                          0 0 15px rgba(255, 145, 0, 0.6),
                          0 0 20px rgba(255, 0, 128, 0.5),
                          0 0 30px rgba(255, 94, 0, 0.4),
                          0 0 40px rgba(255, 0, 64, 0.3)
                        `,
                        position: 'absolute',
                        filter: 'drop-shadow(0 0 20px rgba(255, 94, 0, 0.6))',
                        transform: 'translateY(-50%) rotate(-25deg)',
                        lineHeight: '2.5rem',
                        letterSpacing: '0.05em',
                        zIndex: 10,
                        textAlign: 'center'
                      }}
                >
                  DESCUBRILA
                </span>
              </div>


              {/* Efectos de ondas removidos por solicitud de marketing */}
            </button>
          </div>
        </div>
      </div>

      {/* Marquees diagonales (ocultos temporalmente con showMarquees) */}
      {showMarquees && (
        <>
          {/* Cinta 1: anclada a esquina inferior izquierda → superior derecha */}
          <div
            className="pointer-events-none absolute z-[5] will-change-transform"
            style={{
              left: 0,
              bottom: 0,
              transformOrigin: 'left bottom',
              transform: `translateY(-${ribbonOffsetLeftVh}vh) rotate(${-diagonalAngle}deg)`,
              width: '220vw'
            }}
          >
            <div className="diagonal-marquee" style={{ ['--marquee-duration' as any]: '14s', ['--marquee-shift' as any]: '100%' }}>
              <div className="marquee-track reverse">
                {/* Duplicación para loop infinito */}
                <div className="marquee-content border-2 border-white bg-black/80">
                  <span className="text-white text-lg md:text-2xl tracking-[0.25em] font-extrabold">
                    EXPERIENCIA DE VERDAD • EXPERIENCIA DE VERDAD • EXPERIENCIA DE VERDAD • EXPERIENCIA DE VERDAD •
                  </span>
                </div>
                <div className="marquee-content border-2 border-white bg-black/80">
                  <span className="text-white text-lg md:text-2xl tracking-[0.25em] font-extrabold">
                    EXPERIENCIA DE VERDAD • EXPERIENCIA DE VERDAD • EXPERIENCIA DE VERDAD • EXPERIENCIA DE VERDAD •
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cinta 2: igual a la primera, pero saliendo desde la derecha (anclada a esquina superior derecha) */}
          <div
            className="pointer-events-none absolute z-[4] will-change-transform"
            style={{
              right: 0,
              top: 0,
              transformOrigin: 'right top',
              transform: `translateY(${ribbonOffsetRightVh}vh) rotate(${-diagonalAngle}deg)`,
              width: '220vw'
            }}
          >
            <div className="diagonal-marquee" style={{ ['--marquee-duration' as any]: '16s', ['--marquee-shift' as any]: '100%' }}>
              <div className="marquee-track reverse">
                <div className="marquee-content border-2 border-white bg-black/80">
                  <span className="text-white text-lg md:text-2xl tracking-[0.25em] font-extrabold">
                    EXPERIENCIA DE VERDAD • EXPERIENCIA DE VERDAD • EXPERIENCIA DE VERDAD • EXPERIENCIA DE VERDAD •
                  </span>
                </div>
                <div className="marquee-content border-2 border-white bg-black/80">
                  <span className="text-white text-lg md:text-2xl tracking-[0.25em] font-extrabold">
                    EXPERIENCIA DE VERDAD • EXPERIENCIA DE VERDAD • EXPERIENCIA DE VERDAD • EXPERIENCIA DE VERDAD •
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Floating Product Mockup */}
      <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block">
        <div className="floating">
          <div className="w-64 h-64 bg-gradient-to-br from-fuchsia-500/20 to-purple-600/20 rounded-full blur-3xl pulse-glow" />
        </div>
      </div>

    </section>
  );
};

export default Hero;