import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { loadFactoryData, FactoryDataRow } from '../services/factoryData';
import {
  buildRecipeTree,
  flattenRecipeToBaseResources,
  RecipeNode,
} from '../services/craftworldCalculations';
import { getCraftworldHome } from '../services/api';
import { ResourceIcon, FactoryIcon } from '../components/GameIcon';
import { Combobox } from '../components/ui/Combobox';
import { extractPriceMap } from '../services/priceService';
import { formatNumber } from '../utils/formatters';
import { formatDurationFromMinutes } from '../services/durationFormat';

interface CraftingStep {
  outputToken: string;
  outputAmount: number;
  factoryName: string;
  factoryDurationMin: number;
  cyclesNeeded: number;
  totalTimeMin: number;
  inputs: { token: string; amount: number }[];
}

function extractCraftingSteps(node: RecipeNode, steps: CraftingStep[] = []): CraftingStep[] {
  if (!node.row) return steps;

  // Process children first so dependencies are presented bottom-up
  node.children.forEach((child) => extractCraftingSteps(child, steps));

  const cycles = Math.ceil(node.amount / node.row.output_amount);
  const inputs: { token: string; amount: number }[] = [];
  if (node.row.input_token_1) {
    inputs.push({ token: node.row.input_token_1, amount: node.row.input_amount_1 * cycles });
  }
  if (node.row.input_token_2) {
    inputs.push({ token: node.row.input_token_2, amount: node.row.input_amount_2 * cycles });
  }

  const existing = steps.find(
    (s) => s.outputToken === node.token && s.factoryName === node.row?.token,
  );
  if (existing) {
    existing.outputAmount += node.amount;
    existing.cyclesNeeded += cycles;
    existing.totalTimeMin = existing.cyclesNeeded * existing.factoryDurationMin;
  } else {
    steps.push({
      outputToken: node.token,
      outputAmount: node.amount,
      factoryName: node.row.token,
      factoryDurationMin: node.row.duration_min,
      cyclesNeeded: cycles,
      totalTimeMin: cycles * node.row.duration_min,
      inputs,
    });
  }
  return steps;
}

