import { useCallback, useEffect, useRef, useState } from 'react'
import { Stage, Layer, Line, Rect, Circle, Text, Arrow, Transformer } from 'react-konva'
import {
  MousePointer2, Minus, Square, Circle as CircleIcon, Type, ArrowUpRight,
  Undo2, Redo2, Trash2, ZoomIn, ZoomOut, Download, Save, Shapes,
} from 'lucide-react'
import SymbolShape from './SymbolShape'
import { SIMBOLOS, getSimbolo } from './symbols'
import { exportPNG, exportPDF, exportDXF } from './exportUtils'
import Button from '../ui/Button'
import Dropdown from '../ui/Dropdown'

const HERRAMIENTAS = [
  { id: 'select', label: 'Seleccionar', icon: MousePointer2 },
  { id: 'line',   label: 'Línea (tubería)',   icon: Minus },
  { id: 'rect',   label: 'Rectángulo (habitación)', icon: Square },
  { id: 'circle', label: 'Círculo (equipo/depósito)', icon: CircleIcon },
  { id: 'arrow',  label: 'Flecha (dirección de flujo)', icon: ArrowUpRight },
  { id: 'text',   label: 'Texto (anotación)', icon: Type },
  { id: 'symbol', label: 'Símbolo técnico',   icon: Shapes },
]

let nextId = 1
const newId = () => `el-${nextId++}`

