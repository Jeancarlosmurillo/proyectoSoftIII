import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { RolUsuario, UsuarioSesion } from '../types'

export const usuariosPrueba: UsuarioSesion[] = [
  { id: 1, nombre: 'Ana Solicitante', rol: 'solicitante', tipo: 'Estudiante' },
  { id: 2, nombre: 'Carlos Agente', rol: 'agente' },
  { id: 3, nombre: 'Maria Validador', rol: 'validador' },
  { id: 4, nombre: 'Pedro Administrador', rol: 'administrador' },
]

interface AuthContextValue {
  usuarioActual: UsuarioSesion
  cambiarUsuario: (id: number) => void
  tieneRol: (...roles: RolUsuario[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuarioId, setUsuarioId] = useState(() => {
    const saved = localStorage.getItem('campushelp_usuario_id')
    return saved ? Number(saved) : 2
  })
  const usuarioActual = usuariosPrueba.find((usuario) => usuario.id === usuarioId) ?? usuariosPrueba[0]
  const value = useMemo(() => ({
    usuarioActual,
    cambiarUsuario: (id: number) => {
      if (!usuariosPrueba.some((usuario) => usuario.id === id)) {
        throw new Error('El usuario de prueba seleccionado no existe')
      }
      setUsuarioId(id)
      localStorage.setItem('campushelp_usuario_id', String(id))
    },
    tieneRol: (...roles: RolUsuario[]) =>
      roles.includes(usuarioActual.rol) || usuarioActual.rol === 'administrador',
  }), [usuarioActual])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  return context
}
