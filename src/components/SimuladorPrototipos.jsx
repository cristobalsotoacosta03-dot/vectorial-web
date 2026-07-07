import { useState, useMemo } from 'react'
import { Flame, Wind, Zap, Calculator, ChevronDown, Info } from 'lucide-react'

// ── Configuración de prototipos ──────────────────────────────────────────────
const PROTOTIPOS = {
  glp: {
    id: 'glp',
    nombre: 'Instalación GLP',
    icono: Flame,
    color: 'from-orange-500 to-red-600',
    descripcion: 'Cálculo de instalación de gas licuado de petróleo',
    parametros: [
      { id: 'metrosTuberia', label: 'Metros de tubería', tipo: 'number', min: 1, max: 500, default: 50, unidad: 'm', precio: 12.5 },
      { id: 'numeroPuntos', label: 'Puntos de consumo', tipo: 'number', min: 1, max: 20, default: 3, unidad: 'uds', precio: 85 },
      { id: 'capacidadDeposito', label: 'Capacidad depósito', tipo: 'select', opciones: [
        { valor: 3000, label: '3000 L', precio: 450 },
        { valor: 5000, label: '5000 L', precio: 650 },
        { valor: 10000, label: '10000 L', precio: 1100 },
      ], default: 5000 },
      { id: 'tieneVentilacion', label: 'Ventilación forzada', tipo: 'checkbox', precio: 320 },
    ]
  },
  aerotermia: {
    id: 'aerotermia',
    nombre: 'Sala Aerotermia',
    icono: Wind,
    color: 'from-cyan-500 to-blue-600',
    descripcion: 'Diseño de sala de climatización por aerotermia',
    parametros: [
      { id: 'metrosCuadrados', label: 'Metros cuadrados', tipo: 'number', min: 10, max: 1000, default: 150, unidad: 'm²', precio: 45 },
      { id: 'numeroUnidades', label: 'Unidades interiores', tipo: 'number', min: 1, max: 50, default: 8, unidad: 'uds', precio: 1200 },
      { id: 'potenciaUnitaria', label: 'Potencia por unidad', tipo: 'select', opciones: [
        { valor: 2.5, label: '2.5 kW', precio: 0 },
        { valor: 5, label: '5 kW', precio: 150 },
        { valor: 10, label: '10 kW', precio: 350 },
      ], default: 5 },
      { id: 'incluyeControl', label: 'Incluir control WiFi', tipo: 'checkbox', precio: 280 },
      { id: 'incluyeInstalacion', label: 'Instalación completa', tipo: 'checkbox', precio: 1500 },
    ]
  },
  electrica: {
    id: 'electrica',
    nombre: 'Renovación Eléctrica',
    icono: Zap,
    color: 'from-yellow-500 to-amber-600',
    descripcion: 'Renovación completa de instalación eléctrica',
    parametros: [
      { id: 'metrosCuadrados', label: 'Metros cuadrados', tipo: 'number', min: 20, max: 2000, default: 120, unidad: 'm²', precio: 28 },
      { id: 'numeroCircuitos', label: 'Circuitos', tipo: 'number', min: 1, max: 100, default: 12, unidad: 'uds', precio: 95 },
      { id: 'tieneCuadro', label: 'Cuadro eléctrico nuevo', tipo: 'checkbox', precio: 850 },
      { id: 'tieneTierra', label: 'Puesta a tierra', tipo: 'checkbox', precio: 420 },
      { id: 'tieneIluminacion', label: 'Iluminación LED', tipo: 'checkbox', precio: 380 },
    ]
  }
}

