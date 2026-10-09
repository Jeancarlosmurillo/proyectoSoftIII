import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function MainLayout() {
  return (
    <div className="layout-shell">
      <Navbar />
      <div className="layout-body">
        <Sidebar />
        <main className="layout-content"><Outlet /></main>
      </div>
    </div>
  )
}
