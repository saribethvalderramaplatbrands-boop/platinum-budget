import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
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
  'GAS', 'LETRERO', 'ACERO INOXIDABLE'
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

  const [tiendaSearch, setTiendaSearch] = useState('')
  const [provSearch, setProvSearch] = useState('')

  const filteredTiendas = tiendaSearch 
    ? tiendas.filter(t => 
        t.nombre.toLowerCase().includes(tiendaSearch.toLowerCase()) ||
        t.codigo.toString().includes(tiendaSearch)
      )
    : tiendas

  const filteredProveedores = provSearch
    ? proveedores.filter(p => 
        p.nombre.toLowerCase().includes(provSearch.toLowerCase()) ||
        p.codigo.toLowerCase().includes(provSearch.toLowerCase())
      )
    : proveedores

  const handleTiendaChange = (tiendaId: string) => {
    const tienda = tiendas.find(t => t.id === tiendaId)
    setFormData(prev => ({
      ...prev,
      tienda_id: tiendaId,
      gerente_area: tienda?.gerente_area || '',
      gerente_regional: tienda?.gerente_regional || '',
    }))
    setTiendaSearch('')
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
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Plus className="w-5 h-5 text-primary-600" />
        Nuevo Gasto
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
          <input
            type="date"
            required
            value={formData.fecha}
            onChange={e => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Periodo *</label>
          <select
            required
            value={formData.periodo}
            onChange={e => setFormData(prev => ({ ...prev, periodo: e.target.value }))}
            className="input-field"
          >
            {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tienda *</label>
          <input
            type="text"
            placeholder="Buscar tienda por nombre o código..."
            value={tiendaSearch}
            onChange={e => setTiendaSearch(e.target.value)}
            className="input-field mb-2"
          />
          {tiendaSearch && (
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg mb-2">
              {filteredTiendas.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTiendaChange(t.id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                >
                  {t.codigo} - {t.nombre}
                </button>
              ))}
              {filteredTiendas.length === 0 && (
                <p className="px-3 py-2 text-sm text-gray-500">No se encontraron tiendas</p>
              )}
            </div>
          )}
          <select
            required
            value={formData.tienda_id}
            onChange={e => handleTiendaChange(e.target.value)}
            className="input-field"
          >
            <option value="">Seleccionar tienda...</option>
            {tiendas.map(t => (
              <option key={t.id} value={t.id}>
                {t.codigo} - {t.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Orden de Compra</label>
          <input
            type="text"
            placeholder="Opcional"
            value={formData.orden_compra}
            onChange={e => setFormData(prev => ({ ...prev, orden_compra: e.target.value }))}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Factura</label>
          <input
            type="text"
            placeholder="Opcional"
            value={formData.factura}
            onChange={e => setFormData(prev => ({ ...prev, factura: e.target.value }))}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
          <input
            type="text"
            placeholder="Buscar proveedor por nombre o código..."
            value={provSearch}
            onChange={e => setProvSearch(e.target.value)}
            className="input-field mb-2"
          />
          {provSearch && (
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg mb-2">
              {filteredProveedores.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, proveedor_id: p.id }))
                    setProvSearch('')
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                >
                  {p.codigo} - {p.nombre}
                </button>
              ))}
              {filteredProveedores.length === 0 && (
                <p className="px-3 py-2 text-sm text-gray-500">No se encontraron proveedores</p>
              )}
            </div>
          )}
          <select
            value={formData.proveedor_id}
            onChange={e => setFormData(prev => ({ ...prev, proveedor_id: e.target.value }))}
            className="input-field"
          >
            <option value="">Seleccionar proveedor...</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>
                {p.codigo} - {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clasificación *</label>
          <select
            required
            value={formData.clasificacion}
            onChange={e => setFormData(prev => ({ ...prev, clasificacion: e.target.value }))}
            className="input-field"
          >
            {CLASIFICACIONES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto (USD) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            value={formData.monto}
            onChange={e => setFormData(prev => ({ ...prev, monto: e.target.value }))}
            className="input-field"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
          <textarea
            required
            rows={2}
            placeholder="Detalle del gasto..."
            value={formData.descripcion}
            onChange={e => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
            className="input-field"
          />
        </div>

        {formData.gerente_area && (
          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-xs text-gray-500">Gerente de Área</span>
              <p className="font-medium text-sm">{formData.gerente_area}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-xs text-gray-500">Gerente Regional</span>
              <p className="font-medium text-sm">{formData.gerente_regional}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end">
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
