import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { getCraftworldHome } from '../services/api';

function formatNumber(value: unknown, digits = 2) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: digits })
    : '0';
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

  return (
    <Layout>
      <div className="w-full max-w-[1200px] mx-auto space-y-6">
        <div className="text-center mt-4 mb-2">
          <h1
            className="text-3xl font-extrabold text-white tracking-wider"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
          >
            {language === 'es' ? 'Panel de Imperio' : 'Empire Dashboard'}
          </h1>
          <p className="text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Monitorea tus parcelas, minas, dynos, trabajadores y estructuras.'
              : 'Monitor your land plots, mines, dynos, workers, and structures.'}
          </p>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <div className="text-center">
              <span className="text-xs text-slate-400 uppercase font-bold block">
                {language === 'es' ? 'Parcelas' : 'Land Plots'}
              </span>
              <span className="text-2xl font-black text-emerald-400">{landPlots.length}</span>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <span className="text-xs text-slate-400 uppercase font-bold block">
                {language === 'es' ? 'Minas' : 'Mines'}
              </span>
              <span className="text-2xl font-black text-amber-400">{mines.length}</span>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <span className="text-xs text-slate-400 uppercase font-bold block">
                {language === 'es' ? 'Dynos' : 'Dynos'}
              </span>
              <span className="text-2xl font-black text-cyan-400">{dynos.length}</span>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <span className="text-xs text-slate-400 uppercase font-bold block">
                {language === 'es' ? 'Trabajadores' : 'Workers'}
              </span>
              <span className="text-2xl font-black text-purple-400">{workers.length}</span>
            </div>
          </Card>
        </div>

        {/* Land Plots */}
        <Card title={language === 'es' ? '🏔️ Parcelas de Tierra (Land Plots)' : '🏔️ Land Plots'}>
          {landPlots.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {landPlots.map((plot: any, idx: number) => (
                <div
                  key={plot.id || idx}
                  className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-emerald-400 text-base">
                      {plot.name || `Plot #${plot.id}`}
                    </h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${plot.isLocked ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'}`}
                    >
                      {plot.isLocked
                        ? language === 'es'
                          ? 'Bloqueada'
                          : 'Locked'
                        : language === 'es'
                          ? 'Desbloqueada'
                          : 'Unlocked'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p>
                      {language === 'es' ? 'Áreas disponibles' : 'Available Areas'}:{' '}
                      <strong className="text-white">{plot.areas?.length || 0}</strong>
                    </p>
                    {plot.appliedBlueprint && (
                      <p>
                        {language === 'es' ? 'Planos aplicados' : 'Applied Blueprint'}:{' '}
                        <strong className="text-amber-300">
                          {plot.appliedBlueprint.definitionId} ({plot.appliedBlueprint.starLevel}⭐)
                        </strong>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">
              {language === 'es'
                ? 'No se encontraron parcelas asociadas a la cuenta.'
                : 'No land plots found for this account.'}
            </p>
          )}
        </Card>

        {/* Mines & Dynos Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Mines */}
          <Card title={language === 'es' ? '⛏️ Minas Activas' : '⛏️ Active Mines'}>
            {mines.length ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {mines.map((mine: any, idx: number) => (
                  <div
                    key={mine.id || idx}
                    className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-200 block">
                        {mine.definition?.id || mine.id}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {language === 'es' ? 'Sin reclamar' : 'Unclaimed'}:{' '}
                        {mine.unclaimedUnitsBeforeCurrentRun || 0}
                      </span>
                    </div>
                    <span className="bg-amber-950 text-amber-300 font-bold px-2 py-1 rounded text-xs">
                      Lv. {mine.level > 20 ? mine.level : (mine.level ?? 0) + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">
                {language === 'es' ? 'Sin minas registradas.' : 'No mines recorded.'}
              </p>
            )}
          </Card>

          {/* Workers */}
          <Card title={language === 'es' ? '👷 Roster de Trabajadores' : '👷 Worker Roster'}>
            {workers.length ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {workers.map((worker: any, idx: number) => (
                  <div
                    key={worker.id || idx}
                    className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200">{worker.name}</span>
                        {worker.isAreaLead && (
                          <span className="bg-purple-950 text-purple-300 text-[9px] px-1.5 py-0.5 rounded font-black">
                            LEAD
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {language === 'es' ? 'Skin' : 'Skin'}: {worker.skin}
                      </span>
                    </div>
                    <span className="text-emerald-400 font-bold text-xs">
                      +{worker.areaBoostValue || 0}% Boost
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">
                {language === 'es' ? 'Sin trabajadores registrados.' : 'No workers recorded.'}
              </p>
            )}
          </Card>
        </div>

        {/* Player Base Structures */}
        {playerBase.length > 0 && (
          <Card title={language === 'es' ? '🏰 Estructuras de la Base' : '🏰 Base Structures'}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {playerBase.map((b: any, idx: number) => (
                <div
                  key={b.id || idx}
                  className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs"
                >
                  <span className="font-bold text-slate-200 block truncate">{b.type}</span>
                  <span className="text-amber-400 font-bold text-[11px]">Lv. {b.level}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
