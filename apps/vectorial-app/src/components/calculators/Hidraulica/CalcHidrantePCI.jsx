import { useState, useMemo } from 'react'
import { FireExtinguisher } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, SelectField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

const DIAMETROS = [
  { id: '80',  label: 'Hidrante DN-80 (500 L/min)',  caudal: 500 },
  { id: '100', label: 'Hidrante DN-100 (1000 L/min)', caudal: 1000 },
]

function calcular({ diametroId, numHidrantes, autonomiaHoras, presionMinima }) {
  const d = DIAMETROS.find(x => x.id === diametroId) || DIAMETROS[1]
  const n = Number(numHidrantes)
  const caudalTotal = d.caudal * n           // L/min
  const caudalLs    = caudalTotal / 60       // L/s
  const volumenReserva = (caudalTotal * 60 * Number(autonomiaHoras)) / 1000 // m3
  return { d, caudalTotal, caudalLs, volumenReserva, presionMinima: Number(presionMinima) }
}

export default function CalcHidrantePCI({ obraId, obraNombre }) {
  const [form, setForm] = useState({ diametroId: '100', numHidrantes: 1, autonomiaHoras: 2, presionMinima: 1 })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 1 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={FireExtinguisher} title="Red de hidrantes PCI" subtitle="RD 513/2017 (RIPCI) · CTE DB-SI · UNE-EN 14384" color="orange" />
          <FieldGroup label="Diámetro del hidrante">
            <SelectField value={form.diametroId} onChange={v => set('diametroId', v)}
              options={DIAMETROS.map(d => ({ value: d.id, label: d.label }))} />
          </FieldGroup>
          <FieldGroup label="Hidrantes funcionando simultáneamente">
            <NumberField value={form.numHidrantes} min={1} max={4} onChange={v => set('numHidrantes', v)} />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Autonomía exigida (h)">
              <NumberField value={form.autonomiaHoras} min={1} max={4} onChange={v => set('autonomiaHoras', v)} />
            </FieldGroup>
            <FieldGroup label="Presión residual mínima (bar)">
              <NumberField value={form.presionMinima} min={0.5} step={0.1} onChange={v => set('presionMinima', v)} />
            </FieldGroup>
          </div>
          <NormativaBox color="orange">
            Caudal unitario según RIPCI: 500 L/min (DN-80) o 1.000 L/min (DN-100). Autonomía mínima habitual: 2 horas.
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Dimensionado de la red de hidrantes"
            color="orange"
            metrics={[
              { value: fmt(r.caudalTotal), unit: 'L/min', label: 'Caudal simultáneo' },
              { value: fmt(r.volumenReserva), unit: 'm³', label: 'Reserva de agua' },
              { value: fmt(r.presionMinima), unit: 'bar', label: 'Presión residual mín.' },
            ]}
            footer={`Caudal: ${fmt(r.caudalLs)} L/s · ${form.numHidrantes} hidrante(s) ${r.d.label}`}
          />
        </>}
      />
      <ExportCalculo
        tipo="hidrante_pci"
        titulo="Red de Hidrantes contra Incendios"
        campos={[
          { label: 'Tipo de hidrante', valor: r.d.label },
          { label: 'Hidrantes simultáneos', valor: String(form.numHidrantes) },
          { label: 'Autonomía exigida', valor: `${form.autonomiaHoras} h` },
          { label: 'Presión residual mínima', valor: `${form.presionMinima} bar` },
          { label: 'Caudal simultáneo total', valor: `${fmt(r.caudalTotal)} L/min (${fmt(r.caudalLs)} L/s)` },
          { label: 'Volumen de reserva de agua', valor: `${fmt(r.volumenReserva)} m³` },
          { label: 'Normativa', valor: 'RD 513/2017 (RIPCI) · CTE DB-SI' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
