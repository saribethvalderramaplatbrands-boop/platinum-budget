import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useTiendas, useProveedores } from '../hooks/useSupabase'
import { 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Building2,
  DollarSign,
  Repeat,
  AlertTriangle,
  Sparkles,
  Search
} from 'lucide-react'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const TIPOS_SERVICIO = [
  'Mantenimiento de equipos de refrigeración y A/A',
  'Mantenimiento de trampas de grasa',
  'Mantenimiento de extintores',
  'Mantenimiento de Sistema de inyección y extracción',
  'Mantenimiento de bombas de agua'
]

// Colores por tipo de servicio
const COLORES_SERVICIO: Record<string, { bg: string; border: string; text: string; dot: string; gradient: string }> = {
  'Mantenimiento de equipos de refrigeración y A/A': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    gradient: 'from-blue-400 to-blue-600'
  },
  'Mantenimiento de trampas de grasa': {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    gradient: 'from-amber-400 to-amber-600'
  },
  'Mantenimiento de extintores': {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    dot: 'bg-red-500',
    gradient: 'from-red-400 to-red-600'
  },
  'Mantenimiento de Sistema de inyección y extracción': {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    gradient: 'from-emerald-400 to-emerald-600'
  },
  'Mantenimiento de bombas de agua': {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    dot: 'bg-violet-500',
    gradient: 'from-violet-400 to-violet-600'
  }
}

