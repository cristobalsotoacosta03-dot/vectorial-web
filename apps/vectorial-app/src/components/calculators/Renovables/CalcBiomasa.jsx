import { useState, useMemo } from 'react'
import { Trees } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, SelectField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

// Poder calorífico inferior y densidad aparente por combustible — valores típicos
const COMBUSTIBLES = [
  { id: 'pellet', label: 'Pellet de madera',   pci: 4.9, densidad: 650 },
  { id: 'astilla',label: 'Astilla forestal',    pci: 3.5, densidad: 300 },
  { id: 'hueso',  label: 'Hueso de aceituna',   pci: 4.5, densidad: 700 },
]

function calcular({ potencia, combustibleId, rendimiento, horasDiarias, autonomiaDias }) {
  const c = COMBUSTIBLES.find(x => x.id === combustibleId) || COMBUSTIBLES[0]
  const P = Number(potencia)
  const rend = Number(rendimiento) / 100
  const consumoHorario = P / (c.pci * rend) // kg/h
  const consumoDiario = consumoHorario * Number(horasDiarias)
  const consumoAutonomia = consumoDiario * Number(autonomiaDias)
  const volumenSilo = consumoAutonomia / c.densidad // m³
  return { c, consumoHorario, consumoDiario, volumenSilo }
}

export default function CalcBiomasa({ obraId, obraNombre }) {
  const [form, setForm] = useState({ potencia: 50, combustibleId: 'pellet', rendimiento: 90, horasDiarias: 8, autonomiaDias: 3 })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 1 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Trees} title="Caldera de biomasa" subtitle="RITE · dimensionado de silo de combustible" color="emerald" />
          <FieldGroup label="Potencia de la caldera (kW)">
            <NumberField value={form.potencia} min={5} onChange={v => set('potencia', v)} />
          </FieldGroup>
          <FieldGroup label="Combustible">
            <SelectField value={form.combustibleId} onChange={v => set('combustibleId', v)}
              options={COMBUSTIBLES.map(c => ({ value: c.id, label: `${c.label} — PCI ${c.pci} kWh/kg` }))} />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Rendimiento de la caldera (%)">
              <NumberField value={form.rendimiento} min={70} max={95} onChange={v => set('rendimiento', v)} />
            </FieldGroup>
            <FieldGroup label="Horas de funcionamiento/día">
              <NumberField value={form.horasDiarias} min={1} max={24} onChange={v => set('horasDiarias', v)} />
            </FieldGroup>
          </div>
          <FieldGroup label="Autonomía deseada del silo (días)">
            <NumberField value={form.autonomiaDias} min={1} max={30} onChange={v => set('autonomiaDias', v)} />
          </FieldGroup>
          <NormativaBox color="emerald">
            Consumo = Potencia / (PCI × rendimiento). Volumen de silo = consumo en la autonomía / densidad del combustible.
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Consumo y silo de combustible"
            color="emerald"
            metrics={[
              { value: fmt(r.consumoHorario), unit: 'kg/h', label: 'Consumo horario' },
              { value: fmt(r.consumoDiario), unit: 'kg/día', label: 'Consumo diario' },
              { value: fmt(r.volumenSilo), unit: 'm³', label: 'Volumen del silo' },
            ]}
            footer={r.c.label}
          />
        </>}
      />
      <ExportCalculo
        tipo="biomasa"
        titulo="Caldera de Biomasa"
        campos={[
          { label: 'Potencia de la caldera', valor: `${form.potencia} kW` },
          { label: 'Combustible', valor: r.c.label },
          { label: 'Rendimiento de la caldera', valor: `${form.rendimiento} %` },
          { label: 'Horas de funcionamiento/día', valor: `${form.horasDiarias} h` },
          { label: 'Autonomía del silo', valor: `${form.autonomiaDias} días` },
          { label: 'Consumo horario', valor: `${fmt(r.consumoHorario)} kg/h` },
          { label: 'Consumo diario', valor: `${fmt(r.consumoDiario)} kg/día` },
          { label: 'Volumen del silo', valor: `${fmt(r.volumenSilo)} m³` },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
