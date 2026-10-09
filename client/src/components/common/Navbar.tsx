import { Link } from 'react-router-dom'
import { useAuth, usuariosPrueba } from '../../context/AuthContext'

export default function Navbar() {
  const { usuarioActual, cambiarUsuario } = useAuth()
  return (
    <header className="app-header">
      <Link className="brand" to="/bandeja" aria-label="Ir a la bandeja de casos">
        <div className="brand-mark">CH</div>
        <div>
          <p className="eyebrow">Mesa de servicios TI</p>
          <h1>CampusHelp <span>-</span> Bandeja de Casos</h1>
        </div>
      </Link>
      <div className="global-user">
        <span className="profile-avatar">{usuarioActual.nombre.split(' ').map((item) => item[0]).join('').slice(0, 2)}</span>
        <select aria-label="Usuario de prueba" value={usuarioActual.id} onChange={(event) => cambiarUsuario(Number(event.target.value))}>
          {usuariosPrueba.map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.nombre}{usuario.tipo ? ` · ${usuario.tipo}` : ` · ${usuario.rol}`}</option>)}
        </select>
      </div>
    </header>
  )
}
