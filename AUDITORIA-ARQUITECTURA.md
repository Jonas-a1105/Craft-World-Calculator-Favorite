# Auditoría Arquitectónica — Craft-Companion

**Fecha:** 2026-10-12 · **Alcance:** `Craft-Companion/` (monorepo npm workspaces: `client` + `server`) · **Modo:** solo lectura, cero modificaciones al código
**Método:** lectura completa de los 28 archivos de `server/src`, análisis de la estructura de `client/src` (~420 archivos), mapeo del grafo de imports con grep, verificación de contratos duplicados, código muerto y efectos secundarios globales.

---

## 1. Resumen ejecutivo

El proyecto está **mejor estructurado de lo que sugiere su README**: hay capas claras en el server, módulos por feature en el client, tipado estricto real (cero `any` en server, solo 3 `as any` en client, cero `@ts-ignore`), tests co-localizados y un `pricingService` financiero genuinamente bien diseñado.

Sin embargo, la auditoría detecta **3 riesgos de seguridad críticos/altos en el server**, un **clúster de 8 archivos `advanced*` (~1000 líneas) que es andamiaje no funcional pero ejecuta timers permanentes en cada carga de la app**, y **18 acoplamientos cruzados entre internos de módulos** que convierten a `profitability` en un shared-kernel de facto no declarado. El límite de módulo existe en el sistema de archivos pero no en el grafo de dependencias: los barrels `index.ts` son `export *` sin curar, por lo que la "API pública" es decorativa.

**Veredicto:** monolito modular en buen estado general, con deuda concentrada en 4 puntos accionables (seguridad de sesión, clúster avanzado, duplicación de tipos/contratos, kernel compartido no extraído). Ninguno requiere reescritura; todos admiten migración incremental no destructiva.

---

## 2. Mapa de dependencias actual

### 2.1 Server (dirección correcta en general)

```
routes/ ──▶ controllers/ ──▶ services/ ──▶ storage/ ──▶ db/prisma
                │               │
                │               └──▶ craftworldExternalApi (HTTP fetch externo)
                └──▶ auth/requireSession ──▶ storage/userStorage
middlewares/ (validate: Zod, errorHandler, rateLimiter) ──▶ app.ts
config/env (Zod) ──▶ consumido por casi todo
```

Capas bien separadas: los controllers no tocan Prisma, los servicios no importan Express, el mapeo Prisma↔dominio (`mapPrismaToUserAccount`) aísla el ORM. La deuda está en *qué* contiene cada capa (§3.1), no en la dirección.

### 2.2 Client (dos direcciones prohibidas)

```
pages ──▶ modules/<feature>/{components,hooks,services}   ✅ correcto
modules ──▶ src/services (capa compartida)                 ✅ correcto
modules ──▶ internos de OTROS módulos                      ❌ 18 imports (§3.2 C3)
src/services ──▶ modules/resources/types                  ❌ invertida (roninPoolsService.ts:1)
src/types ──▶ modules/home/types                          ❌ invertida (types.ts:1)
priceService ──(import side-effect)──▶ clúster advanced*  ❌ (§3.2 C1)
```

Grafo de acoplamiento entre módulos (imports a caminos profundos, eludiendo barrels):

| Consumidor | Interno consumido | Archivos |
|---|---|---|
| `advisor` | `profitability/services/cycleAdjuster` | `useUpgradeAdvisor.ts:12` |
| `compare` | `profitability/services/cycleAdjuster` | `useFactoryCompare.tsx:14` |
| `calculator` | `profitability/services/cycleAdjuster` + `profitability/types` | `useCalculator.ts:22-23`, `CalculatorSelectionCard.tsx:5-6`, `CalculatorOutputCard.tsx:7` |
| `tradingBot` | `profitability/services/pricesAndProfitabilityService`, `prices/types`, `baseCost/services` + `baseCost/data` | `tradingSignalsService.ts:1,4`, `useTradingBot.ts:5`, `OpportunityFeedCard.tsx:15-16`, `ArbitrageCalculatorModal.tsx:12` |
| `profitability` | `timers/services/factoryTimersService` | `cycleAdjuster.ts:17`, `accountAggregator.ts:10` |
| `landing`, `splash` | `auth/services/authService` | `LandingActions.tsx:4`, `SplashScreen.tsx:4` |

