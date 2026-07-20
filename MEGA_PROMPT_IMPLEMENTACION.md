# MEGA PROMPT: Transformación de Vectorial

## 📋 INSTRUCCIONES PARA CLAUDE

**Eres el arquitecto y desarrollador principal de Vectorial. Tu misión es transformar esta aplicación de ingeniería básica en la suite más completa del mercado para instaladores, manteniendo un código limpio, profesional y SIN elementos de IA.**

---

## 🎯 CONTEXTO DEL PROYECTO

### Estado Actual
- **Nombre:** Vectorial (antes GestiObra)
- **Tipo:** Monorepo con app de ingeniería + web promocional
- **Stack:** React 19, Vite, Tailwind CSS, Framer Motion, Supabase
- **URL:** https://gestiobra.vercel.app
- **Enfoque:** Calculadoras de instalaciones técnicas según normativa española (RITE, RIGLO, UNE, CTE)

### Estructura Actual
```
vectorial/
├── apps/
│   ├── vectorial-app/     # App de ingeniería (OBJETIVO PRINCIPAL)
│   └── vectorial-web/     # Landing page (no tocar por ahora)
├── package.json
└── vercel.json
```

### App Actual
```
apps/vectorial-app/
├── src/
│   ├── components/
│   │   ├── CalcACS.jsx
│   │   ├── CalcGLP.jsx
│   │   ├── CalcTuberias.jsx
│   │   ├── ChecklistOCA.jsx
│   │   ├── ConversorUnidades.jsx
│   │   └── layout/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Obras.jsx
│   │   ├── Presupuestos.jsx
│   │   ├── Catalogo.jsx
│   │   ├── Calculadoras.jsx
│   │   └── ...
│   ├── lib/
│   │   ├── engineering.js    # MOTOR DE CÁLCULO (NO TOCAR)
│   │   ├── materials.js      # Catálogo de materiales
│   │   └── ...
│   └── styles/
│       └── tokens.css        # Sistema de diseño
```

---

## 🚀 MISIÓN PRINCIPAL

Transformar Vectorial en la **aplicación de ingeniería y cálculos más completa del mercado** con:

1. ✅ **20+ calculadoras** de ingeniería (todas las especialidades)
2. ✅ **Interfaz premium** profesional, SIN IA, atractiva
3. ✅ **Herramientas de diseño** (planos 2D, esquemas)
4. ✅ **Gestión completa** de proyectos (presupuestos, obras, documentación)
5. ✅ **100% responsive** y accesible (WCAG 2.1)
6. ✅ **Rendimiento óptimo** (Lighthouse > 90)

---

## 📐 FILOSOFÍA DE DISEÑO (CRÍTICO)

### Estética: Industrial-Profesional
- **Paleta de colores:**
  - Primario: Azul técnico `#0066CC` (confianza, profesionalismo)
  - Secundario: Grises neutros (`#F8FAFC`, `#E2E8F0`, `#1E293B`)
  - Acento: Naranja `#F97316` (acciones, alertas)
  - Éxito: Verde `#10B981`
  - Error: Rojo `#EF4444`
  - Fondo oscuro: `#0F172A` (slate-950)

- **Tipografía:**
  - Fuente principal: Inter (Google Fonts)
  - Pesos: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
  - Tamaños base: 14px (sm), 16px (base), 18px (lg), 24px (xl)

- **Iconografía:**
  - Usar Lucide React (consistente, limpio)
  - Tamaños: 16px, 20px, 24px
  - Stroke: 2px
  - Sin iconos decorativos excesivos

- **Animaciones:**
  - Solo con Framer Motion
  - Duración: 200-300ms (rápidas)
  - Easing: ease-out
  - Propósito: feedback visual, no decoración

### Principios de UI
1. **Jerarquía visual clara** - Títulos, subtítulos, cuerpo
2. **Espaciado generoso** - No saturar, respirar
3. **Contraste alto** - Legibilidad primero
4. **Feedback inmediato** - Estados hover, active, loading
5. **Consistencia** - Mismos patrones en toda la app
6. **Accesibilidad** - Focus states, ARIA labels, navegación teclado

