import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCasos } from '../context/CasosContext'
import { usuariosPrueba } from '../context/AuthContext'
import type { AreaTI, NuevoCaso, Prioridad, TipoCaso } from '../types'

const categoriasPorArea: Record<AreaTI, { id: number; nombre: string }[]> = {
  Hardware: [{ id: 1, nombre: 'Computador' }, { id: 2, nombre: 'Periférico' }, { id: 3, nombre: 'Impresora' }],
  Software: [{ id: 4, nombre: 'Instalación' }, { id: 5, nombre: 'Error' }, { id: 6, nombre: 'Actualización' }],
  'Red y conectividad': [{ id: 7, nombre: 'Wi-Fi' }, { id: 8, nombre: 'Internet' }, { id: 9, nombre: 'Red cableada' }],
  'Cuentas y acceso': [{ id: 10, nombre: 'Contraseña' }, { id: 11, nombre: 'Bloqueo' }, { id: 12, nombre: 'Correo' }, { id: 13, nombre: 'Permisos' }],
  'Plataformas académicas': [{ id: 15, nombre: 'Campus virtual' }, { id: 16, nombre: 'Sistema académico' }],
}

const initialForm: NuevoCaso = { tipo: 'Incidente', titulo: '', descripcion: '', prioridad: 'P1 urgente', usuario_id: 24, categoria_id: 1, area: 'Hardware' }

export default function RegistroPage() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { agregarCaso } = useCasos()
  const navigate = useNavigate()
  const categorias = useMemo(() => categoriasPorArea[form.area], [form.area])
  const solicitantes = usuariosPrueba.filter((usuario) => usuario.rol === 'solicitante')
  const update = (field: keyof NuevoCaso, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }
  const changeArea = (area: AreaTI) => {
    update('area', area)
    update('categoria_id', categoriasPorArea[area][0].id)
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!form.tipo) nextErrors.tipo = 'Selecciona el tipo de caso.'
    if (!form.area) nextErrors.area = 'Selecciona un área.'
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
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'No fue posible registrar el caso.' })
    }
  }

  return <section className="form-page"><div className="breadcrumb">Operación <span>/</span> Registrar caso</div><h2>Registrar nuevo caso</h2><p className="form-lead">Crea un incidente o una solicitud para incorporarla a la bandeja.</p>
    <form className="case-form" onSubmit={submit}>
      <label>Tipo de caso<select value={form.tipo} onChange={(event) => update('tipo', event.target.value as TipoCaso)}><option>Incidente</option><option>Solicitud de servicio</option></select>{errors.tipo && <small className="field-error">{errors.tipo}</small>}</label>
      <label>Área TI<select value={form.area} onChange={(event) => changeArea(event.target.value as AreaTI)}>{Object.keys(categoriasPorArea).map((area) => <option key={area}>{area}</option>)}</select>{errors.area && <small className="field-error">{errors.area}</small>}</label>
      <label>Categoría<select value={form.categoria_id} onChange={(event) => update('categoria_id', Number(event.target.value))}><option value="">Selecciona una categoría</option>{categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}</select>{errors.categoria_id && <small className="field-error">{errors.categoria_id}</small>}</label>
      <label>Prioridad<select value={form.prioridad} onChange={(event) => update('prioridad', event.target.value as Prioridad)}><option>P1 urgente</option><option>P2 normal</option><option>P3 baja</option></select></label>
      <label className="full-field">Título<input value={form.titulo} onChange={(event) => update('titulo', event.target.value)} placeholder="Describe brevemente el caso" />{errors.titulo && <small className="field-error">{errors.titulo}</small>}</label>
      <label className="full-field">Descripción<textarea value={form.descripcion} onChange={(event) => update('descripcion', event.target.value)} placeholder="Incluye el contexto necesario para atenderlo" />{errors.descripcion && <small className="field-error">{errors.descripcion}</small>}<small className="field-hint">{form.descripcion.trim().length}/10 caracteres mínimos</small></label>
      <label>Solicitante<select value={form.usuario_id} onChange={(event) => update('usuario_id', Number(event.target.value))}>{solicitantes.map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>)}</select>{errors.usuario_id && <small className="field-error">{errors.usuario_id}</small>}</label>
      <div className="form-status"><span>Estado inicial</span><strong>Pendiente</strong></div>
      {errors.general && <small className="field-error full-field">{errors.general}</small>}
      <div className="form-actions full-field"><button className="button-secondary" type="button" onClick={() => navigate('/bandeja')}>Cancelar</button><button className="button-primary" type="submit">Guardar caso</button></div>
    </form>
  </section>
}
