import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import PinGuard from './components/PinGuard'
import Dashboard from './components/Dashboard'
import GastosDiarios from './components/GastosDiarios'
import PresupuestoView from './components/PresupuestoView'
import AmortizacionesUpload from './components/AmortizacionesUpload'
import CierreMesView from './components/CierreMesView'
import Planificador from './components/Planificador'

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
            <Route path="/presupuesto" element={<PresupuestoView />} />
            <Route path="/planificador" element={<Planificador />} />
            
            {/* Rutas protegidas con PIN */}
            <Route path="/gastos" element={
              <PinGuard title="Gastos Diarios">
                <GastosDiarios />
              </PinGuard>
            } />
            <Route path="/amortizaciones" element={
              <PinGuard title="Amortizaciones">
                <AmortizacionesUpload />
              </PinGuard>
            } />
            <Route path="/cierre-mes" element={
              <PinGuard title="Cierre de Mes">
                <CierreMesView />
              </PinGuard>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
