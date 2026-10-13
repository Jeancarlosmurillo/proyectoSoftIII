import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, type FormEvent } from 'react'
import { useCasos } from '../context/CasosContext'
import { useAuth } from '../context/AuthContext'
import { obtenerCaso, obtenerHistorial } from '../services/casosService'
import type { EstadoCaso, EventoHistorial } from '../types'

const estados: EstadoCaso[] = ['Pendiente', 'En análisis', 'En atención', 'En validación', 'Cerrada']

export default function DetalleCasoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { casos, actualizarEstadoCaso, asignarCaso, registrarAtencion, validarCaso, obtenerEstadosPermitidos } = useCasos()
  const { usuarioActual } = useAuth()
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [diagnostico, setDiagnostico] = useState('')
  const [solucion, setSolucion] = useState('')
  const [comentario, setComentario] = useState('')
  const [historial, setHistorial] = useState<EventoHistorial[]>([])

  const caso = casos.find((item) => item.id === Number(id))

  useEffect(() => {
    if (id) {
      obtenerHistorial(Number(id)).then(setHistorial).catch(() => {})
    }
  }, [id, casos])

  if (!caso) return <section className="empty-page"><h2>Caso no encontrado</h2><Link to="/bandeja">Volver a la bandeja</Link></section>

  const cambiarEstado = async (nuevoEstado: EstadoCaso) => {
    try {
      setError('')
      setCargando(true)
      await actualizarEstadoCaso(caso.id, nuevoEstado)
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'No fue posible actualizar el caso')
    } finally {
      setCargando(false)
    }
  }

  const puedeGestionar = usuarioActual.rol === 'agente' || usuarioActual.rol === 'administrador'
  const puedeValidar = usuarioActual.rol === 'validador' || usuarioActual.rol === 'administrador'
  const puedeAtender = usuarioActual.rol === 'agente' && caso.agente_id === usuarioActual.id && caso.estado === 'En atención'
  const estadosPermitidos = obtenerEstadosPermitidos(caso)

  const enviarAtencion = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError('')
      setCargando(true)
      await registrarAtencion(caso.id, diagnostico, solucion)
      setDiagnostico('')
      setSolucion('')
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'No fue posible registrar la atención')
    } finally {
      setCargando(false)
    }
  }

  const enviarValidacion = async (accion: 'aprobar' | 'devolver') => {
    try {
      setError('')
      setCargando(true)
      await validarCaso(caso.id, accion, comentario || undefined)
      setComentario('')
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'No fue posible validar el caso')
    } finally {
      setCargando(false)
    }
  }

  return <section className="detail-page"><Link className="back-link" to="/bandeja">← Volver a la bandeja</Link><div className="detail-header"><div><span className="case-card__id">CH-{caso.id}</span><h2>{caso.titulo}</h2><p>{caso.tipo} · Categoría {caso.categoria_id}</p></div><span className={`priority priority--${caso.prioridad.toLowerCase()}`}>{caso.prioridad}</span></div>
    <div className="detail-grid"><article className="detail-card"><h3>Descripción</h3><p>{caso.descripcion}</p><dl><dt>Usuario ID</dt><dd>{caso.usuario_id}</dd><dt>Categoría ID</dt><dd>{caso.categoria_id}</dd><dt>Creado</dt><dd>{new Date(caso.fecha_creacion).toLocaleString('es-CO')}</dd>{caso.fecha_asignacion && <><dt>Asignado</dt><dd>{new Date(caso.fecha_asignacion).toLocaleString('es-CO')}</dd></>}{caso.fecha_cierre && <><dt>Cerrado</dt><dd>{new Date(caso.fecha_cierre).toLocaleString('es-CO')}</dd></>}</dl></article><article className="detail-card"><h3>Gestionar caso</h3><p>Sesión: <strong>{usuarioActual.nombre}</strong> ({usuarioActual.rol}).</p>{puedeGestionar ? <><select value={caso.estado} onChange={(event) => cambiarEstado(event.target.value as EstadoCaso)} disabled={cargando}>{estadosPermitidos.map((estado) => <option key={estado}>{estado}</option>)}</select>{usuarioActual.rol === 'agente' && caso.agente_id !== usuarioActual.id && <div className="permission-note">Debes asignarte este caso antes de avanzar su estado.</div>}</> : <div className="permission-note">Solo los roles agente o administrador pueden gestionar el flujo.</div>}{error && <div className="form-error" role="alert">{error}</div>}</article></div>
    {puedeAtender && <article className="detail-card"><h3>Registrar atención</h3><form onSubmit={enviarAtencion}><label>Diagnóstico<textarea value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} required placeholder="Describe el diagnóstico técnico" /></label><label>Solución<textarea value={solucion} onChange={(e) => setSolucion(e.target.value)} required placeholder="Describe la solución aplicada" /></label><button className="button-primary" type="submit" disabled={cargando}>Registrar atención</button></form></article>}
    {caso.atencion && <article className="detail-card"><h3>Atención registrada</h3><p><strong>Diagnóstico:</strong> {caso.atencion.diagnostico}</p><p><strong>Solución:</strong> {caso.atencion.solucion}</p><p><strong>Fecha:</strong> {new Date(caso.atencion.fecha).toLocaleString('es-CO')}</p></article>}
    {puedeValidar && caso.estado === 'En validación' && <article className="detail-card"><h3>Validación</h3><label>Comentario (opcional)<input value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Comentario de validación" /></label><div className="form-actions"><button className="button-primary" onClick={() => enviarValidacion('aprobar')} disabled={cargando}>Aprobar y cerrar</button><button className="button-danger" onClick={() => enviarValidacion('devolver')} disabled={cargando}>Devolver a En atención</button></div></article>}
    <article className="detail-card history-card"><h3>Historial de actividad</h3>{historial.length > 0 ? <div className="history-list">{historial.map((evento) => <div className="history-item" key={evento.id}><span className="history-dot" /><div><strong>{evento.evento}</strong><p>{evento.estado_anterior && evento.estado_nuevo ? `${evento.estado_anterior} → ${evento.estado_nuevo}` : `Usuario ${evento.usuario_id}`}</p><small>{new Date(evento.fecha).toLocaleString('es-CO')}</small></div></div>)}</div> : <p className="history-empty">Sin eventos registrados.</p>}</article>
  </section>
}
