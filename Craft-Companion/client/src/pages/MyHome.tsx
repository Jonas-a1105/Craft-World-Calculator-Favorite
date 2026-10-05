import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Layout from '../components/Layout';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { getMe, getCraftworldHome, oauthAuthorize } from '../services/api';
import { Button, Badge } from '../components/ui';
import { formatNumber } from '../utils/formatters';
import { ResourceIcon, FactoryIcon } from '../components/GameIcon';

function displayNumber(value: unknown) {
  return typeof value === 'number' ? value.toLocaleString() : '—';
}

function EmptyState({ children }: { children: string }) {
  return <p className="text-sm text-slate-400 py-2 font-main">{children}</p>;
}

function StatusBadge({ active, text }: { active: boolean; text: string }) {
  return (
    <Badge variant={active ? 'success' : 'neutral'} size="sm">
      {text}
    </Badge>
  );
}



function formatShopItem(id: string, lang = 'es') {
  if (!id) return '';
  if (id.includes('proaccount')) return lang === 'es' ? '⭐ Cuenta Pro' : '⭐ Pro Account';
  if (id.includes('noadsoffer')) return lang === 'es' ? '🚫 Oferta Sin Anuncios' : '🚫 No-Ads Offer';
  return id.replace('com.angrydynamiteslab.craftworld.', '').replace(/_/g, ' ');
}

function formatAdPlacement(id: string, lang = 'es') {
  if (!id) return '';
  if (id.toLowerCase().includes('mine')) return lang === 'es' ? '⛏️ Booster Mina' : '⛏️ Mine Booster';
  if (id.toLowerCase().includes('factory')) return lang === 'es' ? '⚡ Booster Fábrica' : '⚡ Factory Booster';
  return id.replace(/_/g, ' ');
}

function formatBoosterName(id: string) {
  if (!id) return '';
  return id
    .replace('FACTORYBOOST_', '⚡ ')
    .replace('MINEBOOST_', '⛏️ ')
    .replace(/_/g, ' ');
}

function formatEggName(id: string) {
  if (!id) return '';
  return id
    .replace('MID_', 'Medio ')
    .replace('HIGH_', 'Alto ')
    .replace('LOW', 'Básico ')
    .replace(/_/g, ' ');
}

function formatUid(uid?: string) {
  if (!uid) return 'N/A';
  if (uid.length > 14) {
    return `${uid.slice(0, 6)}...${uid.slice(-4)}`;
  }
  return uid;
}

function DonutRing({
  percent,
  color,
  trackColor = '#27272a',
  size = 48,
  stroke = 5,
}: {
  percent: number;
  color: string;
  trackColor?: string;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={trackColor}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

function MiniBarChart({
  activeIndex = 3,
  color = '#eab308',
}: {
  activeIndex?: number;
  color?: string;
}) {
  const bars = [12, 20, 15, 32, 16, 10];
  const maxH = 34;
  const barW = 3.5;
  const gap = 3.5;

  return (
    <svg width={bars.length * (barW + gap)} height={maxH} className="shrink-0">
      {bars.map((h, i) => {
        const isActive = i === activeIndex;
        const x = i * (barW + gap);
        const y = maxH - h;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx={1.75}
            fill={isActive ? color : 'rgba(255, 255, 255, 0.12)'}
          />
        );
      })}
    </svg>
  );
}

function SparklineWave({
  color = '#22c55e',
  width = 60,
  height = 30,
}: {
  color?: string;
  width?: number;
  height?: number;
}) {
  const pathD = 'M 2 20 C 12 20, 16 6, 26 16 C 36 26, 42 3, 50 12 C 54 18, 56 12, 58 14';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0 overflow-visible"
    >
      <defs>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={color} floodOpacity="0.45" />
        </filter>
      </defs>
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#neonGlow)"
      />
    </svg>
  );
}

