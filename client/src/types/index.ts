export type EstadoCaso =
  | 'Pendiente'
  | 'En análisis'
  | 'En atención'
  | 'En validación'
  | 'Cerrada'

export type TipoCaso = 'Incidente' | 'Solicitud de servicio'
export type AreaTI =
  | 'Hardware'
  | 'Software'
  | 'Red y conectividad'
  | 'Cuentas y acceso'
  | 'Plataformas académicas'
export type Prioridad = 'P1 urgente' | 'P2 normal' | 'P3 baja'
export type RolUsuario = 'solicitante' | 'agente' | 'administrador'
export type TipoSolicitante = 'Estudiante' | 'Docente' | 'Personal administrativo'

export interface UsuarioSesion {
  id: number
  nombre: string
  rol: RolUsuario
  tipo?: TipoSolicitante
}

export interface Caso {
  id: number
  tipo: TipoCaso
  titulo: string
  descripcion: string
  prioridad: Prioridad
  estado: EstadoCaso
  usuario_id: number
  categoria_id: number
  agente_id: number | null
  fecha_creacion: string
  fecha_asignacion: string | null
  fecha_cierre: string | null
  area: AreaTI
  expedite?: boolean
}

export type TipoEventoHistorial = 'Caso creado' | 'Caso asignado' | 'Cambio de estado' | 'Caso editado' | 'Caso eliminado'

export interface EventoHistorial {
  id: number
  caso_id: number
  evento: TipoEventoHistorial
  estado_anterior?: EstadoCaso
  estado_nuevo?: EstadoCaso
  usuario_id: number
  fecha: string
  detalle?: string
}

export interface NuevoCaso {
  tipo: TipoCaso
  titulo: string
  descripcion: string
  prioridad: Prioridad
  usuario_id: number
  categoria_id: number
  area: AreaTI
}

export type CambiosCaso = Partial<Pick<Caso, 'tipo' | 'titulo' | 'descripcion' | 'prioridad' | 'usuario_id' | 'categoria_id' | 'area' | 'agente_id' | 'expedite'>>
