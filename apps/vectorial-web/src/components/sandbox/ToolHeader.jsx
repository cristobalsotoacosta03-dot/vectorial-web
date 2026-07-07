function ToolHeader({ icon, title, description }) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <div className="glass-panel flex h-11 min-w-11 shrink-0 items-center justify-center border border-orange-500/30 bg-navy-800/60 px-2 font-mono text-xs font-bold tracking-tight text-orange-400">
        {icon}
      </div>
      <div className="text-left">
        <h3 className="font-heading text-lg font-semibold text-white tracking-wide">
          {title}
        </h3>
        <p className="mt-1 text-sm text-slate-400 tracking-wide">{description}</p>
      </div>
    </div>
  )
}

export default ToolHeader