**Conclusión:** `cycleAdjuster`, `factoryTimersService`, `pricesAndProfitabilityService`, `baseCostCatalog` y `isUserAuthenticated` son **dominio compartido disfrazado de feature**. No hay dependencias circulares entre módulos (el grafo es acíclico), pero `profitability` funciona como hub central no declarado.

---

## 3. Diagnóstico detallado

### 3.1 Server — hallazgos

#### Positivos (a preservar)
- Cero `any` / cero `as any` en todo `server/src`.
- `config/env.ts` valida todo el entorno con Zod en el arranque (fail-fast).
- `errorHandler` centralizado con clasificación Zod / AppError / inesperados.
- Rate limiters escalonados (500/15min general, 30/15min auth, 120/15min sync) con bypass en test.
- Sesión HMAC-SHA256 con `timingSafeEqual` (`auth/session.ts:24`); PKCE S256 correcto.
- Graceful shutdown con `SIGINT`/`SIGTERM` + `$disconnect`.
- El storage aísla Prisma del resto; los servicios no conocen Express.

#### S1 · CRÍTICA (Seguridad) — `quick-login` permite suplantación de cualquier cuenta
`controllers/auth.controller.ts:206-241`. `POST /api/auth/quick-login` con `{"uid":"algo"}` crea o recupera el usuario y **firma una cookie de sesión válida para ese uid**, sin ninguna autenticación. Solo lo protege `authLimiter` (30 intentos/15min). Cualquier atacante que conozca/craftee un uid obtiene la sesión del usuario real, incluyendo lectura vía `/api/craftworld/*` de los datos cacheados con sus tokens OAuth.
**Recomendación:** traseras de un env flag `ENABLE_QUICK_LOGIN=false` (solo desarrollo), o eliminación directa.

#### S2 · ALTA (Seguridad) — CORS aprueba cualquier origen con credenciales
`app.ts:37-45`: el callback de `cors()` valida localhost y las dos URLs configuradas… y termina con `callback(null, true)` incondicional para **cualquier otro origen**, con `credentials: true`. El allowlist es decorativo; un sitio malicioso puede hacer peticiones autenticadas con la cookie del usuario.
**Recomendación:** allow-list real que rechace orígenes desconocidos.

#### S3 · ALTA (Seguridad) — Token de sesión expuesto en URL
`auth.controller.ts:203`: `res.redirect(\`${activeOrigin}/splash?to=/home&token=${...}\`)`. El token equivale a la cookie de sesión: queda en historial del navegador, logs del servidor y cabeceras `Referer`.
**Recomendación:** eliminar `?token=` del redirect; la cookie HttpOnly ya autentica.

#### S4 · ALTA (Seguridad) — `SESSION_SECRET` con default hardcodeado
`config/env.ts:7`: `.default('craftworld_secret_session_key_2026')`. En producción sin la variable, cualquiera que lea el repo puede forjar cookies de sesión.
**Recomendación:** requerido (sin default) cuando `NODE_ENV === 'production'`; fail-fast en bootstrap.

#### S5 · ALTA (Seguridad) — Tokens OAuth y clientSecret en texto plano en SQLite
`prisma/schema.prisma:16-21` (access/refresh token, clientSecret por usuario) y `OAuthSession.clientSecret` (`schema.prisma:36`). Un volcado de la DB compromete todas las sesiones del juego.
**Recomendación:** cifrado en reposo (AES-256-GCM con key de entorno) en el adaptador de persistencia, con migración de lectura del formato legacy.

