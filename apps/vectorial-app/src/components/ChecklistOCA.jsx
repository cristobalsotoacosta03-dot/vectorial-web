import { useState, useMemo } from 'react'

// ── Definición de checklists ───────────────────────────────────────────────

const CHECKLIST_GLP = [
  {
    seccion: 'Distancias de seguridad (RIGLO / ITC-ICG-04)',
    items: [
      { id: 'g01', norma: 'RIGLO Ap.1', texto: 'Distancia mínima a edificios habitados cumplida' },
      { id: 'g02', norma: 'RIGLO Ap.1', texto: 'Distancia mínima a línea de propiedad cumplida' },
      { id: 'g03', norma: 'RIGLO Ap.1', texto: 'Distancia mínima a captaciones de agua cumplida' },
      { id: 'g04', norma: 'RIGLO Ap.1', texto: 'Distancia mínima a fosos y sumideros cumplida' },
      { id: 'g05', norma: 'ITC-ICG-04', texto: 'Perímetro de protección delimitado y vallado' },
    ]
  },
  {
    seccion: 'Equipo y accesorios del depósito',
    items: [
      { id: 'g06', norma: 'ITC-ICG-04', texto: 'Válvula de seguridad tarada, sellada y homologada' },
      { id: 'g07', norma: 'ITC-ICG-04', texto: 'Manómetro homologado y con escala adecuada' },
      { id: 'g08', norma: 'ITC-ICG-04', texto: 'Indicador de nivel (telemedida o visor directo)' },
      { id: 'g09', norma: 'ITC-ICG-04', texto: 'Válvula de exceso de flujo (VEF) instalada' },
      { id: 'g10', norma: 'ITC-ICG-04', texto: 'Válvula de cierre por exceso de presión' },
      { id: 'g11', norma: 'UNE 60.250', texto: 'Conexiones de carga (DN 50 mín.) con tapón de seguridad' },
    ]
  },
  {
    seccion: 'Red de distribución y regulación',
    items: [
      { id: 'g12', norma: 'RIGLO',      texto: 'Tuberías en buen estado, sin corrosión visible' },
      { id: 'g13', norma: 'UNE EN 1555', texto: 'Material de tuberías conforme (acero, cobre o PE)' },
      { id: 'g14', norma: 'ITC-ICG-04', texto: 'Reguladores de presión primera etapa homologados' },
      { id: 'g15', norma: 'ITC-ICG-04', texto: 'Reguladores de presión segunda etapa homologados' },
      { id: 'g16', norma: 'ITC-ICG-04', texto: 'Armario regulador ventilado y accesible' },
      { id: 'g17', norma: 'RIGLO',      texto: 'Prueba de estanqueidad realizada y documentada' },
    ]
  },
  {
    seccion: 'Protección y señalización',
    items: [
      { id: 'g18', norma: 'ITC-ICG-04', texto: 'Protección catódica / anticorrosión en depósito aéreo' },
      { id: 'g19', norma: 'ITC-ICG-04', texto: 'Señales "PELIGRO — GLP" visibles en accesos' },
      { id: 'g20', norma: 'RIPCI',      texto: 'Extintor CO₂ o polvo (mín. 6 kg) en proximidad' },
      { id: 'g21', norma: 'RIPCI',      texto: 'Señalización de emergencias y evacuación' },
    ]
  },
  {
    seccion: 'Documentación y legalización',
    items: [
      { id: 'g22', norma: 'RIGLO',      texto: 'Certificado de fabricación del depósito (ASME/UNE)' },
      { id: 'g23', norma: 'ITC-ICG-04', texto: 'Proyecto técnico firmado por ing. competente' },
      { id: 'g24', norma: 'RIGLO',      texto: 'Certificado de inspección OCA (organismo control)' },
      { id: 'g25', norma: 'ITC-ICG-04', texto: 'Plan de emergencia interior disponible en sala' },
      { id: 'g26', norma: 'RIGLO',      texto: 'Revisiones periódicas al día (cada 10 años aéreo, 5 enterrado)' },
    ]
  },
]

