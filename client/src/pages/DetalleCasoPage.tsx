import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, type FormEvent } from 'react'
import { useEffect, useState, type FormEvent } from 'react'
import { useCasos } from '../context/CasosContext'
import { useAuth } from '../context/AuthContext'
import { validarCaso } from '../services/casosService'
import type { AreaTI, EstadoCaso, Prioridad, TipoCaso } from '../types'

const estados: EstadoCaso[] = ['Pendiente', 'En análisis', 'En atención', 'En validación', 'Cerrada']

export default function DetalleCasoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { casos, actualizarEstadoCaso, editarCaso, eliminarCaso, asignarCaso, obtenerHistorial, obtenerEstadosPermitidos, registrarAnalisis: registrarAnalisisContext, registrarAtencion: registrarAtencionContext } = useCasos()
  const { usuarioActual, usuarios } = useAuth()
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [eventos, setEventos] = useState<Awaited<ReturnType<typeof obtenerHistorial>>>([])
  const [diagnostico, setDiagnostico] = useState('')
  const [solucion, setSolucion] = useState('')
  const [abordaje, setAbordaje] = useState('')
  const [comentario, setComentario] = useState('')
  const caso = casos.find((item) => item.id === Number(id))
  useEffect(() => {
    if (caso) obtenerHistorial(caso.id).then(setEventos).catch((exception) => setError(exception instanceof Error ? exception.message : 'No fue posible cargar el historial'))
  }, [caso, obtenerHistorial])
  if (!caso) return <section className="empty-page"><h2>Caso no encontrado</h2><Link to="/bandeja">Volver a la bandeja</Link></section>
  const cambiarEstado = async (nuevoEstado: EstadoCaso) => {
    try {
      setError('')
      await actualizarEstadoCaso(caso.id, nuevoEstado)
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'No fue posible actualizar el caso')
    } finally {
      setCargando(false)
    }
  }

  const puedeGestionar = usuarioActual.rol === 'agente' || usuarioActual.rol === 'administrador'
  const estadosPermitidos = obtenerEstadosPermitidos(caso.id)
  const agentes = usuarios.filter((usuario) => usuario.rol === 'agente')
  const guardarEdicion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setError('')
      await editarCaso(caso.id, {
        tipo: data.get('tipo') as TipoCaso,
        titulo: String(data.get('titulo')),
        descripcion: String(data.get('descripcion')),
        prioridad: data.get('prioridad') as Prioridad,
        area: data.get('area') as AreaTI,
        usuario_id: Number(data.get('usuario_id')),
        categoria_id: Number(data.get('categoria_id')),
      })
      setEditando(false)
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'No fue posible registrar la atención')
    } finally {
      setCargando(false)
    }
  }
  const borrarCaso = async () => {
    if (!window.confirm(`¿Deseas eliminar el caso CH-${caso.id}? Esta acción no se puede deshacer.`)) return
    try {
      await eliminarCaso(caso.id)
      navigate('/bandeja')
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'No fue posible eliminar el caso')
    }
  }
  const registrarAtencion = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setGuardando(true); setError('')
      await registrarAtencionContext(caso.id, diagnostico, solucion)
      setDiagnostico(''); setSolucion('')
      setEventos(await obtenerHistorial(caso.id))
    } catch (exception) { setError(exception instanceof Error ? exception.message : 'No fue posible registrar la atención') } finally { setGuardando(false) }
  }
  const registrarAnalisisCaso = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setGuardando(true); setError('')
      await registrarAnalisisContext(caso.id, diagnostico, abordaje)
      setDiagnostico(''); setAbordaje('')
      setEventos(await obtenerHistorial(caso.id))
    } catch (exception) { setError(exception instanceof Error ? exception.message : 'No fue posible registrar el análisis') } finally { setGuardando(false) }
  }
  const validar = async (accion: 'aprobar' | 'devolver') => {
    try {
      setGuardando(true); setError('')
      await validarCaso(caso.id, accion, comentario, usuarioActual.id)
      setComentario('')
      setEventos(await obtenerHistorial(caso.id))
    } catch (exception) { setError(exception instanceof Error ? exception.message : 'No fue posible validar el caso') } finally { setGuardando(false) }
  }
  return <section className="detail-page"><Link className="back-link" to={usuarioActual.rol === 'solicitante' || usuarioActual.rol === 'validador' ? '/mis-casos' : '/bandeja'}>← Volver a la bandeja</Link><div className="detail-header"><div><span className="case-card__id">CH-{caso.id}</span><h2>{caso.titulo}</h2><p>{caso.tipo} · {caso.area}</p></div><span className={`priority priority--${caso.prioridad.slice(0, 2).toLowerCase()}`}>{caso.prioridad}</span></div>
    <div className="detail-actions">{usuarioActual.rol === 'administrador' && <><button className="button-secondary" type="button" onClick={() => setEditando((actual) => !actual)}>{editando ? 'Cancelar edición' : 'Editar caso'}</button><button className="button-danger" type="button" onClick={borrarCaso}>Eliminar caso</button></>}</div>
    {editando && <form className="case-form detail-edit-form" onSubmit={guardarEdicion}><label>Tipo<select name="tipo" defaultValue={caso.tipo}><option>Incidente</option><option>Solicitud de servicio</option></select></label><label>Área TI<select name="area" defaultValue={caso.area}>{['Hardware', 'Software', 'Red y conectividad', 'Cuentas y acceso', 'Plataformas académicas'].map((area) => <option key={area}>{area}</option>)}</select></label><label>Título<input name="titulo" required defaultValue={caso.titulo} /></label><label>Prioridad<select name="prioridad" defaultValue={caso.prioridad}><option>P1 urgente</option><option>P2 normal</option><option>P3 baja</option></select></label><label className="full-field">Descripción<textarea name="descripcion" required minLength={10} defaultValue={caso.descripcion} /></label><label>Usuario ID<input name="usuario_id" required type="number" min="1" defaultValue={caso.usuario_id} /></label><label>Categoría ID<input name="categoria_id" required type="number" min="1" defaultValue={caso.categoria_id} /></label><div className="form-actions full-field"><button className="button-primary" type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button></div></form>}
    <div className="detail-grid"><article className="detail-card"><h3>Descripción</h3><p>{caso.descripcion}</p><dl><dt>Usuario ID</dt><dd>{caso.usuario_id}</dd><dt>Categoría ID</dt><dd>{caso.categoria_id}</dd><dt>Creado</dt><dd>{new Date(caso.fecha_creacion).toLocaleString('es-CO')}</dd></dl></article><article className="detail-card"><h3>Gestionar caso</h3><p>Sesión: <strong>{usuarioActual.nombre}</strong> ({usuarioActual.rol}).</p>{puedeGestionar ? <><select value={caso.estado} onChange={(event) => void cambiarEstado(event.target.value as EstadoCaso)}>{estadosPermitidos.map((estado) => <option key={estado}>{estado}</option>)}</select>{usuarioActual.rol === 'agente' && caso.agente_id !== usuarioActual.id && <div className="permission-note">Debes asignarte este caso antes de avanzar su estado.</div>}</> : <div className="permission-note">Solo los roles agente o administrador pueden gestionar el flujo.</div>}{usuarioActual.rol === 'administrador' && <label className="assignment-field">Agente asignado<select value={caso.agente_id ?? ''} onChange={(event) => void asignarCaso(caso.id, event.target.value ? Number(event.target.value) : null)}><option value="">Sin asignar</option>{agentes.map((agente) => <option key={agente.id} value={agente.id}>{agente.nombre}</option>)}</select></label>}{caso.estado === 'En análisis' && usuarioActual.rol === 'agente' && caso.agente_id === usuarioActual.id && <form className="workflow-form" onSubmit={registrarAnalisisCaso}><h4>Documentar análisis</h4><p className="field-hint">Explica qué encontraste, cómo lo abordarás y deja el caso listo para atención.</p><textarea required minLength={10} placeholder="Diagnóstico inicial: ¿qué está causando el problema?" value={diagnostico} onChange={(event) => setDiagnostico(event.target.value)} /><textarea required minLength={10} placeholder="Plan de abordaje: ¿qué acciones realizarás?" value={abordaje} onChange={(event) => setAbordaje(event.target.value)} /><button className="button-primary" disabled={guardando}>{guardando ? 'Guardando análisis...' : 'Guardar análisis y pasar a atención'}</button></form>}{caso.estado === 'En atención' && usuarioActual.rol === 'agente' && caso.agente_id === usuarioActual.id && <form className="workflow-form" onSubmit={registrarAtencion}><h4>Registrar solución</h4><p className="field-hint">Documenta el resultado concreto para que un validador pueda revisarlo.</p><textarea required minLength={10} placeholder="Diagnóstico confirmado" value={diagnostico} onChange={(event) => setDiagnostico(event.target.value)} /><textarea required minLength={10} placeholder="Solución aplicada y resultado" value={solucion} onChange={(event) => setSolucion(event.target.value)} /><button className="button-primary" disabled={guardando}>{guardando ? 'Guardando solución...' : 'Guardar solución y pasar a validación'}</button></form>}{caso.estado === 'En validación' && usuarioActual.rol === 'validador' && <div className="workflow-form"><h4>Validar solución</h4><textarea placeholder="Comentario opcional" value={comentario} onChange={(event) => setComentario(event.target.value)} /><button className="button-primary" type="button" onClick={() => void validar('aprobar')} disabled={guardando}>Aprobar y cerrar</button><button className="button-secondary" type="button" onClick={() => void validar('devolver')} disabled={guardando}>Devolver a atención</button></div>}{error && <div className="form-error" role="alert">{error}</div>}</article></div>
    <article className="detail-card history-card"><h3>Historial de actividad</h3>{eventos.length > 0 ? <div className="history-list">{eventos.map((evento) => <div className="history-item" key={evento.id}><span className="history-dot" /><div><strong>{evento.evento}</strong><p>{evento.detalle ?? `Usuario ${evento.usuario_id} actualizó el caso.`}</p><small>{new Date(evento.fecha).toLocaleString('es-CO')}</small></div></div>)}</div> : <p className="history-empty">La asignación y los cambios realizados durante esta sesión aparecerán aquí.</p>}</article>
  </section>
}
