import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import GastoForm from './components/GastoForm'
import GastosTable from './components/GastosTable'
import PresupuestoView from './components/PresupuestoView'
import AmortizacionesUpload from './components/AmortizacionesUpload'
import CierreMesView from './components/CierreMesView'
import Planificador from './components/Planificador'
import { useGastos } from './hooks/useSupabase'
import { Plus, X } from 'lucide-react'

function GastosPage() {
  const [showForm, setShowForm] = useState(false)
  const { addGasto } = useGastos()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gastos Diarios</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cerrar Formulario' : 'Nuevo Gasto'}
        </button>
      </div>

      {showForm && (
        <GastoForm
          onSubmit={async (gasto) => {
            await addGasto(gasto)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <GastosTable />
    </div>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/gastos" element={<GastosPage />} />
            <Route path="/presupuesto" element={<PresupuestoView />} />
            <Route path="/amortizaciones" element={<AmortizacionesUpload />} />
            <Route path="/cierre-mes" element={<CierreMesView />} />
            <Route path="/planificador" element={<Planificador />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
git add .
git commit -m "force rebuild - fix header props"
git push origin main