const CHECKLIST_RITE = [
  {
    seccion: 'Sala de calderas / máquinas — RITE IT 1.3.4.1',
    items: [
      { id: 'r01', norma: 'RITE IT 1.3.4.1.2', texto: 'Ventilación natural o forzada correctamente dimensionada' },
      { id: 'r02', norma: 'RITE IT 1.3.4.4',   texto: 'Conductos de evacuación de humos y gases de combustión' },
      { id: 'r03', norma: 'RITE IT 1.3.4.1',   texto: 'Acceso y espacio mínimo para mantenimiento (0,5 m libre)' },
      { id: 'r04', norma: 'RITE IT 1.3.4.1',   texto: 'Puerta de acceso con apertura al exterior, resistente al fuego' },
      { id: 'r05', norma: 'RITE IT 1.3.4.1',   texto: 'Señalización "SALA DE CALDERAS" y pictogramas de seguridad' },
    ]
  },
  {
    seccion: 'Equipos de seguridad — RITE IT 1.3.4.5',
    items: [
      { id: 'r06', norma: 'RITE IT 1.3.4.5',   texto: 'Válvula de seguridad tarada y sellada (P_TS ≥ 3 bar)' },
      { id: 'r07', norma: 'RITE IT 1.3.4.5',   texto: 'Termostato de seguridad ajustado a ≤ 100 °C' },
      { id: 'r08', norma: 'RITE IT 1.3.4.5',   texto: 'Grupo de seguridad completo (válvula + purgador + manómetro)' },
      { id: 'r09', norma: 'RITE IT 1.3.4.5',   texto: 'Vaso de expansión dimensionado y presión de carga correcta' },
      { id: 'r10', norma: 'RITE IT 1.3.4.5',   texto: 'Presostato de alta y baja presión en circuito' },
    ]
  },
  {
    seccion: 'Aislamiento térmico — RITE IT 1.2.4.2.1',
    items: [
      { id: 'r11', norma: 'RITE IT 1.2.4.2.1', texto: 'Tuberías de impulsión con espesor de aislamiento correcto' },
      { id: 'r12', norma: 'RITE IT 1.2.4.2.1', texto: 'Tuberías de retorno con espesor de aislamiento correcto' },
      { id: 'r13', norma: 'RITE IT 1.2.4.2.1', texto: 'Coquillas de aislamiento con conductividad λ ≤ 0,040 W/m·K' },
      { id: 'r14', norma: 'RITE IT 1.2.4.2.1', texto: 'Valvulería y accesorios aislados (codos, reducciones, T)' },
    ]
  },
  {
    seccion: 'Eficiencia y control — RITE IT 1.2.4.1 / IT 1.2.4.3',
    items: [
      { id: 'r15', norma: 'RITE IT 1.2.4.1',   texto: 'Rendimiento estacional caldera ≥ 90 % (directiva ErP)' },
      { id: 'r16', norma: 'RITE IT 1.2.4.3',   texto: 'Sistema de regulación automático (termostato ambiente / sonda ext.)' },
      { id: 'r17', norma: 'RITE IT 1.2.4.3',   texto: 'Equilibrado hidráulico de circuitos verificado' },
      { id: 'r18', norma: 'RITE IT 1.2.4.3.6', texto: 'Contador de energía térmica instalado (P > 70 kW)' },
      { id: 'r19', norma: 'RITE IT 1.2.4.6',   texto: 'Depósito de inercia dimensionado según potencia instalada' },
    ]
  },
  {
    seccion: 'Calidad del agua — RITE IT 1.3.4.3',
    items: [
      { id: 'r20', norma: 'RITE IT 1.3.4.3',   texto: 'pH del agua de circuito entre 7 y 9' },
      { id: 'r21', norma: 'RITE IT 1.3.4.3',   texto: 'Dureza total del agua < 10 °F (o tratamiento descalcificador)' },
      { id: 'r22', norma: 'RITE IT 1.3.4.3',   texto: 'Inhibidores de corrosión y anticongelante (si procede)' },
    ]
  },
  {
    seccion: 'Documentación — RITE IT 1.4 / Mantenimiento',
    items: [
      { id: 'r23', norma: 'RITE IT 1.4.1',     texto: 'Proyecto técnico de las instalaciones térmicas' },
      { id: 'r24', norma: 'RITE IT 1.4.2',     texto: 'Manual de uso y mantenimiento entregado a propiedad' },
      { id: 'r25', norma: 'RITE IT 1.4.3',     texto: 'Certificado de instalación firmado por empresa habilitada' },
      { id: 'r26', norma: 'RITE IT 1.4.4',     texto: 'Libro de mantenimiento disponible y actualizado' },
      { id: 'r27', norma: 'RITE',              texto: 'Esquema hidráulico plastificado y visible en sala' },
    ]
  },
]

const ESTADOS = {
  pendiente:  { label: '🔘 Pendiente',  cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  cumple:     { label: '✅ Cumple',     cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  no_cumple:  { label: '❌ No cumple',  cls: 'bg-red-100 text-red-700 border-red-200' },
  na:         { label: '⊘ N/A',        cls: 'bg-slate-50 text-slate-400 border-slate-200 line-through' },
}

const STORAGE_KEY = 'vectorial_checklist_v1'

function loadChecklist(tipo) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
    return all[tipo] || {}
  } catch { return {} }
}

