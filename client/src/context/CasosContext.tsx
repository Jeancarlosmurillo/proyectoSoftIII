import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { actualizarCaso, asignarCaso as asignarCasoApi, cambiarEstado, crearCaso, desasignarCaso as desasignarCasoApi, eliminarCaso as eliminarCasoApi, listarCasos, obtenerHistorial as obtenerHistorialApi, registrarAnalisis, registrarAtencion } from '../services/casosService'
import { useAuth } from './AuthContext'
import type { Caso, EstadoCaso, EventoHistorial, NuevoCaso } from '../types'

interface CasosContextValue {
  casos: Caso[]
  cargando: boolean
  errorCarga: string
  obtenerCasos: () => Caso[]
  agregarCaso: (nuevoCaso: NuevoCaso) => Promise<Caso>
  editarCaso: (id: number, cambios: CambiosCaso) => Promise<void>
  eliminarCaso: (id: number) => Promise<void>
  asignarCaso: (id: number, agenteId: number | null) => Promise<void>
  tomarCaso: (id: number) => Promise<void>
  obtenerHistorial: (casoId: number) => Promise<EventoHistorial[]>
  obtenerEstadosPermitidos: (id: number) => EstadoCaso[]
  actualizarEstadoCaso: (id: number, nuevoEstado: EstadoCaso) => Promise<void>
  registrarAnalisis: (id: number, diagnostico: string, abordaje: string) => Promise<void>
  registrarAtencion: (id: number, diagnostico: string, solucion: string) => Promise<void>
}

const CasosContext = createContext<CasosContextValue | undefined>(undefined)

const TRANSICIONES_VALIDAS: Record<EstadoCaso, EstadoCaso[]> = {
  'Pendiente': ['En análisis'],
  'En análisis': ['En atención'],
  'En atención': ['En validación'],
  'En validación': ['Cerrada', 'En atención'],
  'Cerrada': [],
}