export default function ResourcePlanner() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [targetToken, setTargetToken] = useState('STEEL');
  const [targetAmount, setTargetAmount] = useState(10);
  const [userResources, setUserResources] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // View state & filters
  const [viewTab, setViewTab] = useState<'materials' | 'steps'>('materials');
  const [materialFilter, setMaterialFilter] = useState<'all' | 'missing' | 'ready'>('all');
  const [copiedNotification, setCopiedNotification] = useState(false);

  useEffect(() => {
    Promise.all([loadFactoryData(), getCraftworldHome().catch(() => null)])
      .then(([factoryRows, home]) => {
        setRows(factoryRows);
        if (factoryRows.length > 0) {
          const defaultTok = factoryRows[0].output_token || factoryRows[0].token;
          setTargetToken(defaultTok);
        }

        const priceMap = extractPriceMap(home);
        setPrices(priceMap);

        const resMap: Record<string, number> = {};
        if (home?.craftWorld?.resources) {
          home.craftWorld.resources.forEach((r: any) => {
            resMap[(r.symbol || '').toUpperCase()] = r.amount || 0;
          });
        }
        setUserResources(resMap);
      })
      .finally(() => setLoading(false));
  }, []);

  const uniqueTokens = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.output_token || r.token))).filter(Boolean);
  }, [rows]);

  const tokenOptions = useMemo(() => {
    return uniqueTokens.map((tok) => ({
      value: tok,
      label: tok,
      icon: <ResourceIcon symbol={tok} size={18} />,
    }));
  }, [uniqueTokens]);

  const tree = useMemo(() => {
    return buildRecipeTree(rows, targetToken, targetAmount);
  }, [rows, targetToken, targetAmount]);

  const baseRequirements = useMemo(() => {
    return flattenRecipeToBaseResources(tree);
  }, [tree]);

  const craftingSteps = useMemo(() => {
    return extractCraftingSteps(tree);
  }, [tree]);

  // Overall KPI statistics
  const kpiStats = useMemo(() => {
    const entries = Object.entries(baseRequirements);
    const totalTypes = entries.length;
    let readyTypes = 0;
    let totalMissingItems = 0;
    let totalMissingCost = 0;

    entries.forEach(([symbol, requiredQty]) => {
      const inStock = userResources[symbol] || 0;
      const missing = Math.max(0, requiredQty - inStock);
      if (missing === 0) {
        readyTypes += 1;
      } else {
        totalMissingItems += missing;
        const price = prices[symbol] || 0;
        totalMissingCost += missing * price;
      }
    });

    const completionPercent = totalTypes > 0 ? Math.round((readyTypes / totalTypes) * 100) : 100;

    return {
      totalTypes,
      readyTypes,
      missingTypes: totalTypes - readyTypes,
      totalMissingItems,
      totalMissingCost,
      completionPercent,
      canCraftInstantly: readyTypes === totalTypes && totalTypes > 0,
    };
  }, [baseRequirements, userResources, prices]);

  // Copy missing items text to clipboard
  const handleCopyMissing = () => {
    const missingLines = Object.entries(baseRequirements)
      .map(([symbol, requiredQty]) => {
        const inStock = userResources[symbol] || 0;
        const missing = Math.max(0, requiredQty - inStock);
        if (missing <= 0) return null;
        return `• ${symbol}: ${formatNumber(missing)} faltantes (Requerido: ${formatNumber(requiredQty)}, En Stock: ${formatNumber(inStock)})`;
      })
      .filter(Boolean);

    const textToCopy =
      missingLines.length === 0
        ? `Craft World Planner: ¡Tienes todos los recursos para fabricar ${targetAmount}x ${targetToken}!`
        : `Craft World Planner - Faltantes para ${targetAmount}x ${targetToken}:\n` +
          missingLines.join('\n');

    navigator.clipboard.writeText(textToCopy);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  const filteredMaterialEntries = Object.entries(baseRequirements).filter(([symbol, requiredQty]) => {
    const inStock = userResources[symbol] || 0;
    const missing = Math.max(0, requiredQty - inStock);
    if (materialFilter === 'missing') return missing > 0;
    if (materialFilter === 'ready') return missing === 0;
    return true;
  });

  return (
    <Layout>
      <div className="w-full max-w-[1100px] mx-auto space-y-7 pb-12">
        {/* Game Title Header */}
        <div className="text-center mt-3 mb-2 space-y-1.5 px-3">
          <h1
            className="text-base sm:text-xl md:text-2xl font-title font-bold text-white tracking-wider uppercase"
            style={{
              textShadow:
                '0 2px 10px rgba(0,0,0,0.9), 0 0 15px rgba(56,189,248,0.2)',
            }}
          >
            {language === 'es' ? 'Planificador de Recursos' : 'Resource Planner'}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-xl mx-auto font-main">
            {language === 'es'
              ? 'Calcula insumos exactos, faltantes de inventario y la cadena de producción requerida.'
              : 'Calculate exact raw materials, stock deficits, and the step-by-step production chain.'}
          </p>
        </div>

        {/* 1. Target Selection & Goal Card */}
        <div className="bg-[#18181b] rounded-[32px] p-6 sm:p-7 shadow-xl border-none space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Meta de Producción' : 'Production Goal'}
                </h2>
                <span className="text-xs text-zinc-400">
                  {language === 'es'
                    ? 'Selecciona el artículo final y la cantidad a fabricar'
                    : 'Choose the final product and quantity to produce'}
                </span>
              </div>
            </div>

            {/* In Inventory of Target Item Indicator */}
            {userResources[targetToken] !== undefined && (
              <div className="flex items-center gap-2 bg-[#141416] px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-300">
                <span className="text-zinc-400">
                  {language === 'es' ? 'En almacén:' : 'In storage:'}
                </span>
                <span className="text-emerald-400 font-mono font-bold">
                  {formatNumber(userResources[targetToken])}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
            {/* Target Resource Combobox */}
            <div className="md:col-span-6 space-y-2 min-w-0">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">
                {language === 'es' ? 'Recurso Objetivo' : 'Target Resource'}
              </label>
              <Combobox
                value={targetToken}
                onChange={(val) => setTargetToken(val as string)}
                options={tokenOptions}
                placeholder={language === 'es' ? 'Seleccionar recurso...' : 'Select resource...'}
                className="w-full !py-3 !px-4.5 bg-[#141416] hover:bg-[#19191d] rounded-full text-sm font-bold text-white shadow-inner"
                menuClassName="w-full max-h-72"
              />
            </div>

            {/* Target Amount Input & Presets */}
            <div className="md:col-span-6 space-y-2 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">
                  {language === 'es' ? 'Cantidad Deseada' : 'Desired Amount'}
                </label>
                <div className="flex items-center gap-1 flex-wrap">
                  {[1, 5, 10, 50, 100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTargetAmount(preset)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer border-none flex-shrink-0 ${
                        targetAmount === preset
                          ? 'bg-sky-500 text-white shadow-md'
                          : 'bg-[#202024] text-zinc-400 hover:text-white hover:bg-[#28282e]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full min-w-0">
                <button
                  type="button"
                  onClick={() => setTargetAmount((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-10 flex-shrink-0 rounded-full bg-[#141416] hover:bg-[#202024] text-zinc-300 hover:text-white flex items-center justify-center font-bold text-lg transition-colors cursor-pointer border-none"
                  title="-1"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Math.max(1, Number(e.target.value) || 1))}
                  className="flex-1 min-w-0 w-full bg-[#141416] text-white text-center font-mono font-bold text-base py-2.5 px-3 rounded-full border-none outline-none focus:ring-2 focus:ring-sky-500/50 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setTargetAmount((prev) => prev + 1)}
                  className="w-10 h-10 flex-shrink-0 rounded-full bg-[#141416] hover:bg-[#202024] text-zinc-300 hover:text-white flex items-center justify-center font-bold text-lg transition-colors cursor-pointer border-none"
                  title="+1"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Quick Summary Strip (Fully Rounded Sub-Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* KPI 1: Insumos Totales */}
            <div className="bg-[#141416] rounded-[24px] p-3.5 flex flex-col justify-between space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                {language === 'es' ? 'Tipos de Insumo' : 'Material Types'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-white font-mono">
                  {kpiStats.totalTypes}
                </span>
                <span className="text-xs text-zinc-500">
                  {language === 'es' ? 'materiales' : 'items'}
                </span>
              </div>
            </div>

            {/* KPI 2: Cobertura */}
            <div className="bg-[#141416] rounded-[24px] p-3.5 flex flex-col justify-between space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                {language === 'es' ? 'En Inventario' : 'In Stock'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-xl font-extrabold font-mono ${
                    kpiStats.canCraftInstantly
                      ? 'text-emerald-400'
                      : kpiStats.completionPercent >= 50
                        ? 'text-sky-400'
                        : 'text-amber-400'
                  }`}
                >
                  {kpiStats.readyTypes}/{kpiStats.totalTypes}
                </span>
                <span className="text-xs text-zinc-400 font-bold">
                  ({kpiStats.completionPercent}%)
                </span>
              </div>
            </div>

            {/* KPI 3: Faltantes */}
            <div className="bg-[#141416] rounded-[24px] p-3.5 flex flex-col justify-between space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                {language === 'es' ? 'Faltantes' : 'Missing'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-xl font-extrabold font-mono ${
                    kpiStats.totalMissingItems === 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatNumber(kpiStats.totalMissingItems)}
                </span>
                <span className="text-xs text-zinc-500">
                  {language === 'es' ? 'unidades' : 'units'}
                </span>
              </div>
            </div>

            {/* KPI 4: Costo de Mercado Estimado */}
            <div className="bg-[#141416] rounded-[24px] p-3.5 flex flex-col justify-between space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                {language === 'es' ? 'Costo Faltantes' : 'Deficit Cost'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-xl font-extrabold font-mono ${
                    kpiStats.totalMissingCost === 0 ? 'text-emerald-400' : 'text-amber-300'
                  }`}
                >
                  {kpiStats.totalMissingCost === 0
                    ? '0'
                    : `~${formatNumber(Math.round(kpiStats.totalMissingCost))}`}
                </span>
                <span className="text-xs text-zinc-500">COIN</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main Content Card with Tabs */}
        <div className="bg-[#18181b] rounded-[32px] p-6 sm:p-7 shadow-xl border-none space-y-6">
          {/* Card Navigation & Actions Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 border-b border-white/[0.06] pb-4">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-[#141416] p-1 rounded-full w-full md:w-auto">
              <button
                type="button"
                onClick={() => setViewTab('materials')}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border-none ${
                  viewTab === 'materials'
                    ? 'bg-sky-500 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span>
                  {language === 'es' ? 'Materias Primas' : 'Raw Materials'} (
                  {kpiStats.totalTypes})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setViewTab('steps')}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border-none ${
                  viewTab === 'steps'
                    ? 'bg-sky-500 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>
                  {language === 'es' ? 'Pasos de Fabricación' : 'Crafting Steps'} (
                  {craftingSteps.length})
                </span>
              </button>
            </div>

            {/* Utility Actions (Filters on 1 line, Copy button on another line aligned right in mobile) */}
            {viewTab === 'materials' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full md:w-auto">
                {/* Line 1 in mobile: Filter Pills taking full width */}
                <div className="flex items-center gap-1 bg-[#141416] p-1 rounded-full text-xs w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setMaterialFilter('all')}
                    className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer border-none ${
                      materialFilter === 'all'
                        ? 'bg-[#202024] text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {language === 'es' ? 'Todos' : 'All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialFilter('missing')}
                    className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer border-none ${
                      materialFilter === 'missing'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'text-zinc-400 hover:text-rose-300'
                    }`}
                  >
                    {language === 'es' ? 'Faltantes' : 'Missing'} ({kpiStats.missingTypes})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialFilter('ready')}
                    className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer border-none ${
                      materialFilter === 'ready'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'text-zinc-400 hover:text-emerald-300'
                    }`}
                  >
                    {language === 'es' ? 'Listos' : 'Ready'} ({kpiStats.readyTypes})
                  </button>
                </div>

                {/* Line 2 in mobile: Copy button on its own line aligned right */}
                <div className="flex justify-end w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCopyMissing}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#141416] hover:bg-[#202024] text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer border-none shadow-sm"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="whitespace-nowrap">
                      {copiedNotification
                        ? language === 'es'
                          ? '¡Copiado!'
                          : 'Copied!'
                        : language === 'es'
                          ? 'Copiar faltantes'
                          : 'Copy missing'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* TAB 1: Raw Materials Breakdown */}
          {viewTab === 'materials' && (
            <div>
              {filteredMaterialEntries.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto text-zinc-400">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold">
                    {language === 'es'
                      ? 'No hay materiales en esta categoría.'
                      : 'No materials found in this category.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMaterialEntries.map(([symbol, requiredQty]) => {
                    const currentStock = userResources[symbol] || 0;
                    const missing = Math.max(0, requiredQty - currentStock);
                    const percentCovered =
                      requiredQty > 0
                        ? Math.min(100, Math.round((currentStock / requiredQty) * 100))
                        : 100;
                    const unitPrice = prices[symbol] || 0;
                    const costOfMissing = missing * unitPrice;

                    return (
                      <div
                        key={symbol}
                        className="p-5 rounded-[24px] bg-[#141416] hover:bg-[#18181c] transition-all space-y-4 flex flex-col justify-between shadow-md"
                      >
                        {/* Top: Icon + Title + Status Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-[#1b1b1f] flex items-center justify-center flex-shrink-0 shadow-inner">
                              <ResourceIcon symbol={symbol} size={30} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-extrabold text-white text-sm truncate uppercase tracking-wider">
                                {symbol}
                              </h3>
                              {unitPrice > 0 && (
                                <span className="text-[11px] text-zinc-400 font-mono">
                                  ~{formatNumber(unitPrice)} COIN/u
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Deficit Badge */}
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 flex-shrink-0 ${
                              missing === 0
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-rose-500/15 text-rose-400'
                            }`}
                          >
                            {missing === 0 ? (
                              <>
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span>{language === 'es' ? 'Listo' : 'Ready'}</span>
                              </>
                            ) : (
                              <span>
                                {language === 'es'
                                  ? `Faltan ${formatNumber(missing)}`
                                  : `Need ${formatNumber(missing)}`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle: Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400 font-medium">
                              {language === 'es' ? 'Disponibilidad:' : 'Availability:'}
                            </span>
                            <span
                              className={`font-mono font-bold ${
                                percentCovered >= 100
                                  ? 'text-emerald-400'
                                  : percentCovered >= 50
                                    ? 'text-sky-400'
                                    : 'text-amber-400'
                              }`}
                            >
                              {percentCovered}%
                            </span>
                          </div>

                          <div className="w-full h-2 rounded-full bg-[#202024] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                percentCovered >= 100
                                  ? 'bg-emerald-500'
                                  : percentCovered >= 50
                                    ? 'bg-sky-500'
                                    : 'bg-amber-500'
                              }`}
                              style={{ width: `${percentCovered}%` }}
                            />
                          </div>
                        </div>

                        {/* Bottom: Quantities Grid */}
                        <div className="bg-[#1b1b1f] rounded-[18px] p-3 space-y-1.5 text-xs font-main">
                          <div className="flex justify-between items-center text-zinc-400">
                            <span>{language === 'es' ? 'Requerido:' : 'Required:'}</span>
                            <span className="text-white font-mono font-bold">
                              {formatNumber(requiredQty)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-zinc-400">
                            <span>{language === 'es' ? 'En Inventario:' : 'In Stock:'}</span>
                            <span className="text-zinc-300 font-mono font-bold">
                              {formatNumber(currentStock)}
                            </span>
                          </div>

                          {missing > 0 && costOfMissing > 0 && (
                            <div className="flex justify-between items-center text-zinc-400 pt-1 border-t border-white/[0.05]">
                              <span>{language === 'es' ? 'Costo faltante:' : 'Missing cost:'}</span>
                              <span className="text-amber-400 font-mono font-bold">
                                ~{formatNumber(Math.round(costOfMissing))} COIN
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Step-by-Step Crafting Steps */}
          {viewTab === 'steps' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400 bg-[#141416] p-3.5 rounded-[20px] flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-sky-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>
                  {language === 'es'
                    ? 'Lista de pasos de fabricación e insumos intermedios en orden de preparación.'
                    : 'List of crafting stages and intermediate recipes ordered by dependency.'}
                </span>
              </div>

              <div className="space-y-3">
                {craftingSteps.map((step, idx) => (
                  <div
                    key={`${step.outputToken}-${idx}`}
                    className="p-5 rounded-[24px] bg-[#141416] hover:bg-[#18181c] transition-all space-y-4 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Step Number + Factory + Output */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-400 text-xs font-extrabold flex items-center justify-center flex-shrink-0">
                          #{idx + 1}
                        </div>
                        <div className="flex items-center gap-2.5">
                          <FactoryIcon symbol={step.factoryName} size={30} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white text-sm">
                                {step.factoryName}
                              </span>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#202024] text-zinc-300">
                                {step.cyclesNeeded}{' '}
                                {step.cyclesNeeded === 1
                                  ? language === 'es'
                                    ? 'ciclo'
                                    : 'cycle'
                                  : language === 'es'
                                    ? 'ciclos'
                                    : 'cycles'}
                              </span>
                            </div>
                            <span className="text-xs text-zinc-400">
                              {language === 'es' ? 'Produce' : 'Produces'}:{' '}
                              <strong className="text-white font-mono">
                                {formatNumber(step.outputAmount)} {step.outputToken}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Estimated Production Duration */}
                      <div className="flex items-center gap-2 bg-[#1b1b1f] px-3.5 py-1.5 rounded-full text-xs text-zinc-300 self-start sm:self-auto">
                        <svg
                          className="w-3.5 h-3.5 text-sky-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="font-mono font-bold text-white">
                          {formatDurationFromMinutes(step.totalTimeMin)}
                        </span>
                      </div>
                    </div>

                    {/* Inputs needed for this step */}
                    {step.inputs.length > 0 && (
                      <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-zinc-500 font-bold uppercase text-[10px]">
                          {language === 'es' ? 'Consume:' : 'Requires:'}
                        </span>
                        {step.inputs.map((inp) => (
                          <div
                            key={inp.token}
                            className="flex items-center gap-1.5 bg-[#1b1b1f] px-2.5 py-1 rounded-full text-zinc-300"
                          >
                            <ResourceIcon symbol={inp.token} size={16} />
                            <span className="font-mono font-bold text-white">
                              {formatNumber(inp.amount)}
                            </span>
                            <span className="text-zinc-400">{inp.token}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
