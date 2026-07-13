import { useState } from 'react'
import { Plus, List, Receipt } from 'lucide-react'
import { supabase } from '../lib/supabase'
import GastoForm from './GastoForm'
import GastosTable from './GastosTable'

export default function GastosDiarios() {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Función para calcular el estatus basado en OC y Factura
  function calcularEstatus(orden_compra: string | null, factura: string | null): string {
    if (factura && factura.trim() !== '') {
      return 'Completado'
    } else if (orden_compra && orden_compra.trim() !== '') {
      return 'Pendiente Factura'
    } else {
      return 'Pendiente OC'
    }
  }

  async function handleSubmit(gasto: any) {
    // Calcular el estatus antes de insertar
    const estatus = calcularEstatus(gasto.orden_compra, gasto.factura)
    
    const gastoConEstatus = {
      ...gasto,
      estatus: estatus,
    }

    const { error } = await supabase.from('gastos_diarios').insert([gastoConEstatus])
    if (error) {
      alert('Error: ' + error.message)
    } else {
      setShowForm(false)
      setRefreshKey(prev => prev + 1)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gastos Diarios</h2>
            <p className="text-sm text-slate-500">Registro y seguimiento de gastos de mantenimiento</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`btn-primary flex items-center gap-2 ${showForm ? 'bg-slate-600 hover:bg-slate-700' : ''}`}
        >
          {showForm ? <List className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Ver Tabla' : 'Nuevo Gasto'}
        </button>
      </div>

      {showForm ? (
        <GastoForm 
          onSubmit={handleSubmit} 
          onCancel={() => setShowForm(false)} 
        />
      ) : (
        <GastosTable key={refreshKey} />
      )}
    </div>
  )
}
