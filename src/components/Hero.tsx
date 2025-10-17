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
              {/* Efecto de fuego principal optimizado */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="w-40 h-20 sm:w-48 sm:h-24 md:w-56 md:h-28 lg:w-64 lg:h-32 xl:w-72 xl:h-36 rounded-full"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(255, 0, 0, 0.5) 0%, rgba(255, 94, 0, 0.4) 20%, rgba(255, 145, 0, 0.3) 40%, rgba(255, 200, 0, 0.2) 60%, transparent 80%)',
                    filter: 'blur(12px)',
                    animation: 'optimizedFireGlow 2s ease-in-out infinite alternate',
                    willChange: 'opacity, filter, transform',
                    zIndex: 1
                  }}
                />
                
                {/* Núcleo de fuego optimizado */}
                <div 
                  className="absolute w-28 h-14 sm:w-32 sm:h-16 md:w-36 md:h-18 lg:w-40 lg:h-20 xl:w-44 xl:h-22 rounded-full"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(255, 0, 0, 0.7) 0%, rgba(255, 94, 0, 0.6) 30%, rgba(255, 145, 0, 0.4) 60%, transparent 80%)',
                    filter: 'blur(8px)',
                    animation: 'optimizedFireCore 1.5s ease-in-out infinite alternate',
                    willChange: 'opacity, filter',
                    zIndex: 2
                  }}
                />
              </div>

              {/* Solo 2 partículas optimizadas */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 100, 0, 0.8) 0%, transparent 70%)',
                    left: '25%',
                    top: '35%',
                    animation: 'optimizedParticle1 2.5s ease-in-out infinite',
                    willChange: 'transform, opacity',
                    zIndex: 3
                  }}
                />
                <div 
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 200, 0, 0.8) 0%, transparent 70%)',
                    right: '30%',
                    bottom: '30%',
                    animation: 'optimizedParticle2 2.8s ease-in-out infinite',
                    willChange: 'transform, opacity',
                    zIndex: 3
                  }}
                />
              </div>

              {/* Logo principal optimizado */}
              <img
                src="/crunchy/Logo Mi Gusto 2025.png"
                alt="Mi Gusto"
                className="block mx-auto h-28 sm:h-32 md:h-40 lg:h-48 xl:h-56 w-auto relative z-10"
                style={{
                  filter: `
                    drop-shadow(0 0 20px rgba(255, 0, 0, 0.8))
                    drop-shadow(0 0 35px rgba(255, 94, 0, 0.6))
                    drop-shadow(0 0 50px rgba(255, 145, 0, 0.4))
                  `,
                  animation: 'optimizedLogoGlow 2s ease-in-out infinite alternate',
                  transform: 'scale(1.05) translateZ(0)',
                  willChange: 'filter, transform',
                  position: 'relative',
                  zIndex: 10
                }}
              />
            </div>
            {/* Logo FlaminHot */}
            <img
              src="/crunchy/FlaminHotLogo.png"
              alt="Flamin' Hot"
              className="block mx-auto h-16 sm:h-20 md:h-24 lg:h-28 w-auto"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(255, 94, 0, 0.6)) drop-shadow(0 0 30px rgba(255, 145, 0, 0.4)) drop-shadow(0 0 40px rgba(255, 0, 64, 0.3))',
                animation: 'flameGradient 2s ease-in-out infinite, fireFlicker 0.1s ease-in-out infinite alternate',
                transform: 'scale(1.02)',
                position: 'relative',
                zIndex: 10
              }}
            />
          </div>

          {/* Fuego saliendo desde el logo FlaminHot - Optimizado para mobile */}
          <div className="mb-8 sm:mb-10 relative z-50 px-4">
            <div className={`pointer-events-none absolute ${FIRE_EFFECT_CONFIG.width.mobile} ${FIRE_EFFECT_CONFIG.width.small} ${FIRE_EFFECT_CONFIG.width.medium} ${FIRE_EFFECT_CONFIG.position.mobile} ${FIRE_EFFECT_CONFIG.position.small} ${FIRE_EFFECT_CONFIG.position.medium} ${FIRE_EFFECT_CONFIG.height.mobile} ${FIRE_EFFECT_CONFIG.height.small} ${FIRE_EFFECT_CONFIG.height.medium} ${FIRE_EFFECT_CONFIG.shape.borderRadius} ${FIRE_EFFECT_CONFIG.shape.overflow} left-1/2 transform -translate-x-1/2`}>
              <FlameCanvas 
                className="absolute inset-0" 
                density={FIRE_EFFECT_CONFIG.flameCanvas.density} 
                colorAlpha={FIRE_EFFECT_CONFIG.flameCanvas.colorAlpha} 
                shadowBlur={FIRE_EFFECT_CONFIG.flameCanvas.shadowBlur} 
              />
            </div>
            
            {/* Efecto de fuego adicional para el logo FlaminHot - Optimizado para mobile */}
            <div 
              className={`pointer-events-none absolute ${FIRE_EFFECT_CONFIG.width.mobile} ${FIRE_EFFECT_CONFIG.width.small} ${FIRE_EFFECT_CONFIG.width.medium} ${FIRE_EFFECT_CONFIG.position.mobile} ${FIRE_EFFECT_CONFIG.position.small} ${FIRE_EFFECT_CONFIG.position.medium} ${FIRE_EFFECT_CONFIG.height.mobile} ${FIRE_EFFECT_CONFIG.height.small} ${FIRE_EFFECT_CONFIG.height.medium} ${FIRE_EFFECT_CONFIG.shape.borderRadius} ${FIRE_EFFECT_CONFIG.shape.overflow} left-1/2 transform -translate-x-1/2`}
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255, 145, 0, 0.3) 0%, rgba(255, 94, 0, 0.2) 20%, rgba(255, 0, 64, 0.1) 50%, rgba(255, 145, 0, 0.05) 70%, transparent 85%)',
                filter: 'blur(8px)',
                animation: 'firePulse 1.5s ease-in-out infinite alternate',
                zIndex: 5
              }}
            />
          </div>

          {/* CTA Button - Tubito con efectos impresionantes */}
          <div className="relative flex flex-col items-center gap-4">
            <a 
              className="group relative transition-all duration-500 transform hover:scale-110 hover:rotate-3 focus:outline-none rounded-full"
              href="https://pedir.migusto.com.ar/index.php"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { trackEvent('select_promotion', { promotion_id: 'hero_cta', promotion_name: 'Hero CTA Descubrir', creative_name: 'Tubito', location_id: 'hero' }); }}
            >
              {/* Efectos de fondo muy reducidos */}
              <div className="absolute inset-0 -m-2 rounded-full opacity-0 group-hover:opacity-30 transition-all duration-500">
                {/* Glow muy sutil */}
                <div className="absolute inset-0 rounded-full blur-md" 
                     style={{
                       background: 'radial-gradient(circle, rgba(255,0,128,0.08) 0%, rgba(255,0,64,0.05) 40%, transparent 70%)'
                     }}
                />
              </div>

              {/* Imagen principal del Tubito - Optimizada para mobile (ligeramente más grande) */}
              <div className="relative z-10">
                <img 
                  src="/crunchy/Tubito.png" 
                  alt="Descubrir Ahora" 
                  className="w-48 h-48 sm:w-48 sm:h-48 md:w-64 md:h-64 transition-all duration-500 group-hover:brightness-110 group-hover:contrast-110 group-hover:saturate-110"
                  style={{ 
                    filter: `
                      brightness(1.1) 
                      contrast(1.2) 
                      saturate(1.2)
                      drop-shadow(0 0 15px rgba(255,0,64,0.4))
                      drop-shadow(0 0 25px rgba(255,94,0,0.3))
                      drop-shadow(0 0 35px rgba(255,0,128,0.2))
                    `,
                    cursor: 'pointer'
                  }}
                  title="Descubrir Ahora"
                />
                
                {/* Efecto de resplandor interno reducido */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-70 transition-opacity duration-500"
                     style={{
                       background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,0,64,0.2) 50%, transparent 70%)',
                       filter: 'blur(6px)'
                     }}
                />

                {/* Texto posicionado más a la izquierda y más grande - Optimizado para mobile */}
                <span className="absolute text-white font-bold text-lg sm:text-xl md:text-3xl tracking-tight whitespace-nowrap pointer-events-none transition-all duration-300 group-hover:scale-110 font-['Bebas_Neue'] z-50 flame-fire"
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


              {/* Efecto de ondas concéntricas al hacer hover */}
              <div className="absolute inset-0 -m-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 border-2 border-fuchsia-500/30 rounded-full animate-ping" 
                     style={{ animationDuration: '2s' }}
                />
                <div className="absolute inset-0 border border-orange-400/20 rounded-full animate-ping" 
                     style={{ animationDelay: '0.5s', animationDuration: '2s' }}
                />
              </div>
            </a>
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