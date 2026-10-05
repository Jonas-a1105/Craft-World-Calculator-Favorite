import { useEffect } from 'react';
import { loadFactoryData, FactoryDataRow } from '../services/factoryData';
import { getCraftworldHome } from '../services/api';
import { formatFactoryName } from '../utils/formatters';

export function useFactoryNotifications(language: string) {
  useEffect(() => {
    const isEnabled = localStorage.getItem('craftworld.notificationsEnabled') === 'true';
    if (!isEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    let active = true;
    let factoryRows: FactoryDataRow[] = [];
    let homeDataFactories: any[] = [];

    // Load data once on mount
    Promise.all([loadFactoryData().catch(() => []), getCraftworldHome().catch(() => null)]).then(
      ([rows, home]) => {
        if (!active) return;
        factoryRows = rows;
        homeDataFactories = home?.factories || [];
      },
    );

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

        const levelData = factoryRows.find(
          (r) => r.token === factory.token && r.level === factory.level,
        );
        if (!levelData) continue;

        const durationMin = levelData.duration_min || 0;
        const runtimeSeconds = durationMin * 60;
        const startedMs = new Date(startedAt).getTime();

        // Skip if timer is paused
        if (timer?.pausedAt) continue;

        const elapsedSeconds = Math.floor((Date.now() - startedMs) / 1000);
        const remainingSeconds = runtimeSeconds - elapsedSeconds;

        if (remainingSeconds <= 0) {
          const resourceName = formatFactoryName(factory.token, language);

          const title =
            language === 'es'
              ? `¡Fábrica de ${resourceName} Completada!`
              : `Factory ${resourceName} Completed!`;

          const body =
            language === 'es'
              ? `La producción de ${resourceName} ha finalizado en la parcela.`
              : `${resourceName} production cycle on the plot has finished.`;

          try {
            new Notification(title, {
              body,
              icon: `/assets/resources/${factory.token.charAt(0).toUpperCase() + factory.token.slice(1).toLowerCase()}.png`,
            });
          } catch (e) {
            console.error('Failed to trigger notification:', e);
          }

          // Mark as notified and persist
          notifiedMap[key] = startedAt;
          localStorage.setItem('craftworld.notifiedTimers', JSON.stringify(notifiedMap));
        }
      }
    }, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [language]);
}

export default useFactoryNotifications;
