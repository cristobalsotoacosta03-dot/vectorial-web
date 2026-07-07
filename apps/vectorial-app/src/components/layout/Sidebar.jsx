import { NavLink } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

const NAV_OPERATIVO = [
  { to: '/',             label: 'Inicio',       end: true },
  { to: '/obras',        label: 'Obras' },
  { to: '/presupuestos', label: 'Presupuestos' },
  { to: '/materiales',   label: 'Materiales' },
  { to: '/catalogo',     label: 'Catálogo' },
  { to: '/calculadoras', label: 'Calcular' },
]

const NAV_ADMIN = [
  { to: '/perfil',  label: 'Mi Perfil' },
  { to: '/billing', label: 'Facturación/Suscripción' },
  { to: '/ajustes', label: 'Ajustes' },
]

function NavItem({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
          isActive
            ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-500/10 dark:text-indigo-400'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-white/5'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500 rounded-full" />
          )}
          <span className="pl-1">{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border-r border-slate-200 dark:border-slate-800">
      <NavLink to="/" className="flex items-center gap-3 px-5 h-16 border-b border-slate-200 dark:border-slate-800 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
          G
        </div>
        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">GestiObra</span>
      </NavLink>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <p className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Operativo</p>
        {NAV_OPERATIVO.map(item => <NavItem key={item.to} {...item} />)}
      </nav>

      <div className="px-4 py-5 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <p className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cuenta</p>
        {NAV_ADMIN.map(item => <NavItem key={item.to} {...item} />)}

        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between mt-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-white/5 transition-all"
        >
          <span>{theme === 'dark' ? 'Modo oscuro' : 'Modo claro'}</span>
          <span aria-hidden="true">{theme === 'dark' ? '🌙' : '☀️'}</span>
        </button>
      </div>
    </aside>
  )
}
