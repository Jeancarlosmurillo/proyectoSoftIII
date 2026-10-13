import { useEffect, useState } from 'react'
import { listarIndicadores } from '../services/casosService'
import type { Indicadores } from '../types'

export default function DashboardPage() {
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listarIndicadores()
      .then(setIndicadores)
      .catch((err) => setError(err instanceof Error ? err.message : 'No fue posible cargar los indicadores'))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <section className="access-page"><h2>Cargando indicadores...</h2></section>
  if (error) return <section className="access-page"><h2>Error</h2><p>{error}</p></section>
  if (!indicadores) return null

  const maxEstado = Math.max(...indicadores.casos_por_estado.map((e) => Number(e.total)), 1)
  const maxTipo = Math.max(...indicadores.casos_por_tipo.map((e) => Number(e.total)), 1)
  const maxPrioridad = Math.max(...indicadores.casos_por_prioridad.map((e) => Number(e.total)), 1)

  return (
    <section className="dashboard-page">
      <div className="breadcrumb">Operación <span>/</span> Dashboard</div>
      <h2>Indicadores del sistema</h2>
      <p className="form-lead">Resumen de casos por estado, tipo y prioridad.</p>

      <div className="dashboard-grid">
        <article className="detail-card">
          <h3>Casos por estado</h3>
          {indicadores.casos_por_estado.map((item) => (
            <div key={item.estado} className="bar-row">
              <span className="bar-label">{item.estado}</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${(Number(item.total) / maxEstado) * 100}%` }} /></div>
              <span className="bar-value">{item.total}</span>
            </div>
          ))}
        </article>

        <article className="detail-card">
          <h3>Casos por tipo</h3>
          {indicadores.casos_por_tipo.map((item) => (
            <div key={item.tipo} className="bar-row">
              <span className="bar-label">{item.tipo}</span>
              <div className="bar-track"><div className="bar-fill bar-fill--tipo" style={{ width: `${(Number(item.total) / maxTipo) * 100}%` }} /></div>
              <span className="bar-value">{item.total}</span>
            </div>
          ))}
        </article>

        <article className="detail-card">
          <h3>Casos por prioridad</h3>
          {indicadores.casos_por_prioridad.map((item) => (
            <div key={item.prioridad} className="bar-row">
              <span className="bar-label">{item.prioridad}</span>
              <div className="bar-track"><div className="bar-fill bar-fill--prioridad" style={{ width: `${(Number(item.total) / maxPrioridad) * 100}%` }} /></div>
              <span className="bar-value">{item.total}</span>
            </div>
          ))}
        </article>

        <article className="detail-card">
          <h3>Tiempos promedio</h3>
          <p><strong>Atención:</strong> {indicadores.tiempo_promedio_atencion_horas !== null ? `${Number(indicadores.tiempo_promedio_atencion_horas).toFixed(1)} horas` : 'Sin datos'}</p>
          <p><strong>Asignación:</strong> {indicadores.tiempo_promedio_asignacion_horas !== null ? `${Number(indicadores.tiempo_promedio_asignacion_horas).toFixed(1)} horas` : 'Sin datos'}</p>
        </article>
      </div>
    </section>
  )
}
