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
  Minus,
  Target
} from 'lucide-react'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const formatMoney = (amount: number) => {
  return '$' + (amount || 0).toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Planificador() {
  const [año, setAño] = useState(2026)
  const { datos, loading, recalcular } = usePlanificador(año)

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

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      <span className="ml-3 text-slate-500">Cargando planificador...</span>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Planificador de Presupuesto</h2>
          <p className="text-sm text-slate-500 mt-1">Gestiona tu presupuesto mensual y anual</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input type="number" value={año} onChange={e => setAño(parseInt(e.target.value))} className="w-16 bg-transparent text-sm font-semibold outline-none text-slate-700" />
          </div>
          <button onClick={() => recalcular()} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />Recalcular
          </button>
          <button onClick={descargarExcel} className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Presupuesto Ajustado Anual</p>
              <p className="text-2xl font-bold text-slate-800">{formatMoney(totalAjustadoAnual)}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Consumido</p>
              <p className="text-2xl font-bold text-slate-800">{formatMoney(totalConsumido)}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/20">
              <Gauge className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Disponible Anual</p>
              <p className={`text-2xl font-bold ${disponibleAnual < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatMoney(disponibleAnual)}</p>
            </div>
            <div className={`p-3 rounded-xl shadow-lg ${disponibleAnual < 0 ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/20' : 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20'}`}>
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">A GASTAR Mensual</p>
              <p className="text-2xl font-bold text-violet-600">
                {datos.find(d => d.estado === 'proyectado')?.a_gastar 
                  ? formatMoney(datos.find(d => d.estado === 'proyectado')!.a_gastar) 
                  : '-'}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg shadow-violet-500/20">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {disponibleAnual < 0 && (
        <div className="card bg-gradient-to-r from-red-50 to-rose-50 border-red-100">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="font-bold text-red-700">
              Alerta: Has consumido más de tu presupuesto ajustado anual. Disponible: {formatMoney(disponibleAnual)}
            </p>
          </div>
        </div>
      )}

      <div className="card-solid overflow-hidden">
        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-slate-400" />
          Proyección Mensual
        </h3>
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Mes</th>
                <th className="text-right">Presupuesto</th>
                <th className="text-right">Ajustado</th>
                <th className="text-right">Gasto Real</th>
                <th className="text-right">Amortizaciones</th>
                <th className="text-right font-bold">Total</th>
                <th className="text-right">Saldo</th>
                <th className="text-right font-bold text-violet-700">A GASTAR</th>
                <th className="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {datos.map(d => {
                const esGastado = d.estado === 'gastado'
                const esProyectado = d.estado === 'proyectado'
                const aGastar = esProyectado ? d.a_gastar : null
                
                return (
                  <tr key={d.mes} className={`
                    ${d.saldo_ajustado < 0 && esGastado ? 'bg-red-50/50' : ''}
                    ${d.saldo_ajustado > 0 && esGastado ? 'bg-emerald-50/30' : ''}
                    ${esProyectado ? 'bg-blue-50/30' : ''}
                    hover:bg-slate-50/50
                  `}>
                    <td className="font-bold text-slate-800">{MESES[d.mes - 1]}</td>
                    <td className="text-right text-slate-600">{formatMoney(d.presupuesto_original || 0)}</td>
                    <td className="text-right text-violet-600">{formatMoney(d.presupuesto_ajustado || 0)}</td>
                    <td className="text-right text-red-600">{formatMoney(d.gasto_real || 0)}</td>
                    <td className="text-right text-orange-600">{formatMoney(d.amortizaciones || 0)}</td>
                    <td className="text-right font-bold text-slate-800">{formatMoney(d.total_consumido || 0)}</td>
                    <td className={`text-right font-medium ${d.saldo_ajustado < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatMoney(d.saldo_ajustado || 0)}
                    </td>
                    <td className="text-right font-bold">
                      {esProyectado ? (
                        <span className="flex items-center justify-end gap-1 text-violet-700">
                          <ArrowRight className="w-3 h-3" />
                          {formatMoney(aGastar || 0)}
                        </span>
                      ) : (
                        <span className="flex items-center justify-end gap-1 text-slate-400">
                          <Minus className="w-3 h-3" />-
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${esGastado && d.saldo_ajustado < 0 ? 'bg-red-100 text-red-700' : esGastado && d.saldo_ajustado >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {esGastado ? (d.saldo_ajustado < 0 ? 'Pasado' : 'OK') : 'Proyectado'}
                      </span>
                    </td>
                  </tr>
                )
              })}
              
              <tr className="border-t-2 border-slate-200 bg-slate-50/80 font-bold">
                <td className="px-4 py-3 text-lg text-slate-800">TOTAL</td>
                <td className="px-4 py-3 text-right text-lg text-slate-800">{formatMoney(totalOriginal)}</td>
                <td className="px-4 py-3 text-right text-lg text-violet-700">{formatMoney(totalAjustado)}</td>
                <td className="px-4 py-3 text-right text-lg text-red-700">{formatMoney(totalGastoReal)}</td>
                <td className="px-4 py-3 text-right text-lg text-orange-700">{formatMoney(totalAmortizaciones)}</td>
                <td className="px-4 py-3 text-right text-lg text-slate-800">{formatMoney(totalConsumido)}</td>
                <td className={`px-4 py-3 text-right text-lg ${totalSaldo < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                  {formatMoney(totalSaldo)}
                </td>
                <td className="px-4 py-3 text-right text-lg text-violet-700">
                  {datos.find(d => d.estado === 'proyectado')?.a_gastar 
                    ? formatMoney(datos.find(d => d.estado === 'proyectado')!.a_gastar!) 
                    : '-'}
                </td>
                <td className="px-4 py-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-solid">
        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-slate-400" />
          Cómo interpretar esta tabla
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 shrink-0">OK</span>
            <span className="text-slate-600">Mes gastado dentro del presupuesto. El saldo verde es tu ahorro.</span>
          </div>
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 shrink-0">Pasado</span>
            <span className="text-slate-600">Mes gastado por encima del presupuesto. El saldo rojo es el exceso.</span>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 shrink-0">Proyectado</span>
            <span className="text-slate-600">Mes futuro. El A GASTAR es tu límite mensual para no pasarte del presupuesto anual.</span>
          </div>
          <div className="flex items-start gap-3 p-3 bg-violet-50 rounded-xl border border-violet-100">
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 shrink-0">A GASTAR</span>
            <span className="text-slate-600">Disponible Anual / Meses Restantes - $10K. Es lo mismo para todos los meses proyectados.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
