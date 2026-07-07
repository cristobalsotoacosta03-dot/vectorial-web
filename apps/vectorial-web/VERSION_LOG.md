# VECTORIAL — Registro de versión

## v2.3.0 — Consolidación de producto: proyecto portable, datos de cabecera, referencia rápida

Objetivo de esta iteración: pasar de "cálculos sueltos guardados en el
navegador" a un flujo de proyecto real — obra → JSON → oficina.

### Persistencia de proyecto (localStorage → fichero)

- **`exportProjectToJSON()`** (`src/lib/exportUtils.js`): descarga un único
  JSON con todos los cálculos guardados, sus notas de campo y los datos de
  cabecera del proyecto. Sustituye la idea de "exportar cálculos sueltos"
  por "exportar el proyecto".
- **`importProjectFromJSON(texto)`**: restaura ese fichero. Nunca lanza una
  excepción — un JSON corrupto, un JSON con forma distinta, o un array de
  cálculos con entradas inválidas mezcladas con válidas, siempre devuelven
  `{ success: false, error }` o `{ success: true, imported, skipped }`.
  Verificado con JSON roto, JSON sin la clave `calculations`, y un array con
  una entrada válida y una corrupta (descarta solo la corrupta).
- Antes de reemplazar el Dashboard actual, se pide confirmación si ya había
  cálculos guardados (mismo patrón que "Vaciar Dashboard").
- `calculationStore.js` ahora atrapa errores de `localStorage.setItem`
  (cuota llena / navegación privada) en vez de dejar que rompan la sesión.

### Datos de cabecera del proyecto

- Nuevo `src/lib/projectMeta.js` (Autor, ID de Obra, Cliente, Fecha de
  referencia), persistente en `localStorage` durante toda la sesión.
- Formulario correspondiente en la parte superior del Dashboard.
- `TechnicalReport.jsx` los muestra en la cabecera de cada informe (solo los
  campos rellenados, para no ensuciar el documento si aún no se han
  introducido).

### Informe de nivel ingeniero

- **BOM Total del Proyecto**: nueva tabla al final de cada Informe Técnico
  que suma, por tipo de material (soportes, codos, bridas, manguitos), las
  cantidades de **todos** los cálculos guardados en el Dashboard de la
  sesión — no solo el cálculo que se está viendo. Se recalcula sola en
  cuanto se guarda un nuevo cálculo (mismo hook de estado global que el
  Dashboard).

### Estado global sin recarga

- `src/hooks/useCalculationHistory.js` y `src/hooks/useProjectMeta.js`:
  extraídos del patrón que ya usaba `ProjectDashboard` (suscripción a un
  store en memoria + `localStorage`), ahora también los consume
  `TechnicalReport` para la tabla de BOM total. Guardar un cálculo en
  cualquier calculadora actualiza el Dashboard y el BOM total al instante,
  sin recargar la página.

### Referencia rápida

- `QuickReferencePanel.jsx`: botón flotante ("REF") con un panel lateral que
  lista rugosidades de materiales y densidad/viscosidad de fluidos. Los
  datos se leen directamente de `MATERIAL_CATALOG` / `FLUID_CATALOG`
  (`materials.js`) — no hay una copia nueva que se pueda desincronizar.
  Nota: la petición original la situaba "en la barra lateral"; esta interfaz
  no tiene una barra lateral estructural, así que se implementó como panel
  flotante de acceso global (visible en cualquier pestaña).

### Verificación

- `oxlint` y `vite build` limpios.
- Confirmado que `engineering.js` y `materials.js` no se han tocado en esta
  sesión (cero riesgo de regresión en el motor de cálculo).
- Motor de cálculo re-verificado con script ad-hoc: rugosidad de `pp_r`
  correcta, verificación de velocidad de gas operativa.
- Import de proyecto probado contra: JSON roto, JSON con forma incorrecta,
  y JSON válido con una entrada corrupta mezclada — en los tres casos el
  sistema avisa sin colapsar.
