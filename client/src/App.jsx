import { useMemo, useState } from 'react'
import KanbanColumn from './components/KanbanColumn'
import { columns, mockCases } from './data/cases'

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 5 5" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  )
}

function BoardIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="4" y="4" width="6" height="16" rx="1" />
      <rect x="14" y="4" width="6" height="10" rx="1" />
    </svg>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('Todos')

  const filteredCases = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return mockCases.filter((caseItem) => {
      const matchesType = typeFilter === 'Todos' || caseItem.tipo === typeFilter
      const matchesQuery =
        !normalizedQuery ||
        [caseItem.id, caseItem.titulo ?? caseItem.title, caseItem.usuario_id ?? caseItem.userId].some((value) =>
          String(value).toLowerCase().includes(normalizedQuery),
        )
      return matchesType && matchesQuery
    })
  }, [query, typeFilter])

  const totalCases = filteredCases.length
  const expediteCount = mockCases.filter((caseItem) => caseItem.expedite).length

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <BoardIcon />
          </div>
          <div>
            <p className="eyebrow">Mesa de servicios TI</p>
            <h1>CampusHelp <span>-</span> Bandeja de Casos</h1>
          </div>
        </div>
        <div className="header-actions">
          <label className="search-box">
            <SearchIcon />
            <span className="sr-only">Buscar casos</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por ID, título o usuario..."
              type="search"
            />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda">×</button>}
          </label>
          <div className="filter-wrap">
            <FilterIcon />
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filtrar por tipo">
              <option>Todos</option>
              <option>Incidente</option>
              <option>Solicitud</option>
            </select>
          </div>
          <button className="notification-button" type="button" aria-label="Notificaciones">
            <span className="notification-dot" />
            <span aria-hidden="true">♢</span>
          </button>
          <div className="profile" aria-label="Perfil de Carlos Agente">
            <span className="profile-avatar">CA</span>
            <span className="profile-name">Carlos Agente</span>
            <span className="profile-chevron">⌄</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="page-intro">
          <div>
            <div className="breadcrumb">Operación <span>/</span> Tablero Kanban</div>
            <h2>Flujo de atención</h2>
            <p>Visualiza y gestiona los casos activos de CampusHelp.</p>
          </div>
          <div className="board-summary">
            <div><strong>{totalCases}</strong><span>casos visibles</span></div>
            <div className="summary-divider" />
            <div><strong className="summary-expedite">{expediteCount}</strong><span>expedite activo</span></div>
          </div>
        </section>

        <aside className="scrum-alert">
          <span className="scrum-alert__icon" aria-hidden="true">i</span>
          <div>
            <strong>Principio operativo ScrumBan</strong>
            <p>Si una columna alcanza su WIP, no se debe iniciar una nueva tarea, sino ayudar a terminar o desbloquear el trabajo existente.</p>
          </div>
        </aside>

        <section className="board-toolbar">
          <div className="board-label"><span className="board-label__dot" /> Tablero de casos <span className="live-label">EN VIVO</span></div>
          <div className="legend">
            <span><i className="legend-dot legend-dot--incident" /> Incidente</span>
            <span><i className="legend-dot legend-dot--request" /> Solicitud</span>
            <span><i className="legend-dot legend-dot--expedite" /> Expedite</span>
          </div>
        </section>

        <div className="kanban-board">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              cases={filteredCases.filter((caseItem) => (caseItem.estado ?? caseItem.status) === column.id)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
