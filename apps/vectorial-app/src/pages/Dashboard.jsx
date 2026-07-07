import { useMemo } from 'react'
import { useObras } from '../hooks/useObras'
import { usePresupuestos } from '../hooks/usePresupuestos'
import { CATEGORIAS_BIBLIA } from '../data/catalogo-tecnico'
import ErrorMessage from '../components/ErrorMessage'
import StatusBadge from '../components/ui/StatusBadge'

const fmt    = (n) => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 0 })
const fmtDec = (n) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

const ESTADO_DOT = {
  activa:     'bg-emerald-500',
  pausada:    'bg-amber-400',
  finalizada: 'bg-slate-400',
}

const ACTIVIDAD = [
  { texto: 'Presupuesto PRES-2026-002 enviado a Hotel Mirasol', tiempo: 'Hace 2 días',    icono: '📤', color: 'text-blue-600 dark:text-blue-400'       },
  { texto: 'Nueva obra: Climatización Nave Industrial Sector 7', tiempo: 'Hace 4 días',    icono: '🏗️', color: 'text-emerald-600 dark:text-emerald-400' },
  { texto: 'Presupuesto PRES-2026-001 ACEPTADO',                 tiempo: 'Hace 1 semana',  icono: '✅', color: 'text-emerald-600 dark:text-emerald-400' },
  { texto: 'Obra "Residencial Las Torres" marcada como finalizada', tiempo: 'Hace 2 sem.', icono: '🏁', color: 'text-slate-500 dark:text-slate-400'     },
]

