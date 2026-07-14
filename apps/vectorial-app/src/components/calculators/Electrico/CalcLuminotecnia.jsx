import { useState, useMemo } from 'react'
import { Lightbulb } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, SelectField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

// Niveles de iluminancia recomendados — UNE-EN 12464-1
const NIVELES = [
  { id: 'oficina',   label: 'Oficina / trabajo con PVD',  lux: 500 },
  { id: 'aula',      label: 'Aula / formación',            lux: 300 },
  { id: 'almacen',   label: 'Almacén / nave industrial',   lux: 200 },
  { id: 'taller',    label: 'Taller de precisión',         lux: 750 },
  { id: 'pasillo',   label: 'Pasillo / circulación',       lux: 100 },
  { id: 'comercio',  label: 'Local comercial',             lux: 500 },
]

function calcular({ nivelId, superficie, flujoLuminaria, potenciaLuminaria, fu, fm }) {
  const nivel = NIVELES.find(x => x.id === nivelId) || NIVELES[0]
  const S  = Number(superficie)
  const Phi = Number(flujoLuminaria)
  const Fu = Number(fu)
  const Fm = Number(fm)
  const n = Math.ceil((nivel.lux * S) / (Phi * Fu * Fm))
  const potenciaTotal = n * Number(potenciaLuminaria)
  const vea = potenciaTotal / S // W/m² — eficiencia energética de la instalación
  return { nivel, n, potenciaTotal, vea }
}

export default function CalcLuminotecnia({ obraId, obraNombre }) {
  const [form, setForm] = useState({
    nivelId: 'oficina', superficie: 100, flujoLuminaria: 3800, potenciaLuminaria: 36, fu: 0.6, fm: 0.8,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 1 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Lightbulb} title="Luminotecnia — método de los lúmenes" subtitle="UNE-EN 12464-1" color="amber" />
          <FieldGroup label="Uso del local">
            <SelectField value={form.nivelId} onChange={v => set('nivelId', v)}
              options={NIVELES.map(n => ({ value: n.id, label: `${n.label} (${n.lux} lux)` }))} />
          </FieldGroup>
          <FieldGroup label="Superficie del local (m²)">
            <NumberField value={form.superficie} min={1} onChange={v => set('superficie', v)} />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Flujo luminoso por luminaria (lm)">
              <NumberField value={form.flujoLuminaria} min={100} onChange={v => set('flujoLuminaria', v)} />
            </FieldGroup>
            <FieldGroup label="Potencia por luminaria (W)">
              <NumberField value={form.potenciaLuminaria} min={1} onChange={v => set('potenciaLuminaria', v)} />
            </FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Factor de utilización Fu">
              <NumberField value={form.fu} min={0.3} max={0.9} step={0.05} onChange={v => set('fu', v)} />
            </FieldGroup>
            <FieldGroup label="Factor de mantenimiento Fm">
              <NumberField value={form.fm} min={0.5} max={1} step={0.05} onChange={v => set('fm', v)} />
            </FieldGroup>
          </div>
          <NormativaBox color="amber">
            N = (E × S) / (Φ × Fu × Fm). Niveles de iluminancia de referencia según UNE-EN 12464-1.
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Luminarias necesarias"
            color="amber"
            metrics={[
              { value: r.n, unit: 'ud', label: 'Nº de luminarias' },
              { value: fmt(r.potenciaTotal), unit: 'W', label: 'Potencia total instalada' },
              { value: fmt(r.vea), unit: 'W/m²', label: 'Densidad de potencia' },
            ]}
          />
        </>}
      />
      <ExportCalculo
        tipo="luminotecnia"
        titulo="Luminotecnia — Método de los Lúmenes"
        campos={[
          { label: 'Uso del local', valor: r.nivel.label },
          { label: 'Nivel de iluminancia', valor: `${r.nivel.lux} lux` },
          { label: 'Superficie', valor: `${form.superficie} m²` },
          { label: 'Flujo por luminaria', valor: `${form.flujoLuminaria} lm` },
          { label: 'Potencia por luminaria', valor: `${form.potenciaLuminaria} W` },
          { label: 'Factor de utilización', valor: String(form.fu) },
          { label: 'Factor de mantenimiento', valor: String(form.fm) },
          { label: 'Nº de luminarias', valor: String(r.n) },
          { label: 'Potencia total instalada', valor: `${fmt(r.potenciaTotal)} W` },
          { label: 'Normativa', valor: 'UNE-EN 12464-1' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
