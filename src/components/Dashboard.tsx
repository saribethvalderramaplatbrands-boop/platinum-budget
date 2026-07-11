import { useState, useMemo } from 'react'
import { useResumen, useAmortizaciones, useResumenAnual } from '../hooks/useSupabase'
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
  Building2,
  Download,
  BarChart3
} from 'lucide-react'
import * as XLSX from 'xlsx'

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
  pct_usado: number
}

const formatMoney = (amount: number) => {
  return '$' + (amount || 0).toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Grafico de barras simple con SVG
function GraficoBarras({ data, año }: { data: any[], año: number }) {
  if (!data.length) return null

  const maxVal = Math.max(...data.map(d => Math.max(d.presupuesto_asignado || 0, d.gasto_real || 0)))
  const chartHeight = 200
  const barWidth = 60
  const gap = 20
  const totalWidth = data.length * (barWidth + gap) + gap

  return (
    <div className="card-solid overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BarChart3 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Evolución Mensual {año}</h3>
          <p className="text-xs text-slate-500">Presupuesto vs Gasto Real</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={totalWidth} height={chartHeight + 40} className="mx-auto">
          {/* Lineas horizontales */}
          {[0, 0.25, 0.5, 0.75, 1].map(pct => (
            <line
              key={pct}
              x1={gap}
              y1={chartHeight - pct * chartHeight + 20}
              x2={totalWidth - gap}
              y2={chartHeight - pct * chartHeight + 20}
              stroke="#e2e8f0"
              strokeDasharray="4"
            />
          ))}

          {data.map((d, i) => {
            const x = gap + i * (barWidth + gap)
            const presupuestoH = maxVal > 0 ? (d.presupuesto_asignado / maxVal) * chartHeight : 0
            const gastoH = maxVal > 0 ? (d.gasto_real / maxVal) * chartHeight : 0

            return (
              <g key={d.mes}>
                {/* Barra presupuesto (fondo) */}
                <rect
                  x={x}
                  y={chartHeight - presupuestoH + 20}
                  width={barWidth / 2 - 2}
                  height={presupuestoH}
                  rx={4}
                  fill="#3b82f6"
                  opacity={0.3}
                />
                {/* Barra gasto real */}
                <rect
                  x={x + barWidth / 2 + 2}
                  y={chartHeight - gastoH + 20}
                  width={barWidth / 2 - 2}
                  height={gastoH}
                  rx={4}
                  fill={d.gasto_real > d.presupuesto_asignado ? "#ef4444" : "#10b981"}
                />
                {/* Label mes */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 35}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                >
                  {MESES[d.mes - 1]?.substring(0, 3)}
                </text>
                {/* Valor presupuesto */}
                <text
                  x={x + barWidth / 4 - 1}
                  y={chartHeight - presupuestoH + 15}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#3b82f6"
                >
                  {(d.presupuesto_asignado / 1000).toFixed(0)}k
                </text>
                {/* Valor gasto */}
                <text
                  x={x + barWidth * 0.75 + 1}
                  y={chartHeight - gastoH + 15}
                  textAnchor="middle"
                  fontSize="9"
                  fill={d.gasto_real > d.presupuesto_asignado ? "#ef4444" : "#10b981"}
                >
                  {(d.gasto_real / 1000).toFixed(0)}k
                </text>
              </g>
            )
          })}

          {/* Leyenda */}
          <g transform={`translate(${totalWidth - 120}, 10)`}>
            <rect x={0} y={0} width={10} height={10} rx={2} fill="#3b82f6" opacity={0.3} />
            <text x={15} y={9} fontSize="10" fill="#64748b">Presupuesto</text>
            <rect x={0} y={16} width={10} height={10} rx={2} fill="#10b981" />
            <text x={15} y={25} fontSize="10" fill="#64748b">Gasto Real</text>
          </g>
        </svg>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [año, setAño] = useState(2026)
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const { resumen, loading } = useResumen(año, mes)
  const { amortizaciones } = useAmortizaciones()
  const { datos: datosAnual, loading: loadingAnual } = useResumenAnual(año)

  const periodoActual = MESES[mes - 1]

  const amortizacionesMes = amortizaciones.filter(a => a.periodo === periodoActual)
  const totalAmortizaciones = amortizacionesMes.reduce((sum, a) => sum + (a.monto || 0), 0)

  const resumenConAmortizaciones: TiendaConAmortizacion[] = useMemo(() => {
    return resumen.map(r => {
      const amortizado = amortizacionesMes
        .filter(a => a.codigo_tienda === r.codigo)
        .reduce((sum, a) => sum + (a.monto || 0), 0)
      const gastoTotal = (r.gasto_real || 0) + amortizado
      const pct = r.presupuesto_asignado > 0 ? (gastoTotal / r.presupuesto_asignado) * 100 : 0

      return {
        tienda_id: r.tienda_id,
        codigo: r.codigo,
        tienda: r.tienda,
        unidad_negocio: r.unidad_negocio,
        presupuesto_asignado: r.presupuesto_asignado || 0,
        gasto_real: r.gasto_real || 0,
        amortizado: amortizado,
        saldo: (r.presupuesto_asignado || 0) - gastoTotal,
        mes: r.mes,
        pct_usado: pct,
      }
    })
  }, [resumen, amortizacionesMes])

  const totalPresupuesto = resumenConAmortizaciones.reduce((sum, r) => sum + r.presupuesto_asignado, 0)
  const totalGastoReal = resumenConAmortizaciones.reduce((sum, r) => sum + r.gasto_real, 0)
  const totalGasto = totalGastoReal + totalAmortizaciones
  const totalSaldo = totalPresupuesto - totalGasto
  const porcentajeUsado = totalPresupuesto > 0 ? (totalGasto / totalPresupuesto) * 100 : 0

  // Alertas: tiendas que pasaron del 90% o están en negativo
  const tiendasAlertaCritica = resumenConAmortizaciones.filter(r => r.pct_usado >= 100)
  const tiendasAlertaAmarilla = resumenConAmortizaciones.filter(r => r.pct_usado >= 90 && r.pct_usado < 100)
  const tiendasAlerta = tiendasAlertaCritica.length + tiendasAlertaAmarilla.length

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

  const tiendasPasadas = resumenConAmortizaciones.filter(r => r.saldo < 0)
  const tiendasRestantes = resumenConAmortizaciones.filter(r => r.saldo >= 0)
  const top10PorGasto = [...tiendasRestantes].sort((a, b) => (b.gasto_real + b.amortizado) - (a.gasto_real + a.amortizado)).slice(0, 10)
  const tiendasMostrar = [...tiendasPasadas, ...top10PorGasto]
    .sort((a, b) => {
      if (a.saldo < 0 && b.saldo >= 0) return -1
      if (a.saldo >= 0 && b.saldo < 0) return 1
      return (b.gasto_real + b.amortizado) - (a.gasto_real + a.amortizado)
    })

  // Exportar Dashboard a Excel
  const handleExport = () => {
    const excelData = tiendasMostrar.map(r => ({
      'Codigo': r.codigo,
      'Tienda': r.tienda,
      'Unidad': r.unidad_negocio?.includes('Dairy') ? 'DQ' : 'KFC',
      'Presupuesto': r.presupuesto_asignado,
      'Amortizado': r.amortizado,
      'Gasto Real': r.gasto_real,
      'Gasto Total': r.gasto_real + r.amortizado,
      'Saldo': r.saldo,
      '% Usado': r.pct_usado.toFixed(1) + '%',
      'Estado': r.saldo < 0 ? 'Sobrepasado' : r.pct_usado >= 90 ? 'Alerta' : 'OK',
    }))

    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Resumen Dashboard')

    ws['!cols'] = [
      { wch: 8 }, { wch: 25 }, { wch: 8 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 10 }, { wch: 12 },
    ]

    XLSX.writeFile(wb, `Dashboard_${periodoActual}_${año}.xlsx`)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      <span className="ml-3 text-slate-500 font-medium">Cargando dashboard...</span>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header con selector de mes y exportar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Resumen mensual de presupuesto</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>
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

      {/* Alertas de presupuesto */}
      {(tiendasAlertaCritica.length > 0 || tiendasAlertaAmarilla.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tiendasAlertaCritica.length > 0 && (
            <div className="card bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-red-700">
                    {tiendasAlertaCritica.length} {tiendasAlertaCritica.length === 1 ? 'tienda excedió' : 'tiendas excedieron'} el presupuesto
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tiendasAlertaCritica.slice(0, 5).map(t => (
                      <span key={t.codigo} className="badge bg-red-100 text-red-700 text-xs">
                        {t.codigo} - {t.pct_usado.toFixed(0)}%
                      </span>
                    ))}
                    {tiendasAlertaCritica.length > 5 && (
                      <span className="badge bg-red-50 text-red-500 text-xs">+{tiendasAlertaCritica.length - 5} más</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tiendasAlertaAmarilla.length > 0 && (
            <div className="card bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-amber-700">
                    {tiendasAlertaAmarilla.length} {tiendasAlertaAmarilla.length === 1 ? 'tienda cerca' : 'tiendas cerca'} del límite (90%+)
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tiendasAlertaAmarilla.slice(0, 5).map(t => (
                      <span key={t.codigo} className="badge bg-amber-100 text-amber-700 text-xs">
                        {t.codigo} - {t.pct_usado.toFixed(0)}%
                      </span>
                    ))}
                    {tiendasAlertaAmarilla.length > 5 && (
                      <span className="badge bg-amber-50 text-amber-500 text-xs">+{tiendasAlertaAmarilla.length - 5} más</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
                  porcentajeUsado > 100 ? 'bg-red-500' : porcentajeUsado > 90 ? 'bg-amber-500' : porcentajeUsado > 80 ? 'bg-yellow-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(porcentajeUsado, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grafico de barras mensual */}
      {!loadingAnual && datosAnual.length > 0 && (
        <GraficoBarras data={datosAnual} año={año} />
      )}

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

      {/* Cards DQ y KFC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* DQ Card */}
        <div className={`card-dq ${dqPct >= 90 ? 'ring-2 ring-amber-400' : ''}`}>
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
              <span className={`badge ${dqSaldo < 0 ? 'bg-red-100 text-red-700' : dqPct >= 90 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {dqSaldo < 0 ? 'Sobrepasado' : dqPct >= 90 ? 'Alerta' : 'En línea'}
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
              <span className={dqPct >= 90 ? 'text-amber-600 font-bold' : ''}>{dqPct.toFixed(1)}% usado</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-700 ${
                  dqSaldo < 0 ? 'bg-red-500' : dqPct >= 90 ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}
                style={{ width: `${Math.min(dqPct, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KFC Card */}
        <div className={`card-kfc ${kfcPct >= 90 ? 'ring-2 ring-amber-400' : ''}`}>
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
              <span className={`badge ${kfcSaldo < 0 ? 'bg-red-100 text-red-700' : kfcPct >= 90 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {kfcSaldo < 0 ? 'Sobrepasado' : kfcPct >= 90 ? 'Alerta' : 'En línea'}
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
              <span className={kfcPct >= 90 ? 'text-amber-600 font-bold' : ''}>{kfcPct.toFixed(1)}% usado</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-700 ${
                  kfcSaldo < 0 ? 'bg-red-500' : kfcPct >= 90 ? 'bg-amber-500' : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${Math.min(kfcPct, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

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
            <span className="badge bg-amber-100 text-amber-700">{tiendasAlertaAmarilla.length} alerta</span>
            <span className="badge bg-blue-100 text-blue-700">Top {top10PorGasto.length} gasto</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Tienda</th>
                <th>Unidad</th>
                <th className="text-right">Presupuesto</th>
                <th className="text-right">Amortizado</th>
                <th className="text-right">Gasto</th>
                <th className="text-right">Saldo</th>
                <th className="text-center">%</th>
                <th className="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {tiendasMostrar.map(r => {
                const gastoTotal = r.gasto_real + r.amortizado
                const pct = r.presupuesto_asignado > 0 ? (gastoTotal / r.presupuesto_asignado) * 100 : 0
                const isOver = r.saldo < 0
                const isAlert = pct >= 90 && !isOver
                return (
                  <tr key={`${r.tienda_id}-${r.mes}`} className={isOver ? 'bg-red-50/50' : isAlert ? 'bg-amber-50/50' : ''}>
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
                            className={`h-1.5 rounded-full ${pct > 100 ? 'bg-red-500' : pct >= 90 ? 'bg-amber-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium w-8 ${pct >= 90 ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className={`badge text-xs ${
                        isOver ? 'bg-red-100 text-red-700' : 
                        isAlert ? 'bg-amber-100 text-amber-700' : 
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isOver ? 'Sobrepasado' : isAlert ? 'Alerta' : 'OK'}
                      </span>
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
