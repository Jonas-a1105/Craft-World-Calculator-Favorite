import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'sileo/styles.css';
import './index.css';
import './styles/global.css';
import { initGlobalErrorHandlers } from './utils/sileoNotifications';
import { preloadSplashAudio } from './modules/splash';
// Inicialización explícita del sistema avanzado de precios.
// Antes vivía como side-effect de importar priceService; ahora el punto
// de arranque de la app la declara aquí (un único lugar, una sola vez).
import './services/priceService-auto-init';
import { initGameConfig } from './services/gameConfig';

initGlobalErrorHandlers();
preloadSplashAudio();
// Configuración estática oficial del juego: fallbacks compilados ya activos;
// esto carga el snapshot local y refresca por checksum en segundo plano.
initGameConfig();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

