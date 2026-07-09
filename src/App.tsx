import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import GastosDiarios from './pages/GastosDiarios'
import PresupuestoView from './pages/PresupuestoView'
import AmortizacionesView from './pages/AmortizacionesView'
import CierreDeMes from './pages/CierreDeMes'
import Planificador from './pages/Planificador'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/gastos" element={<GastosDiarios />} />
            <Route path="/presupuesto" element={<PresupuestoView />} />
            <Route path="/amortizaciones" element={<AmortizacionesView />} />
            <Route path="/cierre-mes" element={<CierreDeMes />} />
            <Route path="/planificador" element={<Planificador />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