#### S6 · MEDIA — Consumo "atómico" de sesión OAuth que no lo es
`storage/oauthSessionStorage.ts:63-72`: `findUnique` + `delete` en dos pasos; el comentario dice "Atomic one-time consume" pero dos callbacks concurrentes pueden leer el mismo registro. Además el prune (`:28-34`) es fire-and-forget con `catch(() => {})`.
**Recomendación:** `deleteMany({where:{state}})` y verificar `count === 1`, o transacción.

#### S7 · MEDIA — Lógica de negocio y política de errores en controllers
`controllers/craftworld.controller.ts`:
- El bloque de mapeo 403/502 está duplicado **6 veces** (`:63-70`, `:78-85`, `:93-100`, `:108-115`, `:123-130`, `:138-145`).
- `getHome` (`:168-188`) implementa política de fallback (servir snapshot cacheado), re-consulta storage en el `catch` y reclasifica errores **olfateando el texto del mensaje** (`:183`: `String(error.message||'').includes('token') ? 401 : 502`) — frágil y en la capa de transporte.
- `getUserAndToken` (`:21-27`) duplica la resolución de identidad (`req.sessionUser?.id || req.user?.id`) que `requireSession` ya garantizó.

**Recomendación:** casos de uso en capa de aplicación; un `errorMapper` único que traduzca `ExternalApiError`/`OAuthError` → HTTP; controllers de 3 líneas.

#### S8 · MEDIA — `types.ts` mezcla capas
`server/src/types.ts` contiene: dominio (`UserAccount`, `ResourceAmount`), transporte (`AuthenticatedRequest extends Request`), un helper runtime (`getErrorMessage`) y DTOs externos. SoC violado en el archivo-catch-all.
**Recomendación:** dividir en `domain/`, `http/`, y util de errores.

#### S9 · MEDIA — Contratos duplicados y DRY de infraestructura
- `ExternalProfile` (`services/craftworldExternalApi.ts:23`) vs `CraftworldExternalProfile` (`types.ts:36`): dos familias tipando los mismos datos.
- `readJson` duplicado con variantes en `craftworldExternalApi.ts:162` y `craftworldOauth.ts:85`.
- `userStorage.ts`: el shape create/update de Prisma está repetido **3 veces** (`:43-74` en dos variantes, `:121-159`).

#### S10 · MEDIA — Mutación in-place de la entidad de dominio
`services/craftworldTokenService.ts:34-40` muta `user` recibido por referencia y luego persiste; `craftworldHomeService.ts:93-97` hace otra escritura aparte. Si una persistencia falla, el objeto en memoria diverge de la DB (y el request en curso usa tokens no persistidos).
**Recomendación:** el caso de uso devuelve una entidad nueva; una sola operación de persistencia.

#### S11 · BAJA — Código muerto
`userStorage.getUsers`/`saveUsers` (`:113-160`) y **todo** `storage/matrixCacheStorage.ts` no tienen consumidores (grep verificado). Además `db/migrateLegacyJson.ts:62-76` accede `prisma.matrixCache` directamente, burlando el storage (muerto) que decía encapsularlo.

#### S12 · BAJA — Inconsistencias menores
- `migrateLegacyJson.ts:5` lee `process.env.DATA_DIR` directo en vez de `env` (que ya valida).
- `auth.controller.ts:246` re-parsea cookies con regex manual cuando `parseCookies` ya existe en `auth/session.ts:36`.
- `app.ts:60-66` acopla SPA + API en un proceso — deliberado para Docker/HF Spaces; documentar como decisión.

---

### 3.2 Client — hallazgos

#### Positivos (a preservar)
- Estructura `modules/<feature>/{components,hooks,services,data,types}` con barrels `index.ts`.
- TanStack Query como mecanismo único de server-state con query keys compartidas (`useCraftworldQueries.ts`) — dedup real del endpoint `/home` entre módulos.
- `store/useAppStore.ts` es **enfozado y correcto** (favoritos/moneda/filtro, `partialize` bien aplicado): no es un god-store.
- Solo 3 `as any` reales y cero `@ts-ignore` en ~420 archivos.
- `services/financial/pricingService.ts` es ejemplar: política de redondeo, epsilon, Kahan, margin vs markup documentados — fuente única de verdad financiera.
- 24 suites de tests co-localizadas junto a sus servicios.

