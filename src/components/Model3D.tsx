import React, { useEffect, useRef, useState } from 'react';

interface Model3DProps {
  onLoad?: () => void;
}

const Model3D: React.FC<Model3DProps> = ({ onLoad }) => {
  const modelRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Intersection Observer para cargar el modelo solo cuando sea visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoad) {
            setShouldLoad(true);
          }
        });
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (modelRef.current) {
      observer.observe(modelRef.current);
    }

    return () => {
      if (modelRef.current) {
        observer.unobserve(modelRef.current);
      }
    };
  }, [shouldLoad]);

  useEffect(() => {
    if (!shouldLoad) return;

    // Cargar el script de model-viewer dinámicamente
    const loadModelViewer = async () => {
      if (typeof window !== 'undefined' && !(window as any).customElements.get('model-viewer')) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
        script.type = 'module';
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
        
        script.onload = () => {
          setIsLoaded(true);
          if (onLoad) onLoad();
        };
      } else {
        setIsLoaded(true);
        if (onLoad) onLoad();
      }
    };

    loadModelViewer();
  }, [shouldLoad, onLoad]);

  if (!shouldLoad) {
    return (
      <div 
        ref={modelRef}
        style={{ 
          width: 'calc(100% + 32px)', 
          height: 'calc(100% + 64px)', 
          outline: 'none', 
          background: 'transparent', 
          position: 'absolute',
          top: '-80px',
          left: '-16px',
          zIndex: 1,
          transform: 'scale(0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="animate-pulse bg-fuchsia-500/20 rounded-lg w-32 h-32"></div>
      </div>
    );
  }

  return (
    <model-viewer
      ref={modelRef}
      src="/crunchy/Doritos-3D.glb"
      alt="Empanada Premium con Doritos Flamin' Hot"
      camera-controls
      auto-rotate
      shadow-intensity="0.6"
      exposure="1.0"
      interaction-prompt="none"
      disable-zoom
      camera-orbit="90deg 75deg 140%"
      min-camera-orbit="auto auto 120%"
      field-of-view="40deg"
      min-field-of-view="35deg"
      tone-mapping="neutral"
      style={{ 
        width: 'calc(100% + 32px)', 
        height: 'calc(100% + 64px)', 
        outline: 'none', 
        background: 'transparent', 
        position: 'absolute',
        top: '-80px',
        left: '-16px',
        zIndex: 1,
        transform: 'scale(0.95)'
      }}
      loading="eager"
      reveal="auto"
      poster="/crunchy/LogoEmp.png"
    />
  );
};

export default Model3D;