export function CasosProvider({ children }: { children: ReactNode }) {
  const [casos, setCasos] = useState<Caso[]>([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const { usuarioActual } = useAuth()

  const obtenerCasos = async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await listarCasos()
      setCasos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar los casos')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    listarCasos()
      .then(setCasos)
      .catch((error) => {
        setCasos([])
        setErrorCarga(error instanceof Error ? error.message : 'No fue posible cargar los casos')
      })
      .finally(() => setCargando(false))
  }, [])

  const agregarCaso = async (nuevoCaso: NuevoCaso): Promise<Caso> => {
    const caso = await crearCaso(nuevoCaso)
    setCasos((actuales) => [caso, ...actuales])
    return caso
  }

  const asignarCasoFn = async (id: number, agenteId: number) => {
    const casoActualizado = await asignarCaso(id, agenteId)
    setCasos((actuales) => actuales.map((c) => (c.id === id ? casoActualizado : c)))
  }

  const actualizarEstadoCasoFn = async (id: number, nuevoEstado: EstadoCaso) => {
    const casoActualizado = await cambiarEstadoCaso(id, nuevoEstado, usuarioActual.id)
    setCasos((actuales) => actuales.map((c) => (c.id === id ? casoActualizado : c)))
  }

  const registrarAtencionFn = async (id: number, diagnostico: string, solucion: string) => {
    await registrarAtencion(id, diagnostico, solucion, usuarioActual.id)
    await obtenerCasos()
  }

  const validarCasoFn = async (id: number, accion: 'aprobar' | 'devolver', comentario?: string) => {
    const casoActualizado = await validarCaso(id, accion, usuarioActual.id, comentario)
    setCasos((actuales) => actuales.map((c) => (c.id === id ? casoActualizado : c)))
  }

  const obtenerHistorialFn = async (casoId: number): Promise<EventoHistorial[]> => {
    return obtenerHistorial(casoId)
  }

  const estadosPermitidos = (caso: Caso): EstadoCaso[] => {
    if (usuarioActual.rol === 'administrador') return ['Pendiente', 'En análisis', 'En atención', 'En validación', 'Cerrada']
    if (usuarioActual.rol !== 'agente' || caso.agente_id !== usuarioActual.id) return [caso.estado]
    const siguiente: Partial<Record<EstadoCaso, EstadoCaso>> = {
      Pendiente: 'En análisis',
      'En análisis': 'En atención',
      'En atención': 'En validación',
      'En validación': 'Cerrada',
    }
    const estadoSiguiente = siguiente[caso.estado]
    if (caso.estado === 'En análisis' || caso.estado === 'En atención') return [caso.estado]
    return estadoSiguiente ? [caso.estado, estadoSiguiente] : [caso.estado]
  }

  const value = useMemo<CasosContextValue>(() => ({
    casos,
    cargando,
    errorCarga,
    obtenerCasos: () => casos,
    agregarCaso: async (nuevoCaso) => {
      const caso = await crearCaso(nuevoCaso)
      setCasos((actuales) => [caso, ...actuales])
      return caso
    },
    editarCaso: async (id, cambios) => {
      exigirAdministrador()
      if (!casos.some((caso) => caso.id === id)) throw new Error('El caso que intenta editar no existe')
      const actualizado = await actualizarCaso(id, cambios, usuarioActual.id)
      setCasos((actuales) => actuales.map((caso) => caso.id === id ? actualizado : caso))
    },
    eliminarCaso: async (id) => {
      exigirAdministrador()
      if (!casos.some((caso) => caso.id === id)) throw new Error('El caso que intenta eliminar no existe')
      await eliminarCasoApi(id, usuarioActual.id)
      setCasos((actuales) => actuales.filter((caso) => caso.id !== id))
    },
    asignarCaso: async (id, agenteId) => {
      exigirAdministrador()
      const actualizado = agenteId === null
        ? await desasignarCasoApi(id, usuarioActual.id)
        : await asignarCasoApi(id, agenteId)
      setCasos((actuales) => actuales.map((caso) => caso.id === id ? actualizado : caso))
    },
    tomarCaso: async (id) => {
      if (usuarioActual.rol !== 'agente') throw new Error('Solo un agente puede tomar casos de la bandeja')
      const caso = casos.find((item) => item.id === id)
      if (!caso) throw new Error('El caso que intenta tomar no existe')
      if (caso.agente_id !== null) throw new Error('Este caso ya fue tomado por otro agente')
      if (casos.filter((item) => item.estado === 'En análisis').length >= 3) {
        throw new Error('El límite WIP de En análisis fue alcanzado')
      }
      const actualizado = await asignarCasoApi(id, usuarioActual.id)
      setCasos((actuales) => actuales.map((item) => item.id === id ? actualizado : item))
    },
    actualizarEstadoCaso: async (id, nuevoEstado) => {
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
      const actualizado = await cambiarEstado(id, nuevoEstado, usuarioActual.id)
      setCasos((actuales) => actuales.map((item) => item.id === id ? actualizado : item))
    },
    registrarAnalisis: async (id, diagnostico, abordaje) => {
      const actualizado = await registrarAnalisis(id, diagnostico, abordaje, usuarioActual.id)
      setCasos((actuales) => actuales.map((item) => item.id === id ? actualizado : item))
    },
    registrarAtencion: async (id, diagnostico, solucion) => {
      const actualizado = await registrarAtencion(id, diagnostico, solucion, usuarioActual.id)
      setCasos((actuales) => actuales.map((item) => item.id === id ? actualizado : item))
    },
    obtenerHistorial: (casoId) => obtenerHistorialApi(casoId),
    obtenerEstadosPermitidos: (id) => {
      const caso = casos.find((item) => item.id === id)
      return caso ? estadosPermitidos(caso) : []
    },
  }), [casos, cargando, errorCarga, usuarioActual])

  return <CasosContext.Provider value={value}>{children}</CasosContext.Provider>
}

export function useCasos() {
  const context = useContext(CasosContext)
  if (!context) throw new Error('useCasos debe utilizarse dentro de CasosProvider')
  return context
}
