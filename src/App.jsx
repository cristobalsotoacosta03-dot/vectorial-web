import { useState } from 'react'
import { Routes, Route, useNavigate as useRouterNavigate } from 'react-router-dom'
import AppLayout      from './components/layout/AppLayout'
import Dashboard    from './pages/Dashboard'
import Obras        from './pages/Obras'
import Presupuestos from './pages/Presupuestos'
import Catalogo     from './pages/Catalogo'
import Calculadoras from './pages/Calculadoras'
import Materiales   from './pages/Materiales'
import Perfil       from './pages/Perfil'
import Billing      from './pages/Billing'
import Ajustes      from './pages/Ajustes'
import './index.css'

// Mapa de IDs de página (usados por las páginas existentes) a rutas reales
const PAGE_PATHS = {
  dashboard:    '/',
  obras:        '/obras',
  presupuestos: '/presupuestos',
  materiales:   '/materiales',
  catalogo:     '/catalogo',
  calculadoras: '/calculadoras',
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
      <Route element={<AppLayout />}>
        <Route index               element={<Dashboard    navigate={navigate} selectedObraId={selectedObraId} setSelectedObraId={setSelectedObraId} />} />
        <Route path="obras"        element={<Obras        navigate={navigate} />} />
        <Route path="presupuestos" element={<Presupuestos navigate={navigate} />} />
        <Route path="materiales"   element={<Materiales   navigate={navigate} selectedObraId={selectedObraId} setSelectedObraId={setSelectedObraId} />} />
        <Route path="catalogo"     element={<Catalogo     navigate={navigate} />} />
        <Route path="calculadoras" element={<Calculadoras navigate={navigate} selectedObraId={selectedObraId} />} />

        <Route path="perfil"  element={<Perfil />} />
        <Route path="billing" element={<Billing />} />
        <Route path="ajustes" element={<Ajustes />} />
      </Route>
    </Routes>
  )
}
