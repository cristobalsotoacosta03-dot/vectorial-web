import jsPDF from 'jspdf'

export function exportPNG(stage, nombre = 'plano') {
  const uri = stage.toDataURL({ pixelRatio: 2 })
  const link = document.createElement('a')
  link.download = `${nombre}.png`
  link.href = uri
  link.click()
}

export function exportPDF(stage, nombre = 'plano') {
  const uri = stage.toDataURL({ pixelRatio: 2 })
  const width = stage.width()
  const height = stage.height()
  const orientation = width >= height ? 'landscape' : 'portrait'
  const pdf = new jsPDF({ orientation, unit: 'px', format: [width, height] })
  pdf.addImage(uri, 'PNG', 0, 0, width, height)
  pdf.save(`${nombre}.pdf`)
}

// Exportador DXF (R12 ASCII) minimalista: solo soporta las entidades básicas
// del editor (LINE, CIRCLE, TEXT). No es un exportador CAD completo (no
// incluye capas, bloques ni símbolos complejos) pero genera un archivo DXF
// válido que abre en AutoCAD/QCAD/LibreCAD con las líneas, círculos y textos
// del plano.
export function exportDXF(elementos, nombre = 'plano') {
  const lineas = []
  lineas.push('0', 'SECTION', '2', 'ENTITIES')

  for (const el of elementos) {
    if (el.tool === 'line' || el.tool === 'arrow') {
      const [x1, y1, x2, y2] = el.points
      lineas.push('0', 'LINE', '8', el.tool, '10', String(x1), '20', String(-y1), '11', String(x2), '21', String(-y2))
    } else if (el.tool === 'rect') {
      const { x, y, width, height } = el
      const pts = [[x, y], [x + width, y], [x + width, y + height], [x, y + height], [x, y]]
      for (let i = 0; i < pts.length - 1; i++) {
        lineas.push('0', 'LINE', '8', 'rect', '10', String(pts[i][0]), '20', String(-pts[i][1]), '11', String(pts[i + 1][0]), '21', String(-pts[i + 1][1]))
      }
    } else if (el.tool === 'circle') {
      lineas.push('0', 'CIRCLE', '8', 'circle', '10', String(el.x), '20', String(-el.y), '40', String(el.radius))
    } else if (el.tool === 'text') {
      lineas.push('0', 'TEXT', '8', 'text', '10', String(el.x), '20', String(-el.y), '40', String(el.fontSize || 16), '1', el.text || '')
    }
  }

  lineas.push('0', 'ENDSEC', '0', 'EOF')
  const contenido = lineas.join('\n')
  const blob = new Blob([contenido], { type: 'application/dxf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `${nombre}.dxf`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}
