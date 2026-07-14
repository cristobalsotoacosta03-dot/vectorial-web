export default function Input({ label, error, hint, className = '', id, ...props }) {
  const inputId = id || props.name

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full border rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 transition-colors ${
          error
            ? 'border-error focus:ring-error/40'
            : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/40 focus:border-primary-500'
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error && <p id={`${inputId}-error`} className="mt-1 text-xs text-error">{error}</p>}
      {!error && hint && <p id={`${inputId}-hint`} className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
