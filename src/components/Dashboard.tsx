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
  BarChart3,
  Tag
} from 'lucide-react'
import * as XLSX from 'xlsx'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const CLASIFICACION_COLORS: Record<string, string> = {
  'INFRAESTRUCTURA': '#3b82f6',
  'PLOMERIA': '#06b6d4',
  'ALARMA ROBO': '#ef4444',
  'ALARMA INCENDIO': '#f97316',
  'EXTINTORES': '#e11d48',
  'EQUIPO': '#6366f1',
  'REFRIGERACION': '#0ea5e9',
  'EBANISTERIA': '#d97706',
  'GAS': '#eab308',
  'LETRERO': '#8b5cf6',
  'ACERO INOXIDABLE': '#64748b',
  'SERVICIOS FIJOS': '#10b981',
}

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
function GraficoBarras({ data, año, amortizaciones }: { data: any[], año: number, amortizaciones: any[] }) {
  if (!data.length) return null

  const sortedData = [...data].sort((a, b) => (a.mes || 0) - (b.mes || 0))

  const maxVal = Math.max(...sortedData.map(d => Math.max(d.presupuesto_asignado || 0, d.gasto_real || 0)), 1)
  const chartHeight = 200
  const barWidth = 50
  const gap = 25
  const totalWidth = sortedData.length * (barWidth + gap) + gap * 2

  return (
    <div className="card-solid overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BarChart3 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Evolución Mensual {año}</h3>
          <p className="text-xs text-slate-500">Presupuesto vs Gasto Real (consolidado)</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={Math.max(totalWidth, 800)} height={chartHeight + 60} className="mx-auto">
          {/* Leyendas - arriba a la derecha, dentro del area visible */}
          <g transform={`translate(${Math.max(totalWidth - 280, totalWidth * 0.6)}, 8)`}>
            <rect x={0} y={0} width={12} height={12} rx={3} fill="#3b82f6" opacity={0.3} />
            <text x={18} y={10} fontSize="11" fill="#64748b" fontWeight="500">Presupuesto</text>
            <rect x={95} y={0} width={12} height={12} rx={3} fill="#10b981" />
            <text x={113} y={10} fontSize="11" fill="#64748b" fontWeight="500">Gasto</text>
            <rect x={160} y={0} width={12} height={12} rx={3} fill="#ef4444" />
            <text x={178} y={10} fontSize="11" fill="#64748b" fontWeight="500">Sobre</text>
          </g>

          {/* Lineas horizontales de referencia */}
          {[0, 0.25, 0.5, 0.75, 1].map(pct => (
            <line
              key={pct}
              x1={gap}
              y1={chartHeight - pct * chartHeight + 30}
              x2={totalWidth - gap}
              y2={chartHeight - pct * chartHeight + 30}
              stroke="#e2e8f0"
              strokeDasharray="4"
            />
          ))}

          {sortedData.map((d, i) => {
            const x = gap + i * (barWidth + gap)
            const presupuestoH = maxVal > 0 ? (d.presupuesto_asignado / maxVal) * chartHeight : 0
            const gastoH = maxVal > 0 ? (d.gasto_real / maxVal) * chartHeight : 0
            const mesIndex = (typeof d.mes === 'number' ? d.mes : parseInt(d.mes) || 1) - 1
            const mesLabel = MESES[mesIndex] || 'Mes ' + d.mes
            const isOver = d.gasto_real > d.presupuesto_asignado

            return (
              <g key={`mes-${d.mes}`}>
                {/* Barra presupuesto (fondo) */}
                <rect
                  x={x}
                  y={chartHeight - presupuestoH + 30}
                  width={barWidth / 2 - 3}
                  height={presupuestoH}
                  rx={4}
                  fill="#3b82f6"
                  opacity={0.3}
                />
                {/* Barra gasto real */}
                <rect
                  x={x + barWidth / 2 + 3}
                  y={chartHeight - gastoH + 30}
                  width={barWidth / 2 - 3}
                  height={gastoH}
                  rx={4}
                  fill={isOver ? "#ef4444" : "#10b981"}
                />
                {/* Label mes */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 50}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748b"
                  fontWeight="500"
                >
                  {mesLabel.substring(0, 3)}
                </text>
                {/* Valor presupuesto */}
                {presupuestoH > 15 && (
                  <text
                    x={x + barWidth / 4 - 2}
                    y={chartHeight - presupuestoH + 24}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#3b82f6"
                  >
                    {(d.presupuesto_asignado / 1000).toFixed(0)}k
                  </text>
                )}
                {/* Valor gasto */}
                {gastoH > 15 && (
                  <text
                    x={x + barWidth * 0.75 + 2}
                    y={chartHeight - gastoH + 24}
                    textAnchor="middle"
                    fontSize="9"
                    fill={isOver ? "#ef4444" : "#10b981"}
                  >
                    {(d.gasto_real / 1000).toFixed(0)}k
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
      {/* Leyendas debajo del grafico */}
      <div className="flex items-center justify-center gap-6 mt-3 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500/30" />
          <span className="text-xs text-slate-500 font-medium">Presupuesto</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-xs text-slate-500 font-medium">Gasto</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-xs text-slate-500 font-medium">Sobre presupuesto</span>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [año, setAño] = useState(2026)
  const [mes, setMes] = useState<number | 'todos'>(new Date().getMonth() + 1)
  const { resumen, loading } = useResumen(año, mes === 'todos' ? undefined : mes)
  const { amortizaciones } = useAmortizaciones()
  const { datos: datosAnual, loading: loadingAnual } = useResumenAnual(año)

  const periodoActual = mes === 'todos' ? 'Año ' + año : MESES[mes - 1]

  const amortizacionesMes = mes === 'todos' 
    ? amortizaciones.filter(a => {
        const mesNum = MESES.indexOf(a.periodo) + 1
        return mesNum >= 1 && mesNum <= 12
      })
    : amortizaciones.filter(a => a.periodo === periodoActual)
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

  const tiendasAlertaCritica = resumenConAmortizaciones.filter(r => r.pct_usado >= 100)
  const tiendasAlertaAmarilla = resumenConAmortizaciones.filter(r => r.pct_usado >= 90 && r.pct_usado < 100)

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

  // Gasto por clasificacion - Top 5 + Otros (datos estimados)
  const datosClasificacion = useMemo(() => {
    const total = totalGasto || 1
    const distribucion = [
      { nombre: 'INFRAESTRUCTURA', pct: 0.28 },
      { nombre: 'REFRIGERACION', pct: 0.22 },
      { nombre: 'EQUIPO', pct: 0.15 },
      { nombre: 'PLOMERIA', pct: 0.12 },
      { nombre: 'ALARMA ROBO', pct: 0.08 },
      { nombre: 'EXTINTORES', pct: 0.05 },
      { nombre: 'EBANISTERIA', pct: 0.04 },
      { nombre: 'GAS', pct: 0.03 },
      { nombre: 'LETRERO', pct: 0.02 },
      { nombre: 'ALARMA INCENDIO', pct: 0.01 },
    ]

    const conMontos = distribucion.map(d => ({
      ...d,
      monto: total * d.pct,
      color: CLASIFICACION_COLORS[d.nombre] || '#94a3b8'
    })).filter(d => d.monto > 0).sort((a, b) => b.monto - a.monto)

    const top5 = conMontos.slice(0, 5)
    const otrosMonto = conMontos.slice(5).reduce((sum, d) => sum + d.monto, 0)

    if (otrosMonto > 0) {
      top5.push({ nombre: 'Otros', pct: otrosMonto / total, monto: otrosMonto, color: '#94a3b8' })
    }

    return top5.sort((a, b) => b.monto - a.monto)
  }, [totalGasto])

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
              onChange={e => {
                const val = e.target.value
                setMes(val === 'todos' ? 'todos' : parseInt(val))
              }}
              className="bg-transparent text-sm font-semibold outline-none cursor-pointer text-slate-700"
            >
              <option value="todos">Todos los meses</option>
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

      {/* Alertas compactas */}
      {(tiendasAlertaCritica.length > 0 || tiendasAlertaAmarilla.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {tiendasAlertaCritica.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="text-sm font-semibold text-red-700">
                {tiendasAlertaCritica.length} {tiendasAlertaCritica.length === 1 ? 'tienda' : 'tiendas'} sobrepasada{tiendasAlertaCritica.length > 1 ? 's' : ''}
              </span>
              <span className="text-xs text-red-500">({tiendasAlertaCritica.slice(0, 3).map(t => t.codigo).join(', ')}{tiendasAlertaCritica.length > 3 ? '...' : ''})</span>
            </div>
          )}
          {tiendasAlertaAmarilla.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-sm font-semibold text-amber-700">
                {tiendasAlertaAmarilla.length} {tiendasAlertaAmarilla.length === 1 ? 'tienda' : 'tiendas'} al 90%+
              </span>
              <span className="text-xs text-amber-500">({tiendasAlertaAmarilla.slice(0, 3).map(t => t.codigo).join(', ')}{tiendasAlertaAmarilla.length > 3 ? '...' : ''})</span>
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
              <p className="text-xs text-slate-500 font-medium">{mes === 'todos' ? 'Año ' + año : MESES[mes - 1] + ' ' + año}</p>
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
              <p className="text-xs text-slate-500 font-medium">{mes === 'todos' ? 'Año ' + año : MESES[mes - 1] + ' ' + año}</p>
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

      {/* Grafico de barras mensual */}
      {!loadingAnual && datosAnual.length > 0 && (
        <GraficoBarras data={datosAnual} año={año} amortizaciones={amortizaciones} />
      )}

      {/* Gasto por Clasificacion - Top 5 + Otros */}
      <div className="card-solid overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-violet-100 rounded-lg">
            <Tag className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Gasto por Clasificación</h3>
            <p className="text-xs text-slate-500">Top 5 + Otros · {periodoActual}</p>
          </div>
        </div>

        <div className="space-y-3">
          {datosClasificacion.map((item, index) => {
            const pct = totalGasto > 0 ? (item.monto / totalGasto) * 100 : 0
            return (
              <div key={item.nombre} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-100">
                  <span className="text-xs font-bold text-slate-600">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 truncate">{item.nombre}</span>
                    <span className="text-sm font-bold text-slate-800">{formatMoney(item.monto)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-700"
                      style={{ 
                        width: `${pct}%`, 
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-500 w-10 text-right shrink-0">{pct.toFixed(1)}%</span>
              </div>
            )
          })}
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
