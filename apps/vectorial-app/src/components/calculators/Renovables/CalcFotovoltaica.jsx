import { useState, useMemo } from 'react'
import { SunMedium } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, SelectField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

// Horas de sol pico media diaria por región — orientativo (PVGIS España)
const ZONAS_HSP = [
  { id: 'norte',  label: 'Norte (Galicia, Cantábrico)', hsp: 3.5 },
  { id: 'centro', label: 'Centro (Meseta)',              hsp: 4.5 },
  { id: 'sur',    label: 'Sur / Canarias',               hsp: 5.5 },
]

function calcular({ consumoAnual, zonaId, perdidas, potenciaPanel }) {
  const z = ZONAS_HSP.find(x => x.id === zonaId) || ZONAS_HSP[1]
  const perd = Number(perdidas) / 100
  const potenciaPicoKw = Number(consumoAnual) / (z.hsp * 365 * (1 - perd))
  const numPaneles = Math.ceil((potenciaPicoKw * 1000) / Number(potenciaPanel))
  const potenciaInstalada = (numPaneles * Number(potenciaPanel)) / 1000
  const potenciaInversor = potenciaInstalada / 1.1 // ratio DC/AC habitual 1.1
  const energiaAnualGenerada = potenciaInstalada * z.hsp * 365 * (1 - perd)
  return { z, potenciaPicoKw, numPaneles, potenciaInstalada, potenciaInversor, energiaAnualGenerada }
}

export default function CalcFotovoltaica({ obraId, obraNombre }) {
  const [form, setForm] = useState({ consumoAnual: 4000, zonaId: 'centro', perdidas: 15, potenciaPanel: 450 })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 1 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={SunMedium} title="Instalación solar fotovoltaica" subtitle="Autoconsumo · RD 244/2019" color="amber" />
          <FieldGroup label="Consumo anual a cubrir (kWh/año)">
            <NumberField value={form.consumoAnual} min={100} onChange={v => set('consumoAnual', v)} />
          </FieldGroup>
          <FieldGroup label="Zona / horas de sol pico">
            <SelectField value={form.zonaId} onChange={v => set('zonaId', v)}
              options={ZONAS_HSP.map(z => ({ value: z.id, label: `${z.label} — ${z.hsp} HSP/día` }))} />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Potencia por panel (Wp)">
              <NumberField value={form.potenciaPanel} min={200} onChange={v => set('potenciaPanel', v)} />
            </FieldGroup>
            <FieldGroup label="Pérdidas del sistema (%)">
              <NumberField value={form.perdidas} min={10} max={25} onChange={v => set('perdidas', v)} />
            </FieldGroup>
          </div>
          <NormativaBox color="amber">
            P_pico = Consumo anual / (HSP × 365 × (1−pérdidas)). Inversor dimensionado con ratio DC/AC ≈ 1,1.
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Dimensionado del sistema fotovoltaico"
            color="amber"
            metrics={[
              { value: r.numPaneles, unit: 'ud', label: 'Nº de paneles' },
              { value: fmt(r.potenciaInstalada), unit: 'kWp', label: 'Potencia instalada' },
              { value: fmt(r.potenciaInversor), unit: 'kW', label: 'Potencia del inversor' },
            ]}
            footer={`Energía anual estimada: ${fmt(r.energiaAnualGenerada)} kWh/año · ${r.z.label}`}
          />
        </>}
      />
      <ExportCalculo
        tipo="fotovoltaica"
        titulo="Instalación Solar Fotovoltaica"
        campos={[
          { label: 'Consumo anual objetivo', valor: `${form.consumoAnual} kWh/año` },
          { label: 'Zona / HSP', valor: `${r.z.label} (${r.z.hsp} h/día)` },
          { label: 'Potencia por panel', valor: `${form.potenciaPanel} Wp` },
          { label: 'Pérdidas del sistema', valor: `${form.perdidas} %` },
          { label: 'Número de paneles', valor: `${r.numPaneles} ud` },
          { label: 'Potencia instalada', valor: `${fmt(r.potenciaInstalada)} kWp` },
          { label: 'Potencia del inversor', valor: `${fmt(r.potenciaInversor)} kW` },
          { label: 'Energía anual generada estimada', valor: `${fmt(r.energiaAnualGenerada)} kWh/año` },
          { label: 'Normativa', valor: 'RD 244/2019 (autoconsumo)' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
