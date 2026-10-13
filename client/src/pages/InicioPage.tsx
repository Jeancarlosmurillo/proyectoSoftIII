import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCasos } from '../context/CasosContext'
import type { Caso } from '../types'

const estadoClases: Record<string, string> = {
  Pendiente: 'dashboard-stat--pending',
  'En análisis': 'dashboard-stat--analysis',
  'En atención': 'dashboard-stat--attention',
  'En validación': 'dashboard-stat--validation',
  Cerrada: 'dashboard-stat--closed',
}

function casosDelRol(casos: Caso[], rol: string, id: number) {
  if (rol === 'solicitante') return casos.filter((caso) => caso.usuario_id === id)
  if (rol === 'agente') return casos.filter((caso) => caso.agente_id === id)
  if (rol === 'validador') return casos.filter((caso) => caso.estado === 'En validación')
  return casos
}

export default function InicioPage() {
  const { usuarioActual } = useAuth()
  const { casos, cargando } = useCasos()
  const visibles = casosDelRol(casos, usuarioActual.rol, usuarioActual.id)
  const pendientes = visibles.filter((caso) => caso.estado !== 'Cerrada').length
  const cerrados = visibles.filter((caso) => caso.estado === 'Cerrada').length
  const prioridadAlta = visibles.filter((caso) => caso.prioridad === 'P1 urgente').length
  const titulo = usuarioActual.rol === 'solicitante'
    ? 'Tu centro de solicitudes'
    : usuarioActual.rol === 'agente'
      ? 'Tu centro de operación'
      : usuarioActual.rol === 'validador'
        ? 'Tu centro de validación'
        : 'Centro de control'
  const descripcion = usuarioActual.rol === 'solicitante'
    ? 'Registra necesidades, revisa avances y consulta el historial de tus solicitudes.'
    : 'Consulta el trabajo que requiere tu atención y mantén el flujo en movimiento.'
  const acceso = usuarioActual.rol === 'solicitante'
    ? { to: '/nuevo-caso', texto: 'Registrar un caso', secundario: '/mis-casos', secundarioTexto: 'Ver mis casos' }
    : usuarioActual.rol === 'agente'
      ? { to: '/bandeja', texto: 'Abrir bandeja operativa', secundario: '/mis-casos', secundarioTexto: 'Ver mis asignaciones' }
      : usuarioActual.rol === 'validador'
        ? { to: '/mis-casos', texto: 'Revisar casos', secundario: '/mis-casos', secundarioTexto: 'Actualizar pendientes' }
        : { to: '/bandeja', texto: 'Abrir operación', secundario: '/indicadores', secundarioTexto: 'Ver indicadores' }

  return (
    <section className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <span className="dashboard-eyebrow">CampusHelp / Inicio</span>
          <h2>{titulo}</h2>
          <p>{descripcion}</p>
          <div className="dashboard-user">Sesión activa: <strong>{usuarioActual.nombre}</strong> · {usuarioActual.rol}</div>
        </div>
        <div className="dashboard-actions">
          <Link className="button-primary" to={acceso.to}>{acceso.texto}</Link>
          <Link className="button-secondary" to={acceso.secundario}>{acceso.secundarioTexto}</Link>
        </div>
      </div>

      <div className="dashboard-stats" aria-label="Resumen de trabajo">
        <div className="dashboard-stat"><span>Casos visibles</span><strong>{cargando ? '...' : visibles.length}</strong><small>Según tu rol actual</small></div>
        <div className="dashboard-stat dashboard-stat--active"><span>En proceso</span><strong>{pendientes}</strong><small>Requieren seguimiento</small></div>
        <div className="dashboard-stat dashboard-stat--closed"><span>Resueltos</span><strong>{cerrados}</strong><small>Casos cerrados</small></div>
        <div className="dashboard-stat dashboard-stat--urgent"><span>Prioridad urgente</span><strong>{prioridadAlta}</strong><small>Atención preferente</small></div>
      </div>

      <div className="dashboard-columns">
        <section className="dashboard-card">
          <div className="dashboard-card-heading"><div><span className="dashboard-eyebrow">Flujo actual</span><h3>Estado de los casos</h3></div><Link to="/mis-casos">Ver detalle</Link></div>
          <div className="dashboard-status-list">
            {Object.keys(estadoClases).map((estado) => <div className="dashboard-status-row" key={estado}><span className={`status-dot ${estadoClases[estado]}`} /><span>{estado}</span><strong>{visibles.filter((caso) => caso.estado === estado).length}</strong></div>)}
          </div>
        </section>
        <section className="dashboard-card dashboard-card--accent">
          <span className="dashboard-eyebrow">Cómo funciona</span>
          <h3>Un caso, un flujo, una solución</h3>
          <p>El solicitante registra la necesidad, el agente la atiende, el validador verifica la solución y el administrador supervisa el equilibrio del trabajo.</p>
          <div className="dashboard-flow"><span>Registrar</span><b>→</b><span>Atender</span><b>→</b><span>Validar</span><b>→</b><span>Cerrar</span></div>
        </section>
      </div>
    </section>
  )
}
