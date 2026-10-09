import type { RolUsuario } from '../../types'

export default function RoleBadge({ role }: { role: RolUsuario }) {
  return <span className={`role-badge role-badge--${role}`}>{role}</span>
}
