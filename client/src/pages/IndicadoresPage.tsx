import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface Indicadores {
  casos_por_estado: { estado: string; total: string }[]
  casos_por_tipo: { tipo: string; total: string }[]
  casos_por_prioridad: { prioridad: string; total: string }[]
  tiempo_promedio_atencion_horas: number | null
  tiempo_promedio_asignacion_horas: number | null
}

export default function IndicadoresPage() {
  const { usuarioActual } = useAuth()
  const [datos, setDatos] = useState<Indicadores | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'}/indicadores`)
      .then((response) => {
        if (!response.ok) throw new Error('No fue posible cargar los indicadores')
        return response.json() as Promise<Indicadores>
      })
      .then(setDatos)
      .catch((exception) => setError(exception instanceof Error ? exception.message : 'No fue posible cargar los indicadores'))
  }, [])
  if (usuarioActual.rol !== 'administrador') return <section className="access-page"><h2>Indicadores</h2><p>Esta sección está disponible únicamente para administradores.</p></section>
  if (error) return <section className="empty-page"><h2>No fue posible cargar los indicadores</h2><p>{error}</p></section>
  if (!datos) return <section className="empty-page"><h2>Cargando indicadores...</h2></section>
  const total = datos.casos_por_estado.reduce((sum, item) => sum + Number(item.total), 0)
  return <section className="indicators-page"><div className="breadcrumb">Administración <span>/</span> Indicadores</div><div className="page-heading-row"><div><h2>Indicadores de la mesa</h2><p className="form-lead">Resumen operativo para priorizar y mejorar el flujo ScrumBan.</p></div><span className="case-count">{total} casos</span></div><div className="indicator-grid">{datos.casos_por_estado.map((item) => <article className="indicator-card" key={item.estado}><span>{item.estado}</span><strong>{item.total}</strong></article>)}</div><div className="detail-grid indicator-details"><article className="detail-card"><h3>Distribución por tipo</h3>{datos.casos_por_tipo.map((item) => <p className="metric-row" key={item.tipo}><span>{item.tipo}</span><strong>{item.total}</strong></p>)}</article><article className="detail-card"><h3>Distribución por prioridad</h3>{datos.casos_por_prioridad.map((item) => <p className="metric-row" key={item.prioridad}><span>{item.prioridad}</span><strong>{item.total}</strong></p>)}</article><article className="detail-card"><h3>Tiempo promedio</h3><p className="metric-row"><span>Asignación</span><strong>{datos.tiempo_promedio_asignacion_horas === null ? 'Sin datos' : `${Number(datos.tiempo_promedio_asignacion_horas).toFixed(1)} h`}</strong></p><p className="metric-row"><span>Atención/cierre</span><strong>{datos.tiempo_promedio_atencion_horas === null ? 'Sin datos' : `${Number(datos.tiempo_promedio_atencion_horas).toFixed(1)} h`}</strong></p></article></div></section>
}
