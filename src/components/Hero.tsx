import React, { useEffect, useState, useRef } from 'react';
import FlameCanvas from './FlameCanvas';

const Hero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollFade, setScrollFade] = useState(0); // 0: sin fade, 1: full fade
  const [curtainProgress, setCurtainProgress] = useState(0); // 0: cerrado, 1: abierto
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [videoTime, setVideoTime] = useState(0);
  const [diagonalAngle, setDiagonalAngle] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Efectos cinematográficos avanzados: parallax, curtain reveal y sincronización con video
  useEffect(() => {
    const handleScroll = () => {
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
    };
    
    // Sincronización con el video para efectos dinámicos
    const handleVideoTimeUpdate = () => {
      if (videoRef.current) {
        setVideoTime(videoRef.current.currentTime);
      }
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true } as any);
    window.addEventListener('resize', handleScroll);
    
    if (videoRef.current) {
      videoRef.current.addEventListener('timeupdate', handleVideoTimeUpdate);
    }
    
    return () => {
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
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pb-16 md:pb-24">
      {/* Video de fondo con parallax */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-75"
          src="/crunchy/Main-video.mov"
          autoPlay
          muted
          loop
          playsInline
          style={{
            transform: `translateY(${parallaxOffset}px) scale(1.1)`,
            filter: `brightness(${1 - scrollFade * 0.3}) contrast(${1 + scrollFade * 0.2})`
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
          <h1 className="relative z-50 font-black text-7xl sm:text-8xl md:text-8xl lg:text-9xl mb-6 sm:mb-8 leading-none tracking-wide px-4">
            <span 
              className="block font-['Bebas_Neue']"
              style={{
                background: 'linear-gradient(45deg, #FF0040, #FF6B00, #FFFF00, #FF0080)',
                backgroundSize: '400% 400%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: '#ffffff', // fallback
                animation: 'flameGradient 3s ease-in-out infinite'
              }}
            >
              Mi Gusto
            </span>
            <span className="block text-white font-['Bebas_Neue'] text-6xl sm:text-7xl md:text-6xl">×</span>
            <span 
              className="block font-['Bebas_Neue']"
              style={{
                background: 'linear-gradient(45deg, #FF0040, #FF6B00, #FFFF00, #FF0080)',
                backgroundSize: '400% 400%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: '#ffffff', // fallback
                animation: 'flameGradient 3s ease-in-out infinite'
              }}
            >
              DORITOS
            </span>
          </h1>

          {/* Subtitle - CON DEGRADADO - Optimizado para mobile */}
          <div className="mb-8 sm:mb-10 relative z-50 px-4">
            <h2 className="relative z-50 text-2xl sm:text-4xl md:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-wide leading-tight whitespace-nowrap">
              EXPERIENCIA <span 
                className="flame-fire"
                style={{
                  background: 'linear-gradient(45deg, #FF0040, #FF6B00, #FFFF00, #FF0080)',
                  backgroundSize: '400% 400%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: '#ffffff', // fallback
                  animation: 'flameGradient 2s ease-in-out infinite, fireFlicker 0.1s ease-in-out infinite alternate',
                  textShadow: `
                    0 0 5px rgba(255, 0, 64, 0.8),
                    0 0 10px rgba(255, 94, 0, 0.7),
                    0 0 15px rgba(255, 145, 0, 0.6),
                    0 0 20px rgba(255, 0, 128, 0.5),
                    0 0 30px rgba(255, 94, 0, 0.4),
                    0 0 40px rgba(255, 0, 64, 0.3)
                  `,
                  position: 'relative',
                  filter: 'drop-shadow(0 0 20px rgba(255, 94, 0, 0.6))',
                  transform: 'scale(1.02)',
                  zIndex: 10
                }}
              >
                FLAMIN' HOT
              </span>
            </h2>
            {/* Fuego saliendo desde el subtítulo - Optimizado para mobile */}
            <div className="pointer-events-none absolute inset-x-0 -bottom-1 h-12 sm:h-16 md:h-20">
              <FlameCanvas className="absolute inset-0" density={0.8} colorAlpha={0.8} shadowBlur={20} />
            </div>
            
            {/* Efecto de fuego adicional para FLAMIN' HOT - Optimizado para mobile */}
            <div 
              className="pointer-events-none absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255, 145, 0, 0.2) 0%, rgba(255, 0, 64, 0.15) 30%, transparent 70%)',
                filter: 'blur(6px)',
                animation: 'firePulse 1.5s ease-in-out infinite alternate',
                zIndex: 5
              }}
            />
          </div>

          {/* CTA Button - Tubito con efectos impresionantes */}
          <div className="relative flex flex-col items-center gap-4">
            <button 
              className="group relative transition-all duration-500 transform hover:scale-110 hover:rotate-3 focus:outline-none focus:ring-4 focus:ring-fuchsia-500/50 rounded-full"
              onClick={() => window.open('https://pedir.migusto.com.ar/index.php', '_blank')}
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