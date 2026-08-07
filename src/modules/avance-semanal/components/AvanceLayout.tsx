import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { ClipboardList, BarChart3, FileSpreadsheet, ArrowLeft, ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { useState } from 'react'

export default function AvanceLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { to: '/avance-semanal', label: 'Dashboard', icon: BarChart3 },
    { to: '/avance-semanal/formulario', label: 'Formulario', icon: ClipboardList },
    { to: '/avance-semanal/reportes', label: 'Reportes', icon: FileSpreadsheet },
  ]

  const isFormulario = location.pathname.includes('/formulario')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR FIJO Y COLAPSABLE */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-40 transition-all duration-300 ease-in-out shadow-lg ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a módulos
          </button>
          <h2 className="mt-3 text-lg font-bold text-red-700">
            Avance Semanal KFC
          </h2>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/avance-semanal'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {/* BOTÓN TOGGLE FLOTANTE (siempre visible) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed z-50 top-4 bg-white border border-gray-200 rounded-lg shadow-md p-2 hover:bg-gray-50 transition-all duration-300 ${
          sidebarOpen ? 'left-[268px]' : 'left-4'
        }`}
        title={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4 text-gray-600" /> : <Menu className="w-4 h-4 text-gray-600" />}
      </button>

      {/* MAIN CON MARGIN ADAPTATIVO */}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
