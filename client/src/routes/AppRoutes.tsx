import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/common/MainLayout'
import BandejaPage from '../pages/BandejaPage'
import DetalleCasoPage from '../pages/DetalleCasoPage'
import NotFoundPage from '../pages/NotFoundPage'
import RegistroPage from '../pages/RegistroPage'
import MisCasosPage from '../pages/MisCasosPage'
import IndicadoresPage from '../pages/IndicadoresPage'
import InicioPage from '../pages/InicioPage'

export default function AppRoutes() {
  return <Routes><Route element={<MainLayout />}><Route index element={<Navigate to="/inicio" replace />} /><Route path="/inicio" element={<InicioPage />} /><Route path="/bandeja" element={<BandejaPage />} /><Route path="/mis-casos" element={<MisCasosPage />} /><Route path="/nuevo-caso" element={<RegistroPage />} /><Route path="/indicadores" element={<IndicadoresPage />} /><Route path="/caso/:id" element={<DetalleCasoPage />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes>
}
