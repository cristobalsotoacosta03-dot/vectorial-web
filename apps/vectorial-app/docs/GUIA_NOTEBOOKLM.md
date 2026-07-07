# Guía de Integración NotebookLM - GestiObra

Esta guía explica cómo integrar tu flujo de trabajo de NotebookLM con el entorno de desarrollo de GestiObra.

## 📋 Índice

1. [Visión General](#visión-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Flujo de Trabajo](#flujo-de-trabajo)
4. [Exportar desde NotebookLM](#exportar-desde-notebooklm)
5. [Procesar Documentos](#procesar-documentos)
6. [Uso en Desarrollo](#uso-en-desarrollo)
7. [Solución de Problemas](#solución-de-problemas)

---

## Visión General

El sistema permite centralizar toda la documentación técnica que tienes en NotebookLM para que el asistente de desarrollo pueda consultarla antes de generar código relacionado con ingeniería.

### Componentes del Sistema

```
docs/
├── referencia/          # Tus documentos exportados de NotebookLM
│   ├── normativas/      # UNE, RITE, CTE, REBT, ITC
│   ├── calculos/        # Métodos de cálculo y fórmulas
│   ├── materiales/      # Catálogos y fichas técnicas
│   └── ejemplos/        # Casos prácticos
│
├── output/              # Archivos generados automáticamente
│   ├── indice.json      # Índice estructurado de documentos
│   └── contexto-tecnico.md  # Contexto consolidado para el asistente
│
└── GUIA_NOTEBOOKLM.md   # Esta guía

scripts/
└── ingest-docs.js       # Script de procesamiento

.clinerules              # Reglas de comportamiento del asistente
```

---

## Estructura de Carpetas

### docs/referencia/

Coloca aquí tus documentos exportados de NotebookLM organizados por categoría:

#### normativas/
Documentos oficiales de normativas:
- UNE EN 60364 (instalaciones eléctricas)
- RITE (Reglamento de Instalaciones Térmicas)
- CTE (Código Técnico de la Edificación)
- REBT (Reglamento Electrotécnico de Baja Tensión)
- ITC (Instrucciones Técnicas Complementarias)

**Ejemplo de archivo:**
```
docs/referencia/normativas/UNE-EN-60364-5-52.md
```

#### calculos/
Métodos de cálculo, fórmulas y procedimientos:
- Cálculo de secciones de cable
- Dimensionamiento de climatización
- Cálculo de pérdidas de carga
- Factores de demanda

**Ejemplo de archivo:**
```
docs/referencia/calculos/calculo-cargas-termicas.md
```

#### materiales/
Catálogos, fichas técnicas y especificaciones:
- Cables y conductores
- Tuberías y accesorios
- Equipos de climatización
- Materiales de fontanería

**Ejemplo de archivo:**
```
docs/referencia/materiales/cables-copper-normativa.md
```

#### ejemplos/
Casos prácticos, instalaciones tipo, presupuestos ejemplo:
- Instalación eléctrica tipo
- Sistema de climatización ejemplo
- Presupuesto de obra completo

**Ejemplo de archivo:**
```
docs/referencia/ejemplos/instalacion-electricidad-vivienda.md
```

---

## Flujo de Trabajo

### 1. Exportar desde NotebookLM

#### Opción A: Exportar como Markdown (Recomendado)

1. En NotebookLM, abre el documento que quieres exportar
2. Click en el menú (⋮) → "Exportar"
3. Selecciona "Exportar como Markdown"
4. Guarda el archivo en la carpeta correspondiente de `docs/referencia/`

**Ventajas:**
- Formato legible y editable
- Conserva estructura de encabezados
- Fácil de versionar en Git
- Procesamiento rápido

#### Opción B: Exportar como PDF

1. En NotebookLM, abre el documento
2. Click en el menú (⋮) → "Exportar como PDF"
3. Guarda el PDF en la carpeta correspondiente

**Nota:** Los PDF requieren `pdf-parse` para extraer el texto. Por ahora, el sistema los registra pero no extrae su contenido automáticamente.

### 2. Organizar Documentos

Coloca cada archivo en la carpeta correcta:

```
docs/referencia/
├── normativas/
│   ├── REBT-2024.md                    ✓ Correcto
│   └── normativa-electricidad.pdf     ✓ Correcto
├── calculos/
│   └── formula-caida-tension.md        ✓ Correcto
├── materiales/
│   └── catalogo-cables-2024.md         ✓ Correcto
└── ejemplos/
    └── presupuesto-tipo.md             ✓ Correcto
```

### 3. Procesar Documentos

Ejecuta el script de ingesta:

```bash
npm run ingest:docs
```

**El script hará:**
1. Escanear todos los archivos `.md` y `.pdf` en `docs/referencia/`
2. Extraer metadatos (título, referencias normativas, secciones)
3. Generar `docs/output/indice.json` con el índice estructurado
4. Generar `docs/output/contexto-tecnico.md` con el contenido consolidado

**Ejemplo de salida:**
```
🚀 Iniciando ingesta de documentos técnicos...

📂 Escaneando docs/referencia/...

📄 Procesando Markdown: REBT-2024.md
📄 Procesando Markdown: RITE-2023.md
📄 Procesando Markdown: calculo-cargas.md

✅ Procesados 3 documentos

📊 Índice generado: docs/output/indice.json
📝 Contexto generado: docs/output/contexto-tecnico.md

📈 Resumen por categoría:
   Normativas UNE, RITE, CTE: 2 documentos
   Métodos de cálculo y fórmulas: 1 documentos

✨ Ingesta completada exitosamente!
```

### 4. Usar en Desarrollo

Cuando solicites al asistente que genere código de ingeniería, automáticamente:

1. Consultará `docs/referencia/` primero
2. Leerá el contexto consolidado en `docs/output/contexto-tecnico.md`
3. Aplicará las normativas encontradas
4. Te informará de la fuente utilizada

**Ejemplo de interacción:**

```
Tú: "Necesito calcular la sección de cable para una línea de 16A a 20m"

Asistente:
📚 FUENTE: docs/referencia/normativas/UNE-EN-60364-5-52.md
📋 REFERENCIA: UNE EN 60364-5-52
📝 EXTRACTO: "Para instalaciones empotradas, la sección mínima 
   por intensidad es de 2.5mm² para I_n ≤ 16A"
✅ APLICACIÓN: Usando cable de cobre 2.5mm² según normativa

[Genera el código correspondiente...]
```

---

## Uso en Desarrollo

### Reglas Automáticas

El archivo `.clinerules` configura automáticamente:

1. **Prioridad de fuentes**: Siempre consulta `docs/referencia/` antes de usar conocimiento general
2. **Validación de cálculos**: Verifica que cumplan normativa
3. **Formato de respuesta**: Muestra la fuente normativa utilizada
4. **Restricciones**: No inventa valores de normativas

### Comandos Útiles

```bash
# Procesar documentos después de cambios
npm run ingest:docs

# Ver índice JSON
cat docs/output/indice.json

# Ver contexto consolidado
cat docs/output/contexto-tecnico.md

# En Windows PowerShell
Get-Content docs/output/indice.json
Get-Content docs/output/contexto-tecnico.md
```

### Actualizar Documentación

Cuando modifiques documentos en NotebookLM:

1. Exporta la versión actualizada
2. Reemplaza el archivo en `docs/referencia/`
3. Ejecuta `npm run ingest:docs`
4. El sistema actualiza automáticamente el índice y contexto

---

## Formato Recomendado para Markdown

Para obtener mejores resultados, estructura tus documentos así:

```markdown
# Título del Documento

## Descripción
Breve descripción del contenido y alcance.

## Contenido técnico

### Sección 1
Contenido detallado...

### Sección 2
Más contenido...

## Fórmulas

### Fórmula 1
Descripción de la fórmula...

## Referencias normativas
- UNE EN 60364-5-52:2014
- RITE 2023
- ITC-BT-07

## Notas
Notas adicionales...
```

### Buenas Prácticas

1. **Usa encabezados jerárquicos**: `# ## ### ####`
2. **Incluye referencias completas**: `UNE EN 60364-5-52:2014` en lugar de `UNE 60364`
3. **Separa secciones claramente**: Una idea por sección
4. **Añade ejemplos**: Incluye casos prácticos cuando sea posible
5. **Mantén actualizado**: Si detectas información obsoleta, actualízala en NotebookLM

---

## Solución de Problemas

### El script no encuentra documentos

**Problema:** `⚠️ No se encontraron documentos para procesar`

**Solución:**
1. Verifica que la carpeta `docs/referencia/` existe
2. Asegúrate de que hay archivos `.md` o `.pdf` en las subcarpetas
3. Ejecuta: `npm run ingest:docs`

### No se detectan referencias normativas

**Problema:** Las referencias no aparecen en el índice

**Solución:**
1. Usa el formato completo: `UNE EN 60364-5-52` en lugar de `UNE 60364`
2. Coloca las referencias en líneas separadas o al final de secciones
3. El patrón regex detecta: `UNE`, `RITE`, `CTE`, `REBT`, `ITC`

### PDFs no se procesan

**Problema:** `⚠️ PDF detectado: requiere pdf-parse`

**Solución:**
1. Instala la dependencia: `npm install pdf-parse`
2. Descomenta las líneas correspondientes en `scripts/ingest-docs.js`
3. Vuelve a ejecutar: `npm run ingest:docs`

### El asistente no consulta la documentación

**Problema:** No usa la información de `docs/referencia/`

**Solución:**
1. Verifica que `.clinerules` existe en la raíz del proyecto
2. Asegúrate de haber ejecutado `npm run ingest:docs` al menos una vez
3. El asistente lee automáticamente `.clinerules` al iniciar

---

## Ejemplo Completo

### 1. Exportar desde NotebookLM

Tienes en NotebookLM una nota sobre "Cálculo de secciones de cable según UNE EN 60364".

### 2. Exportar como Markdown

En NotebookLM:
- Menú → Exportar → Markdown
- Guardar como: `docs/referencia/calculos/secciones-cable.md`

### 3. Contenido del archivo

```markdown
# Cálculo de Secciones de Cable según UNE EN 60364

## Método de cálculo
Para determinar la sección de cable según intensidad...

## Fórmula
I_n = I_z / (k1 * k2 * k3)

## Valores de referencia
- Instalación empotrada: k1 = 0.9
- Agrupamiento de 2 cables: k2 = 0.8
- Temperatura 30°C: k3 = 1.0

## Referencias
- UNE EN 60364-5-52:2014
- ITC-BT-07
```

### 4. Procesar

```bash
npm run ingest:docs
```

### 5. Usar en desarrollo

```
Tú: "Calcula la sección para 16A, 20m, instalación empotrada"

Asistente:
📚 FUENTE: docs/referencia/calculos/secciones-cable.md
📋 REFERENCIA: UNE EN 60364-5-52
📝 EXTRACTO: "Para instalación empotrada, k1 = 0.9"
✅ APLICACIÓN: Aplicando factor de corrección 0.9

[Genera código con sección 2.5mm²...]
```

---

## Mantenimiento

### Actualizar documentación

1. Modifica el documento en NotebookLM
2. Exporta la nueva versión
3. Reemplaza el archivo en `docs/referencia/`
4. Ejecuta `npm run ingest:docs`

### Revisar índice

```bash
# Ver qué documentos tienes indexados
cat docs/output/indice.json

# Ver estadísticas
# - Total de documentos
# - Documentos por categoría
# - Referencias normativas detectadas
```

### Limpiar output

Si necesitas regenerar todo:

```bash
# Eliminar archivos generados
rm -rf docs/output/

# Volver a generar
npm run ingest:docs
```

---

## Próximos Pasos

1. **Exporta tus documentos** de NotebookLM a `docs/referencia/`
2. **Ejecuta** `npm run ingest:docs` para procesarlos
3. **Revisa** `docs/output/contexto-tecnico.md` para verificar el contenido
4. **Comienza a desarrollar** - el asistente usará automáticamente tu documentación

---

## Soporte

Si tienes problemas:
1. Revisa esta guía
2. Verifica que `.clinerules` esté en la raíz del proyecto
3. Asegúrate de haber ejecutado `npm run ingest:docs`
4. Consulta los archivos en `docs/output/` para verificar el índice

---

**Última actualización:** 2026-06-30
**Versión:** 1.0.0