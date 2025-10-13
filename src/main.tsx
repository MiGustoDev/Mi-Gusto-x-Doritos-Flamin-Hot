import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAnalytics, trackPageview, enableAutoTracking } from './analytics';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Initialize GA and send first page view after mount
initAnalytics();
trackPageview();
enableAutoTracking();