// ── Componente Input genérico ─────────────────────────────────────────────────
function ParamInput({ parametro, valor, onChange }) {
  const Icon = parametro.icono

  if (parametro.tipo === 'number') {
    return (
      <div className="space-y-2">
        <label className="flex items-center justify-between text-sm font-medium text-slate-700">
          <span>{parametro.label}</span>
          <span className="text-xs text-slate-500">{parametro.unidad}</span>
        </label>
        <div className="relative">
          <input
            type="number"
            min={parametro.min}
            max={parametro.max}
            value={valor}
            onChange={(e) => onChange(parametro.id, Number(e.target.value))}
            className="w-full px-4 py-2.5 pr-12 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 font-medium"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {parametro.unidad}
          </span>
        </div>
        <input
          type="range"
          min={parametro.min}
          max={parametro.max}
          value={valor}
          onChange={(e) => onChange(parametro.id, Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
    )
  }

  if (parametro.tipo === 'select') {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">{parametro.label}</label>
        <div className="relative">
          <select
            value={valor}
            onChange={(e) => onChange(parametro.id, Number(e.target.value))}
            className="w-full px-4 py-2.5 pr-10 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 font-medium appearance-none cursor-pointer"
          >
            {parametro.opciones.map(op => (
              <option key={op.valor} value={op.valor}>{op.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>
    )
  }

  if (parametro.tipo === 'checkbox') {
    return (
      <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${valor ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
            <Info className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-slate-700">{parametro.label}</span>
        </div>
        <div className="relative">
          <input
            type="checkbox"
            checked={valor}
            onChange={(e) => onChange(parametro.id, e.target.checked)}
            className="sr-only"
          />
          <div className={`w-11 h-6 rounded-full transition-colors ${valor ? 'bg-blue-600' : 'bg-slate-300'}`}>
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${valor ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </div>
      </label>
    )
  }

  return null
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function SimuladorPrototipos() {
  const [prototipoSeleccionado, setPrototipoSeleccionado] = useState('glp')
  const [valores, setValores] = useState(() => {
    // Inicializar valores por defecto
    const inicial = {}
    Object.values(PROTOTIPOS).forEach(proto => {
      proto.parametros.forEach(param => {
        inicial[param.id] = param.default
      })
    })
    return inicial
  })

  const prototipo = PROTOTIPOS[prototipoSeleccionado]
  const IconoPrototipo = prototipo.icono

  // ── Cálculo en tiempo real ──────────────────────────────────────────────────
  const costeTotal = useMemo(() => {
    let total = 0

    prototipo.parametros.forEach(param => {
      const valor = valores[param.id]
      
      if (param.tipo === 'number') {
        total += valor * param.precio
      } else if (param.tipo === 'select') {
        const opcion = param.opciones.find(op => op.valor === valor)
        if (opcion) total += opcion.precio
      } else if (param.tipo === 'checkbox') {
        if (valor) total += param.precio
      }
    })

    // Añadir margen de seguridad (15%)
    const margen = total * 0.15
    const iva = (total + margen) * 0.21

    return {
      base: total,
      margen,
      iva,
      total: total + margen + iva
    }
  }, [valores, prototipo])

  const handleCambio = (paramId, valor) => {
    setValores(prev => ({ ...prev, [paramId]: valor }))
  }

  const resetear = () => {
    const inicial = {}
    prototipo.parametros.forEach(param => {
      inicial[param.id] = param.default
    })
    setValores(prev => ({ ...prev, ...inicial }))
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Simulador Técnico</h2>
          <p className="text-sm text-slate-500">Cálculo de presupuestos en tiempo real</p>
        </div>
      </div>

      {/* ── Selector de prototipo ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.values(PROTOTIPOS).map(proto => {
          const Icon = proto.icono
          const isActive = prototipoSeleccionado === proto.id
          return (
            <button
              key={proto.id}
              onClick={() => {
                setPrototipoSeleccionado(proto.id)
                // Resetear valores al cambiar de prototipo
                const inicial = {}
                proto.parametros.forEach(param => {
                  inicial[param.id] = param.default
                })
                setValores(prev => ({ ...prev, ...inicial }))
              }}
              className={`relative p-4 rounded-2xl border-2 transition-all text-left group ${
                isActive
                  ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {isActive && (
                <div className={`absolute inset-0 bg-gradient-to-br ${proto.color} opacity-5 rounded-2xl`} />
              )}
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                  isActive
                    ? `bg-gradient-to-br ${proto.color} text-white shadow-lg`
                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className={`font-bold text-sm mb-1 ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>
                  {proto.nombre}
                </h3>
                <p className="text-xs text-slate-500 leading-snug">{proto.descripcion}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Contenido del prototipo ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulario */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${prototipo.color} flex items-center justify-center text-white`}>
                <IconoPrototipo className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{prototipo.nombre}</h3>
                <p className="text-xs text-slate-500">Ajusta los parámetros</p>
              </div>
            </div>
            <button
              onClick={resetear}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Resetear
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prototipo.parametros.map(param => (
              <ParamInput
                key={param.id}
                parametro={param}
                valor={valores[param.id]}
                onChange={handleCambio}
              />
            ))}
          </div>
        </div>

        {/* Resumen de costes */}
        <div className="lg:col-span-1">
          <div className={`bg-gradient-to-br ${prototipo.color} rounded-2xl shadow-lg p-6 text-white sticky top-6`}>
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="w-5 h-5" />
              <h3 className="font-bold text-lg">Desglose de costes</h3>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-white/20">
                <span className="text-sm text-white/80">Coste base</span>
                <span className="font-semibold">{fmt(costeTotal.base)} €</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/20">
                <span className="text-sm text-white/80">Margen (15%)</span>
                <span className="font-semibold">{fmt(costeTotal.margen)} €</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/20">
                <span className="text-sm text-white/80">IVA (21%)</span>
                <span className="font-semibold">{fmt(costeTotal.iva)} €</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
              <p className="text-xs text-white/70 mb-1">TOTAL ESTIMADO</p>
              <p className="text-4xl font-bold">{fmt(costeTotal.total)} €</p>
              <p className="text-xs text-white/60 mt-2">* Precio orientativo sin incluir licencias ni tasas</p>
            </div>

            <button className="w-full bg-white text-slate-800 font-bold py-3 rounded-xl hover:bg-white/90 transition-colors shadow-lg">
              Generar presupuesto
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

function fmt(n) {
  return Number(n).toLocaleString('es-ES', { maximumFractionDigits: 0 })
}