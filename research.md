# Investigación técnica de mercado — Herramientas de cálculo de ingeniería

Análisis de calculadoras de referencia del sector (Pipe Flow Software, Danfoss
PowerSource/SET 365, guías de dimensionado de gas conforme a UNE 60670) y su
contraste con VECTORIAL, para orientar qué construir a continuación.

## 1. Comparativa de funcionalidades

| Función | Pipe Flow Software / Danfoss | VECTORIAL (antes) | VECTORIAL (ahora) |
|---|---|---|---|
| Selección de material por dropdown con catálogo normalizado (DN, espesor, Ø interior) | Sí | Sí (`MATERIAL_CATALOG`) | Sí, sin cambios de UX |
| Rugosidad ligada al material seleccionado (sin tabla duplicada) | Sí | **No** — `engineering.js` tenía su propia tabla `PIPE_ROUGHNESS` con claves distintas a `MATERIAL_CATALOG`, por lo que `pp_r` y `stainless_steel` caían al valor de acero por error de key-miss | **Sí** — `engineering.js` consume `getMaterial()` de `materials.js` como única fuente |
| Base de datos de accesorios con factor K (codos, válvulas, tés...) | Sí (Pipe Flow Wizard fittings DB) | Sí (`calculateFittingLosses`, Crane TP-410) | Sin cambios (ya cubierto) |
| Dimensionado automático por pérdida de carga objetivo (cálculo inverso) | Sí | Sí (`calculateInversePipeSizing`, bisección) | Sin cambios (ya cubierto) |
| Verificación de velocidad máxima normativa en gas | Sí (herramientas de instaladores homologados) | **No** — solo se comprobaba la caída de presión (10%) | **Sí** — `GAS_MAX_VELOCITY = 20 m/s` (UNE 60670-4/6), expuesto como `velocity` y `velocityAdequate` |
| Presentación de incumplimientos normativos | Semáforo rojo/verde con motivo concreto | Semáforo, pero solo por presión | Semáforo considera presión **y** velocidad; UI muestra ambos valores con su límite |
| Materiales adicionales (galvanizado, fundición) | Sí | Se referenciaban en una tabla muerta sin catálogo de tuberías asociado | Añadidos a `MATERIAL_CATALOG` (`galvanized_steel`, `cast_iron`) con rugosidad y catálogo de tuberías |

## 2. Qué se implementó en esta sesión

- **`src/lib/materials.js`**: catálogo único de materiales, fluidos y cerramientos.
  Añadidos `galvanized_steel` y `cast_iron` (antes solo existían como rugosidad
  suelta y desconectada de cualquier catálogo de tuberías). `calorificValue`
  incorporado a los gases del `FLUID_CATALOG`.
- **`src/lib/engineering.js`**: eliminada la tabla `PIPE_ROUGHNESS` duplicada.
  Todas las funciones de cálculo (`calculatePipeFlow`, `calculateGasPressureDrop`,
  `calculateInversePipeSizing`, `generateHeadLossCurve`) resuelven ahora la
  rugosidad a través de `getMaterial()` — un ingeniero que añade un material a
  `MATERIAL_CATALOG` lo ve disponible automáticamente en todos los cálculos, sin
  tocar `engineering.js`.
- **Corrección de bug real**: con la tabla duplicada, los materiales `pp_r` y
  `stainless_steel` no tenían entrada en `PIPE_ROUGHNESS` y silenciosamente
  usaban la rugosidad del acero comercial (0.000045 m) en vez de la suya
  (0.0000015 m), infravalorando su rendimiento hidráulico.
- **Validación normativa añadida**: `calculateGasPressureDrop` ahora calcula la
  velocidad de circulación del gas y la compara con el límite de 20 m/s de UNE
  60670-4/6 (antes solo se validaba la caída de presión). El cumplimiento
  global (`compliance`) exige ambas condiciones.
- **`GasCalculator.jsx`**: selector de material de tubería (antes fijo a acero
  comercial internamente) y tarjeta de velocidad con semáforo propio. También
  se corrigió que `metadata.reynoldsRegime` nunca se calculaba y la UI mostraba
  "Régimen: undefined".

## 3. Extensibilidad — añadir un material nuevo

Añadir un material al catálogo es una operación de un único bloque en
`MATERIAL_CATALOG` (`src/lib/materials.js`):

```js
pex: {
  name: 'PEX - UNE EN ISO 15875',
  roughness: 0.0000015,
  type: 'plastic',
  standard: 'UNE EN ISO 15875',
  catalog: PVC_PIPE_STANDARD, // o un catálogo de diámetros propio
  color: '#8b5cf6',
},
```

En cuanto se guarda, queda disponible en los selectores de `PipeFlowCalculator`
y `GasCalculator`, y en todas las funciones de `engineering.js` sin más cambios.

## 4. Fuentes consultadas

- UNE 60670-4:2014 (diseño y construcción de instalaciones receptoras de gas,
  MOP ≤ 5 bar) — límite de velocidad de 20 m/s.
- Pipe Flow Software — base de datos de accesorios y factores K.
- Danfoss PowerSource / SET 365 — dimensionado automático de diámetros y
  cálculo de resistencia hidronica.

## 5. Pendiente (no abordado en la sesión anterior)

- Cálculo de ramales complejos (redes ramificadas con múltiples nodos), fuera
  del alcance de un cálculo de tramo único.
- Selección automática de accesorios por catálogo de fabricante (hoy el
  usuario introduce tipo y cantidad manualmente).

