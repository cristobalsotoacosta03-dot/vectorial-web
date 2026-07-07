# Documentación de Referencia Técnica

Esta carpeta centraliza toda la información técnica exportada de NotebookLM para ser utilizada como contexto en el desarrollo de GestiObra.

## Estructura

```
docs/referencia/
├── README.md                 # Este archivo
├── normativas/               # Normativas UNE, RITE, CTE, etc.
│   ├── UNE-EN-60364.md
│   ├── RITE.md
│   └── CTE.md
├── calculos/                 # Métodos de cálculo y fórmulas
│   ├── instalaciones-electricas.md
│   ├── climatizacion.md
│   └── fontaneria.md
├── materiales/               # Catálogos y fichas técnicas
│   ├── cables.md
│   ├── tuberias.md
│   └── equipos.md
└── ejemplos/                 # Casos prácticos y ejemplos
    ├── instalacion-tipo.md
    └── presupuesto-ejemplo.md
```

## Uso

1. Exporta tus notas de NotebookLM en formato Markdown (.md) o PDF
2. Colócalas en la carpeta correspondiente según su categoría
3. Ejecuta el script de ingesta: `npm run ingest:docs`
4. El sistema indexará el contenido para su uso en el desarrollo

## Formato recomendado para Markdown

```markdown
# Título del Documento

## Descripción
Breve descripción del contenido.

## Contenido técnico
Aquí va el contenido detallado, normativas, fórmulas, etc.

## Referencias
- UNE 12345:2020
- RITE 2023
```

## Notas

- Los archivos PDF se convertirán automáticamente a Markdown durante la ingesta
- Mantén una estructura clara con encabezados jerárquicos (# ## ###)
- Incluye referencias normativas completas para facilitar su identificación