#### C1 · ALTA — Efectos secundarios globales encadenados por import
`priceService.ts:163` → `import './priceService-auto-init'` → `priceService-auto-init.ts:6` ejecuta `initializeAdvancedPriceSystem()` **al cargar el módulo** → `advancedPriceIntegration.ts:122-129` arranca:
1. `PriceSyncAgent.start()` con `setInterval` de 30s (`advancedPriceSyncAgent.ts:90`),
2. otro `setInterval` de 120s (`advancedPriceIntegration.ts:70`),

ninguno limpiado jamás (y duplicados en dev por `React.StrictMode`). Cualquier consumidor de `priceService` — incluidas las **suites de tests** — dispara el arranque del "sistema avanzado". Violación de SoC + acoplamiento temporal oculto + contaminación de consola.

#### C2 · ALTA — Clúster `advanced*`: especificación no funcional (YAGNI)
8 archivos (~1000 líneas): `advancedPriceSyncAgent`, `advancedPriceIntegration`, `advancedAutoUpdaterService`, `advancedGameDataAgent`, `advancedPoolDataAgent`, `advancedPriceMergerAgent`, `advancedPriceHistoryTracker`, `advancedAlertAgent` + `priceService-auto-init`. Evidencia de que es andamiaje vacío:
- `advancedPriceSyncAgent.ts:152-163`: `fetchPoolData()`/`fetchGameData()` → `return null` con comentarios "Placeholder".
- `advancedAutoUpdaterService.ts:61`: `const staticPrice = 2487.58; // Esto se leería del archivo real`.
- `advancedAutoUpdaterService.ts:103-107`: `applyToPriceFile()` es un `console.log` stub.
- `advancedPriceIntegration.ts:53`: reporta `agentsActive: 7` sin medir nada.

No produce ningún efecto útil: precios reales fluyen por `roninPoolsService` + `extractPriceMap` (que sí funcionan). **Candidato a eliminación por Strangler Fig inverso** (§5, Fase 2): 1 línea para desactivar, un commit para borrar.

#### C3 · ALTA — 18 acoplamientos módulo→módulo a internos
Detalle en §2.2. Los barrels existen pero son `export *` sin curar (`profitability/index.ts` re-exporta 26 módulos incluyendo componentes y modales completos), así que no hay superficie de contrato real: todo es público por defecto y los consumidores llegan por camino profundo igualmente.
**Recomendación:** extraer el dominio compartido a `shared/` (Fase 4) y curar los barrels a exports explícitos.

#### C4 · ALTA — `FactoryDataRow` duplicado (el tipo central del dominio)
Definiciones idénticas en `services/factoryData.ts:1-29` y `services/craftworldCalculations.ts:27-55`. Riesgo de deriva estructural silenciosa en el modelo de datos más consumido de la app. Además, `craftworldCalculations.ts:342` tiene un `import` **a mitad de archivo** (funciona por hoisting; higiene).
**Recomendación:** una sola definición; el resto importa.

#### C5 · MEDIA — Dependencias invertidas shared→feature
- `services/roninPoolsService.ts:1` importa `ChartPoint/ChartSeriesData/Timeframe` de `modules/resources/types`.
- `src/types.ts:1` importa `InventoryData` de `modules/home/types`.

La capa compartida depende de features: si se elimina o refactoriza un módulo, se rompe el shared (efecto inverso al esperado).

