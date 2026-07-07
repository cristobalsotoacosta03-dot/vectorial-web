import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { cn } from '../lib/cn'

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(26,54,93,0.3),_transparent_60%)]" />

      <motion.div
        className="relative max-w-6xl mx-auto px-6 py-32 text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.h1
          variants={item}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white"
        >
          La plataforma definitiva para instaladores industriales.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-2xl mx-auto text-lg text-slate-400 tracking-wide"
        >
          Automatiza cálculos técnicos y legalizaciones, ahorrando horas de
          gestión administrativa en cada obra.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/sandbox"
            className={cn(
              'inline-block rounded-2xl bg-orange-500 px-8 py-4 text-base font-semibold text-white',
              'shadow-xl shadow-orange-500/20 transition-all duration-100 ease-in-out',
              'hover:scale-105 hover:bg-orange-400 hover:shadow-orange-500/40',
            )}
          >
            Probar Engineering Sandbox
          </Link>
          <a
            href="#precios"
            className="glass-panel inline-block rounded-2xl border border-white/5 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-all duration-100 ease-in-out hover:bg-white/10 hover:border-white/15 hover:scale-105"
          >
            Ver planes y precios
          </a>
        </motion.div>

        <motion.div variants={item} className="mt-20">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/5 bg-navy-900/40 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/5 bg-navy-800/40 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/70" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <span className="h-3 w-3 rounded-full bg-green-500/70" />
            </div>
            <div className="p-6">
              <p className="text-left font-mono text-sm text-slate-400">
                <span className="text-orange-500">$</span> gestiobra --calculate --fluid=water --diameter=25.4 --flow=3.5
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/5 bg-navy-800/30 p-4 text-left">
                  <p className="text-xs text-slate-500">Velocidad</p>
                  <p className="mt-1 font-mono text-lg text-white">1.842 m/s</p>
                </div>
                <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-left">
                  <p className="text-xs text-orange-400">Pérdida de carga</p>
                  <p className="mt-1 font-mono text-lg text-white">0.2341 bar</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-navy-800/30 p-4 text-left">
                  <p className="text-xs text-slate-500">Régimen</p>
                  <p className="mt-1 font-mono text-lg text-white">Turbulento</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero
