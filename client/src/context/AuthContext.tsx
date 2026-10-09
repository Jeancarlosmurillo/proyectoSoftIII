import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { RolUsuario, UsuarioSesion } from '../types'

export const usuariosPrueba: UsuarioSesion[] = [
  { id: 24, nombre: 'Ana Torres', rol: 'solicitante', tipo: 'Estudiante' },
  { id: 25, nombre: 'Laura Gómez', rol: 'solicitante', tipo: 'Docente' },
  { id: 26, nombre: 'Miguel Rojas', rol: 'solicitante', tipo: 'Personal administrativo' },
  { id: 2, nombre: 'Carlos Agente', rol: 'agente' },
  { id: 4, nombre: 'Pedro Administrador', rol: 'administrador' },
]

interface AuthContextValue {
  usuarioActual: UsuarioSesion
  cambiarUsuario: (id: number) => void
  tieneRol: (...roles: RolUsuario[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuarioId, setUsuarioId] = useState(2)
  const usuarioActual = usuariosPrueba.find((usuario) => usuario.id === usuarioId) ?? usuariosPrueba[0]
  const value = useMemo(() => ({
    usuarioActual,
    cambiarUsuario: (id: number) => {
      if (!usuariosPrueba.some((usuario) => usuario.id === id)) {
        throw new Error('El usuario de prueba seleccionado no existe')
      }
      setUsuarioId(id)
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
