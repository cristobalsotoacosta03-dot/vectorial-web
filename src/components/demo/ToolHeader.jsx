function ToolHeader({ icon, title, description }) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-xl">
        {icon}
      </div>
      <div className="text-left">
        <h3 className="font-heading text-lg font-semibold text-white">
          {title}
        </h3>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
    </div>
  )
}

export default ToolHeader
