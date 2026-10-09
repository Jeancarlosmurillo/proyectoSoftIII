import { Link } from 'react-router-dom'
import type { Caso } from '../../types'

export default function CaseCard({ caso }: { caso: Caso }) {
  return (
    <Link className={`case-card case-card--${caso.tipo === 'Incidente' ? 'incidente' : 'solicitud'}`} to={`/caso/${caso.id}`}>
      <div className="case-card__topline">
        <span className="case-card__type">{caso.tipo === 'Incidente' ? '⚠ Incidente' : '▤ Solicitud de servicio'}</span>
        <span className={`priority priority--${caso.prioridad.slice(0, 2).toLowerCase()}`}>{caso.prioridad}</span>
      </div>
      <div className="case-card__body">
        <span className="case-card__id">CH-{caso.id}</span>
        <h3>{caso.titulo}</h3>
        <span className="case-card__area">{caso.area}</span>
      </div>
      <div className="case-card__footer">
        <span className="case-card__user"><span className="avatar">{String(caso.usuario_id).slice(-2)}</span> Usuario {caso.usuario_id}</span>
        <span className="case-card__status">{caso.estado}</span>
        {caso.expedite && <span className="expedite">⚡ Expedite</span>}
      </div>
    </Link>
  )
}
