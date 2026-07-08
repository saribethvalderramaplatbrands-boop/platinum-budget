import { useState } from 'react'
import { useResumen, useAmortizaciones } from '../hooks/useSupabase'
import { 
  TrendingUp, 
  TrendingDown, 
  Store, 
  AlertTriangle,
  Calendar,
  PiggyBank,
  Wallet,
  Gauge,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Building2
} from 'lucide-react'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

interface TiendaConAmortizacion {
  tienda_id: string
  codigo: number
  tienda: string
  unidad_negocio: string
  presupuesto_asignado: number
  gasto_real: number
  amortizado: number
  saldo: number
  mes: number
}

const formatMoney = (amount: number) => {
  return '$' + (amount || 0).toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Dashboard() {
  const [año, setAño] = useState(2026)
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const { resumen, loading } = useResumen(año, mes)
  const { amortizaciones } = useAmortizaciones()

  const periodoActual = MESES[mes - 1]

  // Calcular amortizaciones del mes
  const amortizacionesMes = amortizaciones.filter(a => a.periodo === periodoActual)
  const totalAmortizaciones = amortizacionesMes.reduce((sum, a) => sum + (a.monto || 0), 0)

  // Combinar resumen con amortizaciones por tienda
  const resumenConAmortizaciones: TiendaConAmortizacion[] = resumen.map(r => {
    const amortizado = amortizacionesMes
      .filter(a => a.codigo_tienda === r.codigo)
      .reduce((sum, a) => sum + (a.monto || 0), 0)
    
    return {
      tienda_id: r.tienda_id,
      codigo: r.codigo,
      tienda: r.tienda,
      unidad_negocio: r.unidad_negocio,
      presupuesto_asignado: r.presupuesto_asignado || 0,
      gasto_real: r.gasto_real || 0,
      amortizado: amortizado,
      saldo: (r.presupuesto_asignado || 0) - (r.gasto_real || 0) - amortizado,
      mes: r.mes,
    }
  })

  const totalPresupuesto = resumenConAmortizaciones.reduce((sum, r) => sum + r.presupuesto_asignado, 0)
  const totalGastoReal = resumenConAmortizaciones.reduce((sum, r) => sum + r.gasto_real, 0)
  const totalGasto = totalGastoReal + totalAmortizaciones
  const totalSaldo = totalPresupuesto - totalGasto
  const porcentajeUsado = totalPresupuesto > 0 ? (totalGasto / totalPresupuesto) * 100 : 0

  const tiendasAlerta = resumenConAmortizaciones.filter(r => r.saldo < 0).length

  const dqResumen = resumenConAmortizaciones.filter(r => r.unidad_negocio?.includes('Dairy'))
  const kfcResumen = resumenConAmortizaciones.filter(r => r.unidad_negocio?.includes('Kentucky'))

  const getAmortizacionesPorCodigos = (codigos: number[]) => {
    return amortizacionesMes
      .filter(a => codigos.includes(a.codigo_tienda))
      .reduce((sum, a) => sum + (a.monto || 0), 0)
  }

  const dqCodigos = dqResumen.map(r => r.codigo)
  const kfcCodigos = kfcResumen.map(r => r.codigo)

  const dqAmortizaciones = getAmortizacionesPorCodigos(dqCodigos)
  const kfcAmortizaciones = getAmortizacionesPorCodigos(kfcCodigos)

  const dqPresupuesto = dqResumen.reduce((sum, r) => sum + r.presupuesto_asignado, 0)
  const dqGastoReal = dqResumen.reduce((sum, r) => sum + r.gasto_real, 0)
  const dqGasto = dqGastoReal + dqAmortizaciones
  const dqSaldo = dqPresupuesto - dqGasto
  const dqPct = dqPresupuesto > 0 ? (dqGasto / dqPresupuesto) * 100 : 0

  const kfcPresupuesto = kfcResumen.reduce((sum, r) => sum + r.presupuesto_asignado, 0)
  const kfcGastoReal = kfcResumen.reduce((sum, r) => sum + r.gasto_real, 0)
  const kfcGasto = kfcGastoReal + kfcAmortizaciones
  const kfcSaldo = kfcPresupuesto - kfcGasto
  const kfcPct = kfcPresupuesto > 0 ? (kfcGasto / kfcPresupuesto) * 100 : 0

  // Filtrar tiendas para mostrar
  const tiendasPasadas = resumenConAmortizaciones.filter(r => r.saldo < 0)
  const tiendasRestantes = resumenConAmortizaciones.filter(r => r.saldo >= 0)
  const top10PorGasto = [...tiendasRestantes].sort((a, b) => (b.gasto_real + b.amortizado) - (a.gasto_real + a.amortizado)).slice(0, 10)
  const tiendasMostrar = [...tiendasPasadas, ...top10PorGasto]
    .sort((a, b) => {
      if (a.saldo < 0 && b.saldo >= 0) return -1
      if (a.saldo >= 0 && b.saldo < 0) return 1
      return (b.gasto_real + b.amortizado) - (a.gasto_real + a.amortizado)
    })

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      <span className="ml-3 text-slate-500 font-medium">Cargando dashboard...</span>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header con selector de mes */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Resumen mensual de presupuesto</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select 
              value={mes} 
              onChange={e => setMes(parseInt(e.target.value))}
              className="bg-transparent text-sm font-semibold outline-none cursor-pointer text-slate-700"
            >
              {MESES.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
            <span className="text-sm text-slate-400 font-medium">Año</span>
            <input 
              type="number" 
              value={año} 
              onChange={e => setAño(parseInt(e.target.value))}
              className="w-16 bg-transparent text-sm font-semibold outline-none text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Presupuesto Total</p>
              <p className="text-2xl font-bold text-slate-800">{formatMoney(totalPresupuesto)}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-medium">
                <ArrowUpRight className="w-3 h-3" />
                <span>Asignado</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Gasto Real</p>
              <p className="text-2xl font-bold text-slate-800">{formatMoney(totalGasto)}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium">
                <ArrowDownRight className="w-3 h-3" />
                <span>{porcentajeUsado.toFixed(1)}% usado</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/25">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Saldo Disponible</p>
              <p className={`text-2xl font-bold ${totalSaldo < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatMoney(totalSaldo)}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-slate-400 font-medium">
                <Wallet className="w-3 h-3" />
                <span>Restante</span>
              </div>
            </div>
            <div className={`p-3 rounded-xl shadow-lg ${totalSaldo < 0 ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/25' : 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25'}`}>
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">% Usado</p>
              <p className="text-2xl font-bold text-slate-800">{porcentajeUsado.toFixed(1)}%</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-slate-400 font-medium">
                <Gauge className="w-3 h-3" />
                <span>Del presupuesto</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/25">
              <Gauge className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  porcentajeUsado > 100 ? 'bg-red-500' : porcentajeUsado > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(porcentajeUsado, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card de Amortizaciones */}
      <div className="card bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg shadow-orange-500/20">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-700">Amortizaciones {periodoActual}</p>
              <p className="text-2xl font-bold text-orange-800">{formatMoney(totalAmortizaciones)}</p>
              <p className="text-xs text-orange-500 font-medium">{amortizacionesMes.length} registros</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-orange-600 font-medium">Impacto en gasto</p>
            <p className="text-lg font-bold text-orange-700">
              {totalPresupuesto > 0 ? ((totalAmortizaciones / totalPresupuesto) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Cards DQ y KFC con logos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* DQ Card */}
        <div className="card-dq">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/dq-logo.png" 
              alt="Dairy Queen" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <div>
              <h3 className="font-bold text-lg text-slate-800">Dairy Queen</h3>
              <p className="text-xs text-slate-500 font-medium">{MESES[mes - 1]} {año}</p>
            </div>
            <div className="ml-auto">
              <span className={`badge ${dqSaldo < 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {dqSaldo < 0 ? 'Sobrepasado' : 'En línea'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 font-medium mb-1">Presupuesto</p>
              <p className="font-bold text-slate-800">{formatMoney(dqPresupuesto)}</p>
            </div>
            <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-red-100">
              <p className="text-xs text-red-600 font-medium mb-1">Gasto</p>
              <p className="font-bold text-red-600">{formatMoney(dqGasto)}</p>
            </div>
            <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-100">
              <p className="text-xs text-emerald-600 font-medium mb-1">Saldo</p>
              <p className={`font-bold ${dqSaldo < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatMoney(dqSaldo)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span>0%</span>
              <span>{dqPct.toFixed(1)}% usado</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-700 ${dqSaldo < 0 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
                style={{ width: `${Math.min(dqPct, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KFC Card */}
        <div className="card-kfc">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/kfc-logo.png" 
              alt="KFC" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <div>
              <h3 className="font-bold text-lg text-slate-800">Kentucky Fried Chicken</h3>
              <p className="text-xs text-slate-500 font-medium">{MESES[mes - 1]} {año}</p>
            </div>
            <div className="ml-auto">
              <span className={`badge ${kfcSaldo < 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {kfcSaldo < 0 ? 'Sobrepasado' : 'En línea'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-red-100">
              <p className="text-xs text-red-600 font-medium mb-1">Presupuesto</p>
              <p className="font-bold text-slate-800">{formatMoney(kfcPresupuesto)}</p>
            </div>
            <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-red-100">
              <p className="text-xs text-red-600 font-medium mb-1">Gasto</p>
              <p className="font-bold text-red-600">{formatMoney(kfcGasto)}</p>
            </div>
            <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-100">
              <p className="text-xs text-emerald-600 font-medium mb-1">Saldo</p>
              <p className={`font-bold ${kfcSaldo < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatMoney(kfcSaldo)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span>0%</span>
              <span>{kfcPct.toFixed(1)}% usado</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-700 ${kfcSaldo < 0 ? 'bg-red-500' : 'bg-gradient-to-r from-red-500 to-red-600'}`}
                style={{ width: `${Math.min(kfcPct, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de tiendas pasadas */}
      {tiendasAlerta > 0 && (
        <div className="card bg-gradient-to-r from-red-50 to-rose-50 border-red-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-red-700">
                {tiendasAlerta} {tiendasAlerta === 1 ? 'tienda ha' : 'tiendas han'} excedido su presupuesto
              </p>
              <p className="text-xs text-red-500">Revisa el detalle por tienda para más información</p>
            </div>
          </div>
        </div>
      )}

      {/* Detalle por tienda */}
      <div className="card-solid overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Building2 className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Detalle por Tienda</h3>
              <p className="text-xs text-slate-500">Top 10 + tiendas pasadas de presupuesto</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge bg-red-100 text-red-700">{tiendasPasadas.length} pasadas</span>
            <span className="badge bg-blue-100 text-blue-700">Top {top10PorGasto.length} gasto</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tienda</th>
                <th>Unidad</th>
                <th className="text-right">Presupuesto</th>
                <th className="text-right">Amortizado</th>
                <th className="text-right">Gasto</th>
                <th className="text-right">Saldo</th>
                <th className="text-center">%</th>
              </tr>
            </thead>
            <tbody>
              {tiendasMostrar.map(r => {
                const gastoTotal = r.gasto_real + r.amortizado
                const pct = r.presupuesto_asignado > 0 ? (gastoTotal / r.presupuesto_asignado) * 100 : 0
                const isOver = r.saldo < 0
                return (
                  <tr key={`${r.tienda_id}-${r.mes}`} className={isOver ? 'bg-red-50/50' : ''}>
                    <td className="font-bold text-slate-700">{r.codigo}</td>
                    <td className="font-medium text-slate-800">{r.tienda}</td>
                    <td className="text-xs text-slate-500">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.unidad_negocio?.includes('Dairy') 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {r.unidad_negocio?.includes('Dairy') ? 'DQ' : 'KFC'}
                      </span>
                    </td>
                    <td className="text-right font-medium text-slate-700">{formatMoney(r.presupuesto_asignado)}</td>
                    <td className="text-right text-orange-600 font-medium">{formatMoney(r.amortizado)}</td>
                    <td className="text-right text-red-600 font-medium">{formatMoney(r.gasto_real)}</td>
                    <td className={`text-right font-bold ${isOver ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatMoney(r.saldo)}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-500 w-8">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
