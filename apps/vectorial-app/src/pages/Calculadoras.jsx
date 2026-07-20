import { useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Search, Flame, Gauge, Droplets, RefreshCw, ClipboardCheck, ArrowLeft,
  Waves, Droplet, FireExtinguisher, Cable, ShieldCheck, Lightbulb, Zap,
  Layers, Thermometer, Wind, CloudRain, Sun, SunMedium, Trees, Mountain,
} from 'lucide-react'
import CalcGLP          from '../components/CalcGLP'
import CalcTuberias     from '../components/CalcTuberias'
import CalcACS          from '../components/CalcACS'
import ConversorUnidades from '../components/ConversorUnidades'
import ChecklistOCA     from '../components/ChecklistOCA'
import CalcVasoExpansion from '../components/calculators/Hidraulica/CalcVasoExpansion'
import CalcGrupoPresion  from '../components/calculators/Hidraulica/CalcGrupoPresion'
import CalcRiego         from '../components/calculators/Hidraulica/CalcRiego'
import CalcHidrantePCI   from '../components/calculators/Hidraulica/CalcHidrantePCI'
import CalcSeccionCable  from '../components/calculators/Electrico/CalcSeccionCable'
import CalcProtecciones  from '../components/calculators/Electrico/CalcProtecciones'
import CalcLuminotecnia  from '../components/calculators/Electrico/CalcLuminotecnia'
import CalcPuestaTierra  from '../components/calculators/Electrico/CalcPuestaTierra'
import CalcCalefaccion   from '../components/calculators/Termico/CalcCalefaccion'
import CalcSueloRadiante from '../components/calculators/Termico/CalcSueloRadiante'
import CalcAislamiento   from '../components/calculators/Termico/CalcAislamiento'
import CalcCargaTermica  from '../components/calculators/Termico/CalcCargaTermica'
import CalcVentilacionGas from '../components/calculators/Gas/CalcVentilacionGas'
import CalcAguaFria      from '../components/calculators/Fontaneria/CalcAguaFria'
import CalcAguaCaliente  from '../components/calculators/Fontaneria/CalcAguaCaliente'
import CalcSaneamiento   from '../components/calculators/Fontaneria/CalcSaneamiento'
import CalcPluviales     from '../components/calculators/Fontaneria/CalcPluviales'
import CalcSolarTermica  from '../components/calculators/Renovables/CalcSolarTermica'
import CalcFotovoltaica  from '../components/calculators/Renovables/CalcFotovoltaica'
import CalcBiomasa       from '../components/calculators/Renovables/CalcBiomasa'
import CalcGeotermia     from '../components/calculators/Renovables/CalcGeotermia'
import { useObras }     from '../hooks/useObras'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

const C = 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400'
const S = 'text-sky-600 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-400'
const T = 'text-teal-600 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400'
const V = 'text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400'
const E = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400'
const A = 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400'

const CALCULADORAS = [
  // Gas
  { id: 'glp',              label: 'Depósito GLP',        desc: 'ITC-ICG 03 · UNE 60250:2008',          categoria: 'Gas',          icon: Flame,          color: C, component: CalcGLP },
  { id: 'ventilacion_gas',  label: 'Ventilación de gas',   desc: 'UNE 60670-6',                          categoria: 'Gas',          icon: Wind,           color: C, component: CalcVentilacionGas },
  // Hidráulica
  { id: 'tuberias',         label: 'Tuberías',             desc: 'Darcy-Weisbach · UNE-EN 1057',         categoria: 'Hidráulica',   icon: Gauge,          color: S, component: CalcTuberias },
  { id: 'vaso_expansion',   label: 'Vaso de expansión',    desc: 'UNE 100155',                           categoria: 'Hidráulica',   icon: Gauge,          color: S, component: CalcVasoExpansion },
  { id: 'grupo_presion',    label: 'Grupo de presión',     desc: 'Depósito hidroneumático',              categoria: 'Hidráulica',   icon: Waves,          color: S, component: CalcGrupoPresion },
  { id: 'riego',            label: 'Sector de riego',      desc: 'Riego localizado',                     categoria: 'Hidráulica',   icon: Droplet,        color: T, component: CalcRiego },
  { id: 'hidrante_pci',     label: 'Hidrantes PCI',        desc: 'RD 513/2017 · CTE DB-SI',              categoria: 'Hidráulica',   icon: FireExtinguisher, color: C, component: CalcHidrantePCI },
  // Térmica
  { id: 'acs',              label: 'ACS / Inercia',        desc: 'CTE HE4 · RITE IT 1.2.4.6',            categoria: 'Térmica',      icon: Droplets,       color: T, component: CalcACS },
  { id: 'calefaccion',      label: 'Calefacción',          desc: 'Radiadores · CTE DB-HE',               categoria: 'Térmica',      icon: Flame,          color: A, component: CalcCalefaccion },
  { id: 'suelo_radiante',   label: 'Suelo radiante',       desc: 'UNE-EN 1264',                          categoria: 'Térmica',      icon: Waves,          color: A, component: CalcSueloRadiante },
  { id: 'aislamiento',      label: 'Aislamiento térmico',  desc: 'CTE DB-HE1',                           categoria: 'Térmica',      icon: Layers,         color: A, component: CalcAislamiento },
  { id: 'carga_termica',    label: 'Carga térmica',        desc: 'Balance de calor · RITE',              categoria: 'Térmica',      icon: Thermometer,    color: A, component: CalcCargaTermica },
  // Eléctrica
  { id: 'seccion_cable',    label: 'Sección de cable',     desc: 'ITC-BT-19',                            categoria: 'Eléctrica',    icon: Cable,          color: A, component: CalcSeccionCable },
  { id: 'protecciones',     label: 'Protecciones',         desc: 'ITC-BT-22 / 24',                       categoria: 'Eléctrica',    icon: ShieldCheck,    color: A, component: CalcProtecciones },
  { id: 'luminotecnia',     label: 'Luminotecnia',         desc: 'UNE-EN 12464-1',                       categoria: 'Eléctrica',    icon: Lightbulb,      color: A, component: CalcLuminotecnia },
  { id: 'puesta_tierra',    label: 'Puesta a tierra',      desc: 'ITC-BT-18',                            categoria: 'Eléctrica',    icon: Zap,            color: A, component: CalcPuestaTierra },
  // Fontanería
  { id: 'agua_fria',        label: 'Agua fría',            desc: 'CTE DB-HS4',                           categoria: 'Fontanería',   icon: Droplets,       color: S, component: CalcAguaFria },
  { id: 'agua_caliente_red',label: 'Distribución ACS',     desc: 'CTE DB-HS4',                           categoria: 'Fontanería',   icon: Flame,          color: T, component: CalcAguaCaliente },
  { id: 'saneamiento',      label: 'Saneamiento',          desc: 'CTE DB-HS5',                           categoria: 'Fontanería',   icon: Waves,          color: V, component: CalcSaneamiento },
  { id: 'pluviales',        label: 'Pluviales',            desc: 'CTE DB-HS5',                           categoria: 'Fontanería',   icon: CloudRain,      color: S, component: CalcPluviales },
  // Renovables
  { id: 'solar_termica',    label: 'Solar térmica',        desc: 'CTE DB-HE4',                           categoria: 'Renovables',   icon: Sun,            color: A, component: CalcSolarTermica },
  { id: 'fotovoltaica',     label: 'Solar fotovoltaica',   desc: 'Autoconsumo · RD 244/2019',             categoria: 'Renovables',   icon: SunMedium,      color: A, component: CalcFotovoltaica },
  { id: 'biomasa',          label: 'Caldera de biomasa',   desc: 'RITE',                                  categoria: 'Renovables',   icon: Trees,          color: E, component: CalcBiomasa },
  { id: 'geotermia',        label: 'Geotermia',            desc: 'Sondas verticales',                     categoria: 'Renovables',   icon: Mountain,       color: E, component: CalcGeotermia },
  // Utilidades
  { id: 'conversor',        label: 'Conversor',            desc: 'Presión · Potencia · Caudal',           categoria: 'Utilidades',   icon: RefreshCw,      color: V, component: ConversorUnidades },
  { id: 'checklist',        label: 'Checklist OCA',        desc: 'GLP · RITE pre-inspección',              categoria: 'Cumplimiento', icon: ClipboardCheck, color: E, component: ChecklistOCA },
]

