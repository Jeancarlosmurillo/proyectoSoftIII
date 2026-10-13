import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/common/MainLayout'
import BandejaPage from '../pages/BandejaPage'
import CategoriasPage from '../pages/CategoriasPage'
import DashboardPage from '../pages/DashboardPage'
import DetalleCasoPage from '../pages/DetalleCasoPage'
import MisCasosPage from '../pages/MisCasosPage'
import NotFoundPage from '../pages/NotFoundPage'
import RegistroPage from '../pages/RegistroPage'

export default function AppRoutes() {
  return <Routes><Route element={<MainLayout />}><Route index element={<Navigate to="/bandeja" replace />} /><Route path="/bandeja" element={<BandejaPage />} /><Route path="/mis-casos" element={<MisCasosPage />} /><Route path="/nuevo-caso" element={<RegistroPage />} /><Route path="/caso/:id" element={<DetalleCasoPage />} /><Route path="/dashboard" element={<DashboardPage />} /><Route path="/categorias" element={<CategoriasPage />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes>
}
