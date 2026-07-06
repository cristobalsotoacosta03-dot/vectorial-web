function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative text-slate-400 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-heading text-lg font-bold text-white">
          Gesti<span className="text-orange-500">Obra</span>
        </span>
        <p className="text-sm text-slate-500">
          © {year} GestiObra. Todos los derechos reservados.
        </p>
        <div className="flex gap-6 text-sm">
          <a href="#" className="hover:text-orange-500 transition">
            Aviso legal
          </a>
          <a href="#" className="hover:text-orange-500 transition">
            Privacidad
          </a>
          <a href="#" className="hover:text-orange-500 transition">
            Contacto
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
