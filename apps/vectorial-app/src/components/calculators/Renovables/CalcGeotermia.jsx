import { useState, useMemo } from 'react'
import { Mountain } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, SelectField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

// Capacidad de extracción térmica del terreno — orientativo según tipo geológico
const TERRENOS = [
  { id: 'seco',    label: 'Terreno seco (sedimentos sueltos)', capacidad: 20 },
  { id: 'arcilla', label: 'Arcilla / limo húmedo',              capacidad: 40 },
  { id: 'arena',   label: 'Arena saturada de agua',              capacidad: 60 },
  { id: 'roca',    label: 'Roca compacta',                       capacidad: 70 },
]

const LONGITUD_MAX_SONDA = 100 // m — profundidad práctica habitual por perforación

function calcular({ potenciaCalorifica, cop, terrenoId }) {
  const t = TERRENOS.find(x => x.id === terrenoId) || TERRENOS[1]
  const Pcal = Number(potenciaCalorifica) * 1000 // W
  const COP = Number(cop)
  // Potencia extraída del terreno = potencia calorífica × (COP-1)/COP
  const potenciaExtraccion = Pcal * (COP - 1) / COP
  const longitudTotal = potenciaExtraccion / t.capacidad
  const numSondas = Math.ceil(longitudTotal / LONGITUD_MAX_SONDA)
  return { t, potenciaExtraccion, longitudTotal, numSondas }
}

export default function CalcGeotermia({ obraId, obraNombre }) {
  const [form, setForm] = useState({ potenciaCalorifica: 15, cop: 4.2, terrenoId: 'arcilla' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 0 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Mountain} title="Geotermia — sondas verticales" subtitle="Bomba de calor geotérmica · dimensionado del campo de sondas" color="emerald" />
          <FieldGroup label="Potencia calorífica de la bomba de calor (kW)">
            <NumberField value={form.potenciaCalorifica} min={1} onChange={v => set('potenciaCalorifica', v)} />
          </FieldGroup>
          <FieldGroup label="COP estimado en calefacción">
            <NumberField value={form.cop} min={2.5} max={6} step={0.1} onChange={v => set('cop', v)} />
          </FieldGroup>
          <FieldGroup label="Tipo de terreno">
            <SelectField value={form.terrenoId} onChange={v => set('terrenoId', v)}
              options={TERRENOS.map(t => ({ value: t.id, label: `${t.label} — ${t.capacidad} W/m` }))} />
          </FieldGroup>
          <NormativaBox color="emerald">
            Potencia a extraer del terreno = P_bomba × (COP−1)/COP. Longitud de sonda = potencia a extraer / capacidad del terreno (W/m).
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Campo de sondas geotérmicas"
            color="emerald"
            metrics={[
              { value: fmt(r.longitudTotal), unit: 'm', label: 'Longitud total de sondas' },
              { value: r.numSondas, unit: 'ud', label: `Nº de sondas (≤${LONGITUD_MAX_SONDA} m c/u)` },
            ]}
            footer={`Potencia a extraer del terreno: ${fmt(r.potenciaExtraccion / 1000)} kW · ${r.t.label}`}
          />
        </>}
      />
      <ExportCalculo
        tipo="geotermia"
        titulo="Geotermia — Sondas Verticales"
        campos={[
          { label: 'Potencia calorífica de la bomba', valor: `${form.potenciaCalorifica} kW` },
          { label: 'COP estimado', valor: String(form.cop) },
          { label: 'Tipo de terreno', valor: r.t.label },
          { label: 'Potencia a extraer del terreno', valor: `${fmt(r.potenciaExtraccion / 1000)} kW` },
          { label: 'Longitud total de sondas', valor: `${fmt(r.longitudTotal)} m` },
          { label: 'Número de sondas', valor: `${r.numSondas} ud` },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
