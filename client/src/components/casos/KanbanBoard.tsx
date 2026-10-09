import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCasos } from '../../context/CasosContext'
import { useAuth } from '../../context/AuthContext'
import type { EstadoCaso, TipoCaso } from '../../types'
import CaseCard from './CaseCard'

const columns: { id: EstadoCaso; description: string; limit: number | null }[] = [
  { id: 'Pendiente', description: 'Nuevos casos', limit: null },
  { id: 'En análisis', description: 'Priorización y diagnóstico', limit: 3 },
  { id: 'En atención', description: 'Trabajo en curso', limit: 3 },
  { id: 'En validación', description: 'Confirmación del usuario', limit: 2 },
  { id: 'Cerrada', description: 'Casos resueltos', limit: null },
]

export default function KanbanBoard() {
  const { casos, tomarCaso } = useCasos()
  const { usuarioActual } = useAuth()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [tipo, setTipo] = useState<'Todos' | TipoCaso>('Todos')
  const visibles = useMemo(() => casos.filter((caso) => {
    const matchesType = tipo === 'Todos' || caso.tipo === tipo
    const text = `${caso.id} ${caso.titulo} ${caso.usuario_id}`.toLowerCase()
    return matchesType && text.includes(query.toLowerCase())
  }), [casos, query, tipo])
  const disponibles = useMemo(() => casos
    .filter((caso) => caso.estado === 'Pendiente' || caso.agente_id === null)
    .sort((a, b) => {
      const priorityOrder = { 'P1 urgente': 1, 'P2 normal': 2, 'P3 baja': 3 }
      return priorityOrder[a.prioridad] - priorityOrder[b.prioridad]
        || new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
    }), [casos])

  if (usuarioActual.rol === 'solicitante') {
    return <section className="access-page"><h2>Bandeja de soporte</h2><p>Esta vista es exclusiva para agentes de soporte y administradores.</p><a className="button-primary" href="/mis-casos">Ir a Mis Casos</a></section>
  }

  return (
    <>
      {searchParams.get('creado') && <div className="success-banner" role="status">Caso CH-{searchParams.get('creado')} registrado correctamente y agregado a Pendiente.</div>}
      <section className="page-intro">
        <div><div className="breadcrumb">Operación <span>/</span> Tablero Kanban</div><h2>Flujo de atención</h2><p>Visualiza y gestiona los casos activos de CampusHelp.</p></div>
        <div className="board-summary"><strong>{visibles.length}</strong><span>casos visibles</span><strong className="summary-expedite">{casos.filter((caso) => caso.expedite).length}</strong><span>expedite activo</span></div>
      </section>
      <aside className="scrum-alert"><span className="scrum-alert__icon">i</span><div><strong>Principio operativo ScrumBan</strong><p>Si una columna alcanza su WIP, no se debe iniciar una nueva tarea, sino ayudar a terminar o desbloquear el trabajo existente.</p></div></aside>
      <section className="queue-section">
        <div className="queue-heading"><div><h3>Bandeja disponible</h3><p>Casos pendientes o sin agente asignado, ordenados por prioridad y fecha.</p></div><span className="case-count">{disponibles.length} disponibles</span></div>
        {disponibles.length > 0 ? <div className="queue-list">{disponibles.map((caso) => <article className="queue-item" key={caso.id}><div className="queue-item-main"><span className="case-table-id">CH-{caso.id}</span><strong>{caso.titulo}</strong><span>{caso.tipo} · {caso.area}</span></div><span className={caso.prioridad === 'P1 urgente' ? 'queue-priority queue-priority--urgent' : 'queue-priority'}>{caso.prioridad}</span><span className="queue-date">{new Date(caso.fecha_creacion).toLocaleDateString('es-CO')}</span>{usuarioActual.rol === 'agente' && caso.agente_id === null && <button className="take-button" type="button" onClick={() => { try { tomarCaso(caso.id) } catch (error) { window.alert(error instanceof Error ? error.message : 'No fue posible asignarte el caso') } }}>Asignarme</button>}</article>)}</div> : <div className="queue-empty">No hay casos disponibles en este momento.</div>}
      </section>
      <div className="board-toolbar">
        <div className="board-label"><span className="board-label__dot" /> Tablero de casos <span className="live-label">EN VIVO</span></div>
        <div className="board-filters"><input aria-label="Buscar casos" placeholder="Buscar por ID, título o usuario..." value={query} onChange={(event) => setQuery(event.target.value)} /><select aria-label="Filtrar por tipo" value={tipo} onChange={(event) => setTipo(event.target.value as 'Todos' | TipoCaso)}><option>Todos</option><option>Incidente</option><option>Solicitud de servicio</option></select></div>
      </div>
      <div className="kanban-board">
        {columns.map((column) => {
          const cases = visibles.filter((caso) => caso.estado === column.id)
          const atLimit = column.limit !== null && cases.length >= column.limit
          return <section className={`kanban-column ${atLimit ? 'kanban-column--at-limit' : ''}`} key={column.id}>
            <header className="column-header"><div className="column-header__title"><span className="status-dot" /><h2>{column.id}</h2>{column.limit !== null && <span className="wip-count">{cases.length} / {column.limit}</span>}</div><p>{column.description}</p>{atLimit && <div className="wip-alert">! Límite WIP alcanzado</div>}</header>
            <div className="column-cards">{cases.length ? cases.map((caso) => <CaseCard key={caso.id} caso={caso} />) : <div className="empty-column"><span>✓</span><p>Sin casos en esta etapa</p></div>}</div>
          </section>
        })}
      </div>
    </>
  )
}
