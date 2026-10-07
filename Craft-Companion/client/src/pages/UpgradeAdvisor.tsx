import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { loadFactoryData, FactoryDataRow } from '../services/factoryData';
import {
  calculateUpgradeRecommendation,
  UpgradeRecommendation,
} from '../services/craftworldCalculations';
import { getCraftworldHome } from '../services/api';
import { extractPriceMap } from '../services/priceService';
import { ResourceIcon, FactoryIcon } from '../components/GameIcon';
import { formatNumber } from '../utils/formatters';

export default function UpgradeAdvisor() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'fast_roi' | 'best_profit'>('all');

  useEffect(() => {
    Promise.all([loadFactoryData(), getCraftworldHome().catch(() => null)])
      .then(([factoryRows, home]) => {
        setRows(factoryRows);
        setPrices(extractPriceMap(home));
      })
      .finally(() => setLoading(false));
  }, []);

  const allRecommendations: UpgradeRecommendation[] = useMemo(() => {
    return calculateUpgradeRecommendation(rows, prices);
  }, [rows, prices]);

  const filteredRecommendations = useMemo(() => {
    let result = allRecommendations;

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (rec) =>
          rec.row.token.toLowerCase().includes(q) ||
          rec.reason.toLowerCase().includes(q) ||
          (rec.nextRow?.upgrade_token && rec.nextRow.upgrade_token.toLowerCase().includes(q)),
      );
    }

    if (filterMode === 'fast_roi') {
      result = result.filter((rec) => rec.paybackDays !== null && rec.paybackDays <= 3);
    } else if (filterMode === 'best_profit') {
      result = [...result].sort((a, b) => b.addedProfitPerDay - a.addedProfitPerDay);
    }

    return result;
  }, [allRecommendations, searchTerm, filterMode]);

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-[1100px] mx-auto space-y-6 pb-12">
        {/* Game Title Header */}
        <div className="text-center mt-3 mb-2 space-y-1.5 px-3">
          <h1
            className="text-base sm:text-xl md:text-2xl font-title font-bold text-white tracking-wider uppercase"
            style={{
              textShadow:
                '0 2px 10px rgba(0,0,0,0.9), 0 0 15px rgba(56,189,248,0.2)',
            }}
          >
            {language === 'es' ? 'Asesor de Mejoras' : 'Upgrade Advisor'}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-xl mx-auto font-main">
            {language === 'es'
              ? 'Recomendaciones inteligentes de subida de nivel ordenadas por retorno de inversión (ROI).'
              : 'Smart level upgrade recommendations ranked by return on investment (ROI).'}
          </p>
        </div>

        {/* Filter & Search Bar - Directly on the body background */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#18181b] p-1 rounded-full text-xs overflow-x-auto no-scrollbar w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`flex-1 sm:flex-initial text-center px-4 py-2 rounded-full font-bold transition-all cursor-pointer border-none flex-shrink-0 ${
                filterMode === 'all'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {language === 'es' ? 'Todas' : 'All'} ({allRecommendations.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('fast_roi')}
              className={`flex-1 sm:flex-initial text-center px-4 py-2 rounded-full font-bold transition-all cursor-pointer border-none flex-shrink-0 ${
                filterMode === 'fast_roi'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-amber-300 hover:bg-white/[0.04]'
              }`}
            >
              {language === 'es' ? 'Rápido ROI (≤ 3 días)' : 'Fast ROI (≤ 3 days)'}
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('best_profit')}
              className={`flex-1 sm:flex-initial text-center px-4 py-2 rounded-full font-bold transition-all cursor-pointer border-none flex-shrink-0 ${
                filterMode === 'best_profit'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-emerald-300 hover:bg-white/[0.04]'
              }`}
            >
              {language === 'es' ? 'Mayor Ganancia' : 'Top Profit'}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'es' ? 'Buscar fábrica o recurso...' : 'Search factory or token...'}
              className="w-full bg-[#18181b] hover:bg-[#202024] focus:bg-[#202024] text-white text-xs pl-9 pr-4 py-2.5 rounded-full border-none outline-none focus:ring-1 focus:ring-sky-500/50 placeholder:text-zinc-500 transition-all shadow-md"
            />
          </div>
        </div>

        {/* Upgrade Cards List - Directly on the body, ultra rounded, no outer container */}
        <div className="space-y-3.5">
          {filteredRecommendations.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 bg-[#18181b] rounded-[32px] p-8 space-y-2 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold">
                {language === 'es'
                  ? 'No se encontraron recomendaciones con los filtros seleccionados.'
                  : 'No recommendations found matching your filters.'}
              </p>
            </div>
          ) : (
            filteredRecommendations.slice(0, 40).map((rec, i) => (
              <div
                key={`${rec.row.token}-${rec.row.level}-${i}`}
                className="p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] bg-[#18181b] hover:bg-[#1f1f23] transition-all border-none shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5"
              >
                {/* Left: Icon + Factory Info + Level progression + Reason */}
                <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#141416] flex items-center justify-center flex-shrink-0 shadow-inner">
                    <FactoryIcon symbol={rec.row.token} size={36} />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-white text-base sm:text-lg tracking-wide uppercase">
                        {rec.row.token}
                      </h3>

                      {/* Level Progression Pill */}
                      <span className="px-2.5 py-1 rounded-full bg-[#141416] text-zinc-200 text-xs font-mono font-bold">
                        Nv. {rec.row.level} ➔ Nv. {rec.row.level + 1}
                      </span>

                      {/* Payback Days Badge */}
                      {rec.paybackDays !== null && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold inline-flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>
                            {language === 'es'
                              ? `Retorno en ${formatNumber(rec.paybackDays, 1)} días`
                              : `ROI in ${formatNumber(rec.paybackDays, 1)} days`}
                          </span>
                        </span>
                      )}

                      {/* Recommendation Label Badge */}
                      {rec.label && rec.label !== 'Not enough data' && (
                        <span className="px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-300 text-[11px] font-bold">
                          {rec.label}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 font-main leading-relaxed">
                      {rec.reason}
                    </p>
                  </div>
                </div>

                {/* Right: Metrics Block (Responsive Grid on mobile, inline flex on desktop) */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:flex lg:items-center gap-3 sm:gap-4 lg:gap-6 pt-3 lg:pt-0 border-t border-white/[0.04] lg:border-t-0 text-left lg:text-right flex-shrink-0">
                  {/* Ganancia Extra / Día */}
                  <div className="bg-[#141416] lg:bg-transparent p-3 lg:p-0 rounded-2xl lg:rounded-none">
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">
                      {language === 'es' ? 'Ganancia extra / día' : 'Extra profit / day'}
                    </span>
                    <div className="font-mono font-black text-sm sm:text-base flex items-baseline lg:justify-end">
                      <span className="text-emerald-400">
                        +{formatNumber(rec.addedProfitPerDay)}
                      </span>
                      <span className="text-amber-400 font-bold text-xs ml-1">COIN</span>
                    </div>
                  </div>

                  {/* Costo de Mejora */}
                  {rec.upgradeCost !== null && (
                    <div className="bg-[#141416] lg:bg-transparent p-3 lg:p-0 rounded-2xl lg:rounded-none">
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">
                        {language === 'es' ? 'Costo mejora' : 'Upgrade cost'}
                      </span>
                      <div className="font-mono font-bold text-xs sm:text-sm text-zinc-200 flex items-center lg:justify-end gap-1.5 mt-0.5">
                        <ResourceIcon symbol={rec.nextRow?.upgrade_token || 'COIN'} size={16} />
                        <span className="text-amber-300">
                          {formatNumber(rec.upgradeCost)}
                        </span>
                        <span className="text-zinc-400 text-[11px]">
                          {rec.nextRow?.upgrade_token || 'COIN'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
