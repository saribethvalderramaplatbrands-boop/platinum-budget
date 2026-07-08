import { useState } from 'react'
import { useResumen, useAmortizaciones } from '../hooks/useSupabase'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Store, 
  AlertTriangle,
  Calendar,
  PiggyBank,
  Wallet,
  Gauge,
  IceCream,
  Drumstick,
  Receipt
} from 'lucide-react'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function Dashboard() {
  const [año, setAño] = useState(2026)
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const { resumen, loading } = useResumen(año, mes)
  const { amortizaciones } = useAmortizaciones()

  const periodoActual = MESES[mes - 1]

  // Calcular amortizaciones del mes
  const amortizacionesMes = amortizaciones.filter(a => a.periodo === periodoActual)
  const totalAmortizaciones = amortizacionesMes.reduce((sum, a) => sum + (a.monto || 0), 0)

  const totalPresupuesto = resumen.reduce((sum, r) => sum + (r.presupuesto_asignado || 0), 0)
  const totalGastoReal = resumen.reduce((sum, r) => sum + (r.gasto_real || 0), 0)
  const totalGasto = totalGastoReal + totalAmortizaciones
  const totalSaldo = totalPresupuesto - totalGasto
  const porcentajeUsado = totalPresupuesto > 0 ? (totalGasto / totalPresupuesto) * 100 : 0

  const tiendasAlerta = resumen.filter(r => r.saldo < 0).length

  const dqResumen = resumen.filter(r => r.unidad_negocio?.includes('Dairy'))
  const kfcResumen = resumen.filter(r => r.unidad_negocio?.includes('Kentucky'))

  // Calcular amortizaciones por unidad de negocio
  const getAmortizacionesPorCodigos = (codigos: number[]) => {
    return amortizacionesMes
      .filter(a => codigos.includes(a.codigo_tienda))
      .reduce((sum, a) => sum + (a.monto || 0), 0)
  }

  const dqCodigos = dqResumen.map(r => r.codigo)
  const kfcCodigos = kfcResumen.map(r => r.codigo)

  const dqAmortizaciones = getAmortizacionesPorCodigos(dqCodigos)
  const kfcAmortizaciones = getAmortizacionesPorCodigos(kfcCodigos)

  const dqPresupuesto = dqResumen.reduce((sum, r) => sum + (r.presupuesto_asignado || 0), 0)
  const dqGastoReal = dqResumen.reduce((sum, r) => sum + (r.gasto_real || 0), 0)
  const dqGasto = dqGastoReal + dqAmortizaciones
  const dqSaldo = dqPresupuesto - dqGasto

  const kfcPresupuesto = kfcResumen.reduce((sum, r) => sum + (r.presupuesto_asignado || 0), 0)
  const kfcGastoReal = kfcResumen.reduce((sum, r) => sum + (r.gasto_real || 0), 0)
  const kfcGasto = kfcGastoReal + kfcAmortizaciones
  const kfcSaldo = kfcPresupuesto - kfcGasto

  // Filtrar tiendas para mostrar: top 10 por gasto + todas las que están pasadas de presupuesto
  const tiendasPasadas = resumen.filter(r => r.saldo < 0)
  const tiendasRestantes = resumen.filter(r => r.saldo >= 0)
  const top10PorGasto = [...tiendasRestantes].sort((a, b) => b.gasto_real - a.gasto_real).slice(0, 10)
  const tiendasMostrar = [...tiendasPasadas, ...top10PorGasto]
    .sort((a, b) => {
      // Primero las pasadas de presupuesto, luego por gasto descendente
      if (a.saldo < 0 && b.saldo >= 0) return -1
      if (a.saldo >= 0 && b.saldo < 0) return 1
      return b.gasto_real - a.gasto_real
    })

  if (loading) return <div className="text-center py-8">Cargando dashboard...</div>

  return (
    <div className="space-y-6">
      {/* Header con selector de mes */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Dashboard - Resumen Mensual</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select 
              value={mes} 
              onChange={e => setMes(parseInt(e.target.value))}
              className="bg-transparent text-sm font-medium outline-none cursor-pointer"
            >
              {MESES.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <span className="text-sm text-gray-500">Año</span>
            <input 
              type="number" 
              value={año} 
              onChange={e => setAño(parseInt(e.target.value))}
              className="w-16 bg-transparent text-sm font-medium outline-none"
            />
          </div>
        </div>
      </div>

      {/* Cards principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Presupuesto Total</p>
              <p className="text-2xl font-bold text-blue-700">
                ${totalPresupuesto.toLocaleString('es-PA', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <PiggyBank className="w-6 h-6 text-blue-600" />
            </div>
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
            <div className="p-3 bg-red-100 rounded-xl">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
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
            <div className="p-3 bg-green-100 rounded-xl">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
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
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Gauge className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Card de Amortizaciones */}
      <div className="card bg-orange-50 border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-600 font-medium">Amortizaciones {periodoActual}</p>
            <p className="text-2xl font-bold text-orange-700">
              ${totalAmortizaciones.toLocaleString('es-PA', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-orange-500">{amortizacionesMes.length} registros</p>
          </div>
          <div className="p-3 bg-orange-100 rounded-xl">
            <Receipt className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Cards DQ y KFC con Presupuesto, Gasto y Saldo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IceCream className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Dairy Queen (DQ)</h3>
              <p className="text-xs text-gray-500">{MESES[mes - 1]} {año}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 mb-1">Presupuesto</p>
              <p className="font-bold text-blue-700">${dqPresupuesto.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-red-600 mb-1">Gasto</p>
              <p className="font-bold text-red-700">${dqGasto.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 mb-1">Saldo</p>
              <p className={`font-bold ${dqSaldo < 0 ? 'text-red-700' : 'text-green-700'}`}>
                ${dqSaldo.toLocaleString('es-PA', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>0%</span>
              <span>{dqPresupuesto > 0 ? ((dqGasto / dqPresupuesto) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full transition-all ${dqSaldo < 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(dqPresupuesto > 0 ? (dqGasto / dqPresupuesto) * 100 : 0, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Drumstick className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Kentucky Fried Chicken (KFC)</h3>
              <p className="text-xs text-gray-500">{MESES[mes - 1]} {año}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 mb-1">Presupuesto</p>
              <p className="font-bold text-blue-700">${kfcPresupuesto.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-red-600 mb-1">Gasto</p>
              <p className="font-bold text-red-700">${kfcGasto.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 mb-1">Saldo</p>
              <p className={`font-bold ${kfcSaldo < 0 ? 'text-red-700' : 'text-green-700'}`}>
                ${kfcSaldo.toLocaleString('es-PA', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>0%</span>
              <span>{kfcPresupuesto > 0 ? ((kfcGasto / kfcPresupuesto) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full transition-all ${kfcSaldo < 0 ? 'bg-red-500' : 'bg-red-400'}`}
                style={{ width: `${Math.min(kfcPresupuesto > 0 ? (kfcGasto / kfcPresupuesto) * 100 : 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de tiendas pasadas */}
      {tiendasAlerta > 0 && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="font-medium text-red-700">
              {tiendasAlerta} {tiendasAlerta === 1 ? 'tienda ha' : 'tiendas han'} excedido su presupuesto en {MESES[mes - 1]}
            </p>
          </div>
        </div>
      )}

      {/* Detalle por tienda - Top 10 + pasadas de presupuesto */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Detalle por Tienda</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">{tiendasPasadas.length} pasadas</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Top {top10PorGasto.length} gasto</span>
          </div>
        </div>
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
            {tiendasMostrar.map(r => {
              const pct = r.presupuesto_asignado > 0 ? (r.gasto_real / r.presupuesto_asignado) * 100 : 0
              return (
                <tr key={`${r.tienda_id}-${r.mes}`} className={r.saldo < 0 ? 'bg-red-50' : 'hover:bg-gray-50'}>
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
