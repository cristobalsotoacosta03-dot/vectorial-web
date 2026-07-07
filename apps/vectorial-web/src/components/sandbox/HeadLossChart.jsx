import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { generateHeadLossCurve } from '../../lib/engineering'

/**
 * Componente de gráfico de pérdida de carga vs caudal.
 * Visualiza el comportamiento hidráulico de la instalación.
 *
 * @component
 * @param {Object} props
 * @param {number} props.diameter - Diámetro (mm)
 * @param {number} props.length - Longitud (m)
 * @param {number} props.density - Densidad (kg/m³)
 * @param {number} props.viscosity - Viscosidad (mm²/s)
 * @param {string} [props.material='steel_medium'] - Material
 */
function HeadLossChart({ diameter, length, density, viscosity, material = 'steel_medium' }) {
  const data = useMemo(() => {
    if (!diameter || !length || !density || !viscosity) return []
    return generateHeadLossCurve({
      diameter,
      length,
      density,
      viscosity,
      material,
      minFlow: 0.5,
      maxFlow: 20,
      steps: 20,
    })
  }, [diameter, length, density, viscosity, material])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        Complete los parámetros para generar el gráfico
      </div>
    )
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="flow"
            stroke="#94a3b8"
            style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
            label={{ value: 'Caudal (m³/h)', position: 'bottom', offset: -10, fill: '#94a3b8' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
            label={{ value: 'Pérdida (m.c.a.)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontFamily: 'JetBrains Mono',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#f8fafc', fontWeight: 600 }}
            formatter={(value, name) => {
              if (name === 'headLoss') return [value.toFixed(3) + ' m', 'Pérdida de carga']
              if (name === 'velocity') return [value.toFixed(2) + ' m/s', 'Velocidad']
              return [value, name]
            }}
            labelFormatter={(label) => `Caudal: ${label} m³/h`}
          />
          <Legend
            wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="headLoss"
            stroke="#f97316"
            strokeWidth={3}
            dot={{ fill: '#f97316', r: 4 }}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            name="Pérdida de carga"
          />
          <Line
            type="monotone"
            dataKey="velocity"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 3 }}
            name="Velocidad"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-xs text-slate-500">
        Curva característica: Pérdida de carga y velocidad vs caudal
      </div>
    </div>
  )
}

export default HeadLossChart