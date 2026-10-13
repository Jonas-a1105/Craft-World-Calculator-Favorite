# INFORME DE AUDITORÍA UI/UX + ACCESIBILIDAD WCAG 2.2 AA
## Craft Companion — `Craft-Companion/client` (React 18 + Vite + Tailwind v3.4.13 + react-router)

**Fecha:** 12/10/2026 · **Auditor:** Auditor Principal de UI/UX & Accesibilidad (WCAG 2.2)
**Alcance:** 25 vistas/páginas, ~185 archivos leídos y verificados (design system, chrome global, flujos de auth/landing/settings/splash, y 17 módulos de datos). Contrastes calculados con luminancia relativa WCAG hex-sobre-hex. **No se modificó ningún archivo.**
**Metodología:** Heurísticas Nielsen (10), WCAG 2.2 AA (contraste, teclado, targets, semántica), densidad informativa/carga cognitiva, tratamiento de datos reales, matriz de severidad CRÍTICO/ALTO/MEDIO/BAJO.

---

## RESUMEN EJECUTIVO

| Severidad | Hallazgos | Descripción |
|---|---|---|
| **CRÍTICO** | **9** | Bloquean teclado/lector de pantalla, destruyen datos o mienten sobre datos financieros |
| **ALTO** | **~70** | Violaciones WCAG AA obligatorias, pérdida de trabajo, estado del sistema falso |
| **MEDIO** | **~75** | Inconsistencias visuales, feedback ausente, ambigüedad que ralentiza |
| **BAJO** | **~40** | Detalles cosméticos, clases Tailwind inexistentes, i18n parcial |

**Conclusión general:** la aplicación tiene un acabado visual sobresaliente (dark theme OLED coherente, micro-interacciones ricas) pero **es estructuralmente inoperable para usuarios de teclado y de lectores de pantalla**: se eliminó el foco visible de forma deliberada y sistemática (0 `:focus-visible` en todo el código, 127 `outline-none`), la navegación principal es un `div` con `onClick`, y un tercio de los controles interactivos (filas de precios, tarjetas de inventario, cabeceras de rentabilidad) son `div` sin semántica. En paralelo, existe un patrón transversal de **degradación engañosa**: cuando la API falla, la app muestra datos hardcodeados (precios, wallets, deltas, gráficas) sin etiquetarlos como referencia, violando la heurística #1 de Nielsen y poniendo en riesgo decisiones económicas del usuario.

### Los 10 hallazgos más graves (orden de impacto)
1. **[CRÍTICO]** Navegación principal (FloatingDock) con `div onClick` — la app no es navegable por teclado.
2. **[CRÍTICO]** `button{outline:none}` global + 127 anuladores de foco → foco invisible en el 100% de la app (WCAG 2.4.7/2.4.11).
3. **[CRÍTICO]** Precios/inventario/rentabilidad: filas completas `div onClick` — funciones centrales inaccesibles (WCAG 2.1.1 nivel A).
4. **[CRÍTICO]** `AdvisorList` trunca a 40 resultados en silencio y `BaseCost` "Reset All" sin nombre accesible ni confirmación (pérdida de datos).
5. **[CRÍTICO]** Validación silenciosa en Trading Bot: submit que "no hace nada" con valores inválidos.
6. **[CRÍTICO]** Contraste de datos financieros: valores OIL **1.64:1**, MUD **1.96:1**, CEMENT **2.25:1** — cantidades literalmente invisibles (WCAG 1.4.3).
7. **[ALTO]** Datos falsos presentados como vivos: ticker COIN con fallbacks hardcodeados, `DEFAULT_MARKET_PRICES` fusionado sin etiquetar, badge "Live 24/7" hardcodeado, gráficas sintéticas sin etiqueta "simulado".
8. **[ALTO]** Landing: pricing incoherente ($4.99 anual vs "$49" mensual hardcodeado), sección "Developer Suite" con tabs que no cambian nada y botones sin `onClick`, testimonios/avatares/estrellas fabricados.
9. **[ALTO]** Acciones destructivas sin confirmación en 6 módulos (reset de simulaciones, "Max Todos", eliminar reglas de watchlist, reset de niveles).
10. **[ALTO]** Splash forzado de 6.1 s con audio sin control de pausa/mute en cada login (WCAG 1.4.2/2.2.2) + 0 `prefers-reduced-motion` en toda la app pese a ~15 animaciones infinitas.

---

# SECCIÓN A — DEFECTOS SISTÉMICOS (aplican a TODA la aplicación)

**A1. [CRÍTICO] `styles/global.css:531` (`button{outline:none}`) + `global.css:513` (inputs) + 127 instancias de `outline-none`/`focus:outline-none` + 0 `:focus-visible` en todo `src/`** → El indicador de foco del navegador se elimina de forma global y deliberada; ningún componente define uno propio visible. → Un usuario de teclado no puede saber dónde está: completar formularios, navegar el dock o usar modales es operar a ciegas. WCAG 2.4.7 (AA) y 2.4.11/2.4.13 (AA 2.2). → **Corrección exacta:** eliminar `outline:none` de la regla base y añadir en `global.css`:
```css
:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: 2px solid var(--color-blue); /* #38bdf8 ≈ 7:1 sobre #141415 */
  outline-offset: 2px;
  border-radius: inherit;
}
```
y retirar progresivamente los `focus:outline-none` (127) o anularlos con `focus-visible:outline`.

**A2. [CRÍTICO] `components/layout/nav/components/FloatingDock.tsx:102-113`** → Los 15 slots de la navegación principal son `<div onClick>` con `title`; sin `role`, `tabIndex`, teclado ni `aria-current`. El componente accesible `NavbarNavItems.tsx` (basado en `<Link>`) existe pero está **muerto** (exportado, jamás importado por `Navbar.tsx`). → La navegación principal es inalcanzable por teclado y no anuncia la página activa (WCAG 2.1.1 nivel A, 4.1.2). → Sustituir cada slot por `<button type="button" onClick={...} aria-current={active ? 'page' : undefined} aria-label={label}>`; el menú móvil queda oculto para teclado sin esto.

**A3. [ALTO] 0 `aria-live`/`role="status"`/`role="alert"` en componentes propios** → Los toasts propios (`SignInToast.tsx:9`, `SettingsStatusToast.tsx:16`), los resultados de cálculos, los estados vacíos y las actualizaciones de precios/timers nunca se anuncian. (Los toasts de la librería Sileo sí llevan `aria-live=polite` — verificado en `node_modules/sileo`.) → El usuario de lector de pantalla nunca sabe que algo cambió (WCAG 4.1.3). → Añadir `role="status"` a contenedores de resultado/estado y `role="alert"` a errores inline.

**A4. [ALTO] `index.html:2` — `lang="es"` hardcodeado** y el `LanguageProvider` (`utils/i18n.tsx:419-456`) nunca actualiza `document.documentElement.lang`, pese a soportar EN por defecto según `navigator.language`. → Un usuario inglés escucha todo el UI con voz de síntesis en español (WCAG 3.1.1 nivel A). → En `setLanguage`: `document.documentElement.lang = lang`.

**A5. [ALTO] 0 `prefers-reduced-motion` en toda la app** con ≥15 animaciones infinitas: marquee de testimonios (`LandingImpact`), bento auto-ciclante (`LandingRollingBentoSection`), marquee de baseCost, `animate-ping` de ticker/badges, `flameFlicker`, `border-beam-rotate`, `dock-pop`. → Riesgo vestibular y consumo de CPU/batería permanente. → Envolver toda animación no esencial en `@media (prefers-reduced-motion: no-preference)`.

**A6. [ALTO] Modales sin gestión de foco (patrón global).** Solo 3 de ~8 modales tienen `role="dialog"` (`CookiePreferencesModal:106`, `LandingNavbar:109`, `CoinPriceModal:58`, `BaseCostSettingsBar:338`); **ninguno** atrapa el foco, lo mueve al abrir ni lo devuelve al cerrar; `CookiePreferencesModal` ni siquiera cierra con Escape. `CoinPriceModal` no enlaza `aria-labelledby` y su botón de enlace externa (línea 88-103) es icon-only sin `aria-label`. → El foco queda detrás del overlay y se pierde al cerrar (WCAG 2.1.2/2.4.3). → Implementar un único `useModalA11y(escape, trap, restore)` y aplicarlo a todos.

**A7. [ALTO] Contraste del foco y de estados.** `Input.tsx:31`/`Select.tsx:29` usan `focus:ring-1 ring-white/20`: blend ≈ `#444444` sobre `#151518` = **1.87:1** (<3:1 mínimo para foco). El estado activo del dock (`#484b56` vs `#2e3037` inactivo sobre `#1c1c20`) = 1.95:1/1.29:1 — activo e inactivo casi indistinguibles; el punto activo mide 4-6 px. → WCAG 2.4.11/1.4.11/1.4.1. → Rings sólidos `focus-visible:ring-2 ring-sky-400` y marca activa ≥3:1 + texto.

