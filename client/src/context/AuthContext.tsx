import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { RolUsuario, UsuarioSesion } from '../types'

export const usuariosPrueba: UsuarioSesion[] = [
  { id: 1, nombre: 'Ana Solicitante', rol: 'solicitante', tipo: 'Estudiante' },
  { id: 2, nombre: 'Carlos Agente', rol: 'agente' },
  { id: 4, nombre: 'Pedro Administrador', rol: 'administrador' },
]

interface AuthContextValue {
  usuarioActual: UsuarioSesion
  usuarios: UsuarioSesion[]
  cambiarUsuario: (id: number) => void
  tieneRol: (...roles: RolUsuario[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuarioId, setUsuarioId] = useState(2)
  const [usuarios, setUsuarios] = useState(usuariosPrueba)
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'}/usuarios`)
      .then((response) => {
        if (!response.ok) throw new Error('No fue posible cargar los usuarios')
        return response.json() as Promise<UsuarioSesion[]>
      })
      .then((usuariosApi) => {
        if (usuariosApi.length > 0) {
          const usuariosUnicos = usuariosApi.filter((usuario, index, lista) =>
            lista.findIndex((item) => item.nombre === usuario.nombre && item.rol === usuario.rol) === index,
          )
          setUsuarios(usuariosUnicos)
          const agente = usuariosUnicos.find((usuario) => usuario.rol === 'agente')
          if (agente) setUsuarioId(agente.id)
        }
      })
      .catch(() => undefined)
  }, [])
  const usuarioActual = usuarios.find((usuario) => usuario.id === usuarioId) ?? usuarios[0]
  const value = useMemo(() => ({
    usuarios,
    usuarioActual,
    cambiarUsuario: (id: number) => {
      if (!usuarios.some((usuario) => usuario.id === id)) {
        throw new Error('El usuario de prueba seleccionado no existe')
      }
      setUsuarioId(id)
    },
    tieneRol: (...roles: RolUsuario[]) =>
      roles.includes(usuarioActual.rol) || usuarioActual.rol === 'administrador',
  }), [usuarioActual, usuarios])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  return context
}