export default function Dashboard({ navigate, selectedObraId, setSelectedObraId }) {
  const { obras, kpi: oKpi, modoDemo, loading: loadingObras, error: errorObras, recargar: recargarObras } = useObras()
  const { presupuestos, calcTotal, loading: loadingPres, error: errorPres, recargar: recargarPres } = usePresupuestos()
  // obraSelId y setObraSelId vienen de App.jsx (estado global compartido)
  const obraSelId    = selectedObraId
  const setObraSelId = setSelectedObraId

  const hoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  // ── KPIs filtrados por obra seleccionada ──────────────────────────────────
  const obraSel   = obras.find(o => o.id === obraSelId) || null
  const presFiltrados = useMemo(() => {
    if (!obraSel) return presupuestos
    return presupuestos.filter(p => p.obra_nombre === obraSel.nombre)
  }, [presupuestos, obraSel])

  const kpiPres = useMemo(() => {
    const pendientes   = presFiltrados.filter(p => p.estado === 'enviado').length
    const aceptados    = presFiltrados.filter(p => p.estado === 'aceptado')
    const totalAcept   = aceptados.reduce((acc, p) => acc + calcTotal(p.importe_base, p.margen_pct), 0)
    const margenMedio  = presFiltrados.length
      ? presFiltrados.reduce((acc, p) => acc + Number(p.margen_pct), 0) / presFiltrados.length
      : 0
    return { pendientes, totalAcept, margenMedio, numAceptados: aceptados.length }
  }, [presFiltrados, calcTotal])

  const kpiObras = useMemo(() => {
    if (!obraSel) return oKpi
    return {
      activas:    obraSel.estado === 'activa'     ? 1 : 0,
      pausadas:   obraSel.estado === 'pausada'    ? 1 : 0,
      finalizadas:obraSel.estado === 'finalizada' ? 1 : 0,
    }
  }, [obraSel, oKpi])

  // Mostrar error global si ambas cargas fallan
  const errorGlobal = errorObras || errorPres

  if (errorGlobal && !loadingObras && !loadingPres) {
    return (
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">🏠</span>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Panel de Control</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Error al cargar los datos del panel</p>
          </div>
        </div>
        <ErrorMessage
          error={errorGlobal}
          onRetry={() => { recargarObras(); recargarPres() }}
          titulo="Error de conexión"
          mensaje="No se pudieron cargar los datos desde la base de datos. Se está utilizando el modo demo con datos de ejemplo."
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 text-white p-8 shadow-2xl dark:shadow-indigo-950/40 dark:border dark:border-slate-800">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 dark:bg-indigo-500 opacity-10 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400 dark:bg-emerald-400 opacity-10 rounded-full translate-y-12 -translate-x-12" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-blue-300 dark:text-indigo-400 text-sm font-medium uppercase tracking-widest mb-1">Panel de Control</p>
            <h1 className="text-3xl font-bold text-white mb-2">
              {obraSel ? obraSel.nombre : 'Bienvenido a GestiObra'}
            </h1>
            <p className="text-slate-400 text-sm capitalize">{hoy}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {modoDemo && (
                <span className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium px-3 py-1 rounded-full">
                  ⚠️ Modo Demo — Conecta Supabase para datos reales
                </span>
              )}
              {obraSel && <StatusBadge estado={obraSel.estado} />}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate('obras')}
              className="bg-blue-600 hover:bg-blue-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
              + Nueva Obra
            </button>
            <button onClick={() => navigate('presupuestos')}
              className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-lg border border-white/20 transition-colors">
              + Presupuesto
            </button>
            {obraSel && (
              <button onClick={() => navigate('materiales')}
                className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-lg border border-white/20 transition-colors">
                🧱 Materiales
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── SELECTOR DE OBRA ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">📂 Filtrar por obra:</span>
          {obraSel && (
            <button onClick={() => setObraSelId(null)}
              className="text-xs text-blue-600 dark:text-indigo-400 hover:underline font-medium">
              ← Ver todas
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setObraSelId(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-all shrink-0 ${!obraSel ? 'bg-slate-800 text-white border-slate-800 shadow-sm dark:bg-indigo-600 dark:border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-800'}`}>
            Todas las obras
          </button>
          {obras.map(o => (
            <button key={o.id} onClick={() => setObraSelId(o.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-all shrink-0 ${obraSelId === o.id ? 'bg-blue-600 text-white border-blue-600 shadow-sm dark:bg-indigo-600 dark:border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-blue-50 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-800'}`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${obraSelId === o.id ? 'bg-white' : (ESTADO_DOT[o.estado] || 'bg-slate-400')}`} />
              <span className="max-w-[180px] truncate">{o.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 4 KPI CARDS (consola de datos técnicos) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none p-6 hover:shadow-md dark:hover:border-slate-700 transition-all cursor-pointer"
          onClick={() => navigate('obras')}>
          <div className="flex items-center justify-between mb-3">
            <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-10 h-10 rounded-lg flex items-center justify-center text-lg">🏗️</span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {obraSel ? obraSel.estado : 'Activas'}
            </span>
          </div>
          <p className="text-3xl font-bold font-mono text-slate-800 dark:text-slate-100">{kpiObras.activas}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Obras activas</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {kpiObras.pausadas} pausada{kpiObras.pausadas !== 1 ? 's' : ''} · {kpiObras.finalizadas} finalizada{kpiObras.finalizadas !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none p-6 hover:shadow-md dark:hover:border-slate-700 transition-all cursor-pointer"
          onClick={() => navigate('presupuestos')}>
          <div className="flex items-center justify-between mb-3">
            <span className="bg-blue-100 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 w-10 h-10 rounded-lg flex items-center justify-center text-lg">📋</span>
            <span className="text-xs font-medium text-blue-600 dark:text-indigo-400 bg-blue-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">Pendientes</span>
          </div>
          <p className="text-3xl font-bold font-mono text-slate-800 dark:text-slate-100">{kpiPres.pendientes}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Esperando respuesta</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{kpiPres.numAceptados} aceptado{kpiPres.numAceptados !== 1 ? 's' : ''} {obraSel ? 'en esta obra' : 'este periodo'}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none p-6 hover:shadow-md dark:hover:border-slate-700 transition-all cursor-pointer"
          onClick={() => navigate('presupuestos')}>
          <div className="flex items-center justify-between mb-3">
            <span className="bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 w-10 h-10 rounded-lg flex items-center justify-center text-lg">💰</span>
            <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded-full">Facturado</span>
          </div>
          <p className="text-3xl font-bold font-mono text-slate-800 dark:text-slate-100">
            {fmt(kpiPres.totalAcept)}<span className="text-lg text-slate-400 dark:text-slate-500 font-normal ml-1">€</span>
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Total aceptado</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{obraSel ? obraSel.nombre.slice(0, 22) + '…' : 'Presupuestos firmados'}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none p-6 hover:shadow-md dark:hover:border-slate-700 transition-all cursor-pointer"
          onClick={() => navigate('presupuestos')}>
          <div className="flex items-center justify-between mb-3">
            <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 w-10 h-10 rounded-lg flex items-center justify-center text-lg">📈</span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">Margen</span>
          </div>
          <p className="text-3xl font-bold font-mono text-slate-800 dark:text-slate-100">
            {fmtDec(kpiPres.margenMedio)}<span className="text-lg text-slate-400 dark:text-slate-500 font-normal ml-0.5">%</span>
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Margen medio</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{obraSel ? 'Sobre esta obra' : 'Sobre todos los presupuestos'}</p>
        </div>

      </div>

      {/* ── DOS COLUMNAS: actividad + biblia ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Actividad reciente */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none p-6">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">Actividad reciente</h2>
          <ul className="space-y-3">
            {ACTIVIDAD.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-xl mt-0.5 shrink-0">{item.icono}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${item.color} leading-snug`}>{item.texto}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.tiempo}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Acceso rápido Biblia Técnica + Calculadoras */}
        <div className="lg:col-span-3 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 dark:border dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none p-6 text-white">
          <div className="flex items-center gap-3 mb-5">
            <span className="bg-blue-500/20 dark:bg-indigo-500/20 border border-blue-400/30 dark:border-indigo-400/30 w-10 h-10 rounded-lg flex items-center justify-center text-xl">📚</span>
            <div>
              <h2 className="text-sm font-bold text-white">Biblia del Instalador</h2>
              <p className="text-xs text-slate-400">60 referencias técnicas · RITE · UNE · REBT</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {CATEGORIAS_BIBLIA.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate('catalogo')}
                className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg px-3 py-2.5 text-left transition-all group"
              >
                <span className="text-lg">{cat.icono}</span>
                <span className="text-xs font-medium text-slate-300 group-hover:text-white leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('catalogo')}
              className="flex-1 bg-blue-600 hover:bg-blue-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
              Abrir Catálogo Técnico →
            </button>
            <button onClick={() => navigate('calculadoras')}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2.5 rounded-lg border border-white/20 transition-colors">
              🧮 Calculadoras →
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
