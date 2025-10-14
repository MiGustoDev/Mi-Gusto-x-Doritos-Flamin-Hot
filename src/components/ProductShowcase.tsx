import React, { useRef, useEffect, useState, useCallback, useMemo, memo } from 'react';
import Reveal from './Reveal';
import SteamOverlay from './SteamOverlay';
import FlameCanvas from './FlameCanvas';
import ConfettiFromLogo from './ConfettiFromLogo';
import LazyModel3D from './LazyModel3D';
import AnimatedLinesBackground from './AnimatedLinesBackground';
import { trackEvent } from '../analytics';
// import { Bell } from 'lucide-react';
import { useComponentAnalytics } from '../hooks/useComponentAnalytics';

const ProductShowcase: React.FC = () => {
  const sectionRef = useComponentAnalytics('ProductShowcase') as any;
  const epicRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  
  // Constantes para ajustar posiciones finales de animaciones
  const FINAL_LEFT = 38;        // Posición final empanada izquierda (CRUNCHY.png) - más alto = más al centro
  const FINAL_RIGHT = 34;       // Posición final empanada derecha (CRUNCHY2.png) - más alto = más al centro
  
  // Constantes específicas para mobile (más al centro para tocar el contador)
  const FINAL_LEFT_MOBILE = 48;  // Posición final empanada izquierda en mobile
  const FINAL_RIGHT_MOBILE = 44; // Posición final empanada derecha en mobile
  
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
    const launchDate = new Date('2025-11-06T00:00:00');
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


  // Memoizar countdown items
  const countdownItems = useMemo(() => [
    { value: timeLeft.days, label: 'DÍAS' },
    { value: timeLeft.hours, label: 'HORAS' },
    { value: timeLeft.minutes, label: 'MINUTOS' },
    { value: timeLeft.seconds, label: 'SEGUNDOS' }
  ], [timeLeft]);

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
            <img
              src="/crunchy/LogoEmp.png"
              alt="Logo Empanada"
              onClick={handleLogoClick}
                onAnimationEnd={handleLogoAnimationEnd}
                className={`mx-auto w-full sm:w-80 md:w-[28rem] lg:w-[32rem] xl:w-[56rem] h-auto cursor-pointer relative z-10 ${
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
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black flame-text-right font-['Bebas_Neue'] mb-4 sm:mb-6 px-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center mb-16 sm:mb-20">
          {/* Main Product 3D - Optimizado para mobile */}
          <div className="lg:col-span-1">
            <div className="relative">
              <div className="relative rounded-2xl sm:rounded-3xl p-4 md:p-8 lg:p-12 border border-fuchsia-500/20 overflow-visible bg-transparent">
                {/* FlameCanvas removido en mobile para mejor rendimiento */}
                
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

          {/* Imagen de ingredientes a la derecha del 3D - Optimizado para mobile */}
          <div className="lg:mt-0 lg:flex lg:items-center lg:justify-center px-2 sm:px-4">
            <Reveal effect="fade" delay={1}>
              <img
                src="/crunchy/Ingredientes.png"
                alt="Ingredientes de la Empanada Premium"
                className="w-full max-w-none scale-105 lg:scale-110 xl:scale-120"
                loading="lazy"
                decoding="async"
              />
            </Reveal>
          </div>
        </div>

        {/* Section Header (badge removido) - Optimizado para mobile */}
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <div ref={epicRef} className="relative inline-block">
            <h3 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl leading-none tracking-wide font-black flame-text-left font-['Bebas_Neue'] mb-6 sm:mb-8 px-4">
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
                {countdownItems.map((item, index) => (
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

export default memo(ProductShowcase);