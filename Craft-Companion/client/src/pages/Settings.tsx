import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Layout from '../components/Layout';
import Dropdown from '../components/Dropdown';
import { loadFactoryData } from '../services/factoryData';
import { useTranslation } from '../utils/i18n';
import {
  exportPlayerConfig,
  getFactoryConfig,
  importPlayerConfig,
  loadPlayerConfig,
  resetPlayerConfig,
  savePlayerConfig,
  type PlayerConfig,
} from '../services/playerConfig';

function getResourceImage(symbol?: string) {
  if (!symbol) return '';
  const cleanSymbol = symbol.trim().toLowerCase();
  const formattedSymbol = cleanSymbol.charAt(0).toUpperCase() + cleanSymbol.slice(1);
  return `/assets/resources/${formattedSymbol}.png`;
}

import { formatFactoryName } from '../utils/formatters';
import { Button, Input } from '../components/ui';

export default function Settings() {
  const { t, language, setLanguage } = useTranslation();
  const [tokens, setTokens] = useState<string[]>([]);
  const [selectedToken, setSelectedToken] = useState('');
  const [config, setConfig] = useState<PlayerConfig>(() => loadPlayerConfig());
  const [json, setJson] = useState('');
  const [status, setStatus] = useState('');

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
    } else {
      document.body.classList.remove('solid-bg');
    }
  }

  function handleSolidColorChange(val: string) {
    setSolidColor(val);
    localStorage.setItem('craftworld.solidBackgroundColor', val);
    document.documentElement.style.setProperty('--bg-solid-override', val);
  }

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('craftworld.notificationsEnabled') === 'true';
  });

  const [notificationPermissionState, setNotificationPermissionState] = useState<string>(() => {
    return 'Notification' in window ? Notification.permission : 'unsupported';
  });

  function handleNotificationsToggle(val: boolean) {
    setNotificationsEnabled(val);
    localStorage.setItem('craftworld.notificationsEnabled', String(val));
    if (val && 'Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission();
    }
  }

  async function requestNotificationPermission() {
    if (!('Notification' in window)) return;
    const res = await Notification.requestPermission();
    setNotificationPermissionState(res);
    if (res === 'granted') {
      localStorage.setItem('craftworld.notificationsEnabled', 'true');
      setNotificationsEnabled(true);
    } else {
      localStorage.setItem('craftworld.notificationsEnabled', 'false');
      setNotificationsEnabled(false);
    }
  }

  useEffect(() => {
    loadFactoryData().then((rows) => {
      const nextTokens = Array.from(new Set(rows.map((row) => row.token).filter(Boolean))).sort();
      setTokens(nextTokens);
      setSelectedToken((current) => current || nextTokens[0] || '');
    });
  }, []);

  const selected = useMemo(() => getFactoryConfig(config, selectedToken), [config, selectedToken]);

  const tokenOptions = useMemo(() => {
    return tokens.map((token) => ({
      value: token,
      label: formatFactoryName(token, language),
      image: getResourceImage(token) || undefined,
    }));
  }, [tokens, language]);

  const languageOptions = useMemo(
    () => [
      { value: 'en', label: t('settings.english') },
      { value: 'es', label: t('settings.spanish') },
    ],
    [t],
  );

  const boostOptions = useMemo(
    () => [
      { value: '1', label: '1x' },
      { value: '2', label: '2x' },
      { value: '5', label: '5x' },
      { value: '10', label: '10x' },
    ],
    [],
  );

  function updateSelected(next: Partial<typeof selected>) {
    const updated = savePlayerConfig({
      ...config,
      factories: {
        ...config.factories,
        [selectedToken]: { ...selected, ...next },
      },
    });
    setConfig(updated);
    setStatus(t('settings.status.saved'));
  }

  return (
    <Layout>
      <div className="space-y-4 max-w-[720px] mx-auto w-full">
        <div className="relative z-30">
          <Card title={t('settings.title')} style={{ overflow: 'visible' }}>
            <div className="space-y-3 text-sm">
              <p className="text-slate-300">{t('settings.savedDesc')}</p>
              {status && <p className="text-emerald-300">{status}</p>}

              <div className="block space-y-1">
                <span className="text-xs text-slate-300 font-bold">
                  {t('settings.factoryResource')}
                </span>
                <Dropdown
                  value={selectedToken}
                  onChange={(val) => setSelectedToken(String(val))}
                  options={tokenOptions}
                  searchable={true}
                />
              </div>

              <div className="h-px bg-white/5 my-4" />

              <div className="block space-y-1">
                <span className="text-xs text-slate-300 font-bold">{t('settings.language')}</span>
                <Dropdown
                  value={language}
                  onChange={(val) => setLanguage(String(val) as any)}
                  options={languageOptions}
                  searchable={false}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Preferences Card */}
        <Card title={language === 'es' ? 'Preferencias' : 'Preferences'}>
          <div className="space-y-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer pb-2 border-none">
              <input
                type="checkbox"
                checked={solidBg}
                onChange={(event) => handleSolidBgToggle(event.target.checked)}
                className="h-4 w-4 rounded border-none bg-[#151518] accent-emerald-500 cursor-pointer"
              />
              <span className="font-bold text-white">
                {language === 'es' ? 'Usar fondo de color sólido' : 'Use solid background color'}
              </span>
            </label>

            {solidBg && (
              <label className="block space-y-1 pb-2 border-none">
                <span className="text-xs text-slate-300 font-bold">
                  {language === 'es' ? 'Color de Fondo Sólido' : 'Solid Background Color'}
                </span>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={solidColor}
                    onChange={(event) => handleSolidColorChange(event.target.value)}
                    className="h-8 w-12 rounded-xl border-none bg-[#151518] p-1 cursor-pointer focus:outline-none"
                  />
                  <input
                    type="text"
                    value={solidColor}
                    onChange={(event) => handleSolidColorChange(event.target.value)}
                    className="w-32 rounded-xl border-none bg-[#151518] px-3 py-1.5 text-sm text-white focus:outline-none font-mono"
                    placeholder="#000000"
                  />
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => handleSolidColorChange('#000000')}
                  >
                    {language === 'es' ? 'Restablecer Negro' : 'Reset Black'}
                  </Button>
                </div>
              </label>
            )}

            {/* Desktop Notifications Preference */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(event) => handleNotificationsToggle(event.target.checked)}
                  className="h-4 w-4 rounded border-none bg-[#151518] accent-emerald-500 cursor-pointer"
                />
                <span className="font-bold text-white">
                  {language === 'es'
                    ? 'Activar notificaciones de escritorio'
                    : 'Enable desktop notifications'}
                </span>
              </label>
              <p className="text-xs text-slate-400">
                {language === 'es'
                  ? 'Te avisa al instante con una alerta del sistema cuando una fábrica termina su ciclo, incluso si estás en otra pestaña o jugando.'
                  : 'Alerts you instantly with a system notification when a factory finishes its cycle, even if you are in another tab or playing.'}
              </p>
              {notificationPermissionState === 'default' && notificationsEnabled && (
                <Button
                  variant="primary"
                  size="xs"
                  onClick={requestNotificationPermission}
                >
                  {language === 'es'
                    ? 'Permitir notificaciones en navegador'
                    : 'Grant browser permission'}
                </Button>
              )}
              {notificationPermissionState === 'denied' && (
                <p className="text-xs text-red-400 font-semibold">
                  {language === 'es'
                    ? '⚠️ Permiso bloqueado. Por favor, actívalo en la configuración del candado de tu navegador.'
                    : '⚠️ Permission blocked. Please enable it in your browser settings (click lock icon).'}
                </p>
              )}
            </div>
          </div>
        </Card>

        {selectedToken && (
          <div className="relative z-20">
            <Card
              title={t('settings.localSetup', {
                token: formatFactoryName(selectedToken, language),
              })}
              style={{ overflow: 'visible' }}
            >
              <div className="grid gap-3 text-sm md:grid-cols-3">
                <label className="flex items-center gap-2 md:col-span-3 pb-2 border-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.enabled}
                    onChange={(event) => updateSelected({ enabled: event.target.checked })}
                    className="h-4 w-4 rounded border-none bg-[#151518] accent-emerald-500 cursor-pointer"
                  />
                  <span className="font-bold text-white">{t('settings.ownedEnabled')}</span>
                </label>

                <label className="space-y-1">
                  <span className="text-xs text-slate-300">{t('settings.factoryCount')}</span>
                  <input
                    type="number"
                    min="1"
                    value={selected.factoryCount}
                    onChange={(event) =>
                      updateSelected({ factoryCount: Number(event.target.value) })
                    }
                    className="w-full rounded-xl border-none bg-[#151518] px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs text-slate-300">{t('settings.factoryLevel')}</span>
                  <input
                    type="number"
                    min="1"
                    value={selected.factoryLevel}
                    onChange={(event) =>
                      updateSelected({ factoryLevel: Number(event.target.value) })
                    }
                    className="w-full rounded-xl border-none bg-[#151518] px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </label>

                <div className="space-y-1">
                  <span className="text-xs text-slate-300 block">
                    {t('settings.boostMultiplier')}
                  </span>
                  <Dropdown
                    value={String(selected.boostMultiplier)}
                    onChange={(val) => updateSelected({ boostMultiplier: Number(val) })}
                    options={boostOptions}
                    searchable={false}
                  />
                </div>

                <label className="space-y-1">
                  <span className="text-xs text-slate-300">{t('settings.workersPercent')}</span>
                  <input
                    type="number"
                    min="0"
                    value={selected.workersPercent}
                    onChange={(event) =>
                      updateSelected({ workersPercent: Number(event.target.value) })
                    }
                    className="w-full rounded-xl border-none bg-[#151518] px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs text-slate-300">{t('settings.workshopPercent')}</span>
                  <input
                    type="number"
                    min="0"
                    value={selected.workshopPercent}
                    onChange={(event) =>
                      updateSelected({ workshopPercent: Number(event.target.value) })
                    }
                    className="w-full rounded-xl border-none bg-[#151518] px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </label>

                <div className="hidden md:block" />

                <label className="space-y-1 md:col-span-3">
                  <span className="text-xs text-slate-300">{t('settings.notes')}</span>
                  <textarea
                    value={selected.notes}
                    onChange={(event) => updateSelected({ notes: event.target.value })}
                    className="min-h-24 w-full rounded-xl border-none bg-[#151518] px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </label>
              </div>
            </Card>
          </div>
        )}

        <Card title={t('settings.importExport')}>
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setJson(exportPlayerConfig(config))}
              >
                {t('settings.exportJson')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  try {
                    const imported = importPlayerConfig(json);
                    setConfig(imported);
                    setStatus(t('settings.status.imported'));
                  } catch {
                    setStatus(t('settings.status.failed'));
                  }
                }}
              >
                {t('settings.importJson')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setConfig(resetPlayerConfig());
                  setJson('');
                  setStatus(t('settings.status.reset'));
                }}
              >
                {t('settings.resetAll')}
              </Button>
            </div>
            <textarea
              value={json}
              onChange={(event) => setJson(event.target.value)}
              className="min-h-48 w-full rounded-2xl border-none bg-[#151518] px-3 py-2 font-mono text-xs text-white focus:outline-none"
              placeholder={
                language === 'es'
                  ? 'Pega el código de configuración aquí...'
                  : 'Paste your config code here...'
              }
            />
          </div>
        </Card>
      </div>
    </Layout>
  );
}
