import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  Star,
  Clock,
  Copy,
  Trash2,
  MoreVertical,
  HardHat,
  Calculator
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const PROYECTOS_EJEMPLO = [
  {
    id: 1,
    nombre: 'Calefacción piso Madrid',
    tipo: 'calefaccion',
    estado: 'en_progreso',
    progreso: 60,
    fechaCreacion: '2024-01-15',
    fechaModificacion: '2024-01-20',
    favorito: true,
    descripcion: 'Instalación de calefacción por radiadores en piso de 80m²',
    objetos: 12,
    calculos: 5
  },
  {
    id: 2,
    nombre: 'ACS Hotel Barcelona',
    tipo: 'acs',
    estado: 'en_progreso',
    progreso: 30,
    fechaCreacion: '2024-01-10',
    fechaModificacion: '2024-01-18',
    favorito: false,
    descripcion: 'Sistema de agua caliente sanitaria para hotel 20 habitaciones',
    objetos: 8,
    calculos: 3
  },
  {
    id: 3,
    nombre: 'Instalación gas restaurante',
    tipo: 'gas',
    estado: 'finalizado',
    progreso: 100,
    fechaCreacion: '2024-01-05',
    fechaModificacion: '2024-01-12',
    favorito: false,
    descripcion: 'Instalación de gas natural para cocina industrial',
    objetos: 15,
    calculos: 7
  },
  {
    id: 4,
    nombre: 'Climatización oficina',
    tipo: 'climatizacion',
    estado: 'borrador',
    progreso: 10,
    fechaCreacion: '2024-01-20',
    fechaModificacion: '2024-01-20',
    favorito: false,
    descripcion: 'Sistema de splits para oficina 150m²',
    objetos: 3,
    calculos: 1
  }
]

const PLANTILLAS = [
  {
    id: 't1',
    nombre: 'Calefacción estándar vivienda',
    descripcion: 'Caldera + radiadores + tuberías',
    icono: '🔥',
    objetos: 8
  },
  {
    id: 't2',
    nombre: 'ACS centralizada',
    descripcion: 'Depósito + caldera + puntos de consumo',
    icono: '💧',
    objetos: 6
  },
  {
    id: 't3',
    nombre: 'Instalación GLP',
    descripcion: 'Depósito + regulador + distribución',
    icono: '⛽',
    objetos: 10
  },
  {
    id: 't4',
    nombre: 'Climatización split',
    descripcion: 'Split + conductos + rejillas',
    icono: '❄️',
    objetos: 12
  }
]

