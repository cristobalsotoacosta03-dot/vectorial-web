import { motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import { cn } from '../lib/cn'

const noisePattern =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

function AppLayout({ children, className }) {
  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col overflow-hidden bg-slate-950',
        className,
      )}
    >
      {/* Ambientación: glow radial en la esquina superior derecha */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[560px] w-[560px] rounded-full bg-indigo-900/20 blur-[160px]" />

      {/* Textura: overlay de ruido sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `url("${noisePattern}")` }}
      />

      <Navbar />
      <motion.main
        className="relative flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  )
}

export default AppLayout
