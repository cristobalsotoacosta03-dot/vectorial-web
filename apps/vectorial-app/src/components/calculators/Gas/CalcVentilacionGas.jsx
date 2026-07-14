import { useState, useMemo } from 'react'
import { Wind } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, SelectField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

const CM2_POR_KW = 5    // cm²/kW — criterio habitual de aireación directa RITE/UNE 60670
const MIN_SECCION = 100 // cm² mínimo por abertura

function calcular({ potencia, tipoVentilacion }) {
  const P = Number(potencia)
  const seccionBase = Math.max(P * CM2_POR_KW, MIN_SECCION)
  // Conducto individual exige mayor sección que aireación directa (criterio habitual +50%)
  const factorTipo = tipoVentilacion === 'conducto' ? 1.5 : 1
  const seccionEntrada = seccionBase * factorTipo
  const seccionSalida = seccionEntrada * 0.5
  return { seccionEntrada, seccionSalida }
}

export default function CalcVentilacionGas({ obraId, obraNombre }) {
  const [form, setForm] = useState({ potencia: 30, tipoVentilacion: 'directa' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 0 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Wind} title="Ventilación de locales con aparatos a gas" subtitle="RITE · UNE 60670-6" color="orange" />
          <FieldGroup label="Potencia total instalada (kW)">
            <NumberField value={form.potencia} min={1} onChange={v => set('potencia', v)} />
          </FieldGroup>
          <FieldGroup label="Tipo de ventilación">
            <SelectField value={form.tipoVentilacion} onChange={v => set('tipoVentilacion', v)}
              options={[{ value: 'directa', label: 'Aireación directa al exterior' }, { value: 'conducto', label: 'Conducto individual' }]} />
          </FieldGroup>
          <NormativaBox color="orange">
            Sección mínima = Potencia × {CM2_POR_KW} cm²/kW (mínimo {MIN_SECCION} cm²). Conducto individual: +50 % de sección.
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Secciones de ventilación necesarias"
            color="orange"
            metrics={[
              { value: fmt(r.seccionEntrada), unit: 'cm²', label: 'Entrada de aire (parte baja)' },
              { value: fmt(r.seccionSalida), unit: 'cm²', label: 'Salida de aire (parte alta)' },
            ]}
          />
        </>}
      />
      <ExportCalculo
        tipo="ventilacion_gas"
        titulo="Ventilación de Locales con Aparatos a Gas"
        campos={[
          { label: 'Potencia instalada', valor: `${form.potencia} kW` },
          { label: 'Tipo de ventilación', valor: form.tipoVentilacion === 'directa' ? 'Aireación directa' : 'Conducto individual' },
          { label: 'Sección entrada de aire', valor: `${fmt(r.seccionEntrada)} cm²` },
          { label: 'Sección salida de aire', valor: `${fmt(r.seccionSalida)} cm²` },
          { label: 'Normativa', valor: 'UNE 60670-6' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