### LO QUE NO HACER
- ❌ NO usar emojis en títulos o botones
- ❌ NO usar gradientes llamativos
- ❌ NO usar sombras excesivas
- ❌ NO usar animaciones innecesarias
- ❌ NO usar colores pastel o "tiernos"
- ❌ NO mencionar IA en ningún lado
- ❌ NO usar fuentes decorativas

---

## 🏗️ FASE 1: FUNDACIÓN Y SISTEMA DE DISEÑO (Semanas 1-4)

### Objetivo
Crear la base visual y de componentes que sustentará toda la aplicación.

### Tarea 1.1: Sistema de Diseño Completo

**Archivo:** `apps/vectorial-app/src/styles/tokens.css`

**Contenido:**
```css
/* ============================================
   VECTORIAL - Design System Tokens
   Versión: 1.0.0
   ============================================ */

@layer theme {
  /* Colores primarios */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #0066CC;
  --color-primary-600: #0052a3;
  --color-primary-700: #003d7a;

  /* Colores neutros */
  --color-gray-50: #F8FAFC;
  --color-gray-100: #F1F5F9;
  --color-gray-200: #E2E8F0;
  --color-gray-300: #CBD5E1;
  --color-gray-400: #94A3B8;
  --color-gray-500: #64748B;
  --color-gray-600: #475569;
  --color-gray-700: #334155;
  --color-gray-800: #1E293B;
  --color-gray-900: #0F172A;

  /* Acentos */
  --color-accent: #F97316;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* Tipografía */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;

  /* Espaciado */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;

  /* Bordes */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Sombras */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

### Tarea 1.2: Componentes UI Base

**Crear:** `apps/vectorial-app/src/components/ui/`

**Archivos a crear:**
1. `Button.jsx` - Botones con variantes (primary, secondary, danger, ghost)
2. `Input.jsx` - Inputs con validación visual
3. `Card.jsx` - Contenedores con sombra y bordes
4. `Modal.jsx` - Diálogos con overlay y animación
5. `Toast.jsx` - Notificaciones toast
6. `Badge.jsx` - Etiquetas y badges
7. `Tabs.jsx` - Navegación por pestañas
8. `Dropdown.jsx` - Menús desplegables
9. `Tooltip.jsx` - Información contextual
10. `Spinner.jsx` - Indicadores de carga

**Especificación Button.jsx:**
```jsx
import { motion } from 'framer-motion'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  onClick,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {!loading && icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </motion.button>
  )
}
```

### Tarea 1.3: Rediseño de Layout Principal

**Archivo:** `apps/vectorial-app/src/components/layout/AppLayout.jsx`

**Mejoras:**
1. Sidebar con iconos Lucide + texto, colapsable
2. Header con búsqueda global (Cmd+K)
3. Transiciones suaves entre páginas
4. Footer con información técnica

**Especificación:**
```jsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Header from './Header'
import ErrorBoundary from '../ErrorBoundary'
import SubscriptionGate from '../SubscriptionGate'

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SubscriptionGate>
              <ErrorBoundary>
                <AnimatePresence mode="wait">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Outlet />
                  </motion.div>
                </AnimatePresence>
              </ErrorBoundary>
            </SubscriptionGate>
          </div>
        </main>

        <footer className="py-4 px-6 text-center text-xs text-gray-500 border-t border-gray-200 dark:border-gray-800">
          <p>Vectorial v1.0 · RITE · RIGLO · UNE-EN 1057 · CTE DB-HE</p>
        </footer>
      </div>
    </div>
  )
}
```

### Tarea 1.4: Mejora de Páginas Existentes

#### Dashboard
**Archivo:** `apps/vectorial-app/src/pages/Dashboard.jsx`

**Mejoras:**
- Cards con métricas clave (obras activas, presupuestos, calculadoras usadas)
- Gráfico de actividad semanal (Recharts)
- Accesos rápidos a calculadoras
- Lista de obras recientes

**Especificación visual:**
```
┌─────────────────────────────────────────┐
│ Dashboard                    [Buscar...] │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ 12   │ │ 45   │ │ 89   │ │ 23   │  │
│  │Obras │ │Pres. │ │Calc. │ │Mat.  │  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
│                                         │
│  Actividad Semanal                      │
│  ┌─────────────────────────────────┐   │
│  │  [GRÁFICO DE BARRAS]           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Accesos Rápidos                        │
│  ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │ Tuberías │ │   GLP    │ │  ACS   │  │
│  └──────────┘ └──────────┘ └────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

#### Calculadoras
**Archivo:** `apps/vectorial-app/src/pages/Calculadoras.jsx`

**Mejoras:**
- Grid de calculadoras con iconos y descripciones
- Filtros por categoría (Hidráulica, Eléctrica, Térmica, Gas)
- Búsqueda de calculadoras
- Cards con hover effect

#### Obras y Presupuestos
**Mejoras:**
- Tablas con filtros y búsqueda
- Acciones rápidas (editar, eliminar, exportar)
- Vista de lista y grid
- Ordenación por columnas

---

## 🧮 FASE 2: AMPLIACIÓN DE CÁLCULOS (Semanas 5-12)

### Objetivo
Añadir 15+ calculadoras nuevas cubriendo todas las especialidades de ingeniería.

### Estructura de Calculadoras

**Patrón común:**
```
apps/vectorial-app/src/components/calculators/
├── Hidraulica/
│   ├── CalcVasoExpansion.jsx
│   ├── CalcGrupoPresion.jsx
│   ├── CalcRiego.jsx
│   └── CalcHidrantePCI.jsx
├── Electrico/
│   ├── CalcSeccionCable.jsx
│   ├── CalcProtecciones.jsx
│   ├── CalcLuminotecnia.jsx
│   └── CalcPuestaTierra.jsx
├── Termico/
│   ├── CalcCalefaccion.jsx
│   ├── CalcSueloRadiante.jsx
│   ├── CalcAislamiento.jsx
│   └── CalcCargaTermica.jsx
├── Gas/
│   ├── CalcGLP.jsx (mejorar existente)
│   └── CalcVentilacionGas.jsx
├── Fontaneria/
│   ├── CalcAguaFria.jsx
│   ├── CalcAguaCaliente.jsx
│   ├── CalcSaneamiento.jsx
│   └── CalcPluviales.jsx
└── Renovables/
    ├── CalcSolarTermica.jsx
    ├── CalcFotovoltaica.jsx
    ├── CalcBiomasa.jsx
    └── CalcGeotermia.jsx
```

### Tarea 2.1: Calculadora de Vaso de Expansión

**Archivo:** `apps/vectorial-app/src/components/calculators/Hidraulica/CalcVasoExpansion.jsx`

**Cálculo:**
- Volumen del vaso según UNE 100155
- Cálculo de presión de llenado
- Cálculo de presión de tarado
- Considerar instalación cerrada/abierta

**Fórmulas:**
```
V = (Vs × (P2 - P1)) / (P1 - Pc)
```
Donde:
- V = Volumen del vaso (L)
- Vs = Volumen de agua en la instalación (L)
- P1 = Presión de tarado (bar)
- P2 = Presión de llenado (bar)
- Pc = Presión de corte (bar)

**UI:**
```
┌─────────────────────────────────────────┐
│ Vaso de Expansión                       │
├─────────────────────────────────────────┤
│                                         │
│  Volumen de agua en instalación (L)     │
│  [___________]                          │
│                                         │
│  Presión de tarado (bar)                │
│  [___________]                          │
│                                         │
│  Presión de llenado (bar)               │
│  [___________]                          │
│                                         │
│  Presión de corte (bar)                 │
│  [___________]                          │
│                                         │
│  [Calcular]                             │
│                                         │
│  Resultados:                            │
│  ┌─────────────────────────────────┐   │
│  │ Volumen vaso: 50 L              │   │
│  │ Presión mínima: 1.5 bar         │   │
│  │ Presión máxima: 3.0 bar         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Exportar PDF] [Compartir]             │
└─────────────────────────────────────────┘
```

### Tarea 2.2: Calculadora de Sección de Cable

**Archivo:** `apps/vectorial-app/src/components/calculators/Electrico/CalcSeccionCable.jsx`

**Cálculo:**
- Según ITC-BT-19 y UNE 20460
- Caída de tensión máxima 3% (alumbrado) o 5% (fuerza)
- Factor de corrección por temperatura
- Factor de corrección por agrupamiento

