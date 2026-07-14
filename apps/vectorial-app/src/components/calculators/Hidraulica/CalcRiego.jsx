import { useState, useMemo } from 'react'
import { Droplet } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, SelectField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

const EMISORES = [
  { id: 'goteo2',  label: 'Gotero autocompensante 2 L/h', caudal: 2,   pTrabajo: 1.0 },
  { id: 'goteo4',  label: 'Gotero autocompensante 4 L/h', caudal: 4,   pTrabajo: 1.0 },
  { id: 'goteo8',  label: 'Gotero autocompensante 8 L/h', caudal: 8,   pTrabajo: 1.0 },
  { id: 'difusor', label: 'Difusor de riego por aspersión', caudal: 120, pTrabajo: 2.0 },
  { id: 'aspersor',label: 'Aspersor emergente',            caudal: 600, pTrabajo: 2.5 },
]

// Diámetro de tubería por criterio de velocidad (v recomendada en PE de riego)
const V_DISENO = 1.5 // m/s

function calcular({ emisorId, numEmisores, desnivel }) {
  const e = EMISORES.find(x => x.id === emisorId) || EMISORES[0]
  const N = Number(numEmisores)
  const Qh  = e.caudal * N           // L/h del sector
  const Qls = Qh / 3600              // L/s
  const Qm3 = Qls / 1000             // m3/s
  const D_m = Math.sqrt((4 * Qm3) / (Math.PI * V_DISENO))
  const D_mm = D_m * 1000
  // Pérdida de carga admisible: 20% de la presión de trabajo del emisor
  // (criterio habitual de uniformidad de riego, Christiansen) + desnivel.
  const perdidaAdmisible = e.pTrabajo * 0.20
  const presionCabecera = e.pTrabajo + perdidaAdmisible + Number(desnivel) / 10 // 10 m c.a. ≈ 1 bar
  return { e, Qh, Qls, D_mm, presionCabecera, perdidaAdmisible }
}

export default function CalcRiego({ obraId, obraNombre }) {
  const [form, setForm] = useState({ emisorId: 'goteo4', numEmisores: 50, desnivel: 0 })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 1 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Droplet} title="Sector de riego" subtitle="Riego localizado · criterio de uniformidad de Christiansen" color="teal" />
          <FieldGroup label="Tipo de emisor">
            <SelectField value={form.emisorId} onChange={v => set('emisorId', v)}
              options={EMISORES.map(e => ({ value: e.id, label: `${e.label} — ${e.caudal} L/h` }))} />
          </FieldGroup>
          <FieldGroup label="Número de emisores en el sector">
            <NumberField value={form.numEmisores} min={1} onChange={v => set('numEmisores', v)} />
          </FieldGroup>
          <FieldGroup label="Desnivel geométrico cabecera-sector (m)">
            <NumberField value={form.desnivel} onChange={v => set('desnivel', v)} />
          </FieldGroup>
          <NormativaBox color="teal">
            Diámetro por criterio de velocidad (v = {V_DISENO} m/s en PE). Pérdida de carga admisible = 20 % de la presión de trabajo del emisor.
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Dimensionado del sector"
            color="teal"
            metrics={[
              { value: fmt(r.Qh), unit: 'L/h', label: 'Caudal del sector' },
              { value: fmt(r.D_mm), unit: 'mm', label: 'Ø tubería mínimo' },
              { value: fmt(r.presionCabecera), unit: 'bar', label: 'Presión en cabecera' },
            ]}
            footer={`Caudal: ${fmt(r.Qls)} L/s · Pérdida admisible: ${fmt(r.perdidaAdmisible)} bar`}
          />
        </>}
      />
      <ExportCalculo
        tipo="riego"
        titulo="Sector de Riego Localizado"
        campos={[
          { label: 'Tipo de emisor', valor: r.e.label },
          { label: 'Número de emisores', valor: String(form.numEmisores) },
          { label: 'Desnivel geométrico', valor: `${form.desnivel} m` },
          { label: 'Caudal del sector', valor: `${fmt(r.Qh)} L/h (${fmt(r.Qls)} L/s)` },
          { label: 'Diámetro mínimo tubería', valor: `${fmt(r.D_mm)} mm` },
          { label: 'Presión necesaria en cabecera', valor: `${fmt(r.presionCabecera)} bar` },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
