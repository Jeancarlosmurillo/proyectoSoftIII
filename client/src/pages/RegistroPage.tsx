import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCasos } from '../context/CasosContext'
import { useAuth } from '../context/AuthContext'
import { listarAreas, listarCategorias } from '../services/casosService'
import type { Area, Categoria, NuevoCaso, Prioridad, TipoCaso } from '../types'

export default function RegistroPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [form, setForm] = useState<NuevoCaso>({ tipo: 'Incidente', titulo: '', descripcion: '', prioridad: 'P1', usuario_id: 1, categoria_id: 1 })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { agregarCaso } = useCasos()
  const { usuarioActual } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    listarAreas().then(setAreas).catch(() => {})
    listarCategorias().then(setCategorias).catch(() => {})
  }, [])

  const categoriasPorArea = useMemo(() => {
    const mapa: Record<number, Categoria[]> = {}
    for (const cat of categorias) {
      if (!mapa[cat.area_id]) mapa[cat.area_id] = []
      mapa[cat.area_id].push(cat)
    }
    return mapa
  }, [categorias])

  const areaId = areas.find((a) => a.nombre === 'Hardware')?.id ?? areas[0]?.id ?? 1
  const categoriasFiltradas = categoriasPorArea[areaId] ?? []

  const update = (field: keyof NuevoCaso, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!form.tipo) nextErrors.tipo = 'Selecciona el tipo de caso.'
    if (!form.categoria_id) nextErrors.categoria_id = 'Selecciona una categoría.'
    if (!form.titulo.trim()) nextErrors.titulo = 'El título es obligatorio.'
    if (!form.usuario_id) nextErrors.usuario_id = 'Selecciona el solicitante.'
    if (form.descripcion.trim().length < 10) nextErrors.descripcion = 'La descripción debe tener al menos 10 caracteres.'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    try {
      const caso = await agregarCaso({ ...form, titulo: form.titulo.trim(), descripcion: form.descripcion.trim() })
      navigate(`/bandeja?creado=${caso.id}`)
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'No fue posible registrar el caso' })
    }
  }

  return <section className="form-page"><div className="breadcrumb">Operación <span>/</span> Registrar caso</div><h2>Registrar nuevo caso</h2><p className="form-lead">Crea un incidente o una solicitud para incorporarla a la bandeja.</p>
    <form className="case-form" onSubmit={submit}>
      <label>Tipo de caso<select value={form.tipo} onChange={(event) => update('tipo', event.target.value as TipoCaso)}><option>Incidente</option><option>Solicitud</option></select>{errors.tipo && <small className="field-error">{errors.tipo}</small>}</label>
      <label>Área TI<select value={areaId} onChange={(event) => { const nuevaArea = Number(event.target.value); update('categoria_id', categoriasPorArea[nuevaArea]?.[0]?.id ?? 0) }}>{areas.map((area) => <option key={area.id} value={area.id}>{area.nombre}</option>)}</select></label>
      <label>Categoría<select value={form.categoria_id} onChange={(event) => update('categoria_id', Number(event.target.value))}><option value="">Selecciona una categoría</option>{categoriasFiltradas.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}</select>{errors.categoria_id && <small className="field-error">{errors.categoria_id}</small>}</label>
      <label>Prioridad<select value={form.prioridad} onChange={(event) => update('prioridad', event.target.value as Prioridad)}><option>P1</option><option>P2</option><option>P3</option></select></label>
      <label className="full-field">Título<input value={form.titulo} onChange={(event) => update('titulo', event.target.value)} placeholder="Describe brevemente el caso" />{errors.titulo && <small className="field-error">{errors.titulo}</small>}</label>
      <label className="full-field">Descripción<textarea value={form.descripcion} onChange={(event) => update('descripcion', event.target.value)} placeholder="Incluye el contexto necesario para atenderlo" />{errors.descripcion && <small className="field-error">{errors.descripcion}</small>}<small className="field-hint">{form.descripcion.trim().length}/10 caracteres mínimos</small></label>
      <label>Solicitante (usuario_id)<input type="number" value={form.usuario_id} onChange={(event) => update('usuario_id', Number(event.target.value))} /></label>
      {errors.general && <div className="form-error" role="alert">{errors.general}</div>}
      <div className="form-status"><span>Estado inicial</span><strong>Pendiente</strong></div>
      <div className="form-actions full-field"><button className="button-secondary" type="button" onClick={() => navigate('/bandeja')}>Cancelar</button><button className="button-primary" type="submit">Guardar caso</button></div>
    </form>
  </section>
}
