#!/usr/bin/env node
/**
 * buildGameConfigSnapshot.mjs
 *
 * Convierte la configuración estática oficial de Craft World (endpoint del
 * cliente: POST https://craft-world.gg/graphql, query
 * AggregatedCraftWorldConfigurationQuery) en los datasets que consume la app.
 *
 * Uso:
 *   node scripts/buildGameConfigSnapshot.mjs                 # desde data/craft-world-config.json
 *   node scripts/buildGameConfigSnapshot.mjs --from <path>   # desde otro snapshot local
 *   node scripts/buildGameConfigSnapshot.mjs --live          # descarga fresca de la API oficial
 *
 * Salidas:
 *   client/src/services/gameConfig/generated/gameConfigSnapshot.json  (snapshot bundled del cliente)
 *   client/public/data/factories.json  · data/factories.json
 *   client/public/data/factories.csv   · data/factories.csv
 *   client/public/data/mines.json      · data/mines.json
 *   client/src/modules/baseCost/data/factoriesBaseCostData.ts (+ .json gemelo)
 *
 * Termina con un informe de validación (conteos, columnas derivadas, diff vs
 * datasets anteriores).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QUERY_PATH = path.join(ROOT, 'shared/gameConfig/aggregatedCraftWorldConfiguration.graphql');
const GRAPHQL_URL = 'https://craft-world.gg/graphql';

// Solo https y únicamente el dominio oficial del juego. Sin redirects cruzados.
function assertAllowedUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.protocol !== 'https:') throw new Error(`Protocolo no permitido: ${url.protocol}`);
  const host = url.hostname.toLowerCase();
  if (host !== 'craft-world.gg' && host !== 'www.craft-world.gg') {
    throw new Error(`Host no permitido: ${host}`);
  }
  return url;
}

function parseArgs(argv) {
  const args = { from: path.join(ROOT, 'data/craft-world-config.json'), live: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--live') args.live = true;
    else if (argv[i] === '--from') args.from = path.resolve(argv[++i]);
  }
  return args;
}

function stripTypenames(value) {
  if (Array.isArray(value)) return value.map(stripTypenames);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === '__typename') continue;
      out[k] = stripTypenames(v);
    }
    return out;
  }
  return value;
}

async function loadConfig(args) {
  if (args.live) {
    const url = assertAllowedUrl(GRAPHQL_URL);
    const query = fs.readFileSync(QUERY_PATH, 'utf8');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query }),
      redirect: 'error',
    });
    if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
    const body = await res.json();
    if (body.errors) throw new Error(`GraphQL errors: ${JSON.stringify(body.errors).slice(0, 300)}`);
    fs.writeFileSync(
      path.join(ROOT, 'data/craft-world-config.json'),
      JSON.stringify(body, null, 1),
    );
    console.log('· Config descargada en vivo y guardada en data/craft-world-config.json');
    return body.data;
  }
  const raw = fs.readFileSync(args.from, 'utf8');
  return JSON.parse(raw).data;
}

// ─── Utilidades de formato (compatibles con el dataset histórico) ────────────

const round = (n, decimals = 2) => {
  const f = 10 ** decimals;
  return Math.round((Number(n) + Number.EPSILON) * f) / f;
};

function formatDurationRaw(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Conversión: definition GraphQL → filas FactoryDataRow ───────────────────

function definitionRows(def, { isMine = false } = {}) {
  const levels = def.levels || [];
  const firstInput = levels.find((l) => (l.input || [])[0]?.amount > 0)?.input?.[0];
  const rows = [];
  let multiCostLevels = 0;

  levels.forEach((lvl, idx) => {
    const level = idx + 1;
    const ms = Number(lvl.millisecondsPerCompletion) || 0;
    const durationMin = round(ms / 60000, 6);
    // Los derivados por día se calculan desde ms exactos para no arrastrar el
    // redondeo de duration_min (10 s ⇒ 8640 ciclos/día, no 8639,98).
    const runsPerDay = ms > 0 ? 86400000 / ms : 0;
    const output = lvl.output || { symbol: def.id, amount: 0 };
    const inputs = (lvl.input || []).filter((i) => i && i.symbol);
    const costs = (lvl.cost || []).filter((c) => c && c.symbol);
    if (costs.length > 1) multiCostLevels += 1;

    const input1 = inputs[0] || null;
    const input2 = inputs[1] || null;
    const baseInput1 =
      firstInput && input1 && firstInput.symbol === input1.symbol ? firstInput.amount : null;

    const prev = rows[idx - 1];
    const outputChange = prev && prev.output_amount > 0
      ? round(((output.amount - prev.output_amount) / prev.output_amount) * 100)
      : 0;
    const durationChange = prev && durationMin > 0
      ? round(((prev.duration_min - durationMin) / durationMin) * 100)
      : 0;

    const xpPerOutput = isMine ? 0 : Number(def.experiencePerOutput) || 0;
    const dailyProduction = round(output.amount * runsPerDay);
    const battery = Number(lvl.batteryCost) || 0;

    rows.push({
      token: def.id,
      level,
      duration_min: durationMin,
      duration_raw: formatDurationRaw(ms),
      output_token: output.symbol || def.id,
      output_amount: output.amount ?? 0,
      input_token_1: input1?.symbol || '',
      input_amount_1: input1?.amount ?? 0,
      input_token_2: input2?.symbol || '',
      input_amount_2: input2?.amount ?? 0,
      upgrade_token: costs[0]?.symbol || '',
      upgrade_amount: costs[0]?.amount ?? 0,
      power_cost: battery,
      yield_percent:
        baseInput1 && input1 && input1.amount > 0
          ? round((baseInput1 / input1.amount) * 100)
          : 100,
      xp_per_output: xpPerOutput,
      event: '',
      daily_production: dailyProduction,
      output_change: outputChange,
      duration_change: durationChange,
      production_change: prev && prev.daily_production > 0
        ? round(((dailyProduction - prev.daily_production) / prev.daily_production) * 100)
        : 0,
      input_1_consumption_per_day: input1 ? round(input1.amount * runsPerDay) : 0,
      // Columnas heredadas de la hoja de cálculo original: requerían precios de
      // mercado, no son dato estático del juego. Se emiten a 0.
      input_1_production_per_day_at_same_value: 0,
      input_2_consumption_per_day: input2 ? round(input2.amount * runsPerDay) : 0,
      input_2_production_per_day_at_same_value: 0,
      power_per_unit: output.amount > 0 ? round(battery / output.amount) : 0,
      xp_per_day: round(xpPerOutput * output.amount * runsPerDay),
      xp_per_battery: battery > 0 ? Math.floor((xpPerOutput * output.amount) / battery) : 0,
    });
  });

  return { rows, multiCostLevels };
}

const CSV_HEADER = [
  'token', 'level', 'duration_min', 'duration_raw', 'output_token', 'output_amount',
  'input_token_1', 'input_amount_1', 'input_token_2', 'input_amount_2',
  'upgrade_token', 'upgrade_amount', 'power_cost', 'yield_percent', 'xp_per_output',
  'daily_production', 'output_change', 'duration_change', 'production_change',
  'input_1_consumption_per_day', 'input_1_production_per_day_at_same_value',
  'input_2_consumption_per_day', 'input_2_production_per_day_at_same_value',
  'power_per_unit', 'xp_per_day', 'xp_per_battery',
];

function toCsv(rows) {
  const escape = (v) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    CSV_HEADER.join(','),
    ...rows.map((row) => CSV_HEADER.map((key) => escape(row[key])).join(',')),
  ].join('\n') + '\n';
}

// Formato nativo del módulo baseCost (client/src/modules/baseCost/types.ts)
function toBaseCostData(config) {
  const out = {};
  for (const def of config.factoryDefinitions || []) {
    out[def.id] = (def.levels || []).map((lvl, idx) => {
      const inputs = (lvl.input || []).filter((i) => i && i.symbol);
      const costs = (lvl.cost || []).filter((c) => c && c.symbol);
      const durationSeconds = (Number(lvl.millisecondsPerCompletion) || 0) / 1000;
      const outputAmount = lvl.output?.amount ?? 0;
      const entry = {
        level: idx + 1,
        output: outputAmount,
        durationSeconds,
        powerCost: Number(lvl.batteryCost) || 0,
        productionPerDay: durationSeconds > 0 ? Math.round((86400 / durationSeconds) * outputAmount) : 0,
      };
      if (inputs[0]) entry.input1 = { symbol: inputs[0].symbol, amount: inputs[0].amount };
      if (inputs[1]) entry.input2 = { symbol: inputs[1].symbol, amount: inputs[1].amount };
      if (costs[0]) entry.upgradeCost = { symbol: costs[0].symbol, amount: costs[0].amount };
      return entry;
    });
  }
  return out;
}

function writeJson(relPath, value) {
  const abs = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(value, null, 1) + '\n');
  return fs.statSync(abs).size;
}

function writeText(relPath, content) {
  const abs = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
  return fs.statSync(abs).size;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv);
  const config = await loadConfig(args);
  const trimmed = stripTypenames(config);

  const factories = trimmed.factoryDefinitions || [];
  const mines = trimmed.mineDefinitions || [];
  console.log(`\n· Config: checksum=${trimmed.checksum}`);
  console.log(`· ${factories.length} factoryDefinitions, ${mines.length} mineDefinitions`);

  // 1) Snapshot para el cliente: va a public/ para no inflar el bundle JS
  const snapshot = {
    meta: { checksum: trimmed.checksum, builtAt: new Date().toISOString(), source: args.live ? 'live' : args.from },
    data: trimmed,
  };
  const snapshotBytes = writeJson('client/public/data/gameConfigSnapshot.json', snapshot);
  console.log(`✓ snapshot cliente público (${(snapshotBytes / 1024 / 1024).toFixed(2)} MB)`);

  // 1b) Fallbacks estáticos mínimos (compilados en el bundle): suficientes para
  // calcular aunque el snapshot aún no se haya descargado.
  const profResources = trimmed.proficiencyConfiguration?.resources || [];
  const uniqueFactorPatterns = new Set(
    profResources.map((r) => JSON.stringify((r.levels || []).map((l) => l.inputDiscountFactor))),
  );
  if (uniqueFactorPatterns.size !== 1 && profResources.length > 0) {
    console.warn(`⚠ proficiency: ${uniqueFactorPatterns.size} patrones de factores distintos — se usa el primero como fallback global`);
  }
  const profLevels = profResources[0]?.levels || [];
  const masteryRequiredBySymbol = {};
  for (const r of profResources) {
    masteryRequiredBySymbol[r.symbol] = (r.levels || []).map((l) => l.requiredAmount);
  }
  const workshopTables = {};
  for (const skill of trimmed.workshopConfiguration?.workshopSkills || []) {
    workshopTables[skill.symbol] = (skill.levels || []).map((l) => l.speedBonusPercentage);
  }
  const factoryMeta = {};
  for (const def of factories) {
    factoryMeta[def.id] = {
      displayName: def.displayName || def.id,
      maxLevel: (def.levels || []).length,
      experiencePerOutput: Number(def.experiencePerOutput) || 0,
    };
  }
  const fallbacksTs = `// GENERADO por scripts/buildGameConfigSnapshot.mjs — no editar a mano.
// Fuente: configuración estática oficial de Craft World. checksum: ${trimmed.checksum}
// Verificado: TODOS los recursos con maestría comparten el mismo patrón de
// inputDiscountFactor (${uniqueFactorPatterns.size} patrón único en ${profResources.length} recursos).

/** inputDiscountFactor por nivel de maestría (0..10). El juego multiplica los
 *  insumos por este factor (menor = menos insumos). */
