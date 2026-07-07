# Contexto Técnico Consolidado
Generado: 2026-06-30T06:37:03.758Z
Total documentos: 2

---

## Normativas UNE, RITE, CTE

### Cálculo de Secciones de Cable según UNE EN 60364-5-52

**Ruta:** docs\referencia\normativas\UNE-EN-60364-5-52.md

**Referencias normativas:**
- rite
- ITC-
- REBT

#### Descripción

Este documento recoge los criterios para el cálculo de secciones de cables de cobre en instalaciones eléctricas de baja tensión según la normativa UNE EN 60364-5-52.

#### Método de cálculo

### Por intensidad admisible
La sección mínima se determina por la intensidad nominal del circuito:

```
I_n = I_z / (k1 * k2 * k3)
```

Donde:
- **I_n**: Intensidad nominal del cable (A)
- **I_z**: Intensidad de cálculo del circuito (A)
- **k1**: Factor de corrección por método de instalación
- **k2**: Factor de corrección por agrupamiento de cables
- **k3**: Factor de corrección por temperatura ambiente

### Factores de corrección

#### k1 - Método de instalación
| Método | k1 |
|--------|-----|
| A1: Empotrado en pared aislante | 0.9 |

#### Secciones mínimas por intensidad

### Cobre, instalación empotrada (k1=0.9, k2=1.0, k3=1.0)

| I_n (A) | Sección mínima (mm²) |
|---------|----------------------|
| ≤ 16 | 2.5 |
| ≤ 20 | 4 |
| ≤ 25 | 4 |
| ≤ 32 | 6 |
| ≤ 40 | 10 |
| ≤ 50 | 16 |
| ≤ 63 | 16 |
| ≤ 80 | 25 |
| ≤ 100 | 35 |
| ≤ 125 | 50 |
| ≤ 160 | 70 |
| ≤ 200 | 95 |

#### Caída de tensión máxima admisible

Según ITC-BT-19:
- **Alumbrado**: 3% desde el origen de la instalación hasta cualquier punto de utilización
- **Fuerza (motores)**: 4% desde el origen hasta el receptor
- **Resto de usos**: 5% desde el origen hasta cualquier punto

### Fórmula de caída de tensión

```
ΔU = (L * I * cos(φ)) / (S * γ)
```

Donde:
- **ΔU**: Caída de tensión (V)
- **L**: Longitud del cable (m)
- **I**: Intensidad (A)
- **cos(φ)**: Factor de potencia
- **S**: Sección del cable (mm²)
- **γ**: Conductividad del cobre (56 m/(Ω·mm²))

#### Ejemplo práctico

**Datos:**
- Circuito: Alumbrado vivienda
- I_z = 16 A
- Longitud: 20 m
- Instalación: Empotrada en pared aislante
- Agrupamiento: 1 cable
- Temperatura: 25°C

**Cálculo:**
1. k1 = 0.9 (empotrado aislante)
2. k2 = 1.0 (1 cable)
3. k3 = 1.0 (25°C)
4. I_n = 16 / (0.9 * 1.0 * 1.0) = 17.8 A
5. Según tabla: I_n ≤ 16 A → Sección mínima 2.5 mm²

**Verificación por caída de tensión:**
```
ΔU = (20 * 16 * 1.0) / (2.5 * 56) = 0.23 V
%ΔU = (0.23 / 230) * 100 = 0.1% < 3% ✓
```

---

## referencia

### Documentación de Referencia Técnica

**Ruta:** docs\referencia\README.md

**Referencias normativas:**
- RITE
- CTE
- UNE 12345:2020

#### Estructura

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

#### Uso

1. Exporta tus notas de NotebookLM en formato Markdown (.md) o PDF
2. Colócalas en la carpeta correspondiente según su categoría
3. Ejecuta el script de ingesta: `npm run ingest:docs`
4. El sistema indexará el contenido para su uso en el desarrollo

#### Formato recomendado para Markdown

```markdown
# Título del Documento

#### Descripción

Breve descripción del contenido.

#### Contenido técnico

Aquí va el contenido detallado, normativas, fórmulas, etc.

---
