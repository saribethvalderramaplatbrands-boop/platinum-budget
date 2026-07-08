import { useState } from 'react'
import { usePlanificador } from '../hooks/useSupabase'
import { 
  TrendingUp, 
  Download, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  PiggyBank,
  Wallet,
  Gauge,
  Calendar,
  ArrowRight,
  Minus
} from 'lucide-react'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function Planificador() {
  const [año, setAño] = useState(2026)
  const { datos, loading, recalcular } = usePlanificador(año)

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0)
  }

  // Calcular totales
  const totalOriginal = datos.reduce((sum, d) => sum + (d.presupuesto_original || 0), 0)
  const totalAjustado = datos.reduce((sum, d) => sum + (d.presupuesto_ajustado || 0), 0)
  const totalGastoReal = datos.reduce((sum, d) => sum + (d.gasto_real || 0), 0)
  const totalAmortizaciones = datos.reduce((sum, d) => sum + (d.amortizaciones || 0), 0)
  const totalConsumido = datos.reduce((sum, d) => sum + (d.total_consumido || 0), 0)
  const totalSaldo = datos.reduce((sum, d) => sum + (d.saldo_ajustado || 0), 0)
  
  const totalAjustadoAnual = datos.reduce((sum, d) => sum + (d.presupuesto_ajustado || 0), 0)
  const disponibleAnual = totalAjustadoAnual - totalConsumido
  const colchonActual = datos.length > 0 ? datos[datos.length - 1].colchon_acumulado : 0

  const descargarExcel = () => {
    const csv = [
      ['Mes', 'Presupuesto Original', 'Presupuesto Ajustado', 'Gasto Real', 'Amortizaciones', 'Total Consumido', 'Saldo', 'A GASTAR', 'Estado'].join(','),
      ...datos.map(d => [
        MESES[d.mes - 1],
        d.presupuesto_original,
        d.presupuesto_ajustado,
        d.gasto_real,
        d.amortizaciones,
        d.total_consumido,
        d.saldo_ajustado,
        d.estado === 'proyectado' ? d.a_gastar : '-',
        d.estado
      ].join(',')),
      ['TOTAL', totalOriginal, totalAjustado, totalGastoReal, totalAmortizaciones, totalConsumido, totalSaldo, '', ''].join(',')
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `planificador_${año}.csv`
    link.click()
  }

  if (loading) return <div className="text-center py-8">Cargando planificador...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Planificador de Presupuesto</h2>
          <p className="text-sm text-gray-500">Gestiona tu presupuesto mensual y anual</p>
        </div>
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
              <p className="text-sm text-blue-600 font-medium">Presupuesto Ajustado Anual</p>
              <p className="text-2xl font-bold text-blue-700">{formatMoney(totalAjustadoAnual)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <PiggyBank className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm text-green-600 font-medium">Disponible Anual</p>
              <p className="text-2xl font-bold text-green-700">{formatMoney(disponibleAnual)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">A GASTAR Mensual</p>
              <p className="text-2xl font-bold text-purple-700">
                {datos.find(d => d.estado === 'proyectado')?.a_gastar 
                  ? formatMoney(datos.find(d => d.estado === 'proyectado')!.a_gastar) 
                  : '-'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerta si disponible es negativo */}
      {disponibleAnual < 0 && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="font-medium text-red-700">
              Alerta: Has consumido más de tu presupuesto ajustado anual. Disponible: {formatMoney(disponibleAnual)}
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
              <th className="text-right px-3 py-2">Presupuesto</th>
              <th className="text-right px-3 py-2">Ajustado</th>
              <th className="text-right px-3 py-2">Gasto Real</th>
              <th className="text-right px-3 py-2">Amortizaciones</th>
              <th className="text-right px-3 py-2 font-bold">Total</th>
              <th className="text-right px-3 py-2">Saldo</th>
              <th className="text-right px-3 py-2 font-bold text-primary-700">A GASTAR</th>
              <th className="text-center px-3 py-2">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {datos.map(d => {
              const esGastado = d.estado === 'gastado'
              const esProyectado = d.estado === 'proyectado'
              const aGastar = esProyectado ? d.a_gastar : null
              
              return (
                <tr 
                  key={d.mes} 
                  className={`
                    ${d.saldo_ajustado < 0 && esGastado ? 'bg-red-50' : ''}
                    ${d.saldo_ajustado > 0 && esGastado ? 'bg-green-50' : ''}
                    ${esProyectado ? 'bg-blue-50' : ''}
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
                  <td className="px-3 py-2 text-right font-bold">
                    {esProyectado ? (
                      <span className="flex items-center justify-end gap-1 text-blue-700">
                        <ArrowRight className="w-3 h-3" />
                        {formatMoney(aGastar)}
                      </span>
                    ) : (
                      <span className="flex items-center justify-end gap-1 text-gray-400">
                        <Minus className="w-3 h-3" />
                        -
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      esGastado && d.saldo_ajustado < 0 ? 'bg-red-100 text-red-700' :
                      esGastado && d.saldo_ajustado >= 0 ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {esGastado ? (
                        d.saldo_ajustado < 0 ? 'Pasado' : 'OK'
                      ) : 'Proyectado'}
                    </span>
                  </td>
                </tr>
              )
            })}
            
            {/* Fila de totales */}
            <tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
              <td className="px-3 py-3 text-lg">TOTAL</td>
              <td className="px-3 py-3 text-right text-lg">${totalOriginal.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</td>
              <td className="px-3 py-3 text-right text-lg text-purple-700">${totalAjustado.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</td>
              <td className="px-3 py-3 text-right text-lg text-red-700">${totalGastoReal.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</td>
              <td className="px-3 py-3 text-right text-lg text-orange-700">${totalAmortizaciones.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</td>
              <td className="px-3 py-3 text-right text-lg">${totalConsumido.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</td>
              <td className={`px-3 py-3 text-right text-lg ${totalSaldo < 0 ? 'text-red-700' : 'text-green-700'}`}>
                ${totalSaldo.toLocaleString('es-PA', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-3 py-3 text-right text-lg text-blue-700">
                {datos.find(d => d.estado === 'proyectado')?.a_gastar 
                  ? formatMoney(datos.find(d => d.estado === 'proyectado')!.a_gastar) 
                  : '-'}
              </td>
              <td className="px-3 py-3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="card">
        <h4 className="font-bold mb-3">Cómo interpretar esta tabla</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">OK</span>
            <span className="text-gray-600">Mes gastado dentro del presupuesto. El saldo verde es tu ahorro.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Pasado</span>
            <span className="text-gray-600">Mes gastado por encima del presupuesto. El saldo rojo es el exceso.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Proyectado</span>
            <span className="text-gray-600">Mes futuro. El A GASTAR azul es tu límite mensual para no pasarte del presupuesto anual.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">A GASTAR</span>
            <span className="text-gray-600">Disponible Anual / Meses Restantes - $10K. Es lo mismo para todos los meses proyectados.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
