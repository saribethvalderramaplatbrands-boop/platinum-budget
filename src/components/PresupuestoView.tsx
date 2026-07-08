import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTiendas } from '../hooks/useSupabase'
import { supabase } from '../lib/supabase'
import { Table, Search, X, ArrowDown, ArrowUp, Filter, Building2, Eye } from 'lucide-react'

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

const formatMoney = (amount: number) => {
  return '$' + (amount || 0).toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Componente Modal separado que se renderiza con Portal
function TiendaModal({ 
  tienda, 
  gastos, 
  loading, 
  onClose 
}: { 
  tienda: PresupuestoRow
  gastos: GastoDetalle[]
  loading: boolean
  onClose: () => void
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      {/* Overlay */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        style={{
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '1024px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, #f8fafc, #ffffff)', borderRadius: '16px 16px 0 0', flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>{tienda.codigo} - {tienda.tienda}</h3>
            <p style={{ fontSize: '14px', color: '#64748b' }}>{MESES[tienda.mes - 1]} {tienda.año} | {tienda.unidad_negocio}</p>
          </div>
          <button onClick={onClose} style={{ padding: '8px', borderRadius: '12px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <X style={{ width: '20px', height: '20px', color: '#64748b' }} />
          </button>
        </div>

        {/* Stats */}
        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc80', flexShrink: 0 }}>
          {[
            { label: 'Presupuesto', value: formatMoney(tienda.presupuesto_asignado), color: '#1e293b' },
            { label: 'Amortizado', value: formatMoney(tienda.amortizado), color: '#ea580c' },
            { label: 'Gasto Real', value: formatMoney(tienda.gasto_real), color: '#dc2626' },
            { label: 'Saldo', value: formatMoney(tienda.saldo), color: tienda.saldo < 0 ? '#dc2626' : '#059669' },
          ].map((stat, i) => (
            <div key={i} style={{ padding: '12px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{stat.label}</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Contenido */}
        <div style={{ padding: '20px', overflowY: 'auto' }}>
          <h4 style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
            Desglose de Gastos
          </h4>
          
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
              <div className="animate-spin" style={{ width: '24px', height: '24px', border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%' }} />
              <span style={{ marginLeft: '8px', color: '#64748b' }}>Cargando...</span>
            </div>
          ) : gastos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
              <p>No hay gastos registrados</p>
            </div>
          ) : (
            <>
              <div style={{ overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      {['Fecha', 'Descripción', 'Clasif.', 'Proveedor', 'Monto'].map((h, i) => (
                        <th key={i} style={{ textAlign: i === 4 ? 'right' : 'left', padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap', backgroundColor: 'white' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gastos.map(g => (
                      <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', color: '#475569' }}>{new Date(g.fecha).toLocaleDateString('es-PA')}</td>
                        <td style={{ padding: '8px 12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#334155' }} title={g.descripcion}>{g.descripcion}</td>
                        <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '9999px', fontSize: '12px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 500 }}>{g.clasificacion}</span>
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: '12px', color: '#64748b', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={g.proveedor}>{g.proveedor}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold', color: '#1e293b', whiteSpace: 'nowrap' }}>{formatMoney(g.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', textAlign: 'right' }}>
                <p style={{ fontSize: '14px', color: '#475569' }}>
                  Total gastos: <span style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '18px' }}>{formatMoney(gastos.reduce((sum, g) => sum + g.monto, 0))}</span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
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

  const [selectedTienda, setSelectedTienda] = useState<PresupuestoRow | null>(null)
  const [detalleGastos, setDetalleGastos] = useState<GastoDetalle[]>([])
  const [loadingDetalle, setLoadingDetalle] = useState(false)

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

    const { data: amortData, error: amortError } = await supabase
      .from('amortizaciones')
      .select('codigo_tienda, monto, periodo')

    if (amortError) console.error('Error fetching amortizaciones:', amortError)

    let rows: PresupuestoRow[] = (resumenData || []).map((r: any) => {
      const tienda = tiendas.find(t => t.id === r.tienda_id)

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

    if (gerenteArea) rows = rows.filter(r => r.gerente_area === gerenteArea)
    if (gerenteRegional) rows = rows.filter(r => r.gerente_regional === gerenteRegional)
    if (unidadNegocio) rows = rows.filter(r => r.unidad_negocio === unidadNegocio)

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

  useEffect(() => {
    if (presupuestos.length > 0) fetchPresupuestos()
  }, [sortBy, sortDesc])

  const fetchDetalleGastos = async (tiendaId: string, mesNum: number) => {
    setLoadingDetalle(true)
    const { data, error } = await supabase
      .from('gastos_diarios')
      .select(`*, proveedores:proveedor_id(codigo, nombre)`)
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

  const getAlertClass = (saldo: number, presupuesto: number) => {
    if (saldo < 0) return 'bg-red-50/80 text-red-700 border-red-100'
    if (presupuesto > 0 && (presupuesto - saldo) / presupuesto > 0.9) return 'bg-amber-50/80 text-amber-700 border-amber-100'
    return ''
  }

  const unidadesEnResultados = [...new Set(presupuestos.map(p => p.unidad_negocio))]
  const hayDQ = unidadesEnResultados.some(u => u?.includes('Dairy'))
  const hayKFC = unidadesEnResultados.some(u => u?.includes('Kentucky'))

  const dqTotal = presupuestos.filter(p => p.unidad_negocio?.includes('Dairy')).reduce((sum, p) => sum + p.presupuesto_asignado, 0)
  const dqGasto = presupuestos.filter(p => p.unidad_negocio?.includes('Dairy')).reduce((sum, p) => sum + p.gasto_real, 0)
  const dqAmort = presupuestos.filter(p => p.unidad_negocio?.includes('Dairy')).reduce((sum, p) => sum + p.amortizado, 0)

  const kfcTotal = presupuestos.filter(p => p.unidad_negocio?.includes('Kentucky')).reduce((sum, p) => sum + p.presupuesto_asignado, 0)
  const kfcGasto = presupuestos.filter(p => p.unidad_negocio?.includes('Kentucky')).reduce((sum, p) => sum + p.gasto_real, 0)
  const kfcAmort = presupuestos.filter(p => p.unidad_negocio?.includes('Kentucky')).reduce((sum, p) => sum + p.amortizado, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Presupuesto por Tienda</h2>
        <p className="text-sm text-slate-500 mt-1">Consulta y filtra el presupuesto detallado</p>
      </div>

      <div className="card-solid">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Año</label>
            <input type="number" value={año} onChange={e => setAño(parseInt(e.target.value))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mes</label>
            <select value={mes || ''} onChange={e => setMes(e.target.value ? parseInt(e.target.value) : null)} className="input-field">
              <option value="">Todos los meses</option>
              {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Unidad de Negocio</label>
            <select value={unidadNegocio} onChange={e => setUnidadNegocio(e.target.value)} className="input-field">
              <option value="">Todas</option>
              {unidadesNegocio.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Gerente de Área</label>
            <select value={gerenteArea} onChange={e => setGerenteArea(e.target.value)} className="input-field">
              <option value="">Todos</option>
              {gerentesArea.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Gerente Regional</label>
            <select value={gerenteRegional} onChange={e => setGerenteRegional(e.target.value)} className="input-field">
              <option value="">Todos</option>
              {gerentesRegional.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={fetchPresupuestos} className="btn-primary flex items-center gap-2">
              <Table className="w-4 h-4" />
              Consultar
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500 font-medium">Ordenar por:</span>
          <button onClick={() => { if (sortBy === 'gasto') setSortDesc(!sortDesc); else { setSortBy('gasto'); setSortDesc(true) } }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sortBy === 'gasto' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            Gasto {sortBy === 'gasto' && (sortDesc ? <ArrowDown className="w-3 h-3 inline" /> : <ArrowUp className="w-3 h-3 inline" />)}
          </button>
          <button onClick={() => { if (sortBy === 'saldo') setSortDesc(!sortDesc); else { setSortBy('saldo'); setSortDesc(true) } }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sortBy === 'saldo' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            Saldo {sortBy === 'saldo' && (sortDesc ? <ArrowDown className="w-3 h-3 inline" /> : <ArrowUp className="w-3 h-3 inline" />)}
          </button>
        </div>
      </div>

      {presupuestos.length > 0 && (
        <div className={`grid grid-cols-1 gap-4 ${hayDQ && hayKFC ? 'sm:grid-cols-2' : ''}`}>
          {hayDQ && (
            <div className="card-dq">
              <div className="flex items-center gap-3 mb-3">
                <img src="/dq-logo.png" alt="DQ" className="h-8 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <p className="text-sm font-bold text-blue-700">Dairy Queen</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="p-2 bg-white/60 rounded-lg text-center">
                  <span className="text-xs text-slate-500 block">Presup</span>
                  <p className="font-bold text-slate-800">{formatMoney(dqTotal)}</p>
                </div>
                <div className="p-2 bg-white/60 rounded-lg text-center">
                  <span className="text-xs text-slate-500 block">Gasto</span>
                  <p className="font-bold text-red-600">{formatMoney(dqGasto)}</p>
                </div>
                <div className="p-2 bg-white/60 rounded-lg text-center">
                  <span className="text-xs text-slate-500 block">Amort</span>
                  <p className="font-bold text-orange-600">{formatMoney(dqAmort)}</p>
                </div>
              </div>
            </div>
          )}
          {hayKFC && (
            <div className="card-kfc">
              <div className="flex items-center gap-3 mb-3">
                <img src="/kfc-logo.png" alt="KFC" className="h-8 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <p className="text-sm font-bold text-red-700">Kentucky Fried Chicken</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="p-2 bg-white/60 rounded-lg text-center">
                  <span className="text-xs text-slate-500 block">Presup</span>
                  <p className="font-bold text-slate-800">{formatMoney(kfcTotal)}</p>
                </div>
                <div className="p-2 bg-white/60 rounded-lg text-center">
                  <span className="text-xs text-slate-500 block">Gasto</span>
                  <p className="font-bold text-red-600">{formatMoney(kfcGasto)}</p>
                </div>
                <div className="p-2 bg-white/60 rounded-lg text-center">
                  <span className="text-xs text-slate-500 block">Amort</span>
                  <p className="font-bold text-orange-600">{formatMoney(kfcAmort)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card-solid overflow-hidden">
        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-slate-500" />
          Detalle por Tienda
        </h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-3 text-slate-500">Cargando...</span>
          </div>
        ) : presupuestos.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay datos para mostrar</p>
            <p className="text-sm mt-1">Aplica filtros y consulta</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Tienda</th>
                  <th className="text-center">Mes</th>
                  <th className="text-right">Presupuesto</th>
                  <th className="text-right">Amortizado</th>
                  <th className="text-right">Gasto</th>
                  <th className="text-right">Saldo</th>
                  <th className="text-center">%</th>
                </tr>
              </thead>
              <tbody>
                {presupuestos.map(p => {
                  const pct = p.presupuesto_asignado > 0 ? ((p.gasto_real + p.amortizado) / p.presupuesto_asignado) * 100 : 0
                  const alertClass = getAlertClass(p.saldo, p.presupuesto_asignado)
                  return (
                    <tr key={`${p.tienda_id}-${p.mes}`} className={`cursor-pointer transition-colors ${alertClass}`} onDoubleClick={() => handleRowDoubleClick(p)} title="Doble clic para ver detalle">
                      <td className="font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.unidad_negocio?.includes('Dairy') ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {p.unidad_negocio?.includes('Dairy') ? 'DQ' : 'KFC'}
                          </span>
                          {p.tienda}
                        </div>
                      </td>
                      <td className="text-center text-slate-500">{MESES[p.mes - 1]}</td>
                      <td className="text-right font-bold text-slate-700">{formatMoney(p.presupuesto_asignado)}</td>
                      <td className="text-right font-bold text-orange-600">{formatMoney(p.amortizado)}</td>
                      <td className="text-right font-bold text-red-600">{formatMoney(p.gasto_real)}</td>
                      <td className={`text-right font-bold ${p.saldo < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {formatMoney(p.saldo)}
                      </td>
                      <td className="text-center">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-1.5 rounded-full ${pct > 100 ? 'bg-red-500' : pct > 90 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className="text-xs font-medium text-slate-500">{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CON PORTAL - Renderizado fuera del árbol DOM normal */}
      {selectedTienda && createPortal(
        <TiendaModal 
          tienda={selectedTienda} 
          gastos={detalleGastos} 
          loading={loadingDetalle} 
          onClose={() => setSelectedTienda(null)} 
        />,
        document.body
      )}
    </div>
  )
}
