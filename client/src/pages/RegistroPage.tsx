import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCasos } from '../context/CasosContext'
import { useAuth } from '../context/AuthContext'
import type { AreaTI, NuevoCaso, Prioridad, TipoCaso } from '../types'

const categoriasVacias: Record<AreaTI, { id: number; nombre: string }[]> = {
  Hardware: [],
  Software: [],
  'Red y conectividad': [],
  'Cuentas y acceso': [],
  'Plataformas académicas': [],
}

const initialForm: NuevoCaso = { tipo: 'Incidente', titulo: '', descripcion: '', prioridad: 'P1 urgente', usuario_id: 0, categoria_id: 0, area: 'Hardware' }

export default function RegistroPage() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { agregarCaso } = useCasos()
  const { usuarioActual, usuarios } = useAuth()
  const [catalogo, setCatalogo] = useState(categoriasVacias)
  const navigate = useNavigate()
  const categorias = useMemo(() => catalogo[form.area], [catalogo, form.area])
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'
    Promise.all([
      fetch(`${apiUrl}/areas`).then((response) => response.json()),
      fetch(`${apiUrl}/categorias`).then((response) => response.json()),
    ]).then(([areas, categoriasApi]) => {
      const areasPorId = new Map<number, AreaTI>(areas.map((area: { id: number; nombre: AreaTI }) => [area.id, area.nombre]))
        const siguiente: Record<AreaTI, { id: number; nombre: string }[]> = {
          Hardware: [],
          Software: [],
          'Red y conectividad': [],
          'Cuentas y acceso': [],
          'Plataformas académicas': [],
        }
      categoriasApi.forEach((categoria: { id: number; nombre: string; area_id: number }) => {
        const area = areasPorId.get(categoria.area_id)
        if (area) siguiente[area] = [...(siguiente[area] ?? []), { id: categoria.id, nombre: categoria.nombre }]
      })
      setCatalogo(siguiente)
      setForm((current) => ({
        ...current,
        categoria_id: siguiente[current.area][0]?.id ?? 0,
      }))
    }).catch(() => undefined)
  }, [])
  useEffect(() => {
    if (usuarioActual.rol === 'solicitante' && form.usuario_id !== usuarioActual.id) {
      setForm((current) => ({ ...current, usuario_id: usuarioActual.id }))
    }
  }, [usuarioActual.id, usuarioActual.rol, form.usuario_id])
  if (usuarioActual.rol !== 'solicitante' && usuarioActual.rol !== 'administrador') {
    return <section className="access-page"><h2>Registro restringido</h2><p>Solo los solicitantes y administradores pueden registrar nuevos casos.</p></section>
  }
  const update = (field: keyof NuevoCaso, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }
  const changeArea = (area: AreaTI) => {
    update('area', area)
    update('categoria_id', catalogo[area][0]?.id ?? 0)
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!form.tipo) nextErrors.tipo = 'Selecciona el tipo de caso.'
    if (!form.area) nextErrors.area = 'Selecciona un área.'
    if (!form.categoria_id) nextErrors.categoria_id = 'Selecciona una categoría.'
    if (!form.titulo.trim()) nextErrors.titulo = 'El título es obligatorio.'
    if (!form.usuario_id) nextErrors.usuario_id = 'No fue posible identificar el solicitante actual.'
    if (form.descripcion.trim().length < 10) nextErrors.descripcion = 'La descripción debe tener al menos 10 caracteres.'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    try {
      const caso = await agregarCaso({ ...form, titulo: form.titulo.trim(), descripcion: form.descripcion.trim() })
      navigate(`/bandeja?creado=${caso.id}`)
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'No fue posible registrar el caso.' })
    }
  }

  return <section className="form-page"><div className="breadcrumb">Operación <span>/</span> Registrar caso</div><h2>Registrar nuevo caso</h2><p className="form-lead">Crea un incidente o una solicitud para incorporarla a la bandeja.</p>
    <form className="case-form" onSubmit={submit}>
      <label>Tipo de caso<select value={form.tipo} onChange={(event) => update('tipo', event.target.value as TipoCaso)}><option>Incidente</option><option>Solicitud de servicio</option></select>{errors.tipo && <small className="field-error">{errors.tipo}</small>}</label>
      <label>Área TI<select value={form.area} onChange={(event) => changeArea(event.target.value as AreaTI)}>{Object.keys(categoriasVacias).map((area) => <option key={area}>{area}</option>)}</select>{errors.area && <small className="field-error">{errors.area}</small>}</label>
      <label>Categoría<select value={form.categoria_id} onChange={(event) => update('categoria_id', Number(event.target.value))}><option value="">Selecciona una categoría</option>{categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}</select>{errors.categoria_id && <small className="field-error">{errors.categoria_id}</small>}</label>
      <label>Prioridad<select value={form.prioridad} onChange={(event) => update('prioridad', event.target.value as Prioridad)}><option>P1 urgente</option><option>P2 normal</option><option>P3 baja</option></select></label>
      <label className="full-field">Título<input value={form.titulo} onChange={(event) => update('titulo', event.target.value)} placeholder="Describe brevemente el caso" />{errors.titulo && <small className="field-error">{errors.titulo}</small>}</label>
      <label className="full-field">Descripción<textarea value={form.descripcion} onChange={(event) => update('descripcion', event.target.value)} placeholder="Incluye el contexto necesario para atenderlo" />{errors.descripcion && <small className="field-error">{errors.descripcion}</small>}<small className="field-hint">{form.descripcion.trim().length}/10 caracteres mínimos</small></label>
      {usuarioActual.rol === 'solicitante'
        ? <div className="form-status"><span>Solicitante</span><strong>{usuarioActual.nombre}</strong><small>Se asigna automáticamente desde tu sesión.</small></div>
        : <label>Solicitante<select value={form.usuario_id} onChange={(event) => update('usuario_id', Number(event.target.value))}>{usuarios.filter((usuario) => usuario.rol === 'solicitante').map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>)}</select>{errors.usuario_id && <small className="field-error">{errors.usuario_id}</small>}</label>}
      <div className="form-status"><span>Estado inicial</span><strong>Pendiente</strong></div>
      {errors.general && <small className="field-error full-field">{errors.general}</small>}
      <div className="form-actions full-field"><button className="button-secondary" type="button" onClick={() => navigate('/bandeja')}>Cancelar</button><button className="button-primary" type="submit">Guardar caso</button></div>
    </form>
  </section>
}
