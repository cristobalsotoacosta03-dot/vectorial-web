import { useState, useMemo } from 'react'
import { Gauge } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

// Coeficiente de expansión del agua Ce según temperatura — tabla habitual en
// bibliografía de climatización (interpolación lineal entre puntos tabulados).
const CE_TABLA = [
  [30, 0.0044], [40, 0.0079], [50, 0.0121], [60, 0.0171],
  [70, 0.0227], [80, 0.0290], [90, 0.0359], [100, 0.0434],
]

function coefExpansion(t) {
  const temp = Math.min(100, Math.max(30, Number(t)))
  for (let i = 0; i < CE_TABLA.length - 1; i++) {
    const [t0, ce0] = CE_TABLA[i]
    const [t1, ce1] = CE_TABLA[i + 1]
    if (temp >= t0 && temp <= t1) {
      return ce0 + (ce1 - ce0) * (temp - t0) / (t1 - t0)
    }
  }
  return CE_TABLA[CE_TABLA.length - 1][1]
}

function calcular({ volumenInstalacion, tMax, presionLlenado, presionTarado }) {
  const Vt = Number(volumenInstalacion)
  const Ce = coefExpansion(tMax)
  const Pi = Number(presionLlenado)
  const Pf = Number(presionTarado)
  // Cp = coeficiente de presión (UNE 100155) — relación entre presión final
  // e inicial en bar absolutos (bar relativo + 1 atm).
  const Cp = (Pf + 1) / Math.max(0.1, Pf - Pi)
  const V = Vt * Ce * Cp
  return { Ce, Cp, V }
}

export default function CalcVasoExpansion({ obraId, obraNombre }) {
  const [form, setForm] = useState({ volumenInstalacion: 200, tMax: 80, presionLlenado: 1.5, presionTarado: 3 })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 1 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Gauge} title="Vaso de expansión cerrado" subtitle="UNE 100155 · Instalaciones de calefacción/ACS" color="sky" />
          <FieldGroup label="Volumen de agua en la instalación (L)">
            <NumberField value={form.volumenInstalacion} min={1} onChange={v => set('volumenInstalacion', v)} />
          </FieldGroup>
          <FieldGroup label="Temperatura máxima de trabajo (°C)">
            <NumberField value={form.tMax} min={30} max={100} onChange={v => set('tMax', v)} />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Presión de llenado (bar)">
              <NumberField value={form.presionLlenado} min={0.5} step={0.1} onChange={v => set('presionLlenado', v)} />
            </FieldGroup>
            <FieldGroup label="Presión de tarado válv. seguridad (bar)">
              <NumberField value={form.presionTarado} min={1} step={0.1} onChange={v => set('presionTarado', v)} />
            </FieldGroup>
          </div>
          <NormativaBox color="sky">
            <span className="font-bold">Fórmula: </span>V = Vt × Ce × Cp, donde Cp = (Pf+1)/(Pf−Pi). Ce interpolado de tabla según temperatura máxima.
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Vaso de expansión necesario"
            color="sky"
            metrics={[
              { value: fmt(r.V), unit: 'L', label: 'Volumen del vaso' },
              { value: fmt(r.Ce * 100), unit: '%', label: 'Coef. expansión Ce' },
              { value: fmt(r.Cp), unit: '', label: 'Coef. presión Cp' },
            ]}
            footer="Selecciona el modelo comercial inmediatamente superior al volumen calculado."
          />
        </>}
      />
      <ExportCalculo
        tipo="vaso_expansion"
        titulo="Vaso de Expansión Cerrado"
        campos={[
          { label: 'Volumen instalación', valor: `${form.volumenInstalacion} L` },
          { label: 'Temperatura máxima', valor: `${form.tMax} °C` },
          { label: 'Presión de llenado', valor: `${form.presionLlenado} bar` },
          { label: 'Presión de tarado', valor: `${form.presionTarado} bar` },
          { label: 'Coeficiente de expansión Ce', valor: fmt(r.Ce * 100) + ' %' },
          { label: 'Coeficiente de presión Cp', valor: fmt(r.Cp) },
          { label: 'Volumen del vaso', valor: `${fmt(r.V)} L` },
          { label: 'Normativa', valor: 'UNE 100155' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
