import { Routes, Route, Navigate } from 'react-router-dom'

// === SELECTOR DE MÓDULOS ===
import ModuleSelector from './components/ModuleSelector'

// === LAYOUT DEL BUDGET ===
import BudgetLayout from './components/BudgetLayout'

// === PÁGINAS DEL BUDGET ===
import PinGuard from './components/PinGuard'
import Dashboard from './components/Dashboard'
import GastosDiarios from './components/GastosDiarios'
import PresupuestoView from './components/PresupuestoView'
import AmortizacionesUpload from './components/AmortizacionesUpload'
import CierreMesView from './components/CierreMesView'
import CargaGastosView from './components/CargaGastosView'
import Planificador from './components/Planificador'
import CalendarioMantenimiento from './components/CalendarioMantenimiento'

// === AVANCE SEMANAL ===
import AvanceLayout from './modules/avance-semanal/components/AvanceLayout'
import AvanceDashboard from './modules/avance-semanal/pages/AvanceDashboard'
import AvanceFormulario from './modules/avance-semanal/pages/AvanceFormulario'
import AvanceReportes from './modules/avance-semanal/pages/AvanceReportes'

function App() {
  return (
    <Routes>
      {/* Pantalla de bienvenida / selector de módulos */}
      <Route path="/" element={<ModuleSelector />} />

      {/* === RUTAS DEL PLATINUM BUDGET (con Sidebar + Header) === */}
      <Route element={<BudgetLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/presupuesto" element={<PresupuestoView />} />
        <Route path="/planificador" element={<Planificador />} />
        <Route path="/mantenimientos" element={<CalendarioMantenimiento />} />

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
        <Route path="/carga-gastos" element={
          <PinGuard title="Carga de Gastos">
            <CargaGastosView />
          </PinGuard>
        } />
      </Route>

      {/* === RUTAS DEL AVANCE SEMANAL KFC === */}
      <Route path="/avance-semanal" element={<AvanceLayout />}>
        <Route index element={<AvanceDashboard />} />
        <Route path="formulario" element={<AvanceFormulario />} />
        <Route path="reportes" element={<AvanceReportes />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