**Fórmula:**
```
S = (2 × L × I × cos(φ)) / (56 × ΔU × V)
```
Donde:
- S = Sección (mm²)
- L = Longitud (m)
- I = Intensidad (A)
- cos(φ) = Factor de potencia
- ΔU = Caída de tensión (V)
- V = Tensión (V)

### Tarea 2.3: Calculadora de Carga Térmica

**Archivo:** `apps/vectorial-app/src/components/calculators/Termico/CalcCargaTermica.jsx`

**Cálculo:**
- Método de balance de calor
- Considerar: transmisión, ventilación, radiación solar, personas, equipos
- Según RITE y CTE DB-HE

**UI:**
- Formulario por habitaciones
- Tabla de cargas por zona
- Gráfico de distribución
- Selección de equipo recomendado

### Tarea 2.4: Calculadora de Solar Fotovoltaica

**Archivo:** `apps/vectorial-app/src/components/calculators/Renovables/CalcFotovoltaica.jsx`

**Cálculo:**
- Número de paneles necesarios
- Potencia pico del sistema
- Energía generada anual
- Dimensionado de inversor
- Rentabilidad (sin IA, solo cálculos)

**Datos:**
- Radiación solar por zona (España)
- Horas sol pico
- Pérdidas del sistema (15-20%)

### Tarea 2.5: Calculadora de Aislamiento Térmico

**Archivo:** `apps/vectorial-app/src/components/calculators/Termico/CalcAislamiento.jsx`

**Cálculo:**
- Espesor mínimo según CTE DB-HE
- Zona climática (A, B, C, D, E)
- Tipo de cerramiento (muro, cubierta, suelo)
- Transmitancia máxima U permitida

**Fórmula:**
```
e = (1/U) - (1/U_base)
```
Donde:
- e = Espesor del aislamiento (m)
- U = Transmitancia objetivo (W/m²K)
- U_base = Transmitancia del cerramiento sin aislamiento

---

## 🎨 FASE 3: DISEÑO Y PLANOS 2D (Semanas 13-20)

### Objetivo
Añadir herramientas de diseño 2D para crear planos de instalaciones.

### Tarea 3.1: Editor 2D Básico

**Librería:** Konva.js (react-konva)

**Archivo:** `apps/vectorial-app/src/components/editor/Editor2D.jsx`

**Funcionalidades:**
1. **Herramientas de dibujo:**
   - Línea (tuberías)
   - Rectángulo (habitaciones)
   - Círculo (depósitos, equipos)
   - Texto (anotaciones)
   - Flecha (dirección de flujo)

2. **Librería de símbolos:**
   - Tuberías (acero, cobre, PVC)
   - Válvulas (compuerta, esfera, retención)
   - Equipos (caldera, bombas, intercambiadores)
   - Eléctrico (cuadros, enchufes, luminarias)
   - Sanitario (lavabo, inodoro, ducha)

3. **Acciones:**
   - Mover, rotar, escalar elementos
   - Copiar, pegar, eliminar
   - Deshacer/rehacer (Ctrl+Z, Ctrl+Y)
   - Zoom (rueda del ratón)
   - Pan (arrastrar con espacio)

4. **Propiedades:**
   - Panel lateral con propiedades del elemento seleccionado
   - Cambiar color, grosor, tipo de línea
   - Añadir texto y cotas

**UI:**
```
┌──────────────────────────────────────────────┐
│ Editor de Planos                    [Guardar] │
├──────────┬───────────────────────────────────┤
│          │                                   │
│ Herram.  │                                   │
│ ┌──────┐ │                                   │
│ │ 📐   │ │      [CANVAS 2D]                 │
│ └──────┘ │                                   │
│ ┌──────┐ │                                   │
│ │ 📝   │ │                                   │
│ └──────┘ │                                   │
│ ┌──────┐ │                                   │
│ │ 🔲   │ │                                   │
│ └──────┘ │                                   │
│          │                                   │
│ Símbolos │                                   │
│ ┌──────┐ │                                   │
│ │ 🚿   │ │                                   │
│ └──────┘ │                                   │
│ ┌──────┐ │                                   │
│ │ ⚡   │ │                                   │
│ └──────┘ │                                   │
│          │                                   │
├──────────┴───────────────────────────────────┤
│ Propiedades: [Tubería] Diámetro: [25mm]      │
└──────────────────────────────────────────────┘
```

### Tarea 3.2: Planos de Planta

**Funcionalidades:**
1. Crear habitaciones (rectángulos)
2. Añadir puertas y ventanas
3. Colocar equipos (caldera, termos, etc.)
4. Trazar tuberías entre equipos
5. Añadir cotas y anotaciones
6. Generar leyenda

**Exportación:**
- PNG (imagen)
- PDF (documento)
- DXF (CAD)
- IFC (BIM - opcional)

### Tarea 3.3: Esquemas de Principio

**Funcionalidades:**
1. Esquemas hidráulicos (circuitos de calefacción)
2. Esquemas eléctricos (cuadros, circuitos)
3. Esquemas de saneamiento (redes de evacuación)

**Símbolos normalizados:**
- Según UNE-EN 60617
- Según UNE 20434 (eléctrico)
- Según UNE 100030 (hidráulico)

---

## 📊 FASE 4: GESTIÓN AVANZADA (Semanas 21-28)

### Objetivo
Mejorar la gestión de proyectos y automatizar documentación.

### Tarea 4.1: Presupuestos Mejorados

**Archivo:** `apps/vectorial-app/src/pages/Presupuestos.jsx`

**Mejoras:**
1. **Base de datos de precios:**
   - Precios de materiales actualizados
   - Precios de mano de obra por zona
   - Histórico de precios

2. **Mediciones automáticas:**
   - Desde planos 2D
   - Cálculo de longitudes de tuberías
   - Cálculo de superficies

3. **Comparación de ofertas:**
   - Múltiples proveedores
   - Comparativa de precios
   - Selección automática

4. **Certificaciones:**
   - Avance de obra (%)
   - Importe certificado
   - Generación de certificados PDF

### Tarea 4.2: Diagrama de Gantt

**Librería:** @dhtmlx/trial-gantt o custom con Framer Motion

**Funcionalidades:**
- Tareas con fechas de inicio/fin
- Dependencias entre tareas
- Hitos importantes
- Recursos asignados
- Porcentaje de avance
- Exportación a PDF/PNG

### Tarea 4.3: Generación de Documentación

**Documentos a generar:**
1. **Memoria técnica:**
   - Descripción de la instalación
   - Cálculos justificativos
   - Planos y esquemas
   - Cumplimiento normativo

2. **Plan de control de calidad:**
   - Puntos de inspección
   - Ensayos a realizar
   - Criterios de aceptación

3. **Estudio de seguridad:**
   - Riesgos identificados
   - Medidas preventivas
   - EPIs necesarios

**Formato:** PDF con jsPDF + html2canvas

---

## 🎯 FASE 5: PULIDO Y LANZAMIENTO (Semanas 29-32)

### Objetivo
Optimizar, testear y lanzar la aplicación.

### Tarea 5.1: Optimización

**Performance:**
- Lazy loading de rutas
- Code splitting
- Optimización de imágenes (WebP, AVIF)
- Compresión gzip/brotli
- Service Worker para cache

**Accesibilidad:**
- Navegación por teclado
- ARIA labels
- Contraste WCAG AA
- Screen reader testing

**SEO:**
- Meta tags dinámicos
- Sitemap.xml
- robots.txt
- Open Graph tags

### Tarea 5.2: Testing

**Tests unitarios (Vitest):**
- Cálculos de ingeniería
- Utilidades
- Componentes UI

**Tests E2E (Playwright):**
- Flujos de usuario completos
- Calculadoras
- Gestión de obras

### Tarea 5.3: PWA

**Funcionalidades:**
- Instalable en desktop/mobile
- Offline-capable
- Push notifications
- Sincronización en background

**Librería:** vite-plugin-pwa

### Tarea 5.4: Documentación

**Manual de usuario:**
- Guía de inicio
- Tutoriales de calculadoras
- FAQ
- Videotutoriales

**Documentación técnica:**
- Arquitectura
- API reference
- Guía de contribución

---

## 📦 DEPENDENCIAS A INSTALAR

### Fase 1
```bash
npm install lucide-react framer-motion recharts
```

