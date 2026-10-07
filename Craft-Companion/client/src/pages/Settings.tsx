import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useTranslation } from '../utils/i18n';
import {
  exportPlayerConfig,
  importPlayerConfig,
  loadPlayerConfig,
  resetPlayerConfig,
  type PlayerConfig,
} from '../services/playerConfig';
import { playNotificationSound, sendFactoryNotification } from '../utils/notifications';
import { getCraftworldHome, getMe, oauthAuthorize } from '../services/api';

// Preset color options for solid background
const COLOR_PRESETS = [
  { label: 'Negro Puro', value: '#000000' },
  { label: 'Obsidiana', value: '#09090b' },
  { label: 'Craft Dark', value: '#141415' },
  { label: 'Carbón', value: '#18181b' },
  { label: 'Medianoche', value: '#0a0f1d' },
  { label: 'Índigo', value: '#130e26' },
];

export default function Settings() {
  const { t, language, setLanguage } = useTranslation();

  // User Profile Data for mobile Account Card
  const [user, setUser] = useState<{
    displayName: string;
    level?: number;
    avatarUrl?: string;
    uid?: string;
  } | null>(null);

  const [config, setConfig] = useState<PlayerConfig>(() => loadPlayerConfig());
  const [json, setJson] = useState('');
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

  // Load user profile
  useEffect(() => {
    getCraftworldHome()
      .then((home) => {
        if (home?.profile) {
          setUser({
            displayName: home.profile.displayName || 'Player',
            level: home.profile.level,
            avatarUrl: home.profile.avatarUrl,
            uid: home.profile.uid,
          });
        } else {
          getMe()
            .then((me) => {
              if (me) {
                setUser({
                  displayName: me.craftWorldDisplayName || me.id || 'Player',
                  level: me.craftWorldLevel,
                  avatarUrl: me.craftWorldAvatarUrl,
                  uid: me.craftWorldUid,
                });
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        getMe()
          .then((me) => {
            if (me) {
              setUser({
                displayName: me.craftWorldDisplayName || me.id || 'Player',
                level: me.craftWorldLevel,
                avatarUrl: me.craftWorldAvatarUrl,
                uid: me.craftWorldUid,
              });
            }
          })
          .catch(() => {});
      });
  }, []);

  // Appearance - Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('craftworld.theme') !== 'light';
  });

  function handleThemeToggle(nextDark: boolean) {
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
  }

  // Appearance - Solid Background
  const [solidBg, setSolidBg] = useState<boolean>(() => {
    return localStorage.getItem('craftworld.solidBackground') === 'true';
  });

  const [solidColor, setSolidColor] = useState<string>(() => {
    return localStorage.getItem('craftworld.solidBackgroundColor') || '#000000';
  });

  function handleSolidBgToggle(val: boolean) {
    setSolidBg(val);
    localStorage.setItem('craftworld.solidBackground', String(val));
    if (val) {
      document.body.classList.add('solid-bg');
      document.documentElement.style.setProperty('--navbar-bg', solidColor);
    } else {
      document.body.classList.remove('solid-bg');
      document.documentElement.style.setProperty('--navbar-bg', '#141415');
    }
    setStatus(language === 'es' ? 'Fondo OLED actualizado' : 'OLED background updated');
  }

  function handleSolidColorChange(val: string) {
    setSolidColor(val);
    localStorage.setItem('craftworld.solidBackgroundColor', val);
    document.documentElement.style.setProperty('--bg-solid-override', val);
    if (solidBg) {
      document.documentElement.style.setProperty('--navbar-bg', val);
    }
  }

  // Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('craftworld.notificationsEnabled') === 'true';
  });

  const [notificationPermissionState, setNotificationPermissionState] = useState<string>(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported';
  });

  function handleNotificationsToggle(val: boolean) {
    setNotificationsEnabled(val);
    localStorage.setItem('craftworld.notificationsEnabled', String(val));
    if (val && 'Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission();
    }
    setStatus(
      val
        ? (language === 'es' ? 'Notificaciones activadas' : 'Notifications enabled')
        : (language === 'es' ? 'Notificaciones desactivadas' : 'Notifications disabled'),
    );
  }

  async function requestNotificationPermission() {
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
          language === 'es' ? '¡Notificaciones activadas con éxito!' : 'Notifications enabled successfully!',
        );
      } else {
        localStorage.setItem('craftworld.notificationsEnabled', 'false');
        setNotificationsEnabled(false);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function handleTestNotification() {
    playNotificationSound();
    sendFactoryNotification(
      'Craft World Companion',
      language === 'es'
        ? '¡Campana de prueba exitosa! Las alertas de producción funcionan.'
        : 'Test chime successful! Production alerts are ready.',
    );
    setStatus(language === 'es' ? 'Sonido y alerta de prueba ejecutados' : 'Test chime & alert dispatched');
  }

  function handleCopyJson() {
    const data = exportPlayerConfig(config);
    setJson(data);
    navigator.clipboard.writeText(data).then(() => {
      setCopied(true);
      setStatus(language === 'es' ? '¡Copiado al portapapeles!' : 'Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Layout>
      {/* Mobile-centric centered container */}
      <div className="max-w-[560px] mx-auto w-full px-3 sm:px-0 space-y-6 pb-20">
        
        {/* FLOATING STATUS TOAST */}
        {status && (
          <div className="sticky top-20 z-50 flex items-center justify-between gap-2 px-4 py-3 rounded-full bg-[#202026]/95 text-emerald-300 text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{status}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatus('')}
              className="text-slate-400 hover:text-white text-xs font-bold px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. MOBILE USER PROFILE CARD (APPLE ID STYLE) */}
        <div className="bg-[#18181b] rounded-[32px] p-5 shadow-xl flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="flex items-center gap-4 min-w-0">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full overflow-hidden bg-black/60 ring-2 ring-white/10 flex-shrink-0 flex items-center justify-center">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="/assets/resources/Coin.png"
                  alt="Avatar"
                  className="w-8 h-8 object-contain"
                />
              )}
            </div>

            {/* User Meta */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white truncate">
                  {user?.displayName || 'Player'}
                </span>
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                  ✓
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                {user?.level !== undefined ? `Nivel ${user.level} • @craftworld` : '@craftworld'}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wide">
                  OAuth Conectado (5 Scopes)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Re-link Button */}
          <button
            type="button"
            onClick={oauthAuthorize}
            title={language === 'es' ? 'Revincular Cuenta' : 'Re-link Account'}
            className="w-10 h-10 rounded-full bg-[#24242a] hover:bg-[#2e2e36] text-zinc-200 hover:text-white flex items-center justify-center transition-all shadow-md cursor-pointer flex-shrink-0 group"
          >
            <svg
              className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180 text-zinc-300 group-hover:text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* 2. CARD: APARIENCIA & PANTALLA */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase px-4 block">
            {language === 'es' ? 'Apariencia y Pantalla' : 'Appearance & Display'}
          </span>

          <div className="bg-[#18181b] rounded-[32px] shadow-xl overflow-hidden">
            {/* Row 0: Modo Oscuro (Dark Mode) Toggle */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.03 9.03 0 008.354-5.646z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {language === 'es' ? 'Modo Oscuro' : 'Dark Mode'}
                  </span>
                  <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                    {language === 'es' ? 'Tema visual de la interfaz' : 'Interface visual theme'}
                  </span>
                </div>
              </div>

              {/* iOS Switch */}
              <button
                type="button"
                onClick={() => handleThemeToggle(!isDarkMode)}
                className={`w-12 h-7 rounded-full transition-colors duration-200 p-0.5 flex items-center cursor-pointer flex-shrink-0 ${
                  isDarkMode ? 'bg-emerald-500' : 'bg-[#27272a]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="h-px bg-white/[0.04]" />

            {/* Row 1: Solid Background Toggle */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879a2.5 2.5 0 002.812-2.45v-.429c0-.69.56-1.25 1.25-1.25h1.5a6 6 0 006-6c0-5.523-4.477-9.75-10-9.75z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {language === 'es' ? 'Fondo Sólido OLED' : 'Solid OLED Background'}
                  </span>
                  <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                    {language === 'es' ? 'Alto contraste y ahorro energético' : 'High contrast & eco power'}
                  </span>
                </div>
              </div>

              {/* Mobile iOS Switch */}
              <button
                type="button"
                onClick={() => handleSolidBgToggle(!solidBg)}
                className={`w-12 h-7 rounded-full transition-colors duration-200 p-0.5 flex items-center cursor-pointer flex-shrink-0 ${
                  solidBg ? 'bg-emerald-500' : 'bg-[#27272a]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    solidBg ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Row 2: Pure Color Circles Only (No text labels, no separate background box, no hex input) */}
            {solidBg && (
              <div className="px-5 pb-5 pt-1 flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = solidColor.toLowerCase() === preset.value.toLowerCase();
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleSolidColorChange(preset.value)}
                      title={preset.label}
                      className={`w-8 h-8 rounded-full transition-all cursor-pointer flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#18181b] scale-110 shadow-lg'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.value }}
                    >
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Subtle Divider */}
            <div className="h-px bg-white/[0.04]" />

            {/* Row 3: Language Selector */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {language === 'es' ? 'Idioma de la App' : 'App Language'}
                  </span>
                  <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                    {language === 'es' ? 'Español / English' : 'English / Spanish'}
                  </span>
                </div>
              </div>

              {/* Segmented Pill Selector (Clear spacing, distinct pills) */}
              <div className="flex items-center bg-[#222228] p-1 rounded-full gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setLanguage('es')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    language === 'es'
                      ? 'bg-emerald-500 text-black shadow-sm font-extrabold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-emerald-500 text-black shadow-sm font-extrabold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CARD: NOTIFICACIONES Y SONIDOS */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase px-4 block">
            {language === 'es' ? 'Notificaciones y Alertas' : 'Notifications & Alerts'}
          </span>

          <div className="bg-[#18181b] rounded-[32px] shadow-xl overflow-hidden">
            {/* Row 1: Notifications Master Toggle */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {language === 'es' ? 'Alertas de Fábricas' : 'Factory Alerts'}
                  </span>
                  <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                    {language === 'es' ? 'Aviso sonoro al terminar ciclo' : 'Push sound when cycle ends'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleNotificationsToggle(!notificationsEnabled)}
                className={`w-12 h-7 rounded-full transition-colors duration-200 p-0.5 flex items-center cursor-pointer flex-shrink-0 ${
                  notificationsEnabled ? 'bg-emerald-500' : 'bg-[#27272a]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="h-px bg-white/[0.04]" />

            {/* Row 2: Browser Permission Status */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {language === 'es' ? 'Permiso del Navegador' : 'Browser Permission'}
                  </span>
                  <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                    {notificationPermissionState === 'granted'
                      ? (language === 'es' ? 'Permitido en este equipo' : 'Allowed on this device')
                      : (language === 'es' ? 'Requiere autorización' : 'Requires permission')}
                  </span>
                </div>
              </div>

              {notificationPermissionState === 'granted' ? (
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 flex-shrink-0">
                  <span>✓</span>
                  <span>{language === 'es' ? 'Activo' : 'Active'}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={requestNotificationPermission}
                  className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-md transition-colors flex-shrink-0"
                >
                  {language === 'es' ? 'Permitir' : 'Allow'}
                </button>
              )}
            </div>

            {/* Subtle Divider */}
            <div className="h-px bg-white/[0.04]" />

            {/* Row 3: Test Chime Button */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {language === 'es' ? 'Probar Campana de Alerta' : 'Test Alert Chime'}
                  </span>
                  <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                    {language === 'es' ? 'Verificar audio Web Audio API' : 'Verify audio tone and toast'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestNotification}
                className="px-4 py-2 rounded-full bg-[#27272e] hover:bg-[#32323a] text-zinc-100 hover:text-white text-xs font-semibold cursor-pointer transition-all active:scale-95 flex-shrink-0 shadow-sm"
              >
                {language === 'es' ? 'Probar' : 'Test'}
              </button>
            </div>
          </div>
        </div>

        {/* 4. CARD: DATOS Y RESPALDO */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase px-4 block">
            {language === 'es' ? 'Datos y Respaldo' : 'Data & Backup'}
          </span>

          <div className="bg-[#18181b] rounded-[32px] shadow-xl overflow-hidden">
            {/* Row 1: Copy JSON */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {language === 'es' ? 'Copiar Ajustes JSON' : 'Copy JSON Settings'}
                  </span>
                  <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                    {language === 'es' ? 'Exporta tu configuración al portapapeles' : 'Export config to clipboard'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyJson}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex-shrink-0 shadow-sm active:scale-95 ${
                  copied
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-[#27272e] hover:bg-[#32323a] text-zinc-100 hover:text-white'
                }`}
              >
                {copied ? (language === 'es' ? '✓ Copiado' : '✓ Copied') : (language === 'es' ? 'Copiar' : 'Copy')}
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="h-px bg-white/[0.04]" />

            {/* Row 2: Import Toggle */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {language === 'es' ? 'Importar Configuración' : 'Import Settings'}
                  </span>
                  <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                    {language === 'es' ? 'Restaura tus datos desde texto JSON' : 'Restore from JSON text'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowImportBox(!showImportBox)}
                className="px-4 py-2 rounded-full bg-[#27272e] hover:bg-[#32323a] text-zinc-100 hover:text-white text-xs font-semibold cursor-pointer transition-all active:scale-95 flex-shrink-0 shadow-sm"
              >
                {showImportBox ? (language === 'es' ? 'Cerrar' : 'Close') : (language === 'es' ? 'Importar' : 'Import')}
              </button>
            </div>

            {/* Import Box */}
            {showImportBox && (
              <div className="p-4 space-y-3">
                <textarea
                  value={json}
                  onChange={(e) => setJson(e.target.value)}
                  placeholder={
                    language === 'es'
                      ? 'Pega el código JSON de respaldo aquí...'
                      : 'Paste backup JSON code here...'
                  }
                  className="w-full min-h-[90px] rounded-2xl bg-[#141416] p-3 font-mono text-xs text-emerald-400 focus:outline-none border-none resize-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const imported = importPlayerConfig(json);
                      setConfig(imported);
                      setStatus(t('settings.status.imported'));
                      setShowImportBox(false);
                    } catch {
                      setStatus(t('settings.status.failed'));
                    }
                  }}
                  className="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  {language === 'es' ? 'Aplicar Importación' : 'Apply Import'}
                </button>
              </div>
            )}

            {/* Subtle Divider */}
            <div className="h-px bg-white/[0.04]" />

            {/* Row 3: Reset All Defaults */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {language === 'es' ? 'Restablecer Valores' : 'Reset All Defaults'}
                  </span>
                  <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                    {language === 'es' ? 'Borra configuraciones guardadas' : 'Wipes custom local preferences'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!confirmReset) {
                    setConfirmReset(true);
                    setTimeout(() => setConfirmReset(false), 3000);
                  } else {
                    setConfig(resetPlayerConfig());
                    setJson('');
                    setConfirmReset(false);
                    setStatus(t('settings.status.reset'));
                  }
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all active:scale-95 flex-shrink-0 shadow-sm ${
                  confirmReset
                    ? 'bg-rose-600 text-white font-bold animate-pulse'
                    : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200'
                }`}
              >
                {confirmReset
                  ? (language === 'es' ? '¿Confirmar?' : 'Confirm?')
                  : (language === 'es' ? 'Restablecer' : 'Reset')}
              </button>
            </div>
          </div>
        </div>

        {/* 5. APP FOOTER INFO */}
        <div className="text-center pt-2 space-y-1">
          <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
            Craft World Companion • v2.4 OLED Suite
          </p>
          <p className="text-[10px] text-zinc-600">
            Diseñado para Coquerokli & Matt
          </p>
        </div>

      </div>
    </Layout>
  );
}
