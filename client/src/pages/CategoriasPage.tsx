import { useEffect, useState, type FormEvent } from 'react'
import { activarCategoria, crearCategoria, editarCategoria, listarAreas, listarCategorias } from '../services/casosService'
import { useAuth } from '../context/AuthContext'
import type { Area, Categoria } from '../types'

export default function CategoriasPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [areaId, setAreaId] = useState(1)
  const { usuarioActual } = useAuth()

  const esAdmin = usuarioActual.rol === 'administrador'

  const cargar = async () => {
    setCargando(true)
    try {
      const [a, c] = await Promise.all([listarAreas(), listarCategorias()])
      setAreas(a)
      setCategorias(c)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const crear = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError('')
      await crearCategoria(nombre, descripcion, areaId, usuarioActual.id)
      setNombre('')
      setDescripcion('')
      await cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible crear')
    }
  }

  const toggleActiva = async (cat: Categoria) => {
    try {
      setError('')
      await activarCategoria(cat.id, !cat.activa, usuarioActual.id)
      await cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible actualizar')
    }
  }

  if (!esAdmin) return <section className="access-page"><h2>Acceso restringido</h2><p>Solo administradores pueden gestionar categorías.</p></section>
  if (cargando) return <section className="access-page"><h2>Cargando...</h2></section>

  return (
    <section className="form-page">
      <div className="breadcrumb">Operación <span>/</span> Categorías</div>
      <h2>Gestión de categorías</h2>
      <p className="form-lead">Crea y administra las categorías del sistema.</p>

      {error && <div className="form-error" role="alert">{error}</div>}

      <form className="case-form" onSubmit={crear}>
        <label>Nombre<input value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Nombre de la categoría" /></label>
        <label>Descripción<input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción" /></label>
        <label>Área<select value={areaId} onChange={(e) => setAreaId(Number(e.target.value))}>{areas.map((area) => <option key={area.id} value={area.id}>{area.nombre}</option>)}</select></label>
        <button className="button-primary" type="submit">Crear categoría</button>
      </form>

      <div className="cases-table-wrap">
        <table className="cases-table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Área</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {categorias.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td>{cat.nombre}</td>
                <td>{areas.find((a) => a.id === cat.area_id)?.nombre ?? cat.area_id}</td>
                <td><span className={`state-pill ${cat.activa ? 'state-pill--activa' : 'state-pill--inactiva'}`}>{cat.activa ? 'Activa' : 'Inactiva'}</span></td>
                <td><button className="button-secondary" type="button" onClick={() => toggleActiva(cat)}>{cat.activa ? 'Desactivar' : 'Activar'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
