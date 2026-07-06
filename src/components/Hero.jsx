import { motion } from 'framer-motion'
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.18),_transparent_60%)]" />

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
          className="mt-6 max-w-2xl mx-auto text-lg text-slate-400"
        >
          Automatiza cálculos técnicos y legalizaciones, ahorrando horas de
          gestión administrativa en cada obra.
        </motion.p>

        <motion.div variants={item} className="mt-10">
          <a
            href="#demo"
            className={cn(
              'inline-block rounded-2xl bg-orange-500 px-8 py-4 text-base font-semibold text-white',
              'shadow-xl shadow-orange-500/20 transition-all duration-300',
              'hover:scale-105 hover:bg-orange-400 hover:shadow-orange-500/40',
            )}
          >
            Solicitar Demo
          </a>
        </motion.div>

        {/* Mockup del dashboard */}
        <motion.div
          variants={item}
          className="mt-20 mx-auto max-w-4xl overflow-hidden rounded-2xl bg-midnight-900 shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b border-white/5 bg-midnight-800 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <span className="h-3 w-3 rounded-full bg-green-500/70" />
          </div>
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 rounded-xl bg-white/5" />
              <div className="h-20 rounded-xl bg-white/5" />
              <div className="h-20 rounded-xl border border-orange-500/30 bg-orange-500/10" />
            </div>
            <div className="h-40 rounded-xl bg-white/5" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero
