import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/common/MainLayout'
import BandejaPage from '../pages/BandejaPage'
import DetalleCasoPage from '../pages/DetalleCasoPage'
import NotFoundPage from '../pages/NotFoundPage'
import RegistroPage from '../pages/RegistroPage'
import MisCasosPage from '../pages/MisCasosPage'

export default function AppRoutes() {
  return <Routes><Route element={<MainLayout />}><Route index element={<Navigate to="/bandeja" replace />} /><Route path="/bandeja" element={<BandejaPage />} /><Route path="/mis-casos" element={<MisCasosPage />} /><Route path="/nuevo-caso" element={<RegistroPage />} /><Route path="/caso/:id" element={<DetalleCasoPage />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes>
}
