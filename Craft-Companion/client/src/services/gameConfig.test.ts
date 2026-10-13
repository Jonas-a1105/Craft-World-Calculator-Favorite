import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  applyMasteryInputReduction,
  getMasteryInputReductionPercent,
  getMasteryLevel,
} from './masteryModifiers';
import {
  applyWorkshopSpeedToDuration,
  getWorkshopSpeedBoostPercent,
} from './workshopModifiers';
import { setGameConfigDataForTests } from './gameConfig';

// Estas pruebas fijan la física oficial del juego, verificada contra
// /me/craft-world en vivo el 2026-10-12 (cuenta Coquerokli):
//   STEEL maestría 10 → insumos ×0.95   (5 × 0.95 = 4.75 exactos)
//   STEEL workshop 9 → duración ×(1−0.45) (720 × 0.55 = 396 min exactos)

test('mastery nivel 10 multiplica insumos por 0.95 (inputDiscountFactor oficial)', () => {
  const profs = [{ symbol: 'STEEL', claimedLevel: 10 }];
  assert.equal(getMasteryLevel('STEEL', profs), 10);
  assert.equal(applyMasteryInputReduction(5, 'STEEL', profs), 4.75);
  assert.equal(getMasteryInputReductionPercent('STEEL', profs), 5);
});

test('mastery nivel 1 aplica ×0.98 y nivel 0 no cambia nada', () => {
  assert.equal(applyMasteryInputReduction(100, 'STEEL', [{ symbol: 'STEEL', claimedLevel: 1 }]), 98);
  assert.equal(applyMasteryInputReduction(100, 'STEEL', []), 100);
});

test('símbolos sin tabla de maestría (líneas de evento) aplican factor 1', () => {
  assert.equal(
    applyMasteryInputReduction(50, 'SUSHI', [{ symbol: 'SUSHI', claimedLevel: 10 }]),
    50,
  );
});

test('workshop reduce duración multiplicativamente: base × (1 − bonus)', () => {
  // STEEL nivel 9 → bonus 0.45 → 720 × 0.55 = 396 (evidencia payload en vivo;
  // el float da 396.00000000000006, por eso epsilon)
  const runtime = applyWorkshopSpeedToDuration(720, 'STEEL', [{ symbol: 'STEEL', level: 9 }]);
  assert.ok(Math.abs(runtime - 396) < 1e-9, `expected ~396, got ${runtime}`);
});

test('workshop MUD nivel 2 → 26% de reducción (la UI del juego lo muestra como +35% velocidad)', () => {
  const pct = getWorkshopSpeedBoostPercent('MUD', [{ symbol: 'MUD', level: 2 }]);
  assert.equal(pct, 26);
  assert.equal(applyWorkshopSpeedToDuration(10, 'MUD', [{ symbol: 'MUD', level: 2 }]), 7.4);
});

test('workshop sin nivel o sin línea no modifica la duración', () => {
  assert.equal(applyWorkshopSpeedToDuration(60, 'STEEL', []), 60);
  assert.equal(applyWorkshopSpeedToDuration(60, 'SUSHI', [{ symbol: 'SUSHI', level: 5 }]), 60);
});

test('setGameConfigDataForTests permite inyectar tablas de juego', () => {
  setGameConfigDataForTests({
    checksum: 'test-inyectado',
    workshopConfiguration: {
      workshopSkills: [
        { symbol: 'COPPER', levels: [{ requiredSkillPoints: 1, speedBonusPercentage: 0.5 }] },
      ],
    },
  });
  assert.equal(
    applyWorkshopSpeedToDuration(100, 'COPPER', [{ symbol: 'COPPER', level: 1 }]),
    50,
  );
  // restaura fallbacks para no contaminar otros tests
  setGameConfigDataForTests({ checksum: 'restaurar' });
});
