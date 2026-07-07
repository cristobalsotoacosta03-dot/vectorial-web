const ESTADO_CFG = {
  activa:     { label: 'En proceso', dot: 'bg-emerald-500', cls: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400' },
  pausada:    { label: 'Pausada',    dot: 'bg-amber-400',   cls: 'bg-amber-400/10 text-amber-700 border-amber-400/30 dark:text-amber-400' },
  finalizada: { label: 'Finalizado', dot: 'bg-slate-400',   cls: 'bg-slate-400/10 text-slate-600 border-slate-400/30 dark:text-slate-400' },
  aceptado:   { label: 'Aceptado',   dot: 'bg-emerald-500', cls: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400' },
  enviado:    { label: 'Enviado',    dot: 'bg-blue-400',    cls: 'bg-blue-400/10 text-blue-700 border-blue-400/30 dark:text-blue-400' },
  borrador:   { label: 'Borrador',   dot: 'bg-slate-400',   cls: 'bg-slate-400/10 text-slate-600 border-slate-400/30 dark:text-slate-400' },
  rechazado:  { label: 'Rechazado',  dot: 'bg-red-400',     cls: 'bg-red-400/10 text-red-700 border-red-400/30 dark:text-red-400' },
}

// Badge de estado reutilizable (obras, presupuestos, etc.) — mismo semantico que ESTADO_CFG de cada página
export default function StatusBadge({ estado, label }) {
  const cfg = ESTADO_CFG[estado] || ESTADO_CFG.finalizada
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label || cfg.label}
    </span>
  )
}
