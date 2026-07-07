// ─── Datos mock para prototipo sin Supabase ───────────────────────────────────

export const OBRAS_MOCK = [
  {
    id: '1', nombre: 'Instalación HVAC — Edificio Omega', cliente: 'Inversiones Omega S.L.',
    direccion: 'C/ Gran Vía 45, Madrid', estado: 'activa',
    fecha_inicio: '2026-03-10', fecha_fin: '2026-08-30',
    descripcion: 'Instalación completa de sistema HVAC centralizado para edificio de oficinas de 8 plantas.',
  },
  {
    id: '2', nombre: 'Renovación fontanería — Hotel Mirasol', cliente: 'Hotel Mirasol S.A.',
    direccion: 'Av. del Mar 12, Barcelona', estado: 'activa',
    fecha_inicio: '2026-04-01', fecha_fin: '2026-07-15',
    descripcion: 'Sustitución completa de red de distribución de ACS y AF en todas las plantas del hotel.',
  },
  {
    id: '3', nombre: 'Climatización — Nave Industrial Sector 7', cliente: 'LogiTrans Corp.',
    direccion: 'Polígono Norte, Nave 7, Zaragoza', estado: 'pausada',
    fecha_inicio: '2026-01-15', fecha_fin: '2026-09-30',
    descripcion: 'Climatización industrial mediante 4 unidades roof-top de 40kW. Obra pausada por licencia municipal.',
  },
  {
    id: '4', nombre: 'Mantenimiento calderas — Residencial Las Torres', cliente: 'Comunidad Las Torres',
    direccion: 'C/ Roble 3, Valencia', estado: 'finalizada',
    fecha_inicio: '2025-11-01', fecha_fin: '2026-02-28',
    descripcion: 'Revisión y mantenimiento anual de sala de calderas según RITE. Sustitución de quemadores.',
  },
]

export const PRESUPUESTOS_MOCK = [
  { id: '1', numero: 'PRES-2026-001', obra_nombre: 'Instalación HVAC — Edificio Omega',   fecha: '2026-03-05', importe_base: 45000, margen_pct: 18, estado: 'aceptado' },
  { id: '2', numero: 'PRES-2026-002', obra_nombre: 'Renovación fontanería — Hotel Mirasol', fecha: '2026-03-20', importe_base: 12500, margen_pct: 22, estado: 'enviado'  },
  { id: '3', numero: 'PRES-2026-003', obra_nombre: 'Climatización — Nave Industrial Sector 7', fecha: '2026-01-10', importe_base: 78000, margen_pct: 15, estado: 'borrador' },
  { id: '4', numero: 'PRES-2026-004', obra_nombre: 'Mantenimiento calderas — Residencial Las Torres', fecha: '2025-10-20', importe_base: 8200, margen_pct: 20, estado: 'aceptado' },
  { id: '5', numero: 'PRES-2026-005', obra_nombre: 'Renovación fontanería — Hotel Mirasol', fecha: '2026-04-15', importe_base: 3800, margen_pct: 25, estado: 'rechazado' },
]