### Fase 2
```bash
# Ya instaladas: framer-motion
```

### Fase 3
```bash
npm install react-konva konva use-image
npm install -D @types/konva
```

### Fase 4
```bash
npm install @dhtmlx/trial-gantt jspdf html2canvas
```

### Fase 5
```bash
npm install -D @playwright/test
npm install vite-plugin-pwa workbox-window
```

---

## 🎨 ESTÁNDARES DE CÓDIGO

### Estructura de Componentes
```
ComponentName/
├── ComponentName.jsx      # Componente principal
├── ComponentName.test.js  # Tests
├── ComponentName.css      # Estilos (si needed)
└── index.js               # Export
```

### Naming Conventions
- **Componentes:** PascalCase (`Button.jsx`)
- **Hooks:** camelCase con prefijo `use` (`useCalculos.js`)
- **Utilidades:** camelCase (`formatCurrency.js`)
- **Constantes:** UPPER_SNAKE_CASE (`MAX_VELOCITY`)
- **Archivos de tipos:** `.d.ts`

### Comentarios
```jsx
// ✅ BUENO: Comentario explicativo
// Calcula la pérdida de carga usando Darcy-Weisbach
// según UNE EN 12354-2

// ❌ MALO: Comentario obvio
// Sumar 2 + 2
const sum = 2 + 2
```

