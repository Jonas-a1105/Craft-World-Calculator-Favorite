import React from 'react';
import {
  BellBingBold,
  ShieldCheckBold,
  VolumeLoudBold,
  CheckCircleBold,
  MagicStick3Bold,
  WidgetBold,
  PlayBold,
  DangerCircleBold,
  InfoCircleBold,
  BoltBold,
  RefreshLinear,
} from 'solar-icon-set';
import {
  useSileoConfig,
  SileoPosition,
  SileoTheme,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
  notifyAction,
  notifyPromise,
} from '../../../utils/sileoNotifications';

export interface SettingsNotificationsCardProps {
  notificationsEnabled: boolean;
  onToggleNotifications: (val: boolean) => void;
  notificationPermissionState: string;
  onRequestPermission: () => void;
  onTestNotification: () => void;
  language: 'es' | 'en';
}

const POSITIONS: { id: SileoPosition; labelEs: string; labelEn: string }[] = [
  { id: 'top-left', labelEs: 'Sup. Izquierda', labelEn: 'Top Left' },
  { id: 'top-center', labelEs: 'Sup. Centro', labelEn: 'Top Center' },
  { id: 'top-right', labelEs: 'Sup. Derecha', labelEn: 'Top Right' },
  { id: 'bottom-left', labelEs: 'Inf. Izquierda', labelEn: 'Bottom Left' },
  { id: 'bottom-center', labelEs: 'Inf. Centro', labelEn: 'Bottom Center' },
  { id: 'bottom-right', labelEs: 'Inf. Derecha', labelEn: 'Bottom Right' },
];

const FILLS: { id: string; labelEs: string; labelEn: string; bg: string }[] = [
  { id: '#18181b', labelEs: 'Obsidiana', labelEn: 'Obsidian', bg: 'bg-[#18181b]' },
  { id: '#0f172a', labelEs: 'Pizarra', labelEn: 'Slate', bg: 'bg-[#0f172a]' },
  { id: '#064e3b', labelEs: 'Esmeralda', labelEn: 'Emerald', bg: 'bg-[#064e3b]' },
  { id: '#ffffff', labelEs: 'Blanco', labelEn: 'White', bg: 'bg-white' },
];

const ROUNDNESS_OPTIONS = [
  { value: 8, label: '8px (Angular)' },
  { value: 16, label: '16px (Estándar)' },
  { value: 24, label: '24px (Píldora)' },
];

