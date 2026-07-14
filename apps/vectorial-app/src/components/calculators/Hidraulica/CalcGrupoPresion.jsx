import { useState, useMemo } from 'react'
import { Waves } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

// Dimensionado de depósito hidroneumático (grupo de presión) a partir del
// caudal de la bomba y los arranques/hora máximos admisibles del motor —
// criterio habitual de fabricantes (Espa, Calpeda) basado en la Ley de Boyle.
function calcular({ caudalBomba, presionArranque, presionParada, arranquesHora }) {
  const Qb = Number(caudalBomba) // L/min
  const Pa = Number(presionArranque) + 1 // bar absoluto
  const Pp = Number(presionParada) + 1   // bar absoluto
  const N  = Number(arranquesHora)
  const V  = (Qb * Pa) / (Math.max(1, N) * Math.max(0.1, Pp - Pa))
  return { V }
}

export default function CalcGrupoPresion({ obraId, obraNombre }) {
  const [form, setForm] = useState({ caudalBomba: 100, presionArranque: 2, presionParada: 4, arranquesHora: 20 })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 0 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Waves} title="Grupo de presión / depósito hidroneumático" subtitle="Ley de Boyle · criterio de arranques/hora del motor" color="sky" />
          <FieldGroup label="Caudal de la bomba (L/min)">
            <NumberField value={form.caudalBomba} min={1} onChange={v => set('caudalBomba', v)} />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Presión de arranque (bar)">
              <NumberField value={form.presionArranque} min={0.5} step={0.1} onChange={v => set('presionArranque', v)} />
            </FieldGroup>
            <FieldGroup label="Presión de parada (bar)">
              <NumberField value={form.presionParada} min={1} step={0.1} onChange={v => set('presionParada', v)} />
            </FieldGroup>
          </div>
          <FieldGroup label="Arranques máximos/hora del motor">
            <NumberField value={form.arranquesHora} min={5} max={60} onChange={v => set('arranquesHora', v)} />
          </FieldGroup>
          <NormativaBox color="sky">
            <span className="font-bold">Fórmula: </span>V = (Qb × Pa) / (N × (Pp − Pa)), presiones en bar absolutos.
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Depósito hidroneumático necesario"
            color="sky"
            metrics={[{ value: fmt(r.V), unit: 'L', label: 'Volumen del depósito' }]}
          />
        </>}
      />
      <ExportCalculo
        tipo="grupo_presion"
        titulo="Grupo de Presión — Depósito Hidroneumático"
        campos={[
          { label: 'Caudal de la bomba', valor: `${form.caudalBomba} L/min` },
          { label: 'Presión de arranque', valor: `${form.presionArranque} bar` },
          { label: 'Presión de parada', valor: `${form.presionParada} bar` },
          { label: 'Arranques máx./hora', valor: String(form.arranquesHora) },
          { label: 'Volumen del depósito', valor: `${fmt(r.V)} L` },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
