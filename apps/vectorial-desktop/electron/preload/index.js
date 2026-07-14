const { contextBridge } = require('electron')

// Puente mínimo hacia el renderer. Vectorial-app hoy no necesita APIs nativas
// (todo pasa por Supabase vía HTTPS) — se deja preparado por si en el futuro
// se quiere añadir, p.ej., diálogos nativos de guardado para los PDF/DXF
// exportados desde el editor de planos.
contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
})
