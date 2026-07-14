import { useState, useMemo } from 'react'
import { Waves } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

const LONGITUD_MAX_CIRCUITO = 100 // m, criterio habitual PE-Xa 16-17mm

function calcular({ superficie, demandaSuperficial, separacion, saltoTermico }) {
  const S = Number(superficie)
  const q = Number(demandaSuperficial)   // W/m²
  const paso = Number(separacion) / 100  // m
  const dT = Number(saltoTermico)
  const potenciaTotal = S * q
  const caudal = (potenciaTotal * 0.86) / dT // L/h — Q(kcal/h)/ΔT, 1 W = 0.86 kcal/h
  const longitudTubo = S / paso
  const circuitos = Math.ceil(longitudTubo / LONGITUD_MAX_CIRCUITO)
  return { potenciaTotal, caudal, longitudTubo, circuitos }
}

export default function CalcSueloRadiante({ obraId, obraNombre }) {
  const [form, setForm] = useState({ superficie: 80, demandaSuperficial: 70, separacion: 15, saltoTermico: 7 })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 0 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Waves} title="Suelo radiante" subtitle="RITE · UNE-EN 1264" color="orange" />
          <FieldGroup label="Superficie a climatizar (m²)">
            <NumberField value={form.superficie} min={1} onChange={v => set('superficie', v)} />
          </FieldGroup>
          <FieldGroup label="Demanda térmica superficial (W/m²)">
            <NumberField value={form.demandaSuperficial} min={30} max={150} onChange={v => set('demandaSuperficial', v)} />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Separación entre tubos (cm)">
              <NumberField value={form.separacion} min={10} max={30} onChange={v => set('separacion', v)} />
            </FieldGroup>
            <FieldGroup label="Salto térmico ida-retorno (°C)">
              <NumberField value={form.saltoTermico} min={3} max={15} onChange={v => set('saltoTermico', v)} />
            </FieldGroup>
          </div>
          <NormativaBox color="orange">
            Longitud de tubo = Superficie / separación. Circuitos = longitud / {LONGITUD_MAX_CIRCUITO} m (máximo recomendado PE-Xa).
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Dimensionado del suelo radiante"
            color="orange"
            metrics={[
              { value: fmt(r.potenciaTotal), unit: 'W', label: 'Potencia total' },
              { value: fmt(r.caudal), unit: 'L/h', label: 'Caudal por circuito' },
              { value: r.circuitos, unit: 'ud', label: 'Nº de circuitos' },
            ]}
            footer={`Longitud total de tubo: ${fmt(r.longitudTubo)} m`}
          />
        </>}
      />
      <ExportCalculo
        tipo="suelo_radiante"
        titulo="Suelo Radiante"
        campos={[
          { label: 'Superficie', valor: `${form.superficie} m²` },
          { label: 'Demanda térmica', valor: `${form.demandaSuperficial} W/m²` },
          { label: 'Separación entre tubos', valor: `${form.separacion} cm` },
          { label: 'Salto térmico', valor: `${form.saltoTermico} °C` },
          { label: 'Potencia total', valor: `${fmt(r.potenciaTotal)} W` },
          { label: 'Longitud de tubo', valor: `${fmt(r.longitudTubo)} m` },
          { label: 'Número de circuitos', valor: String(r.circuitos) },
          { label: 'Normativa', valor: 'UNE-EN 1264' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
