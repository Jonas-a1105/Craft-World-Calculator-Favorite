# Craft World — Cobertura de API vs Craft Companion (v3, 2026-10-12)

## Estado: MIGRACIÓN EJECUTADA

El dev proporcionó dos queries GraphQL del cliente oficial (públicas, sin auth):

1. `AggregatedCraftWorldConfigurationQuery` → `POST https://craft-world.gg/graphql` — config estática completa (~3,6 MB, 30 bloques). Snapshot en `data/craft-world-config.json`.
2. `CurrentMasterpiece($userId)` — masterpieces activas con `milestones[].rewardStages` y `leaderboardRewards` por rango + posición del jugador. Snapshot en `data/masterpiece-current.json`.

## Qué se construyó

| Pieza | Estado |
|---|---|
| `shared/gameConfig/*.graphql` — queries canónicas versionadas | ✅ |
| `scripts/buildGameConfigSnapshot.mjs` (`npm run sync:gameconfig`) — regenera todos los datasets desde el config con informe de validación | ✅ |
| `client/public/data/factories.json/.csv` — **1.795 filas** (72 fábricas completas + 4 minas) vs 905 antes; 24 tokens nuevos | ✅ |
| `client/public/data/gameConfigSnapshot.json` (3,6 MB, fuera del bundle JS) | ✅ |
| `client/src/services/gameConfig/` — fallbacks compilados + snapshot local + refresh en vivo por checksum | ✅ |
| `client/src/services/gameConfig.test.ts` — tests de física oficial (7 nuevos) | ✅ |
| Server: `GET /api/craftworld/game-config` + `/game-config/checksum` + `/masterpiece-current` (caché checksum 6 h, SSRF guard https+dominio) | ✅ |
| `factoriesBaseCostData.ts` regenerado (72 tokens; elimina el dataset paralelo y el riesgo de import untracked) | ✅ |
| `earthMineProgressionData.generated.ts` — mina EARTH oficial (50 niveles; la tabla hardcodeada era aproximada) | ✅ |

## Física corregida (evidencia reproducible: `node scripts/auditBeforeAfter.mjs`)

| Mecánica | Antes (app) | Ahora (oficial) | Evidencia |
|---|---|---|---|
| Maestría | ÷(1+p) con tabla yield aprox | ×`inputDiscountFactor` (L10 → 5 COPPER→4.75 exactos) | payload real + config |
| Doble maestría en cadenas | dos divisiones por hoja (bug-003) | factor por rama, una vez por nodo (STEEL: 13.500 → 10.446 EARTH = ×0.95⁵ exacto) | test + script |
| Workshop | ÷(1+tier aprox) | ×(1−bonus) por símbolo real (720→396 = juego en vivo) | payload coincide al decimal |
| Workers | ÷(1+p) | ×(1−p) (mismo patrón) | coherencia con factoryTimersService |
| Fee mercado | 0% / 5% según módulo | `tradeInputTaxRate` = **2,5%** (sell ×0,975 / buy ×1,025), retiro 10% | configuración oficial |
| Redondeo arbitraje | 2 dp (MUD→0,00) | COIN_DECIMALS=6 | — |
| Magic level 18 en valueChain | sí | nivel máximo real del token | — |
| WATER/FIRE 40 niveles | fabricados (1500×1.054ⁿ) | eliminados: el juego no publica esas tablas | ausencia confirmada en config |
| Timers | workshop reaplicado sobre definitions personalizadas + off-by-one en notificaciones | extractor único `resolveFactoryRunTiming`: definición personalizada ⇒ no reaplicar; fallback estático ⇒ tabla oficial | STEEL L11 real 146,3 min en ambos paths |

**Tests: 159/159 cliente + 16/16 servidor verdes.** Typecheck cliente y servidor limpios.

## Pendientes para el dev

1. **WATER/FIRE**: ninguna tabla de producción en el config (ni factoryDefinitions, ni mineDefinitions, ni edificios). ¿De dónde salen sus valores por nivel?
2. Recompensas por rango de masterpieces **históricas** (MP1–MP3) — la query cubre la activa, no el archivo.
3. Market/liquidez: confirmado por el dev que no habrá endpoint — seguimos con Ronin on-chain (ya implementado).

## Mensaje final para el dev (EN)

> Done — the client GraphQL endpoint covers everything we needed. We rebuilt our data pipeline on `AggregatedCraftWorldConfigurationQuery` (checksum-based cache invalidation) and `CurrentMasterpiece`, and deleted every hand-scraped table. Our fee/mastery/workshop math now matches the live game to the decimal (verified STEEL L1: 720×(1−0.45)=396 min, 5×0.95=4.75 inputs).
>
> One remaining gap: the config has no production table for WATER/FIRE (not in factoryDefinitions, mineDefinitions or buildingDefinitions). Where do their per-level outputs come from?