#### C6 · MEDIA — DTO débil que fuerza `as any` en los consumidores
`CraftworldHomePayload` (`src/types.ts:150-194`) es todo-opcional con uniones ambiguas (`inventory?: InventoryData | CraftworldResourceBalance[]`) y no garantiza dónde vive `workshop`. Resultado: `home as any` en `useUpgradeAdvisor.ts:36` y `useCalculator.ts:39`, con olfateo dual-shape (`rawHome?.craft?.workshop || rawHome?.craftWorld?.workshop`) — el tipo no se puede confiar, así que se desactiva.
**Recomendación:** un normalizador/ACL único (`toHomeSnapshot()`) que produzca un DTO discriminated y garantizado; los hooks consumen ese snapshot.

#### C7 · MEDIA — Formatters triplicados con divergencia sutil
- `utils/formatters.ts:7-18` — `formatCompactNumber` (umbral k = 10 000, locale indefinido) + alias `formatCompact`.
- `modules/encyclopedia/utils/formatters.ts:1-17` — `formatCompact` (umbral k = 1 000, locale `en-US`).
- `modules/home/utils/formatters.ts:1-2` — `displayNumber`.

Mismo nombre, semántica distinta: exactamente el tipo de duplicación que produce bugs de presentación difíciles de rastrear.

#### C8 · MEDIA — Contratos client↔server triplicados manualmente
Los mismos datos del juego tienen 3 familias de tipos: server `External*` (`craftworldExternalApi.ts`), server `CraftworldExternal*` (`types.ts`) y client `Craftworld*` (`client/src/types.ts`). Sin fuente única, cada cambio del contrato exige 3 ediciones coordinadas.

#### C9 · MEDIA — Token de sesión en localStorage + URL (espejo de S3)
`services/api.ts:16-21` captura `?token=` de la URL a `localStorage` y `:24-31` lo reenvía como `Bearer`. localStorage es legible por cualquier XSS; la cookie HttpOnly ya bastaba.

#### C10 · MEDIA — `factoryData.ts` mezcla runtime de producción con scaffolding de tests
`:415-441`: `new Function('mod', 'return import(mod)')` para importar `node:fs`/`node:path` y buscar archivos en disco cuando no hay `window` — branch de Node.js dentro del módulo del navegador. Además `:382-409` (`ensureBaseResourceRows`) hardcodea fórmulas del juego (`1500 × 1.054^(lvl-1)`, `lvl × 500`) — números mágicos de dominio en un loader de infraestructura.

#### C11 · MEDIA — `priceService.ts` mezcla datos estáticos + política + merge
`DEFAULT_MARKET_PRICES` (`:53-109`) embebido en un servicio, con historial de ediciones manuales en comentarios (`:107` `// ACTUALIZADO: Precio real del juego…`). La política de frescura (2h) y el merge de fuentes viven en el mismo archivo que el dataset. El patrón correcto ya existe en el proyecto: `modules/*/data/*.ts`.

#### C12 · BAJA — DX y arranque
- `client/package.json` `test`: enumera **24 rutas de test a mano** + hack de `package.json` escrito en `dist-tests` en runtime — añadir un test exige editar el script.
- `App.tsx:63` precarga `fetchRoninPoolsData()` en un `useEffect` del componente raíz (bootstrapping en el router) y `App.tsx:10-32` importa las ~24 páginas sin `React.lazy` (sin code-splitting); la lógica de tema (`:38-60`) vive inline en el mismo `useEffect`.

---

## 4. Target Architecture

Pragmática para un monolito modular SPA+BFF. **No** se recomienda DDD completo con agregados (el dominio es cálculo funcional sobre datos read-only del juego) ni microservicios (un solo equipo, un solo deployment). El objetivo es: **dominio compartido explícito, contratos con fuente única, y server hexagonal-light.**

### 4.1 Server objetivo

