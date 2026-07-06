import { useState } from 'react'
import { useTiendas } from '../hooks/useSupabase'
import { supabase } from '../lib/supabase'
import { Table } from 'lucide-react'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function PresupuestoView() {
  useTiendas()
  const [año, setAño] = useState(2026)
  const [mes, setMes] = useState<number | null>(null)
  const [presupuestos, setPresupuestos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchPresupuestos = async () => {
    setIsLoading(true)
    let query = supabase.from('presupuestos_mensuales').select(`
      *,
      tiendas:tienda_id(codigo, nombre, unidad_negocio)
    `).eq('año', año)

    if (mes) query = query.eq('mes', mes)

    const { data, error } = await query.order('tienda_id')
    if (!error) setPresupuestos(data || [])
    setIsLoading(false)
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const dqTotal = presupuestos
    .filter(p => p.tiendas?.unidad_negocio?.includes('Dairy'))
    .reduce((sum, p) => sum + p.presupuesto_asignado, 0)

  const kfcTotal = presupuestos
    .filter(p => p.tiendas?.unidad_negocio?.includes('Kentucky'))
    .reduce((sum, p) => sum + p.presupuesto_asignado, 0)

  const grandTotal = dqTotal + kfcTotal

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Presupuesto por Tienda</h2>

      <div className="card flex flex-col sm:flex-row gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <input
            type="number"
            value={año}
            onChange={e => setAño(parseInt(e.target.value))}
            className="input-field w-32"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mes (opcional)</label>
          <select
            value={mes || ''}
            onChange={e => setMes(e.target.value ? parseInt(e.target.value) : null)}
            className="input-field w-40"
          >
            <option value="">Todos</option>
            {MESES.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <button onClick={fetchPresupuestos} className="btn-primary flex items-center gap-2">
          <Table className="w-4 h-4" />
          Consultar
        </button>
      </div>

      {isLoading && <div className="text-center py-4">Cargando...</div>}

      {presupuestos.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card bg-blue-50">
              <p className="text-sm text-blue-600 font-medium">DQ Total</p>
              <p className="text-xl font-bold text-blue-700">{formatMoney(dqTotal)}</p>
            </div>
            <div className="card bg-red-50">
              <p className="text-sm text-red-600 font-medium">KFC Total</p>
              <p className="text-xl font-bold text-red-700">{formatMoney(kfcTotal)}</p>
            </div>
            <div className="card bg-primary-50">
              <p className="text-sm text-primary-600 font-medium">Gran Total</p>
              <p className="text-xl font-bold text-primary-700">{formatMoney(grandTotal)}</p>
            </div>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-3 py-2">Código</th>
                  <th className="text-left px-3 py-2">Tienda</th>
                  <th className="text-left px-3 py-2">Unidad</th>
                  <th className="text-center px-3 py-2">Mes</th>
                  <th className="text-right px-3 py-2">Presupuesto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {presupuestos.map(p => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 font-medium">{p.tiendas?.codigo}</td>
                    <td className="px-3 py-2">{p.tiendas?.nombre}</td>
                    <td className="px-3 py-2 text-xs">{p.tiendas?.unidad_negocio}</td>
                    <td className="px-3 py-2 text-center">{MESES[p.mes - 1]}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatMoney(p.presupuesto_asignado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
