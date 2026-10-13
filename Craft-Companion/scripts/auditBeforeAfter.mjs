#!/usr/bin/env node
/**
 * auditBeforeAfter.mjs — cuantifica el impacto de la migración a la
 * configuración oficial del juego (2026-10-12) comparando la física anterior
 * de la app (reconstruida inline desde el código pre-migración) contra la
 * física oficial ahora implementada (módulos reales compilados).
 *
 * Uso: desde client/ haber corrido `npm test` al menos una vez (usa dist-tests),
 * o `npx tsc -p tsconfig.test.json` para generarlos. Luego:
 *   node scripts/auditBeforeAfter.mjs
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const DT = path.join(ROOT, 'client/dist-tests');

const calc = require(path.join(DT, 'services/craftworldCalculations.js'));
const cycleAdjuster = require(path.join(DT, 'modules/profitability/services/cycleAdjuster.js'));
const arbitrage = require(path.join(DT, 'modules/tradingBot/services/arbitrageEngine.js'));

const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'client/public/data/factories.json'), 'utf8'));
const byKey = new Map(rows.map((r) => [`${r.token}:${r.level}`, r]));

const PRICES = { EARTH: 0.0046, COPPER: 0.28, MUD: 0.0138, SAND: 0.35, SCREWS: 26.4, STEEL: 51.3, FUEL: 0.62 };

const legacyYieldBonus = { 1: 102.04, 2: 102.86, 3: 103.29, 4: 103.72, 5: 104.15, 6: 104.37, 7: 104.59, 8: 104.81, 9: 105.03, 10: 105.25 };
const legacyWorkshopT2 = [0, 10, 20, 30, 39, 47, 54, 61, 69, 75, 82]; // tabla por tiers anterior (aprox)
const fmt = (n) =>
  Math.abs(n) < 1
    ? n.toFixed(6)
    : Number(n.toFixed(6)).toLocaleString('es-ES', { maximumFractionDigits: 6 });

console.log('═══ BEFORE / AFTER — física del juego ═══\n');

// ─── 1) Duración con workshop (fila real STEEL L1: 720 min) ─────────────────
const steelL1 = byKey.get('STEEL:1');
{
  const legacy = steelL1.duration_min / (1 + legacyWorkshopT2[Math.min(9 + 1, 10)] / 100); // ÷(1+82%)
  const oficial = calc.calculateFactoryRuntime(steelL1, { workshop: [{ symbol: 'STEEL', level: 9 }] });
  console.log('1) STEEL L1 con workshop nivel 9 (valor real en juego medido: 396 min):');
  console.log(`   antes (tier ÷1.82):        ${fmt(legacy)} min`);
  console.log(`   ahora (oficial ×(1−0.45)): ${fmt(oficial)} min`);
}

// ─── 2) Maestría sobre insumos directos ──────────────────────────────────────
{
  const profs = [{ symbol: 'STEEL', claimedLevel: 10 }];
  const legacy = steelL1.input_amount_1 / (legacyYieldBonus[10] / 100); // ÷1.0525
  const cycle = calc.calculateFactoryCycle(steelL1, { COPPER: PRICES.COPPER, STEEL: PRICES.STEEL }, { proficiencies: profs });
  console.log('\n2) STEEL L1 insumo COPPER por ciclo con maestría 10 (juego real: 4.75):');
  console.log(`   antes (÷1.0525):           ${fmt(legacy)}`);
  console.log(`   ahora (×0.95 oficial):     ${fmt(cycle.input1PerCycle)}`);
}

// ─── 3) Cadena self-crafted: doble maestría eliminada ────────────────────────
{
  // Cadena real oficial: STEEL ← COPPER ← SAND ← CLAY ← MUD ← EARTH.
  // Cada nodo descuenta SUS insumos con SU maestría (×0.95 al nivel 10).
  // Con maestría 10 en toda la cadena, EARTH debe multiplicarse por 0.95^5.
  const tree = calc.buildRecipeTree(rows, 'STEEL', 1, 1);
  const flatSin = calc.flattenRecipeToBaseResources(tree, {});
  const mm = require(path.join(DT, 'services/masteryModifiers.js'));
  const flatCon = calc.flattenRecipeToBaseResources(tree, {}, (tok) =>
    mm.getMasteryInputFactor(tok, [{ symbol: tok, claimedLevel: 10 }]),
  );
  const esperado = (flatSin.EARTH ?? 0) * Math.pow(0.95, 5);
  console.log('\n3) EARTH necesaria por STEEL (cadena REAL: STEEL←COPPER←SAND←CLAY←MUD←EARTH):');
  console.log(`   sin maestría:                          ${fmt(flatSin.EARTH ?? 0)}`);
  console.log(`   ahora, maestría 10 en toda la cadena:  ${fmt(flatCon.EARTH ?? 0)} (esperado ×0.95⁵ = ${fmt(esperado)})`);
  console.log('   antes, la app dividía DOS veces por la maestría del padre en cada hoja (bug-003).');
}

// ─── 4) Arbitraje: fee oficial 2.5% + precisión 6 decimales ──────────────────
{
  const row = { token: 'PAPERWRAP', level: 1, duration_min: 10, output_token: 'PAPERWRAP', output_amount: 1, input_token_1: 'WOOD', input_amount_1: 2, input_token_2: '', input_amount_2: 0, upgrade_token: 'WOOD', upgrade_amount: 10 };
  const legacyNet = 30 * (1 - 0.05);
  const legacyProfit = legacyNet - 10;
  const res = arbitrage.calculateCraftArbitrage(row, { WOOD: 5, PAPERWRAP: 30 });
  console.log('\n4) Arbitraje PAPERWRAP (coste 10, venta 30):');
  console.log(`   antes (fee 5%):  neto ${fmt(legacyNet)} → profit ${fmt(legacyProfit)}`);
  console.log(`   ahora (fee ${(arbitrage.getMarketplaceTaxRate() * 100).toFixed(1)}% oficial): neto ${fmt(res.netRevenueCoin)} → profit ${fmt(res.netProfitCoin)} | margen ${res.marginPercent}%`);

  // token barato: MUD
  const mudRow = byKey.get('MUD:1');
  const mudRes = arbitrage.calculateCraftArbitrage(mudRow, { EARTH: PRICES.EARTH, MUD: PRICES.MUD });
  console.log(`   MUD (precio 0.0138): profit/ciclo antes redondeado a 2dp ≈ 0.00 → ahora ${fmt(mudRes.netProfitCoin)} COIN`);
}

// ─── 5) Cobertura del dataset ────────────────────────────────────────────────
{
  const tokens = new Set(rows.map((r) => r.token));
  console.log('\n5) Dataset:');
  console.log(`   filas totales: ${rows.length} (antes 905) | tokens con tabla: ${tokens.size} (antes 51)`);
  console.log(`   niveles máximos: MUD=${Math.max(...rows.filter(r=>r.token==='MUD').map(r=>r.level))}, PAINT=${Math.max(...rows.filter(r=>r.token==='PAINT').map(r=>r.level))}, SWORD=${Math.max(...rows.filter(r=>r.token==='SWORD').map(r=>r.level))}`);
}

console.log('\nDetalle y fuentes: RESPUESTA_DEV_API_GAPS.md');
