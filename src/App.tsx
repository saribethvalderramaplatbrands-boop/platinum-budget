import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import PresupuestoView from './pages/PresupuestoView'
import AmortizacionesView from './pages/AmortizacionesView'
import CierreDeMes from './pages/CierreDeMes'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/presupuesto" element={<PresupuestoView />} />
            <Route path="/amortizaciones" element={<AmortizacionesView />} />
            <Route path="/cierre-mes" element={<CierreDeMes />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
