import type { Caso, NuevoCaso } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

const areasPorCategoria: Record<number, Caso['area']> = {
  1: 'Hardware', 2: 'Hardware', 3: 'Hardware',
  4: 'Software', 5: 'Software', 6: 'Software',
  7: 'Red y conectividad', 8: 'Red y conectividad', 9: 'Red y conectividad',
  10: 'Cuentas y acceso', 11: 'Cuentas y acceso', 12: 'Cuentas y acceso', 13: 'Cuentas y acceso',
  15: 'Plataformas académicas', 16: 'Plataformas académicas',
}

function normalizarCaso(caso: Record<string, unknown>): Caso {
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

export async function listarCasos(): Promise<Caso[]> {
  const response = await fetch(`${API_URL}/casos`)
  if (!response.ok) throw new Error('No fue posible cargar los casos')
  const casos = await response.json() as Record<string, unknown>[]
  return casos.map(normalizarCaso)
}

export async function crearCaso(caso: NuevoCaso): Promise<Caso> {
  const response = await fetch(`${API_URL}/casos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prepararCaso(caso)),
  })
  if (!response.ok) throw new Error('No fue posible registrar el caso')
  return normalizarCaso(await response.json() as Record<string, unknown>)
}
