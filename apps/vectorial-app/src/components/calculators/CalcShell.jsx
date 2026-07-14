// Envoltorio visual compartido por las calculadoras de la Fase 2. Dos columnas
// (formulario | resultados), cabecera con icono normativo, caja de "base
// normativa". No sustituye a los paneles a medida de CalcACS/CalcTuberias/
// CalcGLP (más elaborados) — es la base para las calculadoras nuevas.

export function CalcHeader({ icon: Icon, title, subtitle, color = 'primary' }) {
  const COLORS = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
    orange:  'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
    sky:     'bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
    teal:    'bg-teal-100 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    violet:  'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    amber:   'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  }
  return (
    <div className="flex items-center gap-3">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${COLORS[color]}`}>
        <Icon size={20} />
      </span>
      <div>
        <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{title}</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

export function NormativaBox({ children, color = 'primary' }) {
  const COLORS = {
    primary: 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-500/10 dark:border-primary-500/20 dark:text-primary-400',
    orange:  'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400',
    sky:     'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-400',
    teal:    'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-500/10 dark:border-teal-500/20 dark:text-teal-400',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
    violet:  'bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-400',
    amber:   'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
  }
  return <div className={`rounded-xl p-3 text-xs border ${COLORS[color]}`}>{children}</div>
}

export function FieldGroup({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export function NumberField({ value, onChange, min, max, step = 1, ...props }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
      {...props}
    />
  )
}

export function SelectField({ value, onChange, options, ...props }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
      {...props}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

const GRADIENTS = {
  primary: 'from-primary-500 to-primary-700',
  orange:  'from-orange-500 to-orange-700',
  sky:     'from-sky-500 to-sky-700',
  teal:    'from-teal-500 to-cyan-600',
  emerald: 'from-emerald-500 to-emerald-700',
  violet:  'from-violet-500 to-purple-600',
  amber:   'from-amber-500 to-amber-700',
}

export function ResultCard({ title, color = 'primary', metrics = [], footer }) {
  return (
    <div className={`bg-gradient-to-br ${GRADIENTS[color]} rounded-2xl p-6 text-white shadow-lg`}>
      <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-4">{title}</p>
      <div className={`grid gap-4 mb-4`} style={{ gridTemplateColumns: `repeat(${Math.min(metrics.length, 3)}, minmax(0,1fr))` }}>
        {metrics.map((m, i) => (
          <div key={i} className={`text-center ${i > 0 ? 'border-l border-white/25' : ''}`}>
            <p className="text-2xl font-bold">{m.value}<span className="text-sm font-normal ml-0.5">{m.unit}</span></p>
            <p className="text-white/80 text-xs mt-1">{m.label}</p>
          </div>
        ))}
      </div>
      {footer && <div className="pt-4 border-t border-white/25 text-xs text-white/80">{footer}</div>}
    </div>
  )
}

export default function CalcShell({ formulario, resultados }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
        {formulario}
      </div>
      <div className="space-y-4">
        {resultados}
      </div>
    </div>
  )
}
