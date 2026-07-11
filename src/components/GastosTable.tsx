import { useState } from 'react'
import { Filter, Search, AlertCircle, CheckCircle2, Clock, Save, X, Trash2, MoreVertical, Edit3, Receipt, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast } from 'lucide-react'
import { useGastos, useTiendas, useProveedores } from '../hooks/useSupabase'

const PERIODOS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// Colores por clasificación
const CLASIFICACION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'INFRAESTRUCTURA': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  'PLOMERIA': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  'ALARMA ROBO': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  'ALARMA INCENDIO': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  'EXTINTORES': { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
  'EQUIPO': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  'REFRIGERACION': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },
  'EBANISTERIA': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  'GAS': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  'LETRERO': { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200' },
  'ACERO INOXIDABLE': { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' },
  'SERVICIOS FIJOS': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
}

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
  const { 
    gastos, 
    loading, 
    page, 
    totalPages, 
    totalCount, 
    pageSize,
    nextPage, 
    prevPage, 
    goToPage,
    fetchGastos, 
    updateGasto, 
    deleteGasto 
  } = useGastos()
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
    if (filters.search) activeFilters.search = filters.search
    fetchGastos(activeFilters, 0)
  }

  const clearFilters = () => {
    setFilters({
      clasificacion: '',
      proveedor_id: '',
      periodo: '',
      tienda_id: '',
      estatus: '',
      search: '',
    })
    fetchGastos({}, 0)
  }

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

  const getClasificacionStyle = (clasificacion: string) => {
    return CLASIFICACION_COLORS[clasificacion] || { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' }
  }

  // Generar array de números de página para mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i)
    } else {
      if (page < 3) {
        for (let i = 0; i < 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages - 1)
      } else if (page > totalPages - 4) {
        pages.push(0)
        pages.push('...')
        for (let i = totalPages - 4; i < totalPages; i++) pages.push(i)
      } else {
        pages.push(0)
        pages.push('...')
        for (let i = page - 1; i <= page + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages - 1)
      }
    }
    return pages
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      <span className="ml-3 text-slate-500">Cargando...</span>
    </div>
  )

  const fromItem = page * pageSize + 1
  const toItem = Math.min((page + 1) * pageSize, totalCount)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar en descripción, OC o factura..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="btn-primary flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros {showFilters ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="card-solid bg-gradient-to-br from-slate-50 to-blue-50/30 border-blue-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select
              value={filters.periodo}
              onChange={e => setFilters(prev => ({ ...prev, periodo: e.target.value }))}
              className="input-field"
            >
              <option value="">Todos los periodos</option>
              {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
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
              {['INFRAESTRUCTURA', 'PLOMERIA', 'ALARMA ROBO', 'ALARMA INCENDIO', 'EXTINTORES', 'EQUIPO', 'REFRIGERACION', 'EBANISTERIA', 'GAS', 'LETRERO', 'ACERO INOXIDABLE', 'SERVICIOS FIJOS'].map(c => (
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
          <div className="flex gap-2 mt-3">
            <button onClick={applyFilters} className="btn-primary">
              Aplicar Filtros
            </button>
            <button onClick={clearFilters} className="btn-secondary">
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Info de resultados */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Mostrando <strong className="text-slate-700">{fromItem}-{toItem}</strong> de <strong className="text-slate-700">{totalCount}</strong> registros
          {filters.periodo && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Periodo: {filters.periodo}</span>}
        </span>
      </div>

      {/* Tabla con colores */}
      <div className="overflow-x-auto card-solid p-0 shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-100 to-blue-50/50 border-b-2 border-blue-200">
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Periodo</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Tienda</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Proveedor</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Clasificación</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Monto</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Estatus</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">OC / Factura</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastos.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-16 text-slate-400">
                  <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium">No hay gastos registrados</p>
                  <p className="text-sm mt-1">Prueba ajustando los filtros o agrega un nuevo gasto</p>
                </td>
              </tr>
            ) : (
              gastos.map((gasto, index) => {
                const StatusIcon = ESTATUS_ICONS[gasto.estatus as keyof typeof ESTATUS_ICONS] || Clock
                const isEditing = editingId === gasto.id
                const isMenuOpen = menuOpen === gasto.id
                const clasifStyle = getClasificacionStyle(gasto.clasificacion)
                const isEven = index % 2 === 0

                return (
                  <tr 
                    key={gasto.id} 
                    className={`transition-all duration-150 border-b border-slate-100 ${isEditing ? 'bg-blue-50/80 ring-2 ring-blue-200' : isEven ? 'bg-white hover:bg-blue-50/30' : 'bg-slate-50/50 hover:bg-blue-50/40'}`}
                    onDoubleClick={() => !isEditing && handleDoubleClick(gasto)}
                    title="Doble clic para editar"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 font-medium">{formatDate(gasto.fecha)}</td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          value={editData.periodo}
                          onChange={e => setEditData(prev => ({ ...prev, periodo: e.target.value }))}
                          className="input-field text-xs py-1 px-2"
                        >
                          {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      ) : (
                        <span className="text-sm text-slate-600 font-medium bg-slate-100 px-2 py-1 rounded-md">{gasto.periodo}</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-700">{getTiendaName(gasto.tienda_id)}</td>
                    
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm text-slate-700 font-medium truncate" title={gasto.descripcion}>
                        {gasto.descripcion}
                      </p>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">{getProveedorName(gasto.proveedor_id)}</td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${clasifStyle.bg} ${clasifStyle.text} ${clasifStyle.border}`}>
                        {gasto.clasificacion}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-800">{formatMoney(gasto.monto)}</span>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${ESTATUS_COLORS[gasto.estatus as keyof typeof ESTATUS_COLORS]}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {gasto.estatus}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
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
                        <div className="space-y-1">
                          {gasto.orden_compra && (
                            <div className="flex items-center gap-1 text-slate-600">
                              <span className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">OC</span>
                              <span>{gasto.orden_compra}</span>
                            </div>
                          )}
                          {gasto.factura && (
                            <div className="flex items-center gap-1 text-slate-600">
                              <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">F</span>
                              <span>{gasto.factura}</span>
                            </div>
                          )}
                          {!gasto.orden_compra && !gasto.factura && (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-medium text-xs bg-amber-50 px-2 py-1 rounded">
                              <AlertCircle className="w-3 h-3" />
                              Sin documentos
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-center relative">
                      <button
                        onClick={() => setMenuOpen(isMenuOpen ? null : gasto.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                      
                      {isMenuOpen && (
                        <div className="absolute right-2 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1 overflow-hidden">
                          <button
                            onClick={() => handleDoubleClick(gasto)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors"
                          >
                            <Edit3 className="w-4 h-4 text-blue-500" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(gasto.id)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 transition-colors"
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
          <div className="text-sm text-slate-500">
            Página <span className="font-bold text-slate-700">{page + 1}</span> de <span className="font-bold text-slate-700">{totalPages}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(0)}
              disabled={page === 0}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Primera página"
            >
              <ChevronFirst className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={prevPage}
              disabled={page === 0}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            
            <div className="flex items-center gap-1 mx-2">
              {getPageNumbers().map((p, i) => (
                p === '...' ? (
                  <span key={`dots-${i}`} className="px-2 text-slate-400">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p as number)}
                    className={`min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                      page === p 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {(p as number) + 1}
                  </button>
                )
              ))}
            </div>
            
            <button
              onClick={nextPage}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Siguiente"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={() => goToPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Última página"
            >
              <ChevronLast className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
