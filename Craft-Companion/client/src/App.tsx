import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from './utils/i18n';
import ProtectedRoute from './components/ProtectedRoute';
import EmpireDashboard from './pages/EmpireDashboard';
import FactoryCompare from './pages/FactoryCompare';
import FactoryTimers from './pages/FactoryTimers';
import InventoryValue from './pages/InventoryValue';
import Landing from './pages/Landing';
import Matrix from './pages/Matrix';
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

export default function App() {
  useEffect(() => {
    // Initialize Theme (Dark by default, Light if chosen)
    const savedTheme = localStorage.getItem('craftworld.theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    const isSolid = localStorage.getItem('craftworld.solidBackground') === 'true';
    const solidColor = localStorage.getItem('craftworld.solidBackgroundColor') || (savedTheme === 'light' ? '#f3f4f6' : '#141415');
    if (isSolid) {
      document.body.classList.add('solid-bg');
      document.documentElement.style.setProperty('--navbar-bg', solidColor);
    } else {
      document.body.classList.remove('solid-bg');
      document.documentElement.style.setProperty('--navbar-bg', savedTheme === 'light' ? '#ffffff' : '#141415');
    }
    document.documentElement.style.setProperty('--bg-solid-override', solidColor);
  }, []);

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <MyHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/empire-dashboard"
            element={
              <ProtectedRoute>
                <EmpireDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resource-planner"
            element={
              <ProtectedRoute>
                <ResourcePlanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profitability"
            element={
              <ProtectedRoute>
                <Profitability />
              </ProtectedRoute>
            }
          />
          <Route path="/calculator" element={<Navigate to="/profitability" replace />} />
          <Route
            path="/inventory-value"
            element={
              <ProtectedRoute>
                <InventoryValue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upgrade-advisor"
            element={
              <ProtectedRoute>
                <UpgradeAdvisor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matrix"
            element={
              <ProtectedRoute>
                <Matrix />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <FactoryCompare />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timers"
            element={
              <ProtectedRoute>
                <FactoryTimers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/value-chain-map"
            element={
              <ProtectedRoute>
                <ValueChainMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prices"
            element={
              <ProtectedRoute>
                <Prices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resource/:symbol"
            element={
              <ProtectedRoute>
                <ResourceDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/encyclopedia"
            element={
              <ProtectedRoute>
                <Encyclopedia />
              </ProtectedRoute>
            }
          />
          <Route path="/factory-encyclopedia" element={<Navigate to="/encyclopedia" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