```
server/src/
├── domain/                  # UserAccount, TokenSet, errores de dominio — cero imports de express/prisma/fetch
│   └── errors.ts
├── application/             # Casos de uso puros, testeables con adapters fake
│   ├── ports.ts             # interfaces: UserRepository, CraftWorldGateway, OAuthSessionStore, TokenVault
│   └── usecases/            # GetHomeData (absorbe fallback/cache), CompleteOAuthLogin, RefreshCraftWorldToken, Logout
├── infrastructure/          # Adaptadores concretos
│   ├── prismaUserRepository.ts
│   ├── prismaOAuthSessionStore.ts
│   ├── httpCraftWorldGateway.ts        # hoy craftworldExternalApi
│   ├── encryptedTokenVault.ts         # S5: AES-256-GCM
│   └── oauth/craftworldOauth.ts
└── http/                    # Capa de transporte (Express confinada aquí)
    ├── routes/  ├── controllers/ (thin: 3 líneas por handler)
    ├── middlewares/  ├── schemas/ (Zod)
    └── errorMapper.ts       # ExternalApiError/OAuthError → status+body (una sola vez)
```

**Contratos de puertos (sketch):**

```ts
// application/ports.ts
export interface UserRepository {
  findById(id: string): Promise<UserAccount | null>;
  findByCraftWorldUid(uid: string): Promise<UserAccount | null>;
  save(user: UserAccount): Promise<UserAccount>;        // upsert único (S12)
  saveTokens(id: string, tokens: TokenSet): Promise<void>;
  saveHomeCache(id: string, snapshot: HomeSnapshot | null): Promise<void>;
}
export interface CraftWorldGateway {
  fetchProfile(t: string): Promise<ExternalProfile>;
  fetchCraftWorld(t: string): Promise<ExternalCraftWorld>;
  // ... fetchCraft/Exchange/Onchain/Inventory/Purchases/PriceList/DynoCycle
}
export interface OAuthSessionStore {
  create(s: OAuthSessionInit): Promise<void>;
  consumeOnce(state: string): Promise<OAuthSession | null>;  // atómico (S6)
}
```

### 4.2 Client objetivo

```
client/src/
├── app/                      # main.tsx, App.tsx (solo routing), providers, bootstrap/ (tema, preload, error handlers)
├── shared/
│   ├── api/                  # api.ts, queryClient.ts, queries/useCraftworldQueries.ts
│   ├── dto/                  # HomeSnapshot normalizado (ACL de C6) + tipos chart (fuga de C5)
│   ├── domain/               # craftworldCalculations, pricingService, valueChainCalculator,
│   │                         # modifiers (workshop/mastery/boost), cycleAdjuster, factoryTimers helpers,
│   │                         # FactoryDataRow (único, C4), formatters unificados (C7)
│   └── data/                 # factoryData (loader puro, sin branch Node — C10), roninPools,
│                             # priceCatalog.ts (DEFAULT_MARKET_PRICES como datos — C11)
└── modules/<feature>/        # components + hooks + services de orquestación local
                              # REGLA: solo importan app/ y shared/; módulo→módulo prohibido
                              #        (excepto tipos vía barrel explícito, temporalmente)
```

### 4.3 Contratos compartidos

`packages/contracts/` (workspace npm) con `External*` y `HomeSnapshot`: server importa para tipar el gateway; client importa para tipar `api.ts`. Elimina las 3 copias (C8). Si no se quiere un paquete nuevo, el mínimo viable es un archivo compartido por convención + re-exports de compatibilidad.

---

## 5. Plan de Refactorización (incremental, no destructivo, verificable)

Cada fase compila y pasa los 98 tests al terminar. Orden por riesgo/beneficio: seguridad primero (es lo que puede quemar producción), luego la eliminación de mayor ganancia/menor costo (clúster advanced*), después DRY de tipos, y por último la reestructuración estructural.

### Fase 0 — Baseline y salvaguardas (½ día)
1. Branch dedicada. Correr `npm run test --workspace server` + `--workspace client` (98 tests) y `tsc -b`: capturar resultados.
2. Capturar en dev: ruido de consola del clúster advanced* (evidencia pre/post Fase 2) y tamaño de bundle (`vite build`).
**Verificación:** todos los tests verdes en la branch base.

