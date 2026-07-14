import { useState, useMemo } from 'react'
import { Flame } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

// Caudales instantáneos mínimos de ACS por aparato — CTE DB-HS4 Tabla 2.1
const APARATOS = [
  { id: 'lavabo',   label: 'Lavabo',                caudal: 0.065 },
  { id: 'ducha',    label: 'Ducha',                  caudal: 0.10 },
  { id: 'banera',   label: 'Bañera ≥1,40 m',         caudal: 0.20 },
  { id: 'fregadero',label: 'Fregadero doméstico',    caudal: 0.10 },
  { id: 'lavadora', label: 'Lavadora',                caudal: 0.15 },
  { id: 'lavavaj',  label: 'Lavavajillas doméstico',  caudal: 0.10 },
]

const V_DISENO = 1.0 // m/s — criterio habitual de velocidad en ACS (más bajo que AF por ruido/dilatación)

function calcular(cantidades) {
  const filas = APARATOS.map(a => ({ ...a, n: Number(cantidades[a.id] || 0), qTotal: a.caudal * Number(cantidades[a.id] || 0) }))
  const n = filas.reduce((s, f) => s + f.n, 0)
  const Qinstalado = filas.reduce((s, f) => s + f.qTotal, 0)
  const K = n > 1 ? Math.min(1, Math.max(0.2, 1 / Math.sqrt(n - 1))) : 1
  const Qcalculo = Qinstalado * K
  const D_mm = Math.sqrt((4 * Qcalculo / 1000) / (Math.PI * V_DISENO)) * 1000
  return { filas, n, Qinstalado, K, Qcalculo, D_mm }
}

export default function CalcAguaCaliente({ obraId, obraNombre }) {
  const [cantidades, setCantidades] = useState({ lavabo: 1, ducha: 1, fregadero: 1 })
  const set = (id, v) => setCantidades(c => ({ ...c, [id]: v }))
  const r = useMemo(() => calcular(cantidades), [cantidades])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 2 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Flame} title="Red de distribución de ACS" subtitle="CTE DB-HS4 · coeficiente de simultaneidad" color="teal" />
          <div className="grid grid-cols-2 gap-3">
            {APARATOS.map(a => (
              <FieldGroup key={a.id} label={`${a.label} (${a.caudal} L/s c/u)`}>
                <NumberField value={cantidades[a.id] || 0} min={0} onChange={v => set(a.id, v)} />
              </FieldGroup>
            ))}
          </div>
          <NormativaBox color="teal">
            Q cálculo = Q instalado × K, con K = 1/√(n−1). Diámetro por criterio de velocidad (v={V_DISENO} m/s, menor que AF).
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Dimensionado de la red de ACS"
            color="teal"
            metrics={[
              { value: fmt(r.Qcalculo), unit: 'L/s', label: 'Caudal de cálculo' },
              { value: fmt(r.D_mm), unit: 'mm', label: 'Ø tubería mínimo' },
            ]}
            footer={`Q instalado: ${fmt(r.Qinstalado)} L/s · K simultaneidad: ${fmt(r.K)} · ${r.n} aparatos`}
          />
        </>}
      />
      <ExportCalculo
        tipo="agua_caliente_red"
        titulo="Red de Distribución de ACS"
        campos={[
          ...r.filas.filter(f => f.n > 0).map(f => ({ label: f.label, valor: `${f.n} ud` })),
          { label: 'Caudal instalado', valor: `${fmt(r.Qinstalado)} L/s` },
          { label: 'Coeficiente de simultaneidad', valor: fmt(r.K) },
          { label: 'Caudal de cálculo', valor: `${fmt(r.Qcalculo)} L/s` },
          { label: 'Diámetro mínimo', valor: `${fmt(r.D_mm)} mm` },
          { label: 'Normativa', valor: 'CTE DB-HS4' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
