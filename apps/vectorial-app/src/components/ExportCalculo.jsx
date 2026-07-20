import { useState, useEffect, useCallback } from 'react'
import { useHistorialCalculos } from '../hooks/useHistorialCalculos'

// ── Generadores de contenido ───────────────────────────────────────────────

function generarHTML(titulo, campos, obraNombre) {
  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  const rows  = campos.map(c =>
    `<tr>
      <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;width:50%">${c.label}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:13px">${c.valor}</td>
    </tr>`
  ).join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${titulo} — Vectorial</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;max-width:780px;margin:0 auto;padding:32px;color:#1e293b}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:3px solid #1e40af;margin-bottom:24px}
  .logo{font-size:24px;font-weight:800;color:#1e40af;letter-spacing:-0.5px}
  .logo span{color:#0ea5e9}
  .meta{text-align:right;font-size:12px;color:#94a3b8;line-height:1.6}
  h2{font-size:20px;color:#0f172a;margin-bottom:6px;font-weight:700}
  .obra-badge{display:inline-flex;align-items:center;gap:6px;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;font-size:12px;font-weight:600;padding:4px 10px;border-radius:20px;margin-bottom:20px}
  table{width:100%;border-collapse:collapse;margin-bottom:24px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
  thead tr{background:#f8fafc}
  th{padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;font-weight:600}
  .warning{background:#fff7ed;border:1px solid #fdba74;padding:14px 16px;border-radius:8px;font-size:12px;color:#92400e;line-height:1.6}
  .warning strong{color:#78350f}
  .footer{margin-top:24px;padding-top:14px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;display:flex;justify-content:space-between}
  .print-btn{display:block;margin:24px auto 0;background:#1e40af;color:white;border:none;padding:12px 28px;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit}
  @media print{.print-btn{display:none!important}body{padding:15px}}
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">Vecto<span>rial</span></div>
    <div style="font-size:12px;color:#94a3b8;margin-top:3px">Plataforma de gestión de instalaciones técnicas</div>
  </div>
  <div class="meta">
    <div>${fecha}</div>
    <div>Informe técnico automático</div>
  </div>
</div>
<h2>${titulo}</h2>
<div class="obra-badge">📂 ${obraNombre}</div>
<table>
  <thead>
    <tr><th>Parámetro</th><th>Resultado / Valor</th></tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
<div class="warning">
  <strong>⚠️ Aviso importante:</strong> Este informe es orientativo basado en los datos introducidos.
  No sustituye al proyecto técnico legalizado. Todos los valores deben ser verificados y firmados
  por un técnico competente habilitado según la normativa vigente.
</div>
<div class="footer">
  <span>Vectorial · Informe generado el ${fecha}</span>
  <span>Sujeto a verificación técnica</span>
</div>
<button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
</body>
</html>`
}

function generarTextoWA(titulo, campos, obraNombre) {
  const lineas = campos.map(c => `• *${c.label}:* ${c.valor}`).join('\n')
  const fecha  = new Date().toLocaleDateString('es-ES')
  return `*📋 ${titulo.toUpperCase()}*\n📂 Obra: _${obraNombre}_\n📅 ${fecha}\n${'─'.repeat(32)}\n\n${lineas}\n\n${'─'.repeat(32)}\n_Informe generado por Vectorial_\n⚠️ _Sujeto a verificación técnica_`
}

// ── Componente ─────────────────────────────────────────────────────────────

export default function ExportCalculo({ tipo, titulo, campos, obraId, obraNombre }) {
  const { guardar } = useHistorialCalculos()
  const [guardado, setGuardado] = useState(false)
  const [copiado,  setCopiado]  = useState(false)

  const handleGuardar = useCallback(() => {
    guardar(tipo, titulo, obraId, obraNombre, campos)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2500)
  }, [guardar, tipo, titulo, obraId, obraNombre, campos])

  // Atajo Ctrl/Cmd+S — guarda el cálculo actual en el historial sin abrir
  // el diálogo "Guardar página" del navegador.
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        handleGuardar()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [handleGuardar])

  function handleExportar() {
    const html = generarHTML(titulo, campos, obraNombre || 'Sin obra asignada')
    const w = window.open('', '_blank', 'width=880,height=720,scrollbars=yes')
    if (w) { w.document.write(html); w.document.close() }
  }

  function handleWhatsApp() {
    const txt = generarTextoWA(titulo, campos, obraNombre || 'Sin obra')
    navigator.clipboard.writeText(txt).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    }).catch(() => {
      // Fallback: prompt
      prompt('Copia el texto para WhatsApp:', txt)
    })
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-2">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Guardar · Exportar · Compartir
        </p>
        {obraNombre
          ? <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">📂 {obraNombre}</span>
          : <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full">Sin obra seleccionada</span>
        }
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={handleGuardar}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${guardado ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
          {guardado ? '✅ Guardado' : '💾 Guardar cálculo'}
        </button>
        <button onClick={handleExportar}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
          🖨️ Exportar / PDF
        </button>
        <button onClick={handleWhatsApp}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${copiado ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}>
          {copiado ? '✅ ¡Copiado!' : '📱 Copiar WhatsApp'}
        </button>
      </div>
    </div>
  )
}
