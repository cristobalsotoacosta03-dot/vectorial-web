import { useState } from 'react'
import { useObras } from '../hooks/useObras'
import Editor2D from '../components/editor2d/Editor2D'

export default function Planos({ selectedObraId }) {
  const { obras } = useObras()
  const obraSel = obras.find(o => o.id === selectedObraId) || null
  const [nombrePlano, setNombrePlano] = useState('Plano sin título')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Editor de Planos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Planos de planta y esquemas de principio · exportación PNG / PDF / DXF
          </p>
        </div>
        <input
          value={nombrePlano}
          onChange={e => setNombrePlano(e.target.value)}
          className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/40 w-full sm:w-64"
        />
      </div>

      {obraSel && (
        <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 dark:bg-primary-500/10 dark:border-primary-500/20 dark:text-primary-400 text-xs font-semibold px-3 py-2 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-primary-500" />
          {obraSel.nombre}
        </div>
      )}

      <Editor2D nombrePlano={nombrePlano} />

      <div className="bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 rounded-xl p-4 text-xs text-amber-700 dark:text-amber-400">
        <span className="font-bold">Aviso: </span>
        Editor de planos orientativo. La exportación DXF incluye únicamente líneas, rectángulos, círculos y textos
        (entidades básicas) — no sustituye a un plano de proyecto realizado en un CAD profesional.
      </div>
    </div>
  )
}
