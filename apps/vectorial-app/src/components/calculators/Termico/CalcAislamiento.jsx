import { useState, useMemo } from 'react'
import { Layers } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, SelectField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

// Transmitancia límite U por zona climática y tipo de cerramiento — CTE DB-HE1
// (valores de referencia habituales de proyecto).
const U_LIMITE = {
  muro:     { A: 0.94, B: 0.83, C: 0.68, D: 0.55, E: 0.49 },
  cubierta: { A: 0.50, B: 0.45, C: 0.41, D: 0.35, E: 0.31 },
  suelo:    { A: 0.60, B: 0.53, C: 0.49, D: 0.42, E: 0.36 },
}

const MATERIALES = [
  { id: 'eps',   label: 'Poliestireno expandido (EPS)', lambda: 0.036 },
  { id: 'lana',  label: 'Lana mineral',                  lambda: 0.040 },
  { id: 'pur',   label: 'Poliuretano proyectado',        lambda: 0.028 },
  { id: 'xps',   label: 'Poliestireno extruido (XPS)',   lambda: 0.034 },
]

function calcular({ cerramiento, zona, uBase, materialId }) {
  const uObjetivo = U_LIMITE[cerramiento][zona]
  const m = MATERIALES.find(x => x.id === materialId) || MATERIALES[0]
  const Ub = Number(uBase)
  const espesor = m.lambda * (1 / uObjetivo - 1 / Ub)
  return { uObjetivo, m, espesorM: espesor, espesorMm: espesor * 1000 }
}

export default function CalcAislamiento({ obraId, obraNombre }) {
  const [form, setForm] = useState({ cerramiento: 'muro', zona: 'C', uBase: 1.8, materialId: 'eps' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 1 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Layers} title="Espesor de aislamiento térmico" subtitle="CTE DB-HE1 · transmitancia límite" color="orange" />
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Tipo de cerramiento">
              <SelectField value={form.cerramiento} onChange={v => set('cerramiento', v)}
                options={[{ value: 'muro', label: 'Muro / fachada' }, { value: 'cubierta', label: 'Cubierta' }, { value: 'suelo', label: 'Suelo' }]} />
            </FieldGroup>
            <FieldGroup label="Zona climática">
              <SelectField value={form.zona} onChange={v => set('zona', v)}
                options={['A', 'B', 'C', 'D', 'E'].map(z => ({ value: z, label: `Zona ${z}` }))} />
            </FieldGroup>
          </div>
          <FieldGroup label="Transmitancia del cerramiento sin aislar U_base (W/m²K)">
            <NumberField value={form.uBase} min={0.5} step={0.05} onChange={v => set('uBase', v)} />
          </FieldGroup>
          <FieldGroup label="Material aislante">
            <SelectField value={form.materialId} onChange={v => set('materialId', v)}
              options={MATERIALES.map(m => ({ value: m.id, label: `${m.label} (λ=${m.lambda} W/mK)` }))} />
          </FieldGroup>
          <NormativaBox color="orange">
            e = λ × (1/U_objetivo − 1/U_base). U_objetivo según CTE DB-HE1 por zona y cerramiento.
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Espesor de aislamiento necesario"
            color="orange"
            metrics={[
              { value: fmt(r.espesorMm), unit: 'mm', label: 'Espesor mínimo' },
              { value: fmt(r.uObjetivo), unit: 'W/m²K', label: 'U objetivo (límite CTE)' },
            ]}
            footer={r.espesorMm <= 0 ? 'El cerramiento base ya cumple sin aislamiento adicional' : `Material: ${r.m.label}`}
          />
        </>}
      />
      <ExportCalculo
        tipo="aislamiento"
        titulo="Espesor de Aislamiento Térmico"
        campos={[
          { label: 'Cerramiento', valor: form.cerramiento },
          { label: 'Zona climática', valor: form.zona },
          { label: 'U del cerramiento sin aislar', valor: `${form.uBase} W/m²K` },
          { label: 'U objetivo (CTE DB-HE1)', valor: `${fmt(r.uObjetivo)} W/m²K` },
          { label: 'Material aislante', valor: r.m.label },
          { label: 'Espesor mínimo necesario', valor: `${fmt(r.espesorMm)} mm` },
          { label: 'Normativa', valor: 'CTE DB-HE1' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
