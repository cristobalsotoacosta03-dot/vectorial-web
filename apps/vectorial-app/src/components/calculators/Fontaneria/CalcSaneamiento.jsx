import { useState, useMemo } from 'react'
import { Waves } from 'lucide-react'
import CalcShell, { CalcHeader, FieldGroup, NumberField, NormativaBox, ResultCard } from '../CalcShell'
import ExportCalculo from '../../ExportCalculo'

// Unidades de desagüe (UD) por aparato — CTE DB-HS5 Tabla 4.1 (uso privado)
const APARATOS = [
  { id: 'inodoro',  label: 'Inodoro con cisterna', ud: 4 },
  { id: 'lavabo',   label: 'Lavabo',                ud: 1 },
  { id: 'ducha',    label: 'Ducha',                  ud: 2 },
  { id: 'banera',   label: 'Bañera',                 ud: 3 },
  { id: 'fregadero',label: 'Fregadero doméstico',    ud: 3 },
  { id: 'lavadora', label: 'Lavadora',                ud: 3 },
]

// Diámetro de bajante según UD acumuladas — CTE DB-HS5 Tabla 4.4 (hasta 3 plantas)
const BAJANTES = [
  [10, 50], [19, 63], [48, 75], [110, 90], [264, 110], [582, 125], [960, 160],
]

function diametroBajante(ud) {
  for (const [limite, diametro] of BAJANTES) {
    if (ud <= limite) return diametro
  }
  return 200
}

function calcular(cantidades) {
  const filas = APARATOS.map(a => ({ ...a, n: Number(cantidades[a.id] || 0), udTotal: a.ud * Number(cantidades[a.id] || 0) }))
  const udTotal = filas.reduce((s, f) => s + f.udTotal, 0)
  const diametro = diametroBajante(udTotal)
  return { filas, udTotal, diametro }
}

export default function CalcSaneamiento({ obraId, obraNombre }) {
  const [cantidades, setCantidades] = useState({ inodoro: 1, lavabo: 1, ducha: 1, fregadero: 1 })
  const set = (id, v) => setCantidades(c => ({ ...c, [id]: v }))
  const r = useMemo(() => calcular(cantidades), [cantidades])

  return (
    <div className="space-y-6">
      <CalcShell
        formulario={<>
          <CalcHeader icon={Waves} title="Saneamiento — bajante de aguas residuales" subtitle="CTE DB-HS5 · unidades de desagüe (UD)" color="violet" />
          <div className="grid grid-cols-2 gap-3">
            {APARATOS.map(a => (
              <FieldGroup key={a.id} label={`${a.label} (${a.ud} UD c/u)`}>
                <NumberField value={cantidades[a.id] || 0} min={0} onChange={v => set(a.id, v)} />
              </FieldGroup>
            ))}
          </div>
          <NormativaBox color="violet">
            El diámetro de bajante se obtiene de la tabla CTE DB-HS5 según las unidades de desagüe (UD) acumuladas.
          </NormativaBox>
        </>}
        resultados={<>
          <ResultCard
            title="Dimensionado de la bajante"
            color="violet"
            metrics={[
              { value: r.udTotal, unit: 'UD', label: 'Unidades de desagüe totales' },
              { value: r.diametro, unit: 'mm', label: 'Ø bajante mínimo' },
            ]}
          />
        </>}
      />
      <ExportCalculo
        tipo="saneamiento"
        titulo="Saneamiento — Bajante de Aguas Residuales"
        campos={[
          ...r.filas.filter(f => f.n > 0).map(f => ({ label: f.label, valor: `${f.n} ud (${f.udTotal} UD)` })),
          { label: 'Unidades de desagüe totales', valor: `${r.udTotal} UD` },
          { label: 'Diámetro mínimo de bajante', valor: `${r.diametro} mm` },
          { label: 'Normativa', valor: 'CTE DB-HS5' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}
