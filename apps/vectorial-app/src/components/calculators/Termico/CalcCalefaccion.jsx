import { useState, useMemo } from 'react'
import { Flame } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, SelectField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

// Factor volumétrico de carga de calefacción por zona climática — CTE DB-HE
// (valores orientativos de proyecto, no exhaustivos por tipo de cerramiento).
const ZONAS = [
  { id: 'A', label: 'Zona A (costa sur/Canarias)', factor: 30 },
  { id: 'B', label: 'Zona B (costa mediterránea)',  factor: 35 },
  { id: 'C', label: 'Zona C (meseta, interior)',     factor: 40 },
  { id: 'D', label: 'Zona D (interior norte)',       factor: 45 },
  { id: 'E', label: 'Zona E (alta montaña)',         factor: 50 },
]

const POTENCIA_ELEMENTO = 150 // W por elemento de radiador de aluminio típico

function calcular({ zonaId, superficie, altura, elementoPotencia }) {
  const z = ZONAS.find(x => x.id === zonaId) || ZONAS[2]
  const S = Number(superficie)
  const H = Number(altura)
  const potencia = S * H * z.factor
  const elementos = Math.ceil(potencia / Number(elementoPotencia))
  return { z, potencia, elementos }
}

export default function CalcCalefaccion({ obraId, obraNombre }) {
  const [form, setForm] = useState({ zonaId: 'C', superficie: 20, altura: 2.5, elementoPotencia: POTENCIA_ELEMENTO })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 0 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Flame} title="Calefacción por radiadores" subtitle="Método volumétrico simplificado · CTE DB-HE" color="orange" />
          <FieldGroup label="Zona climática">
            <SelectField value={form.zonaId} onChange={v => set('zonaId', v)}
              options={ZONAS.map(z => ({ value: z.id, label: `${z.label} — ${z.factor} W/m³` }))} />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Superficie de la estancia (m²)">
              <NumberField value={form.superficie} min={1} onChange={v => set('superficie', v)} />
            </FieldGroup>
            <FieldGroup label="Altura libre (m)">
              <NumberField value={form.altura} min={2} step={0.1} onChange={v => set('altura', v)} />
            </FieldGroup>
          </div>
          <FieldGroup label="Potencia por elemento de radiador (W)">
            <NumberField value={form.elementoPotencia} min={50} onChange={v => set('elementoPotencia', v)} />
          </FieldGroup>
          <NormativaBox color="orange">
            Potencia = Superficie × Altura × factor volumétrico de la zona climática (W/m³).
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Potencia de calefacción necesaria"
            color="orange"
            metrics={[
              { value: fmt(r.potencia), unit: 'W', label: 'Potencia total' },
              { value: r.elementos, unit: 'ud', label: 'Elementos de radiador' },
            ]}
            footer={`${r.z.label} · ${form.elementoPotencia} W/elemento`}
          />
        </>}
      />
      <ExportCalculo
        tipo="calefaccion"
        titulo="Calefacción por Radiadores"
        campos={[
          { label: 'Zona climática', valor: r.z.label },
          { label: 'Superficie', valor: `${form.superficie} m²` },
          { label: 'Altura', valor: `${form.altura} m` },
          { label: 'Potencia total necesaria', valor: `${fmt(r.potencia)} W` },
          { label: 'Elementos de radiador', valor: `${r.elementos} ud (${form.elementoPotencia} W/ud)` },
          { label: 'Normativa', valor: 'CTE DB-HE · RITE' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
