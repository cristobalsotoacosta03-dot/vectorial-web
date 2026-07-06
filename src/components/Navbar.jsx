function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-midnight-950/80 shadow-lg shadow-black/20 backdrop-blur">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <span className="font-heading text-2xl font-bold text-white">
          Gesti<span className="text-orange-500">Obra</span>
        </span>
        <a
          href="#acceder"
          className="rounded-2xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 hover:scale-105 hover:bg-orange-400"
        >
          Acceder a App
        </a>
      </nav>
    </header>
  )
}

export default Navbar
