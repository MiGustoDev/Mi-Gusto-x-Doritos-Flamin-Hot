import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import Reveal from './Reveal';
import SteamOverlay from './SteamOverlay';
import FlameCanvas from './FlameCanvas';
import ConfettiFromLogo from './ConfettiFromLogo';
import LazyModel3D from './LazyModel3D';
import AnimatedLinesBackground from './AnimatedLinesBackground';
import { trackEvent } from '../analytics';
// import { Bell } from 'lucide-react';
import { useComponentAnalytics } from '../hooks/useComponentAnalytics';

// CountdownItem movido a CountdownSection.tsx

const ProductShowcase: React.FC = () => {
  const sectionRef = useComponentAnalytics('ProductShowcase') as any;
  // epicRef movido a CountdownSection.tsx
  const logoRef = useRef<HTMLDivElement>(null);
  const ingredientsRef = useRef<HTMLImageElement>(null);
  const ingredientsRef3D = useRef<HTMLImageElement>(null); // Referencia separada para la vista 3D
  const chipsExplosionRef = useRef<HTMLImageElement>(null);
  
  // Constantes movidas a CountdownSection.tsx
  
  // Estados del contador movidos a CountdownSection.tsx
  const [logoRevealed, setLogoRevealed] = useState(false);
  const [logoFlash, setLogoFlash] = useState(false);
  // Animación de caída + trigger de explosión
  const [logoDropEnded, setLogoDropEnded] = useState(false);
  const [explosionTrigger, setExplosionTrigger] = useState(false);
  // Estado para controlar la visibilidad del modelo 3D
  const [show3DModel, setShow3DModel] = useState(false);
  // Elimina toda la lógica de showConfetti en useEffect, IntersectionObserver, y renders

  // useEffect del contador movido a CountdownSection.tsx

  // Intersection Observer para el logo reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !logoRevealed) {
            setLogoRevealed(true);
            // Reset confetti después de 3 segundos
            // setTimeout(() => setShowConfetti(false), 3000); // Eliminado
          }
        });
      },
      {
        threshold: 0.3, // Se dispara cuando el 30% del logo es visible
        rootMargin: '0px 0px -50px 0px' // Se dispara un poco antes de que esté completamente visible
      }
    );

    if (logoRef.current) {
      observer.observe(logoRef.current);
    }

    return () => {
      if (logoRef.current) {
        observer.unobserve(logoRef.current);
      }
    };
  }, [logoRevealed]);

  // Intersection Observer para el efecto de ingredientes
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    const elements = [ingredientsRef.current, ingredientsRef3D.current].filter(Boolean);
    elements.forEach(element => {
      if (element) observer.observe(element);
    });

    return () => {
      elements.forEach(element => {
        if (element) observer.unobserve(element);
      });
    };
  }, [show3DModel]); // Agregar show3DModel como dependencia

  // Intersection Observer para el efecto de explosión de chips
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (chipsExplosionRef.current) {
      observer.observe(chipsExplosionRef.current);
    }

    return () => {
      if (chipsExplosionRef.current) {
        observer.unobserve(chipsExplosionRef.current);
      }
    };
  }, []);

  // Función para el click del logo
  const handleLogoClick = useCallback(() => {
    setLogoFlash(true);
    setTimeout(() => setLogoFlash(false), 2000); // Reset después de 2 segundos
    trackEvent('select_promotion', { promotion_id: 'product_logo', promotion_name: 'Logo Empanada', location_id: 'product_showcase' });
  }, []);

  // Función para toggle del modelo 3D
  const handleToggle3DModel = useCallback(() => {
    console.log('Toggle 3D Model clicked, current state:', show3DModel);
    setShow3DModel(prev => {
      const newState = !prev;
      console.log('Setting new state:', newState);
      
      // Track event con el nuevo estado
      setTimeout(() => {
        trackEvent('select_promotion', { 
          promotion_id: 'toggle_3d_model', 
          promotion_name: `Toggle 3D Model - ${newState ? 'Open' : 'Close'}`, 
          location_id: 'product_showcase' 
        });
      }, 100);
      
      return newState;
    });
  }, []);

  // Cuando termina la animación de caída del logo, disparamos la explosión
  const handleLogoAnimationEnd = (e: React.AnimationEvent<HTMLImageElement>) => {
    if ((e as any).animationName === 'logoDropIn' || (e as any).nativeEvent?.animationName === 'logoDropIn') {
      setLogoDropEnded(true);
      // Leve delay para que coincida con el "impacto"
      setTimeout(() => setExplosionTrigger(true), 80);
    }
  };

  // handleNewsletter movido a CountdownSection.tsx

  // Funciones de scroll movidas a CountdownSection.tsx

  // Memoizar detección de mobile para evitar re-renders innecesarios
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  // Progreso de scroll para sincronizar tubitos (0 -> 1)
  const [tubitosProgress, setTubitosProgress] = useState(0);
  const updateTubitosScroll = useCallback(() => {
    const target = logoRef.current;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    // Mapeo: cuando el top del logo pasa de 90% de la pantalla a 40%, progresa 0->1
    const start = vh * 0.9;
    const end = vh * 0.4;
    const raw = 1 - (rect.top - end) / (start - end);
    const clamped = Math.max(0, Math.min(1, raw));
    setTubitosProgress((prev) => (Math.abs(prev - clamped) > 0.01 ? clamped : prev));
  }, []);
  useEffect(() => {
    let rafId: number;
    let last = 0;
    const THROTTLE = 33;
    const onScroll = () => {
      const now = Date.now();
      if (now - last < THROTTLE) return;
      last = now;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateTubitosScroll);
    };
    updateTubitosScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [updateTubitosScroll]);
  
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => setIsMobile(window.innerWidth < 768), 100);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  // Variables del contador movidas a CountdownSection.tsx

  return (
    <section ref={sectionRef} data-section="product" className="py-24 md:py-28 relative overflow-hidden">
      {(() => { /* easing precomputado para transiciones suaves en bordes */ return null; })()}
      {/* Background más intenso */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/70 to-black" />
      <div className="absolute inset-0 gradient-bg opacity-80" />
      {/* Fade superior para fusionar con el video */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
      {/* Fade inferior eliminado para permitir que el FlameCanvas del footer llegue hasta arriba */}

      {/* FlameCanvas de fondo para mobile, cubriendo ProductShowcase y footer - OPTIMIZADO */}
      {isMobile && (
        <FlameCanvas className="absolute left-0 right-0 bottom-0 top-0 z-0 pointer-events-none" density={1.5} colorAlpha={1.0} shadowBlur={20} />
      )}

      <div className="relative z-10 max-w-none mx-auto px-2 sm:px-4 md:px-8 lg:px-12 xl:px-16">
        {/* Empanada Revolucionaria: mover debajo del video (al inicio de esta sección) - Optimizado para mobile */}
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
          {/* Logo grande arriba del título - Optimizado para mobile */}
          <div ref={logoRef} className="mb-12 sm:mb-2 -mt-20 sm:-mt-12 md:-mt-20 lg:-mt-24 relative px-0 sm:px-4">
            {/* Animación de líneas de fondo detrás del LogoEmp.png */}
            <AnimatedLinesBackground 
              className="absolute inset-0 -z-10"
              intensity={0.5}
              speed={1.0}
            />
            {/* Imagen de explosión de chips como fondo */}
            <div className="absolute inset-0 z-5 flex items-center justify-center pointer-events-none">
              <img
                ref={chipsExplosionRef}
                src="/crunchy/Explosión de Chips Suaves y Crocantes.png"
                alt="Explosión de Chips"
                className="absolute w-full h-full object-contain opacity-70 chips-explosion-reveal"
                style={{
                  animation: 'chipExplosion1 4s ease-in-out infinite alternate',
                  zIndex: 5
                }}
              />
            </div>
            
            <img
              src="/crunchy/LogoEmp.png"
              alt="Logo Empanada"
              onClick={handleLogoClick}
                onAnimationEnd={handleLogoAnimationEnd}
                className={`mx-auto w-full sm:w-80 md:w-[28rem] lg:w-[32rem] xl:w-[56rem] h-auto cursor-pointer relative z-20 ${
                logoRevealed ? (logoDropEnded ? '' : 'logo-drop-in') : 'opacity-0'
              } ${logoFlash ? 'logo-flash' : ''}`}
            />
            <ConfettiFromLogo trigger={explosionTrigger} duration={5000} />
            {/* Imágenes a bordes de pantalla que aparecen tras el logo */}
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/2 w-screen -z-[1]">
              {/* Izquierda: TubitoDinamita2 (visible en mobile) */}
              <Reveal effect="fade" className="block md:block absolute left-0 -translate-y-1/2">
                <div className="relative">
                  <img
                    src="/crunchy/TubitoDinamita2.png"
                    alt="Tubito Dinamita (izquierda)"
                    className="w-32 md:w-48 lg:w-56 will-change-transform"
                    style={{
                      transition: 'transform 120ms linear, opacity 120ms linear',
                      opacity: tubitosProgress,
                      // De -120% (fuera) a -30% (final)
                      transform: `translateX(${(-120 + 90 * tubitosProgress).toFixed(2)}%)`
                    }}
                    loading="lazy"
                  />
                </div>
              </Reveal>
              {/* Derecha: TubitoDinamita (visible en mobile) */}
              <Reveal effect="fade" delay={1} className="block md:block absolute right-0 -translate-y-1/2">
                <div className="relative">
                  <img
                    src="/crunchy/TubitoDinamita.png"
                    alt="Tubito Dinamita (derecha)"
                    className="w-36 md:w-52 lg:w-60 will-change-transform"
                    style={{
                      transition: 'transform 120ms linear, opacity 120ms linear',
                      opacity: tubitosProgress,
                      // De 120% (fuera) a 30% (final)
                      transform: `translateX(${(120 - 90 * tubitosProgress).toFixed(2)}%)`
                    }}
                    loading="lazy"
                  />
                </div>
              </Reveal>
            </div>
          </div>
          <Reveal effect="slide-up">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black flame-text-right font-['Bebas_Neue'] mb-4 sm:mb-6 px-4">
              EMPANADA REVOLUCIONARIA
            </h2>
          </Reveal>
          <Reveal effect="fade" delay={1}>
            <p className="text-purple-200 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-4 leading-relaxed">
              Cada mordida es una explosión de sabor que combina la tradición argentina con la intensidad única de Doritos Flamin' Hot
            </p>
          </Reveal>
          
          {/* Botón para toggle del modelo 3D - Posicionado debajo del texto descriptivo */}
          <div className="flex justify-center mt-6 mb-4 relative z-50">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Button clicked directly!');
                handleToggle3DModel();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                console.log('Button mouse down!');
              }}
              className="px-4 py-2 bg-gradient-to-r from-fuchsia-500/30 to-purple-500/30 hover:from-fuchsia-500/50 hover:to-purple-500/50 border border-fuchsia-400/20 rounded-lg text-fuchsia-200 hover:text-fuchsia-100 font-medium transition-all duration-300 text-sm shadow-sm hover:shadow-md backdrop-blur-sm cursor-pointer relative z-50 pointer-events-auto"
              style={{ zIndex: 9999, position: 'relative' }}
              disabled={false}
            >
              {show3DModel ? 'Cerrar 3D' : 'Vivila en 3D'}
            </button>
          </div>
        </div>


        {/* Product Grid - Optimizado para mobile */}
        <div className="flex flex-col items-center mb-16 sm:mb-20">

          {/* Layout condicional basado en show3DModel */}
          <div className={`transition-all duration-500 ease-in-out w-full ${show3DModel ? 'opacity-100' : 'opacity-100'}`}>
            {show3DModel ? (
            <div key="3d-view" className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 xl:gap-24 items-center w-full">
              {/* Main Product 3D - Optimizado para mobile */}
              <div className="lg:col-span-1">
                <div className="relative">
                  <div className="relative rounded-2xl sm:rounded-3xl p-4 md:p-8 lg:p-12 border border-fuchsia-500/20 overflow-visible bg-transparent">
                    {/* Contenedor del modelo 3D - se extiende sin límites - Optimizado para mobile */}
                    <div className="relative z-5 w-[120%] h-[280px] sm:h-[350px] md:h-[500px] lg:h-[600px] -ml-[10%] -mr-[10%]">
                      {/* Vapor detras */}
                      <div className="pointer-events-none absolute inset-0 z-0">
                        <SteamOverlay intensity={0.6} className="absolute inset-0" />
                      </div>
                      <LazyModel3D className="w-full h-full" />
                    </div>
                    
                    {/* Textos superpuestos: el modelo queda por detrás - Optimizado para mobile */}
                    <div className="absolute left-0 right-0 bottom-4 sm:bottom-6 md:bottom-8 z-20 text-center px-4">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">Empanada Premium</h3>
                      <p className="text-sm sm:text-base text-fuchsia-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">Con Doritos Flamin' Hot</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Imagen de ingredientes a la derecha del 3D - Optimizado para mobile */}
              <div className="lg:mt-8 lg:flex lg:items-center lg:justify-center px-6 sm:px-6 lg:px-8">
                <Reveal effect="bounce" delay={1}>
                  <div className="relative overflow-visible">
                    <img
                      ref={ingredientsRef3D}
                      src="/crunchy/Ingredientes.png"
                      alt="Ingredientes de la Empanada Premium"
                      className="transition-all duration-1000 ease-out transform ingredients-reveal ingredients-responsive"
                      style={{
                        width: '600px !important',
                        height: '500px !important',
                        maxWidth: 'none !important',
                        maxHeight: 'none !important',
                        minWidth: '600px !important',
                        minHeight: '500px !important',
                        objectFit: 'contain',
                        zoom: '1.0',
                        fontSize: '20px'
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </Reveal>
              </div>
            </div>
            ) : (
              /* Solo ingredientes centrados cuando el modelo 3D está oculto */
              <div key="ingredients-only" className="flex items-center justify-center px-6 sm:px-6 lg:px-8 lg:mt-8">
                <Reveal effect="bounce" delay={1}>
                  <div className="relative overflow-visible">
                    <img
                      ref={ingredientsRef}
                      src="/crunchy/Ingredientes.png"
                      alt="Ingredientes de la Empanada Premium"
                      className="transition-all duration-1000 ease-out transform ingredients-reveal ingredients-responsive"
                      style={{
                        width: '600px !important',
                        height: '500px !important',
                        maxWidth: 'none !important',
                        maxHeight: 'none !important',
                        minWidth: '600px !important',
                        minHeight: '500px !important',
                        objectFit: 'contain',
                        zoom: '1.0',
                        fontSize: '20px'
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </Reveal>
              </div>
          )}
          </div>
        </div>

        {/* Sección del contador movida a CountdownSection.tsx */}

      {/* Tubitos Dinamita removidos - ahora están animados en el contador */}

      {/* Marquee - Mobile entre ingredientes y footer */}
      <div className="block sm:hidden relative z-[5] mt-8 mb-6">
        <div className="marquee bg-gradient-to-r from-fuchsia-700/80 via-purple-700/80 to-fuchsia-700/80 border-y-2 border-fuchsia-500/50 py-3">
          <div className="marquee-track text-black font-extrabold tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">
            <span className="text-3xl font-['Bebas_Neue'] uppercase px-4 whitespace-nowrap">• Tu antojo Crujiente • Tu antojo Crujiente • Tu antojo Crujiente • Tu antojo Crujiente •</span>
            <span className="text-3xl font-['Bebas_Neue'] uppercase px-4 whitespace-nowrap">• Tu antojo Crujiente • Tu antojo Crujiente • Tu antojo Crujiente • Tu antojo Crujiente •</span>
          </div>
        </div>
      </div>

      {/* Marquee - Desktop entre ingredientes y footer */}
      <div className="hidden sm:block relative z-[5] mt-16 mb-8">
        <div className="marquee bg-gradient-to-r from-fuchsia-700/80 via-purple-700/80 to-fuchsia-700/80 border-y-2 border-fuchsia-500/50 py-4 sm:py-3 md:py-4">
          <div className="marquee-track text-black font-extrabold tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">
            <span className="text-6xl sm:text-3xl md:text-5xl lg:text-8xl font-['Bebas_Neue'] uppercase px-4 sm:px-6 md:px-10 whitespace-nowrap">• Tu antojo Crujiente • Tu antojo Crujiente • Tu antojo Crujiente • Tu antojo Crujiente •</span>
            <span className="text-6xl sm:text-3xl md:text-5xl lg:text-8xl font-['Bebas_Neue'] uppercase px-4 sm:px-6 md:px-10 whitespace-nowrap">• Tu antojo Crujiente • Tu antojo Crujiente • Tu antojo Crujiente • Tu antojo Crujiente •</span>
          </div>
        </div>
      </div>

      </div>
    </section>
  );
};

export default memo(ProductShowcase);