import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '../../../utils/i18n';
import {
  exportPlayerConfig,
  importPlayerConfig,
  loadPlayerConfig,
  resetPlayerConfig,
  type PlayerConfig,
} from '../../../services/playerConfig';
import {
  playNotificationSound,
  sendFactoryNotification,
} from '../../../utils/notifications';
import { notifySuccess, notifyError, notifyInfo } from '../../../utils/sileoNotifications';
import { useCraftworldHomeQuery, useMeQuery } from '../../../services/queries/useCraftworldQueries';
import type { UserProfile, UseSettingsReturn } from '../types';

export function useSettings(): UseSettingsReturn {
  const { t, language, setLanguage } = useTranslation();

  const { data: home } = useCraftworldHomeQuery();
  const { data: me } = useMeQuery();

  const user = useMemo<UserProfile | null>(() => {
    if (home?.profile) {
      return {
        displayName: home.profile.displayName || 'Player',
        level: home.profile.level,
        avatarUrl: home.profile.avatarUrl,
        uid: home.profile.uid,
      };
    }
    if (me) {
      return {
        displayName: me.craftWorldDisplayName || me.id || 'Player',
        level: me.craftWorldLevel,
        avatarUrl: me.craftWorldAvatarUrl,
        uid: me.craftWorldUid,
      };
    }
    return null;
  }, [home, me]);

  const [config, setConfig] = useState<PlayerConfig>(() => loadPlayerConfig());
  const [importJson, setImportJson] = useState('');
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showImportBox, setShowImportBox] = useState(false);

  // Auto clear status toast
  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(''), 3000);
    return () => clearTimeout(timer);
  }, [status]);

  // Appearance - Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('craftworld.theme') !== 'light';
  });

  const handleThemeToggle = useCallback(
    (nextDark: boolean) => {
      setIsDarkMode(nextDark);
      if (nextDark) {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('craftworld.theme', 'dark');
        const isSolid = localStorage.getItem('craftworld.solidBackground') === 'true';
        if (isSolid) {
          document.body.classList.add('solid-bg');
        }
        setStatus(language === 'es' ? 'Modo Oscuro activado' : 'Dark Mode enabled');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('craftworld.theme', 'light');
        setStatus(language === 'es' ? 'Modo Claro activado' : 'Light Mode enabled');
      }
    },
    [language]
  );

  // Appearance - Solid Background
  const [solidBg, setSolidBg] = useState<boolean>(() => {
    return localStorage.getItem('craftworld.solidBackground') === 'true';
  });

  const [solidColor, setSolidColor] = useState<string>(() => {
    return localStorage.getItem('craftworld.solidBackgroundColor') || '#000000';
  });

  const handleSolidBgToggle = useCallback(
    (val: boolean) => {
      setSolidBg(val);
      localStorage.setItem('craftworld.solidBackground', String(val));
      if (val) {
        document.body.classList.add('solid-bg');
        document.documentElement.style.setProperty('--navbar-bg', solidColor);
      } else {
        document.body.classList.remove('solid-bg');
        document.documentElement.style.setProperty('--navbar-bg', '#141415');
      }
      setStatus(
        language === 'es' ? 'Fondo OLED actualizado' : 'OLED background updated'
      );
    },
    [language, solidColor]
  );

  const handleSolidColorChange = useCallback(
    (val: string) => {
      setSolidColor(val);
      localStorage.setItem('craftworld.solidBackgroundColor', val);
      document.documentElement.style.setProperty('--bg-solid-override', val);
      if (solidBg) {
        document.documentElement.style.setProperty('--navbar-bg', val);
      }
    },
    [solidBg]
  );

  // Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('craftworld.notificationsEnabled') === 'true';
  });

  const [notificationPermissionState, setNotificationPermissionState] =
    useState<string>(() => {
      return typeof window !== 'undefined' && 'Notification' in window
        ? Notification.permission
        : 'unsupported';
    });

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    try {
      const res = await Notification.requestPermission();
      setNotificationPermissionState(res);
      if (res === 'granted') {
        localStorage.setItem('craftworld.notificationsEnabled', 'true');
        setNotificationsEnabled(true);
        setStatus(language === 'es' ? 'Permiso concedido' : 'Permission granted');
        sendFactoryNotification(
          'Craft World Companion',
          language === 'es'
            ? '¡Notificaciones activadas con éxito!'
            : 'Notifications enabled successfully!'
        );
      } else {
        localStorage.setItem('craftworld.notificationsEnabled', 'false');
        setNotificationsEnabled(false);
      }
    } catch (e) {
      console.error(e);
    }
  }, [language]);

  const handleNotificationsToggle = useCallback(
    (val: boolean) => {
      setNotificationsEnabled(val);
      localStorage.setItem('craftworld.notificationsEnabled', String(val));
      if (val && 'Notification' in window && Notification.permission === 'default') {
        requestNotificationPermission();
      }
      setStatus(
        val
          ? language === 'es'
            ? 'Notificaciones activadas'
            : 'Notifications enabled'
          : language === 'es'
            ? 'Notificaciones desactivadas'
            : 'Notifications disabled'
      );
    },
    [language, requestNotificationPermission]
  );

  const handleTestNotification = useCallback(() => {
    playNotificationSound();
    sendFactoryNotification(
      'Craft World Companion',
      language === 'es'
        ? '¡Campana de prueba exitosa! Las alertas de producción funcionan.'
        : 'Test chime successful! Production alerts are ready.'
    );
    setStatus(
      language === 'es'
        ? 'Sonido y alerta de prueba ejecutados'
        : 'Test chime & alert dispatched'
    );
  }, [language]);

  const handleCopyJson = useCallback(() => {
    const data = exportPlayerConfig(config);
    setImportJson(data);
    navigator.clipboard.writeText(data).then(() => {
      setCopied(true);
      notifySuccess(
        language === 'es' ? 'Copiado al portapapeles' : 'Copied to clipboard',
        language === 'es' ? 'Configuración JSON copiada' : 'JSON configuration copied'
      );
      setStatus(language === 'es' ? '¡Copiado al portapapeles!' : 'Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [config, language]);

  const handleApplyImport = useCallback(() => {
    try {
      const imported = importPlayerConfig(importJson);
      setConfig(imported);
      notifySuccess(
        t('settings.status.imported'),
        language === 'es'
          ? 'Configuración importada y aplicada con éxito'
          : 'Configuration imported and applied successfully'
      );
      setStatus(t('settings.status.imported'));
      setShowImportBox(false);
    } catch {
      notifyError(
        t('settings.status.failed'),
        language === 'es'
          ? 'El texto JSON no tiene un formato válido'
          : 'The JSON payload is malformed or invalid'
      );
      setStatus(t('settings.status.failed'));
    }
  }, [importJson, language, t]);

  const handleResetConfig = useCallback(() => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    } else {
      setConfig(resetPlayerConfig());
      setImportJson('');
      setConfirmReset(false);
      notifyInfo(
        t('settings.status.reset'),
        language === 'es'
          ? 'Configuración restablecida a valores por defecto'
          : 'Configuration reset to factory defaults'
      );
      setStatus(t('settings.status.reset'));
    }
  }, [confirmReset, language, t]);

  const clearStatus = useCallback(() => {
    setStatus('');
  }, []);

  return {
    user,
    status,
    clearStatus,
    isDarkMode,
    handleThemeToggle,
    solidBg,
    handleSolidBgToggle,
    solidColor,
    handleSolidColorChange,
    language: language as 'es' | 'en',
    setLanguage: setLanguage as (lang: 'es' | 'en') => void,
    notificationsEnabled,
    notificationPermissionState,
    handleNotificationsToggle,
    requestNotificationPermission,
    handleTestNotification,
    copied,
    handleCopyJson,
    showImportBox,
    setShowImportBox,
    importJson,
    setImportJson,
    handleApplyImport,
    confirmReset,
    handleResetConfig,
  };
}
