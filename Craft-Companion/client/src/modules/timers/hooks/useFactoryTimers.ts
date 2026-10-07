import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { getCraftworldHome } from '../../../services/api';
import { loadFactoryData, type FactoryDataRow } from '../../../services/factoryData';
import { sendFactoryNotification } from '../../../utils/notifications';
import { extractActiveRuns } from '../services/factoryTimersService';
import type { ActiveRun } from '../types';

export function useFactoryTimers() {
  const { language } = useTranslation();
  const [homeData, setHomeData] = useState<any>(null);
  const [factoryRows, setFactoryRows] = useState<FactoryDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [serverOffset, setServerOffset] = useState(0);
  const [notifPermission, setNotifPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',
  );

  useEffect(() => {
    let mounted = true;

    const fetchData = () => {
      Promise.all([
        getCraftworldHome().catch(() => null),
        loadFactoryData().catch(() => []),
      ])
        .then(([home, rows]) => {
          if (!mounted) return;
          if (home) {
            setHomeData(home);
            const serverTimeMs = home?.serverTime
              ? new Date(home.serverTime).getTime()
              : home?.lastSyncedAt
                ? new Date(home.lastSyncedAt).getTime()
                : Date.now();
            setServerOffset(serverTimeMs - Date.now());
          }
          if (rows && rows.length > 0) setFactoryRows(rows);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    };

    fetchData();

    // 1. Ticker every 1 second to update live timers, donut ring & percents
    const tickInterval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    // 2. Polling every 30 seconds to synchronize fresh state with Craft World
    const syncInterval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(tickInterval);
      clearInterval(syncInterval);
    };
  }, []);

  const requestNotif = useCallback(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then((perm) => {
        setNotifPermission(perm);
        if (perm === 'granted') {
          localStorage.setItem('craftworld.notificationsEnabled', 'true');
          sendFactoryNotification(
            language === 'es' ? '¡Notificaciones activadas!' : 'Notifications enabled!',
            language === 'es'
              ? 'Recibirás una alerta sonora cuando tus fábricas completen su ciclo.'
              : 'You will receive an alert when your factory cycles finish.',
            '/favicon.svg',
          );
        }
      });
    }
  }, [language]);

  const toggleNotification = useCallback(() => {
    if (notifPermission === 'granted') {
      const currentEnabled =
        localStorage.getItem('craftworld.notificationsEnabled') === 'true';
      if (currentEnabled) {
        localStorage.setItem('craftworld.notificationsEnabled', 'false');
        setNotifPermission('denied');
      } else {
        localStorage.setItem('craftworld.notificationsEnabled', 'true');
        setNotifPermission('granted');
      }
    } else {
      requestNotif();
    }
  }, [notifPermission, requestNotif]);

  const activeRuns = useMemo<ActiveRun[]>(() => {
    return extractActiveRuns(homeData, factoryRows, language, now);
  }, [homeData, factoryRows, language, now]);

  const readyCount = useMemo(() => {
    return activeRuns.filter((r) => {
      const runtimeSec = Math.max(1, Math.round(r.runtimeMinutes * 60));
      const startedMs = new Date(r.startedAt).getTime();
      const elapsedSec = Math.max(0, Math.floor((now + serverOffset - startedMs) / 1000));
      return !r.isProducing && elapsedSec >= runtimeSec;
    }).length;
  }, [activeRuns, now, serverOffset]);

  return {
    language,
    loading,
    now,
    serverOffset,
    activeRuns,
    readyCount,
    notifPermission,
    toggleNotification,
  };
}
