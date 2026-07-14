import { useState, useMemo } from 'react'
import { ShieldCheck } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, SelectField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

const CALIBRES_PIA = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100]

function calibreComercial(Ib, Iz) {
  // In debe cumplir Ib ≤ In ≤ Iz (ITC-BT-22)
  const candidatos = CALIBRES_PIA.filter(c => c >= Ib && c <= Iz)
  return candidatos.length ? candidatos[0] : CALIBRES_PIA.find(c => c >= Ib) ?? null
}

function calcular({ intensidadEmpleo, ampacidadCable, tipoCircuito }) {
  const Ib = Number(intensidadEmpleo)
  const Iz = Number(ampacidadCable)
  const In = calibreComercial(Ib, Iz)
  const cumple = In !== null && In >= Ib && In <= Iz
  // Sensibilidad diferencial — ITC-BT-24: 30 mA en circuitos de tomas de
  // corriente/uso general, 300 mA admisible en otros con puesta a tierra
  // verificada (criterio habitual de proyecto, no exhaustivo).
  const sensibilidad = tipoCircuito === 'tomas' ? 30 : 300
  return { Ib, Iz, In, cumple, sensibilidad }
}

export default function CalcProtecciones({ obraId, obraNombre }) {
  const [form, setForm] = useState({ intensidadEmpleo: 16, ampacidadCable: 25, tipoCircuito: 'tomas' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={ShieldCheck} title="Protecciones del circuito" subtitle="ITC-BT-22 (sobreintensidad) · ITC-BT-24 (diferencial)" color="amber" />
          <FieldGroup label="Intensidad de empleo Ib (A)">
            <NumberField value={form.intensidadEmpleo} min={1} onChange={v => set('intensidadEmpleo', v)} />
          </FieldGroup>
          <FieldGroup label="Intensidad admisible del cable Iz (A)">
            <NumberField value={form.ampacidadCable} min={1} onChange={v => set('ampacidadCable', v)} />
          </FieldGroup>
          <FieldGroup label="Tipo de circuito">
            <SelectField value={form.tipoCircuito} onChange={v => set('tipoCircuito', v)}
              options={[{ value: 'tomas', label: 'Tomas de corriente / uso general' }, { value: 'fijo', label: 'Receptor fijo con tierra verificada' }]} />
          </FieldGroup>
          <NormativaBox color="amber">
            Condición ITC-BT-22: Ib ≤ In ≤ Iz. El calibre se toma del catálogo normalizado de magnetotérmicos.
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Protecciones recomendadas"
            color="amber"
            metrics={[
              { value: r.In ?? '—', unit: 'A', label: 'Magnetotérmico (PIA)' },
              { value: r.sensibilidad, unit: 'mA', label: 'Diferencial recomendado' },
            ]}
            footer={r.cumple ? `Cumple Ib (${r.Ib} A) ≤ In (${r.In} A) ≤ Iz (${r.Iz} A)` : 'No hay calibre normalizado que cumpla Ib ≤ In ≤ Iz — revisa la sección del cable'}
          />
        </>}
      />
      <ExportCalculo
        tipo="protecciones"
        titulo="Protecciones del Circuito"
        campos={[
          { label: 'Intensidad de empleo Ib', valor: `${form.intensidadEmpleo} A` },
          { label: 'Ampacidad del cable Iz', valor: `${form.ampacidadCable} A` },
          { label: 'Tipo de circuito', valor: form.tipoCircuito === 'tomas' ? 'Tomas de corriente' : 'Receptor fijo' },
          { label: 'Magnetotérmico recomendado', valor: `${r.In ?? '—'} A` },
          { label: 'Diferencial recomendado', valor: `${r.sensibilidad} mA` },
          { label: 'Cumple Ib ≤ In ≤ Iz', valor: r.cumple ? 'Sí' : 'No' },
          { label: 'Normativa', valor: 'ITC-BT-22 · ITC-BT-24' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
