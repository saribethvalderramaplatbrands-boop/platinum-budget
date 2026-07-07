import { useState, useEffect } from 'react'
import { useTiendas } from '../hooks/useSupabase'
import { supabase } from '../lib/supabase'
import { Table, Search, X, ArrowDown, ArrowUp, Filter } from 'lucide-react'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

interface PresupuestoRow {
  tienda_id: string
  codigo: number
  tienda: string
  unidad_negocio: string
  gerente_area: string
  gerente_regional: string
  año: number
  mes: number
  presupuesto_asignado: number
  gasto_real: number
  amortizado: number
  saldo: number
}

interface GastoDetalle {
  id: string
  fecha: string
  descripcion: string
  monto: number
  clasificacion: string
  proveedor: string
}

export default function PresupuestoView() {
  const { tiendas } = useTiendas()
  const [año, setAño] = useState(2026)
  const [mes, setMes] = useState<number | null>(null)
  const [gerenteArea, setGerenteArea] = useState('')
  const [gerenteRegional, setGerenteRegional] = useState('')
  const [unidadNegocio, setUnidadNegocio] = useState('')
  const [presupuestos, setPresupuestos] = useState<PresupuestoRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState<'saldo' | 'gasto'>('gasto')
  const [sortDesc, setSortDesc] = useState(true)

  // Modal de detalle
  const [selectedTienda, setSelectedTienda] = useState<PresupuestoRow | null>(null)
  const [detalleGastos, setDetalleGastos] = useState<GastoDetalle[]>([])
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  // Obtener listas únicas para filtros
  const gerentesArea = [...new Set(tiendas.map(t => t.gerente_area).filter(Boolean))].sort()
  const gerentesRegional = [...new Set(tiendas.map(t => t.gerente_regional).filter(Boolean))].sort()
  const unidadesNegocio = [...new Set(tiendas.map(t => t.unidad_negocio))].sort()

  const fetchPresupuestos = async () => {
    setIsLoading(true)

    let query = supabase
      .from('resumen_mensual')
      .select('*')
      .eq('año', año)

    if (mes) query = query.eq('mes', mes)

    const { data: resumenData, error: resumenError } = await query

    if (resumenError) {
      console.error('Error fetching resumen:', resumenError)
      setIsLoading(false)
      return
    }

    // Obtener amortizaciones
    const { data: amortData, error: amortError } = await supabase
      .from('amortizaciones')
      .select('codigo_tienda, monto, periodo')

    if (amortError) console.error('Error fetching amortizaciones:', amortError)

    // Combinar datos
    let rows: PresupuestoRow[] = (resumenData || []).map((r: any) => {
      const tienda = tiendas.find(t => t.id === r.tienda_id)

      // Calcular amortización para esta tienda/mes
      const amortizado = (amortData || [])
        .filter((a: any) => {
          const matchTienda = a.codigo_tienda === r.codigo
          const matchPeriodo = mes ? a.periodo === MESES[mes - 1] : true
          return matchTienda && matchPeriodo
        })
        .reduce((sum: number, a: any) => sum + (a.monto || 0), 0)

      return {
        tienda_id: r.tienda_id,
        codigo: r.codigo,
        tienda: r.tienda,
        unidad_negocio: r.unidad_negocio,
        gerente_area: tienda?.gerente_area || '',
        gerente_regional: tienda?.gerente_regional || '',
        año: r.año,
        mes: r.mes,
        presupuesto_asignado: r.presupuesto_asignado || 0,
        gasto_real: r.gasto_real || 0,
        amortizado: amortizado,
        saldo: (r.presupuesto_asignado || 0) - (r.gasto_real || 0) - amortizado,
      }
    })

    // Aplicar filtros de gerentes y unidad
    if (gerenteArea) {
      rows = rows.filter(r => r.gerente_area === gerenteArea)
    }
    if (gerenteRegional) {
      rows = rows.filter(r => r.gerente_regional === gerenteRegional)
    }
    if (unidadNegocio) {
      rows = rows.filter(r => r.unidad_negocio === unidadNegocio)
    }

    // Ordenar: primero los que se pasan de presupuesto (saldo negativo), luego por gasto
    rows.sort((a, b) => {
      const aOver = a.saldo < 0 ? 1 : 0
      const bOver = b.saldo < 0 ? 1 : 0

      if (aOver !== bOver) return bOver - aOver

      const valA = sortBy === 'saldo' ? a.saldo : a.gasto_real
      const valB = sortBy === 'saldo' ? b.saldo : b.gasto_real

      return sortDesc ? valB - valA : valA - valB
    })

    setPresupuestos(rows)
    setIsLoading(false)
  }

  // Recargar cuando cambie el ordenamiento
  useEffect(() => {
    if (presupuestos.length > 0) {
      fetchPresupuestos()
    }
  }, [sortBy, sortDesc])

  const fetchDetalleGastos = async (tiendaId: string, mesNum: number) => {
    setLoadingDetalle(true)

    const { data, error } = await supabase
      .from('gastos_diarios')
      .select(`
        *,
        proveedores:proveedor_id(codigo, nombre)
      `)
      .eq('tienda_id', tiendaId)
      .eq('periodo', MESES[mesNum - 1])
      .order('fecha', { ascending: false })

    if (error) {
      console.error('Error fetching detalle:', error)
      setLoadingDetalle(false)
      return
    }

    setDetalleGastos((data || []).map((g: any) => ({
      id: g.id,
      fecha: g.fecha,
      descripcion: g.descripcion,
      monto: g.monto,
      clasificacion: g.clasificacion,
      proveedor: g.proveedores ? `${g.proveedores.codigo} - ${g.proveedores.nombre}` : '-',
    })))

    setLoadingDetalle(false)
  }

  const handleRowDoubleClick = (row: PresupuestoRow) => {
    setSelectedTienda(row)
    fetchDetalleGastos(row.tienda_id, row.mes)
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getAlertClass = (saldo: number, presupuesto: number) => {
    if (saldo < 0) return 'bg-red-50 text-red-700 border-red-200'
    if (presupuesto > 0 && (presupuesto - saldo) / presupuesto > 0.9) return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    return ''
  }

  // Determinar qué unidades de negocio están presentes en los resultados filtrados
  const unidadesEnResultados = [...new Set(presupuestos.map(p => p.unidad_negocio))]
  const hayDQ = unidadesEnResultados.some(u => u?.includes('Dairy'))
  const hayKFC = unidadesEnResultados.some(u => u?.includes('Kentucky'))

  // Calcular totales filtrados por unidad de negocio (solo de las unidades presentes en resultados)
  const dqTotal = presupuestos
    .filter(p => p.unidad_negocio?.includes('Dairy'))
    .reduce((sum, p) => sum + p.presupuesto_asignado, 0)
  const dqGasto = presupuestos
    .filter(p => p.unidad_negocio?.includes('Dairy'))
    .reduce((sum, p) => sum + p.gasto_real, 0)
  const dqAmort = presupuestos
    .filter(p => p.unidad_negocio?.includes('Dairy'))
    .reduce((sum, p) => sum + p.amortizado, 0)

  const kfcTotal = presupuestos
    .filter(p => p.unidad_negocio?.includes('Kentucky'))
    .reduce((sum, p) => sum + p.presupuesto_asignado, 0)
  const kfcGasto = presupuestos
    .filter(p => p.unidad_negocio?.includes('Kentucky'))
    .reduce((sum, p) => sum + p.gasto_real, 0)
  const kfcAmort = presupuestos
    .filter(p => p.unidad_negocio?.includes('Kentucky'))
    .reduce((sum, p) => sum + p.amortizado, 0)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Presupuesto por Tienda</h2>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <input
              type="number"
              value={año}
              onChange={e => setAño(parseInt(e.target.value))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <select
              value={mes || ''}
              onChange={e => setMes(e.target.value ? parseInt(e.target.value) : null)}
              className="input-field"
            >
              <option value="">Todos los meses</option>
              {MESES.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Negocio</label>
            <select
              value={unidadNegocio}
              onChange={e => setUnidadNegocio(e.target.value)}
              className="input-field"
            >
              <option value="">Todas</option>
              {unidadesNegocio.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gerente de Área</label>
            <select
              value={gerenteArea}
              onChange={e => setGerenteArea(e.target.value)}
              className="input-field"
            >
              <option value="">Todos</option>
              {gerentesArea.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gerente Regional</label>
            <select
              value={gerenteRegional}
              onChange={e => setGerenteRegional(e.target.value)}
              className="input-field"
            >
              <option value="">Todos</option>
              {gerentesRegional.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={fetchPresupuestos} className="btn-primary flex items-center gap-2">
              <Table className="w-4 h-4" />
              Consultar
            </button>
          </div>
        </div>

        {/* Ordenamiento */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Ordenar por:</span>
          <button
            onClick={() => {
              if (sortBy === 'gasto') setSortDesc(!sortDesc)
              else { setSortBy('gasto'); setSortDesc(true) }
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              sortBy === 'gasto' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Gasto {sortBy === 'gasto' && (sortDesc ? <ArrowDown className="w-3 h-3 inline" /> : <ArrowUp className="w-3 h-3 inline" />)}
          </button>
          <button
            onClick={() => {
              if (sortBy === 'saldo') setSortDesc(!sortDesc)
              else { setSortBy('saldo'); setSortDesc(true) }
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              sortBy === 'saldo' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Saldo {sortBy === 'saldo' && (sortDesc ? <ArrowDown className="w-3 h-3 inline" /> : <ArrowUp className="w-3 h-3 inline" />)}
          </button>
        </div>
      </div>

      {/* Totales - mostrar solo las cards de las unidades presentes en los resultados filtrados */}
      {presupuestos.length > 0 && (
        <div className={`grid grid-cols-1 gap-4 ${hayDQ && hayKFC ? 'sm:grid-cols-2' : ''}`}>
          {hayDQ && (
            <div className="card bg-blue-50">
              <p className="text-sm text-blue-600 font-medium">Dairy Queen (DQ)</p>
              <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                <div>
                  <span className="text-gray-500">Presup:</span>
                  <p className="font-bold">{formatMoney(dqTotal)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Gasto:</span>
                  <p className="font-bold text-red-600">{formatMoney(dqGasto)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Amort:</span>
                  <p className="font-bold text-orange-600">{formatMoney(dqAmort)}</p>
                </div>
              </div>
            </div>
          )}
          {hayKFC && (
            <div className="card bg-red-50">
              <p className="text-sm text-red-600 font-medium">Kentucky Fried Chicken (KFC)</p>
              <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                <div>
                  <span className="text-gray-500">Presup:</span>
                  <p className="font-bold">{formatMoney(kfcTotal)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Gasto:</span>
                  <p className="font-bold text-red-600">{formatMoney(kfcGasto)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Amort:</span>
                  <p className="font-bold text-orange-600">{formatMoney(kfcAmort)}</p>
                </div>
              </div>
              </div>
          )}
        </div>
      )}

      {/* Tabla - sin columnas: código, gerente área, gerente regional, unidad de negocio */}
      <div className="card overflow-x-auto">
        <h3 className="font-bold mb-4">Detalle por Tienda</h3>
        {isLoading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : presupuestos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No hay datos para mostrar</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-3 py-2">Tienda</th>
                <th className="text-center px-3 py-2">Mes</th>
                <th className="text-right px-3 py-2">Presupuesto</th>
                <th className="text-right px-3 py-2">Amortizado</th>
                <th className="text-right px-3 py-2">Gasto</th>
                <th className="text-right px-3 py-2">Saldo</th>
                <th className="text-center px-3 py-2">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {presupuestos.map(p => {
                const pct = p.presupuesto_asignado > 0 
                  ? ((p.gasto_real + p.amortizado) / p.presupuesto_asignado) * 100 
                  : 0
                const alertClass = getAlertClass(p.saldo, p.presupuesto_asignado)

                return (
                  <tr 
                    key={`${p.tienda_id}-${p.mes}`} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${alertClass}`}
                    onDoubleClick={() => handleRowDoubleClick(p)}
                    title="Doble clic para ver detalle de gastos"
                  >
                    <td className="px-3 py-2 font-bold">{p.tienda}</td>
                    <td className="px-3 py-2 text-center">{MESES[p.mes - 1]}</td>
                    <td className="px-3 py-2 text-right font-bold">{formatMoney(p.presupuesto_asignado)}</td>
                    <td className="px-3 py-2 text-right font-bold text-orange-600">{formatMoney(p.amortizado)}</td>
                    <td className="px-3 py-2 text-right font-bold text-red-600">{formatMoney(p.gasto_real)}</td>
                    <td className={`px-3 py-2 text-right font-bold ${p.saldo < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatMoney(p.saldo)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${pct > 100 ? 'bg-red-500' : pct > 90 ? 'bg-yellow-500' : 'bg-green-500'}`}
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
        )}
      </div>

      {/* Modal de detalle - sin estatus y sin OC/Factura, más espacio para descripción */}
      {selectedTienda && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">
                  {selectedTienda.codigo} - {selectedTienda.tienda}
                </h3>
                <p className="text-sm text-gray-500">
                  {MESES[selectedTienda.mes - 1]} {selectedTienda.año} | {selectedTienda.unidad_negocio}
                </p>
              </div>
              <button 
                onClick={() => setSelectedTienda(null)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-4 gap-4 border-b border-gray-200 bg-gray-50">
              <div>
                <p className="text-xs text-gray-500">Presupuesto</p>
                <p className="font-bold text-lg">{formatMoney(selectedTienda.presupuesto_asignado)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Amortizado</p>
                <p className="font-bold text-lg text-orange-600">{formatMoney(selectedTienda.amortizado)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gasto Real</p>
                <p className="font-bold text-lg text-red-600">{formatMoney(selectedTienda.gasto_real)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Saldo</p>
                <p className={`font-bold text-lg ${selectedTienda.saldo < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatMoney(selectedTienda.saldo)}
                </p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <h4 className="font-bold mb-4">Desglose de Gastos</h4>

              {loadingDetalle ? (
                <div className="text-center py-4">Cargando detalle...</div>
              ) : detalleGastos.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No hay gastos registrados</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-3 py-2 bg-white">Fecha</th>
                      <th className="text-left px-3 py-2 bg-white">Descripción</th>
                      <th className="text-left px-3 py-2 bg-white">Clasificación</th>
                      <th className="text-left px-3 py-2 bg-white">Proveedor</th>
                      <th className="text-right px-3 py-2 bg-white">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {detalleGastos.map(g => (
                      <tr key={g.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap">{new Date(g.fecha).toLocaleDateString('es-PA')}</td>
                        <td className="px-3 py-2 max-w-md truncate" title={g.descripcion}>{g.descripcion}</td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100">{g.clasificacion}</span>
                        </td>
                        <td className="px-3 py-2 text-xs">{g.proveedor}</td>
                        <td className="px-3 py-2 text-right font-bold">{formatMoney(g.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {detalleGastos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-right">
                  <p className="text-sm text-gray-600">
                    Total gastos: <span className="font-bold text-red-600">{formatMoney(detalleGastos.reduce((sum, g) => sum + g.monto, 0))}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
