import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return <section className="empty-page"><h2>Página no encontrada</h2><p>La ruta solicitada no existe.</p><Link className="button-primary" to="/bandeja">Ir a la bandeja</Link></section>
}
