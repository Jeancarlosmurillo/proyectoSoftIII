import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Sidebar() {
  const { usuarioActual } = useAuth()
  const link = (to: string, label: string, icon: string) => (
    <NavLink to={to} className={({ isActive }) => isActive ? 'sidebar-link is-active' : 'sidebar-link'}>
      <span aria-hidden="true">{icon}</span> {label}
    </NavLink>
  )
  return (
    <aside className="sidebar">
      <p className="sidebar-label">Operación</p>
      <nav aria-label="Navegación principal">
        {link('/inicio', 'Inicio', '⌂')}
        {(usuarioActual.rol === 'agente' || usuarioActual.rol === 'validador' || usuarioActual.rol === 'administrador') && link('/bandeja', usuarioActual.rol === 'validador' ? 'Tablero de supervisión' : 'Bandeja operativa', '▦')}
        {usuarioActual.rol === 'solicitante' && link('/mis-casos', 'Mis casos', '▤')}
        {usuarioActual.rol === 'agente' && link('/mis-casos', 'Mis asignaciones', '✓')}
        {usuarioActual.rol === 'validador' && link('/mis-casos', 'Casos por validar', '◈')}
        {usuarioActual.rol === 'administrador' && link('/mis-casos', 'Todos los casos', '▤')}
        {(usuarioActual.rol === 'solicitante' || usuarioActual.rol === 'administrador') && link('/nuevo-caso', 'Registrar nuevo caso', '＋')}
        {usuarioActual.rol === 'administrador' && link('/indicadores', 'Indicadores', '▥')}
      </nav>
      <div className="sidebar-footer">
        <p className="sidebar-label">ScrumBan</p>
        <p>Gestiona el flujo, respeta el WIP y ayuda a desbloquear el trabajo existente.</p>
      </div>
    </aside>
  )
}
