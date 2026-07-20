import { BarChart3, Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { dark, toggle } = useTheme()

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button 
              onClick={onMenuClick} 
              className="p-2 rounded-xl hover:bg-slate-100 lg:hidden transition-colors"
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            
            <div className="flex items-center gap-3">
              {/* Logo Platinum Brands */}
              <div className="relative">
                <img 
                  src="/platinum-logo.png" 
                  alt="Platinum Brands" 
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
              <div className="hidden sm:block h-8 w-px bg-slate-200" />
              <div className="hidden sm:flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Platinum Budget
                  </h1>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                    Presupuesto de Mantenimiento
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Logos de marcas pequeños */}
            <div className="hidden md:flex items-center gap-2">
              <img 
                src="/dq-logo.png" 
                alt="DQ" 
                className="h-6 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <img 
                src="https://ojrtrfbikapdqngokxvj.supabase.co/storage/v1/object/public/assets/kfc-logo.png" 
                alt="KFC" 
                className="h-6 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>

            {/* Botón modo día / noche */}
            <button
              onClick={toggle}
              title={dark ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
              className="p-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
              style={{
                background: dark
                  ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
                  : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                boxShadow: dark
                  ? '0 4px 12px rgba(245, 158, 11, 0.4)'
                  : '0 4px 12px rgba(15, 23, 42, 0.35)'
              }}
            >
              {dark
                ? <Sun className="w-5 h-5 text-white" />
                : <Moon className="w-5 h-5 text-white" />
              }
            </button>
            
            <div className="text-sm font-medium text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg">
              {new Date().toLocaleDateString('es-PA', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
