import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { getCraftworldHome } from '../services/api';
import { formatNumber, formatFactoryName } from '../utils/formatters';
import { ResourceIcon, FactoryIcon } from '../components/GameIcon';

function formatPlotName(name: string, lang = 'es') {
  if (!name) return lang === 'es' ? 'Parcela' : 'Plot';
  const clean = name.replace(/_/g, ' ');
  if (lang === 'es') {
    if (name.includes('EARTH')) return 'Parcela de Tierra';
    if (name.includes('FLEXIBLE')) return 'Parcela Flexible';
    if (name.includes('BLUEPRINT_PLOT_A')) return 'Parcela de Planos A';
    if (name.includes('BLUEPRINT_PLOT_B')) return 'Parcela de Planos B';
    if (name.includes('BLUEPRINT')) return 'Parcela de Planos';
  }
  return clean;
}

function formatBuildingType(type: string, lang = 'es') {
  if (!type) return '';
  const map: Record<string, { es: string; en: string; icon: string }> = {
    POWER_PLANT: { es: 'Planta de Poder', en: 'Power Plant', icon: '⚡' },
    BATTERY: { es: 'Batería', en: 'Battery', icon: '🔋' },
    VAULT: { es: 'Bóveda', en: 'Vault', icon: '🏦' },
    TOWN_HALL: { es: 'Ayuntamiento', en: 'Town Hall', icon: '🏛️' },
    RESEARCH_CENTER: { es: 'Centro de Investigación', en: 'Research Center', icon: '🔬' },
    WORKSHOP: { es: 'Taller', en: 'Workshop', icon: '🛠️' },
    PROFICIENCY: { es: 'Maestría', en: 'Proficiency', icon: '⭐' },
    HATCHERY: { es: 'Criadero (Hatchery)', en: 'Hatchery', icon: '🥚' },
    HOUSE: { es: 'Casa', en: 'House', icon: '🏡' },
    EXCHANGE: { es: 'Mercado (Exchange)', en: 'Exchange', icon: '⚖️' },
    EDUCATIONAL: { es: 'Academia', en: 'Academy', icon: '🎓' },
    COSMETIC: { es: 'Decoración', en: 'Cosmetic', icon: '🌳' },
  };
  const entry = map[type];
  if (entry) return `${entry.icon} ${lang === 'es' ? entry.es : entry.en}`;
  return type.replace(/_/g, ' ');
}