export const MASTERY_INPUT_FACTORS: readonly number[] = ${JSON.stringify(profLevels.map((l) => l.inputDiscountFactor))};

/** Cantidad recolectada requerida por nivel de maestría, POR SÍMBOLO. */
export const MASTERY_REQUIRED_AMOUNTS: Record<string, readonly number[]> = ${JSON.stringify(masteryRequiredBySymbol)};

/** Símbolos con tabla de maestría (los que no estén tienen factor 1). */
export const MASTERY_SUPPORTED_SYMBOLS: readonly string[] = ${JSON.stringify(profResources.map((r) => r.symbol))};

/** Bono de velocidad de workshop por símbolo y nivel (fracción 0..1).
 *  Convención: nivel mostrado N → índice N del array (verificado en juego:
 *  STEEL workshop 9 → 0.45; evidencia: 720 min × (1−0.45) = 396 min exactos). */
export const WORKSHOP_SPEED_BONUS: Record<string, readonly number[]> = ${JSON.stringify(workshopTables)};

export const TRADE_INPUT_TAX_RATE: number = ${trimmed.gameConfiguration?.tax?.tradeInputTaxRate ?? 0.025};
export const WITHDRAW_TAX_RATE: number = ${trimmed.gameConfiguration?.tax?.withdrawTaxRate ?? 0.1};
export const PARTNER_TOKEN_PURCHASE_TAX_RATE: number = ${trimmed.gameConfiguration?.tax?.partnerTokenPurchaseTaxRate ?? 0};

