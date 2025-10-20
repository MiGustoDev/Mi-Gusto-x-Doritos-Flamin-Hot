import React, { Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import './App.css';

// Lazy load de componentes pesados
const Hero = lazy(() => import('./components/Hero'));
const CountdownSection = lazy(() => import('./components/CountdownSection'));
const ProductShowcase = lazy(() => import('./components/ProductShowcase'));
const CallToAction = lazy(() => import('./components/CallToAction'));

function App() {
  return (
    <div className="min-h-screen page-bg overflow-hidden">
      {/* Definiciones SVG globales para gradientes reutilizables */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="flame-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF0040">
              <animate attributeName="stop-color" values="#FF0040;#FF6B00;#FFFF00;#FF0080;#FF0040" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#FF6B00">
              <animate attributeName="stop-color" values="#FF6B00;#FFFF00;#FF0080;#FF0040;#FF6B00" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#FFFF00">
              <animate attributeName="stop-color" values="#FFFF00;#FF0080;#FF0040;#FF6B00;#FFFF00" dur="4s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
      </svg>

      <Navbar />
      <div className="relative">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-fuchsia-500 mx-auto mb-4"></div>
              <p className="text-white text-lg">Cargando experiencia épica...</p>
            </div>
          </div>
        }>
          <Hero />
          <CountdownSection />
          <ProductShowcase />
          <CallToAction />
        </Suspense>
      </div>
    </div>
  );
}

export default App;