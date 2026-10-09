import type { Caso, NuevoCaso } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

export async function listarCasos(): Promise<Caso[]> {
  const response = await fetch(`${API_URL}/casos`)
  if (!response.ok) throw new Error('No fue posible cargar los casos')
  return response.json() as Promise<Caso[]>
}

export async function crearCaso(caso: NuevoCaso): Promise<Caso> {
  const response = await fetch(`${API_URL}/casos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caso),
  })
  if (!response.ok) throw new Error('No fue posible registrar el caso')
  return response.json() as Promise<Caso>
}