**A8. [ALTO] Microtipografía y microtargets sistémicos.** Textos de 9-11px en badges, labels y ejes (`Badge.tsx:40` 11px, `OLEDInventoryPanel.tsx:233` 9px, `ribbon-stat-lbl` `global.css:316` 0.6rem≈9.6px, masterpiece 9px). Targets <24px: steppers 20px (`FactoryUpgradeCard:80`, `EfficiencyCard:116`), botones timeframe ≈16px (`ResourceInteractiveChart:148`), flechas de nivel 20px (`ExecutiveBarChart:163`), ✕ de limpiar ≈16px (`CategoryTabsBar:114`). → WCAG 1.4.3 no se puede cumplir con 9px y WCAG 2.5.8 falla por doquier. → Mínimo 11px en texto de datos, targets ≥24px (ideal 40px como pide el estándar de la casa).

**A9. [ALTO] Etiquetas `slate-500`/`zinc-500` (#64748b/#71717a) sobre fondos oscuros = 3.6-3.9:1** — 20+ instancias verificadas en 8 módulos (profitability, compare, encyclopedia, advisor, masterpiece, powerSimulator, baseCost, inventory). → Fallo masivo de WCAG 1.4.3 justo en los nombres de las métricas. → Sustituir por `slate-400`/`zinc-400` (6.7-7.2:1). Verificado con cálculo de luminancia.

**A10. [MEDIO] 7 familias tipográficas** (`index.html:55`: Orbitron, Outfit, JetBrains Mono, Press Start 2P, Tiny5, VT323 + TheImpostor local en `variables.css:36-39`). → Sobrecarga cognitiva, peso de carga, jerarquía inconsistent. → Reducir a 2-3 y mapear las retiradas.

**A11. [MEDIO] i18n de cobertura parcial.** `utils/i18n.tsx:241` define un "dictionaryTranslation" de ~130 cadenas; el resto de la app usa `language === 'es' ? ... : ...` disperso en 60+ componentes, con resultado: `baseCost` 100% español, `tradingBot` 100% español, "Dark Mode" sin traducir (`NavbarUserDropdown:258`), "ACTIVITY" (`ResourceActivityList:13`), "Nv." en advisor EN, "ANALIZADOR DE CADENA INDUSTRIAL" en modo EN. → Experiencia rota según idioma (consistencia Nielsen #4). → Centralizar todas las cadenas en `translations`.

**A12. [MEDIO] Sin skip-link.** Navbar fija (z-40) + dock inferior (z-50) + 15 slots: el teclado debe recorrer todo el chrome antes del contenido; no existe "Saltar al contenido" en ninguna vista. → Añadir `<a href="#main" class="skip-link">` como primer elemento de `Layout.tsx:23`.

**A13. [BAJO] Scrollbars de 5px** (`global.css:63-66`) difíciles de agarrar; clase `custom-scrollbar` referenciada en `Dropdown.tsx:110` pero jamás definida (solo existe `modal-custom-scroll`); tablas en `overflow-x-auto` sin `tabIndex=0` (ej. `ValueChainBreakdownTable:27`).

---

# SECCIÓN B — FLUJOS CRÍTICOS

## B.1 Autenticación (`modules/auth`, `ProtectedRoute.tsx`, `pages/SignIn.tsx`)

**B1.1 [ALTO] `ProtectedRoute.tsx:51-53`** → `authenticated===null` renderiza un `<div>` en negro puro: pantalla en blanco total sin spinner ni texto durante la verificación de sesión (getMe). → Con red lenta el usuario cree que la app está rota (visibilidad de estado, Nielsen #1). → Skeleton mínimo o spinner centrado con `role="status"`.

**B1.2 [MEDIO] `ProtectedRoute.tsx:55` + `hooks/useSignIn.ts:26`** → `Navigate to="/signin"` sin `state={{from:location}}` y post-login redirige siempre a `/home`: los deep-links a páginas protegidas nunca devuelven al usuario a su destino tras iniciar sesión. → Pasar `location` y `nav(state?.from ?? '/home')`.

**B1.3 [MEDIO] `useSignIn.ts:96-107`** → El campo vacío dispara **doble toast simultáneo** (sileo `notifyWarning` + `SignInToast` propio) del mismo mensaje; el error OAuth genera a la vez alert inline + toast (líneas 32-35). → Feedback redundante y ruidoso. → Un solo canal por evento.

**B1.4 [MEDIO] `useSignIn.ts:92-111`** → `quickLogin` acepta cualquier cadena como UID sin validación de formato/longitud; "hola mundo" crea una sesión de invitado con datos vacíos. → Estado engañoso (parece login real). → Validar `^[a-zA-Z0-9_]{3,24}$` con `aria-invalid` + mensaje.

**B1.5 [ALTO] `SignInProviderGrid.tsx:19-40` + `useSignIn.ts:88-90`** → "Modo Invitado" tiene el mismo peso visual que OAuth y no aclara que crea una sesión demo (`craft_guest`) ni cómo salir de ella. → Jerarquía del CTA real diluida; usuarios atrapados en modo demo. → Botón secundario atenuado + etiqueta "demo" + "Salir del modo invitado" en el menú.

**B1.6 [MEDIO] `SignInErrorAlert.tsx:12`** → Error inline sin `role="alert"` y el input (`SignInAccordionForm.tsx:38-50`) sin `aria-invalid`/`aria-describedby` que lo vincule. → WCAG 3.3.1/3.3.3. → `role="alert"` en el alert, `aria-describedby="signin-error"` en el input.

**B1.7 [MEDIO] `SignInAccordionForm.tsx:59-74`** → El botón principal no muestra spinner ni `aria-busy` durante `isLoading` (solo se desactiva). → Sin feedback de proceso. → Reutilizar el spinner de `ui/Button.tsx:66` + `aria-busy`.

**B1.8 [BAJO] `SignInToast.tsx:9`** → Toast fijo sin `role="status"` ni `aria-live` y con punto decorativo `animate-pulse` sin `aria-hidden`.

## B.2 Splash (`modules/splash`)

**B2.1 [ALTO] `SplashScreen.tsx:69-75` + `useSignIn.ts:68`** → Splash forzado de **6100 ms en cada login** sin botón de saltar (la prop `allowSkip` está declarada y nunca usada), con audio de arranque automático (`splashAudio.ts:54-118`) **sin control de pausa/mute** (WCAG 1.4.2 AA: audio >3 s requiere control) y sin `prefers-reduced-motion` en canvas de partículas/lottie. → Retraso obligatorio en el flujo más frecuente de la app. → Botón "Saltar" visible + toggle de sonido persistente + respetar `?to=` al saltar.

**B2.2 [MEDIO] `SettingsAppearanceCard.tsx:217-223`** → "Ver Splash" reproduce audio en el `onClick` del Link sin advertencia. → Sonido inesperado. → Ícono de altavoz + prefijo "con sonido".

## B.3 Landing (`modules/landing`)

**B3.1 [CRÍTICO-veracidad] `LandingPricing.tsx:18-19`** → `growthPrice = isAnnual ? plans.growth.price : '$49'` y `scalePrice … : '$99'` **hardcodeados**: el toggle mensual muestra $49/$99 mientras el anual (de `landingContent.ts:132,149`) es $4.99/$14.99 — una relación 10× incoherente con la insignia "-20%". Además ninguna función "Pro" (OAuth, timers, alertas) está realmente gated y los 3 CTA van a `/signin` sin flujo de pago. → El dato económico de la página pública es matemáticamente falso. → Derivar mensual de anual (`annual/0.8`) o eliminar el toggle; alinear claims de features con el producto real.

**B3.2 [ALTO] `LandingDeveloperSuite.tsx:9,45-63,197-208,241-251`** → Los tabs actualizan `activeTab` pero **el grid inferior no depende de `activeTab`** (contenido idéntico en las 10 pestañas); los "dropdowns" de filtros son divs estáticos sin `onClick`; el botón "Export [Logs]" **no tiene `onClick`**; la "wave chart" es un path SVG fijo. → Sección que simula un dashboard en vivo 100% decorativo: clics sin respuesta (violación directa de Nielsen #1 y affordance). → Conectar tabs a contenido real o eliminar interactividad falsa; botones muertos → convertir en contenido estático.

**B3.3 [ALTO] `LandingImpact.tsx:26,102-159,182-211` + `LandingHero.tsx:10-14,74-100`** → Testimonios duplicados ×3 en el track (lectores leen todo 3 veces, sin `aria-hidden`), marquee infinito **sin botón de pausa** (WCAG 2.2.2 nivel A), tarjetas `pointer-events-none` (hover muerto), y social proof fabricado: 3 avatares de Unsplash con `alt="Client 1"`, 5 estrellas fijas y métricas inventadas. → Marketing engañoso + foto externa rota si falla la red. → Pausar/mostrar estático, `aria-hidden` en duplicados, sustituir testimonios por reales o eliminar.

**B3.4 [ALTO] `LandingRollingBentoSection.tsx:85-114,180-201,231-254`** → `requestAnimationFrame` con `setProgressPct` **cada frame** → re-render permanente del carrusel 60 fps (CPU/batería); carrusel sin pausa ni control de teclado (WCAG 2.2.2); segmentos de progreso = `div onClick` de 6 px; `onError` de imágenes cae a paisajes aleatorios de Unsplash como si fueran features del producto. → Mover el progreso a animación CSS `@keyframes` + pausa on-hover/focus + `<button>` en segmentos.

**B3.5 [MEDIO] `CookiePreferencesModal.tsx:104-113,244-258,272-294`** → Sin Escape ni foco atrapado; los "tabs" de categorías no tienen `role="tab"`/`aria-selected`; el switch tiene `role="switch" aria-checked` (bien) pero **sin nombre accesible**; y "Aceptar todo" (ámbar, primario) es más prominente que "Guardar preferencias" — patrón de consentimiento sesgado. → Corregir foco/Escape + `aria-label` en switches + igualar jerarquía de acciones.

**B3.6 [MEDIO] `CookiePreferencesModal.tsx:277`** → El texto del enlace de privacidad cambia según la **pestaña activa** en vez del idioma: `activeTab === 'strictly_necessary' ? 'Política de Privacidad completa' : 'Full Privacy Policy'` → en inglés, la primera pestaña muestra español. → Condicionar a `language`.

**B3.7 [MEDIO] `LandingNavbar.tsx:210-251` + `LandingFooter.tsx:80-123`** → Links sociales son placeholders genéricos (`https://x.com`, `https://discord.gg`, `https://github.com`) con `aria-label` que prometen "Discord Community/GitHub Repository". → Links a homepages que no son lo que anuncian. → URLs reales o eliminar.

**B3.8 [MEDIO] `LandingHero.tsx:45-70`** → CTA primario y secundario dirigen AMBOS a `/signin` con idéntico destino; `outline-none` en ambos. → Jerarquía diluida y foco invisible en la conversión principal. → Destino real distinto (p. ej. secundario → #features) + focus ring.

## B.4 Settings (`modules/settings`)

**B4.1 [ALTO] `SettingsAppearanceCard.tsx:54-66,93-105` + `SettingsNotificationsCard.tsx:173-185,403-415` + `NavbarUserDropdown.tsx:262-279`** → Todos los switches son `<button>` sin `role="switch"`, sin `aria-checked` y sin nombre accesible (solo texto visual hermano). → El lector anuncia "botón" sin estado ni función (WCAG 4.1.2). → `role="switch" aria-checked={v} aria-label="Modo oscuro"` etc.

**B4.2 [ALTO] `NavbarUserDropdown.tsx:192-218`** → Filas de wallet para copiar son `div onClick` sin teclado/rol; y con 0 wallets se muestran **wallets fake hardcodeadas** ("Smart Account 0x71C…a89f", "EOA 0x93B…e421", líneas 221-246). → Copiado imposible por teclado + datos inventados que parecen cuentas reales del usuario. → `<button>` + estado vacío honesto ("Sin wallets vinculadas").

**B4.3 [ALTO] `NavbarUserDropdown.tsx:137-154`** → "Cerrar Sesión" (destructivo) es un botón 44×44 adyacente a "Configuración" con idéntico peso visual y **sin confirmación**. → Logout accidental por proximidad. → Separador + confirmación ligera o distancia ≥8px y color de peligro solo en hover.

**B4.4 [MEDIO] `SettingsDataBackupCard.tsx:117-125`** → Textarea de importación sin `<label>` (placeholder como única etiqueta) y `focus:outline-none` (sin foco visible). → WCAG 3.3.2/2.4.7. → `<label htmlFor>` + ring.

**B4.5 [MEDIO] `hooks/useSettings.ts:197-209`** → `navigator.clipboard.writeText(...).then(...)` **sin `.catch`**: si el portapapeles falla (permisos/iframe), no hay feedback alguno y queda una promesa rechazada. → Éxito silencioso o fallo mudo. → `.catch(() => notifyError(...))`.

**B4.6 [MEDIO] `hooks/useSettings.ts:138-160` + `SettingsNotificationsCard.tsx:190-226`** → Si el permiso está `denied`, el botón "Permitir" sigue visible: `requestPermission()` resuelve `denied` al instante sin diálogo → el botón parece roto. → Estado `denied` → "Bloqueado: habilita las notificaciones en la configuración del navegador" sin botón.

**B4.7 [MEDIO] `SettingsStatusToast.tsx:16-19`** → Toast de estado **sin `role="status"`** y con icono de ÉXITO (`CheckCircleBold`) hardcodeado aunque el texto sea `settings.status.failed` o `reset` — el fallo se muestra con check verde. → Semántica invertida. → `role="status"` + icono según tipo.

**B4.8 [MEDIO] `useSettings.ts:92-94` vs `App.tsx:52`** → Defaults de color sólido divergentes: `'#000000'` en el hook vs `'#141415'` en App → al activar "Fondo Sólido OLED" sin elegir color, el fondo y la navbar saltan a negro puro inesperado. → Unificar default `#141415`.

**B4.9 [BAJO] `SettingsAppearanceCard.tsx:110-145`** → Presets de color de 32×32 (<40px) con checkmark esmeralda sobre presets oscuros (contraste del indicador variable) y sin `aria-pressed`. → 40px + `aria-pressed` + check blanco/negro según luminancia del preset.

**B4.10 [BAJO] `SettingsNotificationsCard.tsx:36-56,420-497`** → El "playground" de la librería Sileo (6 botones de prueba + selección de posición/relleno) es tooling de desarrollo expuesto en producción, con textos de demo ("+50,000 monedas depositadas"). → Mover a ruta de debug o etiquetar "Opciones avanzadas".

## B.5 Chrome global (navbar, dock, ticker, footer, 404)

**B5.1 [ALTO] `CoinPriceTicker.tsx:14-16,74-81`** → Fallbacks hardcodeados presentados como cotización viva: `priceUsd ?? 0.0002105`, `h1Change ?? 0.04`, `h24Change ?? -3.38`; indicador de estado solo por color (`animate-ping` ámbar vs verde al 40%). → Con API caída el usuario ve un precio falso como real y el "latido" no se explica. → Badge "Ref." cuando no hay dato + `title`/`aria-label` de estado + `prefers-reduced-motion`.

**B5.2 [MEDIO] `useNavbar.ts:80-85`** → Copiar wallet sin `.catch` en `clipboard.writeText`; confirmación solo visual (check 3.5px por 1.5 s). → → `.catch` + toast.

**B5.3 [MEDIO] `NavbarUserDropdown.tsx:52-60,64-87`** → Botón "Re-link" 28×28 icon-only con `title` (target <40px, nombre accesible débil); avatar 32px en móvil; sin `aria-haspopup/aria-expanded` en el trigger del menú. → 40px + aria-label + estado expandido.

**B5.4 [BAJO] `pages/NotFound.tsx:23-30,109-116`** → Toast de 404 redundante con el mensaje en pantalla; "Página Anterior" con `navigate(-1)` que puede salir de la app si no hay historial. → Quitar toast; `navigate(-1)` con guard `window.history.length > 1`.

**B5.5 [BAJO] `Footer.tsx:10-30`** → Enlaces legales diferenciados solo por hover (`text-slate-400`); correcto pero sin underline en reposo → difícil de identificar como enlace. → `underline-offset` permanente o semántica visual clara.

## B.6 Componentes compartidos

**B6.1 [ALTO] `components/ui/Combobox.tsx:57-71,86-176`** → Sin patrón ARIA (`combobox/listbox/option/aria-expanded/aria-selected/aria-activedescendant`), sin flechas; **Enter en la búsqueda selecciona la primera opción filtrada** en silencio (líneas 122-128) — pulsar Enter para enviar un formulario cambia la selección sin querer; al cerrar, el foco cae al body. → WCAG 2.1.1/4.1.2. → Patrón ARIA APG combobox + Enter solo cierra/accepta opción resaltada + devolver foco al trigger.

**B6.2 [ALTO] `components/Dropdown.tsx:33-42,57-86,115-138`** → Sin Escape, sin ARIA, trigger `focus:outline-none`, estado seleccionado solo por fondo blanco/12% + bold. → Mismo patrón y corrección que Combobox.

**B6.3 [ALTO] `components/OLEDInventoryPanel.tsx:45-82,194-216`** → Colores de monto por recurso: OIL `#334155`=**1.64:1**, MUD `#713f12`=**1.96:1**, CEMENT `#4b5563`=**2.25:1** sobre item `#1c1c20` — los valores de esos recursos son ilegibles; EARTH/STONE 3.4-3.5:1 fallan para texto normal; badge interno "OLED FLAT" expuesto al usuario final; buscador sin label y tabs sin `aria-pressed`; montos 0 sin diferenciación de "sin datos". → Paleta con clamp de luminosidad (mín. 4.5:1) + `aria-label="Buscar recurso"` + `aria-pressed` + "—" para faltantes.

**B6.4 [MEDIO] `components/ui/Table.tsx:14-18,57-70`** → `<th>` sin `scope="col"`, contenedor scroll sin `tabIndex=0`, sin caption accesible. → `scope` + `role="region"` + caption sr-only.

**B6.5 [MEDIO] `components/GameIcon.tsx:113,156`** → `alt={symbol}` crudo ("clay", "STEEL") en iconos mayormente decorativos junto a texto visible → el lector lee "clay Clay" en cada fila de toda la app. → `alt=""` cuando hay texto adyacente; mapa symbol→nombre humano cuando el icono es la única etiqueta.

**B6.6 [MEDIO] `components/Skeleton.tsx` (todas las variantes)** → Sin `role="status"`/`aria-busy` ni texto sr-only "Cargando…" → la carga es un silencio total para AT en todos los dashboards. → Envolver en `role="status" aria-busy="true"`.

**B6.7 [BAJO] `store/useAppStore.ts:19`** → Favoritos por defecto `['STEEL','ALUMINIUM','FABRIC','COPPER']`: `ALUMINIUM` (grafía británica) y `FABRIC` no existen en el catálogo de recursos del juego → filtros de favoritos que nunca coinciden. → Alinear con símbolos reales.

---

# SECCIÓN C — MÓDULOS DE DATOS

> Nota transversal de datos (verificada en `services/queries/useCraftworldQueries.ts:21-27` y `utils/formatters.ts:1-5`): `useCraftworldHomeQuery` captura **todo** error de API y devuelve `null` → ningún módulo distingue "fallo de red" de "sin datos"; y `formatNumber` enmascara NaN/Infinity como `'0'`. Ambos multiplican los hallazgos de estado vacío/engañoso de abajo.

## C.1 Profitability (rentabilidad)

1. **[CRÍTICO] `components/ProfitabilityCard.tsx:54-58`** → La cabecera (avatar+token) es `<div onClick={onOpenModal}>` sin rol/teclado y es el ÚNICO acceso al drill-down de niveles/cadena. → Función principal bloqueada por teclado (2.1.1 A). → `<button type="button" aria-haspopup="dialog">`.
2. **[CRÍTICO] `components/modal/ProfitabilityModal.tsx:47-90`** → Modal sin `role="dialog"`, sin Escape, sin foco inicial/trap/retorno ni scroll-lock (los de tradingBot SÍ los tienen → inconsistencia interna). → 2.1.2/2.4.3. → Copiar patrón Escape+lock de tradingBot + `aria-modal`.
3. **[ALTO] `ProfitabilityCard.tsx:259,268`; `ProfitabilitySummaryFooter.tsx:25,41`; `modal/LevelCardRow.tsx:137-187`** → Etiquetas clave en `text-zinc-500`: 3.34-3.93:1 <4.5:1 (10-11px). → 1.4.3. → `text-zinc-400`.
4. **[ALTO] `ProfitabilityCard.tsx:288`** → Placeholder "–" de métrica inactiva en `text-zinc-600` = **2.29:1**. → `text-zinc-400` + `title="Fábrica inactiva"`.
5. **[ALTO] `modal/ValueChainStepView.tsx:63,72,116`** → Prefijo "+" hardcodeado: pérdida negativa renderiza "+-1.234" en verde. → Lectura financiera errónea. → Signo y color condicionales.
6. **[ALTO] `ProfitabilityCard.tsx:61-75`** → Estado "activa/simulada" solo por color (punto verde vs ámbar 1.5px), sin texto/aria. → 1.4.1. → sr-only + variar forma.
7. **[ALTO] `useProfitabilityTable.ts:105-111` + `PricesAndProfitabilityHeader.tsx:60-67`** → "Restablecer" descarta TODAS las simulaciones sin confirmación. → Pérdida de trabajo. → Confirmación o undo.
8. **[ALTO] `useProfitabilityTable.ts:212-230` + `CategoryTabsBar.tsx:80-90`** → "Max Todos" masivo e irreversible salvo reset global. → Confirmación + toast con deshacer.
9. **[ALTO] `ProfitabilityLevelSelector.tsx:51-131` y `ProfitabilityBoostSelector.tsx:41-106`** → Popovers sin aria-expanded/Esc/flechas/foco. → Patrón listbox ARIA.
10. **[ALTO] `CategoryTabsBar.tsx:94-122`** → Búsqueda sin label ni aria-label; botón "✕" sin nombre accesible, ≈16px. → 4.1.2/2.5.8. → `aria-label` + target ≥24px.
11. **[ALTO] `ProfitabilityDashboard.tsx:127-176`** → Sin empty-state ni estado de error: API caída o búsqueda sin matches = grid en blanco. → Empty-state + botón Reintentar (`refetchHome` ya existe).
12. **[ALTO] `PricesAndProfitabilityHeader.tsx:158-177`** → Input de precio de energía sin label, `Math.max(0, Number(v)||0)` convierte vacío en 0 silenciosamente (recalcula todo a coste 0) y la nota "(Costo 0 kW activado)" está `hidden sm:inline` → invisible en móvil. → Label + aviso visible.
13. **[MEDIO] `Skeleton.tsx:95-107`** (usado en `ProfitabilityDashboard:127`) → Sin `role="status"`. → Ver B6.6.
14. **[MEDIO] `modal/ModalHeader.tsx:58`; `ModalTabsNav.tsx:31-32`; `LevelsBreakdownView.tsx:32`** → "(1 al 40)"/"(40)" fijos mientras el máximo real usa fallback 50 (`useProfitabilityTable.ts:206,217`). → Parametrizar con `allRows.length`.
15. **[MEDIO] `modal/ModalTabsNav.tsx:19-49`** → Tabs sin `role="tablist/tab"` ni `aria-selected`. → Patrón ARIA tabs.
16. **[MEDIO] `ProfitabilitySummaryFooter.tsx:20`** → Sticky footer tapa el foco de las últimas tarjetas (2.4.11); totales mutan sin aria-live. → `scroll-margin-bottom` + `role="status"`.
17. **[MEDIO] `modal/LevelCardRow.tsx:120-154`** → Insumos truncados `max-w-[130px]` pierden datos en móvil; "⚡" como única etiqueta de energía sin aria. → `line-clamp-2` + sr-only.
18. **[MEDIO] `index.ts:10-25`** → 8 componentes muertos con patrones divergentes (targets 16-20px, `<th onClick>`, `<select>` vs popover). → Eliminar o alinear.
19. **[MEDIO] `useProfitability.ts:48-56` vs `useProfitabilityTable.ts:65-71`** → Dos modelos de boost paralelos exportados → ganancias distintas según hook. → Deprecar el viejo.
20. **[BAJO] `useProfitabilityTable.ts:40-50`** → `fetchRoninPoolsData().then` sin `.catch` → deltas 1h/24h en 0 mostrados como reales. → `.catch` + atenuar.

## C.2 Prices

1. **[CRÍTICO] `components/PricesItemRow.tsx:44-48`** → Fila completa `div onClick` (navega a `/resource/:symbol`) sin rol/teclado; solo la estrella es focusable. → Navegación al detalle inaccesible (2.1.1). → `<button>`/`<a>` full-width.
2. **[ALTO] `hooks/useMarketPrices.ts:29-61` + `PricesHeader.tsx:18`** → `DEFAULT_MARKET_PRICES` (snapshot hardcodeado de priceService.ts:53) se fusiona y muestra idéntico a datos vivos; el header afirma "precios en vivo" incondicionalmente. → Trading con datos muertos como vivos. → `source: 'live'|'default'` + badge "Ref.".
3. **[ALTO] `PricesItemRow.tsx:82`** → `formatNumber(item.amount)` con 2 decimales: EARTH (0.004608) se renderiza **"0 COIN"**. → Precio real mostrado como cero. → 5 decimales si `<1` (patrón ya existente en ProfitabilityCard:94).
4. **[ALTO] `PricesItemRow.tsx:51-61`** → Favorito: nombre solo via `title`, estado solo por color. → `aria-label` dinámico + `aria-pressed`.
5. **[MEDIO] `useMarketPrices.ts:15-23`** → Fallo de pools cambia silenciosamente "24h: X" → "Ref. Price". → `.catch` + texto explicativo.
6. **[MEDIO] `PricesSearchBar.tsx:23-29`** → Input sin label/aria-label. → `aria-label="Buscar recurso"`.
7. **[MEDIO] `PricesGrid.tsx:32-34`** → Título "(N)" con la lista ya filtrada: tras buscar dice "(1)" como total del mercado. → "X de Y cotizaciones".
8. **[BAJO] `PricesItemRow.tsx:15-28,67-71`** → Estrella SVG sin `aria-hidden`; "24h:" muestra la mediana (un precio) confundible con un delta %. → aria-hidden + "Mediana 24h".

## C.3 Trading Bot

1. **[CRÍTICO] `components/WatchlistManagerModal.tsx:52-55,168-174`** → `handleSubmit` hace `return` silencioso con targetValue "abc"/"-5"/"0" (el `disabled` solo exige no-vacío): el submit "no hace nada". → El usuario cree que guardó una alerta que no existe (pérdida de datos). → Mensaje `role="alert"` + `aria-invalid` + deshabilitar según validez.
2. **[ALTO] `hooks/useTradingBot.ts:155-164`** → `triggerScan` sin try/finally: si `refetchHome()`/`fetchRoninPoolsData()` lanzan, `setIsScanning(false)` no se ejecuta → botón "Escanear" bloqueado para siempre con "Escaneando...". → `try/finally`.
3. **[ALTO] `components/TradingBotHeader.tsx:46-49,185-187`** → Badge "Live 24/7" (con ping) y "pools OK" **hardcodeados**; con API caída el feed sigue generándose con `DEFAULT_MARKET_PRICES` (useTradingBot.ts:68-107). → Estado del sistema falso. → Badge condicionado al estado real (verde/ámbar "Última sync: X"/rojo).
4. **[ALTO] `OpportunityFeedCard.tsx:209`** → "/100" en `text-slate-500` = 3.86:1 (10px). → `text-slate-400`.
5. **[ALTO] `OpportunityFeedCard.tsx:239-244`** → "+{formatCoin}" siempre en verde aunque sea 0/negativo → "+-123" verde. → Condicionar como el margen (228-235, que lo hace bien).
6. **[ALTO] `WatchlistManagerModal.tsx:199-209`** → Toggle de regla icon-only 20px, estado solo por color, sin `aria-pressed`. → 24px + aria + sr-only.
7. **[ALTO] `WatchlistManagerModal.tsx:233-240`** → Eliminar regla con un clic sin confirmación (persiste en localStorage). → Confirmación o toast con Deshacer.
8. **[ALTO] `DiscordWebhookModal.tsx:105-190`; `WatchlistManagerModal.tsx:114-145`** → 6 pares label/input sin `htmlFor`/`id`. → Asociar todos.
9. **[ALTO] `DiscordWebhookModal.tsx:155-165`** → Switch sin `role="switch"`/`aria-checked`/nombre. → Rol completo.
10. **[ALTO] Los 3 modales (`ArbitrageCalculatorModal:116`, `DiscordWebhookModal:68`, `WatchlistManagerModal:70`)** → Escape+lock OK, pero sin `role="dialog"`, foco inicial, trap ni retorno. → `aria-labelledby` + gestión de foco.
11. **[ALTO] `ArbitrageCalculatorModal.tsx:171-179`** → `input type="range"` sin label, thumb ~16px, sin foco visible. → `aria-label` + thumb 24px + ring.
12. **[MEDIO] `DiscordWebhookModal.tsx:57-66`** → "Guardar" persiste cualquier texto como URL sin validar (el error solo al Probar). → Validar `new URL()` + dominio discord al guardar.
13. **[MEDIO] `useTradingBot.ts:47,160-163,271`** → `lastScannedAt` nunca se renderiza; refetch cada 30s invisible. → "Actualizado hace Xs".
14. **[MEDIO] `OpportunityFeedCard.tsx:32-98,302`** → Feedback de Discord como texto del propio botón 3s, sin aria-live. → Toast externo.
15. **[MEDIO] `TradingBotDashboard.tsx:141-159`** → Búsqueda y `<select>` de orden sin label; módulo 100% español siendo la app bilingüe. → aria-labels + migrar a `useTranslation`.
16. **[MEDIO] `OpportunityFeedCard.tsx:100-103`** → `displayName` puede caer a `''` → tarjeta sin título. → Fallback a `symbol`.
17. **[MEDIO] Placeholders `placeholder-zinc-600` ≈2.3:1** en ambos modales + empty-state zinc-500 3.8:1. → `placeholder-zinc-400`.
18. **[BAJO] `ArbitrageCalculatorModal.tsx:100-114`** → `writeText` sin catch; "¡Copiado!" aunque falle. → try/catch.
19. **[BAJO] `TradingBotDashboard.tsx:122`; `TradingBotHeader.tsx:69`** → Clases Tailwind inexistentes `py-0.2`, `active:scale-98` → estilos que nunca aplican. → `py-0.5`/`active:scale-95`.
20. **[BAJO] `ArbitrageCalculatorModal.tsx:221`** → "20000x CLAY" sin separador de miles. → `toLocaleString()`.

## C.4 Upgrade Simulator

1. **[ALTO] `CategoryTabsBar.tsx:49-57`** → "Restablecer" borra niveles de TODAS las fábricas sin confirmación **ni persistencia** (sin localStorage). → Un clic destruye la configuración de la sesión. → Confirmación + persistir.
2. **[ALTO] `CustomLevelSelect.tsx:53-104`** → Dropdown custom sin flechas/Esc/listbox/aria-activedescendant. → `<select>` nativo o listbox ARIA.
3. **[ALTO] `CategoryTabsBar.tsx:30-41`** → Pestaña activa solo por color/escala. → `aria-current`/`aria-pressed`.
4. **[ALTO] `FactoryUpgradeCard.tsx:80-99`** → Steppers 20×20px (`w-5 h-5`) <24px; valor qty no anunciado. → 28px+ + `aria-label` + `aria-live`.
5. **[ALTO] `ShoppingListSection.tsx:58-60`** → `clipboard.writeText` sin catch y `setCopied(true)` incondicional → "¡Copiado!" con la lista NO copiada. → then/catch + `role="alert"`.
6. **[MEDIO] `FactoryUpgradeCard.tsx:18-27`** → `formatCostCoin` trunca a 1 decimal en miles (1.549→"1.5K"), inconsistente con `ResourceRequirementBadge` (2 decimales). → 2 decimales + title exacto.
7. **[MEDIO] `UpgradeSimulatorDashboard.tsx:73-98`** → Recálculos sin aria-live ni indicador. → `role="status"` en total y costos.
8. **[MEDIO] `FactoryUpgradeCard.tsx:130`** → "➔" en slate-500 3.6:1. → slate-400.
9. **[MEDIO] `ShoppingListSection.tsx:12`** → `onClearCart` declarada pero nunca pasada: no existe forma de vaciar el carrito sin el reset destructivo. → Conectar + botón "Vaciar".
10. **[BAJO] `UpgradeSimulatorHeader.tsx:24`** → Ternario idéntico en ambos idiomas: título nunca localizado. → Traducir.

## C.5 Power Simulator

1. **[ALTO] `PowerPacksSection.tsx:48-55`** → Input "Capacidad máxima" acepta 0/negativos/<min (el hook no clampa) y no tiene label; con valores inválidos los KPI muestran "—" sin explicación. → Clamp 100k-5M + label + mensaje de rango.
2. **[ALTO] `CostComparisonTable.tsx:34-157`** → "Tabla" en divs sin semántica y en móvil **se omiten columnas** (cristales 🍃 desaparecen) sin aviso. → `<table>` real o roles ARIA; columnas completas en móvil.
3. **[ALTO] `CustomPlantLevelSelect.tsx:55-143`** → Mismo dropdown inaccesible que C.4-2. → Ídem.
4. **[MEDIO] `TotalEffectiveCostSection.tsx:59-68`** → Info crítica del Crystal Pass SOLO en el `title` de un emoji "ℹ️" no focusable. → Botón con popover accesible.
5. **[MEDIO] `PassiveProductionSection.tsx:50,117-202` + `FreeOutputSection.tsx:22,94,106`** → Labels slate-500 3.6-3.9:1 en 10-12px. → slate-400.
6. **[MEDIO] `FreeOutputSection.tsx:88-108` + `TotalEffectiveCostSection.tsx:124-131`** → Unidades incoherentes: "kW" para energía diaria (potencia≠energía) mezclado con "/h". → Unificar "Power/día" vs "Power/h".
7. **[MEDIO] `PowerPacksSection.tsx:84 vs 120,167`** → Pack +50% capado a 1; +25% y +100% sin tope → cientos de chips. → Tope uniforme o resumen "×N".
8. **[MEDIO] `CostComparisonTable.tsx:163-169`** → "Cargando cotización…" sin role; filas ya visibles con precios parciales. → `role="status"` + `aria-busy`.
9. **[MEDIO] `CostComparisonTable.tsx:97-135`** → COIN/100k con color HSL interpolado sin control de contraste. → Paleta fija auditada.
10. **[BAJO] `TotalEffectiveCostSection.tsx:141`** → `{totalCrystalsDaily} 🍃` sin formato; emoji como unidad leído "hoja". → `formatNumber` + sr-only.

## C.6 Base Cost

1. **[CRÍTICO] `BaseCostHeader.tsx:112-118`** → "Reset All" (48 fábricas a nivel 1/maestría 0) icon-only **sin aria-label** (solo title) y **sin confirmación**. → Clic invisible para SR destruye toda la configuración. → `aria-label` + confirmación.
2. **[ALTO] `BaseCostInfiniteMarquee.tsx:24-80,192-218`** → Marquee sin pausa (WCAG 2.2.2 A) ni reduced-motion; items duplicados sin `aria-hidden` (SR lee ~96 recursos 2×). → Pausa + aria-hidden.
3. **[ALTO] `BaseCostSettingsBar.tsx:64-148`** → Cada `<label>` envuelve DOS controles: el input de % queda sin nombre; `max` decorativo (999 aceptado) sin mensaje. → Labels separados + clamp + `aria-describedby`.
4. **[ALTO] `BaseCostSettingsBar.tsx:323-434`** → Modal de ayuda sin foco inicial/trap/retorno/aria-labelledby; cierre icon-only sin aria-label. → Gestión de foco completa.
5. **[ALTO] `BaseCostCardView.tsx:498-502` + `baseCostCalculatorService.ts:320-338`** → "Ganancia Neta" con color interpolado: rgb(22,101,52) ≈ **2.5:1** en márgenes bajos — ilegible en el rango más común. → Clamp de luminosidad.
6. **[ALTO] `BaseCostSettingsBar.tsx:273-287`** → Búsqueda solo-placeholder (3.9:1) y "✕" sin aria-label. → aria-labels.
7. **[ALTO] `BaseCostCardView.tsx:98-383` + selectores de nivel/maestría** → Enlace Defined.fi icono 14px sin aria-label; 48 triggers idénticos "3/10" sin nombre por fábrica. → `aria-label` por recurso.
8. **[MEDIO] `BaseCostSettingsBar.tsx:183-318`** → Tres segmented controls sin `aria-pressed`; "Todos ({48})" hardcodeado. → aria-pressed + conteo dinámico.
9. **[MEDIO] `BaseCostCardView.tsx:287-297`** → Acordeón sin `aria-expanded`/`aria-controls`. → Añadir ambos.
10. **[MEDIO] `BaseCostCardView.tsx:150-240`** → "Ahorras -3.2%" posible en craft_direct; `formatCoin(0)='0'` confunde "sin precio" con "gratis". → Condicionar y "—" para faltantes.
11. **[MEDIO] `BaseCostDashboard.tsx:86-90` + `BaseCostHeader.tsx:39-43`** → Loader y frescura sin `role="status"`; "upd Xs" críptico. → role + "Actualizado hace Xs".
12. **[MEDIO] `BaseCostCardView.tsx:120,129,225-232,397,406`** → Labels "Lvl/Mast/Mercado" zinc-500 9-10px = 3.6:1. → zinc-400.
13. **[BAJO] `BaseCostTable.tsx` + `BaseCostSummaryCards.tsx`** → Código muerto con `colSpan={14}` (15 columnas reales) y botones 16px. → Eliminar o corregir.

## C.7 Planner

1. **[ALTO] `GoalSelectorCard.tsx:73-128`** → Labels "Recurso Objetivo"/"Cantidad Deseada" hermanos de los controles sin `htmlFor`/`id`. → Asociar.
2. **[ALTO] `useResourcePlanner.tsx:116-120`** → Copiar sin catch; "¡Copiado!" incondicional; timer sin cleanup. → then/catch.
3. **[ALTO] `PlannerTabsNav.tsx:41-165`** → Tabs/filtros sin roles ni `aria-selected`/`aria-pressed`; "¡Copiado!" solo visual. → ARIA + `role="status"`.
4. **[MEDIO] `GoalSelectorCard.tsx:142`** → Banner de estrategia desaparece por completo (null) cuando `marketBuyTotalCost===0`. → Empty-state explícito.
5. **[MEDIO] `GoalSelectorCard.tsx:120-126`** → Sin máximo: 999999 genera cientos de tarjetas (advisor sí corta a 40). → Clamp + paginación.
6. **[MEDIO] `GoalSelectorCard.tsx:93-106`** → Presets sin aria-pressed; valor manual (7) no marca ninguno ni explica. → aria-pressed + hint.
7. **[MEDIO] `MaterialCard.tsx:126-137`** → Barra de cobertura sin `role="progressbar"` ni valores aria. → Rol completo.
8. **[MEDIO] `MaterialCard.tsx:143-206`** → Labels zinc-500 y veredicto "VENDER X Y COMPRAR Y" truncado en móvil sin tooltip. → zinc-400 + title/wrap.
9. **[BAJO] `CraftingStepRow.tsx:38-47`** → `cyclesNeeded` sin `formatNumber` (inconsistente con el resto del archivo).

## C.8 Advisor

1. **[CRÍTICO] `AdvisorList.tsx:33`** → `recommendations.slice(0, 40)` descarta silenciosamente el resto: sin contador, paginación ni aviso. → Decisiones de ROI con datos incompletos creyendo ver el ranking total. → "Mostrando 40 de N" + "Ver más".
2. **[ALTO] `AdvisorFilterBar.tsx:27-70`** → 4 pills de filtro solo por color, sin aria-pressed. → aria-pressed (la búsqueda :80-88 sí tiene ring: replicar).
3. **[MEDIO] `AdvisorCard.tsx:64,78`** → Labels zinc-500 10px 3.6:1. → zinc-400.
4. **[MEDIO] `AdvisorCard.tsx:28`** → "Nv. X ➔ Nv. Y" en español también en EN, mezclado con badges traducidos. → Localizar.
5. **[MEDIO] `AdvisorList.tsx:14-29`** → Empty state sin `role="status"`. → Añadir.
6. **[BAJO] `AdvisorCard.tsx:32-51`** → `paybackDays` null oculta el badge sin explicar; "Not enough data" filtrado. → Badge neutro "Sin datos".

## C.9 Encyclopedia

1. **[ALTO] `CategoryChips.tsx:39,68,100`** → Chips con `outline-none ring-0`; activo solo por color ámbar. → `aria-pressed` + `focus-visible:ring-2`.
2. **[ALTO] `LevelCard.tsx:235,258,277`** → Valores de datos en `text-slate-600` = **2.3:1** (texto 9px: "0 / u", "— / u"). → `text-slate-400` + ≥10px.
3. **[ALTO] `LevelCard.tsx:28,57,151-264`** → Etiquetas de métrica slate-500 = 3.9:1 a 10px. → slate-400.
4. **[ALTO] `EventLandingView.tsx:1046-1078`** → Lightbox sin `role="dialog"`, Escape, foco ni restauración. → Modal accesible completo.
5. **[ALTO] `EventLandingView.tsx:634-639`** → Miniatura de estatua `div onClick` sin rol/teclado, ÚNICO modo de ampliar esa imagen (las otras 7 imágenes sí tienen botón "Ampliar" — inconsistencia). → `<button aria-label="Ampliar imagen">`.
6. **[ALTO] `EncyclopediaDashboard.tsx:58-69`** → Búsqueda sin resultados deja el banner/datos del ítem anterior visibles con chips vacíos → el contenido viejo parece ser el resultado. → Empty-state "Sin resultados para «X»" + limpiar.
7. **[ALTO] `hooks/useEncyclopedia.ts:69-72` + `ProgressionCards.tsx:61-67`** → API caída: catch solo `console.error`; el mensaje mostrado culpa al filtro ("No se encontraron niveles para este filtro") aunque no haya filtro. → Estado `error` + Reintentar.
8. **[MEDIO] `ExecutiveBarChart.tsx:126-131`** → Alturas de barras con onda `Math.sin` decorativa que NO codifica valores → gráfica que miente. → Escalar con los datos o etiquetar "decorativo".
9. **[MEDIO] `ExecutiveBarChart.tsx:163,174` + `ExecutiveAreaChart.tsx:219,230`** → Flechas prev/next de 20×20px. → ≥24px.
10. **[MEDIO] `EncyclopediaDashboard.tsx:60-62`** → Cada clic de chip reemplaza TODO con skeleton completo → flash y pérdida de contexto. → Skeleton por sección/opacity.
11. **[MEDIO] `EventLandingView.tsx:305-327`** → 7 tabs de sub-páginas solo por color, sin roles ni anuncio de cambio. → ARIA tabs + aria-live.
12. **[MEDIO] `CategoryChips.tsx:28,57,86`** → `cursor-grab` sin handlers: affordance de arrastre falsa. → Quitar cursor o implementar drag.
13. **[MEDIO] `SelectedBanner.tsx:63` + `CategoryChips.tsx:108` + `EventLandingView.tsx:128,320`** → Clases Tailwind inexistentes `w-13 h-13`, `py-0.2` → layout degradado silencioso. → Clases válidas.
14. **[MEDIO] `ProgressionTable(+Row).tsx`, `MiniMetricChart.tsx`** → Código muerto con contrastes de 2.3-3.7:1. → Eliminar.
15. **[BAJO] `StatSummaryCards.tsx:53`** → `hover:-translate-y-0.5` en tarjetas no clicables. → Quitar.
16. **[BAJO] `EventLandingView.tsx:882`** → `truncate` sin `title`. → Añadir title.
17. **[BAJO] `SelectedBanner.tsx:105-112`** → Toggle de animación con estado solo en `title`. → `aria-pressed`.

## C.10 Resources (detalle de recurso)

1. **[ALTO] `hooks/useResourceDetail.ts:74` + `resourceDetailService.ts:58-75`** → Sin datos del pool, la gráfica genera serie **pseudo-aleatoria** (Math.sin/cos con seed) con timestamps reales, renderizada SIN etiqueta "simulado". → Decisiones de mercado sobre datos inventados. → Badge "Datos estimados" o no renderizar.
2. **[ALTO] `ResourceInteractiveChart.tsx:123-135`** → Scrubbing solo por puntero sobre un rect no focusable → histórico inaccesible por teclado (2.1.1). → Rect focusable con flechas o tabla `<details>`.
3. **[ALTO] `useResourceDetail.ts:32-34`** → Pools sin `.catch`; en fallo la sección "Métricas de Mercado" desaparece (return null) sin aviso. → .catch + banner con Reintentar.
4. **[ALTO] `ResourceInteractiveChart.tsx:148-153`** → Botones de timeframe con `style={{padding:0}}`: altura ≈16px, sin aria-pressed. → py-1.5 + aria-pressed.
5. **[MEDIO] `ResourceInteractiveChart.tsx:37,96-107`** → `preserveAspectRatio="none"` deforma el texto del tooltip en pantallas anchas. → Tooltip HTML fuera del SVG.
6. **[MEDIO] `ResourceDetailHeader.tsx:33-40`** → Botón "volver" con icono de X (semántica contradictoria), solo `title`. → Flecha + aria-label.
7. **[MEDIO] `ResourceActivityList.tsx:17-60`** → Sin empty-state ("ACTIVITY" huérfano). → "Sin operaciones recientes".
8. **[MEDIO] `ResourceInteractiveChart.tsx:34-136`** → Sin eje Y ni min/max: magnitud solo scrubbeando. → Gridlines con valores.
9. **[BAJO] `ResourceActivityList.tsx:13-15`** ("ACTIVITY" sin traducir), **[BAJO] `ResourceMarketStatsCard.tsx:47,58`** (jerga "ATH/ATL Katana" sin ayuda), **[BAJO] `ResourcePriceBanner.tsx:37-39`** (▲/▼ sin aria-hidden; SR lee "triángulo negro").

## C.11 Value Chain

1. **[ALTO] `ValueChainHero.tsx:75-82`** → Input de nivel `focus:outline-none` sin ring; label "Nivel:" sin asociar ni placeholder. → htmlFor/id + ring.
2. **[ALTO] `ValueChainKpiGrid.tsx:98` + `ValueChainBreakdownTable.tsx:67,70,73,129`** → `+{formatNumber}` siempre: pérdida negativa como "+-1.234" en verde fijo. → Signo/color condicional.
3. **[MEDIO] `ValueChainDashboard.tsx:49-68`** → Token sin cadena → página termina tras el selector sin mensaje. → Empty-state.
4. **[MEDIO] `ValueChainStepFlow.tsx:56,112-114`** → Paso #0 solo muestra la PRIMERA materia prima; input2 existe en la tabla pero no en las tarjetas (inconsistencia entre vistas). → Iterar todos los inputs.
5. **[MEDIO] `ValueChainHero.tsx:30`** → "ANALIZADOR DE CADENA INDUSTRIAL" fijo en ES. → Localizar.
6. **[MEDIO] `ValueChainHero.tsx:47-68`** → Toggle de modo sin aria-pressed. → Añadir.
7. **[MEDIO] `ValueChainBreakdownTable.tsx:27-38`** → Tabla scrollable sin `tabIndex=0`, `<th>` sin scope. → Ambos.
8. **[BAJO] `ValueChainTargetSelector.tsx:31-40`** → Botones sin aria-pressed; label `opacity-75` ≈3.4:1. → aria + opacity-100.

## C.12 Compare

1. **[ALTO] `hooks/useFactoryCompare.tsx:106-118`** → Fallback silencioso `find(token&&level) || find(token)`: tras "Invertir A⇄B" o "Nivel Siguiente" entre tokens con distinto máximo, el selector muestra Nv. 30 pero calcula con la fila Nv. 1 → comparación de niveles equivocados sin saberlo. → Clamp del nivel + badge "mostrando Nv. X".
2. **[ALTO] `FactoryDetailCard.tsx` (9 labels) + `CompareVerdictCard.tsx:39,66,80`** → zinc-500 3.8:1 a 10px en TODOS los nombres de métrica. → zinc-400.
3. **[ALTO] `FactorySelectorCard.tsx:79-114` (vía `ui/Combobox`)** → Combobox sin semántica ARIA ni foco visible. → Ver B6.1.
4. **[MEDIO] `useFactoryCompare.tsx:147-157`** → "Nivel Siguiente/Máximo" sobrescriben la selección B sin confirmación ni undo. → Toast "Restaurar B".
5. **[MEDIO] `CompareDashboard.tsx:119-147`** → cycle1/cycle2 null → nada tras los selectores, sin veredicto ni mensaje. → Empty-state.
6. **[MEDIO] `CompareHatchChartCard.tsx:127-141,374-382`** → Eje "0-100%" no corresponde a los datos (barras = reparto A/B, mínimo 50%): ventaja ínfima parece enorme. → Reetiquetar o línea de referencia al 50%.
7. **[MEDIO] `CompareHatchChartCard.tsx:403-417`** → Columnas de barra `div onClick` sin rol (hay alternativa teclado en el selector 294-313, por eso no es bloqueante) y tooltip solo hover. → Integrar al grupo tab.
8. **[MEDIO] `FactoryDetailCard.tsx:57-172`** → 8 métricas en tarjetas separadas: comparar exige memorizar A y buscar en B (reconocimiento vs recuerdo). → Tabla métrica|A|B|Δ.
9. **[BAJO] "Nv."/"Frente a Frente" sin localizar; toggle y Combobox sin aria-pressed/"Seleccionar..." solo ES.** → Localizar.

## C.13 Masterpiece

1. **[ALTO] `TierContributionsGrid.tsx:146-155` + `EfficiencySection.tsx:97-107` + `EfficiencyCard.tsx:125-133`** → Los 3 inputs numéricos (aporte, precio Power, unidades) sin label ni aria-label (spans sin asociar). → htmlFor/aria-label.
2. **[ALTO] `EfficiencyCard.tsx:116-142,196-207`** → Steppers 20×20 y multiplicador ≈19px. → ≥24px.
3. **[ALTO] `MasterpieceHeader.tsx:18-21`** → Badge "Temporada en Curso • En Vivo" hardcodeado sin evaluar estado real. → Derivar de datos o neutralizar.
4. **[MEDIO] `TierContributionsGrid.tsx:65-69`** → `bg-[#1c221e]` añadido SIN quitar `bg-[#1c1c22]`: el orden del CSS compilado decide si el estado "completado" se ve. → Ternario excluyente.
5. **[MEDIO] `EfficiencySection.tsx:85,106`** → `focus:ring-1 ring-amber-500/50` al límite de lo perceptible; botones sin ring por el outline global. → `focus-visible:ring-2` sólido.
6. **[MEDIO] `PowerBracketSteppedBar.tsx:64-97`** → Textos de 9-9.5px; rangos solo en `title` (invisible en táctil). → 10-11px + aria-label por tramo.
7. **[MEDIO] `LeagueProgressCard.tsx:22-27`** → `pointsTotal===0` → `Math.min(100, NaN)` → `width:'NaN%'`: barra rota sin mensaje. → `|| 1`.
8. **[MEDIO] `EfficiencyCard.tsx:84` + `TierContributionsGrid.tsx:77-81`** → `truncate` del nombre/símbolo del recurso sin `title` — la tarea principal (identificar recurso) imposible con nombres largos. → title.
9. **[BAJO] `EfficiencyTable(+Row).tsx`** → Código muerto con el botón de 19px. → Eliminar.
10. **[BAJO] `EfficiencyCard.tsx:18`** → `formatValue` devuelve '0' para "sin datos" y para cero real. → '—' vs '0'.
11. **[BAJO] Pills de liga/tier/bracket sin aria-pressed.** → Añadir.

## C.14 Home / Empire / Inventory / Timers *(auditoría directa; el subagente asignado falló antes de entregar, cobertura de archivos principales: OverviewTab, visuals, timers hook+card, empire overview/plots, inventory card+hook+grid)*

1. **[ALTO] `home/components/visuals/SparklineWave.tsx:14` + `MiniBarChart.tsx:12`** → Las "gráficas" junto a Skill Points y Temporada son **paths/barras hardcodeados** (`pathD` fijo; `bars=[12,20,15,32,16,10]`) sin `aria-hidden` → parecen tendencias de datos reales. → `aria-hidden="true"` + etiqueta "decorativo" o datos reales.
2. **[ALTO] `home/components/tabs/OverviewTab.tsx:179`** → `Nv. {profile?.level ?? craftWorld?.level ?? 200}`: sin datos muestra **"Nv. 200"** — nivel inventado para un jugador sin perfil. → `'—'`.
3. **[MEDIO] `OverviewTab.tsx:110-114`** → Donut de Masterpieces divide por **75 hardcodeado**. → Constante derivada de datos.
4. **[MEDIO] `home/components/HomeTabsNav.tsx:30-47`** → 6 tabs sin `role="tablist/tab"` ni `aria-selected`; scroll con scrollbar oculto. → ARIA tabs.
5. **[BAJO] `OverviewTab.tsx:210,240`** → "STATUS"/"SEASON" decorativos en slate-500 3.8:1; `StatusBadge` "Activo/Inactivo" sin traducir (línea 260).
6. **[ALTO] `timers/components/FactoryTimerCard.tsx:75-98`** → La píldora "Listo" (con `cursor-pointer` y hover) y el botón circular de caja son **DIV sin onClick ni teclado** — controles que parecen clicables y no hacen nada (affordance falsa). → `<button>` con acción real (p. ej. "Reclamar" navega al juego) o quitar affordance.
7. **[MEDIO] `timers/hooks/useFactoryTimers.ts:56-70`** → Al desactivar notificaciones con permiso concedido, fija `notifPermission='denied'`: mezcla "usuario desactivó" con "navegador negó". → Estado separado enabled/permission.
8. **[BAJO] `useFactoryTimers.ts:29-36`** → `setInterval` de 1 s activo aunque la pestaña esté oculta (visibilidad/batería; los countdowns no se pausan con `document.visibilityState`). → Pausar en hidden.
9. **[CRÍTICO] `inventory/components/InventoryResourceCard.tsx:24-28`** → La tarjeta completa es `div onClick` (expandir acordeón) sin rol/teclado. → `<button>` contenedor o botón explícito de expansión con `aria-expanded`.
10. **[ALTO] `InventoryResourceCard.tsx:98-113`** → Badge de delta con `role="button"` pero **sin tabIndex ni teclado** (rol sin operatividad, peor que nada) y target ≈22px; `{item.delta?.percentStr}%` con delta undefined renderiza "%" huérfano. → `<button>` 24px + guard `delta &&`.
11. **[ALTO] `InventoryResourceCard.tsx:131-142`** → Botón "›" de 24px con solo `title`. → `aria-label="Ver detalles de {symbol}"`.
12. **[MEDIO] `empire/components/EmpireOverviewBar.tsx:19`** → Estadística de "Huevos/Dynos" parseada de un string quitando el emoji "🥚": manejo frágil que muestra vacío si el formato cambia. → Número tipado desde el servicio.
13. **[BAJO] `empire/components/EmpireLandPlotsList.tsx:30`** → `w-4.5 h-4.5` clase Tailwind inexistente → icono sin tamaño definido. → `w-5 h-5`.
14. **[BAJO] `home/components/tabs/CraftTab.tsx:134` y `ExchangeTab.tsx:134`** → Texto slate-500 10px (mismo fallo sistémico 1.4.3). → slate-400.

---

# SECCIÓN D — PATRONES TRANSVERSALES Y PRIORIZACIÓN

## D.1 Los 6 patrones-raíz (corregirlos elimina ~60% de los hallazgos)

| # | Patrón-raíz | Evidencia | Corrección central |
|---|---|---|---|
| 1 | **Foco eliminado por diseño** | `global.css:531` + 127 `outline-none` + 0 `:focus-visible` | Un token `:focus-visible` global (ver A1) |
| 2 | **`div onClick` como control** | FloatingDock, PricesItemRow, InventoryResourceCard, ProfitabilityCard, FactoryTimerCard, chips/barras (≥10 núcleos) | Regla de lint: prohibir `onClick` en `div` sin `role+tabIndex+onKeyDown`; preferir `<button>` |
| 3 | **Estado solo por color** | ~25 grupos de tabs/pills/switches/favoritos sin `aria-pressed`/`aria-checked` | Estándar: todo estado expone atributo ARIA |
| 4 | **Datos degradados sin etiquetar** | `DEFAULT_MARKET_PRICES`, fallbacks del ticker, wallets fake, gráficas sintéticas (resources, home), "Live 24/7", "Temporada en Curso" | Principio: fuente viva vs referencia SIEMPRE visible + nunca inventar en fallback |
| 5 | **Contraste de etiquetas** | `slate-500`/`zinc-500`/`slate-600`/`zinc-600` = 2.3-3.9:1 en 20+ componentes; colores interpolados sin clamp | Token de label (`slate-400`) + lint de contraste (axe-lint/Pa11y CI) |
| 6 | **Destructivos sin confirmación** | Reset All (baseCost), Restablecer (profitability, upgradeSimulator), Max Todos, eliminar reglas (tradingBot), vaciar B (compare) | Helper `useConfirmAction()` con undo |

## D.2 Duplicación que consolidar
- **4 dropdowns custom idénticos e inaccesibles** (CustomLevelSelect, CustomPlantLevelSelect, BaseCostLevelSelector, BaseCostMasterySelector) → un componente `Listbox` ARIA único.
- **Steppers en 4 tamaños** (20/24/28/40px) → estandarizar ≥40px.
- **Formato numérico**: '0' para NaN/∞ (upgradeSimulator) vs '—' para null (powerSimulator) → regla única: '—'=sin datos, '0'=cero real; `formatNumber(value, decimals)` con separador de miles en todos los `x{qty}` crudos.
- **Componentes muertos con patrones divergentes** (8 en profitability, tabla masterpieces, ProgressionTable, BaseCostTable) → eliminar.
- **Ternarios de i18n dispersos** (60+) con cobertura parcial → centralizar en `translations`.

## D.3 Matriz de prioridad recomendada

**Sprint 1 — Acceso operativo (bloqueantes):** A1, A2, C.1-1, C.1-2, C.2-1, C.3-1, C.6-1, C.8-1, C.14-6, C.14-9 (todos los [CRÍTICO]) + A4 (`lang`) + B6.6 (skeletons announce).
**Sprint 2 — Integridad de datos:** B5.1, C.2-2/3, C.3-3, C.9-1, C.10-1, C.12-1, C.13-3, B3.1/3.2 (landing) + `.catch` en los 6 `clipboard/fetch` sin manejo + estado de error/reintento en queries (nota transversal).
**Sprint 3 — WCAG AA restante:** A3, A5-A9, todos los contrastes de etiqueta (D.1-5), targets <24px, labels de inputs (C.4-8, C.7-1, C.13-1), switches ARIA (B4.1).
**Sprint 4 — Experiencia y pulido:** confirmaciones de destructivos, empty-states, unidades coherentes (kW→Power), i18n completo, clases Tailwind inválidas (`py-0.2`, `w-13`, `active:scale-98`, `custom-scrollbar`), código muerto.

## D.4 Verificación sugerida tras corregir
1. `axe-core` en las 25 rutas (objetivo: 0 críticos, 0 serios).
2. Navegación completa solo-teclado (Tab/Shift+Tab/Escape) de landing → login → cada módulo → modales.
3. Lectura con NVDA/VoiceOver de: dock, tabla de precios, tarjeta de rentabilidad, toasts.
4. Prueba con `prefers-reduced-motion: reduce` y con la API caída (DevTools offline) — no debe mostrarse ningún dato hardcodeado sin etiqueta "referencia".

---
*Fin del informe. Cumple con la regla acordada: se presenta el informe antes de cualquier refactorización; no se modificó código.*

