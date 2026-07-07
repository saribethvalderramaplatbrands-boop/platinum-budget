import { useState } from 'react'
import { Filter, Search, AlertCircle, CheckCircle2, Clock, Save, X } from 'lucide-react'
import { useGastos, useTiendas, useProveedores } from '../hooks/useSupabase'

const PERIODOS = [
  'Todos', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const ESTATUS_COLORS = {
  'Pendiente OC': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Pendiente Factura': 'bg-orange-100 text-orange-800 border-orange-200',
  'Completado': 'bg-green-100 text-green-800 border-green-200',
}

const ESTATUS_ICONS = {
  'Pendiente OC': Clock,
  'Pendiente Factura': AlertCircle,
  'Completado': CheckCircle2,
}

export default function GastosTable() {
  const { gastos, loading, fetchGastos, updateGasto } = useGastos()
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
  })

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
    })
  }

  const handleSave = async (id: string) => {
    await updateGasto(id, {
      orden_compra: editData.orden_compra || null,
      factura: editData.factura || null,
    })
    setEditingId(null)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({ orden_compra: '', factura: '' })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PA')
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
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

  if (loading) return <div className="text-center py-8">Cargando...</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
        <div className="card bg-gray-50">
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Fecha</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Periodo</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Tienda</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Descripción</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Proveedor</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Clasificación</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">Monto</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Estatus</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">OC / Factura</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredGastos.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">
                  No hay gastos registrados
                </td>
              </tr>
            ) : (
              filteredGastos.map(gasto => {
                const StatusIcon = ESTATUS_ICONS[gasto.estatus as keyof typeof ESTATUS_ICONS] || Clock
                const isEditing = editingId === gasto.id

                return (
                  <tr 
                    key={gasto.id} 
                    className={`hover:bg-gray-50 transition-colors ${isEditing ? 'bg-blue-50' : ''}`}
                    onDoubleClick={() => !isEditing && handleDoubleClick(gasto)}
                    title="Doble clic para editar"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(gasto.fecha)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{gasto.periodo}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{getTiendaName(gasto.tienda_id)}</td>
                    <td className="px-4 py-3 max-w-xs truncate" title={gasto.descripcion}>
                      {gasto.descripcion}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{getProveedorName(gasto.proveedor_id)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {gasto.clasificacion}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {formatMoney(gasto.monto)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${ESTATUS_COLORS[gasto.estatus as keyof typeof ESTATUS_COLORS]}`}>
                        <StatusIcon className="w-3 h-3" />
                        {gasto.estatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">OC:</label>
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
                            <label className="block text-xs font-medium text-gray-600 mb-1">Factura:</label>
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
                          {gasto.orden_compra && <div>OC: {gasto.orden_compra}</div>}
                          {gasto.factura && <div>Fac: {gasto.factura}</div>}
                          {!gasto.orden_compra && !gasto.factura && <span className="text-yellow-600">Sin documentos</span>}
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