function saveChecklist(tipo, estados) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...all, [tipo]: estados }))
  } catch {}
}

// ── Componente ─────────────────────────────────────────────────────────────

export default function ChecklistOCA() {
  const [modo, setModo] = useState('glp')
  const [estadosGLP,  setEstadosGLP]  = useState(() => loadChecklist('glp'))
  const [estadosRITE, setEstadosRITE] = useState(() => loadChecklist('rite'))

  const lista    = modo === 'glp' ? CHECKLIST_GLP  : CHECKLIST_RITE
  const estados  = modo === 'glp' ? estadosGLP     : estadosRITE
  const setEst   = modo === 'glp' ? setEstadosGLP  : setEstadosRITE

  function setItem(id, valor) {
    const next = { ...estados, [id]: valor }
    setEst(next)
    saveChecklist(modo, next)
  }

  function reset() {
    const next = {}
    setEst(next)
    saveChecklist(modo, next)
  }

  const stats = useMemo(() => {
    const total    = lista.flatMap(s => s.items).length
    const cumple   = Object.values(estados).filter(v => v === 'cumple').length
    const noCumple = Object.values(estados).filter(v => v === 'no_cumple').length
    const na       = Object.values(estados).filter(v => v === 'na').length
    const revisados = cumple + noCumple + na
    const pct = total > 0 ? Math.round((revisados / total) * 100) : 0
    return { total, cumple, noCumple, na, revisados, pct }
  }, [estados, lista])

  return (
    <div className="space-y-5">
      {/* Selector modo */}
      <div className="flex gap-2">
        {[['glp','🔥 Depósito GLP','RIGLO · ITC-ICG-04'],['rite','❄️ Instalación RITE','Salas calderas · clima']].map(([v, l, s]) => (
          <button key={v} onClick={() => setModo(v)}
            className={`flex-1 text-left px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${modo === v ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
            <div>{l}</div>
            <div className={`text-xs font-normal mt-0.5 ${modo === v ? 'text-slate-300' : 'text-slate-400'}`}>{s}</div>
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-slate-700">
              {modo === 'glp' ? 'Pre-inspección OCA — Depósito GLP' : 'Pre-inspección OCA — Instalación RITE'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {stats.revisados} de {stats.total} items revisados · {stats.pct} % completado
            </p>
          </div>
          <button onClick={reset} className="text-xs text-slate-400 hover:text-red-500 transition-colors border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg">
            Reiniciar
          </button>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${stats.pct}%` }} />
        </div>
        <div className="flex gap-4 text-xs">
          <span className="text-emerald-600 font-semibold">✅ {stats.cumple} cumplen</span>
          <span className="text-red-600 font-semibold">❌ {stats.noCumple} no cumplen</span>
          <span className="text-slate-400">⊘ {stats.na} N/A</span>
          <span className="text-slate-400">🔘 {stats.total - stats.revisados} pendientes</span>
        </div>
      </div>

      {/* Secciones */}
      {lista.map(sec => (
        <div key={sec.seccion} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
            <h3 className="text-sm font-bold text-slate-700">{sec.seccion}</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {sec.items.map(item => {
              const est = estados[item.id] || 'pendiente'
              return (
                <div key={item.id} className="flex items-start gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="shrink-0 mt-0.5">
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">{item.norma}</span>
                  </div>
                  <p className={`flex-1 text-sm ${est === 'na' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.texto}</p>
                  <div className="flex gap-1 shrink-0">
                    {Object.entries(ESTADOS).map(([key, info]) => (
                      <button key={key} onClick={() => setItem(item.id, key)}
                        title={info.label}
                        className={`px-2 py-1 rounded-lg text-xs border transition-all ${est === key ? info.cls + ' font-bold shadow-sm' : 'bg-white text-slate-300 border-slate-200 hover:bg-slate-50'}`}>
                        {info.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {stats.noCumple > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          <span className="font-bold">⚠️ {stats.noCumple} ítem{stats.noCumple > 1 ? 's' : ''} no conforme{stats.noCumple > 1 ? 's' : ''}.</span>{' '}
          Corrige las deficiencias antes de solicitar la inspección OCA.
        </div>
      )}
      {stats.pct === 100 && stats.noCumple === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-700">
          <span className="font-bold">✅ Todos los items revisados y conformes.</span>{' '}
          La instalación está lista para solicitar la inspección oficial OCA.
        </div>
      )}
    </div>
  )
}
