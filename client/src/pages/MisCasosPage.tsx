import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listarCasos } from '../services/casosService'
import type { Caso } from '../types'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function MisCasosPage() {
  const { usuarioActual } = useAuth()
  const [misCasos, setMisCasos] = useState<Caso[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listarCasos({ usuario_id: usuarioActual.id })
      .then((data) => setMisCasos(data.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())))
      .catch((err) => setError(err instanceof Error ? err.message : 'No fue posible cargar los casos'))
      .finally(() => setCargando(false))
  }, [usuarioActual.id])

  if (cargando) return <section className="access-page"><h2>Cargando tus casos...</h2></section>
  if (error) return <section className="access-page"><h2>Error</h2><p>{error}</p></section>

  return (
    <section className="my-cases-page">
      <div className="breadcrumb">Solicitante <span>/</span> Mis casos</div>
      <div className="page-heading-row">
        <div>
          <h2>Mis casos</h2>
          <p className="form-lead">Consulta el estado de tus solicitudes registradas.</p>
        </div>
        <span className="case-count">{misCasos.length} {misCasos.length === 1 ? 'caso' : 'casos'}</span>
      </div>

      <div className="current-user-note">
        Mostrando casos de <strong>{usuarioActual.nombre}</strong> · Usuario ID {usuarioActual.id}
      </div>

      {misCasos.length > 0 ? (
        <div className="cases-table-wrap">
          <table className="cases-table">
            <caption className="sr-only">Casos del usuario ordenados por fecha de creación</caption>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Creado</th>
              </tr>
            </thead>
            <tbody>
              {misCasos.map((caso) => (
                <tr key={caso.id}>
                  <td><Link className="case-table-id" to={`/caso/${caso.id}`}>CH-{caso.id}</Link></td>
                  <td><Link className="case-table-title" to={`/caso/${caso.id}`}>{caso.titulo}</Link></td>
                  <td><span className={`case-type-pill case-type-pill--${caso.tipo === 'Incidente' ? 'incident' : 'request'}`}>{caso.tipo}</span></td>
                  <td><span className={`state-pill state-pill--${caso.estado.toLowerCase().replace(/ /g, '-').replace(/ó/g, 'o')}`}>{caso.estado}</span></td>
                  <td><span className={`priority priority--${caso.prioridad.toLowerCase()}`}>{caso.prioridad}</span></td>
                  <td>{formatDate(caso.fecha_creacion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-list">
          <span aria-hidden="true">▤</span>
          <h3>Aún no tienes casos registrados</h3>
          <p>Cuando registres una solicitud, aparecerá aquí con su estado de atención.</p>
          <Link className="button-primary" to="/nuevo-caso">Registrar nuevo caso</Link>
        </div>
      )}
    </section>
  )
}