export const SettingsNotificationsCard: React.FC<SettingsNotificationsCardProps> = ({
  notificationsEnabled,
  onToggleNotifications,
  notificationPermissionState,
  onRequestPermission,
  onTestNotification,
  language,
}) => {
  const { config, updateConfig } = useSileoConfig();

  const handleTestSuccess = () => {
    notifySuccess(
      language === 'es' ? 'Recursos Recolectados' : 'Resources Collected',
      language === 'es'
        ? '+50,000 monedas depositadas en tu balance'
        : '+50,000 coins deposited to your treasury'
    );
  };

  const handleTestError = () => {
    notifyError(
      language === 'es' ? 'Fallo en la Línea de Producción' : 'Production Line Failure',
      language === 'es'
        ? 'Déficit de Mineral de Cobre para continuar el ciclo'
        : 'Deficit of Copper Ore required to continue cycle'
    );
  };

  const handleTestWarning = () => {
    notifyWarning(
      language === 'es' ? 'Inventario Próximo al Límite' : 'Inventory Near Capacity',
      language === 'es'
        ? 'El almacén de Tierra Negra está al 94% de su capacidad'
        : 'Black Soil warehouse reached 94% capacity'
    );
  };

  const handleTestInfo = () => {
    notifyInfo(
      language === 'es' ? 'Nuevo Ciclo Iniciado' : 'New Cycle Started',
      language === 'es'
        ? 'Las refinerías de Cristal han completado su ajuste'
        : 'Glass refineries have completed synchronization'
    );
  };

  const handleTestAction = () => {
    notifyAction(
      language === 'es' ? 'Actualización Disponible' : 'Update Available',
      language === 'es'
        ? 'Se detectaron precios actualizados de Craft World'
        : 'New Craft World market prices detected',
      {
        title: language === 'es' ? 'Aplicar' : 'Apply',
        onClick: () => {
          notifySuccess(
            language === 'es' ? '¡Actualizado!' : 'Updated!',
            language === 'es' ? 'Precios sincronizados' : 'Prices synchronized'
          );
        },
      }
    );
  };

  const handleTestPromise = () => {
    const fakeAsyncJob = new Promise<{ items: number }>((resolve) => {
      setTimeout(() => resolve({ items: 12 }), 1800);
    });

    notifyPromise(fakeAsyncJob, {
      loading: {
        title: language === 'es' ? 'Sincronizando con Craft World...' : 'Syncing with Craft World...',
        description: language === 'es' ? 'Calculando retornos...' : 'Computing market returns...',
      },
      success: (data: { items: number }) => ({
        title: language === 'es' ? '¡Sincronización Exitosa!' : 'Sync Successful!',
        description:
          language === 'es'
            ? `${data.items} registros actualizados en tiempo real`
            : `${data.items} records updated in real time`,
      }),
      error: () => ({
        title: language === 'es' ? 'Fallo en la Red' : 'Network Failure',
        description: language === 'es' ? 'No se pudo conectar' : 'Could not connect',
      }),
    });
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: Standard Factory & Audio Notifications */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase px-4 block">
          {language === 'es' ? 'Alertas de Fábricas y Navegador' : 'Factory & Browser Alerts'}
        </span>

        <div className="bg-[#18181b] rounded-[32px] shadow-xl overflow-hidden">
          {/* Row 1: Factory Cycle Toggle */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0">
                <BellBingBold className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">
                  {language === 'es' ? 'Alertas Sonoras de Fábricas' : 'Factory Audio Alerts'}
                </span>
                <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                  {language === 'es'
                    ? 'Aviso con Web Audio API al completar ciclo'
                    : 'Tone notification when production finishes'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleNotifications(!notificationsEnabled)}
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

          <div className="h-px bg-white/[0.04]" />

          {/* Row 2: Browser Permission */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheckBold className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">
                  {language === 'es' ? 'Permiso del Sistema' : 'System Push Permission'}
                </span>
                <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                  {notificationPermissionState === 'granted'
                    ? language === 'es'
                      ? 'Permitido en este navegador'
                      : 'Granted on this browser'
                    : language === 'es'
                      ? 'Requiere autorización para notificaciones push'
                      : 'Requires permission for desktop alerts'}
                </span>
              </div>
            </div>

            {notificationPermissionState === 'granted' ? (
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 flex-shrink-0">
                <CheckCircleBold className="w-4 h-4 shrink-0" />
                <span>{language === 'es' ? 'Activo' : 'Active'}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={onRequestPermission}
                className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-md transition-colors flex-shrink-0"
              >
                {language === 'es' ? 'Permitir' : 'Allow'}
              </button>
            )}
          </div>

          <div className="h-px bg-white/[0.04]" />

          {/* Row 3: Test Audio Chime */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center flex-shrink-0">
                <VolumeLoudBold className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">
                  {language === 'es' ? 'Probar Tono Sonoro' : 'Test Audio Chime'}
                </span>
                <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                  {language === 'es'
                    ? 'Verificar campana de audio'
                    : 'Play alert sound tone'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onTestNotification}
              className="px-4 py-2 rounded-full bg-[#27272e] hover:bg-[#32323a] text-zinc-100 hover:text-white text-xs font-semibold cursor-pointer transition-all active:scale-95 flex-shrink-0 shadow-sm"
            >
              {language === 'es' ? 'Probar' : 'Test'}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: Sileo Physics Toast Customization & Modes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-4">
          <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase block">
            {language === 'es'
              ? 'Librería Sileo Toasts (Físicas y Modos)'
              : 'Sileo Toast Engine (Physics & Modes)'}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
            <MagicStick3Bold className="w-3.5 h-3.5" />
            <span>Gooey Spring Morphing</span>
          </span>
        </div>

        <div className="bg-[#18181b] rounded-[32px] shadow-xl p-5 space-y-6">
          {/* Position Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <WidgetBold className="w-4 h-4 text-emerald-400" />
                <span>{language === 'es' ? 'Posición en Pantalla' : 'Screen Position'}</span>
              </label>
              <span className="text-[11px] font-mono text-zinc-400">{config.position}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POSITIONS.map((pos) => {
                const active = config.position === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => updateConfig({ position: pos.id })}
                    className={`py-2 px-3 rounded-2xl text-xs font-medium transition-all text-center flex items-center justify-center gap-1.5 ${
                      active
                        ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-[#27272a]/70 hover:bg-[#27272a] text-zinc-300 hover:text-white'
                    }`}
                  >
                    <span>{language === 'es' ? pos.labelEs : pos.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-white/[0.04]" />

          {/* Theme & Roundness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Theme */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">
                {language === 'es' ? 'Tema Base' : 'Base Theme'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'light', 'system'] as SileoTheme[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateConfig({ theme: t })}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                      config.theme === t
                        ? 'bg-white text-zinc-950 shadow-md font-bold'
                        : 'bg-[#27272a]/70 hover:bg-[#27272a] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Roundness */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">
                {language === 'es' ? 'Curvatura (Roundness)' : 'Roundness'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROUNDNESS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateConfig({ roundness: opt.value })}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                      config.roundness === opt.value
                        ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md'
                        : 'bg-[#27272a]/70 hover:bg-[#27272a] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {opt.value}px
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-white/[0.04]" />

          {/* Fill Color (Full Width Grid to prevent any overflow) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white block">
                {language === 'es' ? 'Color de Relleno (Fill)' : 'Fill Background Color'}
              </label>
              <span className="text-[11px] font-mono text-zinc-400">{config.fill}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FILLS.map((f) => {
                const active = config.fill.toLowerCase() === f.id.toLowerCase();
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => updateConfig({ fill: f.id })}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      active
                        ? 'ring-2 ring-emerald-400 bg-[#27272a] text-white shadow-md'
                        : 'bg-[#202024] text-zinc-400 hover:text-white hover:bg-[#27272a]/60'
                    }`}
                    title={language === 'es' ? f.labelEs : f.labelEn}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${f.bg} border border-white/20 flex-shrink-0 shadow-sm`} />
                    <span className="text-xs font-medium">{language === 'es' ? f.labelEs : f.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-white/[0.04]" />

          {/* Autopilot Mode */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#202024]">
            <div className="min-w-0 pr-4">
              <span className="text-xs font-bold text-white block">
                {language === 'es' ? 'Modo Autopilot' : 'Autopilot Mode'}
              </span>
              <span className="text-[11px] text-zinc-400 block mt-0.5">
                {language === 'es'
                  ? 'Expande y colapsa automáticamente la notificación con física fluida'
                  : 'Automatically expands and collapses notifications with fluid physics'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => updateConfig({ autopilot: !config.autopilot })}
              className={`w-12 h-7 rounded-full transition-colors p-0.5 flex items-center cursor-pointer flex-shrink-0 ${
                config.autopilot ? 'bg-emerald-500' : 'bg-[#27272a]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  config.autopilot ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-white/[0.04]" />

          {/* SECTION 3: Live Sileo Playground - All Types */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <PlayBold className="w-4 h-4 text-emerald-400" />
                <span>
                  {language === 'es'
                    ? 'Centro de Pruebas en Vivo (Todos los Modos de Sileo)'
                    : 'Live Sileo Playground (All Modes)'}
                </span>
              </label>
              <span className="text-[10px] text-zinc-500">
                {language === 'es' ? 'Clic para disparar' : 'Click to trigger'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* Success */}
              <button
                type="button"
                onClick={handleTestSuccess}
                className="py-2.5 px-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <CheckCircleBold className="w-4 h-4" />
                <span>{language === 'es' ? 'Éxito (Success)' : 'Success'}</span>
              </button>

              {/* Error */}
              <button
                type="button"
                onClick={handleTestError}
                className="py-2.5 px-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <DangerCircleBold className="w-4 h-4" />
                <span>{language === 'es' ? 'Error (Error)' : 'Error'}</span>
              </button>

              {/* Warning */}
              <button
                type="button"
                onClick={handleTestWarning}
                className="py-2.5 px-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <BellBingBold className="w-4 h-4" />
                <span>{language === 'es' ? 'Aviso (Warning)' : 'Warning'}</span>
              </button>

              {/* Info */}
              <button
                type="button"
                onClick={handleTestInfo}
                className="py-2.5 px-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <InfoCircleBold className="w-4 h-4" />
                <span>{language === 'es' ? 'Info (Info)' : 'Info'}</span>
              </button>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleTestAction}
                className="py-2.5 px-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <BoltBold className="w-4 h-4" />
                <span>{language === 'es' ? 'Acción (Action)' : 'Action'}</span>
              </button>

              {/* Promise (Gooey SVG Morphing) */}
              <button
                type="button"
                onClick={handleTestPromise}
                className="py-2.5 px-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <RefreshLinear className="w-4 h-4 animate-spin" />
                <span>{language === 'es' ? 'Promesa (Promise)' : 'Promise'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsNotificationsCard;
