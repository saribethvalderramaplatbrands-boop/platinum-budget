import { useNavigate } from 'react-router-dom'
import { BarChart3, ClipboardList, ArrowRight } from 'lucide-react'

export default function ModuleSelector() {
  const navigate = useNavigate()

  const modules = [
    {
      id: 'budget',
      title: 'Platinum Budget',
      subtitle: 'Mantenimiento & Presupuestos',
      description: 'Gestión de gastos diarios, presupuestos mensuales, amortizaciones y cierres.',
      icon: BarChart3,
      color: 'bg-gradient-to-br from-slate-700 to-slate-900',
      hover: 'hover:shadow-2xl hover:scale-[1.02]',
      path: '/dashboard',
      textColor: 'text-white',
    },
    {
      id: 'avance',
      title: 'Avance Semanal KFC',
      subtitle: 'Reportes Operativos',
      description: 'Formulario semanal de avance por gerente, tienda y regional. Exportación a Excel.',
      icon: ClipboardList,
      color: 'bg-gradient-to-br from-red-700 to-red-900',
      hover: 'hover:shadow-2xl hover:scale-[1.02]',
      path: '/avance-semanal',
      textColor: 'text-white',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Platinum Brands
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Selecciona el módulo al que deseas ingresar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {modules.map((mod) => {
          const Icon = mod.icon
          return (
            <button
              key={mod.id}
              onClick={() => navigate(mod.path)}
              className={`relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-300 ${mod.color} ${mod.hover} ${mod.textColor}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Icon className="w-8 h-8" />
                </div>
                <ArrowRight className="w-6 h-6 opacity-60" />
              </div>
              <h2 className="text-2xl font-bold mb-1">{mod.title}</h2>
              <p className="text-sm font-medium opacity-80 mb-3">{mod.subtitle}</p>
              <p className="text-sm opacity-70 leading-relaxed">{mod.description}</p>
            </button>
          )
        })}
      </div>

      <p className="mt-10 text-xs text-gray-400 dark:text-gray-600">
        © 2026 Platinum Brands — Panamá
      </p>
    </div>
  )
}
