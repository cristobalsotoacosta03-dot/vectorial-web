# Solución: Error de Conexión en GestiObra

## Diagnóstico

El error "No se pudieron cargar los datos desde la base de datos" indica que **las tablas de Supabase no existen** en tu proyecto.

### Estado actual:
- ✅ Variables de entorno configuradas correctamente en `.env`
- ✅ Cliente Supabase inicializado correctamente
- ✅ Servidor Vite ejecutándose en `http://localhost:5174/`
- ❌ **FALTA**: Ejecutar el script SQL en Supabase para crear las tablas

---

## Solución Paso a Paso

### 1. Acceder a Supabase Dashboard

1. Abre tu navegador y ve a: **https://supabase.com/dashboard**
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: **szfikjyaktdpsimpqgxl** (o el nombre que le hayas dado)

### 2. Ejecutar el Script SQL

1. En el menú lateral izquierdo, haz clic en **"SQL Editor"** (icono de código `</>`)
2. Haz clic en **"New query"** (botón azul arriba a la derecha)
3. **Copia TODO el contenido** del archivo `supabase/SUPABASE_SETUP.sql` de tu proyecto
4. **Pega** el contenido en el editor SQL
5. Haz clic en **"Run"** (botón verde) o presiona `Ctrl + Enter`

### 3. Verificar que se ejecutó correctamente

Deberías ver un mensaje en verde que dice:
```
✅ Success. No rows returned
```

Y en la sección **"Table Editor"** (icono de tabla) deberías ver:
- ✅ Tabla `obras` (con 4 registros de ejemplo)
- ✅ Tabla `presupuestos` (con 5 registros de ejemplo)
- ✅ Tabla `materiales` (vacía)
- ✅ Tabla `plantillas_tipo` (con 4 plantillas: GLP, Aerotermia, Solar Térmica, Aire Comprimido)

### 4. Recargar la aplicación

1. Vuelve a tu navegador en `http://localhost:5174/`
2. Recarga la página con `F5` o `Ctrl + R`
3. **¡Listo!** Ahora deberías ver los datos reales de Supabase

---

## ¿Qué hace el script SQL?

El script `supabase/SUPABASE_SETUP.sql` crea:

### Tablas principales:
- **`obras`**: Proyectos/obras de instalaciones
- **`presupuestos`**: Presupuestos asociados a obras
- **`materiales`**: Catálogo técnico de materiales

### Tablas del simulador técnico:
- **`plantillas_tipo`**: Tipos de instalación (GLP, Aerotermia, Solar, Aire Comprimido)
- **`variables_plantilla`**: Parámetros configurables por tipo de instalación
- **`formula_materiales`**: BOM paramétrico con coeficientes

### Datos de ejemplo:
- 4 obras de ejemplo (HVAC, fontanería, climatización, mantenimiento)
- 5 presupuestos de ejemplo con diferentes estados
- 4 plantillas de simulador técnico con sus materiales

### Seguridad:
- Row Level Security (RLS) habilitado en todas las tablas
- Políticas de acceso público (para prototipo)
- Triggers para actualizar timestamps automáticamente

---

## Si el error persiste

### Verifica la consola del navegador:

1. Abre las **Herramientas de desarrollador** (`F12`)
2. Ve a la pestaña **"Console"**
3. Deberías ver mensajes como:
   ```
   ✅ Cliente Supabase inicializado correctamente
   ✅ Datos cargados desde Supabase
   ```

### Posibles errores y soluciones:

| Error | Causa | Solución |
|-------|-------|----------|
| `La tabla "obras" no existe` | No ejecutaste el script SQL | Sigue los pasos 1-3 arriba |
| `Sin permisos para acceder` | Políticas RLS mal configuradas | Verifica que el script se ejecutó completamente |
| `Credenciales inválidas` | API key incorrecta | Verifica `.env` tiene la clave correcta |
| `Error de conexión` | Sin internet | Verifica tu conexión |

---

## Modo Demo vs Modo Producción

### Modo Demo (actual):
- Si Supabase falla, la app carga datos de ejemplo automáticamente
- Los datos NO se guardan en la base de datos
- Útil para pruebas y desarrollo

### Modo Producción (objetivo):
- Todos los datos se guardan en Supabase
- Requiere ejecutar el script SQL una sola vez
- Los datos persisten entre sesiones

---

## Próximos pasos recomendados

1. **Ejecuta el script SQL** en Supabase (paso 2 arriba)
2. **Recarga la aplicación** y verifica que se muestren los datos reales
3. **Prueba crear una obra nueva** desde el botón "+ Nueva Obra"
4. **Prueba crear un presupuesto** desde el botón "+ Presupuesto"
5. **Verifica en Supabase** que los datos se guardaron correctamente

---

## Contacto y soporte

Si tienes problemas:
1. Revisa la consola del navegador (`F12` → Console)
2. Revisa la terminal de VS Code donde corre `npm run dev`
3. Verifica que el archivo `.env` tenga las credenciales correctas
4. Asegúrate de haber ejecutado el script SQL completo en Supabase

---

**Última actualización**: 2026-07-01
**Versión**: GestiObra v0.2.0