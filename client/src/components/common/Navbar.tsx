import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { usuarioActual, usuarios, cambiarUsuario } = useAuth()
  const grupos = [
    { rol: 'solicitante', etiqueta: 'Solicitantes', usuarios: usuarios.filter((usuario) => usuario.rol === 'solicitante') },
    { rol: 'agente', etiqueta: 'Agentes', usuarios: usuarios.filter((usuario) => usuario.rol === 'agente') },
    { rol: 'validador', etiqueta: 'Validadores', usuarios: usuarios.filter((usuario) => usuario.rol === 'validador') },
    { rol: 'administrador', etiqueta: 'Administradores', usuarios: usuarios.filter((usuario) => usuario.rol === 'administrador') },
  ]
  return (
    <header className="app-header">
      <Link className="brand" to="/inicio" aria-label="Ir al inicio de CampusHelp">
        <div className="brand-mark">CH</div>
        <div>
          <p className="eyebrow">Mesa de servicios TI</p>
          <h1>CampusHelp <span>-</span> Mesa de servicios</h1>
        </div>
      </Link>
      <div className="global-user">
        <span className="profile-avatar">{usuarioActual.nombre.split(' ').map((item) => item[0]).join('').slice(0, 2)}</span>
        <select aria-label="Usuario de prueba" value={usuarioActual.id} onChange={(event) => cambiarUsuario(Number(event.target.value))}>
          {grupos.map((grupo) => (
            <optgroup key={grupo.rol} label={grupo.etiqueta}>
              {grupo.usuarios.map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.nombre}{usuario.tipo ? ` · ${usuario.tipo}` : ''}</option>)}
            </optgroup>
          ))}
        </select>
      </div>
    </header>
  )
}
