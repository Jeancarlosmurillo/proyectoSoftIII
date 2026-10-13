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
  const { casos } = useCasos()
  const configuracion = usuarioActual.rol === 'agente'
    ? { etiqueta: 'Agente', titulo: 'Mis asignaciones', descripcion: 'Casos que tienes asignados para atender.', filtro: (caso: Caso) => caso.agente_id === usuarioActual.id }
    : usuarioActual.rol === 'validador'
      ? { etiqueta: 'Validador', titulo: 'Casos por validar', descripcion: 'Soluciones pendientes de aprobación o devolución.', filtro: (caso: Caso) => caso.estado === 'En validación' }
      : usuarioActual.rol === 'administrador'
        ? { etiqueta: 'Administración', titulo: 'Todos los casos', descripcion: 'Vista general de los casos registrados en la mesa de servicios.', filtro: () => true }
        : { etiqueta: 'Solicitante', titulo: 'Mis casos', descripcion: 'Consulta el estado de tus solicitudes registradas.', filtro: (caso: Caso) => caso.usuario_id === usuarioActual.id }
  const misCasos = casos
    .filter(configuracion.filtro)
    .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
  const guia = usuarioActual.rol === 'solicitante'
    ? { titulo: 'Tu solicitud es el punto de partida', texto: 'Registra el problema con contexto y sigue aquí cada avance hasta recibir una solución.', pasos: ['Registrar el caso', 'Seguir el estado', 'Confirmar la solución'] }
    : usuarioActual.rol === 'agente'
      ? { titulo: 'Tu trabajo es resolver, no acumular', texto: 'Toma un caso disponible, diagnostica, documenta la solución y pásalo a validación.', pasos: ['Tomar un caso', 'Registrar atención', 'Enviar a validación'] }
      : usuarioActual.rol === 'validador'
        ? { titulo: 'Tu revisión garantiza la calidad', texto: 'Verifica que el diagnóstico y la solución respondan realmente a la necesidad reportada.', pasos: ['Revisar evidencia', 'Aprobar o devolver', 'Dejar trazabilidad'] }
        : { titulo: 'La operación necesita decisiones', texto: 'Monitorea el flujo, protege los límites WIP y distribuye el trabajo entre el equipo.', pasos: ['Revisar indicadores', 'Balancear asignaciones', 'Desbloquear el flujo'] }

  return (
    <section className="my-cases-page">
      <div className="breadcrumb">{configuracion.etiqueta} <span>/</span> {configuracion.titulo}</div>
      <div className="page-heading-row">
        <div>
          <h2>{configuracion.titulo}</h2>
          <p className="form-lead">{configuracion.descripcion}</p>
        </div>
        <span className="case-count">{misCasos.length} {misCasos.length === 1 ? 'caso' : 'casos'}</span>
      </div>

      <div className="current-user-note">
        {usuarioActual.rol === 'solicitante' ? <>Mostrando casos de <strong>{usuarioActual.nombre}</strong> · Usuario ID {usuarioActual.id}</> : <>Sesión activa: <strong>{usuarioActual.nombre}</strong> · Rol {usuarioActual.rol}</>}
      </div>
      <section className="role-guide" aria-label={`Guía del rol ${configuracion.etiqueta}`}>
        <div className="role-guide__copy"><span className="role-guide__eyebrow">Tu propósito en CampusHelp</span><h3>{guia.titulo}</h3><p>{guia.texto}</p></div>
        <div className="role-guide__steps">{guia.pasos.map((paso, index) => <div className="role-step" key={paso}><span>{index + 1}</span><strong>{paso}</strong></div>)}</div>
      </section>

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
          <p>{usuarioActual.rol === 'validador' ? 'No hay soluciones pendientes de validación.' : 'No hay casos para mostrar en esta sección.'}</p>
          {usuarioActual.rol === 'solicitante' && <Link className="button-primary" to="/nuevo-caso">Registrar nuevo caso</Link>}
        </div>
      )}
    </section>
  )
}
