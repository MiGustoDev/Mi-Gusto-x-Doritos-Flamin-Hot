import React, { useRef, useEffect, useState } from 'react';
import Reveal from './Reveal';
import SteamOverlay from './SteamOverlay';
import FlameCanvas from './FlameCanvas';
import ConfettiFromLogo from './ConfettiFromLogo';
// import { Bell } from 'lucide-react';

const ProductShowcase: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const epicRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [postArrivalProgress, setPostArrivalProgress] = useState(0); // progreso extra luego de que la empanada llega al contador
  const [edgeProgress, setEdgeProgress] = useState(0); // progreso para imágenes a los bordes tras el logo
  // Notificaciones eliminadas por solicitud
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [logoRevealed, setLogoRevealed] = useState(false);
  const [logoFlash, setLogoFlash] = useState(false);
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
  const handleLogoClick = () => {
    setLogoFlash(true);
    setTimeout(() => setLogoFlash(false), 2000); // Reset después de 2 segundos
  };

  const handleNewsletter = async () => {
    const email = newsletterEmail.trim();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmailValid) {
      setNewsletterStatus('error');
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
      } else {
        setNewsletterStatus('error');
      }
    } catch (e) {
      setNewsletterStatus('error');
    }
  };

  useEffect(() => {
    const update = () => {
      const target = epicRef.current;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const start = vh;           // cuando el top del bloque está en la parte baja de la pantalla
      const end = vh * 0.35;      // hasta que llega a 35% de la pantalla
      const raw = 1 - (rect.top - end) / (start - end);
      const clamped = Math.max(0, Math.min(1, raw));
      setScrollProgress(clamped);

      // progreso adicional una vez que rect.top pasó por debajo de "end" (empanada ya llegó)
      // En mobile, activar más temprano para que los TubitosDinamita aparezcan antes
      // En desktop, también activar más temprano para que aparezcan antes
      const isMobile = window.innerWidth < 768;
      const overshootMultiplier = isMobile ? 0.2 : 0.15; // En desktop, activar con menos scroll (0.15 vs 0.35)
      const overshoot = (end - rect.top) / (vh * overshootMultiplier); // 0→1 en menos viewport
      const overshootClamped = Math.max(0, Math.min(1, overshoot));
      setPostArrivalProgress(overshootClamped);

      // Progreso para las imágenes a los bordes tras el LogoEmp
      const logo = logoRef.current;
      if (logo) {
        const logoRect = logo.getBoundingClientRect();
        const startLogo = vh;        // top del bloque en la parte baja
        const endLogo = vh * 0.45;   // hasta que llega cerca de la mitad superior
        const rawLogo = 1 - (logoRect.top - endLogo) / (startLogo - endLogo);
        // Gate: que empiece a 0 y recién se active cerca del LogoEmp
        const gated = Math.max(0, Math.min(1, (rawLogo - 0.8) / 0.2)); // activa ~80%→100%
        setEdgeProgress(gated);
        
        // Disparar confetti cuando los tubitos laterales aparezcan
        // if (gated > 0.3 && !showConfetti) { // Eliminado
        //   setShowConfetti(true); // Eliminado
        //   // Reset confetti después de 4 segundos // Eliminado
        //   setTimeout(() => setShowConfetti(false), 4000); // Eliminado
        // } // Eliminado
      }
    };
    const onScroll = () => requestAnimationFrame(update);
    update();
    window.addEventListener('scroll', onScroll, { passive: true } as any);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-24 md:py-28 relative overflow-hidden">
      {(() => { /* easing precomputado para transiciones suaves en bordes */ return null; })()}
      {/* Background más intenso */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/70 to-black" />
      <div className="absolute inset-0 gradient-bg opacity-80" />
      {/* Fade superior para fusionar con el video */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
      {/* Fade inferior para transición hacia CTA */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Empanada Revolucionaria: mover debajo del video (al inicio de esta sección) - Optimizado para mobile */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          {/* Logo grande arriba del título - Optimizado para mobile */}
          <div ref={logoRef} className="mb-12 sm:mb-2 -mt-20 sm:-mt-12 md:-mt-20 lg:-mt-24 relative px-0 sm:px-4">
            <img
              src="/LogoEmp.png"
              alt="Logo Empanada"
              onClick={handleLogoClick}
              className={`mx-auto w-full sm:w-80 md:w-[28rem] lg:w-[32rem] xl:w-[56rem] h-auto cursor-pointer transition-all duration-1000 ${
                logoRevealed ? 'opacity-100 translate-y-0 scale-100 shine logo-float' : 'opacity-0 translate-y-10 scale-95'
              } ${logoFlash ? 'logo-flash' : ''}`}
            />
            <ConfettiFromLogo trigger={logoRevealed} duration={5000} />
            {/* Imágenes a bordes de pantalla que aparecen tras el logo */}
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/2 w-screen -z-[1]">
              {/* Izquierda: TubitoDinamita2 (visible en mobile) */}
              <Reveal effect="fade" className="block md:block absolute left-0 -translate-y-1/2">
                <div className="relative">
                  <img
                    src="/TubitoDinamita2.png"
                    alt="Tubito Dinamita (izquierda)"
                    className="w-32 md:w-48 lg:w-56 will-change-transform"
                    style={{
                      filter: 'drop-shadow(0 10px 20px rgba(255,0,64,0.25))',
                      transition: 'transform 600ms cubic-bezier(.22,.61,.36,1), opacity 600ms ease',
                      opacity: 0.1 + edgeProgress * 0.9,
                      transform: `translateX(${(-120 + edgeProgress * 90)}%)`
                    }}
                    loading="lazy"
                  />
                </div>
              </Reveal>
              {/* Derecha: TubitoDinamita (visible en mobile) */}
              <Reveal effect="fade" delay={1} className="block md:block absolute right-0 -translate-y-1/2">
                <div className="relative">
                  <img
                    src="/TubitoDinamita.png"
                    alt="Tubito Dinamita (derecha)"
                    className="w-36 md:w-52 lg:w-60 will-change-transform"
                    style={{
                      filter: 'drop-shadow(0 12px 24px rgba(255,0,64,0.3))',
                      transition: 'transform 600ms cubic-bezier(.22,.61,.36,1), opacity 600ms ease',
                      opacity: 0.1 + edgeProgress * 0.9,
                      transform: `translateX(${(120 - edgeProgress * 90)}%)`
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
                {/* FlameCanvas de toda la card (único, desde el borde inferior) */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <FlameCanvas className="absolute inset-0" density={2.5} colorAlpha={1.2} shadowBlur={25} />
                </div>
                
                {/* Contenedor del modelo 3D - se extiende sin límites - Optimizado para mobile */}
                <div className="relative z-5 w-full h-[400px] sm:h-[500px] md:h-[700px] lg:h-[800px] -m-2 md:-m-4">
                  {/* Vapor detras */}
                  <div className="pointer-events-none absolute inset-0 z-0">
                    <SteamOverlay intensity={0.85} className="absolute inset-0" />
                  </div>
                  <model-viewer
                    src="/Doritos-3D.glb"
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
                icon: "🔥"
              },
              {
                title: "Topping Crujiente",
                description: "Doritos Flamin' Hot molidos incorporados para un contraste de texturas único",
                icon: (
                  <img
                    src="/dorito.png"
                    alt="Dorito"
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 inline-block"
                    loading="lazy"
                  />
                )
              }
            ].map((item, index) => (
              <Reveal key={index} effect="scale" delay={(index % 3) as 0 | 1 | 2}>
                <div className="feature-card-pro">
                  <div className="flex items-start gap-3 sm:gap-4">
                  <div className="feature-icon-pro">
                    {typeof item.icon === 'string' ? (
                      <span className="text-2xl sm:text-3xl md:text-4xl">{item.icon}</span>
                    ) : (
                      item.icon
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base sm:text-lg md:text-xl mb-1 leading-tight tracking-wide">{item.title}</h4>
                    <p className="text-purple-200 leading-relaxed text-xs sm:text-sm md:text-base max-w-sm">{item.description}</p>
                  </div>
                </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Section Header (badge removido) - Optimizado para mobile */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <div ref={epicRef} className="relative inline-block">
            <h3 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl leading-none tracking-wide font-black flame-text text-shadow-glow font-['Bebas_Neue'] mb-6 sm:mb-8 px-4">
              ALGO EPICO ESTA LLEGANDO
            </h3>
            {/* Imagen izquierda - Visible en mobile */}
            <img
              src="/CRUNCHY.png"
              alt="Empanada abierta"
              className="pointer-events-none block md:block absolute -left-6 md:-left-16 top-1/2 w-48 md:w-96 lg:w-[28rem] drop-shadow-2xl z-30 will-change-transform"
              style={{
                transform: `translateY(${window.innerWidth < 768 ? '55%' : '-50%'}) translateX(${(-56 + 44 * scrollProgress)}vw) scale(${0.9 + 0.25 * scrollProgress})`,
                opacity: Math.min(1, Math.max(0, scrollProgress))
              }}
              loading="lazy"
            />
            {/* Doritos Tubito Dinamita detrás de la empanada izquierda */}
            {(() => {
              // Revelar solo después de que la empanada llegue al contador
              // Al inicio (reveal=0) quedan exactamente DETRÁS de la empanada y no se ven
              const reveal = Math.max(0, Math.min(1, (postArrivalProgress - 0.05) / 0.95));
              const empanadaX = -56 + 44 * scrollProgress; // posición de la empanada (más cerca del contador)
              // Los tubitos empiezan detrás de la empanada y solo se asoman ligeramente hacia la izquierda
              const tubitosX = empanadaX - (5 * Math.max(0, reveal)); // movimiento muy sutil, solo para asomarse
              return (
                <img
                  src="/TubitoDinamita.png"
                  alt="Doritos Dinamita"
                  className="pointer-events-none block md:block absolute -left-6 md:-left-16 top-1/2 w-32 md:w-56 lg:w-64 will-change-transform z-[2]"
                  style={{
                    transform: `translateY(${window.innerWidth < 768 ? '55%' : '-50%'}) translateX(${tubitosX}vw) rotate(-10deg) scale(${0.82 + 0.16 * Math.max(0, reveal)})`,
                    opacity: Math.max(0, reveal),
                    filter: 'drop-shadow(0 12px 24px rgba(255,0,64,0.35))'
                  }}
                  loading="lazy"
                />
              );
            })()}
            {/* Tubito Dinamita derecho: coreografía espejada del izquierdo, tamaño menor y detrás del Flamin Hot */}
            {(() => {
              const reveal = Math.max(0, Math.min(1, (postArrivalProgress - 0.05) / 0.95));
              // Posición de referencia para el lado derecho (espejo del cálculo de la empanada izquierda)
              const flaminX = 52 - 40 * scrollProgress;
              // Los tubitos empiezan detrás del Flamin Hot y solo se asoman ligeramente hacia la derecha
              const tubitosXRight = flaminX + (5 * reveal); // movimiento muy sutil, solo para asomarse
              const scaleRight = 0.82 + 0.16 * reveal; // misma curva de escala
              return (
                <img
                  src="/TubitoDinamita2.png"
                  alt="Tubito Dinamita"
                  className="pointer-events-none block md:block absolute -right-6 md:-right-16 top-1/2 w-28 md:w-44 lg:w-56 will-change-transform z-[2]"
                  style={{
                    transform: `translateY(${window.innerWidth < 768 ? '65%' : '-50%'}) translateX(${tubitosXRight}vw) rotate(10deg) scale(${scaleRight})`,
                    opacity: Math.max(0, reveal),
                    filter: 'drop-shadow(0 10px 20px rgba(255,0,64,0.25))'
                  }}
                  loading="lazy"
                />
              );
            })()}
            
            {/* Imagen derecha - Flamin Hot - Visible en mobile */}
            <img
              src="/FlaminHot.png"
              alt="Doritos Flamin' Hot"
              className="pointer-events-none block md:block absolute -right-6 md:-right-16 top-1/2 w-48 md:w-96 lg:w-[28rem] drop-shadow-2xl z-20 will-change-transform"
              style={{
                transform: `translateY(${window.innerWidth < 768 ? '65%' : '-50%'}) translateX(${(52 - 40 * scrollProgress)}vw) scale(${0.9 + 0.25 * scrollProgress})`,
                opacity: Math.min(1, Math.max(0, scrollProgress))
              }}
              loading="lazy"
            />
            {/* Countdown movido aquí - Optimizado para mobile */}
            <Reveal effect="slide-up">
              <div className="relative z-20 bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 lg:p-14 border border-fuchsia-500/20 mb-12 sm:mb-16 inline-block">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
                {[
                  { value: timeLeft.days, label: 'DÍAS' },
                  { value: timeLeft.hours, label: 'HORAS' },
                  { value: timeLeft.minutes, label: 'MINUTOS' },
                  { value: timeLeft.seconds, label: 'SEGUNDOS' }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-lg sm:rounded-2xl p-3 sm:p-6 md:p-8 mb-2 sm:mb-4 pulse-glow">
                      <div className="text-xl sm:text-3xl md:text-4xl lg:text-6xl font-black text-white font-['Bebas_Neue']">
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
      <div className="relative z-10 mt-4 sm:mt-6">
        <div className="marquee bg-gradient-to-r from-fuchsia-700/80 via-purple-700/80 to-fuchsia-700/80 border-y-2 border-fuchsia-500/50 py-4 sm:py-6 md:py-7">
          <div className="marquee-track text-black font-extrabold tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">
            <span className="text-2xl sm:text-3xl md:text-5xl lg:text-8xl font-['Bebas_Neue'] uppercase px-4 sm:px-6 md:px-10 whitespace-nowrap">Pican, pero rico! — Pican, pero rico! — Pican, pero rico! — Pican, pero rico!</span>
            <span className="text-2xl sm:text-3xl md:text-5xl lg:text-8xl font-['Bebas_Neue'] uppercase px-4 sm:px-6 md:px-10 whitespace-nowrap">Pican, pero rico! — Pican, pero rico! — Pican, pero rico! — Pican, pero rico!</span>
          </div>
        </div>
      </div>


      </div>
    </section>
  );
};

export default ProductShowcase;