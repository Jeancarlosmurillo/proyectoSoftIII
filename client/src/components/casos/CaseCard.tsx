import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { Caso } from '../../types'

export default function CaseCard({ caso }: { caso: Caso }) {
  const { usuarios } = useAuth()
  const solicitante = usuarios.find((usuario) => usuario.id === caso.usuario_id)
  const agente = caso.agente_id === null ? null : usuarios.find((usuario) => usuario.id === caso.agente_id)
  return (
    <Link className={`case-card case-card--${caso.tipo === 'Incidente' ? 'incidente' : 'solicitud'}`} to={`/caso/${caso.id}`}>
      <div className="case-card__topline">
        <span className="case-card__type">{caso.tipo === 'Incidente' ? '⚠ Incidente' : '▤ Solicitud'}</span>
        <span className={`priority priority--${caso.prioridad.toLowerCase()}`}>{caso.prioridad}</span>
      </div>
      <div className="case-card__body">
        <span className="case-card__id">CH-{caso.id}</span>
        <h3>{caso.titulo}</h3>
        <span className="case-card__area">Categoría {caso.categoria_id}</span>
      </div>
      <div className="case-card__footer">
        <span className="case-card__user"><span className="avatar">{(solicitante?.nombre ?? `U${caso.usuario_id}`).slice(0, 2).toUpperCase()}</span>{solicitante?.nombre ?? `Usuario ${caso.usuario_id}`}</span>
        <span className="case-card__status">{caso.estado}</span>
      </div>
      <span className="case-card__assignee">{agente ? `Atiende: ${agente.nombre}` : 'Sin agente asignado'}</span>
    </Link>
  )
}
