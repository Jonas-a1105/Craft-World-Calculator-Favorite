import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Layout from '../components/Layout';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { getMe, getCraftworldHome, oauthAuthorize } from '../services/api';
import { ResourceIcon, FactoryIcon } from '../components/GameIcon';

function EmptyState({ children }: { children: string }) {
  return <p className="text-sm text-slate-400 py-2">{children}</p>;
}

function StatusBadge({ active, text }: { active: boolean; text: string }) {
  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
        active
          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/60'
          : 'bg-slate-900/60 text-slate-400 border border-slate-700/60'
      }`}
    >
      {text}
    </span>
  );
}

function displayNumber(value: unknown) {
  return typeof value === 'number' ? value.toLocaleString() : '—';
}

function formatNumber(value: unknown, digits = 2) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: digits })
    : '0';
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

  return (
    <Layout>
      <div className="grid gap-6 lg:grid-cols-12 items-start max-w-[1200px] mx-auto w-full">
        {/* Header */}
        <div className="lg:col-span-12 text-center mt-2 mb-1">
          <h2
            className="text-3xl font-extrabold text-white tracking-wider"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
          >
            {language === 'es' ? 'Panel de Control' : 'Dashboard Control Panel'}
          </h2>
        </div>

        {error && (
          <div className="lg:col-span-12">
            <Card>{error}</Card>
          </div>
        )}

        {/* User Card Header */}
        <div className="lg:col-span-12 w-full">
          <Card>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar"
                    className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg shadow-emerald-950/40"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                    <ResourceIcon symbol="Coin" size={32} />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                      {profile?.displayName || me.craftWorldDisplayName || me.id}
                    </p>
                    {profile?.level && (
                      <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                        Lv. {profile.level}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs text-slate-400">
                      UID: <strong className="text-slate-200">{me.craftWorldUid || 'N/A'}</strong>
                    </span>
                    {craftWorld?.experiencePoints !== undefined && (
                      <span className="text-xs text-slate-400">
                        • XP:{' '}
                        <strong className="text-amber-300">
                          {formatNumber(craftWorld.experiencePoints)}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isMissingScopes && (
                  <button
                    onClick={oauthAuthorize}
                    className="retroBtn text-xs"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#000',
                    }}
                  >
                    ⚡ {language === 'es' ? 'Re-vincular Scopes' : 'Re-link Scopes'}
                  </button>
                )}
                <button onClick={load} className="retroBtn shrink-0 text-xs">
                  {language === 'es' ? 'Actualizar Datos' : 'Refresh Data'}
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="lg:col-span-12 flex flex-wrap gap-2 border-b border-slate-800 pb-3">
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
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50 scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <div className="lg:col-span-4 space-y-4">
              <Card title={language === 'es' ? 'Resumen General' : 'General Summary'}>
                <div className="grid grid-cols-2 gap-2.5 text-center">
                  <div className="resource-item-badge p-2.5 text-white">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      {language === 'es' ? 'Nivel' : 'Level'}
                    </p>
                    <p className="text-lg font-black text-emerald-400">
                      {displayNumber(profile?.level ?? craftWorld?.level)}
                    </p>
                  </div>
                  <div className="resource-item-badge p-2.5 text-white">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      {language === 'es' ? 'Recursos' : 'Resources'}
                    </p>
                    <p className="text-lg font-black text-amber-400">
                      {displayNumber(craftWorld?.resources?.length ?? 0)}
                    </p>
                  </div>
                  <div className="resource-item-badge p-2.5 text-white">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      {language === 'es' ? 'Poder' : 'Power'}
                    </p>
                    <p className="text-lg font-black text-cyan-400">
                      {craft ? `${craft.power - craft.powerUsed}/${craft.power}` : '—'}
                    </p>
                  </div>
                  <div className="resource-item-badge p-2.5 text-white">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      {language === 'es' ? 'Skill Points' : 'Skill Points'}
                    </p>
                    <p className="text-lg font-black text-purple-400">
                      {displayNumber(craft?.skillPoints)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card title={language === 'es' ? 'Masterpieces & Pase' : 'Masterpieces & Pass'}>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center resource-item-badge p-2 text-white">
                    <span className="text-slate-300">
                      {language === 'es' ? 'Reclamados' : 'Claimed'}:
                    </span>
                    <strong className="text-emerald-400">
                      {displayNumber(masterpieces?.claimedMasterpieceIds?.length)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center resource-item-badge p-2 text-white">
                    <span className="text-slate-300">
                      {language === 'es' ? 'Battle Passes' : 'Battle Passes'}:
                    </span>
                    <strong className="text-amber-400">
                      {displayNumber(masterpieces?.activeBattlePasses?.length)}
                    </strong>
                  </div>
                  {purchases?.crystalPass && (
                    <div className="flex justify-between items-center resource-item-badge p-2 text-white">
                      <span className="text-slate-300">Crystal Pass:</span>
                      <StatusBadge
                        active={purchases.crystalPass.hasActivePass}
                        text={purchases.crystalPass.hasActivePass ? 'Activo' : 'Inactivo'}
                      />
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <Card title={language === 'es' ? 'Balances de Recursos' : 'Resource Balances'}>
                {craftWorld?.resources?.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {craftWorld.resources.map((r: any, i: number) => (
                      <div
                        key={r.symbol || i}
                        className="resource-item-badge p-2.5 flex items-center gap-2.5"
                      >
                        <ResourceIcon symbol={r.symbol} size={24} />
                        <div className="min-w-0">
                          <span className="text-[11px] text-slate-400 font-semibold block truncate">
                            {r.symbol}
                          </span>
                          <span className="text-sm font-black text-amber-300">
                            {formatNumber(r.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState>
                    {language === 'es'
                      ? 'No hay recursos cargados.'
                      : 'No resource balances loaded.'}
                  </EmptyState>
                )}
              </Card>
            </div>
          </>
        )}

        {/* TAB 2: CRAFTING & VAULTS */}
        {activeTab === 'craft' && (
          <div className="lg:col-span-12 space-y-4">
            {craft ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card title={language === 'es' ? '⚡ Energía y Puntos' : '⚡ Power & Points'}>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-300">
                          {language === 'es' ? 'Poder Disponible' : 'Available Power'}
                        </span>
                        <span className="text-cyan-400">
                          {craft.power - craft.powerUsed} / {craft.power}
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(0, ((craft.power - craft.powerUsed) / (craft.power || 1)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t border-slate-800">
                      <span className="text-slate-400">
                        {language === 'es' ? 'Puntos de Habilidad' : 'Skill Points'}:
                      </span>
                      <strong className="text-purple-400 font-bold">{craft.skillPoints}</strong>
                    </div>
                  </div>
                </Card>

                <Card title={language === 'es' ? '🏛️ Bóvedas (Vaults)' : '🏛️ Vaults'}>
                  {craft.vaults?.length ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {craft.vaults.map((v: any, i: number) => (
                        <div
                          key={v.symbol || i}
                          className="resource-item-badge p-2 flex justify-between items-center text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <ResourceIcon symbol={v.symbol} size={20} />
                            <div>
                              <span className="font-bold text-slate-200">{v.symbol}</span>
                              <span className="text-[10px] text-slate-400 block">
                                {v.isUnlocked
                                  ? language === 'es'
                                    ? 'Desbloqueado'
                                    : 'Unlocked'
                                  : language === 'es'
                                    ? 'Bloqueado'
                                    : 'Locked'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-400 font-bold">
                              {formatNumber(v.amount)}
                            </span>
                            <span className="text-slate-500 text-[10px] block">
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

                <Card title={language === 'es' ? '🛠️ Taller (Workshop)' : '🛠️ Workshop'}>
                  {craft.workshop?.length ? (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {craft.workshop.map((w: any, i: number) => (
                        <div
                          key={w.symbol || i}
                          className="resource-item-badge p-2 flex items-center gap-2 text-xs"
                        >
                          <FactoryIcon symbol={w.symbol} size={24} />
                          <div>
                            <span className="text-slate-400 text-[10px] block truncate">
                              {w.symbol}
                            </span>
                            <span className="text-amber-400 font-bold">Nv. {w.level}</span>
                          </div>
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
          <div className="lg:col-span-12 space-y-4">
            {inventory ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card title={language === 'es' ? '🥚 Huevos y Cofres' : '🥚 Eggs & Chests'}>
                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-300 mb-1.5">
                        {language === 'es' ? 'Huevos en Inventario' : 'Inventory Eggs'}:
                      </p>
                      {inventory.eggs?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {inventory.eggs.map((e: any, i: number) => (
                            <span
                              key={i}
                              className="resource-item-badge px-2.5 py-1 rounded text-emerald-400 font-bold flex items-center gap-1.5"
                            >
                              <ResourceIcon symbol={e.definitionId} size={16} />
                              {e.definitionId}: {e.amount}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <EmptyState>{language === 'es' ? 'Sin huevos' : 'No eggs'}</EmptyState>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <p className="font-bold text-slate-300 mb-1.5">
                        {language === 'es' ? 'Cofres en Inventario' : 'Inventory Chests'}:
                      </p>
                      {inventory.chests?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {inventory.chests.map((c: any, i: number) => (
                            <span
                              key={i}
                              className="resource-item-badge px-2.5 py-1 rounded text-amber-400 font-bold flex items-center gap-1.5"
                            >
                              <ResourceIcon symbol={c.definitionId} size={16} />
                              {c.definitionId}: {c.count}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <EmptyState>{language === 'es' ? 'Sin cofres' : 'No chests'}</EmptyState>
                      )}
                    </div>
                  </div>
                </Card>

                <Card
                  title={language === 'es' ? '🏭 Inventario de Fábricas' : '🏭 Stashed Factories'}
                >
                  {inventory.factoryInventory?.length ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {inventory.factoryInventory.map((f: any, i: number) => (
                        <div
                          key={f.id || i}
                          className="resource-item-badge p-2 flex justify-between items-center text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <FactoryIcon symbol={f.definitionId} size={24} />
                            <span className="text-slate-200 font-bold">{f.definitionId}</span>
                          </div>
                          <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold">
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

                <Card
                  title={
                    language === 'es' ? '🚀 Boosters & Power Packs' : '🚀 Boosters & Power Packs'
                  }
                >
                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-300 mb-1">
                        {language === 'es' ? 'Boosters Disponibles' : 'Available Boosters'}:
                      </p>
                      {inventory.availableBoosters?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {inventory.availableBoosters.map((b: any, i: number) => (
                            <span
                              key={i}
                              className="resource-item-badge px-2 py-1 text-cyan-300 font-bold flex items-center gap-1"
                            >
                              <ResourceIcon symbol={b.id} size={16} />
                              {b.id}: x{b.amount}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <EmptyState>
                          {language === 'es' ? 'Sin boosters' : 'No boosters'}
                        </EmptyState>
                      )}
                    </div>
                  </div>
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
          <div className="lg:col-span-12 space-y-4">
            {exchange ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Card title={language === 'es' ? '📊 Estadísticas del Mercado' : '📊 Market Stats'}>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="resource-item-badge p-3">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        {language === 'es' ? 'Operaciones Realizadas' : 'Trade Count'}
                      </p>
                      <p className="text-xl font-black text-emerald-400">
                        {exchange.tradeAccount?.tradeCount ?? 0}
                      </p>
                    </div>
                    <div className="resource-item-badge p-3">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        {language === 'es' ? 'Recarga Diaria' : 'Daily Refill'}
                      </p>
                      <p className="text-xl font-black text-amber-400">
                        {exchange.tradeAccount?.dailyRefillAmount ?? 0}
                      </p>
                    </div>
                    <div className="resource-item-badge p-3">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        {language === 'es' ? 'Volumen Total' : 'Total Volume'}
                      </p>
                      <p className="text-xl font-black text-cyan-400">
                        {formatNumber(exchange.tradeAccount?.totalTradeAmount)}
                      </p>
                    </div>
                    <div className="resource-item-badge p-3">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        {language === 'es' ? 'Capacidad' : 'Capacity'}
                      </p>
                      <p className="text-xl font-black text-purple-400">
                        {exchange.tradeAccount?.capacity ?? 0}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  title={language === 'es' ? '📜 Historial de Ejecuciones' : '📜 Trade History'}
                >
                  {exchange.tradeExecutions?.length ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {exchange.tradeExecutions.map((t: any, i: number) => (
                        <div
                          key={t.id || i}
                          className="resource-item-badge p-2 text-xs flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2">
                            <ResourceIcon symbol={t.quote?.input?.symbol} size={18} />
                            <span className="text-slate-300 font-bold">
                              {t.quote?.input?.amount} {t.quote?.input?.symbol}
                            </span>
                            <span className="text-slate-500 mx-1">➔</span>
                            <ResourceIcon symbol={t.quote?.output?.symbol} size={18} />
                            <span className="text-emerald-400 font-bold">
                              {t.quote?.output?.amount} {t.quote?.output?.symbol}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">{t.id.slice(0, 8)}...</span>
                        </div>
                      ))}
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
          <div className="lg:col-span-12 space-y-4">
            {onchain ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Card title={language === 'es' ? '👛 Wallets Vinculadas' : '👛 Linked Wallets'}>
                  {onchain.wallets?.length ? (
                    <div className="space-y-2">
                      {onchain.wallets.map((w: any, i: number) => (
                        <div
                          key={w.address || i}
                          className="resource-item-badge p-3 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-200">
                                {w.address.slice(0, 6)}...{w.address.slice(-4)}
                              </span>
                              {w.primary && (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-500/30">
                                  PRINCIPAL
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {w.type} {w.provider ? `(${w.provider})` : ''}
                            </span>
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(w.address)}
                            className="text-[10px] retroBtn"
                          >
                            Copiar
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

                <Card title={language === 'es' ? '🌐 Recursos On-Chain' : '🌐 On-Chain Resources'}>
                  {onchain.resourcesOnChain?.length ? (
                    <div className="grid grid-cols-2 gap-2">
                      {onchain.resourcesOnChain.map((r: any, i: number) => (
                        <div
                          key={r.symbol || i}
                          className="resource-item-badge p-2.5 flex items-center gap-2"
                        >
                          <ResourceIcon symbol={r.symbol} size={22} />
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">
                              {r.symbol}
                            </span>
                            <span className="text-sm font-black text-cyan-400">
                              {formatNumber(r.amount)}
                            </span>
                          </div>
                        </div>
                      ))}
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
          <div className="lg:col-span-12 space-y-4">
            {purchases ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card
                  title={
                    language === 'es' ? '💎 Crystal Pass & Beneficios' : '💎 Crystal Pass & Perks'
                  }
                >
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center p-2 rounded resource-item-badge">
                      <span className="text-slate-300 font-bold">No-Ads Active:</span>
                      <StatusBadge
                        active={purchases.isNoAdsActive}
                        text={purchases.isNoAdsActive ? 'SÍ' : 'NO'}
                      />
                    </div>
                    <div className="flex justify-between items-center p-2 rounded resource-item-badge">
                      <span className="text-slate-300 font-bold">Transfer Active:</span>
                      <StatusBadge
                        active={purchases.isTransferActive}
                        text={purchases.isTransferActive ? 'SÍ' : 'NO'}
                      />
                    </div>
                    {purchases.crystalPass && (
                      <div className="p-3 rounded resource-item-badge space-y-1">
                        <p className="font-bold text-amber-400 flex items-center gap-1.5">
                          <ResourceIcon symbol="Coin" size={18} /> Crystal Pass
                        </p>
                        <p className="text-slate-300">
                          {language === 'es' ? 'Días Restantes' : 'Remaining Days'}:{' '}
                          <strong>{purchases.crystalPass.remainingDays}</strong> /{' '}
                          {purchases.crystalPass.maxDays}
                        </p>
                        <p className="text-slate-300">
                          {language === 'es' ? 'Cristales Reclamables' : 'Claimable Crystals'}:{' '}
                          <strong className="text-emerald-400">
                            {purchases.crystalPass.claimableCrystals}
                          </strong>
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                <Card title={language === 'es' ? '🛍️ Historial de Tienda' : '🛍️ Shop Purchases'}>
                  {purchases.shopItemPurchases?.length ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                      {purchases.shopItemPurchases.map((p: any, i: number) => (
                        <div key={i} className="resource-item-badge p-2 flex justify-between">
                          <span className="text-slate-200 font-bold">{p.shopItemId}</span>
                          <span className="text-slate-500 text-[10px]">
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

                <Card title={language === 'es' ? '📺 Anuncios Vistos' : '📺 Ad Watch Counts'}>
                  {purchases.adWatchCounts?.length ? (
                    <div className="space-y-2 text-xs">
                      {purchases.adWatchCounts.map((ad: any, i: number) => (
                        <div
                          key={i}
                          className="resource-item-badge p-2 flex justify-between items-center"
                        >
                          <span className="text-slate-300 font-bold">{ad.adPlacement}</span>
                          <span className="text-cyan-400 font-black">x{ad.count}</span>
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
