import { useState, useMemo } from 'react'
import { Zap } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, SelectField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

const TERRENOS = [
  { id: 'cultivable', label: 'Terreno cultivable / húmedo', rho: 50 },
  { id: 'arcilla',    label: 'Arcilla compacta',            rho: 100 },
  { id: 'arena',      label: 'Arena / gravilla',             rho: 200 },
  { id: 'roca',       label: 'Roca / terreno pedregoso',     rho: 3000 },
]

const ELECTRODOS = [
  { id: 'pica',       label: 'Pica vertical' },
  { id: 'conductor',  label: 'Conductor enterrado horizontal' },
]

function calcular({ terrenoId, electrodoId, longitud, numElectrodos, sensibilidad, tensionContacto }) {
  const t = TERRENOS.find(x => x.id === terrenoId) || TERRENOS[0]
  const L = Number(longitud)
  const n = Math.max(1, Number(numElectrodos))
  // Resistencia de un electrodo — ITC-BT-18: pica R=ρ/L · conductor R=2ρ/L
  const rUnitario = electrodoId === 'pica' ? t.rho / L : (2 * t.rho) / L
  // Combinación en paralelo simplificada (sin considerar interferencia mutua)
  const rTotal = rUnitario / n
  const rMaxima = Number(tensionContacto) / (Number(sensibilidad) / 1000)
  const cumple = rTotal <= rMaxima
  return { t, rUnitario, rTotal, rMaxima, cumple }
}

export default function CalcPuestaTierra({ obraId, obraNombre }) {
  const [form, setForm] = useState({
    terrenoId: 'cultivable', electrodoId: 'pica', longitud: 2, numElectrodos: 2, sensibilidad: 30, tensionContacto: 24,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 1 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Zap} title="Puesta a tierra" subtitle="ITC-BT-18 · ITC-BT-24" color="amber" />
          <FieldGroup label="Tipo de terreno">
            <SelectField value={form.terrenoId} onChange={v => set('terrenoId', v)}
              options={TERRENOS.map(t => ({ value: t.id, label: `${t.label} (ρ=${t.rho} Ω·m)` }))} />
          </FieldGroup>
          <FieldGroup label="Tipo de electrodo">
            <SelectField value={form.electrodoId} onChange={v => set('electrodoId', v)}
              options={ELECTRODOS.map(e => ({ value: e.id, label: e.label }))} />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Longitud del electrodo (m)">
              <NumberField value={form.longitud} min={0.5} step={0.5} onChange={v => set('longitud', v)} />
            </FieldGroup>
            <FieldGroup label="Nº de electrodos en paralelo">
              <NumberField value={form.numElectrodos} min={1} onChange={v => set('numElectrodos', v)} />
            </FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Sensibilidad diferencial (mA)">
              <NumberField value={form.sensibilidad} min={10} onChange={v => set('sensibilidad', v)} />
            </FieldGroup>
            <FieldGroup label="Tensión de contacto máx. (V)">
              <SelectField value={form.tensionContacto} onChange={v => set('tensionContacto', v)}
                options={[{ value: '24', label: '24 V (local húmedo)' }, { value: '50', label: '50 V (local seco)' }]} />
            </FieldGroup>
          </div>
          <NormativaBox color="amber">
            Pica: R = ρ/L · Conductor horizontal: R = 2ρ/L. R máxima = Vc / sensibilidad diferencial.
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Resistencia de la puesta a tierra"
            color="amber"
            metrics={[
              { value: fmt(r.rTotal), unit: 'Ω', label: 'Resistencia conjunto' },
              { value: fmt(r.rMaxima), unit: 'Ω', label: 'Resistencia máxima admisible' },
            ]}
            footer={r.cumple ? 'Cumple: resistencia por debajo del máximo admisible' : 'No cumple: añade electrodos o mejora el terreno (pica química, sales)'}
          />
        </>}
      />
      <ExportCalculo
        tipo="puesta_tierra"
        titulo="Puesta a Tierra"
        campos={[
          { label: 'Terreno', valor: r.t.label },
          { label: 'Electrodo', valor: ELECTRODOS.find(e => e.id === form.electrodoId)?.label },
          { label: 'Longitud del electrodo', valor: `${form.longitud} m` },
          { label: 'Nº de electrodos', valor: String(form.numElectrodos) },
          { label: 'Sensibilidad diferencial', valor: `${form.sensibilidad} mA` },
          { label: 'Tensión de contacto máxima', valor: `${form.tensionContacto} V` },
          { label: 'Resistencia del conjunto', valor: `${fmt(r.rTotal)} Ω` },
          { label: 'Resistencia máxima admisible', valor: `${fmt(r.rMaxima)} Ω` },
          { label: 'Cumple', valor: r.cumple ? 'Sí' : 'No' },
          { label: 'Normativa', valor: 'ITC-BT-18 · ITC-BT-24' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
