import { NavLink } from 'react-router-dom'
import { X, LayoutDashboard, Receipt, PieChart, FileSpreadsheet, CalendarCheck, TrendingUp, Wrench, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, color: 'blue', accent: '#2563eb', bgAccent: '#eff6ff' },
  { path: '/gastos', label: 'Gastos Diarios', icon: Receipt, color: 'emerald', accent: '#059669', bgAccent: '#ecfdf5' },
  { path: '/presupuesto', label: 'Presupuesto', icon: PieChart, color: 'violet', accent: '#7c3aed', bgAccent: '#f5f3ff' },
  { path: '/amortizaciones', label: 'Amortizaciones', icon: FileSpreadsheet, color: 'orange', accent: '#ea580c', bgAccent: '#fff7ed' },
  { path: '/cierre-mes', label: 'Cierre de Mes', icon: CalendarCheck, color: 'rose', accent: '#e11d48', bgAccent: '#fff1f2' },
  { path: '/mantenimientos', label: 'Mantenimientos', icon: Wrench, color: 'violet', accent: '#7c3aed', bgAccent: '#f5f3ff' },
  { path: '/planificador', label: 'Planificador', icon: TrendingUp, color: 'cyan', accent: '#0891b2', bgAccent: '#ecfeff' },
]

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - sticky en desktop, fixed en mobile */}
      <aside className={`
        fixed lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:overflow-x-hidden
        inset-y-0 left-0 z-50 
        ${isCollapsed ? 'w-20' : 'w-72'} 
        transform transition-all duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col shrink-0
      `}
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
        borderRight: '1px solid #e2e8f0',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.04)'
      }}
      >
        {/* Toggle button (solo desktop, arriba) */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex mx-auto mt-4 mb-2 p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          title={isCollapsed ? 'Expandir' : 'Colapsar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Close button (solo mobile) */}
        <div className="p-4 flex justify-end lg:hidden">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className={`px-4 py-2 mb-2 ${isCollapsed ? 'text-center' : ''}`}>
            <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest ${isCollapsed ? 'hidden' : ''}`}>
              Menú Principal
            </p>
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
                  <div 
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${isCollapsed ? 'justify-center px-2' : ''}
                    `}
                    style={{
                      backgroundColor: isActive ? item.bgAccent : 'transparent',
                      color: isActive ? item.accent : '#475569',
                      borderLeft: isActive ? `3px solid ${item.accent}` : '3px solid transparent',
                      boxShadow: isActive ? `0 2px 8px ${item.accent}15` : 'none',
                      transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#f8fafc'
                        e.currentTarget.style.color = '#1e293b'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#475569'
                      }
                    }}
                  >
                    <div 
                      className="p-2 rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: isActive ? `${item.accent}20` : '#f1f5f9',
                        color: isActive ? item.accent : '#94a3b8',
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {!isCollapsed && <span>{item.label}</span>}
                    {!isCollapsed && isActive && (
                      <div 
                        className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: item.accent }}
                      />
                    )}
                  </div>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer con branding */}
        <div 
          className={`p-4 border-t border-slate-100 ${isCollapsed ? 'hidden' : ''}`}
          style={{ background: 'linear-gradient(180deg, transparent 0%, #f8fafc 100%)' }}
        >
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Marcas</p>
            <div className="flex items-center justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
              <div 
                className="flex items-center justify-center p-2 rounded-lg"
                style={{ backgroundColor: '#dbeafe' }}
                title="Dairy Queen"
              >
                <img src="/dq-logo.png" alt="DQ" className="h-4 w-auto object-contain" style={{ filter: 'grayscale(0.3)' }} />
              </div>
              <div 
                className="flex items-center justify-center p-2 rounded-lg"
                style={{ backgroundColor: '#fee2e2' }}
                title="Kentucky Fried Chicken"
              >
                <img src="/kfc-logo.png" alt="KFC" className="h-4 w-auto object-contain" style={{ filter: 'grayscale(0.3)' }} />
              </div>
            </div>
            <p className="text-[9px] text-slate-400 mt-1">Platinum Brands</p>
          </div>
        </div>
      </aside>
    </>
  )
}