### Manejo de Errores
```jsx
// ✅ BUENO: Try-catch con mensaje descriptivo
try {
  const result = calculatePipeFlow(params)
  return result
} catch (error) {
  console.error('Error en cálculo de tuberías:', error)
  throw new Error('Error al calcular tuberías. Verifica los parámetros.')
}

// ❌ MALO: Sin manejo de errores
const result = calculatePipeFlow(params)
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Fundación
- [ ] Crear tokens de diseño completos
- [ ] Crear 10 componentes UI base
- [ ] Rediseñar Sidebar con iconos
- [ ] Rediseñar Header con búsqueda
- [ ] Mejorar Dashboard con cards y gráficos
- [ ] Mejorar página Calculadoras
- [ ] Mejorar páginas Obras y Presupuestos
- [ ] Implementar modo oscuro/claro perfecto
- [ ] Testing de componentes UI
- [ ] Documentar sistema de diseño

### Fase 2: Cálculos
- [ ] CalcVasoExpansion
- [ ] CalcGrupoPresion
- [ ] CalcRiego
- [ ] CalcSeccionCable
- [ ] CalcProtecciones
- [ ] CalcLuminotecnia
- [ ] CalcCalefaccion
- [ ] CalcSueloRadiante
- [ ] CalcAislamiento
- [ ] CalcCargaTermica
- [ ] CalcVentilacionGas
- [ ] CalcAguaFria
- [ ] CalcAguaCaliente
- [ ] CalcSaneamiento
- [ ] CalcPluviales
- [ ] CalcSolarTermica
- [ ] CalcFotovoltaica
- [ ] CalcBiomasa
- [ ] CalcGeotermia
- [ ] Integrar todas en página Calculadoras

### Fase 3: Diseño 2D
- [ ] Instalar Konva.js
- [ ] Crear Editor2D base
- [ ] Implementar herramientas de dibujo
- [ ] Crear librería de símbolos
- [ ] Implementar zoom y pan
- [ ] Añadir propiedades de elementos
- [ ] Exportación a PNG/PDF
- [ ] Exportación a DXF
- [ ] Planos de planta
- [ ] Esquemas de principio

### Fase 4: Gestión
- [x] Base de datos de precios (tabla `materiales` ya existía; se añade `proveedores` + `precios_proveedor` para precios por proveedor)
- [x] Mediciones automáticas (`usePartidas` migrado de localStorage a la tabla `partidas_obra`, que existía sin usar)
- [x] Comparación de ofertas (página Proveedores — ofertas por material, ordenadas por precio)
- [x] Certificaciones de obra (página Certificaciones — % avance, importe certificado, export acta)
- [x] Diagrama de Gantt (página Planificación — timeline con dependencias, hitos, export PNG)
- [x] Control de costes (KPIs de coste/venta/beneficio ya en Materiales, ligados ahora a Supabase)
- [x] Generación de memorias (página Documentación, pestaña Memoria técnica)
- [x] Generación de planes de calidad (página Documentación, pestaña Plan de calidad)
- [x] Generación de estudios de seguridad (página Documentación, pestaña Estudio de seguridad)

**Notas de implementación (desviaciones respecto al plan original):**
- No se usó `@dhtmlx/trial-gantt` (librería de pago) — el Gantt es una implementación propia con CSS/Tailwind, coherente con "custom con Framer Motion" que el plan dejaba como alternativa.
- Los documentos (memoria/calidad/seguridad) y las actas de certificación se generan con el mismo patrón ya existente en la app (ventana HTML + `window.print()`) en vez de `jsPDF.html()`, por consistencia visual con `exportarPresupuesto` de Materiales.jsx.
- `precios_proveedor` referencia el material por nombre libre (no FK a `materiales`) porque esa tabla no tenía catálogo cargado ni UI que la alimentase — el catálogo técnico de la app es estático (`data/catalogo-tecnico.js`).
- Migración `007_proveedores_certificaciones.sql` y `008_gantt_documentacion.sql` escritas pero **no aplicadas**: sin conectividad de red al puerto 5432 de Supabase desde esta máquina. Pendiente ejecutarlas manualmente en el SQL Editor del dashboard.

### Fase 5: Pulido
- [ ] Lazy loading
- [ ] Code splitting
- [ ] PWA
- [ ] Tests unitarios (80% coverage)
- [ ] Tests E2E
- [ ] Accesibilidad WCAG 2.1 AA
- [ ] Optimización de imágenes
- [ ] Compresión gzip
- [ ] Manual de usuario
- [ ] Deploy en Vercel

---

## 🚦 INSTRUCCIONES DE EJECUCIÓN

### Orden de Implementación
1. **Fase 1 completa** antes de pasar a Fase 2
2. **Fase 2 completa** antes de pasar a Fase 3
3. Y así sucesivamente

### Por cada tarea:
1. Leer la especificación completa
2. Crear el archivo(s) necesario(s)
3. Implementar la funcionalidad
4. Testear manualmente
5. Verificar que cumple los estándares de código
6. Pasar a siguiente tarea

### Si te bloqueas:
1. Releer la especificación
2. Buscar ejemplos en el código existente
3. Priorizar funcionalidad sobre perfección
4. Documentar el problema y la solución

---

## 🎯 CRITERIOS DE ÉXITO

### Funcionalidad
- ✅ 20+ calculadoras funcionando
- ✅ Editor 2D funcional
- ✅ Gestión de proyectos completa
- ✅ Documentación automática

### Interfaz
- ✅ Diseño premium y profesional
- ✅ 100% responsive
- ✅ Modo oscuro/claro perfecto
- ✅ Accesibilidad WCAG 2.1 AA

### Rendimiento
- ✅ First Load < 3s
- ✅ Lighthouse score > 90
- ✅ Sin errores en consola
- ✅ Funciona offline (PWA)

### Código
- ✅ Código limpio y mantenible
- ✅ Componentes reutilizables
- ✅ Tests passing
- ✅ Documentación completa

---

## 📝 NOTAS FINALES

1. **NO uses IA** - Todo debe ser código puro, matemáticas y lógica
2. **NO te saltes pasos** - Sigue el orden de fases
3. **NO inventes funcionalidades** - Solo lo especificado
4. **SÍ testea** - Verifica que todo funciona
5. **SÍ documenta** - Comenta el código complejo
6. **SÍ pide feedback** - Si algo no está claro, pregunta

---

## 🚀 EMPIEZA AQUÍ

**Primera tarea:** Crear el sistema de diseño completo en `apps/vectorial-app/src/styles/tokens.css`

**Segunda tarea:** Crear los 10 componentes UI base en `apps/vectorial-app/src/components/ui/`

**Tercera tarea:** Rediseñar el layout principal en `apps/vectorial-app/src/components/layout/AppLayout.jsx`

**Cuarta tarea:** Mejorar el Dashboard en `apps/vectorial-app/src/pages/Dashboard.jsx`

---

**¡A por ello! Transforma Vectorial en la mejor aplicación de ingeniería del mercado.** 🎯