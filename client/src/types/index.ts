export type EstadoCaso =
  | 'Pendiente'
  | 'En análisis'
  | 'En atención'
  | 'En validación'
  | 'Cerrada'

export type TipoCaso = 'Incidente' | 'Solicitud'
export type AreaTI =
  | 'Hardware'
  | 'Software'
  | 'Red y conectividad'
  | 'Cuentas y acceso'
  | 'Plataformas académicas'
export type Prioridad = 'P1' | 'P2' | 'P3'
export type RolUsuario = 'solicitante' | 'agente' | 'validador' | 'administrador'
export type TipoSolicitante = 'Estudiante' | 'Docente' | 'Personal administrativo'

export interface UsuarioSesion {
  id: number
  nombre: string
  rol: RolUsuario
  tipo?: TipoSolicitante
}

export interface Area {
  id: number
  nombre: string
  descripcion: string
  activa: boolean
}

export interface Categoria {
  id: number
  area_id: number
  nombre: string
  descripcion: string
  activa: boolean
}

export interface Atencion {
  id: number
  caso_id: number
  diagnostico: string
  solucion: string
  fecha: string
  agente_id: number
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
  atencion?: Atencion
}

export type TipoEventoHistorial = 'Caso creado' | 'Agente asignado' | 'Cambio de estado' | 'Validación aprobada' | 'Validación devuelta'

export interface EventoHistorial {
  id: number
  caso_id: number
  evento: TipoEventoHistorial
  estado_anterior?: EstadoCaso
  estado_nuevo?: EstadoCaso
  usuario_id: number
  fecha: string
}

export interface NuevoCaso {
  tipo: TipoCaso
  titulo: string
  descripcion: string
  prioridad: Prioridad
  usuario_id: number
  categoria_id: number
}

export interface Indicadores {
  casos_por_estado: { estado: string; total: string }[]
  casos_por_tipo: { tipo: string; total: string }[]
  casos_por_prioridad: { prioridad: string; total: string }[]
  tiempo_promedio_atencion_horas: number | null
  tiempo_promedio_asignacion_horas: number | null
}