export default function MyHome() {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const [me, setMe] = useState<any>();
  const [homeData, setHomeData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'craft' | 'inventory' | 'exchange' | 'onchain' | 'purchases'
  >('overview');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const meData = await getMe();
      setMe(meData);

      const data = await getCraftworldHome();
      setHomeData(data);
    } catch (err: any) {
      console.error('Failed to load home data', err);
      setError(
        language === 'es' ? 'Error al cargar los datos del panel.' : 'Failed to load panel data.',
      );
      const msg = String(err?.message || '').toLowerCase();
      if (msg.includes('unauthorized') || msg.includes('token') || msg.includes('auth')) {
        document.cookie = 'cc_logged_in=; Path=/; Max-Age=0; SameSite=Lax';
        localStorage.removeItem('token');
        localStorage.removeItem('me');
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  if (!me)
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );

  const profile = homeData?.profile;
  const craftWorld = homeData?.craftWorld;
  const masterpieces = homeData?.masterpieces;
  const craft = homeData?.craft;
  const exchange = homeData?.exchange;
  const onchain = homeData?.onchain;
  const inventory = homeData?.inventory;
  const purchases = homeData?.purchases;

  const isMissingScopes = !craft || !exchange || !onchain || !inventory || !purchases;

  const powerTotal = craft?.power || 0;
  const powerUsed = craft?.powerUsed || 0;
  const powerAvail = craft ? Math.max(0, powerTotal - powerUsed) : 0;
  const powerPercent =
    powerTotal > 0
      ? Math.min(100, Math.max(0, Math.round((powerAvail / powerTotal) * 100)))
      : 0;

  const unlockedVaults = craft?.vaults?.filter((v: any) => v.isUnlocked)?.length ?? 0;
  const totalVaults = craft?.vaults?.length ?? 0;
  const totalEggs =
    inventory?.eggs?.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0) ?? 0;
  const totalChests =
    inventory?.chests?.reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0) ?? 0;

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full min-w-0">
        {error && (
          <div className="w-full">
            <Card>{error}</Card>
          </div>
        )}

        {/* User Profile Card */}
        <div className="w-full flex justify-center py-2">
          <div className="w-full max-w-[280px] sm:max-w-[310px] bg-[#18181b] rounded-[32px] overflow-hidden shadow-2xl border-none flex flex-col items-center select-none transition-all duration-200">
            {/* Top Scenic Banner with Margin & Rounded Corners */}
            <div className="w-full p-2.5 sm:p-3 pb-0">
              <div className="relative w-full h-36 bg-[#202024] rounded-[22px] sm:rounded-[24px] overflow-hidden">
                <img
                  src="/assets/fondo.jpeg"
                  alt="Banner"
                  className="w-full h-full object-cover brightness-[0.75]"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

                {/* Top Left Pill: ⭐ Level + XP */}
                <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-amber-300 border border-white/10 shadow-md">
                  <span>⭐</span>
                  <span>{profile?.level ? `Lv. ${profile.level}` : 'Lv. 200'}</span>
                  {craftWorld?.experiencePoints !== undefined && (
                    <span className="text-[10px] text-slate-300 font-normal">
                      ({formatNumber(craftWorld.experiencePoints).slice(0, 4)}k)
                    </span>
                  )}
                </div>

                {/* Top Right Refresh Icon Button */}
                <button
                  type="button"
                  onClick={load}
                  title={language === 'es' ? 'Actualizar Datos' : 'Refresh Data'}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 text-slate-200 hover:text-white flex items-center justify-center transition-all border border-white/10 cursor-pointer shadow-md"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Circular Avatar Cutout Overlapping the Banner Center */}
            <div className="-mt-10 mb-2 relative z-10 flex justify-center">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover shadow-2xl ring-4 ring-[#18181b] bg-[#151518]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#151518] ring-4 ring-[#18181b] shadow-2xl flex items-center justify-center text-3xl">
                  <ResourceIcon symbol="Coin" size={36} />
                </div>
              )}
            </div>

            {/* Card Content: Name with Badge, Subtitle & Details */}
            <div className="w-full px-5 pb-5 pt-0.5 flex flex-col items-center text-center space-y-1">
              {/* User Name with Verified Badge (Identical to JHON DOWA ✪) */}
              <div className="flex items-center gap-1.5 justify-center">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  {profile?.displayName || me.craftWorldDisplayName || me.id}
                </h2>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black shadow-sm">
                  ✓
                </span>
              </div>

              {/* Subtitle (Identical to Co. M90 Studio) */}
              <p className="text-xs text-slate-400 font-medium">
                UID: <span className="font-mono text-slate-300">{formatUid(me.craftWorldUid)}</span>
              </p>

              {/* XP & Crystal Pass pill */}
              <div className="pt-1 flex items-center gap-2">
                {craftWorld?.experiencePoints !== undefined && (
                  <span className="text-[11px] text-amber-400 font-mono font-semibold">
                    XP: {formatNumber(craftWorld.experiencePoints)}
                  </span>
                )}
                {purchases?.crystalPass?.hasActivePass && (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border-none">
                    💎 Pass
                  </span>
                )}
              </div>

              {isMissingScopes && (
                <button
                  type="button"
                  onClick={oauthAuthorize}
                  className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-1 rounded-full transition-all cursor-pointer"
                >
                  ⚡ {language === 'es' ? 'Re-vincular' : 'Re-link'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation - Responsive Carousel with Bottom Border Active Indicator */}
        <div className="w-full min-w-0 border-b border-white/10 overflow-hidden">
          <div className="flex items-center justify-start lg:justify-center gap-1 sm:gap-3 md:gap-6 overflow-x-auto scroll-smooth whitespace-nowrap px-1 sm:px-2 pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { id: 'overview', label: language === 'es' ? 'Visión General' : 'Overview' },
              { id: 'craft', label: language === 'es' ? 'Crafting & Bóvedas' : 'Crafting & Vaults' },
              {
                id: 'inventory',
                label: language === 'es' ? 'Inventario & Cofres' : 'Inventory & Chests',
              },
              { id: 'exchange', label: language === 'es' ? 'Mercado / Exchange' : 'Exchange' },
              { id: 'onchain', label: language === 'es' ? 'On-Chain & Wallets' : 'On-Chain' },
              {
                id: 'purchases',
                label: language === 'es' ? 'Pases & Compras' : 'Passes & Purchases',
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-3 sm:px-4 text-xs sm:text-[13px] tracking-wider uppercase transition-colors shrink-0 cursor-pointer border-b-2 bg-transparent ${
                    isActive
                      ? 'text-emerald-400 border-emerald-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200 border-transparent font-medium'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: OVERVIEW - GAME HUB */}
        {activeTab === 'overview' && (
          <div className="w-full min-w-0 space-y-6">
            {/* 1. FILA DE 4 TARJETAS CON WIDGETS GRÁFICOS (2 COLUMNAS EN MÓVIL, 4 EN DESKTOP) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {/* Tarjeta 1: Poder & Energía (Donut Ring Cían) */}
              <div className="bg-[#18181b] hover:bg-[#1f1f23] rounded-[24px] sm:rounded-[32px] p-3.5 sm:p-5 shadow-lg flex flex-col justify-between transition-all duration-200 select-none border-none">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xs sm:text-sm text-cyan-400">⚡</span>
                  <span className="text-[11px] sm:text-sm font-semibold text-slate-200 truncate">
                    {language === 'es' ? 'Poder & Energía' : 'Power & Energy'}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-1 sm:gap-2 mt-3 sm:mt-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-base sm:text-2xl font-bold font-sans text-white tracking-tight leading-tight truncate">
                      {craft ? formatNumber(powerAvail) : '—'}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                      {powerPercent}% {language === 'es' ? 'disp.' : 'avail.'}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <DonutRing
                      percent={powerPercent}
                      color="#06b6d4"
                      trackColor="#27272a"
                      size={38}
                      stroke={4.5}
                    />
                  </div>
                </div>
              </div>

              {/* Tarjeta 2: Masterpieces (Donut Ring Azul Cielo) */}
              <div className="bg-[#18181b] hover:bg-[#1f1f23] rounded-[24px] sm:rounded-[32px] p-3.5 sm:p-5 shadow-lg flex flex-col justify-between transition-all duration-200 select-none border-none">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xs sm:text-sm text-emerald-400">🏆</span>
                  <span className="text-[11px] sm:text-sm font-semibold text-slate-200 truncate">
                    {language === 'es' ? 'Masterpieces' : 'Masterpieces'}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-1 sm:gap-2 mt-3 sm:mt-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-base sm:text-2xl font-bold font-sans text-white tracking-tight leading-tight truncate">
                      {displayNumber(masterpieces?.claimedMasterpieceIds?.length ?? 0)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                      {language === 'es' ? 'reclamadas' : 'claimed'}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <DonutRing
                      percent={Math.min(100, Math.round(((masterpieces?.claimedMasterpieceIds?.length ?? 0) / 75) * 100))}
                      color="#0ea5e9"
                      trackColor="#1e293b"
                      size={38}
                      stroke={4.5}
                    />
                  </div>
                </div>
              </div>

              {/* Tarjeta 3: Temporada & Pases (Mini Bar Chart Ámbar) */}
              <div className="bg-[#18181b] hover:bg-[#1f1f23] rounded-[24px] sm:rounded-[32px] p-3.5 sm:p-5 shadow-lg flex flex-col justify-between transition-all duration-200 select-none border-none">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xs sm:text-sm text-amber-400">🌙</span>
                  <span className="text-[11px] sm:text-sm font-semibold text-slate-200 truncate">
                    {language === 'es' ? 'Temporada' : 'Season'}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-1 sm:gap-2 mt-3 sm:mt-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm sm:text-xl font-bold font-sans text-white tracking-tight leading-tight truncate">
                      {purchases?.crystalPass?.hasActivePass
                        ? 'Crystal'
                        : (masterpieces?.activeBattlePasses?.length ? `${masterpieces.activeBattlePasses.length} Pases` : (language === 'es' ? 'Pase' : 'Pass'))}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                      {purchases?.crystalPass?.hasActivePass
                        ? (language === 'es' ? 'Activo' : 'Active')
                        : (language === 'es' ? 'Inactivo' : 'Inactive')}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <MiniBarChart
                      activeIndex={purchases?.crystalPass?.hasActivePass ? 3 : 1}
                      color="#eab308"
                    />
                  </div>
                </div>
              </div>

              {/* Tarjeta 4: Skill Points (Neon Green Sparkline Wave) */}
              <div className="bg-[#18181b] hover:bg-[#1f1f23] rounded-[24px] sm:rounded-[32px] p-3.5 sm:p-5 shadow-lg flex flex-col justify-between transition-all duration-200 select-none border-none">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xs sm:text-sm text-emerald-400">🏋️</span>
                  <span className="text-[11px] sm:text-sm font-semibold text-slate-200 truncate">
                    {language === 'es' ? 'Skill Points' : 'Skill Points'}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-1 sm:gap-2 mt-3 sm:mt-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-base sm:text-2xl font-bold font-sans text-white tracking-tight leading-tight truncate">
                      {displayNumber(craft?.skillPoints ?? 0)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                      Nv. {profile?.level ?? craftWorld?.level ?? 200}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <SparklineWave color="#22c55e" width={48} height={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. TARJETAS INDEPENDIENTES SOBRE EL BODY (SIN ELEMENTOS REDUNDANTES) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Tarjeta Independiente 1: Resumen General (Sin Poder ni Skill Points) */}
              <div className="bg-[#18181b] rounded-[32px] p-5 sm:p-6 space-y-4 shadow-xl border-none">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-title text-xs text-white tracking-wide uppercase">
                    {language === 'es' ? 'Resumen General' : 'General Summary'}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">STATUS</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-[#131315] hover:bg-[#1a1a1e] rounded-full px-4 py-2.5 flex items-center justify-between transition-colors">
                    <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                      <span>🎮</span>
                      <span>{language === 'es' ? 'Nivel' : 'Level'}</span>
                    </span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      {displayNumber(profile?.level ?? craftWorld?.level)}
                    </span>
                  </div>
                  <div className="bg-[#131315] hover:bg-[#1a1a1e] rounded-full px-4 py-2.5 flex items-center justify-between transition-colors">
                    <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                      <span>📦</span>
                      <span>{language === 'es' ? 'Recursos' : 'Resources'}</span>
                    </span>
                    <span className="text-sm font-black text-amber-400 font-mono">
                      {displayNumber(craftWorld?.resources?.length ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta Independiente 2: Pases & Temporada (Sin Reliquias repetidas) */}
              <div className="bg-[#18181b] rounded-[32px] p-5 sm:p-6 space-y-4 shadow-xl border-none">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-title text-xs text-white tracking-wide uppercase">
                    {language === 'es' ? 'Pases & Temporada' : 'Passes & Season'}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">SEASON</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="bg-[#131315] hover:bg-[#1a1a1e] rounded-full px-4 py-2.5 flex items-center justify-between transition-colors">
                    <span className="text-slate-300 font-medium text-[11px] flex items-center gap-1.5">
                      <span>🎟️</span>
                      <span>{language === 'es' ? 'Battle Passes' : 'Battle Passes'}:</span>
                    </span>
                    <strong className="text-amber-400 font-mono text-sm">
                      {displayNumber(masterpieces?.activeBattlePasses?.length)}
                    </strong>
                  </div>
                  {purchases?.crystalPass && (
                    <div className="bg-[#131315] hover:bg-[#1a1a1e] rounded-full px-4 py-2.5 flex items-center justify-between transition-colors">
                      <span className="text-slate-300 font-medium text-[11px] flex items-center gap-1.5">
                        <span>💎</span>
                        <span>Crystal Pass:</span>
                      </span>
                      <StatusBadge
                        active={purchases.crystalPass.hasActivePass}
                        text={purchases.crystalPass.hasActivePass ? 'Activo' : 'Inactivo'}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CRAFTING & VAULTS */}
        {activeTab === 'craft' && (
          <div className="w-full min-w-0 space-y-4">
            {craft ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-start">
                {/* Card 1: Energía y Puntos */}
                <Card
                  title={language === 'es' ? '⚡ Energía y Puntos' : '⚡ Power & Points'}
                  action={
                    <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-full">
                      {powerPercent}% {language === 'es' ? 'disp.' : 'avail.'}
                    </span>
                  }
                  className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
                >
                  <div className="space-y-3">
                    <div className="bg-[#202024] rounded-[24px] p-4 space-y-2.5 shadow-sm">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-bold">
                          {language === 'es' ? 'Poder Disponible' : 'Available Power'}
                        </span>
                        <span className="text-cyan-400 font-mono font-black text-xs">
                          {formatNumber(craft.power - craft.powerUsed)} / {formatNumber(craft.power)}
                        </span>
                      </div>
                      <div className="w-full bg-[#151518] rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(0, ((craft.power - craft.powerUsed) / (craft.power || 1)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-[#202024] hover:bg-[#28282e] rounded-full p-3 px-4 flex justify-between items-center text-xs transition-colors shadow-sm">
                      <span className="text-slate-300 font-semibold flex items-center gap-2">
                        <span>🏋️</span>
                        <span>{language === 'es' ? 'Puntos de Habilidad' : 'Skill Points'}</span>
                      </span>
                      <strong className="text-purple-400 font-mono font-black text-sm">
                        {displayNumber(craft.skillPoints)}
                      </strong>
                    </div>
                  </div>
                </Card>

                {/* Card 2: Bóvedas (Vaults) */}
                <Card
                  title={language === 'es' ? '🏛️ Bóvedas (Vaults)' : '🏛️ Vaults'}
                  action={
                    totalVaults ? (
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {unlockedVaults}/{totalVaults} {language === 'es' ? 'activas' : 'active'}
                      </span>
                    ) : undefined
                  }
                  className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
                >
                  {craft.vaults?.length ? (
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
                      {craft.vaults.map((v: any, i: number) => (
                        <div
                          key={v.symbol || i}
                          className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2.5 px-3.5 flex justify-between items-center text-xs transition-colors shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#151518] flex items-center justify-center shrink-0">
                              <ResourceIcon symbol={v.symbol} size={20} />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-200 block leading-tight truncate">
                                {v.symbol}
                              </span>
                              <span className="text-[10px] text-slate-400 leading-tight block">
                                {v.isUnlocked
                                  ? (language === 'es' ? 'Desbloqueado' : 'Unlocked')
                                  : (language === 'es' ? 'Bloqueado' : 'Locked')}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-emerald-400 font-black font-mono block">
                              {formatNumber(v.amount)}
                            </span>
                            <span className="text-slate-500 text-[10px] font-mono block">
                              / {formatNumber(v.capacity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState>
                      {language === 'es' ? 'Sin datos de bóvedas' : 'No vaults data'}
                    </EmptyState>
                  )}
                </Card>

                {/* Card 3: Taller (Workshop) */}
                <Card
                  title={language === 'es' ? '🛠️ Taller (Workshop)' : '🛠️ Workshop'}
                  action={
                    craft.workshop?.length ? (
                      <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded-full">
                        {craft.workshop.length} {language === 'es' ? 'talleres' : 'workshops'}
                      </span>
                    ) : undefined
                  }
                  className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
                >
                  {craft.workshop?.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
                      {craft.workshop.map((w: any, i: number) => (
                        <div
                          key={w.symbol || i}
                          className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2.5 px-3 flex items-center justify-between text-xs transition-colors shadow-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-1.5">
                            <div className="w-8 h-8 rounded-full bg-[#151518] flex items-center justify-center shrink-0">
                              <FactoryIcon symbol={w.symbol} size={20} />
                            </div>
                            <span className="text-slate-200 font-bold text-xs truncate">
                              {w.symbol}
                            </span>
                          </div>
                          <span className="bg-amber-500/15 text-amber-400 text-[11px] px-2 py-0.5 rounded-full font-black font-mono shrink-0">
                            Nv. {w.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState>
                      {language === 'es' ? 'Sin datos de taller' : 'No workshop data'}
                    </EmptyState>
                  )}
                </Card>
              </div>
            ) : (
              <Card>
                <div className="text-center py-6">
                  <p className="text-amber-400 font-bold mb-2">
                    ⚠️ Scope `craft:read` no autorizado aún
                  </p>
                  <button onClick={oauthAuthorize} className="retroBtn">
                    {language === 'es' ? 'Re-vincular Cuenta' : 'Re-link Account'}
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 3: INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="w-full min-w-0 space-y-4">
            {inventory ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-start">
                {/* Card 1: Huevos & Cofres */}
                <Card
                  title={language === 'es' ? '🥚 Huevos y Cofres' : '🥚 Eggs & Chests'}
                  className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
                >
                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-300">
                          {language === 'es' ? 'Huevos' : 'Eggs'}
                        </span>
                        {inventory.eggs?.length ? (
                          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {inventory.eggs.reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0)} total
                          </span>
                        ) : null}
                      </div>

                      {inventory.eggs?.length ? (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                          {inventory.eggs.map((e: any, i: number) => (
                            <div
                              key={i}
                              className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2 px-3 flex items-center justify-between transition-colors shadow-sm"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-sm">🥚</span>
                                <span className="font-bold text-slate-200 text-xs truncate">
                                  {formatEggName(e.definitionId)}
                                </span>
                              </div>
                              <span className="font-mono font-black text-emerald-400 text-xs shrink-0">
                                x{e.amount}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState>{language === 'es' ? 'Sin huevos' : 'No eggs'}</EmptyState>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-300">
                          {language === 'es' ? 'Cofres' : 'Chests'}
                        </span>
                        {inventory.chests?.length ? (
                          <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded-full">
                            {inventory.chests.reduce((acc: number, c: any) => acc + (Number(c.count) || 0), 0)} total
                          </span>
                        ) : null}
                      </div>

                      {inventory.chests?.length ? (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                          {inventory.chests.map((c: any, i: number) => (
                            <div
                              key={i}
                              className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2 px-3 flex items-center justify-between transition-colors shadow-sm"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-sm">🎁</span>
                                <span className="font-bold text-slate-200 text-xs truncate">
                                  {c.definitionId}
                                </span>
                              </div>
                              <span className="font-mono font-black text-amber-400 text-xs shrink-0">
                                x{c.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState>{language === 'es' ? 'Sin cofres' : 'No chests'}</EmptyState>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Card 2: Fábricas en Reserva */}
                <Card
                  title={language === 'es' ? '🏭 En Reserva' : '🏭 Stashed'}
                  action={
                    inventory.factoryInventory?.length ? (
                      <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded-full">
                        {inventory.factoryInventory.length} {language === 'es' ? 'fábricas' : 'factories'}
                      </span>
                    ) : undefined
                  }
                  className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
                >
                  {inventory.factoryInventory?.length ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
                      {inventory.factoryInventory.map((f: any, i: number) => (
                        <div
                          key={f.id || i}
                          className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2 px-3.5 flex justify-between items-center text-xs transition-colors shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#151518] flex items-center justify-center shrink-0">
                              <FactoryIcon symbol={f.definitionId} size={20} />
                            </div>
                            <span className="text-slate-200 font-bold truncate">{f.definitionId}</span>
                          </div>
                          <span className="bg-emerald-500/15 text-emerald-400 text-[11px] px-2.5 py-0.5 rounded-full font-black font-mono shrink-0">
                            Nv. {(f.level ?? 0) + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState>
                      {language === 'es' ? 'No hay fábricas en reserva' : 'No stashed factories'}
                    </EmptyState>
                  )}
                </Card>

                {/* Card 3: Boosters & Power Packs */}
                <Card
                  title={language === 'es' ? '🚀 Boosters & Packs' : '🚀 Boosters & Packs'}
                  action={
                    inventory.availableBoosters?.length ? (
                      <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-full">
                        {inventory.availableBoosters.length} {language === 'es' ? 'packs' : 'packs'}
                      </span>
                    ) : undefined
                  }
                  className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
                >
                  {inventory.availableBoosters?.length ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
                      {inventory.availableBoosters.map((b: any, i: number) => (
                        <div
                          key={i}
                          className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2 px-3.5 flex justify-between items-center text-xs transition-colors shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-sm">⚡</span>
                            <span className="text-slate-200 font-bold truncate">
                              {formatBoosterName(b.id)}
                            </span>
                          </div>
                          <span className="bg-cyan-500/15 text-cyan-400 font-mono font-black text-xs px-2.5 py-0.5 rounded-full shrink-0">
                            x{b.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState>
                      {language === 'es' ? 'Sin boosters' : 'No boosters'}
                    </EmptyState>
                  )}
                </Card>
              </div>
            ) : (
              <Card>
                <div className="text-center py-6">
                  <p className="text-amber-400 font-bold mb-2">
                    ⚠️ Scope `inventory:read` no autorizado aún
                  </p>
                  <button onClick={oauthAuthorize} className="retroBtn">
                    {language === 'es' ? 'Re-vincular Cuenta' : 'Re-link Account'}
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 4: EXCHANGE */}
        {activeTab === 'exchange' && (
          <div className="w-full min-w-0 space-y-4">
            {exchange ? (
              <div className="grid gap-4 md:grid-cols-2 items-start">
                {/* Card 1: Estadísticas del Mercado */}
                <Card
                  title={language === 'es' ? '📊 Estadísticas del Mercado' : '📊 Market Stats'}
                  className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#202024] hover:bg-[#28282e] rounded-[24px] p-3.5 sm:p-4 flex flex-col justify-between transition-colors shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🔄</span>
                        <span className="text-xs sm:text-sm text-slate-300 font-semibold truncate">
                          {language === 'es' ? 'Operaciones' : 'Trades'}
                        </span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-2">
                        {displayNumber(exchange.tradeAccount?.tradeCount ?? 0)}
                      </div>
                    </div>

                    <div className="bg-[#202024] hover:bg-[#28282e] rounded-[24px] p-3.5 sm:p-4 flex flex-col justify-between transition-colors shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">⚡</span>
                        <span className="text-xs sm:text-sm text-slate-300 font-semibold truncate">
                          {language === 'es' ? 'Recarga Diaria' : 'Daily Refill'}
                        </span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-2">
                        {displayNumber(exchange.tradeAccount?.dailyRefillAmount ?? 0)}
                      </div>
                    </div>

                    <div className="bg-[#202024] hover:bg-[#28282e] rounded-[24px] p-3.5 sm:p-4 flex flex-col justify-between transition-colors shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">📈</span>
                        <span className="text-xs sm:text-sm text-slate-300 font-semibold truncate">
                          {language === 'es' ? 'Volumen Total' : 'Total Volume'}
                        </span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400 mt-2 truncate">
                        {formatNumber(exchange.tradeAccount?.totalTradeAmount)}
                      </div>
                    </div>

                    <div className="bg-[#202024] hover:bg-[#28282e] rounded-[24px] p-3.5 sm:p-4 flex flex-col justify-between transition-colors shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">📦</span>
                        <span className="text-xs sm:text-sm text-slate-300 font-semibold truncate">
                          {language === 'es' ? 'Capacidad' : 'Capacity'}
                        </span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-purple-400 mt-2">
                        {displayNumber(exchange.tradeAccount?.capacity ?? 0)}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Card 2: Historial de Ejecuciones */}
                <Card
                  title={language === 'es' ? '📜 Historial de Ejecuciones' : '📜 Trade History'}
                  action={
                    exchange.tradeExecutions?.length ? (
                      <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2.5 py-0.5 rounded-full">
                        {exchange.tradeExecutions.length} {language === 'es' ? 'trades' : 'trades'}
                      </span>
                    ) : undefined
                  }
                  className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
                >
                  {exchange.tradeExecutions?.length ? (
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
                      {exchange.tradeExecutions.map((t: any, i: number) => {
                        const inRaw = Number(t.quote?.input?.amount);
                        const outRaw = Number(t.quote?.output?.amount);
                        const inAmount = !isNaN(inRaw) ? formatNumber(inRaw) : (t.quote?.input?.amount ?? '0');
                        const outAmount = !isNaN(outRaw) ? formatNumber(outRaw) : (t.quote?.output?.amount ?? '0');

                        return (
                          <div
                            key={t.id || i}
                            className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2.5 px-3.5 text-xs flex justify-between items-center transition-colors shadow-sm"
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 pr-2">
                              <div className="flex items-center gap-1 shrink-0">
                                <ResourceIcon symbol={t.quote?.input?.symbol} size={18} />
                                <span className="text-slate-200 font-bold font-mono">
                                  {inAmount}
                                </span>
                                <span className="text-slate-400 text-[11px] hidden sm:inline">
                                  {t.quote?.input?.symbol}
                                </span>
                              </div>

                              <span className="text-slate-500 font-bold px-0.5">➔</span>

                              <div className="flex items-center gap-1 shrink-0">
                                <ResourceIcon symbol={t.quote?.output?.symbol} size={18} />
                                <span className="text-emerald-400 font-black font-mono">
                                  {outAmount}
                                </span>
                                <span className="text-emerald-500/80 text-[11px] hidden sm:inline">
                                  {t.quote?.output?.symbol}
                                </span>
                              </div>
                            </div>

                            <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full shrink-0">
                              {t.id ? `${t.id.slice(0, 8)}...` : 'tx'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState>
                      {language === 'es' ? 'No hay operaciones recientes' : 'No recent trades'}
                    </EmptyState>
                  )}
                </Card>
              </div>
            ) : (
              <Card>
                <div className="text-center py-6">
                  <p className="text-amber-400 font-bold mb-2">
                    ⚠️ Scope `exchange:read` no autorizado aún
                  </p>
                  <button onClick={oauthAuthorize} className="retroBtn">
                    {language === 'es' ? 'Re-vincular Cuenta' : 'Re-link Account'}
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 5: ONCHAIN */}
        {activeTab === 'onchain' && (
          <div className="w-full min-w-0 space-y-4">
            {onchain ? (
              <div className="grid gap-4 md:grid-cols-2 items-start">
                {/* Card 1: Wallets Vinculadas */}
                <Card
                  title={language === 'es' ? '👛 Wallets Vinculadas' : '👛 Linked Wallets'}
                  className="rounded-[32px] bg-[#18181b]"
                >
                  {onchain.wallets?.length ? (
                    <div className="space-y-2.5">
                      {onchain.wallets.map((w: any, i: number) => (
                        <div
                          key={w.address || i}
                          className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2.5 px-4 flex items-center justify-between transition-all select-none shadow-md text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-200 truncate">
                                {w.address.slice(0, 6)}...{w.address.slice(-4)}
                              </span>
                              {w.primary && (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border-none shrink-0">
                                  PRINCIPAL
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                              {w.type} {w.provider ? `(${w.provider})` : ''}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(w.address);
                              setCopiedAddress(w.address);
                              setTimeout(() => setCopiedAddress(null), 1500);
                            }}
                            title={language === 'es' ? 'Copiar dirección' : 'Copy address'}
                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                          >
                            {copiedAddress === w.address ? (
                              <svg
                                className="w-4 h-4 text-emerald-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2.5"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState>
                      {language === 'es' ? 'No hay wallets vinculadas' : 'No linked wallets'}
                    </EmptyState>
                  )}
                </Card>

                {/* Card 2: Recursos On-Chain con Scroll compacto */}
                <Card
                  title={language === 'es' ? '🌐 Recursos On-Chain' : '🌐 On-Chain Resources'}
                  action={
                    onchain.resourcesOnChain?.length ? (
                      <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2.5 py-0.5 rounded-full">
                        {onchain.resourcesOnChain.length} {language === 'es' ? 'tipos' : 'types'}
                      </span>
                    ) : undefined
                  }
                  className="rounded-[32px] bg-[#18181b]"
                >
                  {onchain.resourcesOnChain?.length ? (
                    <div className="max-h-[250px] sm:max-h-[270px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {onchain.resourcesOnChain.map((r: any, i: number) => {
                          const hasStock = Number(r.amount) > 0;
                          return (
                            <div
                              key={r.symbol || i}
                              className="group bg-[#202024] hover:bg-[#28282e] rounded-full p-2 sm:p-2.5 pr-3 sm:pr-3.5 flex items-center justify-between transition-all duration-200 select-none shadow-md hover:scale-[1.015]"
                            >
                              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-[#151518] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                                  <ResourceIcon symbol={r.symbol} size={22} />
                                </div>

                                <div className="min-w-0">
                                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate">
                                    {r.symbol}
                                  </h4>
                                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-tight mt-0.5 truncate">
                                    {hasStock
                                      ? language === 'es'
                                        ? `${formatNumber(r.amount)} en wallet`
                                        : `${formatNumber(r.amount)} in wallet`
                                      : language === 'es'
                                        ? 'Sin saldo (0)'
                                        : 'No balance (0)'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                                  <svg
                                    className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M7 17L17 7M17 7H9M17 7V15"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <EmptyState>
                      {language === 'es' ? 'No hay recursos on-chain' : 'No on-chain resources'}
                    </EmptyState>
                  )}
                </Card>
              </div>
            ) : (
              <Card>
                <div className="text-center py-6">
                  <p className="text-amber-400 font-bold mb-2">
                    ⚠️ Scope `onchain:read` no autorizado aún
                  </p>
                  <button onClick={oauthAuthorize} className="retroBtn">
                    {language === 'es' ? 'Re-vincular Cuenta' : 'Re-link Account'}
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 6: PURCHASES */}
        {activeTab === 'purchases' && (
          <div className="w-full min-w-0 space-y-4">
            {purchases ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-start">
                {/* Card 1: Beneficios & Pases */}
                <Card
                  title={language === 'es' ? '💎 Beneficios & Pases' : '💎 Perks & Pass'}
                  className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
                >
                  <div className="space-y-2.5 text-xs">
                    <div className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2.5 px-3.5 flex justify-between items-center transition-colors shadow-sm">
                      <span className="text-slate-200 font-semibold flex items-center gap-2">
                        <span>🚫</span>
                        <span>{language === 'es' ? 'Sin Anuncios' : 'No-Ads Active'}</span>
                      </span>
                      <StatusBadge
                        active={purchases.isNoAdsActive}
                        text={purchases.isNoAdsActive ? (language === 'es' ? 'Activo' : 'Active') : (language === 'es' ? 'Inactivo' : 'Inactive')}
                      />
                    </div>

                    <div className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2.5 px-3.5 flex justify-between items-center transition-colors shadow-sm">
                      <span className="text-slate-200 font-semibold flex items-center gap-2">
                        <span>🔄</span>
                        <span>{language === 'es' ? 'Transferencias' : 'Transfer Active'}</span>
                      </span>
                      <StatusBadge
                        active={purchases.isTransferActive}
                        text={purchases.isTransferActive ? (language === 'es' ? 'Activo' : 'Active') : (language === 'es' ? 'Inactivo' : 'Inactive')}
                      />
                    </div>

                    {purchases.crystalPass && (
                      <div className="bg-[#202024] rounded-[24px] p-3.5 space-y-2 shadow-sm border-none">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                            <ResourceIcon symbol="Coin" size={16} /> Crystal Pass
                          </span>
                          <StatusBadge
                            active={purchases.crystalPass.hasActivePass}
                            text={purchases.crystalPass.hasActivePass ? 'Activo' : 'Inactivo'}
                          />
                        </div>

                        <div className="flex justify-between items-center text-xs pt-1">
                          <span className="text-slate-400">
                            {language === 'es' ? 'Días Restantes' : 'Remaining Days'}:
                          </span>
                          <span className="font-mono font-bold text-slate-200">
                            {purchases.crystalPass.remainingDays} / {purchases.crystalPass.maxDays}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">
                            {language === 'es' ? 'Cristales Reclamables' : 'Claimable Crystals'}:
                          </span>
                          <span className="font-mono font-black text-emerald-400">
                            {purchases.crystalPass.claimableCrystals}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Card 2: Historial de Tienda */}
                <Card
                  title={language === 'es' ? '🛍️ Historial de Tienda' : '🛍️ Shop Purchases'}
                  action={
                    purchases.shopItemPurchases?.length ? (
                      <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2.5 py-0.5 rounded-full">
                        {purchases.shopItemPurchases.length} {language === 'es' ? 'compras' : 'items'}
                      </span>
                    ) : undefined
                  }
                  className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
                >
                  {purchases.shopItemPurchases?.length ? (
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
                      {purchases.shopItemPurchases.map((p: any, i: number) => (
                        <div
                          key={i}
                          className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2.5 px-3.5 flex justify-between items-center text-xs transition-colors shadow-sm"
                        >
                          <span className="text-slate-200 font-bold truncate pr-2">
                            {formatShopItem(p.shopItemId, language)}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full shrink-0">
                            {new Date(p.purchasedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState>
                      {language === 'es' ? 'Sin compras en tienda' : 'No shop purchases'}
                    </EmptyState>
                  )}
                </Card>

                {/* Card 3: Anuncios Vistos */}
                <Card
                  title={language === 'es' ? '📺 Anuncios Vistos' : '📺 Ad Watch Counts'}
                  action={
                    purchases.adWatchCounts?.length ? (
                      <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2.5 py-0.5 rounded-full">
                        {purchases.adWatchCounts.reduce((acc: number, a: any) => acc + (Number(a.count) || 0), 0)} {language === 'es' ? 'total' : 'total'}
                      </span>
                    ) : undefined
                  }
                  className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
                >
                  {purchases.adWatchCounts?.length ? (
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
                      {purchases.adWatchCounts.map((ad: any, i: number) => (
                        <div
                          key={i}
                          className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2.5 px-3.5 flex justify-between items-center text-xs transition-colors shadow-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="text-sm">📺</span>
                            <span className="text-slate-200 font-bold truncate">
                              {formatAdPlacement(ad.adPlacement, language)}
                            </span>
                          </div>
                          <span className="bg-cyan-500/15 text-cyan-400 font-mono font-black text-xs px-2.5 py-0.5 rounded-full shrink-0">
                            x{ad.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState>
                      {language === 'es' ? 'Sin conteos de anuncios' : 'No ad counts'}
                    </EmptyState>
                  )}
                </Card>
              </div>
            ) : (
              <Card>
                <div className="text-center py-6">
                  <p className="text-amber-400 font-bold mb-2">
                    ⚠️ Scope `purchases:read` no autorizado aún
                  </p>
                  <button onClick={oauthAuthorize} className="retroBtn">
                    {language === 'es' ? 'Re-vincular Cuenta' : 'Re-link Account'}
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
