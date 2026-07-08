import { useState } from 'react'
import { usePlanificador } from '../hooks/useSupabase'
import { 
  TrendingUp, 
  Download, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Info,
  PiggyBank,
  Wallet,
  Gauge,
  Calendar
} from 'lucide-react'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const ESTADOS: Record<string, { label: string; color: string; icon: any }> = {
  gastado: { label: 'Gastado', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  proyectado: { label: 'Proyectado', color: 'bg-green-100 text-green-700', icon: TrendingUp },
  alerta: { label: 'Alerta', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  sin_datos: { label: 'Sin Datos', color: 'bg-gray-100 text-gray-600', icon: Info },
}

export default function Planificador() {
  const [año, setAño] = useState(2026)
  const { datos, loading, recalcular } = usePlanificador(año)

  const totalOriginal = datos.reduce((sum, d) => sum + (d.presupuesto_original || 0), 0)
  const totalAjustado = datos.reduce((sum, d) => sum + (d.presupuesto_ajustado || 0), 0)
  const totalConsumido = datos.reduce((sum, d) => sum + (d.total_consumido || 0), 0)
  const totalSaldo = datos.reduce((sum, d) => sum + (d.saldo_ajustado || 0), 0)
  const colchonActual = datos.length > 0 ? datos[datos.length - 1].colchon_acumulado : 0

  const descargarExcel = () => {
    const csv = [
      ['Mes', 'Presupuesto Original', 'Presupuesto Ajustado', 'Gasto Real', 'Amortizaciones', 'Total Consumido', 'Saldo Ajustado', 'A GASTAR', 'Tope Activo', 'Estado', 'Colchón Acumulado'].join(','),
      ...datos.map(d => [
        MESES[d.mes - 1],
        d.presupuesto_original,
        d.presupuesto_ajustado,
        d.gasto_real,
        d.amortizaciones,
        d.total_consumido,
        d.saldo_ajustado,
        d.a_gastar,
        d.tope_activo,
        d.estado,
        d.colchon_acumulado
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `planificador_${año}.csv`
    link.click()
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0)
  }

  if (loading) return <div className="text-center py-8">Cargando planificador...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Planificador de Presupuesto</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input 
              type="number" 
              value={año} 
              onChange={e => setAño(parseInt(e.target.value))}
              className="w-16 bg-transparent text-sm font-medium outline-none"
            />
          </div>
          <button 
            onClick={() => recalcular()}
            className="btn-secondary flex items-center gap-2"
            title="Recalcular proyecciones"
          >
            <RefreshCw className="w-4 h-4" />
            Recalcular
          </button>
          <button 
            onClick={descargarExcel}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Cards resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Presupuesto Original Anual</p>
              <p className="text-2xl font-bold text-blue-700">{formatMoney(totalOriginal)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <PiggyBank className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Presupuesto Ajustado Anual</p>
              <p className="text-2xl font-bold text-purple-700">{formatMoney(totalAjustado)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Wallet className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Total Consumido</p>
              <p className="text-2xl font-bold text-red-700">{formatMoney(totalConsumido)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <Gauge className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Colchón Acumulado</p>
              <p className="text-2xl font-bold text-green-700">{formatMoney(colchonActual)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerta si hay déficit */}
      {totalSaldo < 0 && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="font-medium text-red-700">
              Alerta: El saldo ajustado acumulado es negativo ({formatMoney(totalSaldo)}). Estás excediendo el presupuesto ajustado.
            </p>
          </div>
        </div>
      )}

      {/* Tabla del planificador */}
      <div className="card overflow-x-auto">
        <h3 className="font-bold text-lg mb-4">Proyección Mensual</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-3 py-2">Mes</th>
              <th className="text-right px-3 py-2">Original</th>
              <th className="text-right px-3 py-2">Ajustado</th>
              <th className="text-right px-3 py-2">Gasto Real</th>
              <th className="text-right px-3 py-2">Amortizaciones</th>
              <th className="text-right px-3 py-2">Total Consumido</th>
              <th className="text-right px-3 py-2">Saldo</th>
              <th className="text-right px-3 py-2 font-bold text-primary-700">A GASTAR</th>
              <th className="text-center px-3 py-2">Tope</th>
              <th className="text-center px-3 py-2">Estado</th>
              <th className="text-right px-3 py-2">Colchón</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {datos.map(d => {
              const estadoConfig = ESTADOS[d.estado] || ESTADOS.sin_datos
              const EstadoIcon = estadoConfig.icon
              const pctConsumido = d.presupuesto_ajustado > 0 
                ? (d.total_consumido / d.presupuesto_ajustado) * 100 
                : 0

              return (
                <tr 
                  key={d.mes} 
                  className={`
                    ${d.estado === 'alerta' ? 'bg-red-50' : ''}
                    ${d.estado === 'gastado' && d.saldo_ajustado < 0 ? 'bg-red-50' : ''}
                    hover:bg-gray-50
                  `}
                >
                  <td className="px-3 py-2 font-medium">{MESES[d.mes - 1]}</td>
                  <td className="px-3 py-2 text-right">${d.presupuesto_original?.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-2 text-right text-purple-600">${d.presupuesto_ajustado?.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-2 text-right text-red-600">${d.gasto_real?.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-2 text-right text-orange-600">${d.amortizaciones?.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-2 text-right font-bold">${d.total_consumido?.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</td>
                  <td className={`px-3 py-2 text-right font-medium ${d.saldo_ajustado < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${d.saldo_ajustado?.toLocaleString('es-PA', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-primary-700 bg-primary-50">
                    ${d.a_gastar?.toLocaleString('es-PA', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      d.tope_activo === 'original' ? 'bg-blue-100 text-blue-700' :
                      d.tope_activo === 'anual' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {d.tope_activo === 'original' ? 'Original' : 
                       d.tope_activo === 'anual' ? 'Anual' : 'Ajustado'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${estadoConfig.color}`}>
                      <EstadoIcon className="w-3 h-3" />
                      {estadoConfig.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-green-600 font-medium">
                    ${d.colchon_acumulado?.toLocaleString('es-PA', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="card">
        <h4 className="font-bold mb-3">Leyenda de Topes</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Original</span>
            <span className="text-gray-600">A GASTAR = Presupuesto Original del mes (máximo permitido por Finanzas)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Anual</span>
            <span className="text-gray-600">A GASTAR = Disponible Anual / Meses restantes (para no pasarte del año)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Ajustado</span>
            <span className="text-gray-600">A GASTAR = Presupuesto Ajustado + Colchón (tu guía interna)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
