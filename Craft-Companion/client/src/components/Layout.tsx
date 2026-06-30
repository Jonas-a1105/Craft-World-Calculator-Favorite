import React, { useMemo, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logout, getCraftworldHome } from '../services/api';
import styles from './Layout.module.css';
import { useTranslation } from '../utils/i18n';
import { loadFactoryData } from '../services/factoryData';

function translateNode(node: any, t: any): any {
  if (node === null || node === undefined) return node;

  if (typeof node === 'string') {
    const trimmed = node.trim();
    if (!trimmed) return node;
    const translated = t(trimmed);
    return node.replace(trimmed, translated);
  }

  if (typeof node !== 'object') {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((child, idx) => {
      const translated = translateNode(child, t);
      if (React.isValidElement(translated) && (translated.key === null || translated.key === undefined)) {
        return React.cloneElement(translated, { key: `trans-${idx}` });
      }
      return translated;
    });
  }

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<any>;
    const type = element.type;

    if (type === 'script' || type === 'style' || type === 'textarea' || type === 'select') {
      return element;
    }

    let newProps = { ...element.props };
    let changed = false;

    if (element.props.placeholder && typeof element.props.placeholder === 'string') {
      const translatedPlaceholder = t(element.props.placeholder);
      if (translatedPlaceholder !== element.props.placeholder) {
        newProps.placeholder = translatedPlaceholder;
        changed = true;
      }
    }

    if (element.props.children) {
      const translatedChildren = translateNode(element.props.children, t);
      if (translatedChildren !== element.props.children) {
        newProps.children = translatedChildren;
        changed = true;
      }
    }

    if (changed) {
      return React.cloneElement(element, newProps);
    }
  }

  return node;
}

