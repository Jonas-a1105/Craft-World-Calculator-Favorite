import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'sileo/styles.css';
import './index.css';
import './styles/global.css';
import { initGlobalErrorHandlers } from './utils/sileoNotifications';
import { preloadSplashAudio } from './modules/splash';

initGlobalErrorHandlers();
preloadSplashAudio();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

