import React, { Suspense, useState } from 'react';

// Componente lazy para el modelo 3D
const Model3D = React.lazy(() => import('./Model3D'));

interface LazyModel3DProps {
  className?: string;
}

const LazyModel3D: React.FC<LazyModel3DProps> = ({ className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={className}>
      {/* Placeholder mientras carga */}
      {!isLoaded && (
        <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-fuchsia-900/20 rounded-lg flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500 mx-auto mb-4"></div>
            <p className="text-sm">Cargando modelo 3D...</p>
          </div>
        </div>
      )}
      
      <Suspense fallback={null}>
        <Model3D onLoad={() => setIsLoaded(true)} />
      </Suspense>
    </div>
  );
};

export default LazyModel3D;





