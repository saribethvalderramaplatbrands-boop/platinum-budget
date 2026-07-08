import { useState } from 'react'
import { Filter, Search, AlertCircle, CheckCircle2, Clock, Save, X, Trash2, MoreVertical, Edit3, Receipt } from 'lucide-react'
import { useGastos, useTiendas, useProveedores } from '../hooks/useSupabase'

const PERIODOS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const ESTATUS_COLORS = {
  'Pendiente OC': 'bg-amber-100 text-amber-800 border-amber-200',
  'Pendiente Factura': 'bg-orange-100 text-orange-800 border-orange-200',
  'Completado': 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

const ESTATUS_ICONS = {
  'Pendiente OC': Clock,
  'Pendiente Factura': AlertCircle,
  'Completado': CheckCircle2,
}

const formatMoney = (amount: number) => {
  return '$' + (amount || 0).toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function GastosTable() {
  const { gastos, loading, fetchGastos, updateGasto, deleteGasto } = useGastos()
  const { tiendas } = useTiendas()
  const { proveedores } = useProveedores()
  
  const [filters, setFilters] = useState({
    clasificacion: '',
    proveedor_id: '',
    periodo: '',
    tienda_id: '',
    estatus: '',
    search: '',
  })

  const [showFilters, setShowFilters] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState({
    orden_compra: '',
    factura: '',
    periodo: '',
  })
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const applyFilters = () => {
    const activeFilters: any = {}
    if (filters.clasificacion) activeFilters.clasificacion = filters.clasificacion
    if (filters.proveedor_id) activeFilters.proveedor_id = filters.proveedor_id
    if (filters.periodo && filters.periodo !== 'Todos') activeFilters.periodo = filters.periodo
    if (filters.tienda_id) activeFilters.tienda_id = filters.tienda_id
    if (filters.estatus) activeFilters.estatus = filters.estatus
    fetchGastos(activeFilters)
  }

  const filteredGastos = gastos.filter(g => {
    if (!filters.search) return true
    const search = filters.search.toLowerCase()
    return (
      g.descripcion.toLowerCase().includes(search) ||
      (g.orden_compra || '').toLowerCase().includes(search) ||
      (g.factura || '').toLowerCase().includes(search)
    )
  })

  const handleDoubleClick = (gasto: any) => {
    setEditingId(gasto.id)
    setEditData({
      orden_compra: gasto.orden_compra || '',
      factura: gasto.factura || '',
      periodo: gasto.periodo || '',
    })
    setMenuOpen(null)
  }

  const handleSave = async (id: string) => {
    await updateGasto(id, {
      orden_compra: editData.orden_compra || null,
      factura: editData.factura || null,
      periodo: editData.periodo,
    })
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      await deleteGasto(id)
      setMenuOpen(null)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({ orden_compra: '', factura: '', periodo: '' })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PA')
  }

  const getTiendaName = (tiendaId: string) => {
    const tienda = tiendas.find(t => t.id === tiendaId)
    return tienda ? `${tienda.codigo} - ${tienda.nombre}` : tiendaId
  }

  const getProveedorName = (proveedorId: string | null) => {
    if (!proveedorId) return '-'
    const prov = proveedores.find(p => p.id === proveedorId)
    return prov ? `${prov.codigo} - ${prov.nombre}` : proveedorId
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      <span className="ml-3 text-slate-500">Cargando...</span>
    </div>
  )

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar en descripción, OC o factura..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros {showFilters ? '▲' : '▼'}
        </button>
      </div>

      {showFilters && (
        <div className="card-solid bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select
              value={filters.periodo}
              onChange={e => setFilters(prev => ({ ...prev, periodo: e.target.value }))}
              className="input-field"
            >
              <option value="">Todos los periodos</option>
              {PERIODOS.slice(1).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            
            <select
              value={filters.tienda_id}
              onChange={e => setFilters(prev => ({ ...prev, tienda_id: e.target.value }))}
              className="input-field"
            >
              <option value="">Todas las tiendas</option>
              {tiendas.map(t => (
                <option key={t.id} value={t.id}>{t.codigo} - {t.nombre}</option>
              ))}
            </select>
            
            <select
              value={filters.proveedor_id}
              onChange={e => setFilters(prev => ({ ...prev, proveedor_id: e.target.value }))}
              className="input-field"
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
              ))}
            </select>
            
            <select
              value={filters.clasificacion}
              onChange={e => setFilters(prev => ({ ...prev, clasificacion: e.target.value }))}
              className="input-field"
            >
              <option value="">Todas las clasificaciones</option>
              {['INFRAESTRUCTURA', 'PLOMERIA', 'ALARMA ROBO', 'ALARMA INCENDIO', 'EXTINTORES', 'EQUIPO', 'REFRIGERACION', 'EBANISTERIA', 'GAS', 'LETRERO', 'ACERO INOXIDABLE'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            
            <select
              value={filters.estatus}
              onChange={e => setFilters(prev => ({ ...prev, estatus: e.target.value }))}
              className="input-field"
            >
              <option value="">Todos los estatus</option>
              <option value="Pendiente OC">Pendiente OC</option>
              <option value="Pendiente Factura">Pendiente Factura</option>
              <option value="Completado">Completado</option>
            </select>
          </div>
          <button onClick={applyFilters} className="btn-primary mt-3 w-full sm:w-auto">
            Aplicar Filtros
          </button>
        </div>
      )}

      <div className="overflow-x-auto card-solid p-0">
        <table className="table-modern">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Periodo</th>
              <th>Tienda</th>
              <th>Descripción</th>
              <th>Proveedor</th>
              <th>Clasificación</th>
              <th className="text-right">Monto</th>
              <th className="text-center">Estatus</th>
              <th>OC / Factura</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredGastos.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-slate-400">
                  <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No hay gastos registrados</p>
                </td>
              </tr>
            ) : (
              filteredGastos.map(gasto => {
                const StatusIcon = ESTATUS_ICONS[gasto.estatus as keyof typeof ESTATUS_ICONS] || Clock
                const isEditing = editingId === gasto.id
                const isMenuOpen = menuOpen === gasto.id

                return (
                  <tr 
                    key={gasto.id} 
                    className={`transition-colors ${isEditing ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}
                    onDoubleClick={() => !isEditing && handleDoubleClick(gasto)}
                    title="Doble clic para editar"
                  >
                    <td className="whitespace-nowrap text-slate-600">{formatDate(gasto.fecha)}</td>
                    
                    <td className="whitespace-nowrap">
                      {isEditing ? (
                        <select
                          value={editData.periodo}
                          onChange={e => setEditData(prev => ({ ...prev, periodo: e.target.value }))}
                          className="input-field text-xs py-1 px-2"
                        >
                          {PERIODOS.slice(1).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      ) : (
                        <span className="text-slate-600">{gasto.periodo}</span>
                      )}
                    </td>
                    
                    <td className="whitespace-nowrap font-medium text-slate-700">{getTiendaName(gasto.tienda_id)}</td>
                    <td className="max-w-xs truncate text-slate-700" title={gasto.descripcion}>
                      {gasto.descripcion}
                    </td>
                    <td className="whitespace-nowrap text-slate-500 text-xs">{getProveedorName(gasto.proveedor_id)}</td>
                    <td className="whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {gasto.clasificacion}
                      </span>
                    </td>
                    <td className="text-right font-bold text-slate-800 whitespace-nowrap">
                      {formatMoney(gasto.monto)}
                    </td>
                    <td className="whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${ESTATUS_COLORS[gasto.estatus as keyof typeof ESTATUS_COLORS]}`}>
                        <StatusIcon className="w-3 h-3" />
                        {gasto.estatus}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-xs">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">OC:</label>
                            <input
                              type="text"
                              value={editData.orden_compra}
                              onChange={e => setEditData(prev => ({ ...prev, orden_compra: e.target.value }))}
                              placeholder="Número OC"
                              className="input-field text-xs py-1 px-2"
                              autoFocus
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Factura:</label>
                            <input
                              type="text"
                              value={editData.factura}
                              onChange={e => setEditData(prev => ({ ...prev, factura: e.target.value }))}
                              placeholder="Número Factura"
                              className="input-field text-xs py-1 px-2"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(gasto.id)}
                              className="btn-primary text-xs py-1 px-2 flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              Guardar
                            </button>
                            <button
                              onClick={handleCancel}
                              className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {gasto.orden_compra && <div className="text-slate-600">OC: {gasto.orden_compra}</div>}
                          {gasto.factura && <div className="text-slate-600">Fac: {gasto.factura}</div>}
                          {!gasto.orden_compra && !gasto.factura && <span className="text-amber-600 font-medium">Sin documentos</span>}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-center relative">
                      <button
                        onClick={() => setMenuOpen(isMenuOpen ? null : gasto.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                      
                      {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1 overflow-hidden">
                          <button
                            onClick={() => handleDoubleClick(gasto)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors"
                          >
                            <Edit3 className="w-4 h-4 text-blue-500" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(gasto.id)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
