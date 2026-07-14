import { Group, Rect, Circle, Line, RegularPolygon, Ellipse } from 'react-konva'

// Glifos geométricos simples para cada símbolo — centrados en (0,0), caja ~40x40.
// Se envuelven en un <Group> posicionado en (x,y) por el llamador.
function Glifo({ id, stroke, size }) {
  const s = size / 40 // escala respecto a la caja de diseño base 40x40
  const common = { stroke, strokeWidth: 2 / s, fill: 'white' }

  switch (id) {
    case 'caldera':
      return <>
        <Rect x={-15} y={-18} width={30} height={36} cornerRadius={4} {...common} />
        <Line points={[-8, 8, -2, -4, 4, 4, 10, -8]} stroke={stroke} strokeWidth={2 / s} lineCap="round" lineJoin="round" />
      </>
    case 'bomba':
      return <>
        <Circle radius={16} {...common} />
        <RegularPolygon sides={3} radius={9} rotation={90} stroke={stroke} strokeWidth={2 / s} fill={stroke} />
      </>
    case 'deposito':
      return <>
        <Rect x={-14} y={-18} width={28} height={36} cornerRadius={10} {...common} />
        <Line points={[-14, -10, 14, -10]} stroke={stroke} strokeWidth={1.5 / s} />
      </>
    case 'intercambiador':
      return <>
        <Rect x={-16} y={-12} width={32} height={24} cornerRadius={3} {...common} />
        <Line points={[-10, 0, -5, -7, 0, 7, 5, -7, 10, 0]} stroke={stroke} strokeWidth={2 / s} lineCap="round" lineJoin="round" />
      </>
    case 'valvula_compuerta':
      return <>
        <Line points={[-16, -12, 16, 12, 16, -12, -16, 12]} closed stroke={stroke} strokeWidth={2 / s} fill="white" />
        <Rect x={-6} y={-20} width={12} height={8} stroke={stroke} strokeWidth={2 / s} fill="white" />
      </>
    case 'valvula_esfera':
      return <>
        <Line points={[-16, -12, 16, 12, 16, -12, -16, 12]} closed stroke={stroke} strokeWidth={2 / s} fill="white" />
        <Circle radius={7} stroke={stroke} strokeWidth={2 / s} fill="white" />
      </>
    case 'valvula_retencion':
      return <>
        <Line points={[-16, -12, 16, 12, 16, -12, -16, 12]} closed stroke={stroke} strokeWidth={2 / s} fill="white" />
        <RegularPolygon sides={3} radius={7} rotation={90} fill={stroke} />
      </>
    case 'cuadro_electrico':
      return <>
        <Rect x={-16} y={-16} width={32} height={32} stroke={stroke} strokeWidth={2 / s} fill="white" />
        <Line points={[0, -16, 0, 16]} stroke={stroke} strokeWidth={1.5 / s} />
        <Line points={[-16, 0, 16, 0]} stroke={stroke} strokeWidth={1.5 / s} />
      </>
    case 'enchufe':
      return <>
        <Circle radius={14} {...common} />
        <Line points={[-4, -5, -4, 5]} stroke={stroke} strokeWidth={2.5 / s} />
        <Line points={[4, -5, 4, 5]} stroke={stroke} strokeWidth={2.5 / s} />
      </>
    case 'luminaria':
      return <>
        <Circle radius={10} {...common} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
          const rad = (deg * Math.PI) / 180
          return (
            <Line key={deg}
              points={[Math.cos(rad) * 12, Math.sin(rad) * 12, Math.cos(rad) * 18, Math.sin(rad) * 18]}
              stroke={stroke} strokeWidth={2 / s} />
          )
        })}
      </>
    case 'lavabo':
      return <>
        <Ellipse radiusX={16} radiusY={10} y={2} {...common} />
        <Line points={[-16, 2, -16, -10, 16, -10, 16, 2]} stroke={stroke} strokeWidth={2 / s} />
      </>
    case 'inodoro':
      return <>
        <Rect x={-8} y={-18} width={16} height={8} cornerRadius={2} {...common} />
        <Ellipse radiusX={12} radiusY={10} y={4} {...common} />
      </>
    case 'ducha':
      return <>
        <Rect x={-14} y={-16} width={28} height={28} stroke={stroke} strokeWidth={2 / s} fill="white" />
        <Circle radius={3} x={-6} y={-8} fill={stroke} />
        <Circle radius={3} x={4} y={-2} fill={stroke} />
        <Circle radius={3} x={-2} y={8} fill={stroke} />
      </>
    default:
      return <Rect x={-15} y={-15} width={30} height={30} {...common} />
  }
}

export default function SymbolShape({ id, x, y, size = 40, stroke = '#1e293b', rotation = 0, draggable, onClick, onDragEnd, onTransformEnd, nodeRef }) {
  return (
    <Group
      ref={nodeRef}
      x={x}
      y={y}
      rotation={rotation}
      draggable={draggable}
      onClick={onClick}
      onTap={onClick}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    >
      <Glifo id={id} stroke={stroke} size={size} />
    </Group>
  )
}
