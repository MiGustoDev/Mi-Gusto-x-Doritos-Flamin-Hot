import React from 'react';
import FlameCanvas from './FlameCanvas';
import Reveal from './Reveal';
import { Instagram } from 'lucide-react';
import { useComponentAnalytics } from '../hooks/useComponentAnalytics';
import { trackEvent } from '../analytics';

// Iconos inline con estilo de trazo para que coincidan con Lucide
// Icono oficial de X (Twitter) basado en Simple Icons, con relleno para buena legibilidad
const XTwitterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    className={className}
    aria-hidden="true"
    fill="currentColor"
  >
    <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.422l-5.02-6.545L5.77 22H2.5l8.06-9.202L2 2h6.578l4.53 6.06L18.244 2Zm-1.126 18.286h1.86L7.94 3.636H6.01l11.108 16.65Z"/>
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    fill="none"
  >
    {/* TikTok de trazo para armonizar con Lucide */}
    <path
      d="M14.5 3c.4 2.1 1.9 3.9 4 4.4v2.2c-1.5-.1-2.9-.7-4-1.6v6.6a6 6 0 11-6-6c.5 0 1 .1 1.5.2v2.5c-.5-.2-1-.3-1.5-.3a3.7 3.7 0 103.7 3.7V3h2.3z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

const CallToAction: React.FC = () => {
  const ref = useComponentAnalytics('CallToAction');
  return (
    <section ref={ref as any} data-section="cta" className="py-4 sm:py-12 md:py-16 relative overflow-visible">
      
      {/* Background con efecto de llamas MÁS INTENSO que pasa por encima de la pasarela */}
      <div className="absolute left-0 right-0 bottom-0 w-full h-[760px] sm:h-[880px] z-[15] pointer-events-none">
        <FlameCanvas className="w-full h-full" density={1.2} colorAlpha={1.8} shadowBlur={40} />
      </div>
      
      
      {/* Gradiente superior para suavizar el corte entre el footer y el fondo superior en mobile */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-16 z-[3] block sm:hidden" style={{
        background: 'linear-gradient(to bottom, #1a0020 0%, rgba(26,0,32,0.0) 100%)'
      }} />
      
      {/* Sección de Newsletter eliminada por solicitud */}

        {/* Footer */}
        <div className="relative z-[20] max-w-6xl mx-auto px-4">
          <div className="pt-2 sm:pt-6 md:pt-8">
            {/* Mobile Layout - Simplificado */}
            <div className="md:hidden">
              {/* Logos */}
              <div className="text-left mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src="/crunchy/Logo Mi Gusto 2025.png"
                    alt="Mi Gusto"
                    className="h-8 w-auto object-contain"
                    loading="lazy"
                  />
                  <span className="text-white font-bold text-lg">×</span>
                  <img
                    src="/crunchy/pngegg.png"
                    alt="Doritos"
                    className="h-8 w-auto object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="text-sm flame-text-inline">Flamin' Hot Experience</div>
              </div>
              
              {/* Redes Sociales */}
              <div className="text-right mb-2 -mt-16">
                <h4 className="text-white font-bold text-sm mb-2 flex items-center justify-end gap-2">
                  <Instagram className="w-4 h-4" style={{ stroke: 'url(#flame-stroke)', fill: 'none', strokeWidth: 2 }} />
                  Síguenos en Redes
                </h4>
                <div className="flex gap-3 justify-end">
                  <a
                    href="https://www.instagram.com/migustoar/?hl=es"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center hover:scale-110 transition-transform duration-200 text-white hover:text-fuchsia-400"
                    title="Instagram"
                    onClick={() => trackEvent('link_click', { link_url: 'https://www.instagram.com/migustoar/?hl=es', link_domain: 'instagram.com', location: 'footer', outbound: true, network: 'instagram' })}
                  >
                    <Instagram className="w-6 h-6 text-white" />
                  </a>
                  <a
                    href="https://x.com/migustoar?lang=es"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center hover:scale-110 transition-transform duration-200 text-white hover:text-fuchsia-400"
                    title="X (Twitter)"
                    onClick={() => trackEvent('link_click', { link_url: 'https://x.com/migustoar?lang=es', link_domain: 'x.com', location: 'footer', outbound: true, network: 'x' })}
                  >
                    <XTwitterIcon className="w-6 h-6 text-white" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@migustoar?lang=es"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center hover:scale-110 transition-transform duration-200 text-white hover:text-fuchsia-400"
                    title="TikTok"
                    onClick={() => trackEvent('link_click', { link_url: 'https://www.tiktok.com/@migustoar?lang=es', link_domain: 'tiktok.com', location: 'footer', outbound: true, network: 'tiktok' })}
                  >
                    <TikTokIcon className="w-6 h-6 text-white" />
                  </a>
                </div>
              </div>
              
              {/* Copyright */}
              <div className="text-center mt-4">
                <p className="text-purple-400 text-sm">© 2025 Mi Gusto. Todos los derechos reservados.</p>
                
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:grid grid-cols-3 items-center gap-6">
              <div className="flex items-center gap-4 justify-self-start">
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <img
                      src="/crunchy/Logo Mi Gusto 2025.png"
                      alt="Mi Gusto"
                      className="h-10 w-auto object-contain"
                      loading="lazy"
                    />
                    <span className="text-white font-bold text-lg">×</span>
                    <img
                      src="/crunchy/pngegg.png"
                      alt="Doritos"
                      className="h-10 w-auto object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-base flame-text-inline">Flamin' Hot Experience</div>
                </div>
              </div>
              
              <Reveal effect="fade" delay={1} className="text-purple-400 text-base text-center justify-self-center">
                <p>© 2025 Mi Gusto. Todos los derechos reservados.</p>
                
              </Reveal>

              <div className="justify-self-end text-right">
                <Reveal effect="slide-up" className="text-right">
                  <h4 className="text-white font-bold text-sm md:text-base mb-3 flex items-center gap-2 justify-end md:justify-end">
                    <Instagram className="w-4 h-4" style={{ stroke: 'url(#flame-stroke)', fill: 'none', strokeWidth: 2 }} />
                    Síguenos en Redes
                  </h4>
                </Reveal>
                <Reveal effect="slide-up" className="flex gap-3 md:gap-4 justify-end">
                  {[
                    { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/migustoar/?hl=es' },
                    { icon: XTwitterIcon, label: 'X (Twitter)', href: 'https://x.com/migustoar?lang=es' },
                    { icon: TikTokIcon, label: 'TikTok', href: 'https://www.tiktok.com/@migustoar?lang=es' }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href || '#'}
                      target={social.href ? '_blank' : undefined}
                      rel={social.href ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center justify-center hover:scale-110 transition-transform duration-200 text-white hover:text-fuchsia-400"
                      title={social.label}
                    >
                      <social.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </a>
                  ))}
                </Reveal>
              </div>
            </div>
          </div>
        </div>

        {/* Efecto final sutil (opcional): mantenemos el canvas de fondo */}
    </section>
  );
};

export default CallToAction;