import type { CambiosCaso, Caso, DetalleCaso, EstadoCaso, EventoHistorial, NuevoCaso } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

function normalizarCaso(caso: Record<string, unknown>, areasPorCategoria: Record<number, Caso['area']>): Caso {
  return {
    ...caso,
    tipo: caso.tipo === 'Solicitud' ? 'Solicitud de servicio' : caso.tipo,
    prioridad: caso.prioridad === 'P1' ? 'P1 urgente' : caso.prioridad === 'P2' ? 'P2 normal' : 'P3 baja',
    area: areasPorCategoria[Number(caso.categoria_id)] ?? 'Hardware',
  } as Caso
}

function prepararCaso(caso: NuevoCaso) {
  return {
    ...caso,
    tipo: caso.tipo === 'Solicitud de servicio' ? 'Solicitud' : caso.tipo,
    prioridad: caso.prioridad.split(' ')[0],
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { mensaje?: string; error?: string } | null
    throw new Error(body?.mensaje ?? body?.error ?? `La solicitud falló (${response.status})`)
  }
  return response.json() as Promise<T>
}

async function catalogo() {
  const [categorias, areas] = await Promise.all([
    request<{ id: number; area_id: number }[]>('/categorias'),
    request<{ id: number; nombre: Caso['area'] }[]>('/areas'),
  ])
  const areasPorId = Object.fromEntries(areas.map((area) => [area.id, area.nombre]))
  return Object.fromEntries(categorias.map((categoria) => [categoria.id, areasPorId[categoria.area_id]])) as Record<number, Caso['area']>
}

export async function listarCasos(): Promise<Caso[]> {
  const response = await fetch(`${API_URL}/casos`)
  if (!response.ok) throw new Error('No fue posible cargar los casos')
  const casos = await response.json() as Record<string, unknown>[]
  const [categoriasResponse, areasResponse] = await Promise.all([
    fetch(`${API_URL}/categorias`),
    fetch(`${API_URL}/areas`),
  ])
  if (!categoriasResponse.ok || !areasResponse.ok) throw new Error('No fue posible cargar el catálogo')
  const categorias = await categoriasResponse.json() as { id: number; area_id: number }[]
  const areas = await areasResponse.json() as { id: number; nombre: Caso['area'] }[]
  const areasPorId = Object.fromEntries(areas.map((area) => [area.id, area.nombre]))
  const areasPorCategoria = Object.fromEntries(
    categorias.map((categoria) => [categoria.id, areasPorId[categoria.area_id]]),
  ) as Record<number, Caso['area']>
  return casos.map((caso) => normalizarCaso(caso, areasPorCategoria))
}

export async function crearCaso(caso: NuevoCaso): Promise<Caso> {
  const creado = await request<Record<string, unknown>>('/casos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prepararCaso(caso)),
  })
  return normalizarCaso(creado, await catalogo())
}

export async function actualizarCaso(id: number, cambios: CambiosCaso, usuario_id: number): Promise<Caso> {
  const actualizado = await request<Record<string, unknown>>(`/casos/${id}`, { method: 'PATCH', body: JSON.stringify({ ...prepararCambios(cambios), actor_id: usuario_id }) })
  return normalizarCaso(actualizado, await catalogo())
}

function prepararCambios(cambios: CambiosCaso) {
  return {
    ...cambios,
    ...(cambios.tipo ? { tipo: cambios.tipo === 'Solicitud de servicio' ? 'Solicitud' : cambios.tipo } : {}),
    ...(cambios.prioridad ? { prioridad: cambios.prioridad.split(' ')[0] } : {}),
  }
}

export async function eliminarCaso(id: number, usuario_id: number): Promise<void> {
  await request(`/casos/${id}`, { method: 'DELETE', body: JSON.stringify({ usuario_id }) })
}

export async function asignarCaso(id: number, usuario_id: number): Promise<Caso> {
  const actualizado = await request<Record<string, unknown>>(`/casos/${id}/asignar`, { method: 'POST', body: JSON.stringify({ usuario_id }) })
  return normalizarCaso(actualizado, await catalogo())
}

export async function desasignarCaso(id: number, usuario_id: number): Promise<Caso> {
  const actualizado = await request<Record<string, unknown>>(`/casos/${id}/desasignar`, { method: 'POST', body: JSON.stringify({ usuario_id }) })
  return normalizarCaso(actualizado, await catalogo())
}

export async function cambiarEstado(id: number, estado: EstadoCaso, usuario_id: number): Promise<Caso> {
  const actualizado = await request<Record<string, unknown>>(`/casos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado, usuario_id }) })
  return normalizarCaso(actualizado, await catalogo())
}

export async function registrarAtencion(id: number, diagnostico: string, solucion: string, usuario_id: number): Promise<Caso> {
  const actualizado = await request<Record<string, unknown>>(`/casos/${id}/atencion`, { method: 'POST', body: JSON.stringify({ diagnostico, solucion, usuario_id }) })
  return normalizarCaso(actualizado, await catalogo())
}

export async function registrarAnalisis(id: number, diagnostico: string, abordaje: string, usuario_id: number): Promise<Caso> {
  const actualizado = await request<Record<string, unknown>>(`/casos/${id}/analisis`, {
    method: 'POST',
    body: JSON.stringify({ diagnostico, abordaje, usuario_id }),
  })
  return normalizarCaso(actualizado, await catalogo())
}

export async function validarCaso(id: number, accion: 'aprobar' | 'devolver', comentario: string, usuario_id: number): Promise<Caso> {
  const actualizado = await request<Record<string, unknown>>(`/casos/${id}/validacion`, { method: 'POST', body: JSON.stringify({ accion, comentario, usuario_id }) })
  return normalizarCaso(actualizado, await catalogo())
}

export function obtenerHistorial(id: number) {
  return request<EventoHistorial[]>(`/casos/${id}/historial`)
}
