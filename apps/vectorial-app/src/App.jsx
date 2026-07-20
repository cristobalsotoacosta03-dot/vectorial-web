import { useState } from 'react'
import { Routes, Route, useNavigate as useRouterNavigate } from 'react-router-dom'
import RequireAuth     from './components/RequireAuth'
import AppLayout      from './components/layout/AppLayout'
import Login        from './pages/Login'
import Signup       from './pages/Signup'
import Onboarding   from './pages/Onboarding'
import Dashboard    from './pages/Dashboard'
import Obras        from './pages/Obras'
import Presupuestos from './pages/Presupuestos'
import MisProyectos from './pages/MisProyectos'
import Componentes  from './pages/Componentes'
import Calculadoras from './pages/Calculadoras'
import Planos       from './pages/Planos'
import Materiales   from './pages/Materiales'
import Proveedores  from './pages/Proveedores'
import Certificaciones from './pages/Certificaciones'
import Gantt         from './pages/Gantt'
import Documentacion  from './pages/Documentacion'
import Historial      from './pages/Historial'
import Perfil       from './pages/Perfil'
import Billing      from './pages/Billing'
import Ajustes      from './pages/Ajustes'
import './index.css'

// Mapa de IDs de página (usados por las páginas existentes) a rutas reales
const PAGE_PATHS = {
  dashboard:    '/',
  obras:        '/obras',
  proyectos:    '/proyectos',
  presupuestos: '/presupuestos',
  materiales:   '/materiales',
  proveedores:  '/proveedores',
  certificaciones: '/certificaciones',
  gantt:        '/gantt',
  documentacion: '/documentacion',
  componentes:  '/componentes',
  calculadoras: '/calculadoras',
  planos:       '/planos',
  historial:    '/historial',
}

export default function App() {
  const routerNavigate = useRouterNavigate()
  // Estado global de obra seleccionada — compartido entre Dashboard, Materiales y Calculadoras
  const [selectedObraId, setSelectedObraId] = useState(null)

  // Función de navegación con soporte opcional para cambiar la obra al mismo tiempo
  function navigate(pageId, obraId) {
    if (obraId !== undefined) setSelectedObraId(obraId)
    routerNavigate(PAGE_PATHS[pageId] ?? '/')
  }

  return (
    <Routes>
      <Route path="login"    element={<Login />} />
      <Route path="signup"   element={<Signup />} />
      <Route path="onboarding" element={<Onboarding />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index               element={<Dashboard    navigate={navigate} selectedObraId={selectedObraId} setSelectedObraId={setSelectedObraId} />} />
          <Route path="obras"        element={<Obras        navigate={navigate} />} />
          <Route path="proyectos"    element={<MisProyectos navigate={navigate} />} />
          <Route path="presupuestos" element={<Presupuestos navigate={navigate} />} />
          <Route path="materiales"   element={<Materiales   navigate={navigate} selectedObraId={selectedObraId} setSelectedObraId={setSelectedObraId} />} />
          <Route path="proveedores"  element={<Proveedores  navigate={navigate} />} />
          <Route path="certificaciones" element={<Certificaciones navigate={navigate} selectedObraId={selectedObraId} setSelectedObraId={setSelectedObraId} />} />
          <Route path="gantt"        element={<Gantt        navigate={navigate} selectedObraId={selectedObraId} setSelectedObraId={setSelectedObraId} />} />
          <Route path="documentacion" element={<Documentacion navigate={navigate} selectedObraId={selectedObraId} setSelectedObraId={setSelectedObraId} />} />
          <Route path="componentes"  element={<Componentes />} />
          <Route path="calculadoras" element={<Calculadoras navigate={navigate} selectedObraId={selectedObraId} />} />
          <Route path="planos"      element={<Planos       selectedObraId={selectedObraId} />} />
          <Route path="historial"   element={<Historial />} />

          <Route path="perfil"  element={<Perfil />} />
          <Route path="billing" element={<Billing />} />
          <Route path="ajustes" element={<Ajustes />} />
        </Route>
      </Route>
    </Routes>
  )
}
