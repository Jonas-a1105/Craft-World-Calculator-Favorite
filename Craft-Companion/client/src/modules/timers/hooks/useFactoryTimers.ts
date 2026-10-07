import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { useCraftworldHomeQuery, useFactoryDataQuery } from '../../../services/queries/useCraftworldQueries';
import { sendFactoryNotification } from '../../../utils/notifications';
import { extractActiveRuns } from '../services/factoryTimersService';
import type { ActiveRun } from '../types';

export function useFactoryTimers() {
  const { language } = useTranslation();
  const { data: homeData, isLoading: isHomeLoading } = useCraftworldHomeQuery();
  const { data: factoryRows = [], isLoading: isRowsLoading } = useFactoryDataQuery();
  const loading = isHomeLoading || isRowsLoading;

  const [now, setNow] = useState(Date.now());
  const [notifPermission, setNotifPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',
  );

  const serverOffset = useMemo(() => {
    if (!homeData) return 0;
    const serverTimeMs = homeData?.serverTime
      ? new Date(homeData.serverTime).getTime()
      : homeData?.lastSyncedAt
        ? new Date(homeData.lastSyncedAt).getTime()
        : Date.now();
    return serverTimeMs - Date.now();
  }, [homeData]);

  useEffect(() => {
    // 1-second ticker to update countdowns, donut rings and completion percentages
    const tickInterval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(tickInterval);
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
