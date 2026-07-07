import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import EngineeringSandbox from '../components/EngineeringSandbox'

function SandboxPage() {
  return (
    <div className="relative min-h-screen">
      {/* Botón volver al inicio - esquina superior izquierda */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className={`
            glass-panel inline-flex items-center gap-2 rounded-xl
            bg-white/5 border border-white/5 px-4 py-2.5
            text-sm font-medium text-slate-300
            backdrop-blur-xl transition-all duration-100 ease-in-out
            hover:bg-white/10 hover:text-white hover:border-white/15
            hover:scale-105
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Volver al Inicio
        </Link>
      </div>

      {/* Contenido principal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <EngineeringSandbox />
      </motion.div>
    </div>
  )
}

export default SandboxPage