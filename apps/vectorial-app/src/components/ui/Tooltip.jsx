import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Tooltip({ children, label, side = 'top' }) {
  const [visible, setVisible] = useState(false)

  const sideClass = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  }[side]

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 whitespace-nowrap px-2.5 py-1.5 text-xs font-medium text-white bg-slate-800 rounded-lg shadow-lg ${sideClass}`}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
