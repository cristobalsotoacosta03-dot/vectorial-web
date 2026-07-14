import { useState, useMemo } from 'react'
import { CloudRain } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

// Diámetro de bajante de pluviales según caudal — CTE DB-HS5 Tabla 4.8 (adaptada)
const BAJANTES_PLUVIALES = [
  [4.6, 50], [8.3, 63], [17.3, 75], [33.2, 90], [54.0, 110], [126.0, 125], [231.0, 160],
]

function diametroPluvial(caudal) {
  for (const [limite, diametro] of BAJANTES_PLUVIALES) {
    if (caudal <= limite) return diametro
  }
  return 200
}

// Intensidad pluviométrica orientativa por isoyeta (mm/h a 5 min, CTE DB-HS5 Anejo B)
const ZONAS_ISOYETA = [
  { id: 'baja',  label: 'Isoyeta ≤ 30 (interior seco)', intensidad: 90 },
  { id: 'media', label: 'Isoyeta 30-60 (mediterráneo)', intensidad: 110 },
  { id: 'alta',  label: 'Isoyeta > 60 (cornisa cantábrica)', intensidad: 155 },
]

function calcular({ superficie, zonaId }) {
  const z = ZONAS_ISOYETA.find(x => x.id === zonaId) || ZONAS_ISOYETA[1]
  const S = Number(superficie)
  const caudal = (S * z.intensidad) / 3600 // L/s
  const diametro = diametroPluvial(caudal)
  const sumideros = Math.max(1, Math.ceil(S / 100)) // criterio habitual: 1 sumidero cada 100 m²
  return { z, caudal, diametro, sumideros }
}

export default function CalcPluviales({ obraId, obraNombre }) {
  const [form, setForm] = useState({ superficie: 200, zonaId: 'media' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 2 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={CloudRain} title="Pluviales — evacuación de cubierta" subtitle="CTE DB-HS5 · intensidad pluviométrica" color="sky" />
          <FieldGroup label="Superficie de cubierta en proyección horizontal (m²)">
            <NumberField value={form.superficie} min={1} onChange={v => set('superficie', v)} />
          </FieldGroup>
          <FieldGroup label="Zona pluviométrica">
            <select value={form.zonaId} onChange={e => set('zonaId', e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40">
              {ZONAS_ISOYETA.map(z => <option key={z.id} value={z.id}>{z.label} — {z.intensidad} mm/h</option>)}
            </select>
          </FieldGroup>
          <NormativaBox color="sky">
            Q = Superficie × Intensidad / 3.600. Diámetro de bajante y nº de sumideros según CTE DB-HS5.
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Dimensionado de pluviales"
            color="sky"
            metrics={[
              { value: fmt(r.caudal), unit: 'L/s', label: 'Caudal de diseño' },
              { value: r.diametro, unit: 'mm', label: 'Ø bajante mínimo' },
              { value: r.sumideros, unit: 'ud', label: 'Sumideros recomendados' },
            ]}
          />
        </>}
      />
      <ExportCalculo
        tipo="pluviales"
        titulo="Pluviales — Evacuación de Cubierta"
        campos={[
          { label: 'Superficie de cubierta', valor: `${form.superficie} m²` },
          { label: 'Zona pluviométrica', valor: r.z.label },
          { label: 'Caudal de diseño', valor: `${fmt(r.caudal)} L/s` },
          { label: 'Diámetro mínimo de bajante', valor: `${r.diametro} mm` },
          { label: 'Sumideros recomendados', valor: `${r.sumideros} ud` },
          { label: 'Normativa', valor: 'CTE DB-HS5' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