export default function Editor2D({ nombrePlano = 'plano', onGuardar }) {
  const [elements, setElements] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [tool, setTool] = useState('select')
  const [selectedSymbol, setSelectedSymbol] = useState('caldera')
  const [stroke, setStroke] = useState('#1e293b')
  const [scale, setScale] = useState(1)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 560 })
  const canvasContainerRef = useRef(null)

  const [history, setHistory] = useState([[]])
  const [historyIdx, setHistoryIdx] = useState(0)

  const drawingRef = useRef(null)
  const stageRef = useRef(null)
  const trRef = useRef(null)
  const shapeRefs = useRef({})

  const commit = useCallback((next) => {
    setElements(next)
    setHistory(h => [...h.slice(0, historyIdx + 1), next])
    setHistoryIdx(i => i + 1)
  }, [historyIdx])

  function undo() {
    if (historyIdx === 0) return
    const idx = historyIdx - 1
    setHistoryIdx(idx)
    setElements(history[idx])
    setSelectedId(null)
  }

  function redo() {
    if (historyIdx >= history.length - 1) return
    const idx = historyIdx + 1
    setHistoryIdx(idx)
    setElements(history[idx])
    setSelectedId(null)
  }

  function eliminarSeleccion() {
    if (!selectedId) return
    commit(elements.filter(e => e.id !== selectedId))
    setSelectedId(null)
  }

  useEffect(() => {
    function onKeyDown(e) {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) { e.preventDefault(); eliminarSeleccion() }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo() }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  })

  useEffect(() => {
    const el = canvasContainerRef.current
    if (!el) return
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) setCanvasSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (tool === 'select' && selectedId && trRef.current && shapeRefs.current[selectedId]) {
      trRef.current.nodes([shapeRefs.current[selectedId]])
      trRef.current.getLayer().batchDraw()
    } else if (trRef.current) {
      trRef.current.nodes([])
    }
  }, [selectedId, tool, elements])

  function posicionRelativa(stage) {
    const t = stage.getAbsoluteTransform().copy().invert()
    return t.point(stage.getPointerPosition())
  }

  function handleMouseDown(e) {
    const stage = e.target.getStage()
    if (tool === 'select') {
      if (e.target === stage) setSelectedId(null)
      return
    }
    const pos = posicionRelativa(stage)
    if (tool === 'text') {
      const texto = window.prompt('Texto de la anotación:', '')
      if (texto) {
        commit([...elements, { id: newId(), tool: 'text', x: pos.x, y: pos.y, text: texto, fontSize: 16, stroke }])
      }
      return
    }
    if (tool === 'symbol') {
      commit([...elements, { id: newId(), tool: 'symbol', symbolId: selectedSymbol, x: pos.x, y: pos.y, rotation: 0, stroke }])
      return
    }
    drawingRef.current = { tool, start: pos }
    if (tool === 'line' || tool === 'arrow') {
      setElements(els => [...els, { id: '__tmp__', tool, points: [pos.x, pos.y, pos.x, pos.y], stroke, strokeWidth: 2 }])
    } else if (tool === 'rect') {
      setElements(els => [...els, { id: '__tmp__', tool, x: pos.x, y: pos.y, width: 0, height: 0, stroke, strokeWidth: 2 }])
    } else if (tool === 'circle') {
      setElements(els => [...els, { id: '__tmp__', tool, x: pos.x, y: pos.y, radius: 0, stroke, strokeWidth: 2 }])
    }
  }

  function handleMouseMove(e) {
    if (!drawingRef.current) return
    const stage = e.target.getStage()
    const pos = posicionRelativa(stage)
    const { tool: t, start } = drawingRef.current
    setElements(els => els.map(el => {
      if (el.id !== '__tmp__') return el
      if (t === 'line' || t === 'arrow') return { ...el, points: [start.x, start.y, pos.x, pos.y] }
      if (t === 'rect') return { ...el, x: Math.min(start.x, pos.x), y: Math.min(start.y, pos.y), width: Math.abs(pos.x - start.x), height: Math.abs(pos.y - start.y) }
      if (t === 'circle') return { ...el, radius: Math.hypot(pos.x - start.x, pos.y - start.y) }
      return el
    }))
  }

  function handleMouseUp() {
    if (!drawingRef.current) return
    drawingRef.current = null
    commit(elements.map(el => el.id === '__tmp__' ? { ...el, id: newId() } : el))
  }

  function handleWheel(e) {
    e.evt.preventDefault()
    const stage = stageRef.current
    const oldScale = scale
    const pointer = stage.getPointerPosition()
    const mousePointTo = { x: (pointer.x - stagePos.x) / oldScale, y: (pointer.y - stagePos.y) / oldScale }
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const newScale = Math.max(0.2, Math.min(4, oldScale * (direction > 0 ? 1.08 : 1 / 1.08)))
    setScale(newScale)
    setStagePos({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale })
  }

  function actualizarSeleccionado(cambios) {
    commit(elements.map(el => el.id === selectedId ? { ...el, ...cambios } : el))
  }

  function updateElement(id, cambios) {
    commit(elements.map(el => el.id === id ? { ...el, ...cambios } : el))
  }

  const seleccionado = elements.find(e => e.id === selectedId)

  return (
    <div className="flex flex-col h-[75vh] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto">
        <div className="flex items-center gap-1 shrink-0">
          <Button size="sm" variant="ghost" onClick={undo} disabled={historyIdx === 0} icon={<Undo2 size={16} />} title="Deshacer (Ctrl+Z)" />
          <Button size="sm" variant="ghost" onClick={redo} disabled={historyIdx >= history.length - 1} icon={<Redo2 size={16} />} title="Rehacer (Ctrl+Y)" />
          <Button size="sm" variant="ghost" onClick={eliminarSeleccion} disabled={!selectedId} icon={<Trash2 size={16} />} title="Eliminar (Supr)" />
          <span className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
          <Button size="sm" variant="ghost" onClick={() => setScale(s => Math.min(4, s * 1.2))} icon={<ZoomIn size={16} />} />
          <Button size="sm" variant="ghost" onClick={() => setScale(s => Math.max(0.2, s / 1.2))} icon={<ZoomOut size={16} />} />
          <span className="text-xs text-slate-400 w-12 text-center">{Math.round(scale * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          {onGuardar && <Button size="sm" variant="secondary" icon={<Save size={16} />} onClick={() => onGuardar(elements)}>Guardar</Button>}
          <Dropdown
            trigger={<Button size="sm" icon={<Download size={16} />}>Exportar</Button>}
            items={[
              { label: 'Imagen (PNG)', onClick: () => exportPNG(stageRef.current, nombrePlano) },
              { label: 'Documento (PDF)', onClick: () => exportPDF(stageRef.current, nombrePlano) },
              { label: 'CAD (DXF)', onClick: () => exportDXF(elements, nombrePlano) },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Herramientas */}
        <div className="w-12 sm:w-16 shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center gap-1 py-3 bg-slate-50 dark:bg-slate-800/30 overflow-y-auto">
          {HERRAMIENTAS.map(h => {
            const Icon = h.icon
            return (
              <button
                key={h.id}
                title={h.label}
                onClick={() => setTool(h.id)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                  tool === h.id
                    ? 'bg-primary-500 text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon size={20} />
              </button>
            )
          })}
        </div>

        {/* Panel de símbolos, solo visible con la herramienta symbol activa */}
        {tool === 'symbol' && (
          <div className="w-32 sm:w-48 shrink-0 border-r border-slate-200 dark:border-slate-800 overflow-y-auto py-2">
            {SIMBOLOS.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSymbol(s.id)}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  selectedSymbol === s.id
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Canvas */}
        <div ref={canvasContainerRef} className="flex-1 min-w-0 bg-slate-100 dark:bg-slate-950 overflow-hidden">
          <Stage
            ref={stageRef}
            width={canvasSize.width}
            height={canvasSize.height}
            scaleX={scale}
            scaleY={scale}
            x={stagePos.x}
            y={stagePos.y}
            draggable={tool === 'select'}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <Layer>
              {elements.map(el => {
                const common = {
                  draggable: tool === 'select',
                  onClick: () => tool === 'select' && setSelectedId(el.id),
                  onTap: () => tool === 'select' && setSelectedId(el.id),
                  stroke: el.stroke,
                  strokeWidth: el.strokeWidth ?? 2,
                }
                const onDragEndPuntos = e => {
                  const node = e.target
                  const dx = node.x(); const dy = node.y()
                  node.position({ x: 0, y: 0 })
                  updateElement(el.id, { points: el.points.map((p, i) => i % 2 === 0 ? p + dx : p + dy) })
                }
                if (el.tool === 'line') {
                  return <Line key={el.id} {...common} ref={n => (shapeRefs.current[el.id] = n)} points={el.points}
                    onDragEnd={onDragEndPuntos} lineCap="round" />
                }
                if (el.tool === 'arrow') {
                  return <Arrow key={el.id} {...common} ref={n => (shapeRefs.current[el.id] = n)} points={el.points}
                    onDragEnd={onDragEndPuntos} fill={el.stroke} />
                }
                if (el.tool === 'rect') {
                  return <Rect key={el.id} {...common} ref={n => (shapeRefs.current[el.id] = n)}
                    x={el.x} y={el.y} width={el.width} height={el.height}
                    onDragEnd={e => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
                    onTransformEnd={e => {
                      const node = e.target
                      const scaleX = node.scaleX(); const scaleY = node.scaleY()
                      node.scaleX(1); node.scaleY(1)
                      updateElement(el.id, { x: node.x(), y: node.y(), width: Math.max(5, node.width() * scaleX), height: Math.max(5, node.height() * scaleY), rotation: node.rotation() })
                    }}
                    rotation={el.rotation || 0} fill="rgba(0,102,204,0.05)" />
                }
                if (el.tool === 'circle') {
                  return <Circle key={el.id} {...common} ref={n => (shapeRefs.current[el.id] = n)}
                    x={el.x} y={el.y} radius={el.radius}
                    onDragEnd={e => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
                    onTransformEnd={e => {
                      const node = e.target
                      const scaleX = node.scaleX()
                      node.scaleX(1); node.scaleY(1)
                      updateElement(el.id, { x: node.x(), y: node.y(), radius: Math.max(3, el.radius * scaleX) })
                    }}
                    fill="rgba(0,102,204,0.05)" />
                }
                if (el.tool === 'text') {
                  return <Text key={el.id} {...common} ref={n => (shapeRefs.current[el.id] = n)}
                    x={el.x} y={el.y} text={el.text} fontSize={el.fontSize} fill={el.stroke} strokeWidth={0}
                    onDragEnd={e => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
                    onDblClick={() => {
                      const nuevo = window.prompt('Editar texto:', el.text)
                      if (nuevo !== null) updateElement(el.id, { text: nuevo })
                    }} />
                }
                if (el.tool === 'symbol') {
                  return <SymbolShape key={el.id} nodeRef={n => (shapeRefs.current[el.id] = n)}
                    id={el.symbolId} x={el.x} y={el.y} stroke={el.stroke} rotation={el.rotation || 0}
                    draggable={tool === 'select'}
                    onClick={() => tool === 'select' && setSelectedId(el.id)}
                    onDragEnd={e => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
                    onTransformEnd={e => {
                      const node = e.target
                      updateElement(el.id, { x: node.x(), y: node.y(), rotation: node.rotation() })
                    }} />
                }
                return null
              })}
              {tool === 'select' && <Transformer ref={trRef} rotateEnabled resizeEnabled />}
            </Layer>
          </Stage>
        </div>

        {/* Propiedades */}
        <div className="hidden md:block md:w-56 shrink-0 border-l border-slate-200 dark:border-slate-800 p-4 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Propiedades</p>
          {seleccionado ? (
            <>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Color</label>
                <input type="color" value={seleccionado.stroke || '#1e293b'}
                  onChange={e => actualizarSeleccionado({ stroke: e.target.value })}
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700" />
              </div>
              {'strokeWidth' in seleccionado && (
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Grosor</label>
                  <input type="range" min="1" max="10" value={seleccionado.strokeWidth || 2}
                    onChange={e => actualizarSeleccionado({ strokeWidth: Number(e.target.value) })}
                    className="w-full" />
                </div>
              )}
              {seleccionado.tool === 'symbol' && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{getSimbolo(seleccionado.symbolId).label}</p>
              )}
              {seleccionado.tool === 'text' && (
                <p className="text-xs text-slate-400">Doble clic sobre el texto para editarlo</p>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-400">Selecciona un elemento para ver sus propiedades.</p>
          )}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">{elements.length} elemento{elements.length !== 1 ? 's' : ''} en el plano</p>
          </div>
        </div>
      </div>
    </div>
  )
}