const CATEGORIAS = ['Todas', ...new Set(CALCULADORAS.map(c => c.categoria))]

export default function Calculadoras({ navigate, selectedObraId }) {
  const location = useLocation()
  // Si venimos de "Usar en cálculo" desde Componentes, abrimos directamente
  // la calculadora indicada con el componente ya seleccionado.
  const [tab, setTab] = useState(location.state?.tab ?? null)
  const componentePrellenado = location.state?.componente ?? null
  const [query, setQuery] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const { obras } = useObras()
  const obraSel = obras.find(o => o.id === selectedObraId) || null
  const activeTab = CALCULADORAS.find(t => t.id === tab)
  const ActiveComponent = activeTab?.component

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CALCULADORAS.filter(c =>
      (categoria === 'Todas' || c.categoria === categoria) &&
      (!q || c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q))
    )
  }, [query, categoria])

  return (
    <div className="space-y-6">

      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Calculadoras Técnicas</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {CALCULADORAS.length} calculadoras · RITE · UNE · CTE · REBT
          </p>
        </div>
        {obraSel ? (
          <div className="shrink-0 flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 dark:bg-primary-500/10 dark:border-primary-500/20 dark:text-primary-400 text-xs font-semibold px-3 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-primary-500" />
            <span className="max-w-[180px] truncate">{obraSel.nombre}</span>
          </div>
        ) : (
          <button onClick={() => navigate('dashboard')}
            className="shrink-0 text-xs text-slate-400 hover:text-primary-600 border border-slate-200 hover:border-primary-300 px-3 py-2 rounded-xl transition-all">
            Seleccionar obra →
          </button>
        )}
      </div>

      {tab === null ? (
        <>
          {/* Búsqueda + filtro por categoría */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar calculadora..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIAS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                    categoria === cat
                      ? 'bg-primary-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de calculadoras */}
          {filtradas.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="font-medium">Ninguna calculadora coincide con la búsqueda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtradas.map(c => {
                const Icon = c.icon
                return (
                  <Card
                    key={c.id}
                    as="button"
                    onClick={() => setTab(c.id)}
                    className="text-left p-5 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-500/30 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.color}`}>
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">{c.label}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{c.desc}</p>
                    <Badge variant="neutral">{c.categoria}</Badge>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <button
            onClick={() => setTab(null)}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft size={16} /> Todas las calculadoras
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            <span className="text-xs text-slate-400 font-medium px-2">
              {activeTab?.label} · {activeTab?.desc}
            </span>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
          </div>

          {ActiveComponent && <ActiveComponent obraId={selectedObraId} obraNombre={obraSel?.nombre} calculadoraId={activeTab.id} componente={componentePrellenado} />}
        </>
      )}

      {/* Aviso legal */}
      <div className="bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 rounded-xl p-4 text-xs text-amber-700 dark:text-amber-400">
        <span className="font-bold">Aviso: </span>
        Los resultados son orientativos. Toda instalación debe ser verificada y firmada por un técnico
        competente habilitado según la normativa vigente antes de su ejecución.
      </div>
    </div>
  )
}
