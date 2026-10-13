import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  asignarCaso,
  cambiarEstadoCaso,
  crearCaso,
  listarCasos,
  obtenerHistorial,
  registrarAtencion,
  validarCaso,
} from '../services/casosService'
import { useAuth } from './AuthContext'
import type { Caso, EstadoCaso, EventoHistorial, NuevoCaso } from '../types'

interface CasosContextValue {
  casos: Caso[]
  cargando: boolean
  error: string | null
  obtenerCasos: () => Promise<void>
  agregarCaso: (nuevoCaso: NuevoCaso) => Promise<Caso>
  asignarCaso: (id: number, agenteId: number) => Promise<void>
  actualizarEstadoCaso: (id: number, nuevoEstado: EstadoCaso) => Promise<void>
  registrarAtencion: (id: number, diagnostico: string, solucion: string) => Promise<void>
  validarCaso: (id: number, accion: 'aprobar' | 'devolver', comentario?: string) => Promise<void>
  obtenerHistorial: (casoId: number) => Promise<EventoHistorial[]>
  obtenerEstadosPermitidos: (caso: Caso) => EstadoCaso[]
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
  const [error, setError] = useState<string | null>(null)
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
    obtenerCasos()
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

  const obtenerEstadosPermitidos = (caso: Caso): EstadoCaso[] => {
    if (usuarioActual.rol === 'administrador') {
      return ['Pendiente', 'En análisis', 'En atención', 'En validación', 'Cerrada']
    }
    if (usuarioActual.rol === 'agente' && caso.agente_id === usuarioActual.id) {
      const siguientes = TRANSICIONES_VALIDAS[caso.estado]
      return siguientes ? [caso.estado, ...siguientes] : [caso.estado]
    }
    if (usuarioActual.rol === 'validador' && caso.estado === 'En validación') {
      return ['En validación', 'Cerrada', 'En atención']
    }
    return [caso.estado]
  }

  const value = useMemo<CasosContextValue>(() => ({
    casos,
    cargando,
    error,
    obtenerCasos,
    agregarCaso,
    asignarCaso: asignarCasoFn,
    actualizarEstadoCaso: actualizarEstadoCasoFn,
    registrarAtencion: registrarAtencionFn,
    validarCaso: validarCasoFn,
    obtenerHistorial: obtenerHistorialFn,
    obtenerEstadosPermitidos,
  }), [casos, cargando, error, usuarioActual])

  return <CasosContext.Provider value={value}>{children}</CasosContext.Provider>
}

export function useCasos() {
  const context = useContext(CasosContext)
  if (!context) throw new Error('useCasos debe utilizarse dentro de CasosProvider')
  return context
}
