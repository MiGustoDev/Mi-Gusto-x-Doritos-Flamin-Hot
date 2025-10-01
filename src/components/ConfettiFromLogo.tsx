import React, { useEffect, useRef, useState } from 'react';

interface ConfettiFromLogoProps {
  trigger: boolean;
  duration?: number;
  imageSrc?: string;
  count?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  life: number; // 1.0 ... 0.0
  createdAt: number;
}

const ConfettiFromLogo: React.FC<ConfettiFromLogoProps> = ({
  trigger,
  duration = 5000,
  imageSrc = '/Tubito.png',
  count = 10,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Crea una explosión de partículas desde el centro del contenedor
  const createExplosion = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const now = Date.now();
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed = 3 + Math.random() * 2.5;
      return {
        id: now + i + Math.random(),
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (1.5 + Math.random()),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4,
        scale: 0.9 + Math.random() * 0.5,
        life: 1,
        createdAt: now,
      };
    });
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Animación de partículas
  useEffect(() => {
    if (!trigger) {
      setParticles([]);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (containerRef.current) {
        containerRef.current.style.opacity = '1';
        containerRef.current.style.transition = 'none';
      }
      return;
    }
    startTimeRef.current = Date.now();
    setParticles([]);
    createExplosion();
    const second = setTimeout(() => createExplosion(), 500);

    // Fade out del contenedor
    const fadeTimeout = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.opacity = '0';
        containerRef.current.style.transition = 'opacity 1.2s ease-out';
      }
    }, duration - 1200);

    // Animación
    const animate = () => {
      setParticles(prev => prev.map(p => {
        // Física
        const newX = p.x + p.vx;
        const newY = p.y + p.vy;
        const newVX = p.vx * 0.98;
        const newVY = p.vy * 0.98 + 0.18; // gravedad
        const newRot = p.rotation + p.rotationSpeed;
        // Fade-out basado en tiempo
        const age = Date.now() - p.createdAt;
        let newLife = 1 - age / duration;
        if (newLife < 0) newLife = 0;
        return {
          ...p,
          x: newX,
          y: newY,
          vx: newVX,
          vy: newVY,
          rotation: newRot,
          life: newLife,
        };
      }).filter(p => p.life > 0.01));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);

    // Limpieza
    return () => {
      clearTimeout(second);
      clearTimeout(fadeTimeout);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (containerRef.current) {
        containerRef.current.style.opacity = '1';
        containerRef.current.style.transition = 'none';
      }
    };
  }, [trigger, duration, count]);

  if (!trigger && particles.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-[9999]"
      style={{ width: '100%', height: '100%', transition: 'opacity 1.2s ease-out' }}
    >
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: p.x,
            top: p.y,
            width: 32,
            height: 32,
            opacity: p.life,
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
            pointerEvents: 'none',
            transition: 'opacity 0.5s',
            zIndex: 10000,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
          }}
        >
          <img
            src={imageSrc}
            alt="Confetti"
            style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
};

export default ConfettiFromLogo;
