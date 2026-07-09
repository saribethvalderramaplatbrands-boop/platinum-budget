import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Wallet, 
  Calculator, 
  FileSpreadsheet, 
  X 
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/presupuesto', icon: Wallet, label: 'Presupuesto' },
    { to: '/amortizaciones', icon: Calculator, label: 'Amortizaciones' },
    { to: '/cierre-mes', icon: FileSpreadsheet, label: 'Cierre de Mes' },
  ]

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[70] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-[80] w-64 bg-white border-r border-slate-200 
          transform transition-transform duration-300 ease-in-out lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden">
          <span className="font-bold text-slate-800">Menú</span>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-blue-50 text-blue-600 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">
            Platinum Budget v1.0
          </p>
        </div>
      </aside>
    </>
  )
}
