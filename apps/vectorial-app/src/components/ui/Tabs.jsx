export default function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div role="tablist" className={`flex gap-1 border-b border-slate-200 dark:border-slate-800 ${className}`}>
      {tabs.map(tab => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            {tab.label}
            {active && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary-500 rounded-full" />}
          </button>
        )
      })}
    </div>
  )
}
