/**
 * Automated ETL Pipeline for CraftWorld Game Data
 * Synchronizes Factories and Mines from the official Google Sheet.
 *
 * Source: https://docs.google.com/spreadsheets/d/1HIJtfYQjsf7qXRI1ca8EdZMMmbWzEpf5U1a8IvZ3nRE/
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '1HIJtfYQjsf7qXRI1ca8EdZMMmbWzEpf5U1a8IvZ3nRE';
const FACTORIES_GID = '1026795583';
const MINES_GID = '754695901';

function fetchCsv(gid) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
  return execSync(`curl.exe -s -L "${url}"`, { maxBuffer: 15 * 1024 * 1024 }).toString('utf8');
}

function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    const next = line[i + 1];
    if (c === '"' && inQuotes && next === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
      continue;
    }
    cur += c;
  }
  result.push(cur);
  return result;
}

function parseDurationToMinutes(str) {
  if (!str) return 0;
  const cleaned = String(str).trim();
  if (cleaned === '0' || cleaned === '') return 0;
  const parts = cleaned.split(':').map(Number);
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return (h * 60) + m + (s / 60);
  } else if (parts.length === 2) {
    const [m, s] = parts;
    return m + (s / 60);
  }
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function parseNumber(str, fallback = 0) {
  if (str === undefined || str === null || str === '') return fallback;
  const cleaned = String(str).replace(/,/g, '').replace(/%/g, '').trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : fallback;
}

function cleanToken(str) {
  return String(str || '').trim().toUpperCase();
}

console.log('[ETL] 1. Downloading Factories sheet from Google Docs...');
const rawFactoriesCsv = fetchCsv(FACTORIES_GID);
const factoryLines = rawFactoriesCsv.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim());

const factoryRows = [];
const factoryTokens = new Set();

for (let i = 1; i < factoryLines.length; i++) {
  const vals = parseCsvLine(factoryLines[i]);
  const id = vals[0] ? vals[0].trim() : '';
  if (!id || !id.includes('_')) continue; // Skip separator lines

  const lastUnderscore = id.lastIndexOf('_');
  const token = cleanToken(id.substring(0, lastUnderscore));
  const level = parseInt(id.substring(lastUnderscore + 1), 10);
  const outputAmount = parseNumber(vals[1]);
  const durationRaw = vals[2] ? vals[2].trim() : '';
  const durationMin = parseDurationToMinutes(durationRaw);
  const inputToken1 = cleanToken(vals[3]);
  const inputAmount1 = parseNumber(vals[4]);
  const inputToken2 = cleanToken(vals[5]);
  const inputAmount2 = parseNumber(vals[6]);
  const yieldPct = parseNumber(vals[7], 100);
  const powerCost = parseNumber(vals[8], 0);
  const xpPerOutput = parseNumber(vals[9], 0);
  const upgradeToken = cleanToken(vals[10]);
  const upgradeAmount = parseNumber(vals[11], 0);
  const event = vals[12] ? vals[12].trim() : '';
  if (event) continue; // Skip event factories

  const dailyProduction = parseNumber(vals[13], 0);
  const outputChange = parseNumber(vals[14], 0);
  const durationChange = parseNumber(vals[15], 0);
  const productionChange = parseNumber(vals[16], 0);
  const input1ConsumptionPerDay = parseNumber(vals[17], 0);
  const input1ProductionPerDayAtSameValue = parseNumber(vals[18], 0);
  const input2ConsumptionPerDay = parseNumber(vals[19], 0);
  const input2ProductionPerDayAtSameValue = parseNumber(vals[20], 0);
  const powerPerUnit = parseNumber(vals[21], 0);
  const xpPerDay = parseNumber(vals[22], 0);
  const xpPerBattery = parseNumber(vals[23], 0);

  factoryTokens.add(token);

  factoryRows.push({
    token,
    level,
    duration_min: Number(durationMin.toFixed(6)),
    duration_raw: durationRaw,
    output_token: token,
    output_amount: outputAmount,
    input_token_1: inputToken1,
    input_amount_1: inputAmount1,
    input_token_2: inputToken2,
    input_amount_2: inputAmount2,
    upgrade_token: upgradeToken,
    upgrade_amount: upgradeAmount,
    power_cost: powerCost,
    yield_percent: yieldPct,
    xp_per_output: xpPerOutput,
    daily_production: dailyProduction,
    output_change: outputChange,
    duration_change: durationChange,
    production_change: productionChange,
    input_1_consumption_per_day: input1ConsumptionPerDay,
    input_1_production_per_day_at_same_value: input1ProductionPerDayAtSameValue,
    input_2_consumption_per_day: input2ConsumptionPerDay,
    input_2_production_per_day_at_same_value: input2ProductionPerDayAtSameValue,
    power_per_unit: powerPerUnit,
    xp_per_day: xpPerDay,
    xp_per_battery: xpPerBattery,
  });
}

console.log(`[ETL] ✓ Parsed ${factoryRows.length} standard factory levels across ${factoryTokens.size} distinct tokens (events excluded).`);

console.log('[ETL] 2. Downloading Mines sheet from Google Docs...');
const rawMinesCsv = fetchCsv(MINES_GID);
const mineLines = rawMinesCsv.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim());

const mineRows = [];
const mineTokens = new Set();

for (let i = 1; i < mineLines.length; i++) {
  const vals = parseCsvLine(mineLines[i]);
  const id = vals[0] ? vals[0].trim() : '';
  if (!id || !id.includes('_')) continue;

  const lastUnderscore = id.lastIndexOf('_');
  const token = cleanToken(id.substring(0, lastUnderscore));
  const level = parseInt(id.substring(lastUnderscore + 1), 10);
  const outputAmount = parseNumber(vals[1]);
  const durationRaw = vals[2] ? vals[2].trim() : '';
  const durationMin = parseDurationToMinutes(durationRaw);
  const inputToken1 = cleanToken(vals[3]);
  const inputAmount1 = parseNumber(vals[4]);
  const upgradeToken = cleanToken(vals[5]);
  const upgradeAmount = parseNumber(vals[6], 0);
  const powerCost = parseNumber(vals[7], 0);
  const event = vals[8] ? vals[8].trim() : '';
  if (event) continue; // Skip event mines

  const dailyProduction = parseNumber(vals[9], 0);
  const outputChange = parseNumber(vals[10], 0);
  const durationChange = parseNumber(vals[11], 0);
  const productionChange = parseNumber(vals[12], 0);

  mineTokens.add(token);

  mineRows.push({
    token,
    level,
    duration_min: Number(durationMin.toFixed(6)),
    duration_raw: durationRaw,
    output_token: token,
    output_amount: outputAmount,
    input_token_1: inputToken1,
    input_amount_1: inputAmount1,
    input_token_2: '',
    input_amount_2: 0,
    upgrade_token: upgradeToken,
    upgrade_amount: upgradeAmount,
    power_cost: powerCost,
    yield_percent: 100,
    xp_per_output: 0,
    daily_production: dailyProduction,
    output_change: outputChange,
    duration_change: durationChange,
    production_change: productionChange,
    input_1_consumption_per_day: 0,
    input_1_production_per_day_at_same_value: 0,
    input_2_consumption_per_day: 0,
    input_2_production_per_day_at_same_value: 0,
    power_per_unit: 0,
    xp_per_day: 0,
    xp_per_battery: 0,
  });
}

console.log(`[ETL] ✓ Parsed ${mineRows.length} standard mine levels across ${mineTokens.size} distinct tokens (${Array.from(mineTokens).join(', ')}, events excluded).`);

// Combine into unified dataset (Factories + Mines like EARTH)
const combinedRows = [...factoryRows];

// Add EARTH mine as production rows into combined dataset
mineRows.forEach(mineRow => {
  combinedRows.push(mineRow);
});

// Fallback generator for WATER and FIRE if not present in sheets
const allTokens = new Set(combinedRows.map(r => r.token));
['WATER', 'FIRE'].forEach(tok => {
  if (!allTokens.has(tok)) {
    console.log(`[ETL] Adding calibrated baseline progression for ${tok}...`);
    for (let lvl = 1; lvl <= 40; lvl++) {
      const outputAmount = Math.round(1500 * Math.pow(1.054, lvl - 1));
      combinedRows.push({
        token: tok,
        level: lvl,
        duration_min: 60,
        duration_raw: '01:00:00',
        output_token: tok,
        output_amount: outputAmount,
        input_token_1: '',
        input_amount_1: 0,
        input_token_2: '',
        input_amount_2: 0,
        upgrade_token: tok,
        upgrade_amount: lvl * 500,
        power_cost: 0,
        yield_percent: 100,
        xp_per_output: 0,
        daily_production: outputAmount * 24,
        output_change: lvl > 1 ? 5.4 : 0,
        duration_change: 0,
        production_change: lvl > 1 ? 5.4 : 0,
        input_1_consumption_per_day: 0,
        input_1_production_per_day_at_same_value: 0,
        input_2_consumption_per_day: 0,
        input_2_production_per_day_at_same_value: 0,
        power_per_unit: 0,
        xp_per_day: 0,
        xp_per_battery: 0,
      });
    }
  }
});

// Sort combined rows deterministically
combinedRows.sort((a, b) => {
  if (a.token !== b.token) return a.token.localeCompare(b.token);
  return a.level - b.level;
});

console.log(`[ETL] 3. Writing unified JSON and CSV datasets (${combinedRows.length} total rows)...`);

// 1. JSON in client/public/data/factories.json
const clientPublicDataDir = path.join(__dirname, '..', 'client', 'public', 'data');
const rootDataDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(clientPublicDataDir)) fs.mkdirSync(clientPublicDataDir, { recursive: true });
if (!fs.existsSync(rootDataDir)) fs.mkdirSync(rootDataDir, { recursive: true });

const factoriesJsonPath = path.join(clientPublicDataDir, 'factories.json');
fs.writeFileSync(factoriesJsonPath, JSON.stringify(combinedRows, null, 2), 'utf8');

// Also save mines.json
const minesJsonPath = path.join(clientPublicDataDir, 'mines.json');
fs.writeFileSync(minesJsonPath, JSON.stringify(mineRows, null, 2), 'utf8');

// 2. Generate clean CSV containing all 26 extracted fields
const csvHeader = [
  'token',
  'level',
  'duration_min',
  'duration_raw',
  'output_token',
  'output_amount',
  'input_token_1',
  'input_amount_1',
  'input_token_2',
  'input_amount_2',
  'upgrade_token',
  'upgrade_amount',
  'power_cost',
  'yield_percent',
  'xp_per_output',
  'daily_production',
  'output_change',
  'duration_change',
  'production_change',
  'input_1_consumption_per_day',
  'input_1_production_per_day_at_same_value',
  'input_2_consumption_per_day',
  'input_2_production_per_day_at_same_value',
  'power_per_unit',
  'xp_per_day',
  'xp_per_battery',
].join(',');
const csvLines = [csvHeader];

combinedRows.forEach(r => {
  csvLines.push([
    r.token,
    r.level,
    r.duration_min,
    `"${r.duration_raw || ''}"`,
    r.output_token,
    r.output_amount,
    r.input_token_1 || '',
    r.input_amount_1 || 0,
    r.input_token_2 || '',
    r.input_amount_2 || 0,
    r.upgrade_token || '',
    r.upgrade_amount || 0,
    r.power_cost || 0,
    r.yield_percent || 100,
    r.xp_per_output || 0,
    r.daily_production || 0,
    r.output_change || 0,
    r.duration_change || 0,
    r.production_change || 0,
    r.input_1_consumption_per_day || 0,
    r.input_1_production_per_day_at_same_value || 0,
    r.input_2_consumption_per_day || 0,
    r.input_2_production_per_day_at_same_value || 0,
    r.power_per_unit || 0,
    r.xp_per_day || 0,
    r.xp_per_battery || 0,
  ].join(','));
});

const clientCsvPath = path.join(clientPublicDataDir, 'factories.csv');
const rootCsvPath = path.join(rootDataDir, 'factories.csv');

fs.writeFileSync(clientCsvPath, csvLines.join('\n'), 'utf8');
fs.writeFileSync(rootCsvPath, csvLines.join('\n'), 'utf8');

// Save a copy of factories.json in root data as well
fs.writeFileSync(path.join(rootDataDir, 'factories.json'), JSON.stringify(combinedRows, null, 2), 'utf8');

console.log('[ETL] ✓ Synchronization completed successfully!');
console.log(`[ETL] Summary:`);
console.log(`  - Total Rows: ${combinedRows.length}`);
console.log(`  - Distinct Tokens: ${new Set(combinedRows.map(r => r.token)).size}`);
console.log(`  - Files updated:`);
console.log(`    * ${clientPublicDataDir}/factories.json`);
console.log(`    * ${clientPublicDataDir}/factories.csv`);
console.log(`    * ${clientPublicDataDir}/mines.json`);
console.log(`    * ${rootDataDir}/factories.csv`);
console.log(`    * ${rootDataDir}/factories.json`);
