import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Sidebar() {
  const { usuarioActual } = useAuth()
  return (
    <aside className="sidebar">
      <p className="sidebar-label">Operación</p>
      <nav aria-label="Navegación principal">
        <NavLink to="/bandeja" className={({ isActive }) => isActive ? 'sidebar-link is-active' : 'sidebar-link'}>
          <span aria-hidden="true">▦</span> Bandeja de Casos
        </NavLink>
        <NavLink to="/mis-casos" className={({ isActive }) => isActive ? 'sidebar-link is-active' : 'sidebar-link'}>
          <span aria-hidden="true">▤</span> Mis Casos
        </NavLink>
        <NavLink to="/nuevo-caso" className={({ isActive }) => isActive ? 'sidebar-link is-active' : 'sidebar-link'}>
          <span aria-hidden="true">＋</span> Registrar Nuevo Caso
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'sidebar-link is-active' : 'sidebar-link'}>
          <span aria-hidden="true">📊</span> Dashboard
        </NavLink>
        {usuarioActual.rol === 'administrador' && (
          <NavLink to="/categorias" className={({ isActive }) => isActive ? 'sidebar-link is-active' : 'sidebar-link'}>
            <span aria-hidden="true">⚙</span> Categorías
          </NavLink>
        )}
      </nav>
      <div className="sidebar-footer">
        <p className="sidebar-label">ScrumBan</p>
        <p>Gestiona el flujo, respeta el WIP y ayuda a desbloquear el trabajo existente.</p>
      </div>
    </aside>
  )
}
