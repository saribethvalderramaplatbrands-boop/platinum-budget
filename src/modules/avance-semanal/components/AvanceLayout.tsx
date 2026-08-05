import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { ClipboardList, BarChart3, FileSpreadsheet, ArrowLeft } from 'lucide-react'

export default function AvanceLayout() {
  const navigate = useNavigate()

  const navItems = [
    { to: '/avance-semanal', label: 'Dashboard', icon: BarChart3 },
    { to: '/avance-semanal/formulario', label: 'Formulario', icon: ClipboardList },
    { to: '/avance-semanal/reportes', label: 'Reportes', icon: FileSpreadsheet },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
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

        <nav className="flex-1 p-3 space-y-1">
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
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