export default function Layout({ children }: { children: any }) {
  const location = useLocation();
  const { t, language } = useTranslation();

  const translatedChildren = useMemo(() => {
    return translateNode(children, t);
  }, [children, t]);

  const isTabActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/home', label: t('nav.home') },
    { path: '/empire-dashboard', label: t('nav.empire') },
    { path: '/resource-planner', label: t('nav.planner') },
    { path: '/profitability', label: t('nav.profitability') },
    { path: '/calculator', label: t('nav.calculator') },
    { path: '/inventory-value', label: t('nav.inventoryValue') },
    { path: '/upgrade-advisor', label: t('nav.upgradeAdvisor') },
    { path: '/compare', label: t('nav.compare') },
    { path: '/timers', label: t('nav.timers') },
    { path: '/matrix', label: t('nav.matrix') },
    { path: '/prices', label: t('nav.prices') },
    { path: '/settings', label: t('nav.settings') },
  ];

  const navRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!navRef.current) return;
    const current = navRef.current;
    current.setAttribute('data-down', 'true');
    current.setAttribute('data-start-x', String(e.pageX - current.offsetLeft));
    current.setAttribute('data-scroll-left', String(current.scrollLeft));
  };

  const handleMouseLeave = () => {
    if (!navRef.current) return;
    navRef.current.setAttribute('data-down', 'false');
  };

  const handleMouseUp = () => {
    if (!navRef.current) return;
    navRef.current.setAttribute('data-down', 'false');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!navRef.current || navRef.current.getAttribute('data-down') !== 'true') return;
    e.preventDefault();
    const current = navRef.current;
    const startX = Number(current.getAttribute('data-start-x') || 0);
    const scrollLeftVal = Number(current.getAttribute('data-scroll-left') || 0);
    const x = e.pageX - current.offsetLeft;
    const walk = (x - startX) * 1.8;
    current.scrollLeft = scrollLeftVal - walk;
  };

  useEffect(() => {
    // Automatically scroll the active link into view
    if (!navRef.current) return;
    // Wait a tiny bit to ensure DOM elements have rendered
    setTimeout(() => {
      if (!navRef.current) return;
      const activeEl = navRef.current.querySelector(`[class*="navTabBtnActive"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 100);
  }, [location.pathname]);

  // Background Factory Timer Watcher for Desktop Notifications
  useEffect(() => {
    const isEnabled = localStorage.getItem('craftworld.notificationsEnabled') === 'true';
    if (!isEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    let active = true;
    let factoryRows: any[] = [];
    let homeDataFactories: any[] = [];

    // Load data once on Layout mount
    Promise.all([
      loadFactoryData().catch(() => []),
      getCraftworldHome().catch(() => null)
    ]).then(([rows, home]) => {
      if (!active) return;
      factoryRows = rows;
      homeDataFactories = home?.factories || [];
    });

    // Track already notified runs (plotName -> startedAt) to prevent duplicate alerts
    const notifiedMap: Record<string, string> = (() => {
      try {
        return JSON.parse(localStorage.getItem('craftworld.notifiedTimers') || '{}');
      } catch {
        return {};
      }
    })();

    const interval = setInterval(() => {
      if (factoryRows.length === 0 || homeDataFactories.length === 0) return;

      // Load latest manual/API timer configurations from local storage
      let storedTimers: Record<string, any> = {};
      try {
        storedTimers = JSON.parse(localStorage.getItem('craftworld.factoryTimers.v1') || '{}');
      } catch {}

      for (const factory of homeDataFactories) {
        const key = factory.plotName;
        const timer = storedTimers[key];
        
        const startedAt = timer?.manual ? timer.startedAt : factory.startedAt;
        if (!startedAt) continue;

        // Skip if already notified for this particular cycle start
        if (notifiedMap[key] === startedAt) continue;

        const levelData = factoryRows.find(r => r.token === factory.token && r.level === factory.level);
        if (!levelData) continue;

        const durationMin = levelData.duration_min || 0;
        const runtimeSeconds = durationMin * 60;
        const startedMs = new Date(startedAt).getTime();
        
        // Skip if timer is paused
        if (timer?.pausedAt) continue;

        const elapsedSeconds = Math.floor((Date.now() - startedMs) / 1000);
        const remainingSeconds = runtimeSeconds - elapsedSeconds;

        if (remainingSeconds <= 0) {
          // Trigger system notification
          const resourceName = language === 'es' 
            ? formatFactoryName(factory.token, 'es')
            : formatFactoryName(factory.token, 'en');

          const title = language === 'es'
            ? `¡Fábrica de ${resourceName} Completada!`
            : `Factory ${resourceName} Completed!`;

          const body = language === 'es'
            ? `La producción de ${resourceName} ha finalizado en la parcela.`
            : `${resourceName} production cycle on the plot has finished.`;

          try {
            new Notification(title, {
              body,
              icon: `/assets/resources/${factory.token.charAt(0).toUpperCase() + factory.token.slice(1).toLowerCase()}.png`
            });
          } catch (e) {
            console.error('Failed to trigger notification:', e);
          }

          // Mark as notified and persist
          notifiedMap[key] = startedAt;
          localStorage.setItem('craftworld.notifiedTimers', JSON.stringify(notifiedMap));
        }
      }
    }, 4000); // Check every 4 seconds for a balance between speed and efficiency

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [language]);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <Link to="/home">
            <img src="/assets/logo.png" className={styles.logoImg} alt="Logo" />
          </Link>
        </div>
        
        <div
          className={styles.navCenter}
          ref={navRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ cursor: 'grab' }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.navTabBtn} ${isTabActive(link.path) ? styles.navTabBtnActive : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.navRight}>
          <button
            className="retroBtn retroBtnRed"
            onClick={() => {
              logout();
              window.location.href = '/signin';
            }}
          >
            {t('nav.signOut')}
          </button>
        </div>
      </nav>
      <div className="app-container flex-grow">
        <main className={styles.mainContent}>{translatedChildren}</main>
      </div>
    </div>
  );
}

function formatFactoryName(symbol: string, lang: string): string {
  const normalized = String(symbol || '').trim().toUpperCase();
  if (lang === 'es') {
    switch (normalized) {
      case 'STEEL': return 'Acero';
      case 'WOOD': return 'Madera';
      case 'WATER': return 'Agua';
      case 'ALGAE': return 'Alga';
      case 'BOLTS': return 'Pernos';
      case 'BONESOUP': return 'Sopa de Huesos';
      case 'CEMENT': return 'Cemento';
      case 'CERAMICKEY': return 'Llave Cerámica';
      case 'CERAMICS': return 'Cerámicas';
      case 'CLAY': return 'Arcilla';
      case 'COPPER': return 'Cobre';
      case 'DYNAMITE': return 'Dinamita';
      case 'EARTH': return 'Tierra';
      case 'EXPLOSIVES': return 'Explosivos';
      case 'FERTILIZER': return 'Fertilizante';
      case 'FIRE': return 'Fuego';
      case 'FISH': return 'Pescado';
      case 'GLASS': return 'Vidrio';
      case 'GOLD': return 'Oro';
      case 'GRAIN': return 'Grano';
      case 'IRON': return 'Hierro';
      case 'LEATHER': return 'Cuero';
      case 'LIMESTONE': return 'Caliza';
      case 'MUD': return 'Lodo';
      case 'OXYGEN': return 'Oxígeno';
      case 'PAPER': return 'Papel';
      case 'PLASTIC': return 'Plástico';
      case 'SAND': return 'Arena';
      case 'SCREWS': return 'Tornillos';
      case 'SILICA': return 'Sílice';
      case 'STONE': return 'Piedra';
      case 'SULFUR': return 'Azufre';
      case 'TEXTILE': return 'Textil';
      case 'VEGETABLES': return 'Vegetales';
      case 'GAS': return 'Gas';
      case 'OIL': return 'Petróleo';
      case 'HEAT': return 'Calor';
      case 'ACID': return 'Ácido';
      case 'SEAWATER': return 'Agua de Mar';
      case 'FUEL': return 'Combustible';
      case 'COAL': return 'Carbón';
      case 'AIR': return 'Aire';
      default:
        return symbol.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
    }
  } else {
    return symbol.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  }
}
