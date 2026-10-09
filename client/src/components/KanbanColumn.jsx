import CaseCard from './CaseCard'

export default function KanbanColumn({ column, cases }) {
  const isAtLimit = column.limit !== null && cases.length >= column.limit

  return (
    <section className={`kanban-column ${isAtLimit ? 'kanban-column--at-limit' : ''}`}>
      <header className="column-header">
        <div className="column-header__title">
          <span className="status-dot" aria-hidden="true" />
          <h2>{column.title}</h2>
          {column.limit !== null && (
            <span className="wip-count" aria-label={`${cases.length} de ${column.limit} casos`}>
              {cases.length} / {column.limit}
            </span>
          )}
        </div>
        <p>{column.description}</p>
        {isAtLimit && (
          <div className="wip-alert" role="status">
            <span aria-hidden="true">!</span> Límite WIP alcanzado
          </div>
        )}
      </header>
      <div className="column-cards">
        {cases.length > 0 ? (
          cases.map((caseItem) => <CaseCard key={caseItem.id} caseItem={caseItem} />)
        ) : (
          <div className="empty-column">
            <span aria-hidden="true">✓</span>
            <p>Sin casos en esta etapa</p>
          </div>
        )}
      </div>
    </section>
  )
}
