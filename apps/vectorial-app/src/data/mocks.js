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

export const PROVEEDORES_MOCK = [
  { id: 'p1', nombre: 'Saltoki Distribución', cif: 'B12345678', contacto: 'Marta Ibáñez', telefono: '900 100 200', email: 'pedidos@saltoki.example', notas: 'Buen plazo de entrega en cobre y PVC.', activo: true },
  { id: 'p2', nombre: 'Grupo Cointra Suministros', cif: 'B87654321', contacto: 'Javier Roldán', telefono: '900 300 400', email: 'ventas@cointra.example', notas: 'Precios competitivos en calderas y termos.', activo: true },
  { id: 'p3', nombre: 'Ferretería Industrial Norte', cif: 'B11223344', contacto: 'Lucía Domínguez', telefono: '900 500 600', email: 'compras@fnorte.example', notas: '', activo: true },
]

export const PRECIOS_PROVEEDOR_MOCK = [
  { id: 'pp1', material_nombre: 'Tubería cobre 22×1 R250', proveedor_id: 'p1', precio: 6.80, unidad: 'ml', fecha: '2026-06-01', plazo_dias: 3, notas: '' },
  { id: 'pp2', material_nombre: 'Tubería cobre 22×1 R250', proveedor_id: 'p3', precio: 7.25, unidad: 'ml', fecha: '2026-05-20', plazo_dias: 1, notas: 'Entrega inmediata en almacén' },
  { id: 'pp3', material_nombre: 'Caldera condensación 24kW', proveedor_id: 'p2', precio: 890, unidad: 'ud', fecha: '2026-06-10', plazo_dias: 7, notas: '' },
  { id: 'pp4', material_nombre: 'Caldera condensación 24kW', proveedor_id: 'p1', precio: 945, unidad: 'ud', fecha: '2026-05-28', plazo_dias: 2, notas: '' },
]

export const CERTIFICACIONES_MOCK = [
  { id: 'c1', obra_id: '1', numero: 'CERT-01', fecha: '2026-04-05', pct_avance: 25, importe_certificado: 11250, estado: 'pagada',  notas: 'Replanteo y acometidas.' },
  { id: 'c2', obra_id: '1', numero: 'CERT-02', fecha: '2026-05-10', pct_avance: 55, importe_certificado: 24750, estado: 'emitida', notas: 'Instalación de unidades interiores.' },
  { id: 'c3', obra_id: '2', numero: 'CERT-01', fecha: '2026-04-20', pct_avance: 40, importe_certificado: 5000,  estado: 'pagada',  notas: 'Demolición de red antigua.' },
]

export const CERTIFICADOS_NORMATIVOS_MOCK = [
  { id: 'cn1', obra_id: '1', nombre: 'Certificado OCA — instalación climatización', tipo: 'oca', fecha_solicitud: '2026-03-01', fecha_vencimiento: '2026-08-01', documento_url: '', estado: 'aprobada', notas: 'Inspección inicial superada.' },
  { id: 'cn2', obra_id: '1', nombre: 'Registro industria — instalación térmica', tipo: 'industria', fecha_solicitud: '2026-04-15', fecha_vencimiento: '2026-07-25', documento_url: '', estado: 'en_tramite', notas: 'Pendiente de resolución de industria.' },
  { id: 'cn3', obra_id: '2', nombre: 'Licencia municipal de obras', tipo: 'municipal', fecha_solicitud: '2026-02-10', fecha_vencimiento: '2026-06-30', documento_url: '', estado: 'pendiente', notas: 'A la espera de documentación del ayuntamiento.' },
]

export const TAREAS_OBRA_MOCK = [
  { id: 't1', obra_id: '1', nombre: 'Replanteo e instalación de acometidas', fecha_inicio: '2026-03-10', fecha_fin: '2026-03-24', progreso_pct: 100, hito: false, responsable: 'Equipo A', dependencia_id: null, orden: 1 },
  { id: 't2', obra_id: '1', nombre: 'Montaje de red de distribución',        fecha_inicio: '2026-03-25', fecha_fin: '2026-05-10', progreso_pct: 60,  hito: false, responsable: 'Equipo A', dependencia_id: 't1', orden: 2 },
  { id: 't3', obra_id: '1', nombre: 'Instalación de unidades interiores',    fecha_inicio: '2026-05-11', fecha_fin: '2026-06-20', progreso_pct: 20,  hito: false, responsable: 'Equipo B', dependencia_id: 't2', orden: 3 },
  { id: 't4', obra_id: '1', nombre: 'Puesta en marcha y pruebas',            fecha_inicio: '2026-08-20', fecha_fin: '2026-08-30', progreso_pct: 0,   hito: true,  responsable: 'Jefe de obra', dependencia_id: 't3', orden: 4 },
  { id: 't5', obra_id: '2', nombre: 'Demolición de red antigua',             fecha_inicio: '2026-04-01', fecha_fin: '2026-04-15', progreso_pct: 100, hito: false, responsable: 'Equipo C', dependencia_id: null, orden: 1 },
]

export const DOCUMENTOS_OBRA_MOCK = {}

export const CALCULOS_MOCK = [
  {
    id: 'c1', tipo: 'glp', titulo: 'Dimensionado Depósito GLP', obra_id: '1', obra_nombre: 'Instalación HVAC — Edificio Omega',
    created_at: '2026-06-02T10:15:00Z',
    campos: [
      { label: 'Fluido GLP', valor: 'Propano' },
      { label: 'Tipo de depósito', valor: 'Aéreo' },
      { label: 'Consumo diario', valor: '10 kg/día' },
      { label: 'Capacidad comercial mínima', valor: '2.450 L' },
      { label: 'Categoría UNE 60250', valor: 'A-5' },
      { label: 'Normativa aplicada', valor: 'RD 919/2006 · ITC-ICG 03 · UNE 60250:2008 · f. llenado máx. 85 %' },
    ],
  },
  {
    id: 'c2', tipo: 'tuberias', titulo: 'Dimensionado de Tubería', obra_id: '2', obra_nombre: 'Renovación fontanería — Hotel Mirasol',
    created_at: '2026-06-10T09:30:00Z',
    campos: [
      { label: 'Material', valor: 'Cobre (UNE-EN 1057)' },
      { label: 'Diámetro', valor: '22 × 1' },
      { label: 'Fluido', valor: 'ACS (60 °C)' },
      { label: 'Caudal', valor: '500 L/h' },
      { label: 'Velocidad', valor: '0.72 m/s — ✓ Dentro del límite' },
      { label: 'Normativa aplicada', valor: 'Darcy-Weisbach · UNE-EN 1057:2010+A1 · RITE IT 1.3.4.2.1' },
    ],
  },
  {
    id: 'c3', tipo: 'acs', titulo: 'Dimensionado Acumulador ACS', obra_id: null, obra_nombre: 'Sin obra asignada',
    created_at: '2026-06-18T16:45:00Z',
    campos: [
      { label: 'Tipo de uso', valor: 'Vivienda unifamiliar' },
      { label: 'Ocupación (personas)', valor: '4' },
      { label: 'Volumen acumulador', valor: '39 L' },
      { label: 'Potencia mínima caldera', valor: '1.9 kW' },
      { label: 'Normativa', valor: 'CTE DB-HE4 Tabla 4.1 · RITE IT 1.1.4.3.3' },
    ],
  },
]
