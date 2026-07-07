import { useState, useMemo } from 'react'
import CalcGLP          from '../components/CalcGLP'
import CalcTuberias     from '../components/CalcTuberias'
import CalcACS          from '../components/CalcACS'
import ConversorUnidades from '../components/ConversorUnidades'
import ChecklistOCA     from '../components/ChecklistOCA'
import { useObras }     from '../hooks/useObras'

const TABS = [
  { id: 'glp',       label: 'Depósito GLP',     icono: '🔥', desc: 'RIGLO · distancias seguridad',  color: 'orange' },
  { id: 'tuberias',  label: 'Tuberías',          icono: '⚙️', desc: 'Darcy-Weisbach · UNE-EN 1057', color: 'sky'    },
  { id: 'acs',       label: 'ACS / Inercia',     icono: '💧', desc: 'CTE HE4 · RITE IT 1.2.4.6',   color: 'teal'   },
  { id: 'conversor', label: 'Conversor',          icono: '🔄', desc: 'Presión · Potencia · Caudal',  color: 'violet' },
  { id: 'checklist', label: 'Checklist OCA',      icono: '✅', desc: 'GLP · RITE pre-inspección',   color: 'emerald'},
]

const ACTIVE_CLS = {
  orange:  'bg-orange-500  text-white border-orange-500  shadow-md shadow-orange-100',
  sky:     'bg-sky-600     text-white border-sky-600     shadow-md shadow-sky-100',
  teal:    'bg-teal-600    text-white border-teal-600    shadow-md shadow-teal-100',
  violet:  'bg-violet-600  text-white border-violet-600  shadow-md shadow-violet-100',
  emerald: 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100',
}

export default function Calculadoras({ navigate, selectedObraId }) {
  const [tab,      setTab]      = useState('glp')
  const { obras }               = useObras()
  const obraSel = obras.find(o => o.id === selectedObraId) || null
  const activeTab = TABS.find(t => t.id === tab)

  return (
    <div className="space-y-6">

      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🧮</span>
            <h1 className="text-2xl font-bold text-slate-800">Calculadoras Técnicas</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Fórmulas reales · RITE · RIGLO (RD 919/2006) · UNE-EN 1057 · CTE DB-HE4
          </p>
        </div>
        {/* Obra activa */}
        {obraSel ? (
          <div className="shrink-0 flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="max-w-[180px] truncate">{obraSel.nombre}</span>
          </div>
        ) : (
          <button onClick={() => navigate('dashboard')}
            className="shrink-0 text-xs text-slate-400 hover:text-blue-600 border border-slate-200 hover:border-blue-300 px-3 py-2 rounded-xl transition-all">
            Seleccionar obra →
          </button>
        )}
      </div>

      {/* Selector de calculadora */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
              tab === t.id
                ? ACTIVE_CLS[t.color]
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-base">{t.icono}</span>
            <div className="text-left">
              <div>{t.label}</div>
              <div className={`text-xs font-normal ${tab === t.id ? 'opacity-80' : 'text-slate-400'}`}>{t.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Separador */}
      <div className="flex items-center gap-3">
        <div className="h-px bg-slate-200 flex-1" />
        <span className="text-xs text-slate-400 font-medium px-2">
          {activeTab?.icono} {activeTab?.label} · {activeTab?.desc}
        </span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      {/* Contenido */}
      {tab === 'glp'       && <CalcGLP      obraId={selectedObraId} obraNombre={obraSel?.nombre} />}
      {tab === 'tuberias'  && <CalcTuberias obraId={selectedObraId} obraNombre={obraSel?.nombre} />}
      {tab === 'acs'       && <CalcACS      obraId={selectedObraId} obraNombre={obraSel?.nombre} />}
      {tab === 'conversor' && <ConversorUnidades />}
      {tab === 'checklist' && <ChecklistOCA />}

      {/* Aviso legal */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
        <span className="font-bold">⚠️ Aviso: </span>
        Los resultados son orientativos. Toda instalación debe ser verificada y firmada por un técnico
        competente habilitado. Las distancias de seguridad GLP se basan en RIGLO (RD 919/2006).
      </div>
    </div>
  )
}
