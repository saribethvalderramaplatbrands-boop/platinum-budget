import { NavLink } from 'react-router-dom'
import { X, LayoutDashboard, Receipt, PieChart, FileSpreadsheet, CalendarCheck, TrendingUp } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, color: 'blue' },
  { path: '/gastos', label: 'Gastos Diarios', icon: Receipt, color: 'emerald' },
  { path: '/presupuesto', label: 'Presupuesto', icon: PieChart, color: 'violet' },
  { path: '/amortizaciones', label: 'Amortizaciones', icon: FileSpreadsheet, color: 'orange' },
  { path: '/cierre-mes', label: 'Cierre de Mes', icon: CalendarCheck, color: 'rose' },
  { path: '/planificador', label: 'Planificador', icon: TrendingUp, color: 'cyan' },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 sidebar-modern
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <img 
              src="/platinum-logo.png" 
              alt="Platinum Brands" 
              className="h-6 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <span className="font-bold text-slate-800">Platinum Budget</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <div className="px-4 py-3 mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menú Principal</p>
          </div>
          
          {menuItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
              >
                {({ isActive }) => (
                  <div className={`
                    sidebar-nav-item
                    ${isActive 
                      ? 'sidebar-nav-item-active' 
                      : 'text-slate-600 hover:text-slate-900'
                    }
                  `}>
                    <div className={`
                      p-2 rounded-lg transition-colors
                      ${isActive 
                        ? `bg-${item.color}-100 text-${item.color}-600` 
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                      }
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </div>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <div className="flex items-center justify-center gap-3 opacity-50">
            <img src="/dq-logo.png" alt="DQ" className="h-4 w-auto object-contain" />
            <img src="/kfc-logo.png" alt="KFC" className="h-4 w-auto object-contain" />
          </div>
        </div>
      </aside>
    </>
  )
}
