import React, { useRef, useEffect, useState, useCallback } from 'react';
import Reveal from './Reveal';
import SteamOverlay from './SteamOverlay';
import FlameCanvas from './FlameCanvas';
import ConfettiFromLogo from './ConfettiFromLogo';
import { trackEvent } from '../analytics';
// import { Bell } from 'lucide-react';
import { useComponentAnalytics } from '../hooks/useComponentAnalytics';

const ProductShowcase: React.FC = () => {
  const sectionRef = useComponentAnalytics('ProductShowcase') as any;
  const epicRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  
  // Constantes para ajustar posiciones finales de animaciones
  const FINAL_LEFT = 42;        // Posición final empanada izquierda (CRUNCHY.png) - más alto = más al centro
  const FINAL_RIGHT = 38;       // Posición final empanada derecha (CRUNCHY2.png) - más alto = más al centro
  const TUBITO_LEFT_PEEK = 5;   // Cuánto "asoma" el tubito izquierdo tras la empanada
  const TUBITO_RIGHT_PEEK = 4;  // Cuánto "asoma" el tubito derecho tras Flamin Hot
  
  // Constantes específicas para mobile (más al centro para evitar cortes)
  const FINAL_LEFT_MOBILE = 50;  // Posición final empanada izquierda en mobile
  const FINAL_RIGHT_MOBILE = 46; // Posición final empanada derecha en mobile
  
  // Constantes para alineación vertical de las empanadas
  const LEFT_VERTICAL_OFFSET = '75%';   // Offset vertical para empanada izquierda
  const RIGHT_VERTICAL_OFFSET = '75%';  // Offset vertical para empanada derecha
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [postArrivalProgress, setPostArrivalProgress] = useState(0); // progreso extra luego de que la empanada llega al contador
  const [edgeProgress, setEdgeProgress] = useState(0); // progreso para imágenes a los bordes tras el logo
  // Desactivar parallax/scroll-animations si es necesario
  const DISABLE_PARALLAX = false;
  // Notificaciones eliminadas por solicitud
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [logoRevealed, setLogoRevealed] = useState(false);
  const [logoFlash, setLogoFlash] = useState(false);
  // Animación de caída + trigger de explosión
  const [logoDropEnded, setLogoDropEnded] = useState(false);
  const [explosionTrigger, setExplosionTrigger] = useState(false);
  // Elimina toda la lógica de showConfetti en useEffect, IntersectionObserver, y renders

  useEffect(() => {
    const launchDate = new Date('2025-10-16T00:00:00');
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
  }, [logoRevealed]); // Eliminado showConfetti

  // Función para el click del logo
  const handleLogoClick = useCallback(() => {
    setLogoFlash(true);
    setTimeout(() => setLogoFlash(false), 2000); // Reset después de 2 segundos
    trackEvent('select_promotion', { promotion_id: 'product_logo', promotion_name: 'Logo Empanada', location_id: 'product_showcase' });
  }, []);

  // Cuando termina la animación de caída del logo, disparamos la explosión
  const handleLogoAnimationEnd = (e: React.AnimationEvent<HTMLImageElement>) => {
    if ((e as any).animationName === 'logoDropIn' || (e as any).nativeEvent?.animationName === 'logoDropIn') {
      setLogoDropEnded(true);
      // Leve delay para que coincida con el "impacto"
      setTimeout(() => setExplosionTrigger(true), 80);
    }
  };

  const handleNewsletter = async () => {
    const email = newsletterEmail.trim();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmailValid) {
      setNewsletterStatus('error');
      trackEvent('newsletter_submit', { status: 'invalid' });
      return;
    }
    setNewsletterStatus('loading');
    try {
      const res = await fetch('https://sheetdb.io/api/v1/baeccpkjv9yb4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            { email, fecha: new Date().toISOString() }
          ]
        }),
      });
      if (res.ok) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
        trackEvent('generate_lead', { method: 'newsletter', status: 'success' });
      } else {
        setNewsletterStatus('error');
        trackEvent('generate_lead', { method: 'newsletter', status: 'error', http: res.status });
      }
    } catch (e) {
      setNewsletterStatus('error');
      trackEvent('generate_lead', { method: 'newsletter', status: 'network_error' });
    }
  };

  // OPTIMIZADO: Scroll handler con throttling para mejor performance
  const updateScroll = useCallback(() => {
    if (DISABLE_PARALLAX) return;
    const target = epicRef.current;
    if (!target) return;
    
    const rect = target.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const isMobile = window.innerWidth < 768;
    
    // Valores diferentes para mobile y desktop
    const start = isMobile ? vh * 0.8 : vh;
    const end = isMobile ? vh * -0.2 : vh * 0.35;
    
    const raw = 1 - (rect.top - end) / (start - end);
    const clamped = Math.max(0, Math.min(1, raw));
    
    // Solo actualizar si el cambio es significativo (evita micro-updates)
    setScrollProgress(prev => {
      const diff = Math.abs(prev - clamped);
      return diff > 0.01 ? clamped : prev;
    });

    const overshootMultiplier = isMobile ? 0.2 : 0.15;
    const overshoot = (end - rect.top) / (vh * overshootMultiplier);
    const overshootClamped = Math.max(0, Math.min(1, overshoot));
    
    setPostArrivalProgress(prev => {
      const diff = Math.abs(prev - overshootClamped);
      return diff > 0.01 ? overshootClamped : prev;
    });

    const logo = logoRef.current;
    if (logo) {
      const logoRect = logo.getBoundingClientRect();
      const startLogo = vh;
      const endLogo = vh * 0.45;
      const rawLogo = 1 - (logoRect.top - endLogo) / (startLogo - endLogo);
      const gated = Math.max(0, Math.min(1, (rawLogo - 0.8) / 0.2));
      
      setEdgeProgress(prev => {
        const diff = Math.abs(prev - gated);
        return diff > 0.01 ? gated : prev;
      });
    }
  }, [DISABLE_PARALLAX]);

  useEffect(() => {
    if (DISABLE_PARALLAX) return;
    
    let rafId: number;
    let lastScrollTime = 0;
    const SCROLL_THROTTLE = 16; // ~60fps max
    
    const onScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime < SCROLL_THROTTLE) return;
      lastScrollTime = now;
      
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScroll);
    };
    
    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [updateScroll, DISABLE_PARALLAX]);

  // Memoizar detección de mobile para evitar re-renders innecesarios
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  
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

  // Estado eliminado: no se usa animación específica para tubitos en mobile

  // Valores usados en estilos con parallax opcionalmente desactivado
  const progress = DISABLE_PARALLAX ? 1 : scrollProgress;
  const postProgressVal = DISABLE_PARALLAX ? 1 : postArrivalProgress;
  const edge = DISABLE_PARALLAX ? 1 : edgeProgress;

  return (
    <section ref={sectionRef} data-section="product" className="py-24 md:py-28 relative overflow-hidden">
      {(() => { /* easing precomputado para transiciones suaves en bordes */ return null; })()}
      {/* Background más intenso */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/70 to-black" />
      <div className="absolute inset-0 gradient-bg opacity-80" />
      {/* Fade superior para fusionar con el video */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
      {/* Fade inferior para transición hacia CTA */}
      {/* Elimina el fade en mobile para que no tape el FlameCanvas */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent hidden sm:block" />

      {/* FlameCanvas de fondo para mobile, cubriendo ProductShowcase y footer - OPTIMIZADO */}
      {isMobile && (
        <FlameCanvas className="absolute left-0 right-0 bottom-0 top-0 z-0 pointer-events-none" density={1.2} colorAlpha={0.8} shadowBlur={15} />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Empanada Revolucionaria: mover debajo del video (al inicio de esta sección) - Optimizado para mobile */}
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
          {/* Logo grande arriba del título - Optimizado para mobile */}
          <div ref={logoRef} className="mb-12 sm:mb-2 -mt-20 sm:-mt-12 md:-mt-20 lg:-mt-24 relative px-0 sm:px-4">
            <img
              src="/crunchy/LogoEmp.png"
              alt="Logo Empanada"
              onClick={handleLogoClick}
                onAnimationEnd={handleLogoAnimationEnd}
                className={`mx-auto w-full sm:w-80 md:w-[28rem] lg:w-[32rem] xl:w-[56rem] h-auto cursor-pointer ${
                logoRevealed ? (logoDropEnded ? 'shine logo-float' : 'logo-drop-in') : 'opacity-0'
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
                      filter: 'drop-shadow(0 10px 20px rgba(255,0,64,0.25))',
                      transition: 'transform 600ms cubic-bezier(.22,.61,.36,1), opacity 600ms ease',
                      opacity: 0.1 + edge * 0.9,
                      transform: `translateX(${(-120 + edge * 90)}%)`
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
                      filter: 'drop-shadow(0 12px 24px rgba(255,0,64,0.3))',
                      transition: 'transform 600ms cubic-bezier(.22,.61,.36,1), opacity 600ms ease',
                      opacity: 0.1 + edge * 0.9,
                      transform: `translateX(${(120 - edge * 90)}%)`
                    }}
                    loading="lazy"
                  />
                </div>
              </Reveal>
            </div>
          </div>
          <Reveal effect="slide-up">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black flame-text font-['Bebas_Neue'] mb-4 sm:mb-6 px-4">
              EMPANADA REVOLUCIONARIA
            </h2>
          </Reveal>
          <Reveal effect="fade" delay={1}>
            <p className="text-purple-200 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-4 leading-relaxed">
              Cada mordida es una explosión de sabor que combina la tradición argentina con la intensidad única de Doritos Flamin' Hot
            </p>
          </Reveal>
        </div>

        {/* Product Grid - Optimizado para mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 items-center mb-16 sm:mb-20">
          {/* Main Product 3D - Optimizado para mobile */}
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="relative rounded-2xl sm:rounded-3xl p-2 md:p-4 border border-fuchsia-500/20 overflow-visible bg-transparent">
                {/* FlameCanvas removido en mobile para mejor rendimiento */}
                
                {/* Contenedor del modelo 3D - se extiende sin límites - Optimizado para mobile */}
                <div className="relative z-5 w-full h-[400px] sm:h-[500px] md:h-[700px] lg:h-[800px] -m-2 md:-m-4">
                  {/* Vapor detras */}
                  <div className="pointer-events-none absolute inset-0 z-0">
                    <SteamOverlay intensity={0.6} className="absolute inset-0" />
                  </div>
                  <model-viewer
                    src="/crunchy/Doritos-3D.glb"
                    alt="Empanada Premium con Doritos Flamin' Hot"
                    camera-controls
                    auto-rotate
                    shadow-intensity="0.8"
                    exposure="1.0"
                    interaction-prompt="none"
                    disable-zoom
                    camera-orbit="90deg 75deg 160%"
                    min-camera-orbit="auto auto 140%"
                    field-of-view="45deg"
                    min-field-of-view="40deg"
                    tone-mapping="neutral"
                    style={{ 
                      width: 'calc(100% + 32px)', 
                      height: 'calc(100% + 64px)', 
                      outline: 'none', 
                      background: 'transparent', 
                      position: 'absolute',
                      top: '-32px',
                      left: '-16px',
                      zIndex: 1,
                      transform: 'scale(0.95)'
                    }}
                  />
                </div>
                
                {/* Textos superpuestos: el modelo queda por detrás - Optimizado para mobile */}
                <div className="absolute left-0 right-0 bottom-4 sm:bottom-6 md:bottom-8 z-20 text-center px-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">Empanada Premium</h3>
                  <p className="text-sm sm:text-base text-fuchsia-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">Con Doritos Flamin' Hot</p>
                </div>
              </div>
            </div>
            {/* Marquee: Pican, pero rico! */}
            <div className="hidden">
              <div className="marquee bg-gradient-to-r from-red-600 via-orange-600 to-red-600 border-y border-fuchsia-500/30 py-3">
                <div className="marquee-track text-black font-bold tracking-wide">
                  <span className="text-2xl md:text-3xl font-['Bebas_Neue'] px-6 whitespace-nowrap">Pican, pero rico!  a0 a0 a0 a0 Pican, pero rico!  a0 a0 a0 a0 Pican, pero rico!  a0 a0 a0 a0 Pican, pero rico!</span>
                  <span className="text-2xl md:text-3xl font-['Bebas_Neue'] px-6 whitespace-nowrap">Pican, pero rico!  a0 a0 a0 a0 Pican, pero rico!  a0 a0 a0 a0 Pican, pero rico!  a0 a0 a0 a0 Pican, pero rico!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles del producto a la derecha del 3D - Optimizado para mobile */}
          <div className="features-epic space-y-4 sm:space-y-6 lg:mt-0 lg:pl-12 lg:border-l lg:border-fuchsia-500/20 lg:self-stretch lg:flex lg:flex-col lg:justify-center px-4 sm:px-0">
            {[ 
              {
                title: "Masa Artesanal",
                description: "Elaborada con la receta tradicional de Mi Gusto, perfecta para contener toda la intensidad",
                icon: "🥟"
              },
              {
                title: "Relleno Intenso",
                description: "Carne premium sazonada con especias que complementan el Flamin' Hot",
                icon: "🥩"
              },
              {
                title: "Topping Crujiente",
                description: "Flamin' Hot Dinamita molidos, incorporados para un contraste de textura picante único",
                icon: (
                  <img
                    src="/crunchy/Tubito.png?v=1"
                    alt="Tubito"
                    className="h-10 w-auto sm:h-12 md:h-14 inline-block object-contain drop-shadow-[0_6px_18px_rgba(255,0,128,0.45)]"
                    loading="eager"
                    decoding="async"
                  />
                )
              }
            ].map((item, index) => {
              const key = item.title.trim().toLowerCase();
              const BASE = import.meta.env.BASE_URL || '/';
              const map: Record<string, string> = {
                'masa artesanal': `${BASE}${encodeURIComponent('Masa Artesanal.png')}`,
                'relleno intenso': `${BASE}${encodeURIComponent('Relleno Intenso.png')}`,
                'topping crujiente': `${BASE}${encodeURIComponent('Topping Crujiente.jpeg')}`,
              };
              const encoded = map[key];
              return (
                <Reveal key={index} effect="scale" delay={(index % 3) as 0 | 1 | 2}>
                  <div className="feature-card-pro relative overflow-hidden" style={encoded ? { background: 'transparent' } : undefined}>
                    {encoded && (
                      <>
                        <div
                          aria-hidden
                          className="absolute inset-0 bg-center bg-cover opacity-100"
                          style={{ backgroundImage: `url(${encoded})`, filter: 'brightness(0.8) saturate(0.95)' }}
                        />
                        {/* Capa de opacidad uniforme muy sutil para contraste de texto */}
                        <div aria-hidden className="absolute inset-0 bg-black/25" />
                        <div
                          aria-hidden
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.10) 35%, rgba(0,0,0,0.04) 55%, rgba(0,0,0,0.0) 80%)'
                          }}
                        />
                      </>
                    )}
                    <div className="flex items-start gap-3 sm:gap-4 relative z-10">
                    <div className="feature-icon-pro">
                      {typeof item.icon === 'string' ? (
                        <span className="text-2xl sm:text-3xl md:text-4xl">{item.icon}</span>
                      ) : (
                        item.icon
                      )}
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-white font-bold text-base sm:text-lg md:text-xl mb-1 leading-tight tracking-wide">{item.title}</h4>
                      <p className="text-purple-200 leading-relaxed text-xs sm:text-sm md:text-base max-w-sm">{item.description}</p>
                    </div>
                  </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* Section Header (badge removido) - Optimizado para mobile */}
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <div ref={epicRef} className="relative inline-block">
            <h3 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl leading-none tracking-wide font-black flame-text font-['Bebas_Neue'] mb-6 sm:mb-8 px-4">
              ALGO EPICO ESTA LLEGANDO
            </h3>
            {/* Imagen izquierda - Visible en mobile */}
            <img
              src="/crunchy/CRUNCHY.png"
              alt="Empanada abierta"
              className="pointer-events-none block md:block absolute -left-6 md:-left-16 top-1/2 w-48 md:w-96 lg:w-[28rem] drop-shadow-2xl z-30 will-change-transform"
              style={{
                transform: `translate3d(${(-56 + (isMobile ? FINAL_LEFT_MOBILE : FINAL_LEFT) * progress)}vw, ${isMobile ? LEFT_VERTICAL_OFFSET : '-50%'}, 0) scale(${0.9 + 0.25 * progress})`,
                opacity: Math.min(1, Math.max(0, progress))
              }}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
            {/* Doritos Tubito Dinamita detrás de la empanada izquierda - VISIBLE EN MOBILE */}
            {(() => {
              const reveal = Math.max(0, Math.min(1, (postProgressVal - 0.05) / 0.95));
              const empanadaX = -56 + (isMobile ? FINAL_LEFT_MOBILE : FINAL_LEFT) * progress;
              const tubitosX = empanadaX - 5; // Posición fija visible
              return (
                <img
                  src="/crunchy/TubitoDinamita.png"
                  alt="Doritos Dinamita"
                  className="pointer-events-none block absolute -left-6 top-1/2 w-32 will-change-transform z-[2]"
                  style={{
                    transform: `translate3d(${tubitosX}vw, ${isMobile ? LEFT_VERTICAL_OFFSET : '-50%'}, 0) rotate(-10deg) scale(${0.8 + 0.3 * reveal})`,
                    opacity: isMobile ? Math.max(0.5, reveal) : Math.max(0, reveal),
                    filter: 'drop-shadow(0 15px 30px rgba(255,0,64,0.8))',
                    display: 'block'
                  }}
                  loading="lazy"
                />
              );
            })()}
            {/* Tubito Dinamita derecho: VISIBLE EN MOBILE - IGUAL QUE IZQUIERDA */}
            {(() => {
              const reveal = Math.max(0, Math.min(1, (postProgressVal - 0.05) / 0.95));
              const flaminX = 52 - (isMobile ? FINAL_RIGHT_MOBILE : FINAL_RIGHT) * progress;
              const tubitosXRight = flaminX + 2; // Posición fija visible - UN POCO MÁS A LA DERECHA
              return (
                <img
                  src="/crunchy/TubitoDinamita2.png"
                  alt="Tubito Dinamita"
                  className="pointer-events-none block absolute -right-6 top-1/2 w-32 will-change-transform z-[2]"
                  style={{
                    transform: `translate3d(${tubitosXRight}vw, ${isMobile ? RIGHT_VERTICAL_OFFSET : '-50%'}, 0) rotate(10deg) scale(${0.8 + 0.3 * reveal})`,
                    opacity: isMobile ? Math.max(0.5, reveal) : Math.max(0, reveal),
                    filter: 'drop-shadow(0 15px 30px rgba(255,0,64,0.8))',
                    display: 'block'
                  }}
                  loading="lazy"
                />
              );
            })()}
            
            {/* Imagen derecha - Flamin Hot - Visible en mobile */}
            <img
              src="/crunchy/CRUNCHY2.png"
              alt="Doritos Flamin' Hot"
              className="pointer-events-none block md:block absolute -right-6 md:-right-16 top-1/2 w-48 md:w-96 lg:w-[28rem] drop-shadow-2xl z-20 will-change-transform"
              style={{
                transform: `translate3d(${(52 - (isMobile ? FINAL_RIGHT_MOBILE : FINAL_RIGHT) * progress)}vw, ${isMobile ? RIGHT_VERTICAL_OFFSET : '-50%'}, 0) scale(${0.9 + 0.25 * progress})`,
                opacity: Math.min(1, Math.max(0, progress))
              }}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
            {/* Countdown movido aquí - Optimizado para mobile */}
            <Reveal effect="slide-up">
              <div className="relative z-20 bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 lg:p-14 border border-fuchsia-500/20 mb-12 sm:mb-16 inline-block">
                {/* Tubitos Dinamita asomándose desde adentro de la empanada en mobile */}
                {(() => {
                  // Revelar solo después de que la empanada llegue al contador (mismo comportamiento que PC)
                  const reveal = Math.max(0, Math.min(1, (postProgressVal - 0.05) / 0.95));
                  return (
                    <>
                      {/* TubitoDinamita2: IZQUIERDA, asomándose desde adentro de la empanada */}
                      <img
                        src="/crunchy/TubitoDinamita2.png"
                        alt="Tubito Dinamita Izquierda"
                        className="block sm:hidden absolute left-0 bottom-0 w-20 z-30 drop-shadow-2xl will-change-transform"
                        style={{
                          transform: `translateX(${(-30 + reveal * 25)}%) translateY(${(30 - reveal * 20)}%) rotate(-10deg) scale(${0.8 + 0.2 * reveal})`,
                          opacity: Math.max(0, reveal),
                          transition: 'transform 600ms cubic-bezier(.22,.61,.36,1), opacity 600ms ease',
                          filter: 'drop-shadow(0 10px 20px rgba(255,0,64,0.25))'
                        }}
                        loading="lazy"
                      />
                      {/* TubitoDinamita: DERECHA, asomándose desde adentro de la empanada */}
                      <img
                        src="/crunchy/TubitoDinamita.png"
                        alt="Tubito Dinamita Derecha"
                        className="block sm:hidden absolute right-0 bottom-0 w-24 z-30 drop-shadow-2xl will-change-transform"
                        style={{
                          transform: `translateX(${(30 - reveal * 25)}%) translateY(${(30 - reveal * 20)}%) rotate(10deg) scale(${0.8 + 0.2 * reveal})`,
                          opacity: Math.max(0, reveal),
                          transition: 'transform 600ms cubic-bezier(.22,.61,.36,1), opacity 600ms ease',
                          filter: 'drop-shadow(0 12px 24px rgba(255,0,64,0.3))'
                        }}
                        loading="lazy"
                      />
                    </>
                  );
                })()}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
                {[
                  { value: timeLeft.days, label: 'DÍAS' },
                  { value: timeLeft.hours, label: 'HORAS' },
                  { value: timeLeft.minutes, label: 'MINUTOS' },
                  { value: timeLeft.seconds, label: 'SEGUNDOS' }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-lg sm:rounded-2xl p-3 sm:p-6 md:p-8 mb-2 sm:mb-4 pulse-glow">
                      <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white font-['Bebas_Neue']">
                        {item.value.toString().padStart(2, '0')}
                      </div>
                    </div>
                    <div className="text-fuchsia-300 font-semibold text-xs sm:text-sm md:text-base tracking-wider">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
              {/* Newsletter: suscripción para recibir novedades y notificaciones - Optimizado para mobile */}
              <div className="mt-8 sm:mt-10 md:mt-14 max-w-xl mx-auto px-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    inputMode="email"
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (newsletterStatus !== 'idle') setNewsletterStatus('idle');
                    }}
                    placeholder="example@gmail.com"
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-black/50 border border-purple-600/60 rounded-lg sm:rounded-xl text-white placeholder-purple-300 focus:border-fuchsia-500 focus:outline-none text-sm sm:text-base"
                    disabled={newsletterStatus === 'loading'}
                  />
                  <button
                    onClick={handleNewsletter}
                    disabled={newsletterStatus === 'loading'}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-lg sm:rounded-xl text-white font-semibold shadow-lg hover:from-fuchsia-500 hover:to-purple-500 transition-colors text-sm sm:text-base"
                  >
                    {newsletterStatus === 'loading' ? 'Enviando...' : 'Avisame'}
                  </button>
                </div>
                <div className="mt-2 min-h-[1.25rem]">
                  {newsletterStatus === 'error' && (
                    <p className="text-xs sm:text-sm text-red-400">Hubo un error. Intenta de nuevo.</p>
                  )}
                  {newsletterStatus === 'success' && (
                    <p className="text-xs sm:text-sm text-fuchsia-300">¡Listo! Te enviaremos un correo cuando sea el lanzamiento.</p>
                  )}
                </div>
              </div>
              </div>
            </Reveal>
          </div>
        </div>

      {/* Marquee: Pican, pero rico! (debajo del contador, ancho completo) - Optimizado para mobile */}
      <div className="relative z-[5] mt-32 sm:mt-6">
        <div className="marquee bg-gradient-to-r from-fuchsia-700/80 via-purple-700/80 to-fuchsia-700/80 border-y-2 border-fuchsia-500/50 py-8 sm:py-6 md:py-7">
          <div className="marquee-track text-black font-extrabold tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">
            <span className="text-6xl sm:text-3xl md:text-5xl lg:text-8xl font-['Bebas_Neue'] uppercase px-4 sm:px-6 md:px-10 whitespace-nowrap">Pican, pero rico! — Pican, pero rico! — Pican, pero rico! — Pican, pero rico!</span>
            <span className="text-6xl sm:text-3xl md:text-5xl lg:text-8xl font-['Bebas_Neue'] uppercase px-4 sm:px-6 md:px-10 whitespace-nowrap">Pican, pero rico! — Pican, pero rico! — Pican, pero rico! — Pican, pero rico!</span>
          </div>
        </div>
      </div>

      {/* Tubitos Dinamita removidos - ahora están animados en el contador */}


      </div>
    </section>
  );
};

export default ProductShowcase;