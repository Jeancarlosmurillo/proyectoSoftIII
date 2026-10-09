const typeLabels = {
  Incidente: 'Incidente',
  Solicitud: 'Solicitud de servicio',
}

function CaseIcon({ type }) {
  if (type === 'Incidente') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 3 2.8 20h18.4L12 3Z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" />
    </svg>
  )
}

export default function CaseCard({ caseItem }) {
  const caseType = caseItem.tipo ?? caseItem.type ?? 'Solicitud'
  const casePriority = caseItem.prioridad ?? caseItem.priority ?? 'P3'
  const caseTitle = caseItem.titulo ?? caseItem.title ?? 'Caso sin título'
  const userId = caseItem.usuario_id ?? caseItem.userId ?? 'N/A'
  const caseStatus = caseItem.estado ?? caseItem.status ?? 'Pendiente'
  const caseId = `CH-${caseItem.id}`

  return (
    <article className={`case-card case-card--${caseType.toLowerCase()}`}>
      <div className="case-card__topline">
        <span className="case-card__type">
          <CaseIcon type={caseType} />
          {typeLabels[caseType]}
        </span>
        <span className={`priority priority--${casePriority.toLowerCase()}`}>
          {casePriority}
        </span>
      </div>

      <div className="case-card__body">
        <span className="case-card__id">{caseId}</span>
        <h3>{caseTitle}</h3>
        <span className="case-card__area">{caseItem.area}</span>
      </div>

      <div className="case-card__footer">
        <span className="case-card__user">
          <span className="avatar">{String(userId).slice(-2)}</span>
          Usuario {userId}
        </span>
        <span className="case-card__status">{caseStatus}</span>
        {caseItem.expedite && (
          <span className="expedite" title="Caso urgente: Expedite">
            <span aria-hidden="true">⚡</span> Expedite
          </span>
        )}
      </div>
    </article>
  )
}
