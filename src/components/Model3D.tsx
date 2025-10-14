import React, { useEffect, useRef } from 'react';

interface Model3DProps {
  onLoad?: () => void;
}

const Model3D: React.FC<Model3DProps> = ({ onLoad }) => {
  const modelRef = useRef<any>(null);

  useEffect(() => {
    // Cargar el script de model-viewer dinámicamente
    const loadModelViewer = async () => {
      if (typeof window !== 'undefined' && !(window as any).customElements.get('model-viewer')) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
        script.type = 'module';
        document.head.appendChild(script);
        
        script.onload = () => {
          if (onLoad) onLoad();
        };
      } else {
        if (onLoad) onLoad();
      }
    };

    loadModelViewer();
  }, [onLoad]);

  return (
    <model-viewer
      ref={modelRef}
      src="/crunchy/Doritos-3D.glb"
      alt="Empanada Premium con Doritos Flamin' Hot"
      camera-controls
      auto-rotate
      shadow-intensity="0.8"
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
      loading="lazy"
    />
  );
};

export default Model3D;
