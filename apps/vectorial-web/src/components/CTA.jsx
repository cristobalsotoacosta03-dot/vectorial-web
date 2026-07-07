import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel rounded-3xl border border-orange-500/30 bg-navy-800/40 p-12 text-center shadow-2xl shadow-orange-500/10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
            ¿Listo para profesionalizar tu gestión?
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Únete a cientos de instaladores que ya han dado el salto a la gestión profesional.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/sandbox"
              className="inline-block rounded-2xl bg-orange-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-orange-500/20 transition-all duration-100 ease-in-out hover:scale-105 hover:bg-orange-400 hover:shadow-orange-500/40"
            >
              Probar Engineering Sandbox
            </Link>
            <a
              href="#contacto"
              className="glass-panel inline-block rounded-2xl border border-white/5 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-all duration-100 ease-in-out hover:bg-white/10 hover:border-white/15 hover:scale-105"
            >
              Hablar con ventas
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTA