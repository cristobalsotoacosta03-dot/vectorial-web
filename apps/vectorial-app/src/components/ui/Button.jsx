import { motion } from 'framer-motion'
import Spinner from './Spinner'

const VARIANTS = {
  primary:   'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
  danger:    'bg-error text-white hover:bg-red-600 focus-visible:ring-error',
  ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400 dark:text-slate-300 dark:hover:bg-white/5',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  className = '',
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      type={type}
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${VARIANTS[variant]} ${SIZES[size]} ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {!loading && icon}
      {children}
    </motion.button>
  )
}
