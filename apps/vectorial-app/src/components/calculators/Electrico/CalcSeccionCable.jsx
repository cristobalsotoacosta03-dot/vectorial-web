import { useState, useMemo } from 'react'
import { Cable } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, SelectField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

const SECCIONES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240]

// Intensidad admisible por sección — cobre, instalación empotrada (referencia
// docs/referencia/normativas/UNE-EN-60364-5-52.md, mismos valores que ese doc).
const AMPACIDAD = [
  [16, 2.5], [20, 4], [25, 4], [32, 6], [40, 10], [50, 16],
  [63, 16], [80, 25], [100, 35], [125, 50], [160, 70], [200, 95],
]

function seccionPorIntensidad(In) {
  for (const [limite, seccion] of AMPACIDAD) {
    if (In <= limite) return seccion
  }
  return 240
}

function seccionComercial(s) {
  return SECCIONES.find(x => x >= s) ?? SECCIONES[SECCIONES.length - 1]
}

const GAMMA_CU = 56 // conductividad del cobre m/(Ω·mm²)

function calcular({ tipoCircuito, esquema, longitud, intensidad, cosPhi, tension }) {
  const L = Number(longitud)
  const I = Number(intensidad)
  const cos = Number(cosPhi)
  const V = Number(tension)
  const dUmaxPct = tipoCircuito === 'alumbrado' ? 3 : 5
  const dUmax = V * dUmaxPct / 100
  const factor = esquema === 'trifasico' ? Math.sqrt(3) : 2
  const S_caida = (factor * L * I * cos) / (GAMMA_CU * dUmax)
  const S_intensidad = seccionPorIntensidad(I)
  const S_final = seccionComercial(Math.max(S_caida, S_intensidad))
  const dU_real = (factor * L * I * cos) / (GAMMA_CU * S_final)
  const dU_real_pct = (dU_real / V) * 100
  return { dUmaxPct, S_caida, S_intensidad, S_final, dU_real, dU_real_pct }
}

export default function CalcSeccionCable({ obraId, obraNombre }) {
  const [form, setForm] = useState({
    tipoCircuito: 'fuerza', esquema: 'monofasico', longitud: 20, intensidad: 16, cosPhi: 0.9, tension: 230,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 2 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Cable} title="Sección de cable" subtitle="ITC-BT-19 · UNE-EN 60364-5-52" color="amber" />
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Tipo de circuito">
              <SelectField value={form.tipoCircuito} onChange={v => set('tipoCircuito', v)}
                options={[{ value: 'alumbrado', label: 'Alumbrado (ΔU 3%)' }, { value: 'fuerza', label: 'Fuerza/otros (ΔU 5%)' }]} />
            </FieldGroup>
            <FieldGroup label="Esquema">
              <SelectField value={form.esquema} onChange={v => set('esquema', v)}
                options={[{ value: 'monofasico', label: 'Monofásico' }, { value: 'trifasico', label: 'Trifásico' }]} />
            </FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Longitud del circuito (m)">
              <NumberField value={form.longitud} min={1} onChange={v => set('longitud', v)} />
            </FieldGroup>
            <FieldGroup label="Intensidad de diseño (A)">
              <NumberField value={form.intensidad} min={1} onChange={v => set('intensidad', v)} />
            </FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Factor de potencia (cos φ)">
              <NumberField value={form.cosPhi} min={0.5} max={1} step={0.01} onChange={v => set('cosPhi', v)} />
            </FieldGroup>
            <FieldGroup label="Tensión (V)">
              <NumberField value={form.tension} min={110} onChange={v => set('tension', v)} />
            </FieldGroup>
          </div>
          <NormativaBox color="amber">
            S = ({form.esquema === 'trifasico' ? '√3' : '2'} × L × I × cos φ) / (56 × ΔU). Se toma la sección mayor entre caída de tensión y ampacidad, redondeada a sección comercial.
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Sección de cable de cobre"
            color="amber"
            metrics={[
              { value: fmt(r.S_final), unit: 'mm²', label: 'Sección comercial' },
              { value: fmt(r.dU_real_pct), unit: '%', label: `ΔU real (máx ${r.dUmaxPct}%)` },
            ]}
            footer={`Por caída de tensión: ${fmt(r.S_caida)} mm² · Por ampacidad: ${r.S_intensidad} mm²`}
          />
        </>}
      />
      <ExportCalculo
        tipo="seccion_cable"
        titulo="Sección de Cable"
        campos={[
          { label: 'Tipo de circuito', valor: form.tipoCircuito === 'alumbrado' ? 'Alumbrado' : 'Fuerza/otros' },
          { label: 'Esquema', valor: form.esquema },
          { label: 'Longitud', valor: `${form.longitud} m` },
          { label: 'Intensidad de diseño', valor: `${form.intensidad} A` },
          { label: 'cos φ', valor: String(form.cosPhi) },
          { label: 'Tensión', valor: `${form.tension} V` },
          { label: 'Sección por caída de tensión', valor: `${fmt(r.S_caida)} mm²` },
          { label: 'Sección por ampacidad', valor: `${r.S_intensidad} mm²` },
          { label: 'Sección comercial final', valor: `${fmt(r.S_final)} mm²` },
          { label: 'ΔU real', valor: `${fmt(r.dU_real_pct)} %` },
          { label: 'Normativa', valor: 'ITC-BT-19 · UNE-EN 60364-5-52' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
