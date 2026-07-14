import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home, Building2, FileText, Package, BookOpen, Calculator, PenTool,
  User, CreditCard, Settings, Sun, Moon, LogOut, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../contexts/AuthContext'
import Tooltip from '../ui/Tooltip'

const NAV_OPERATIVO = [
  { to: '/',             label: 'Inicio',       end: true, icon: Home },
  { to: '/obras',        label: 'Obras',        icon: Building2 },
  { to: '/presupuestos', label: 'Presupuestos', icon: FileText },
  { to: '/materiales',   label: 'Materiales',   icon: Package },
  { to: '/catalogo',     label: 'Catálogo',     icon: BookOpen },
  { to: '/calculadoras', label: 'Calcular',     icon: Calculator },
  { to: '/planos',       label: 'Planos',       icon: PenTool },
]

const NAV_ADMIN = [
  { to: '/perfil',  label: 'Mi Perfil',              icon: User },
  { to: '/billing', label: 'Facturación/Suscripción', icon: CreditCard },
  { to: '/ajustes', label: 'Ajustes',                 icon: Settings },
]

function NavItem({ to, label, end, icon: Icon, collapsed }) {
  const link = (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
          collapsed ? 'justify-center' : ''
        } ${
          isActive
            ? 'bg-primary-50 text-primary-700 font-semibold dark:bg-primary-500/10 dark:text-primary-400'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-white/5'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && !collapsed && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary-500 rounded-full" />
          )}
          <Icon size={18} strokeWidth={2} className="shrink-0" />
          {!collapsed && <span>{label}</span>}
        </>
      )}
    </NavLink>
  )

  return collapsed ? <Tooltip label={label} side="right">{link}</Tooltip> : link
}

export default function Sidebar({ collapsed = false, onToggle }) {
  const { theme, toggleTheme } = useTheme()
  const { user, empresaNombre, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className={`shrink-0 h-screen sticky top-0 flex flex-col bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 transition-all duration-200 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div className="flex items-center h-16 border-b border-slate-200 dark:border-slate-800 px-3">
        <NavLink to="/" className={`flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity ${collapsed ? 'justify-center' : 'px-2'}`}>
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
            V
          </div>
          {!collapsed && <span className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">Vectorial</span>}
        </NavLink>
        {!collapsed && (
          <button
            onClick={onToggle}
            aria-label="Colapsar menú"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-slate-200 transition-colors"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={onToggle}
          aria-label="Expandir menú"
          className="mx-auto mt-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-slate-200 transition-colors"
        >
          <PanelLeftOpen size={18} />
        </button>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
        {!collapsed && <p className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Operativo</p>}
        {NAV_OPERATIVO.map(item => <NavItem key={item.to} {...item} collapsed={collapsed} />)}
      </nav>

      <div className="px-3 py-5 border-t border-slate-200 dark:border-slate-800 space-y-1">
        {!collapsed && (user || empresaNombre) && (
          <div className="px-3 mb-2">
            {empresaNombre && <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{empresaNombre}</p>}
            {user?.email && <p className="text-xs text-slate-400 truncate">{user.email}</p>}
          </div>
        )}

        {!collapsed && <p className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cuenta</p>}
        {NAV_ADMIN.map(item => <NavItem key={item.to} {...item} collapsed={collapsed} />)}

        <Tooltip label={theme === 'dark' ? 'Modo oscuro' : 'Modo claro'} side="right">
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className={`w-full flex items-center gap-3 mt-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-white/5 transition-all ${collapsed ? 'justify-center' : 'justify-between'}`}
          >
            {!collapsed && <span>{theme === 'dark' ? 'Modo oscuro' : 'Modo claro'}</span>}
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </Tooltip>

        <Tooltip label="Cerrar sesión" side="right">
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center' : 'justify-between'}`}
          >
            {!collapsed && <span>Cerrar sesión</span>}
            <LogOut size={18} />
          </button>
        </Tooltip>
      </div>
    </aside>
  )
}