export default function EmpireDashboard() {
  const { language } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCraftworldHome()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );

  const craftWorld = data?.craftWorld || {};
  const landPlots = craftWorld.landPlots || [];
  const mines = craftWorld.mines || [];
  const dynos = craftWorld.dynos || [];
  const workers = craftWorld.workers || [];
  const playerBase = craftWorld.playerBase || [];
  const inventory = data?.inventory || {};
  const eggs = inventory.eggs || [];
  const totalEggs = eggs.reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0);

  // Group playerBase buildings by type with counts and max level
  const buildingSummary: Record<string, { count: number; maxLevel: number; levels: number[] }> = {};
  playerBase.forEach((b: any) => {
    if (!buildingSummary[b.type]) {
      buildingSummary[b.type] = { count: 0, maxLevel: 0, levels: [] };
    }
    buildingSummary[b.type].count += 1;
    buildingSummary[b.type].levels.push(b.level || 1);
    if ((b.level || 1) > buildingSummary[b.type].maxLevel) {
      buildingSummary[b.type].maxLevel = b.level || 1;
    }
  });

  return (
    <Layout>
      <div className="w-full max-w-[1200px] mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mt-4 mb-2">
          <h1
            className="text-xl sm:text-2xl font-title font-bold text-white tracking-wider uppercase"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 15px rgba(56,189,248,0.2)' }}
          >
            {language === 'es' ? 'Panel de Imperio' : 'Empire Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto font-main">
            {language === 'es'
              ? 'Monitorea tus parcelas de tierra, fábricas asignadas, trabajadores y estructuras.'
              : 'Monitor your land plots, installed factories, workers, and structures.'}
          </p>
        </div>

        {/* Overview Stats Bar: 4 Pills with OLED style */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#18181b] rounded-[24px] p-4 text-center shadow-lg border-none">
            <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider block font-main">
              {language === 'es' ? 'Parcelas' : 'Land Plots'}
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
              {landPlots.length}
            </span>
          </div>

          <div className="bg-[#18181b] rounded-[24px] p-4 text-center shadow-lg border-none">
            <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider block font-main">
              {language === 'es' ? 'Fábricas Instaladas' : 'Active Factories'}
            </span>
            <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">
              {landPlots.reduce(
                (sum: number, p: any) =>
                  sum +
                  (p.areas || []).reduce(
                    (aSum: number, a: any) => aSum + (a.factories?.length || 0),
                    0
                  ),
                0
              )}
            </span>
          </div>

          <div className="bg-[#18181b] rounded-[24px] p-4 text-center shadow-lg border-none">
            <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider block font-main">
              {language === 'es' ? 'Trabajadores' : 'Workers'}
            </span>
            <span className="text-2xl font-black text-purple-400 font-mono mt-1 block">
              {workers.length}
            </span>
          </div>

          <div className="bg-[#18181b] rounded-[24px] p-4 text-center shadow-lg border-none">
            <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider block font-main">
              {language === 'es' ? 'Huevos / Dynos' : 'Eggs / Dynos'}
            </span>
            <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
              {dynos.length > 0 ? dynos.length : `${totalEggs} 🥚`}
            </span>
          </div>
        </div>

        {/* Land Plots & Installed Factories */}
        <div className="bg-[#18181b] rounded-[32px] p-5 sm:p-6 shadow-xl border-none space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="font-title text-xs sm:text-sm text-white tracking-wide uppercase flex items-center gap-2">
              <span>🏔️</span>
              <span>{language === 'es' ? 'Parcelas de Tierra (Land Plots)' : 'Land Plots'}</span>
            </h2>
            <span className="text-xs font-mono text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full">
              {landPlots.length} {language === 'es' ? 'parcelas activas' : 'active plots'}
            </span>
          </div>

          {landPlots.length ? (
            <div className="grid gap-3.5 sm:gap-4 md:grid-cols-2">
              {landPlots.map((plot: any, idx: number) => {
                const areas = plot.areas || [];
                const allPlotFactories: any[] = [];
                areas.forEach((a: any) => {
                  (a.factories || []).forEach((f: any) => {
                    const token = f.factory?.definition?.id || f.id || 'FACTORY';
                    allPlotFactories.push(token);
                  });
                });

                // Unique factory counts on this plot
                const factoryCounts: Record<string, number> = {};
                allPlotFactories.forEach((t) => {
                  factoryCounts[t] = (factoryCounts[t] || 0) + 1;
                });

                return (
                  <div
                    key={plot.id || idx}
                    className="bg-[#202024] p-4 sm:p-5 rounded-[24px] shadow-sm flex flex-col justify-between gap-3 transition-colors hover:bg-[#25252a]"
                  >
                    {/* Top Row: Plot Title + Badge */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm sm:text-base truncate flex items-center gap-2">
                          <span>{formatPlotName(plot.name, language)}</span>
                        </h4>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          {plot.name} • {areas.length} {language === 'es' ? 'áreas' : 'areas'}
                        </p>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-emerald-500/15 text-emerald-400 shrink-0">
                        {language === 'es' ? '✓ Desbloqueada' : '✓ Unlocked'}
                      </span>
                    </div>

                    {/* Blueprint info if applied */}
                    {plot.appliedBlueprint && (
                      <div className="bg-[#18181b] rounded-full px-3 py-1.5 flex items-center justify-between text-xs">
                        <span className="text-zinc-400 text-[11px] flex items-center gap-1.5">
                          <span>📜</span>
                          <span>{language === 'es' ? 'Plano aplicado:' : 'Blueprint:'}</span>
                        </span>
                        <span className="font-mono font-bold text-amber-400 text-[11px]">
                          {plot.appliedBlueprint.definitionId.replace('_BLUEPRINT', '')} (
                          {plot.appliedBlueprint.starLevel}⭐)
                        </span>
                      </div>
                    )}

                    {/* Installed Factories summary */}
                    <div className="pt-1">
                      <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                        {language === 'es' ? 'Fábricas instaladas:' : 'Installed factories:'} (
                        {allPlotFactories.length})
                      </span>
                      {Object.keys(factoryCounts).length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(factoryCounts).map(([symbol, count]) => (
                            <span
                              key={symbol}
                              className="bg-[#18181b] px-2.5 py-1 rounded-full text-[11px] text-zinc-200 font-medium flex items-center gap-1.5 shadow-sm"
                            >
                              <FactoryIcon symbol={symbol} size={14} />
                              <span>{formatFactoryName(symbol, language)}</span>
                              <span className="text-amber-400 font-mono font-bold">x{count}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500 italic">
                          {language === 'es' ? 'Sin fábricas instaladas' : 'No installed factories'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6 font-main">
              {language === 'es'
                ? 'No se encontraron parcelas asociadas a la cuenta.'
                : 'No land plots found for this account.'}
            </p>
          )}
        </div>

        {/* Workers Roster */}
        <div className="bg-[#18181b] rounded-[32px] p-5 sm:p-6 shadow-xl border-none space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="font-title text-xs sm:text-sm text-white tracking-wide uppercase flex items-center gap-2">
              <span>👷</span>
              <span>{language === 'es' ? 'Roster de Trabajadores' : 'Worker Roster'}</span>
            </h2>
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full">
              {workers.length} {language === 'es' ? 'trabajadores' : 'workers'}
            </span>
          </div>

          {workers.length ? (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 max-h-[360px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
              {workers.map((worker: any, idx: number) => {
                const boostPercent = Math.round((worker.areaBoostValue || 0) * 100);
                const isAssigned = Boolean(worker.areaUuid);
                return (
                  <div
                    key={worker.id || idx}
                    className="bg-[#202024] hover:bg-[#25252a] p-3 px-3.5 rounded-[20px] shadow-sm flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#18181b] flex items-center justify-center text-sm shrink-0">
                        👷
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs truncate">
                            {worker.name}
                          </span>
                          {worker.isAreaLead && (
                            <span className="bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.2 rounded-full font-black">
                              LEAD
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">
                          {isAssigned ? (
                            <span className="text-emerald-400 font-medium">
                              ● {language === 'es' ? 'Asignado' : 'Assigned'}
                            </span>
                          ) : (
                            <span className="text-zinc-500 font-medium">
                              ○ {language === 'es' ? 'En descanso' : 'Resting'}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <span className="bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[11px] px-2 py-0.5 rounded-full shrink-0">
                      +{boostPercent}% Boost
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6 font-main">
              {language === 'es' ? 'Sin trabajadores registrados.' : 'No workers recorded.'}
            </p>
          )}
        </div>

        {/* Player Base Structures */}
        {Object.keys(buildingSummary).length > 0 && (
          <div className="bg-[#18181b] rounded-[32px] p-5 sm:p-6 shadow-xl border-none space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h2 className="font-title text-xs sm:text-sm text-white tracking-wide uppercase flex items-center gap-2">
                <span>🏰</span>
                <span>
                  {language === 'es' ? 'Estructuras de la Base' : 'Base Structures'} (
                  {playerBase.length})
                </span>
              </h2>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">
                {Object.keys(buildingSummary).length} {language === 'es' ? 'tipos' : 'types'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {Object.entries(buildingSummary).map(([type, summary]) => (
                <div
                  key={type}
                  className="bg-[#202024] hover:bg-[#25252a] p-3 rounded-[20px] shadow-sm flex items-center justify-between text-xs transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-200 block truncate text-xs">
                      {formatBuildingType(type, language)}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                      {summary.count} {summary.count === 1 ? 'unidad' : 'unidades'}
                    </span>
                  </div>
                  <span className="text-amber-400 font-mono font-bold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
                    Nv. {summary.maxLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
