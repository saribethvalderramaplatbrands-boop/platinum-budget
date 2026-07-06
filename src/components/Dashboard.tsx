import { useResumen } from '../hooks/useSupabase'
import { TrendingUp, TrendingDown, DollarSign, Store, AlertTriangle } from 'lucide-react'

export default function Dashboard() {
  const { resumen, loading } = useResumen(2026, new Date().getMonth() + 1)

  const totalPresupuesto = resumen.reduce((sum, r) => sum + (r.presupuesto_asignado || 0), 0)
  const totalGasto = resumen.reduce((sum, r) => sum + (r.gasto_real || 0), 0)
  const totalSaldo = totalPresupuesto - totalGasto
  const porcentajeUsado = totalPresupuesto > 0 ? (totalGasto / totalPresupuesto) * 100 : 0

  const tiendasAlerta = resumen.filter(r => r.saldo < 0).length

  const dqResumen = resumen.filter(r => r.unidad_negocio.includes('Dairy Queen'))
  const kfcResumen = resumen.filter(r => r.unidad_negocio.includes('Kentucky'))

  const dqPresupuesto = dqResumen.reduce((sum, r) => sum + (r.presupuesto_asignado || 0), 0)
  const dqGasto = dqResumen.reduce((sum, r) => sum + (r.gasto_real || 0), 0)

  const kfcPresupuesto = kfcResumen.reduce((sum, r) => sum + (r.presupuesto_asignado || 0), 0)
  const kfcGasto = kfcResumen.reduce((sum, r) => sum + (r.gasto_real || 0), 0)

  if (loading) return <div className="text-center py-8">Cargando dashboard...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard - Resumen Mensual</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600 font-medium">Presupuesto Total</p>
              <p className="text-2xl font-bold text-primary-700">
                ${totalPresupuesto.toLocaleString('es-PA', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-primary-400" />
          </div>
        </div>

        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Gasto Real</p>
              <p className="text-2xl font-bold text-red-700">
                ${totalGasto.toLocaleString('es-PA', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Saldo Disponible</p>
              <p className="text-2xl font-bold text-green-700">
                ${totalSaldo.toLocaleString('es-PA', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">% Usado</p>
              <p className="text-2xl font-bold text-yellow-700">
                {porcentajeUsado.toFixed(1)}%
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg">Dairy Queen (DQ)</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Presupuesto:</span>
              <span className="font-medium">${dqPresupuesto.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Gasto:</span>
              <span className="font-medium text-red-600">${dqGasto.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${dqPresupuesto > 0 ? (dqGasto / dqPresupuesto) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-lg">Kentucky Fried Chicken (KFC)</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Presupuesto:</span>
              <span className="font-medium">${kfcPresupuesto.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Gasto:</span>
              <span className="font-medium text-red-600">${kfcGasto.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${kfcPresupuesto > 0 ? (kfcGasto / kfcPresupuesto) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {tiendasAlerta > 0 && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="font-medium text-red-700">
              {tiendasAlerta} {tiendasAlerta === 1 ? 'tienda ha' : 'tiendas han'} excedido su presupuesto
            </p>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        <h3 className="font-bold text-lg mb-4">Detalle por Tienda</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-3 py-2">Código</th>
              <th className="text-left px-3 py-2">Tienda</th>
              <th className="text-left px-3 py-2">Unidad</th>
              <th className="text-right px-3 py-2">Presupuesto</th>
              <th className="text-right px-3 py-2">Gasto</th>
              <th className="text-right px-3 py-2">Saldo</th>
              <th className="text-center px-3 py-2">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {resumen.map(r => {
              const pct = r.presupuesto_asignado > 0 ? (r.gasto_real / r.presupuesto_asignado) * 100 : 0
              return (
                <tr key={`${r.tienda_id}-${r.mes}`} className={r.saldo < 0 ? 'bg-red-50' : ''}>
                  <td className="px-3 py-2 font-medium">{r.codigo}</td>
                  <td className="px-3 py-2">{r.tienda}</td>
                  <td className="px-3 py-2 text-xs">{r.unidad_negocio}</td>
                  <td className="px-3 py-2 text-right">${r.presupuesto_asignado.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-2 text-right text-red-600">${r.gasto_real.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</td>
                  <td className={`px-3 py-2 text-right font-medium ${r.saldo < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${r.saldo.toLocaleString('es-PA', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs">{pct.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
