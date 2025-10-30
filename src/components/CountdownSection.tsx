import React, { useRef, useEffect, useState, useCallback, useMemo, memo } from 'react';
import Reveal from './Reveal';
import { trackEvent } from '../analytics';
import { supabase } from '../lib/supabaseClient';

// Componente optimizado para elementos del contador
const CountdownItem = memo(({ value, label }: { value: number; label: string }) => (
  <div className="text-center">
    <div className="bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-lg sm:rounded-2xl p-3 sm:p-6 md:p-8 mb-2 sm:mb-4 pulse-glow">
      <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white font-['Bebas_Neue']">
        {value.toString().padStart(2, '0')}
      </div>
    </div>
    <div className="text-fuchsia-300 font-semibold text-xs sm:text-sm md:text-base tracking-wider">
      {label}
    </div>
  </div>
));

const CountdownSection: React.FC = () => {
  const epicRef = useRef<HTMLDivElement>(null);
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [postArrivalProgress, setPostArrivalProgress] = useState(0);
  const [edgeProgress, setEdgeProgress] = useState(0);
  
  // Constantes para ajustar posiciones finales de animaciones
  const FINAL_LEFT = 38;        // Posición final empanada izquierda (CRUNCHY.png)
  const FINAL_RIGHT = 34;       // Posición final empanada derecha (CRUNCHY2.png)
  
  // Constantes específicas para mobile
  const FINAL_LEFT_MOBILE = 55;
  const FINAL_RIGHT_MOBILE = 55;
  
  // Constantes para alineación vertical de las empanadas
  const LEFT_VERTICAL_OFFSET = '110%';
  const RIGHT_VERTICAL_OFFSET = '110%';
  
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');

  useEffect(() => {
    const launchDate = new Date('2025-11-06T00:00:00');
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;
      if (distance > 0) {
        const newTimeLeft = {
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        };
        
        setTimeLeft(prev => {
          if (prev.days !== newTimeLeft.days || prev.hours !== newTimeLeft.hours || 
              prev.minutes !== newTimeLeft.minutes || prev.seconds !== newTimeLeft.seconds) {
            return newTimeLeft;
          }
          return prev;
        });
      }
    };
    
    updateCountdown();
    
    let rafId: number;
    let lastUpdate = 0;
    const UPDATE_INTERVAL = 1000;
    
    const timerLoop = (timestamp: number) => {
      if (timestamp - lastUpdate >= UPDATE_INTERVAL) {
        updateCountdown();
        lastUpdate = timestamp;
      }
      rafId = requestAnimationFrame(timerLoop);
    };
    
    rafId = requestAnimationFrame(timerLoop);
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Scroll handler para animaciones parallax
  const updateScroll = useCallback(() => {
    const target = epicRef.current;
    if (!target) return;
    
    const rect = target.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const isMobile = window.innerWidth < 768;
    
    const start = isMobile ? vh * 0.8 : vh;
    const end = isMobile ? vh * -0.2 : vh * 0.35;
    
    const raw = 1 - (rect.top - end) / (start - end);
    const clamped = Math.max(0, Math.min(1, raw));
    
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
  }, []);

  useEffect(() => {
    let rafId: number;
    let lastScrollTime = 0;
    const SCROLL_THROTTLE = 16; // ~60fps
    
    const onScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime < SCROLL_THROTTLE) return;
      lastScrollTime = now;
      
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScroll);
    };
    
    // Bucle continuo para 60fps mientras la página está activa
    let rafLoopId: number;
    const loop = () => {
      updateScroll();
      rafLoopId = requestAnimationFrame(loop);
    };
    
    updateScroll();
    rafLoopId = requestAnimationFrame(loop);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (rafLoopId) cancelAnimationFrame(rafLoopId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [updateScroll]);

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

  const countdownItems = useMemo(() => [
    { value: timeLeft.days, label: 'DÍAS' },
    { value: timeLeft.hours, label: 'HORAS' },
    { value: timeLeft.minutes, label: 'MINUTOS' },
    { value: timeLeft.seconds, label: 'SEGUNDOS' }
  ], [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds]);

  const progress = scrollProgress;
  const postProgressVal = postArrivalProgress;

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
      const { error } = await supabase
        .from('newsletter_subscribers')
        .upsert(
          [{ email, source: 'website' }],
          { onConflict: 'email' }
        );

      if (!error) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
        trackEvent('generate_lead', { method: 'newsletter', status: 'success' });
      } else {
        setNewsletterStatus('error');
        trackEvent('generate_lead', { method: 'newsletter', status: 'error' });
      }
    } catch (e) {
      setNewsletterStatus('error');
      trackEvent('generate_lead', { method: 'newsletter', status: 'network_error' });
    }
  };

  return (
    <section id="countdown-section" className="py-24 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/70 to-black" />
      <div className="absolute inset-0 gradient-bg opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />

      <div className="relative z-10 max-w-none mx-auto px-2 sm:px-4 md:px-8 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <div ref={epicRef} className="relative inline-block">
            <h3 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl leading-none tracking-wide font-black flame-text-left font-['Bebas_Neue'] mb-6 sm:mb-8 px-4">
              ALGO EPICO LLEGÓ
            </h3>
            
            {/* Imagen izquierda */}
            <img
              src="/crunchy/CRUNCHY.png"
              alt="Empanada abierta"
              className="pointer-events-none block md:block absolute -left-6 md:-left-16 top-1/2 w-36 md:w-96 lg:w-[28rem] drop-shadow-2xl z-30 will-change-transform"
              style={{
                transform: `translate3d(${(-56 + (isMobile ? FINAL_LEFT_MOBILE : FINAL_LEFT) * progress)}vw, ${isMobile ? LEFT_VERTICAL_OFFSET : '-50%'}, 0) scale(${0.9 + 0.25 * progress})`,
                opacity: Math.min(1, Math.max(0, progress)),
                backfaceVisibility: 'hidden',
                perspective: '1000px'
              }}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
            
            {/* Imagen derecha */}
            <img
              src="/crunchy/CRUNCHY2.png"
              alt="Doritos Flamin' Hot"
              className="pointer-events-none block md:block absolute -right-6 md:-right-16 top-1/2 w-36 md:w-96 lg:w-[28rem] drop-shadow-2xl z-20 will-change-transform"
              style={{
                transform: `translate3d(${(52 - (isMobile ? FINAL_RIGHT_MOBILE : FINAL_RIGHT) * progress)}vw, ${isMobile ? RIGHT_VERTICAL_OFFSET : '-50%'}, 0) scale(${0.9 + 0.25 * progress})`,
                opacity: Math.min(1, Math.max(0, progress)),
                backfaceVisibility: 'hidden',
                perspective: '1000px'
              }}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
            
            {/* Countdown */}
            <Reveal effect="slide-up">
              <div className="relative z-20 bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 lg:p-14 border border-fuchsia-500/20 mb-12 sm:mb-16 inline-block">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
                  {countdownItems.map((item, index) => (
                    <CountdownItem key={index} value={item.value} label={item.label} />
                  ))}
                </div>
                
                {/* Newsletter */}
                <div className="mt-8 sm:mt-10 md:mt-14 max-w-xl mx-auto px-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-fuchsia-400 font-['Bebas_Neue'] tracking-wide animate-pulse">
                      ¡ENTÉRATE ANTES QUE NADIE!
                    </h2>
                  </div>
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

      </div>
    </section>
  );
};

export default memo(CountdownSection);
