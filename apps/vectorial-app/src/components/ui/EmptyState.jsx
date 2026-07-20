/**
 * Estado vacío reutilizable — icono + título + descripción opcional + acción.
 * icon: componente Lucide (sin instanciar), p.ej. icon={FolderOpen}
 */
export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`text-center py-16 px-4 ${className}`}>
      {Icon && <Icon size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />}
      <p className="font-semibold text-slate-600 dark:text-slate-300">{title}</p>
      {description && <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
