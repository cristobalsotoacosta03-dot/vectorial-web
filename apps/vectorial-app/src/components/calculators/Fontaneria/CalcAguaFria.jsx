import { useState, useMemo } from 'react'
import { Droplets } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

// Caudales instantáneos mínimos de agua fría por aparato — CTE DB-HS4 Tabla 2.1
const APARATOS = [
  { id: 'inodoro',  label: 'Inodoro con cisterna', caudal: 0.10 },
  { id: 'lavabo',   label: 'Lavabo',                caudal: 0.10 },
  { id: 'ducha',    label: 'Ducha',                  caudal: 0.20 },
  { id: 'banera',   label: 'Bañera ≥1,40 m',         caudal: 0.30 },
  { id: 'fregadero',label: 'Fregadero doméstico',    caudal: 0.20 },
  { id: 'lavadora', label: 'Lavadora',                caudal: 0.20 },
  { id: 'lavavaj',  label: 'Lavavajillas doméstico',  caudal: 0.15 },
]

const V_DISENO = 1.5 // m/s — criterio habitual de velocidad en AF

function calcular(cantidades) {
  const filas = APARATOS.map(a => ({ ...a, n: Number(cantidades[a.id] || 0), qTotal: a.caudal * Number(cantidades[a.id] || 0) }))
  const n = filas.reduce((s, f) => s + f.n, 0)
  const Qinstalado = filas.reduce((s, f) => s + f.qTotal, 0)
  // Coeficiente de simultaneidad clásico: K = 1/√(n-1), acotado entre 0.2 y 1
  const K = n > 1 ? Math.min(1, Math.max(0.2, 1 / Math.sqrt(n - 1))) : 1
  const Qcalculo = Qinstalado * K
  const D_mm = Math.sqrt((4 * Qcalculo / 1000) / (Math.PI * V_DISENO)) * 1000
  return { filas, n, Qinstalado, K, Qcalculo, D_mm }
}

export default function CalcAguaFria({ obraId, obraNombre }) {
  const [cantidades, setCantidades] = useState({ inodoro: 1, lavabo: 1, ducha: 1, fregadero: 1 })
  const set = (id, v) => setCantidades(c => ({ ...c, [id]: v }))
  const r = useMemo(() => calcular(cantidades), [cantidades])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 2 })

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Droplets} title="Red de agua fría" subtitle="CTE DB-HS4 · coeficiente de simultaneidad" color="sky" />
          <div className="grid grid-cols-2 gap-3">
            {APARATOS.map(a => (
              <FieldGroup key={a.id} label={`${a.label} (${a.caudal} L/s c/u)`}>
                <NumberField value={cantidades[a.id] || 0} min={0} onChange={v => set(a.id, v)} />
              </FieldGroup>
            ))}
          </div>
          <NormativaBox color="sky">
            Q cálculo = Q instalado × K, con K = 1/√(n−1). Diámetro por criterio de velocidad (v={V_DISENO} m/s).
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Dimensionado de la acometida"
            color="sky"
            metrics={[
              { value: fmt(r.Qcalculo), unit: 'L/s', label: 'Caudal de cálculo' },
              { value: fmt(r.D_mm), unit: 'mm', label: 'Ø tubería mínimo' },
            ]}
            footer={`Q instalado: ${fmt(r.Qinstalado)} L/s · K simultaneidad: ${fmt(r.K)} · ${r.n} aparatos`}
          />
        </>}
      />
      <ExportCalculo
        tipo="agua_fria"
        titulo="Red de Agua Fría"
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
