import { useState, useMemo } from 'react'
import { Thermometer } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

const CE_AIRE = 0.34 // Wh/(m³·K) — calor específico volumétrico del aire
const CARGA_PERSONA = 70 // W sensibles por persona en actividad ligera (RITE)

function calcular({ superficieCerramiento, transmitancia, saltoTermico, caudalVentilacion, ocupantes, cargaEquipos }) {
  const A = Number(superficieCerramiento)
  const U = Number(transmitancia)
  const dT = Number(saltoTermico)
  const Qtransmision = A * U * dT
  const Qventilacion = CE_AIRE * Number(caudalVentilacion) * dT
  const Qpersonas = Number(ocupantes) * CARGA_PERSONA
  const Qequipos = Number(cargaEquipos)
  const total = Qtransmision + Qventilacion + Qpersonas + Qequipos
  return { Qtransmision, Qventilacion, Qpersonas, Qequipos, total }
}

export default function CalcCargaTermica({ obraId, obraNombre }) {
  const [form, setForm] = useState({
    superficieCerramiento: 60, transmitancia: 0.6, saltoTermico: 20,
    caudalVentilacion: 150, ocupantes: 4, cargaEquipos: 500,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 0 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Thermometer} title="Carga térmica (balance de calor)" subtitle="RITE · CTE DB-HE · método simplificado" color="orange" />
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Superficie de cerramientos (m²)">
              <NumberField value={form.superficieCerramiento} min={1} onChange={v => set('superficieCerramiento', v)} />
            </FieldGroup>
            <FieldGroup label="Transmitancia media U (W/m²K)">
              <NumberField value={form.transmitancia} min={0.1} step={0.05} onChange={v => set('transmitancia', v)} />
            </FieldGroup>
          </div>
          <FieldGroup label="Salto térmico interior-exterior (°C)">
            <NumberField value={form.saltoTermico} min={1} onChange={v => set('saltoTermico', v)} />
          </FieldGroup>
          <FieldGroup label="Caudal de ventilación (m³/h)">
            <NumberField value={form.caudalVentilacion} min={0} onChange={v => set('caudalVentilacion', v)} />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Nº de ocupantes">
              <NumberField value={form.ocupantes} min={0} onChange={v => set('ocupantes', v)} />
            </FieldGroup>
            <FieldGroup label="Carga de equipos (W)">
              <NumberField value={form.cargaEquipos} min={0} onChange={v => set('cargaEquipos', v)} />
            </FieldGroup>
          </div>
          <NormativaBox color="orange">
            Q = Q_transmisión (U·A·ΔT) + Q_ventilación (0,34·caudal·ΔT) + Q_ocupantes (70 W/persona) + Q_equipos.
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Carga térmica total"
            color="orange"
            metrics={[{ value: fmt(r.total), unit: 'W', label: 'Potencia total necesaria' }]}
            footer={`Transmisión: ${fmt(r.Qtransmision)} W · Ventilación: ${fmt(r.Qventilacion)} W · Interna: ${fmt(r.Qpersonas + r.Qequipos)} W`}
          />
        </>}
      />
      <ExportCalculo
        tipo="carga_termica"
        titulo="Carga Térmica"
        campos={[
          { label: 'Superficie de cerramientos', valor: `${form.superficieCerramiento} m²` },
          { label: 'Transmitancia media', valor: `${form.transmitancia} W/m²K` },
          { label: 'Salto térmico', valor: `${form.saltoTermico} °C` },
          { label: 'Caudal de ventilación', valor: `${form.caudalVentilacion} m³/h` },
          { label: 'Ocupantes', valor: String(form.ocupantes) },
          { label: 'Carga de equipos', valor: `${form.cargaEquipos} W` },
          { label: 'Carga por transmisión', valor: `${fmt(r.Qtransmision)} W` },
          { label: 'Carga por ventilación', valor: `${fmt(r.Qventilacion)} W` },
          { label: 'Carga interna (personas+equipos)', valor: `${fmt(r.Qpersonas + r.Qequipos)} W` },
          { label: 'Carga térmica total', valor: `${fmt(r.total)} W` },
          { label: 'Normativa', valor: 'RITE · CTE DB-HE' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