### Fase 1 — Endurecimiento de seguridad del server (1–2 días, sin cambios de contrato de API)
1. **S2 CORS**: allow-list real en `app.ts` (rechazar orígenes desconocidos).
2. **S4**: `SESSION_SECRET` requerido en production (sin default; fail-fast).
3. **S1**: `quick-login` tras `ENABLE_QUICK_LOGIN` (default off; on solo en dev).
4. **S3**: eliminar `?token=` del redirect de callback (`auth.controller.ts:203`); dejar la cookie HttpOnly como único canal.
5. **S5**: `encryptedTokenVault` (AES-256-GCM, key de env) envolviendo la persistencia de tokens; migración de lectura transparente del formato legacy.
**Verificación:** tests existentes + nuevos tests de sesión/CORS/quick-login-disabled; despliegue canary.

### Fase 2 — Strangler Fig inverso: retirar el clúster advanced* (½ día)
1. **Commit 1:** eliminar la línea `import './priceService-auto-init'` de `priceService.ts:163`. Los 8 archivos siguen en el repo pero dejan de ejecutarse.
2. **Commit 2:** borrar los 8 archivos + `priceService-auto-init.ts` tras verificar con grep que no quedan referencias.
**Verificación:** grep de `advanced|priceService-auto-init|globalPriceSystem` = 0 matches; tests verdes; consola limpia (2 timers y ~15 logs por ciclo desaparecen).

### Fase 3 — Unificar tipos y contratos (1 día)
1. **C4:** `FactoryDataRow` se define una sola vez (en el futuro `shared/domain`; transitoriamente en `factoryData.ts`); `craftworldCalculations.ts` lo importa (y su import a mitad de archivo sube al tope).
2. **C5:** mover `ChartPoint/ChartSeriesData/Timeframe` de `modules/resources/types` a shared; `InventoryData` sale de `modules/home/types` hacia `shared/dto`.
3. **C8:** crear `packages/contracts` con `External*` + `HomeSnapshot`; server y client importan de ahí con re-exports de compatibilidad en sus `types.ts` (Strangler: nada se rompe hasta que se limpia).
**Verificación:** `tsc -b` en ambos workspaces; grep de `export type FactoryDataRow` = 1 match; tests verdes.

### Fase 4 — Extraer el kernel compartido del client (2–3 días)
1. Mover a `shared/domain` (con re-export de compatibilidad desde su ubicación original, de modo que los 18 imports profundos siguen compilando):
   - `cycleAdjuster.extractPlotFactoriesMap` (desde `profitability`),
   - `factoryTimersService.calculateWorkerReductionFactor` y helpers (desde `timers`),
   - `pricesAndProfitabilityService.calculatePriceChanges` (desde `profitability`),
   - `baseCostCatalog.RESOURCE_METADATA` + `formatCoin` (desde `baseCost`),
   - `authService.isUserAuthenticated` (desde `auth`).
2. Reescribir los 18 imports (§2.2) para apuntar a shared — cambio mecánico guiado por grep.
3. Curar barrels: `export *` → exports explícitos por módulo.
4. **C6:** crear `toHomeSnapshot()` (ACL) que normalice `inventory` (discriminated union) y resuelva `craft?.workshop || craftWorld?.workshop` una sola vez; eliminar los 3 `as any`.
5. **C7:** consolidar los 3 formatters en `shared/domain/formatters.ts` con una decisión documentada sobre umbrales/locale; los antiguos re-exportan.
**Verificación:** grep del patrón de import cruzado = 0; `tsc -b`; tests; revisión visual de las pantallas afectadas (advisor, calculator, compare, tradingBot).

