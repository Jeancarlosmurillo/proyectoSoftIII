import type { Area, Atencion, Caso, Categoria, EstadoCaso, EventoHistorial, Indicadores, NuevoCaso } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

async function manejarError(response: Response): Promise<never> {
  const data = await response.json().catch(() => ({}))
  throw new Error(data.mensaje ?? `Error ${response.status}`)
}

export async function listarCasos(filtros?: {
  usuario_id?: number
  estado?: EstadoCaso
  tipo?: string
  prioridad?: string
  area_id?: number
  categoria_id?: number
}): Promise<Caso[]> {
  const params = new URLSearchParams()
  if (filtros?.usuario_id) params.set('usuario_id', String(filtros.usuario_id))
  if (filtros?.estado) params.set('estado', filtros.estado)
  if (filtros?.tipo) params.set('tipo', filtros.tipo)
  if (filtros?.prioridad) params.set('prioridad', filtros.prioridad)
  if (filtros?.area_id) params.set('area_id', String(filtros.area_id))
  if (filtros?.categoria_id) params.set('categoria_id', String(filtros.categoria_id))

  const query = params.toString()
  const response = await fetch(`${API_URL}/casos${query ? `?${query}` : ''}`)
  if (!response.ok) await manejarError(response)
  return response.json() as Promise<Caso[]>
}

export async function crearCaso(caso: NuevoCaso): Promise<Caso> {
  const response = await fetch(`${API_URL}/casos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caso),
  })
  if (!response.ok) await manejarError(response)
  return response.json() as Promise<Caso>
}

export async function obtenerCaso(id: number): Promise<Caso> {
  const response = await fetch(`${API_URL}/casos/${id}`)
  if (!response.ok) await manejarError(response)
  return response.json() as Promise<Caso>
}

export async function obtenerHistorial(casoId: number): Promise<EventoHistorial[]> {
  const response = await fetch(`${API_URL}/casos/${casoId}/historial`)
  if (!response.ok) await manejarError(response)
  return response.json() as Promise<EventoHistorial[]>
}

export async function asignarCaso(casoId: number, usuarioId: number): Promise<Caso> {
  const response = await fetch(`${API_URL}/casos/${casoId}/asignar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id: usuarioId }),
  })
  if (!response.ok) await manejarError(response)
  return response.json() as Promise<Caso>
}

export async function registrarAtencion(
  casoId: number,
  diagnostico: string,
  solucion: string,
  usuarioId: number
): Promise<Atencion> {
  const response = await fetch(`${API_URL}/casos/${casoId}/atencion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ diagnostico, solucion, usuario_id: usuarioId }),
  })
  if (!response.ok) await manejarError(response)
  return response.json() as Promise<Atencion>
}

export async function validarCaso(
  casoId: number,
  accion: 'aprobar' | 'devolver',
  usuarioId: number,
  comentario?: string
): Promise<Caso> {
  const response = await fetch(`${API_URL}/casos/${casoId}/validacion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accion, comentario, usuario_id: usuarioId }),
  })
  if (!response.ok) await manejarError(response)
  return response.json() as Promise<Caso>
}

export async function cambiarEstadoCaso(
  casoId: number,
  nuevoEstado: EstadoCaso,
  usuarioId: number
): Promise<Caso> {
  const response = await fetch(`${API_URL}/casos/${casoId}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado: nuevoEstado, usuario_id: usuarioId }),
  })
  if (!response.ok) await manejarError(response)
  return response.json() as Promise<Caso>
}

export async function listarAreas(): Promise<Area[]> {
  const response = await fetch(`${API_URL}/areas`)
  if (!response.ok) await manejarError(response)
  return response.json() as Promise<Area[]>
}

export async function listarCategorias(areaId?: number): Promise<Categoria[]> {
  const query = areaId ? `?area_id=${areaId}` : ''
  const response = await fetch(`${API_URL}/categorias${query}`)
  if (!response.ok) await manejarError(response)
  return response.json() as Promise<Categoria[]>
}

export async function crearCategoria(
  nombre: string,
  descripcion: string,
  areaId: number,
  usuarioId: number
): Promise<Categoria> {
  const response = await fetch(`${API_URL}/categorias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, descripcion, area_id: areaId, usuario_id: usuarioId }),
  })
  if (!response.ok) await manejarError(response)
  return response.json() as Promise<Categoria>
}

export async function editarCategoria(
  id: number,
  cambios: { nombre?: string; descripcion?: string; area_id?: number },
  usuarioId: number
): Promise<Categoria> {
  const response = await fetch(`${API_URL}/categorias/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...cambios, usuario_id: usuarioId }),
  })
  if (!response.ok) await manejarError(response)
  return response.json() as Promise<Categoria>
}

export async function activarCategoria(
  id: number,
  activa: boolean,
  usuarioId: number
): Promise<Categoria> {
  const response = await fetch(`${API_URL}/categorias/${id}/activar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activa, usuario_id: usuarioId }),
  })
  if (!response.ok) await manejarError(response)
  return response.json() as Promise<Categoria>
}

export async function listarIndicadores(): Promise<Indicadores> {
  const response = await fetch(`${API_URL}/indicadores`)
  if (!response.ok) await manejarError(response)
  return response.json() as Promise<Indicadores>
}
