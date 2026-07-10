import { useState, useEffect, useRef } from 'react'
import { Plus, Check, Search } from 'lucide-react'
import { useTiendas, useProveedores } from '../hooks/useSupabase'

interface GastoFormProps {
  onSubmit: (gasto: any) => void;
  onCancel?: () => void;
}

const PERIODOS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const CLASIFICACIONES = [
  'INFRAESTRUCTURA', 'PLOMERIA', 'ALARMA ROBO', 'ALARMA INCENDIO',
  'EXTINTORES', 'EQUIPO', 'REFRIGERACION', 'EBANISTERIA',
  'GAS', 'LETRERO', 'ACERO INOXIDABLE', 'TRAMPAS DE GRASA', 'TRANSPORTE', 'OTROS'
]

export default function GastoForm({ onSubmit, onCancel }: GastoFormProps) {
  const { tiendas } = useTiendas()
  const { proveedores } = useProveedores()

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    periodo: PERIODOS[new Date().getMonth()],
    orden_compra: '',
    factura: '',
    proveedor_id: '',
    descripcion: '',
    clasificacion: CLASIFICACIONES[0],
    monto: '',
    tienda_id: '',
    gerente_area: '',
    gerente_regional: '',
  })

  // Búsqueda de tiendas
  const [tiendaSearch, setTiendaSearch] = useState('')
  const [showTiendaResults, setShowTiendaResults] = useState(false)
  const tiendaRef = useRef<HTMLDivElement>(null)

  // Búsqueda de proveedores
  const [provSearch, setProvSearch] = useState('')
  const [showProvResults, setShowProvResults] = useState(false)
  const [selectedProvIndex, setSelectedProvIndex] = useState(-1)
  const provRef = useRef<HTMLDivElement>(null)

  // Filtrar tiendas
  const filteredTiendas = tiendaSearch 
    ? tiendas.filter(t => 
        t.nombre.toLowerCase().includes(tiendaSearch.toLowerCase()) ||
        t.codigo.toString().includes(tiendaSearch)
      )
    : []

  // Filtrar proveedores
  const filteredProveedores = provSearch
    ? proveedores.filter(p => 
        p.nombre.toLowerCase().includes(provSearch.toLowerCase()) ||
        p.codigo.toLowerCase().includes(provSearch.toLowerCase())
      )
    : []

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tiendaRef.current && !tiendaRef.current.contains(event.target as Node)) {
        setShowTiendaResults(false)
      }
      if (provRef.current && !provRef.current.contains(event.target as Node)) {
        setShowProvResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTiendaSelect = (tiendaId: string) => {
    const tienda = tiendas.find(t => t.id === tiendaId)
    setFormData(prev => ({
      ...prev,
      tienda_id: tiendaId,
      gerente_area: tienda?.gerente_area || '',
      gerente_regional: tienda?.gerente_regional || '',
    }))
    setTiendaSearch(`${tienda?.codigo} - ${tienda?.nombre}`)
    setShowTiendaResults(false)
  }

  const handleProveedorSelect = (proveedorId: string) => {
    const proveedor = proveedores.find(p => p.id === proveedorId)
    const clasificacionProveedor = proveedor?.clasificacion?.nombre || CLASIFICACIONES[0]
    
    setFormData(prev => ({
      ...prev,
      proveedor_id: proveedorId,
      clasificacion: clasificacionProveedor,
    }))
    setProvSearch(`${proveedor?.codigo} - ${proveedor?.nombre}`)
    setShowProvResults(false)
    setSelectedProvIndex(-1)
  }

  // Navegación con teclado para proveedores
  const handleProvKeyDown = (e: React.KeyboardEvent) => {
    if (!showProvResults || filteredProveedores.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedProvIndex(prev => (prev + 1) % filteredProveedores.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedProvIndex(prev => (prev - 1 + filteredProveedores.length) % filteredProveedores.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedProvIndex >= 0) {
        handleProveedorSelect(filteredProveedores[selectedProvIndex].id)
      }
    } else if (e.key === 'Escape') {
      setShowProvResults(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      monto: parseFloat(formData.monto),
      orden_compra: formData.orden_compra || null,
      factura: formData.factura || null,
      proveedor_id: formData.proveedor_id || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="card-solid space-y-5 animate-fade-in">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Nuevo Gasto</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha *</label>
          <input type="date" required value={formData.fecha} onChange={e => setFormData(prev => ({ ...prev, fecha: e.target.value }))} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Periodo *</label>
          <select required value={formData.periodo} onChange={e => setFormData(prev => ({ ...prev, periodo: e.target.value }))} className="input-field">
            {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Tienda con búsqueda inteligente */}
        <div ref={tiendaRef}>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tienda *</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Escribe código o nombre..." 
              value={tiendaSearch}
              onChange={e => {
                setTiendaSearch(e.target.value)
                setShowTiendaResults(true)
              }}
              onFocus={() => setShowTiendaResults(true)}
              className="input-field pl-10"
            />
          </div>
          {showTiendaResults && filteredTiendas.length > 0 && (
            <div className="absolute z-50 w-full max-w-md mt-1 max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-lg">
              {filteredTiendas.map(t => (
                <button 
                  key={t.id} 
                  type="button" 
                  onClick={() => handleTiendaSelect(t.id)} 
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm transition-colors border-b border-slate-50 last:border-0"
                >
                  <span className="font-bold text-slate-700">{t.codigo}</span>
                  <span className="text-slate-400 mx-2">-</span>
                  <span className="text-slate-600">{t.nombre}</span>
                </button>
              ))}
            </div>
          )}
          {showTiendaResults && tiendaSearch && filteredTiendas.length === 0 && (
            <div className="absolute z-50 w-full mt-1 p-3 bg-white border border-slate-200 rounded-xl shadow-lg text-sm text-slate-400">
              No se encontraron tiendas
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Orden de Compra</label>
          <input type="text" placeholder="Opcional" value={formData.orden_compra} onChange={e => setFormData(prev => ({ ...prev, orden_compra: e.target.value }))} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Factura</label>
          <input type="text" placeholder="Opcional" value={formData.factura} onChange={e => setFormData(prev => ({ ...prev, factura: e.target.value }))} className="input-field" />
        </div>

        {/* Proveedor con búsqueda inteligente y navegación por teclado */}
        <div ref={provRef}>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Proveedor</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Escribe código o nombre..." 
              value={provSearch}
              onChange={e => {
                setProvSearch(e.target.value)
                setShowProvResults(true)
                setSelectedProvIndex(-1)
              }}
              onFocus={() => setShowProvResults(true)}
              onKeyDown={handleProvKeyDown}
              className="input-field pl-10"
            />
          </div>
          {showProvResults && filteredProveedores.length > 0 && (
            <div className="absolute z-50 w-full max-w-md mt-1 max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-lg">
              {filteredProveedores.map((p, index) => (
                <button 
                  key={p.id} 
                  type="button" 
                  onClick={() => handleProveedorSelect(p.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-slate-50 last:border-0 ${
                    index === selectedProvIndex ? 'bg-blue-100 text-blue-700' : 'hover:bg-blue-50 text-slate-700'
                  }`}
                >
                  <span className="font-bold">{p.codigo}</span>
                  <span className="text-slate-400 mx-2">-</span>
                  <span>{p.nombre}</span>
                  {p.clasificacion?.nombre && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                      {p.clasificacion.nombre}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {showProvResults && provSearch && filteredProveedores.length === 0 && (
            <div className="absolute z-50 w-full mt-1 p-3 bg-white border border-slate-200 rounded-xl shadow-lg text-sm text-slate-400">
              No se encontraron proveedores
            </div>
          )}
          {formData.proveedor_id && (
            <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
              <Check className="w-3 h-3" />
              {proveedores.find(p => p.id === formData.proveedor_id)?.clasificacion?.nombre || 'Sin clasificación'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Clasificación *</label>
          <select required value={formData.clasificacion} onChange={e => setFormData(prev => ({ ...prev, clasificacion: e.target.value }))} className="input-field">
            {CLASIFICACIONES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto ($) *</label>
          <input type="number" step="0.01" min="0" required placeholder="0.00" value={formData.monto} onChange={e => setFormData(prev => ({ ...prev, monto: e.target.value }))} className="input-field" />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción *</label>
          <textarea required rows={2} placeholder="Detalle del gasto..." value={formData.descripcion} onChange={e => setFormData(prev => ({ ...prev, descripcion: e.target.value }))} className="input-field" />
        </div>

        {formData.gerente_area && (
          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Gerente de Área</span>
              <p className="font-medium text-sm text-slate-800">{formData.gerente_area}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Gerente Regional</span>
              <p className="font-medium text-sm text-slate-800">{formData.gerente_regional}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
        )}
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Check className="w-4 h-4" />
          Guardar Gasto
        </button>
      </div>
    </form>
  )
}
