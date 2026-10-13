import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import { LanguageProvider } from './utils/i18n';
import ProtectedRoute from './components/ProtectedRoute';
import { ModuleErrorBoundary } from './components/ModuleErrorBoundary';
import { Toaster } from 'sileo';
import { useSileoConfig } from './utils/sileoNotifications';
import NotFound from './pages/NotFound';
import EmpireDashboard from './pages/EmpireDashboard';
import FactoryCompare from './pages/FactoryCompare';
import FactoryTimers from './pages/FactoryTimers';
import InventoryValue from './pages/InventoryValue';
import Landing from './pages/Landing';
import MyHome from './pages/MyHome';
import Profitability from './pages/Profitability';
import ResourcePlanner from './pages/ResourcePlanner';
import Settings from './pages/Settings';
import SignIn from './pages/SignIn';
import UpgradeAdvisor from './pages/UpgradeAdvisor';
import ValueChainMap from './pages/ValueChainMap';
import Prices from './pages/Prices';
import ResourceDetail from './pages/ResourceDetail';
import Encyclopedia from './pages/Encyclopedia';
import Masterpiece from './pages/Masterpiece';
import UpgradeSimulator from './pages/UpgradeSimulator';
import PowerSimulator from './pages/PowerSimulator';
import BaseCost from './pages/BaseCost';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Splash from './pages/Splash';
import TradingBot from './pages/TradingBot';
import { fetchRoninPoolsData } from './services/roninPoolsService';

// Ruta protegida = sesión válida + aislamiento de errores por módulo (QW3):
// un crash de render en una sección no tumba todo el árbol de la app.
const P = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <ModuleErrorBoundary>{children}</ModuleErrorBoundary>
  </ProtectedRoute>
);

export default function App() {
  const { config: sileoConfig } = useSileoConfig();

  useEffect(() => {
    // Theme: dark OLED only (LP3 — the broken light-mode toggle was removed;
    // force dark for anyone with a legacy 'light' value saved).
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.setAttribute('data-theme', 'dark');
    try {
      localStorage.setItem('craftworld.theme', 'dark');
    } catch {}

    const isSolid = localStorage.getItem('craftworld.solidBackground') === 'true';
    const solidColor = localStorage.getItem('craftworld.solidBackgroundColor') || '#141415';
    if (isSolid) {
      document.body.classList.add('solid-bg');
      document.documentElement.style.setProperty('--navbar-bg', solidColor);
    } else {
      document.body.classList.remove('solid-bg');
      document.documentElement.style.setProperty('--navbar-bg', '#141415');
    }
    document.documentElement.style.setProperty('--bg-solid-override', solidColor);

    // Preload Katana V3 pools into global memory cache
    fetchRoninPoolsData().catch(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position={sileoConfig.position}
        theme={sileoConfig.theme}
        options={{
          fill: sileoConfig.fill,
          roundness: sileoConfig.roundness,
          autopilot: sileoConfig.autopilot,
        }}
      />
      <LanguageProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/splash" element={<Splash />} />
          <Route path="/signin" element={<SignIn />} />
          <Route
            path="/home"
            element={
              <P>
                <MyHome />
              </P>
            }
          />
          <Route
            path="/empire-dashboard"
            element={
              <P>
                <EmpireDashboard />
              </P>
            }
          />
          <Route
            path="/resource-planner"
            element={
              <P>
                <ResourcePlanner />
              </P>
            }
          />
          <Route
            path="/profitability"
            element={
              <P>
                <Profitability />
              </P>
            }
          />
          <Route path="/calculator" element={<Navigate to="/profitability" replace />} />
          <Route
            path="/inventory-value"
            element={
              <P>
                <InventoryValue />
              </P>
            }
          />
          <Route
            path="/upgrade-advisor"
            element={
              <P>
                <UpgradeAdvisor />
              </P>
            }
          />
          <Route
            path="/upgrade-simulator"
            element={
              <P>
                <UpgradeSimulator />
              </P>
            }
          />
          <Route
            path="/power-simulator"
            element={
              <P>
                <PowerSimulator />
              </P>
            }
          />
          <Route
            path="/base-cost"
            element={
              <P>
                <BaseCost />
              </P>
            }
          />
          <Route
            path="/matrix"
            element={<Navigate to="/base-cost" replace />}
          />
          <Route
            path="/compare"
            element={
              <P>
                <FactoryCompare />
              </P>
            }
          />
          <Route
            path="/timers"
            element={
              <P>
                <FactoryTimers />
              </P>
            }
          />
          <Route
            path="/settings"
            element={
              <P>
                <Settings />
              </P>
            }
          />
          <Route
            path="/value-chain-map"
            element={
              <P>
                <ValueChainMap />
              </P>
            }
          />
          <Route
            path="/prices"
            element={
              <P>
                <Prices />
              </P>
            }
          />
          <Route
            path="/trading-bot"
            element={
              <P>
                <TradingBot />
              </P>
            }
          />
          <Route
            path="/resource/:symbol"
            element={
              <P>
                <ResourceDetail />
              </P>
            }
          />
          <Route
            path="/encyclopedia"
            element={
              <P>
                <Encyclopedia mode="encyclopedia" />
              </P>
            }
          />
          <Route
            path="/encyclopedia/events"
            element={
              <P>
                <Encyclopedia mode="events" />
              </P>
            }
          />
          <Route
            path="/masterpiece"
            element={
              <P>
                <Masterpiece />
              </P>
            }
          />
          <Route path="/events" element={<Navigate to="/encyclopedia/events" replace />} />
          <Route path="/factory-encyclopedia" element={<Navigate to="/encyclopedia" replace />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/politica-de-privacidad" element={<Navigate to="/privacy" replace />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/terminos-y-condiciones" element={<Navigate to="/terms" replace />} />
          <Route path="/legal" element={<Navigate to="/terms" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  </QueryClientProvider>
  );
}