## 6. Segunda sesión — BOM, exportación, Dashboard e informe formal

Continuación del trabajo anterior, centrada en cerrar el recorrido completo
"input → cálculo → informe técnico de materiales" y en eliminar duplicación
entre los 4 componentes de `src/components/sandbox/`.

### 6.1 Motor técnico

- **`src/lib/bom.js`** — `estimateBillOfMaterials({ length, diameter, material })`:
  estima soportes/abrazaderas (según tabla de separación por diámetro),
  codos a 90°, pares de bridas y manguitos de unión por corte de barra
  comercial (6 m). **Alcance declarado explícitamente**: es una estimación de
  nivel de anteproyecto, no un recuento de obra — sin un trazado isométrico
  real no puede derivarse el número exacto de codos a partir solo de longitud
  y diámetro, así que la función expone ese supuesto en `metadata.warning` y
  permite pasar `estimatedElbows` si el usuario ya conoce el trazado real.
- **`src/lib/exportUtils.js`** — `exportCalculationToJSON()`: serializa
  inputs/resultados/metadata/BOM a un fichero `.json` descargable, para que
  un cálculo sea persistente fuera de la sesión del navegador.
- **`calculateGasPressureDrop`** ganó la comprobación de velocidad máxima
  (ver sesión anterior); en esta sesión se conectó también a la UI de
  `GasCalculator` y al informe técnico.

### 6.2 Interfaz

- **Dashboard de Proyecto** (`ProjectDashboard.jsx`, nueva pestaña en
  `EngineeringSandbox`): lista los cálculos guardados en la sesión
  (`src/lib/calculationStore.js`, persistido en `localStorage`), con opción
  de ver el informe completo, reexportar a JSON o eliminarlos. El botón
  "💾 Guardar en Dashboard" vive en `TechnicalReport`, así que cualquier
  calculadora que use ese componente queda automáticamente enlazada al
  Dashboard.
- **`TechnicalReport.jsx` generalizado**: antes solo `pipe_flow` estaba
  realmente conectado (Gas y Termotécnica tenían ramas de código muertas
  para esos tipos que nunca se renderizaban desde ningún componente). Ahora
  hay una tabla `REPORT_CONFIGS` por tipo (campos de entrada/resultado,
  etiquetas, unidades, precisión) y `GasCalculator`/`ThermalSizing` generan
  su propio informe formal con fecha y cabecera de marca (wordmark
  VEC/TORIAL en Navy/Naranja, en color sólido para que se lea también en
  papel — el `logo.svg` original usa texto blanco, invisible sobre fondo
  impreso).
- **Impresión**: el hack de visibilidad (`body * { visibility: hidden }` +
  excepción para el contenedor del informe) se movió de un `<style>` inline
  en `TechnicalReport.jsx` a `src/index.css`, apuntando a un `id` estable
  (`#vectorial-print-report`) en lugar de una clase Tailwind escapada
  (`.print\:shadow-none`), y se fuerza fondo blanco/texto oscuro con
  `@page { margin: 2cm }`.
- **Tooltips normativos**: nuevo componente `InfoTooltip.jsx` (icono "i" con
  `title` nativo, sin dependencia externa) en los selects que determinan un
  valor normativo: material de tubería (UNE EN 10255/1057/1452), tipo de gas
  (UNE 60670), presión de entrada (regla del 10%) y tipo de cerramiento
  (CTE DB-HE / ISO 6946).

### 6.3 Refactorización y limpieza

- `inputClass`/`labelClass` estaban duplicados **literalmente** (mismo string)
  en `PipeFlowCalculator.jsx`, `GasCalculator.jsx`, `ThermalSizing.jsx` y
  `TechnicalConverter.jsx`. Extraídos a `src/lib/uiConstants.js`.
- Eliminadas 3 variables muertas detectadas por `oxlint`
  (`activeTabData` en `EngineeringSandbox.jsx`, `roughness` sin uso en
  `PipeFlowCalculator.jsx`, `maxHeadLoss` sin uso en `HeadLossChart.jsx`) y
  un import no usado (`generateHeadLossCurve` en `PipeFlowCalculator.jsx`).
  `npx oxlint` queda en 0 warnings.
- No se ha introducido ninguna dependencia nueva (export JSON, tooltips y
  dashboard son todo código propio) ni se ha tocado el motor de cálculo más
  allá de lo ya descrito — se decidió no perseguir una reescritura de
  rendimiento sin un cuello de botella medido (la app es un sandbox de una
  sola página, los `useMemo` ya existentes cubren los cálculos costosos).

### 6.4 Verificación

- `npx vite build` y `npx oxlint` limpios tras cada cambio relevante.
- `estimateBillOfMaterials` verificado con un script ad-hoc (`vite-node`)
  cubriendo: tramo corto/DN pequeño, tramo largo/DN grande, override de
  codos por trazado conocido, y rechazo de longitud negativa.
- No se ha añadido un framework de tests (no existía ninguno en el proyecto
  — `vitest`/`jest` no están en `package.json`); instalarlo solo para esta
  sesión habría sido una dependencia nueva no solicitada explícitamente.
  Queda como pendiente razonable si el proyecto crece.

### 6.5 Pendiente

- Extender el Dashboard con filtros por tipo/fecha si el volumen de cálculos
  guardados crece.
- Sustituir el hack de impresión por `window.print()` con una ventana/iframe
  dedicada si en el futuro se necesita paginación multi-hoja más fina.
