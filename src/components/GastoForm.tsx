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

  const handleTiendaChange = (tiendaId: string) => {
    const tienda = tiendas.find(t => t.id === tiendaId)
    setFormData(prev => ({
      ...prev,
      tienda_id: tiendaId,
      gerente_area: tienda?.gerente_area || '',
      gerente_regional: tienda?.gerente_regional || '',
    }))
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
