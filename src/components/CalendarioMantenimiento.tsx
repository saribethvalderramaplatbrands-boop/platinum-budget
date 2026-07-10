import { useState, useEffect } from 'react'
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
  Repeat
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

const FRECUENCIAS = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'bimestral', label: 'Bimestral' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' }
]

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

  // Formulario
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
      fetchMantenimientos()
    }
  }

  const completarMantenimiento = async (mantenimiento: Mantenimiento) => {
    // 1. Registrar como gasto en gastos_diarios
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

    // 2. Marcar mantenimiento como completado
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

    // El trigger automático creará el siguiente mantenimiento
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

  // Filtrar por mes/año seleccionado
  const mantenimientosFiltrados = mantenimientos.filter(m => {
    const fecha = new Date(m.fecha_programada)
    return fecha.getMonth() + 1 === mes && fecha.getFullYear() === año
  })

  const getDiasEnMes = (año: number, mes: number) => {
    return new Date(año, mes, 0).getDate()
  }

  const getPrimerDiaMes = (año: number, mes: number) => {
    return new Date(año, mes - 1, 1).getDay()
  }

  const renderCalendario = () => {
    const diasEnMes = getDiasEnMes(año, mes)
    const primerDia = getPrimerDiaMes(año, mes)
    const dias = []

    // Espacios vacíos antes del primer día
    for (let i = 0; i < primerDia; i++) {
      dias.push(<div key={`empty-${i}`} className="h-24 bg-slate-50/50 rounded-lg" />)
    }

    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const mantenimientosDia = mantenimientosFiltrados.filter(m => {
        const fecha = new Date(m.fecha_programada)
        return fecha.getDate() === dia
      })

      dias.push(
        <div key={dia} className="h-24 bg-white border border-slate-200 rounded-lg p-1.5 overflow-y-auto hover:shadow-md transition-shadow">
          <div className="text-xs font-bold text-slate-400 mb-1">{dia}</div>
          {mantenimientosDia.map(m => {
            const tienda = tiendas.find(t => t.id === m.tienda_id)
            return (
              <div 
                key={m.id} 
                className="text-[10px] p-1 rounded mb-1 cursor-pointer hover:opacity-80 transition-opacity bg-blue-50 text-blue-700 border border-blue-200"
                onClick={() => completarMantenimiento(m)}
                title="Click para completar"
              >
                <div className="font-semibold truncate">{tienda?.nombre || 'Tienda'}</div>
                <div className="truncate">{m.tipo_servicio.split(' ').slice(0, 3).join(' ')}...</div>
                <div className="text-blue-500 font-bold">{formatMoney(m.monto_estimado)}</div>
              </div>
            )
          })}
        </div>
      )
    }

    return dias
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg shadow-lg shadow-violet-500/20">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Mantenimientos Preventivos</h2>
            <p className="text-sm text-slate-500">Calendario mensual de servicios programados</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'calendario' ? 'lista' : 'calendario')}
            className="btn-secondary text-sm"
          >
            {viewMode === 'calendario' ? 'Ver Lista' : 'Ver Calendario'}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card-solid space-y-4 animate-fade-in">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-violet-500" />
            Programar Mantenimiento
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tienda *</label>
              <select required value={formData.tienda_id} onChange={e => setFormData({...formData, tienda_id: e.target.value})} className="input-field">
                <option value="">Seleccionar tienda...</option>
                {tiendas.map(t => <option key={t.id} value={t.id}>{t.codigo} - {t.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de Servicio *</label>
              <select required value={formData.tipo_servicio} onChange={e => setFormData({...formData, tipo_servicio: e.target.value})} className="input-field">
                {TIPOS_SERVICIO.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Frecuencia *</label>
              <select required value={formData.frecuencia} onChange={e => setFormData({...formData, frecuencia: e.target.value})} className="input-field">
                {FRECUENCIAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha Programada *</label>
              <input type="date" required value={formData.fecha_programada} onChange={e => setFormData({...formData, fecha_programada: e.target.value})} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha Tope (hasta cuándo se repite) *</label>
              <input type="date" required value={formData.fecha_tope} onChange={e => setFormData({...formData, fecha_tope: e.target.value})} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto Estimado *</label>
              <input type="number" step="0.01" required value={formData.monto_estimado} onChange={e => setFormData({...formData, monto_estimado: e.target.value})} className="input-field" placeholder="0.00" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Proveedor</label>
              <select value={formData.proveedor_id} onChange={e => setFormData({...formData, proveedor_id: e.target.value})} className="input-field">
                <option value="">Seleccionar proveedor...</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción / Notas</label>
              <textarea rows={2} value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="input-field" placeholder="Detalles adicionales..." />
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
      <div className="flex items-center gap-4 justify-center">
        <button onClick={() => setMes(m => m === 1 ? 12 : m - 1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800">{MESES[mes - 1]} {año}</h3>
          <p className="text-sm text-slate-500">{mantenimientosFiltrados.length} mantenimientos programados</p>
        </div>
        <button onClick={() => setMes(m => m === 12 ? 1 : m + 1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Vista Calendario */}
      {viewMode === 'calendario' && (
        <div className="grid grid-cols-7 gap-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
            <div key={dia} className="text-center text-xs font-bold text-slate-500 py-2">{dia}</div>
          ))}
          {renderCalendario()}
        </div>
      )}

      {/* Vista Lista */}
      {viewMode === 'lista' && (
        <div className="card-solid overflow-hidden">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tienda</th>
                <th>Servicio</th>
                <th>Frecuencia</th>
                <th className="text-right">Monto</th>
                <th className="text-center">Estatus</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
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
                      <td className="whitespace-nowrap text-slate-600">{new Date(m.fecha_programada).toLocaleDateString('es-PA')}</td>
                      <td className="font-medium text-slate-800">{tienda?.nombre || 'N/A'}</td>
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
    </div>
  )
}