export const AREA_BOOST_TIME_REDUCTIONS: readonly number[] = ${JSON.stringify(trimmed.gameConfiguration?.areaBoostConfiguration?.timeReductions || [])};
export const AREA_BOOST_UNLOCK_LEVEL_INDEX: number = ${trimmed.gameConfiguration?.areaBoostConfiguration?.unlockLevelIndex ?? 9};

export const MAX_POWER: number = ${trimmed.gameConfiguration?.maxPower ?? 150};
export const POWER_PER_REFILL: number = ${trimmed.gameConfiguration?.powerPerRefill ?? 150};
export const MILLISECONDS_TO_REFILL: number = ${trimmed.gameConfiguration?.millisecondsToRefill ?? 7200000};

export const FACTORY_META: Record<string, { displayName: string; maxLevel: number; experiencePerOutput: number }> = ${JSON.stringify(factoryMeta)};
`;
  writeText('client/src/services/gameConfig/generated/staticFallbacks.ts', fallbacksTs);
  console.log('✓ staticFallbacks.ts (mastery, workshop, taxes, power, factoryMeta)');

  // 2) factories.json: fábricas + minas en un único dataset (el pipeline
  // histórico sync:gamedata también fusionaba la hoja MINES aquí; así todos
  // los consumidores de loadFactoryData ven el dataset completo oficial).
  let allRows = [];
  let multiCostLevels = 0;
  for (const def of [...factories].sort((a, b) => a.id.localeCompare(b.id))) {
    const { rows, multiCostLevels: mc } = definitionRows(def);
    multiCostLevels += mc;
    allRows = allRows.concat(rows);
  }
  let mineRows = [];
  for (const def of mines) {
    mineRows = mineRows.concat(definitionRows(def, { isMine: true }).rows);
  }
  allRows = allRows.concat(mineRows);
  const factoriesBytes = writeJson('client/public/data/factories.json', allRows);
  writeJson('data/factories.json', allRows);
  console.log(`✓ factories.json: ${allRows.length} filas (${(factoriesBytes / 1024).toFixed(0)} KB; incluye ${mineRows.length} filas de minas)`);

  // 3) factories.csv (espejo)
  const csv = toCsv(allRows);
  writeText('client/public/data/factories.csv', csv);
  writeText('data/factories.csv', csv);
  console.log(`✓ factories.csv: ${allRows.length} filas`);

  // 4) mines.json (reutiliza las filas ya convertidas)
  writeJson('client/public/data/mines.json', mineRows);
  writeJson('data/mines.json', mineRows);
  console.log(`✓ mines.json: ${mineRows.length} filas (${mines.map((m) => `${m.id}:${(m.levels || []).length}`).join(', ')})`);

  // 5) baseCost dataset unificado (TypeScript + JSON gemelo)
  const baseCostData = toBaseCostData(trimmed);
  const baseCostTs =
    '// GENERADO por scripts/buildGameConfigSnapshot.mjs — no editar a mano.\n' +
    '// Fuente: configuración estática oficial (POST https://craft-world.gg/graphql,\n' +
    '// query AggregatedCraftWorldConfigurationQuery). checksum: ' + trimmed.checksum + '\n' +
    'import type { FactoryLevelConfig } from "../types";\n\n' +
    'export const FACTORIES_BASE_COST_DATA: Record<string, FactoryLevelConfig[]> = ' +
    JSON.stringify(baseCostData) + ';\n';
  writeText('client/src/modules/baseCost/data/factoriesBaseCostData.ts', baseCostTs);
  writeJson('client/src/modules/baseCost/data/factoriesBaseCostData.json', baseCostData);
  console.log(`✓ factoriesBaseCostData: ${Object.keys(baseCostData).length} tokens`);

  // 6) Progresión de la mina EARTH para la enciclopedia (antes hardcodeada con
  //    valores aproximados en earthMineProgression.ts). WATER/FIRE no tienen
  //    tabla de producción en el config oficial: no se inventan.
  const earthDef = mines.find((m) => m.id === 'EARTH');
  if (earthDef?.levels?.length) {
    const title = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    const rows = earthDef.levels.map((lvl, idx) => ({
      level: idx + 1,
      costToken: lvl.cost?.[0]?.symbol ? title(lvl.cost[0].symbol) : '',
      costAmount: lvl.cost?.[0]?.amount ?? 0,
      durationSec: (Number(lvl.millisecondsPerCompletion) || 0) / 1000,
      output: lvl.output?.amount ?? 0,
      power: Number(lvl.batteryCost) || 0,
    }));
    const ts =
      '// GENERADO por scripts/buildGameConfigSnapshot.mjs — no editar a mano.\n' +
      '// checksum config: ' + trimmed.checksum + '\n' +
      'export interface EarthLevelDef {\n' +
      '  level: number; costToken: string; costAmount: number; durationSec: number; output: number; power: number;\n' +
      '}\n\n' +
      'export const RAW_EARTH_MINE: EarthLevelDef[] = ' + JSON.stringify(rows, null, 2) + ';\n';
    writeText('client/src/modules/encyclopedia/data/earthMineProgressionData.generated.ts', ts);
    console.log(`✓ earthMineProgressionData.generated.ts (${rows.length} niveles oficiales)`);
  }

  // ─── Validación ──────────────────────────────────────────────────────────
  console.log('\n═══ VALIDACIÓN ═══');
  console.log(`· Filas fábricas: ${allRows.length} | niveles con coste múltiple: ${multiCostLevels}`);
  const levelsCount = factories.reduce((acc, d) => acc + (d.levels?.length || 0), 0);
  console.log(`· Niveles totales en config: ${levelsCount} (filas emitidas = ${allRows.length})`);

  // diff STEEL de muestra contra el CSV anterior si existe backup previo en git
  try {
    const { execSync } = await import('node:child_process');
    const gitRoot = execSync('git rev-parse --show-toplevel', { cwd: ROOT, encoding: 'utf8' }).trim();
    const relToGit = path.relative(gitRoot, path.join(ROOT, 'client/public/data/factories.csv')).split(path.sep).join('/');
    const oldCsv = execSync(`git show HEAD:${relToGit}`, { cwd: ROOT, encoding: 'utf8' });
    const oldRows = oldCsv.trim().split('\n').slice(1).map((l) => l.split(','));
    const oldMap = new Map(oldRows.map((r) => [`${r[0]}:${r[1]}`, r]));
    let shared = 0, matching = 0, diffs = [];
    for (const row of allRows) {
      const old = oldMap.get(`${row.token}:${row.level}`);
      if (!old) continue;
      shared += 1;
      const oldDur = Number(old[2]);
      const sameDur = Math.abs(oldDur - row.duration_min) < 0.02;
      const sameUpgrade = old[10] === row.upgrade_token && Number(old[11]) === row.upgrade_amount;
      if (sameDur && sameUpgrade) matching += 1;
      else if (diffs.length < 8) diffs.push(`${row.token}:${row.level} dur ${oldDur}→${row.duration_min} up ${old[10]} ${old[11]}→${row.upgrade_token} ${row.upgrade_amount}`);
    }
    console.log(`· Filas compartidas con el CSV anterior: ${shared} | coinciden (±0,02 min): ${matching}`);
    for (const d of diffs) console.log(`  diff: ${d}`);
    const oldTokens = new Set(oldRows.map((r) => r[0]));
    const newTokens = new Set(allRows.map((r) => r.token));
    const added = [...newTokens].filter((t) => !oldTokens.has(t));
    console.log(`· Tokens nuevos respecto al CSV: ${added.length} → ${added.join(', ')}`);
  } catch {
    console.log('· (diff vs CSV anterior omitido: git no disponible o archivo no versionado)');
  }

  console.log('\nHecho. Revisa el informe antes de commitear.');
}

main().catch((err) => {
  console.error('✗ buildGameConfigSnapshot falló:', err.message);
  process.exit(1);
});
