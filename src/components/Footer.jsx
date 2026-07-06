function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative text-slate-400 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="GestiObra" className="h-6 w-auto" />
          <span className="font-heading text-lg font-bold text-white tracking-wide">
            Gesti<span className="text-orange-500">Obra</span>
          </span>
        </div>
        <p className="text-sm text-slate-500">
          © {year} GestiObra. Todos los derechos reservados.
        </p>
        <div className="flex gap-6 text-sm">
          <a href="#" className="hover:text-orange-500 transition-colors duration-300">
            Aviso legal
          </a>
          <a href="#" className="hover:text-orange-500 transition-colors duration-300">
            Privacidad
          </a>
          <a href="#" className="hover:text-orange-500 transition-colors duration-300">
            Contacto
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
