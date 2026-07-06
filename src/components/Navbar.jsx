function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-navy-950/80 shadow-lg shadow-black/20 backdrop-blur-xl border-b border-white/5">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="VECTORIAL"
            className="h-8 w-auto"
          />
          <span className="font-heading text-xl font-semibold text-white tracking-wide">
            VEC<span className="text-orange-500">TORIAL</span>
          </span>
        </div>
        <a
          href="#acceder"
          className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 hover:scale-105 hover:bg-orange-400"
        >
          Acceder a App
        </a>
      </nav>
    </header>
  )
}

export default Navbar
