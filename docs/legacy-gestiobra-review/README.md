# Rescate de la carpeta duplicada `gestiobra/gestiobra/`

Durante la reorganización del repo (2026-07-03) se encontró una copia completa y
paralela del proyecto anidada en `gestiobra/gestiobra/`, con su propio historial
de git (`.git_disabled`, deshabilitado): `GestiObra v0.1` → `v0.2` → `Engineering
upgrade` → `dashboard dinámico`. La carpeta duplicada ya se eliminó por completo,
pero antes se copiaron aquí los archivos que **no existen en el `src/` activo**
para que puedas revisarlos y decidir si merece la pena integrarlos.

## Por qué importa esto

Los ficheros `OPERARIOS_TABLE.sql` y `PARTIDAS_OBRA_TABLE.sql` (ahora en
`supabase/`) definen tablas `operarios` y `partidas_obra` + una vista
`v_rentabilidad_obras`. El código que realmente las consume (hooks, queries,
cálculo de rentabilidad) **no llegó a copiarse al `src/` principal** — se quedó
solo en la copia duplicada. Es decir: hay esquema de base de datos en el
proyecto activo sin su capa de datos correspondiente.

## Archivos rescatados

| Archivo | Qué hace | Encaja con |
|---|---|---|
| `useOperarios.js` | Hook CRUD de operarios (alta/baja lógica, tarifa media, conteo por categoría) | `supabase/OPERARIOS_TABLE.sql` |
| `useMateriales.js` | Hook CRUD de materiales, con fallback al catálogo técnico estático si no hay conexión | tabla `materiales` |
| `queries.js` | Queries de rentabilidad por obra (usa la vista `v_rentabilidad_obras`, desglose de costes, ranking de obras) | `supabase/PARTIDAS_OBRA_TABLE.sql` |
| `calculo-rentabilidad.js` (+ `.test.js`) | Funciones puras de cálculo: coste total, margen, semáforo de rentabilidad (óptimo/aceptable/ajustado/pérdida) | usado por `queries.js` |
| `mocks.js` | Datos de ejemplo (`OBRAS_MOCK`, `PRESUPUESTOS_MOCK`, `OPERARIOS_MOCK`) para modo demo | — |
| `db-client.reference.js` | Versión alternativa de `src/lib/db-client.js`: expone `conexionActiva` y wrappers CRUD (`dbObras`, `dbPresupuestos`, `dbMateriales`, `dbOperarios`) en vez de lanzar una excepción si faltan credenciales | compárese con `src/lib/db-client.js` actual |

## Antes de integrar nada

El `src/` principal está en medio de un cambio activo (a fecha de este rescate,
`src/data/mocks.js` aparece borrado y `useObras.js`/`usePresupuestos.js`/
`Dashboard.jsx` modificados sin commitear) relacionado con el error de conexión
descrito en `../SOLUCION_ERROR_CONEXION.md`. Revisa primero ese trabajo en curso
para no pisarlo antes de portar nada de esta carpeta.

Estos archivos son **material de referencia**, no código listo para pegar tal
cual: revisa nombres de tabla, columnas y que `db-client.reference.js` no
choque con la implementación actual de `src/lib/db-client.js`.
