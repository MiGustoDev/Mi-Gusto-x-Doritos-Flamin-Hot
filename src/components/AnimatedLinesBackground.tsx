import React, { useEffect, useRef, useState } from 'react';

interface AnimatedLinesBackgroundProps {
  className?: string;
  intensity?: number; // 0-1, controla la intensidad de las líneas
  speed?: number; // Velocidad de la animación
}

const AnimatedLinesBackground: React.FC<AnimatedLinesBackgroundProps> = ({ 
  className = '', 
  intensity = 0.6,
  speed = 1 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lines: AnimatedLine[] = [];
    let animationId: number;

    interface AnimatedLine {
      x: number;
      y: number;
      width: number;
      height: number;
      speed: number;
      direction: number; // 1 para derecha, -1 para izquierda
      opacity: number;
      color: string;
      life: number;
      maxLife: number;
    }

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    const createLine = (): AnimatedLine => {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      return {
        x: Math.random() > 0.5 ? -50 : canvasWidth + 50, // Empieza fuera de la pantalla
        y: Math.random() * canvasHeight,
        width: Math.random() * 200 + 100, // Ancho variable
        height: Math.random() * 3 + 1, // Grosor variable
        speed: (Math.random() * 2 + 1) * speed, // Velocidad variable
        direction: Math.random() > 0.5 ? 1 : -1, // Dirección aleatoria
        opacity: Math.random() * 0.4 + 0.1, // Opacidad baja
        color: `hsl(${Math.random() * 30 + 10}, 100%, ${Math.random() * 20 + 60}%)`, // Colores naranjas/rojos
        life: 0,
        maxLife: Math.random() * 200 + 100
      };
    };

    const initLines = () => {
      lines = [];
      const numLines = Math.floor((canvas.width * canvas.height) / 50000 * intensity * 10);
      for (let i = 0; i < numLines; i++) {
        lines.push(createLine());
      }
    };

    const updateLine = (line: AnimatedLine) => {
      line.life++;
      line.x += line.speed * line.direction;
      
      // Fade in/out effect
      const lifeRatio = line.life / line.maxLife;
      if (lifeRatio < 0.1) {
        line.opacity = (lifeRatio / 0.1) * 0.4 * intensity;
      } else if (lifeRatio > 0.8) {
        line.opacity = ((1 - lifeRatio) / 0.2) * 0.4 * intensity;
      } else {
        line.opacity = 0.4 * intensity;
      }
    };

    const drawLine = (line: AnimatedLine) => {
      ctx.save();
      ctx.globalAlpha = line.opacity;
      
      // Crear gradiente para cada línea
      const gradient = ctx.createLinearGradient(
        line.x, line.y,
        line.x + line.width * line.direction, line.y
      );
      
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.3, line.color);
      gradient.addColorStop(0.7, line.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(line.x, line.y - line.height / 2, line.width * line.direction, line.height);
      
      // Añadir efecto de brillo
      ctx.shadowColor = line.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(line.x, line.y - line.height / 2, line.width * line.direction, line.height);
      
      ctx.restore();
    };

    const animate = () => {
      if (!shouldAnimate) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Actualizar y dibujar líneas
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        updateLine(line);
        drawLine(line);
        
        // Remover líneas que salieron de la pantalla o expiraron
        if (line.x < -200 || line.x > canvas.width + 200 || line.life > line.maxLife) {
          lines.splice(i, 1);
          lines.push(createLine()); // Crear nueva línea
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };

    // Intersection Observer para activar animación solo cuando es visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldAnimate(true);
            resizeCanvas();
            initLines();
            animate();
          } else {
            setShouldAnimate(false);
            if (animationId) {
              cancelAnimationFrame(animationId);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(container);

    // Resize handler
    const handleResize = () => {
      resizeCanvas();
      initLines();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [intensity, speed, shouldAnimate]);

  return (
    <div ref={containerRef} className={`absolute inset-0 ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full pointer-events-none"
        style={{ 
          background: 'transparent',
          mixBlendMode: 'screen' // Mezcla con el fondo para efecto más suave
        }}
      />
    </div>
  );
};

export default AnimatedLinesBackground;




