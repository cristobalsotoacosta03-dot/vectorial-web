import { useState, useMemo } from 'react'
import { Sun } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, SelectField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

// Radiación solar global diaria media orientativa por zona climática — CTE DB-HE4
const ZONAS_SOLARES = [
  { id: 'I',   label: 'Zona I (norte)',        radiacion: 3.4 },
  { id: 'II',  label: 'Zona II',                radiacion: 3.8 },
  { id: 'III', label: 'Zona III (centro)',      radiacion: 4.2 },
  { id: 'IV',  label: 'Zona IV (mediterráneo)', radiacion: 4.6 },
  { id: 'V',   label: 'Zona V (sur/Canarias)',  radiacion: 5.0 },
]

const SUP_CAPTADOR = 2 // m² por captador (valor típico comercial)

function calcular({ demandaACS, tAcs, tRed, zonaId, rendimiento, cobertura }) {
  const Qd = Number(demandaACS)
  const dT = Number(tAcs) - Number(tRed)
  const z = ZONAS_SOLARES.find(x => x.id === zonaId) || ZONAS_SOLARES[2]
  const energiaNecesaria = (Qd * dT * 1.163) / 1000 // kWh/día
  const cob = Number(cobertura) / 100
  const rend = Number(rendimiento) / 100
  const superficie = (energiaNecesaria * cob) / (z.radiacion * rend)
  const numCaptadores = Math.ceil(superficie / SUP_CAPTADOR)
  return { energiaNecesaria, superficie, numCaptadores, z }
}

export default function CalcSolarTermica({ obraId, obraNombre }) {
  const [form, setForm] = useState({
    demandaACS: 500, tAcs: 60, tRed: 12, zonaId: 'III', rendimiento: 50, cobertura: 60,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 1 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Sun} title="Solar térmica para ACS" subtitle="CTE DB-HE4" color="amber" />
          <FieldGroup label="Demanda diaria de ACS (L/día)">
            <NumberField value={form.demandaACS} min={10} onChange={v => set('demandaACS', v)} />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Temperatura de acumulación (°C)">
              <NumberField value={form.tAcs} min={45} max={70} onChange={v => set('tAcs', v)} />
            </FieldGroup>
            <FieldGroup label="Temperatura de red fría (°C)">
              <NumberField value={form.tRed} min={5} max={25} onChange={v => set('tRed', v)} />
            </FieldGroup>
          </div>
          <FieldGroup label="Zona climática solar">
            <SelectField value={form.zonaId} onChange={v => set('zonaId', v)}
              options={ZONAS_SOLARES.map(z => ({ value: z.id, label: `${z.label} — ${z.radiacion} kWh/m²·día` }))} />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Rendimiento del captador (%)">
              <NumberField value={form.rendimiento} min={30} max={80} onChange={v => set('rendimiento', v)} />
            </FieldGroup>
            <FieldGroup label="Cobertura solar exigida (%)">
              <NumberField value={form.cobertura} min={30} max={100} onChange={v => set('cobertura', v)} />
            </FieldGroup>
          </div>
          <NormativaBox color="amber">
            Superficie = (Energía necesaria × cobertura) / (radiación diaria × rendimiento captador).
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Instalación solar térmica"
            color="amber"
            metrics={[
              { value: fmt(r.superficie), unit: 'm²', label: 'Superficie de captación' },
              { value: r.numCaptadores, unit: 'ud', label: 'Nº de captadores' },
              { value: fmt(r.energiaNecesaria), unit: 'kWh/día', label: 'Energía necesaria' },
            ]}
            footer={`${r.z.label} · captador de ${SUP_CAPTADOR} m²`}
          />
        </>}
      />
      <ExportCalculo
        tipo="solar_termica"
        titulo="Solar Térmica para ACS"
        campos={[
          { label: 'Demanda diaria de ACS', valor: `${form.demandaACS} L/día` },
          { label: 'Salto térmico', valor: `${Number(form.tAcs) - Number(form.tRed)} °C` },
          { label: 'Zona climática solar', valor: r.z.label },
          { label: 'Rendimiento del captador', valor: `${form.rendimiento} %` },
          { label: 'Cobertura solar exigida', valor: `${form.cobertura} %` },
          { label: 'Energía necesaria diaria', valor: `${fmt(r.energiaNecesaria)} kWh/día` },
          { label: 'Superficie de captación', valor: `${fmt(r.superficie)} m²` },
          { label: 'Número de captadores', valor: `${r.numCaptadores} ud` },
          { label: 'Normativa', valor: 'CTE DB-HE4' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