export default function MisProyectos({ navigate }) {
  const [proyectos, setProyectos] = useState(PROYECTOS_EJEMPLO)
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [vista, setVista] = useState('grid')

  const proyectosFiltrados = useMemo(() => {
    return proyectos.filter(p => {
      const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                           p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      const matchFiltro = filtro === 'todos' || 
                         p.estado === filtro ||
                         p.tipo === filtro
      return matchBusqueda && matchFiltro
    })
  }, [proyectos, busqueda, filtro])

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'en_progreso': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'finalizado': return 'bg-green-100 text-green-700 border-green-200'
      case 'borrador': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'pausado': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'en_progreso': return 'En progreso'
      case 'finalizado': return 'Finalizado'
      case 'borrador': return 'Borrador'
      case 'pausado': return 'Pausado'
      default: return estado
    }
  }

  const handleNuevoProyecto = () => {
    alert('Crear nuevo proyecto - Por implementar')
  }

  const handleAbrirProyecto = (proyecto) => {
    alert(`Abrir proyecto: ${proyecto.nombre}`)
  }

  const handleDuplicar = (proyecto) => {
    const nuevo = {
      ...proyecto,
      id: Date.now(),
      nombre: `${proyecto.nombre} (copia)`,
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaModificacion: new Date().toISOString().split('T')[0],
      progreso: 0,
      estado: 'borrador'
    }
    setProyectos([...proyectos, nuevo])
  }

  const handleEliminar = (id) => {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      setProyectos(proyectos.filter(p => p.id !== id))
    }
  }

  const handleToggleFavorito = (id) => {
    setProyectos(proyectos.map(p => 
      p.id === id ? { ...p, favorito: !p.favorito } : p
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Mis Proyectos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona tus instalaciones y accede a plantillas
          </p>
        </div>
        <Button onClick={handleNuevoProyecto} icon={Plus}>
          Nuevo Proyecto
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar proyectos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="todos">Todos</option>
            <option value="en_progreso">En progreso</option>
            <option value="borrador">Borradores</option>
            <option value="finalizado">Finalizados</option>
            <option value="calefaccion">Calefacción</option>
            <option value="acs">ACS</option>
            <option value="gas">Gas</option>
            <option value="climatizacion">Climatización</option>
          </select>
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setVista('grid')}
              className={`px-3 py-2 ${vista === 'grid' ? 'bg-primary-500 text-white' : 'bg-white text-slate-600'}`}
            >
              <FolderOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVista('lista')}
              className={`px-3 py-2 ${vista === 'lista' ? 'bg-primary-500 text-white' : 'bg-white text-slate-600'}`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Plantillas rápidas */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Plantillas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANTILLAS.map(plantilla => (
            <motion.div
              key={plantilla.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-4 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all"
              onClick={() => alert(`Crear proyecto desde plantilla: ${plantilla.nombre}`)}
            >
              <div className="text-3xl mb-2">{plantilla.icono}</div>
              <h3 className="font-semibold text-slate-800 text-sm">{plantilla.nombre}</h3>
              <p className="text-xs text-slate-500 mt-1">{plantilla.descripcion}</p>
              <p className="text-xs text-slate-400 mt-2">{plantilla.objetos} objetos</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lista de proyectos */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          {filtro === 'todos' ? 'Todos los proyectos' : 
           filtro === 'en_progreso' ? 'En progreso' :
           filtro === 'borrador' ? 'Borradores' :
           filtro === 'finalizado' ? 'Finalizados' :
           'Proyectos filtrados'}
          <span className="text-sm font-normal text-slate-500 ml-2">
            ({proyectosFiltrados.length})
          </span>
        </h2>

        {vista === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proyectosFiltrados.map(proyecto => (
              <motion.div
                key={proyecto.id}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleAbrirProyecto(proyecto)}
              >
                <div className="p-5">
                  {/* Header del card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <HardHat className="w-5 h-5 text-primary-500" />
                      <h3 className="font-semibold text-slate-800">{proyecto.nombre}</h3>
                    </div>
                    <div className="relative group">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        className="p-1 hover:bg-slate-100 rounded"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* Descripción */}
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {proyecto.descripcion}
                  </p>

                  {/* Estado y favorito */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getEstadoColor(proyecto.estado)}`}>
                      {getEstadoLabel(proyecto.estado)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleFavorito(proyecto.id)
                      }}
                      className="ml-auto"
                    >
                      <Star 
                        className={`w-4 h-4 ${proyecto.favorito ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                      />
                    </button>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Progreso</span>
                      <span>{proyecto.progreso}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${proyecto.progreso}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <HardHat className="w-3 h-3" />
                      {proyecto.objetos} objetos
                    </span>
                    <span className="flex items-center gap-1">
                      <Calculator className="w-3 h-3" />
                      {proyecto.calculos} cálculos
                    </span>
                    <span className="flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3" />
                      {new Date(proyecto.fechaModificacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>

                {/* Acciones rápidas */}
                <div className="border-t border-slate-200 px-5 py-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDuplicar(proyecto)
                    }}
                    icon={Copy}
                  >
                    Duplicar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEliminar(proyecto.id)
                    }}
                    icon={Trash2}
                    className="text-red-600 hover:text-red-700"
                  >
                    Eliminar
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Progreso</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Modificado</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {proyectosFiltrados.map(proyecto => (
                  <tr
                    key={proyecto.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleAbrirProyecto(proyecto)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <HardHat className="w-4 h-4 text-primary-500" />
                        <div>
                          <p className="font-medium text-slate-800">{proyecto.nombre}</p>
                          <p className="text-xs text-slate-500">{proyecto.descripcion}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getEstadoColor(proyecto.estado)}`}>
                        {getEstadoLabel(proyecto.estado)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-primary-500 h-2 rounded-full"
                            style={{ width: `${proyecto.progreso}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{proyecto.progreso}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(proyecto.fechaModificacion).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleFavorito(proyecto.id)
                          }}
                          className="p-1 hover:bg-slate-100 rounded"
                        >
                          <Star 
                            className={`w-4 h-4 ${proyecto.favorito ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'}`}
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicar(proyecto)
                          }}
                          className="p-1 hover:bg-slate-100 rounded"
                        >
                          <Copy className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEliminar(proyecto.id)
                          }}
                          className="p-1 hover:bg-slate-100 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {proyectosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No se encontraron proyectos</p>
            <Button onClick={handleNuevoProyecto} className="mt-4" icon={<Plus size={16} />}>
              Crear primer proyecto
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}