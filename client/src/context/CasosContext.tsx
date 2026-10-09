import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { casosMock } from '../data/casos.mock'
import { useAuth } from './AuthContext'
import type { CambiosCaso, Caso, EstadoCaso, EventoHistorial, NuevoCaso } from '../types'

interface CasosContextValue {
  casos: Caso[]
  obtenerCasos: () => Caso[]
  agregarCaso: (nuevoCaso: NuevoCaso) => Caso
  editarCaso: (id: number, cambios: CambiosCaso) => void
  eliminarCaso: (id: number) => void
  asignarCaso: (id: number, agenteId: number | null) => void
  tomarCaso: (id: number) => void
  obtenerHistorial: (casoId: number) => EventoHistorial[]
  obtenerEstadosPermitidos: (id: number) => EstadoCaso[]
  actualizarEstadoCaso: (id: number, nuevoEstado: EstadoCaso) => void
}

const CasosContext = createContext<CasosContextValue | undefined>(undefined)

export function CasosProvider({ children }: { children: ReactNode }) {
  const [casos, setCasos] = useState<Caso[]>(casosMock)
  const [historial, setHistorial] = useState<EventoHistorial[]>([])
  const { usuarioActual } = useAuth()
  const exigirAdministrador = () => {
    if (usuarioActual.rol !== 'administrador') throw new Error('Solo un administrador puede realizar esta acción')
  }

  const puedeActualizar = (caso: Caso, nuevoEstado: EstadoCaso) => {
    if (usuarioActual.rol === 'administrador') return true
    if (usuarioActual.rol === 'agente') {
      return (
        caso.agente_id === usuarioActual.id &&
        (
          (caso.estado === 'Pendiente' && nuevoEstado === 'En análisis')
          || (caso.estado === 'En análisis' && nuevoEstado === 'En atención')
          || (caso.estado === 'En atención' && nuevoEstado === 'En validación')
          || (caso.estado === 'En validación' && nuevoEstado === 'Cerrada')
        )
      )
    }
    return false
  }

  const estadosPermitidos = (caso: Caso): EstadoCaso[] => {
    if (usuarioActual.rol === 'administrador') {
      return ['Pendiente', 'En análisis', 'En atención', 'En validación', 'Cerrada']
    }
    if (usuarioActual.rol !== 'agente' || caso.agente_id !== usuarioActual.id) return [caso.estado]
    const siguiente: Partial<Record<EstadoCaso, EstadoCaso>> = {
      Pendiente: 'En análisis',
      'En análisis': 'En atención',
      'En atención': 'En validación',
      'En validación': 'Cerrada',
    }
    const estadoSiguiente = siguiente[caso.estado]
    return estadoSiguiente ? [caso.estado, estadoSiguiente] : [caso.estado]
  }

  const value = useMemo<CasosContextValue>(() => ({
    casos,
    obtenerCasos: () => casos,
    agregarCaso: (nuevoCaso) => {
      const caso: Caso = {
        ...nuevoCaso,
        id: Math.max(0, ...casos.map((item) => item.id)) + 1,
        estado: 'Pendiente',
        agente_id: null,
        fecha_creacion: new Date().toISOString(),
        fecha_asignacion: null,
        fecha_cierre: null,
      }
      setCasos((actuales) => [caso, ...actuales])
      return caso
    },
    editarCaso: (id, cambios) => {
      exigirAdministrador()
      if (!casos.some((caso) => caso.id === id)) throw new Error('El caso que intenta editar no existe')
      setCasos((actuales) => actuales.map((caso) => caso.id === id ? { ...caso, ...cambios } : caso))
    },
    eliminarCaso: (id) => {
      exigirAdministrador()
      if (!casos.some((caso) => caso.id === id)) throw new Error('El caso que intenta eliminar no existe')
      setCasos((actuales) => actuales.filter((caso) => caso.id !== id))
    },
    asignarCaso: (id, agenteId) => {
      exigirAdministrador()
      setCasos((actuales) => actuales.map((caso) => caso.id === id ? {
        ...caso,
        agente_id: agenteId,
        fecha_asignacion: agenteId ? (caso.fecha_asignacion ?? new Date().toISOString()) : null,
      } : caso))
    },
    tomarCaso: (id) => {
      if (usuarioActual.rol !== 'agente') throw new Error('Solo un agente puede tomar casos de la bandeja')
      const caso = casos.find((item) => item.id === id)
      if (!caso) throw new Error('El caso que intenta tomar no existe')
      if (caso.agente_id !== null) throw new Error('Este caso ya fue tomado por otro agente')
      if (casos.filter((item) => item.estado === 'En análisis').length >= 3) {
        throw new Error('El límite WIP de En análisis fue alcanzado')
      }
      const fechaAsignacion = new Date().toISOString()
      setCasos((actuales) => actuales.map((item) => item.id === id ? {
        ...item,
        agente_id: usuarioActual.id,
        estado: 'En análisis',
        fecha_asignacion: fechaAsignacion,
      } : item))
      setHistorial((actuales) => [{
        id: actuales.length + 1,
        caso_id: id,
        evento: 'Caso asignado',
        estado_anterior: caso.estado,
        estado_nuevo: 'En análisis',
        usuario_id: usuarioActual.id,
        fecha: fechaAsignacion,
        detalle: `Caso asignado a ${usuarioActual.nombre}`,
      }, ...actuales])
    },
    actualizarEstadoCaso: (id, nuevoEstado) => {
      const caso = casos.find((item) => item.id === id)
      if (!caso) throw new Error('El caso que intenta actualizar no existe')
      if (caso.estado === nuevoEstado) return
      if (!puedeActualizar(caso, nuevoEstado)) {
        throw new Error(`El rol ${usuarioActual.rol} no puede cambiar ${caso.estado} a ${nuevoEstado}`)
      }
      const casosEnDestino = casos.filter((item) => item.estado === nuevoEstado).length
      const limitesWip: Partial<Record<EstadoCaso, number>> = {
        'En análisis': 3,
        'En atención': 3,
        'En validación': 2,
      }
      if (limitesWip[nuevoEstado] !== undefined && casosEnDestino >= limitesWip[nuevoEstado] && caso.estado !== nuevoEstado) {
        throw new Error(`No se puede avanzar el caso: el límite WIP de ${nuevoEstado} fue alcanzado`)
      }
      const fecha = new Date().toISOString()
      setCasos((actuales) => actuales.map((caso) => caso.id === id ? {
        ...caso,
        estado: nuevoEstado,
        fecha_cierre: nuevoEstado === 'Cerrada' ? new Date().toISOString() : caso.fecha_cierre,
      } : caso))
      setHistorial((actuales) => [{
        id: actuales.length + 1,
        caso_id: id,
        evento: 'Cambio de estado',
        estado_anterior: caso.estado,
        estado_nuevo: nuevoEstado,
        usuario_id: usuarioActual.id,
        fecha,
        detalle: `${usuarioActual.nombre} cambió el estado de ${caso.estado} a ${nuevoEstado}`,
      }, ...actuales])
    },
    obtenerHistorial: (casoId) => historial.filter((evento) => evento.caso_id === casoId),
    obtenerEstadosPermitidos: (id) => {
      const caso = casos.find((item) => item.id === id)
      return caso ? estadosPermitidos(caso) : []
    },
  }), [casos, historial, usuarioActual])

  return <CasosContext.Provider value={value}>{children}</CasosContext.Provider>
}

export function useCasos() {
  const context = useContext(CasosContext)
  if (!context) throw new Error('useCasos debe utilizarse dentro de CasosProvider')
  return context
}
