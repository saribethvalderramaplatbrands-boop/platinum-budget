import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import PresupuestoView from './components/PresupuestoView'
import Planificador from './components/Planificador'
import AmortizacionesUpload from './components/AmortizacionesUpload'
import CierreMesView from './components/CierreMesView'

// Placeholder rápido para Gastos Diarios mientras decides
function GastosDiarios() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Gastos Diarios</h2>
      <p className="text-slate-500">En construcción...</p>
    </div>
  )
}

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
            <Route path="/amortizaciones" element={<AmortizacionesUpload />} />
            <Route path="/cierre-mes" element={<CierreMesView />} />
            <Route path="/planificador" element={<Planificador />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