const FRECUENCIAS = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'bimestral', label: 'Bimestral' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' }
]

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const formatMoney = (amount: number) => {
  return '$' + (amount || 0).toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface Mantenimiento {
  id: string
  tienda_id: string
  fecha_programada: string
  tipo_servicio: string
  frecuencia: string
  proveedor_id: string | null
  monto_estimado: number
  descripcion: string
  estatus: 'Pendiente' | 'Completado' | 'Cancelado'
  fecha_tope: string
  gasto_registrado_id: string | null
}

export default function CalendarioMantenimiento() {
  const { tiendas } = useTiendas()
  const { proveedores } = useProveedores()
  
  const [año, setAño] = useState(2026)
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<'calendario' | 'lista'>('calendario')

  // Búsqueda de tiendas
  const [tiendaSearch, setTiendaSearch] = useState('')
  const [showTiendaResults, setShowTiendaResults] = useState(false)
  const tiendaRef = useRef<HTMLDivElement>(null)

  // Búsqueda de proveedores
  const [provSearch, setProvSearch] = useState('')
  const [showProvResults, setShowProvResults] = useState(false)
  const [selectedProvIndex, setSelectedProvIndex] = useState(-1)
  const provRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    tienda_id: '',
    fecha_programada: '',
    tipo_servicio: TIPOS_SERVICIO[0],
    frecuencia: 'mensual',
    proveedor_id: '',
    monto_estimado: '',
    descripcion: '',
    fecha_tope: ''
  })

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

  const fetchMantenimientos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('mantenimientos_preventivos')
      .select('*')
      .eq('estatus', 'Pendiente')
      .order('fecha_programada', { ascending: true })

    if (error) {
      console.error('Error:', error)
    } else {
      setMantenimientos(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMantenimientos()
  }, [])

  const handleTiendaSelect = (tiendaId: string) => {
    const tienda = tiendas.find(t => t.id === tiendaId)
    setFormData(prev => ({ ...prev, tienda_id: tiendaId }))
    setTiendaSearch(`${tienda?.codigo} - ${tienda?.nombre}`)
    setShowTiendaResults(false)
  }

  const handleProveedorSelect = (proveedorId: string) => {
    const proveedor = proveedores.find(p => p.id === proveedorId)
    setFormData(prev => ({ ...prev, proveedor_id: proveedorId }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await supabase.from('mantenimientos_preventivos').insert([{
      tienda_id: formData.tienda_id,
      fecha_programada: formData.fecha_programada,
      tipo_servicio: formData.tipo_servicio,
      frecuencia: formData.frecuencia,
      proveedor_id: formData.proveedor_id || null,
      monto_estimado: parseFloat(formData.monto_estimado),
      descripcion: formData.descripcion,
      fecha_tope: formData.fecha_tope
    }])

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setShowForm(false)
      setFormData({
        tienda_id: '',
        fecha_programada: '',
        tipo_servicio: TIPOS_SERVICIO[0],
        frecuencia: 'mensual',
        proveedor_id: '',
        monto_estimado: '',
        descripcion: '',
        fecha_tope: ''
      })
      setTiendaSearch('')
      setProvSearch('')
      fetchMantenimientos()
    }
  }

  const completarMantenimiento = async (mantenimiento: Mantenimiento) => {
    if (!confirm('¿Completar este mantenimiento y registrar el gasto?')) return

    const { data: gastoData, error: gastoError } = await supabase
      .from('gastos_diarios')
      .insert([{
        tienda_id: mantenimiento.tienda_id,
        fecha: new Date().toISOString().split('T')[0],
        descripcion: mantenimiento.tipo_servicio + (mantenimiento.descripcion ? ' - ' + mantenimiento.descripcion : ''),
        monto: mantenimiento.monto_estimado,
        clasificacion: 'Servicios Fijos',
        proveedor_id: mantenimiento.proveedor_id,
        periodo: MESES[new Date().getMonth()],
        estatus: 'Completado'
      }])
      .select()

    if (gastoError) {
      alert('Error registrando gasto: ' + gastoError.message)
      return
    }

    const { error: updateError } = await supabase
      .from('mantenimientos_preventivos')
      .update({ 
        estatus: 'Completado',
        gasto_registrado_id: gastoData?.[0]?.id
      })
      .eq('id', mantenimiento.id)

    if (updateError) {
      alert('Error actualizando: ' + updateError.message)
      return
    }

    fetchMantenimientos()
    alert('✅ Mantenimiento completado y gasto registrado. Se ha programado el siguiente automáticamente.')
  }

  const cancelarMantenimiento = async (id: string) => {
    if (!confirm('¿Cancelar este mantenimiento?')) return
    
    const { error } = await supabase
      .from('mantenimientos_preventivos')
      .update({ estatus: 'Cancelado' })
      .eq('id', id)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      fetchMantenimientos()
    }
  }

  const mantenimientosFiltrados = mantenimientos.filter(m => {
    const fecha = new Date(m.fecha_programada)
    return fecha.getMonth() + 1 === mes && fecha.getFullYear() === año
  })

  const getDiasEnMes = (año: number, mes: number) => new Date(año, mes, 0).getDate()
  const getPrimerDiaMes = (año: number, mes: number) => new Date(año, mes - 1, 1).getDay()

  const renderCalendario = () => {
    const diasEnMes = getDiasEnMes(año, mes)
    const primerDia = getPrimerDiaMes(año, mes)
    const dias = []

    for (let i = 0; i < primerDia; i++) {
      dias.push(
        <div key={`empty-${i}`} className="h-32 bg-slate-100/50 rounded-xl border border-slate-200/50" />
      )
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const mantenimientosDia = mantenimientosFiltrados.filter(m => {
        const fecha = new Date(m.fecha_programada)
        return fecha.getDate() === dia
      })

      const isToday = dia === new Date().getDate() && mes === new Date().getMonth() + 1 && año === new Date().getFullYear()

      dias.push(
        <div key={dia} className={`
          h-32 rounded-xl border p-2 overflow-y-auto transition-all duration-200
          ${isToday 
            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-md shadow-blue-100' 
            : mantenimientosDia.length > 0 
              ? 'bg-white border-slate-200 shadow-sm hover:shadow-md' 
              : 'bg-white/60 border-slate-200/60 hover:bg-white hover:shadow-sm'
          }
        `}>
          <div className={`
            flex items-center justify-between mb-1.5
            ${isToday ? 'text-blue-600' : 'text-slate-400'}
          `}>
            <span className={`text-sm font-bold ${isToday ? 'text-blue-600' : ''}`}>{dia}</span>
            {isToday && <Sparkles className="w-3 h-3 text-blue-400" />}
          </div>
          
          {mantenimientosDia.map(m => {
            const tienda = tiendas.find(t => t.id === m.tienda_id)
            const colores = COLORES_SERVICIO[m.tipo_servicio] || COLORES_SERVICIO[TIPOS_SERVICIO[0]]
            
            return (
              <div 
                key={m.id} 
                className={`
                  text-[10px] p-1.5 rounded-lg mb-1.5 cursor-pointer 
                  transition-all duration-200 hover:scale-105 hover:shadow-md
                  ${colores.bg} ${colores.border} border ${colores.text}
                `}
                onClick={() => completarMantenimiento(m)}
                title="Click para completar"
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${colores.dot}`} />
                  <span className="font-bold truncate">{tienda?.nombre || 'Tienda'}</span>
                </div>
                <div className="truncate opacity-80">{m.tipo_servicio.split(' ').slice(0, 2).join(' ')}...</div>
                <div className="font-bold mt-0.5">{formatMoney(m.monto_estimado)}</div>
              </div>
            )
          })}
        </div>
      )
    }

    return dias
  }

  const totalMantenimientosMes = mantenimientosFiltrados.length
  const totalMontoMes = mantenimientosFiltrados.reduce((sum, m) => sum + m.monto_estimado, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header con gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 text-white shadow-lg shadow-violet-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Mantenimientos Preventivos</h2>
              <p className="text-sm text-violet-100">Calendario mensual de servicios programados</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'calendario' ? 'lista' : 'calendario')}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
            >
              {viewMode === 'calendario' ? 'Ver Lista' : 'Ver Calendario'}
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-white text-violet-600 rounded-lg text-sm font-bold hover:bg-violet-50 transition-colors flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg shadow-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-100 font-medium">Mantenimientos</p>
              <p className="text-2xl font-bold">{totalMantenimientosMes}</p>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-blue-100 mt-1">Programados este mes</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg shadow-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-100 font-medium">Monto Total</p>
              <p className="text-2xl font-bold">{formatMoney(totalMontoMes)}</p>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-100 mt-1">Presupuesto mensual</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white shadow-lg shadow-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-100 font-medium">Pendientes</p>
              <p className="text-2xl font-bold">{mantenimientosFiltrados.filter(m => m.estatus === 'Pendiente').length}</p>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-amber-100 mt-1">Por completar</p>
        </div>
      </div>

      {/* Formulario con búsqueda inteligente */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4 animate-fade-in">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Wrench className="w-5 h-5 text-violet-600" />
            </div>
            Programar Mantenimiento
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de Servicio *</label>
              <select required value={formData.tipo_servicio} onChange={e => setFormData(prev => ({...prev, tipo_servicio: e.target.value}))} className="input-field">
                {TIPOS_SERVICIO.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Frecuencia *</label>
              <select required value={formData.frecuencia} onChange={e => setFormData(prev => ({...prev, frecuencia: e.target.value}))} className="input-field">
                {FRECUENCIAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha Programada *</label>
              <input type="date" required value={formData.fecha_programada} onChange={e => setFormData(prev => ({...prev, fecha_programada: e.target.value}))} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha Tope (hasta cuándo se repite) *</label>
              <input type="date" required value={formData.fecha_tope} onChange={e => setFormData(prev => ({...prev, fecha_tope: e.target.value}))} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto Estimado *</label>
              <input type="number" step="0.01" required value={formData.monto_estimado} onChange={e => setFormData(prev => ({...prev, monto_estimado: e.target.value}))} className="input-field" placeholder="0.00" />
            </div>

            {/* Proveedor con búsqueda inteligente */}
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
                  <CheckCircle2 className="w-3 h-3" />
                  {proveedores.find(p => p.id === formData.proveedor_id)?.clasificacion?.nombre || 'Sin clasificación'}
                </p>
              )}
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción / Notas</label>
              <textarea rows={2} value={formData.descripcion} onChange={e => setFormData(prev => ({...prev, descripcion: e.target.value}))} className="input-field" placeholder="Detalles adicionales..." />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Repeat className="w-4 h-4" />
              Programar y Repetir
            </button>
          </div>
        </form>
      )}

      {/* Selector de Mes/Año */}
      <div className="flex items-center justify-center gap-4 bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <button onClick={() => setMes(m => m === 1 ? 12 : m - 1)} className="p-2 hover:bg-violet-50 rounded-lg transition-colors group">
          <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-violet-600" />
        </button>
        <div className="text-center min-w-[200px]">
          <h3 className="text-xl font-bold text-slate-800">{MESES[mes - 1]} {año}</h3>
          <p className="text-sm text-slate-500">{totalMantenimientosMes} programados</p>
        </div>
        <button onClick={() => setMes(m => m === 12 ? 1 : m + 1)} className="p-2 hover:bg-violet-50 rounded-lg transition-colors group">
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-600" />
        </button>
      </div>

      {/* Vista Calendario */}
      {viewMode === 'calendario' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {DIAS_SEMANA.map(dia => (
              <div key={dia} className="text-center text-xs font-bold text-slate-500 py-2 uppercase tracking-wider">
                {dia}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {renderCalendario()}
          </div>
        </div>
      )}

      {/* Vista Lista */}
      {viewMode === 'lista' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Tienda</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Servicio</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Frecuencia</th>
                <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase">Monto</th>
                <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase">Estatus</th>
                <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mantenimientosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No hay mantenimientos programados</p>
                  </td>
                </tr>
              ) : (
                mantenimientosFiltrados.map(m => {
                  const tienda = tiendas.find(t => t.id === m.tienda_id)
                  const proveedor = proveedores.find(p => p.id === m.proveedor_id)
                  return (
                    <tr key={m.id}>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">{new Date(m.fecha_programada).toLocaleDateString('es-PA')}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{tienda?.nombre || 'N/A'}</td>
                      <td className="text-slate-600 max-w-xs truncate" title={m.tipo_servicio}>{m.tipo_servicio}</td>
                      <td>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                          {FRECUENCIAS.find(f => f.value === m.frecuencia)?.label}
                        </span>
                      </td>
                      <td className="text-right font-bold text-slate-800">{formatMoney(m.monto_estimado)}</td>
                      <td className="text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Pendiente
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => completarMantenimiento(m)}
                            className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                            title="Completar y registrar gasto"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => cancelarMantenimiento(m.id)}
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Cancelar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Leyenda de colores */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Tipos de Servicio
        </h4>
        <div className="flex flex-wrap gap-3">
          {TIPOS_SERVICIO.map(tipo => {
            const colores = COLORES_SERVICIO[tipo]
            return (
              <div key={tipo} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${colores.bg} ${colores.text} border ${colores.border}`}>
                <div className={`w-2 h-2 rounded-full ${colores.dot}`} />
                {tipo}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
