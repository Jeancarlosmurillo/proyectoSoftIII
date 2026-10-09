import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CasosProvider } from './context/CasosContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider><CasosProvider><AppRoutes /></CasosProvider></AuthProvider></BrowserRouter>
}