### Fase 5 — Server hexagonal-light (2–3 días)
1. Introducir `application/ports.ts` + adapters envolviendo el código existente (los servicios actuales se convierten en adapters casi sin cambios: `craftworldExternalApi` → `httpCraftWorldGateway`; `userStorage` → `prismaUserRepository`).
2. Extraer casos de uso: `GetHomeData` (absorbe la política de fallback y el mapeo de estado de `priceList` de `getHome`), `CompleteOAuthLogin` (absorbe `handleCallback`), `RefreshCraftWorldToken` (sin mutación in-place, **S10**).
3. `errorMapper` único (mata la duplicación ×6 de **S7**); controllers de 3 líneas.
4. **S6:** `consumeOnce` atómico con `deleteMany` + count.
5. **S11/S12:** eliminar código muerto (`getUsers/saveUsers`, `matrixCacheStorage`) y consolidar los shapes de upsert.
**Verificación:** contract tests de los casos de uso con adapters fake (sin DB ni red — objetivo real de la inversión); tests de integración existentes; smoke manual del flujo OAuth.

### ADRs (registros de decisión)

- **ADR-001 — Retiro del clúster advanced*.** Contexto: 8 archivos de agentes de precios con stubs (`return null`, precio hardcodeado 2487.58) que arrancan 2 `setInterval` globales por import side-effect. Decisión: eliminar (YAGNI); los precios reales ya fluyen por `roninPoolsService` + `extractPriceMap`. Consecuencias: −1000 LOC, consola limpia, tests sin efectos ocultos.
- **ADR-002 — Paquete `contracts` compartido.** Fuente única para `External*`/`HomeSnapshot` entre server y client; elimina 3 copias manuales.
- **ADR-003 — Kernel compartido del client.** `cycleAdjuster`, helpers de timers, `calculatePriceChanges`, catálogo baseCost y `isUserAuthenticated` se promueven de features a `shared/domain`; prohibición de módulo→módulo (excepto tipos vía barrel explícito).
- **ADR-004 — Server hexagonal-light.** Puertos + casos de uso + adapters; Express confinado a `http/`. No DDD completo: el dominio es cálculo, no hay invariantes transaccionales que justifiquen agregados.
- **ADR-005 — Endurecimiento del ciclo de sesión.** quick-login solo dev, CORS allow-list, sin token en URL, secret requerido, tokens cifrados en reposo.
- **ADR-006 — SPA+BFF en un proceso (confirmación).** El acoplamiento app.ts/API es deliberado por el despliegue Docker/HF Spaces; se documenta y se mantiene.

---

## 6. Matriz de priorización

| # | Hallazgo | Severidad | Esfuerzo | Fase |
|---|---|---|---|---|
| S1 | quick-login sin autenticación | **Crítica** | Bajo | 1 |
| S2 | CORS aprobadotodo con credenciales | Alta | Bajo | 1 |
| S3 | Token de sesión en URL | Alta | Bajo | 1 |
| S4 | SESSION_SECRET con default | Alta | Bajo | 1 |
| S5 | Tokens en claro en SQLite | Alta | Medio | 1 |
| C1/C2 | Clúster advanced* + side-effects de import | Alta | Bajo | 2 |
| C4 | `FactoryDataRow` duplicado | Alta | Bajo | 3 |
| C3 | 18 acoplamientos módulo→módulo | Alta | Medio | 4 |
| C5–C11 | Inversiones shared→feature, DTO débil, formatters, contratos ×3, token en localStorage, runtime/test mezclados, datos en servicio | Media | Medio | 3–4 |
| S6, S7, S8, S9, S10 | Atomicidad OAuth, lógica en controllers, types.ts mixto, DRY, mutación in-place | Media | Medio | 5 |
| S11, S12, C12 | Código muerto, inconsistencias, DX de tests/arranque | Baja | Bajo | 5 |

**Deuda deliberadamente aceptada (no recomendada ahora):** microservicios, agregados DDD, CQRS/eventos, code-splitting total del router (C12 se deja como optimización posterior a la consolidación estructural).

---

*Auditoría realizada en modo de solo lectura. Ningún archivo del proyecto fue modificado.*
