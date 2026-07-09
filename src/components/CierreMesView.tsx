import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Upload, FileSpreadsheet, Check, AlertCircle, Download, X, Calendar } from 'lucide-react'

// @ts-ignore
import * as XLSX from 'xlsx'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

interface TiendaInfo {
  id: string
  codigo: number
  nombre: string
  unidad_negocio: string
  gerente_area: string
  gerente_regional: string
}

interface ProveedorInfo {
  id: string
  nombre: string
  clasificacion: string
}

interface GastoPreview {
  fecha: string
  periodo: string
  orden_compra: string
  factura: string
  proveedor: string
  proveedor_id: string | null
  descripcion: string
  clasificacion: string
  monto: number
  codigo_tienda: number
  tienda_nombre: string
  unidad_negocio: string
  gerente_area: string
  gerente_regional: string
  tienda_id: string | null
}

interface GastoDiario {
  id: string
  fecha: string
  periodo: string
  orden_compra: string | null
  factura: string | null
  descripcion: string
  clasificacion: string
  monto: number
  tienda_id: string
  tienda_nombre: string
  unidad_negocio: string
  gerente_area: string
  gerente_regional: string
  estatus: string
  es_cierre: boolean
  created_at: string
}

const formatMoney = (amount: number) => {
  return '$' + (amount || 0).toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function CierreMesView() {
  const [año, setAño] = useState(2026)
  const [mes, setMes] = useState(6)
  const [uploading, setUploading] = useState(false)
  const [previewData, setPreviewData] = useState<GastoPreview[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)
  const [tiendas, setTiendas] = useState<TiendaInfo[]>([])
  const [proveedores, setProveedores] = useState<ProveedorInfo[]>([])
  const [gastosActuales, setGastosActuales] = useState<GastoDiario[]>([])
  const [confirmando, setConfirmando] = useState(false)
  const [resumenStats, setResumenStats] = useState({
    totalRegistros: 0,
    totalMonto: 0,
    cajaChica: 0,
    repuestos: 0,
    otros: 0,
    na: 0,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchCatalogos() }, [])
  useEffect(() => { fetchGastosActuales() }, [año, mes])

  const fetchCatalogos = async () => {
    const { data: tiendasData } = await supabase.from('tiendas').select('*')
    const { data: provData } = await supabase.from('proveedores').select('*')

    if (tiendasData) setTiendas(tiendasData.map((t: any) => ({
      id: t.id, codigo: t.codigo, nombre: t.nombre,
      unidad_negocio: t.unidad_negocio || '', gerente_area: t.gerente_area || '', gerente_regional: t.gerente_regional || '',
    })))

    if (provData) setProveedores(provData.map((p: any) => ({
      id: p.id, nombre: p.nombre || '', clasificacion: p.clasificacion || 'N/A',
    })))
  }

  const fetchGastosActuales = async () => {
    const periodo = MESES[mes - 1]
    const ultimoDia = new Date(año, mes, 0).getDate()
    const { data } = await supabase
      .from('gastos_diarios')
      .select(`*, tiendas:tienda_id(codigo, nombre)`)
      .eq('periodo', periodo)
      .gte('fecha', `${año}-${String(mes).padStart(2, '0')}-01`)
      .lte('fecha', `${año}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`)

    if (data) {
      setGastosActuales(data.map((g: any) => ({
        id: g.id, fecha: g.fecha, periodo: g.periodo, orden_compra: g.orden_compra,
        factura: g.factura, descripcion: g.descripcion, clasificacion: g.clasificacion,
        monto: g.monto, tienda_id: g.tienda_id, tienda_nombre: g.tiendas?.nombre || '',
        unidad_negocio: g.unidad_negocio || '', gerente_area: g.gerente_area || '',
        gerente_regional: g.gerente_regional || '', estatus: g.estatus, es_cierre: g.es_cierre,
        created_at: g.created_at,
      })))
    }
  }

  const getClasificacion = (proveedorNombre: string, clasificacionExcel: string): string => {
    const excelClasif = (clasificacionExcel || '').trim()
    if (excelClasif && excelClasif !== '') return excelClasif
    const provUpper = (proveedorNombre || '').toUpperCase().trim()
    const proveedorMatch = proveedores.find(p => {
      const pUpper = p.nombre.toUpperCase().trim()
      return pUpper.includes(provUpper) || provUpper.includes(pUpper)
    })
    if (proveedorMatch) return proveedorMatch.clasificacion
    return 'N/A'
  }

  const getProveedorId = (proveedorNombre: string): string | null => {
    if (!proveedorNombre) return null
    const provUpper = proveedorNombre.toUpperCase().trim()
    const proveedorMatch = proveedores.find(p => {
      const pUpper = p.nombre.toUpperCase().trim()
      return pUpper.includes(provUpper) || provUpper.includes(pUpper)
    })
    return proveedorMatch ? proveedorMatch.id : null
  }

  const getTiendaInfo = (codigo: number) => {
    const tienda = tiendas.find(t => t.codigo === codigo)
    if (tienda) return { tienda_id: tienda.id, nombre: tienda.nombre, unidad: tienda.unidad_negocio, gerenteArea: tienda.gerente_area, gerenteRegional: tienda.gerente_regional }
    return { tienda_id: null, nombre: '', unidad: '', gerenteArea: '', gerenteRegional: '' }
  }

  const parseMonto = (valor: any): number => {
    if (typeof valor === 'number') return valor
    if (typeof valor === 'string') {
      const limpio = valor.replace(/[$,\s]/g, '').trim()
      return parseFloat(limpio) || 0
    }
    return 0
  }

  const parseFecha = (valor: any): string => {
    if (!valor) return `${año}-${String(mes).padStart(2, '0')}-01`
    if (typeof valor === 'string') {
      const parts = valor.split('/')
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0')
        const month = parts[1].padStart(2, '0')
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2]
        return `${year}-${month}-${day}`
      }
    }
    if (typeof valor === 'number') {
      const excelEpoch = new Date(1899, 11, 30)
      const fecha = new Date(excelEpoch.getTime() + valor * 86400000)
      return fecha.toISOString().split('T')[0]
    }
    return `${año}-${String(mes).padStart(2, '0')}-01`
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage(null)
    setPreviewData([])

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

      const rows = jsonData.slice(1)

      const preview: GastoPreview[] = rows
        .filter(row => row[0] && row[8])
        .map(row => {
          const codigoTienda = parseInt(row[8]) || 0
          const tiendaInfo = getTiendaInfo(codigoTienda)
          const proveedorNombre = String(row[4] || '')
          const clasificacion = getClasificacion(proveedorNombre, String(row[6] || ''))
          const proveedorId = getProveedorId(proveedorNombre)

          return {
            fecha: parseFecha(row[0]),
            periodo: (String(row[1] || MESES[mes - 1]).trim()).toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
            orden_compra: String(row[2] || '').trim() || 'N/A',
            factura: String(row[3] || '').trim() || 'N/A',
            proveedor: proveedorNombre,
            proveedor_id: proveedorId,
            descripcion: String(row[5] || '').trim(),
            clasificacion: clasificacion,
            monto: parseMonto(row[7]),
            codigo_tienda: codigoTienda,
            tienda_nombre: tiendaInfo.nombre || String(row[9] || '').trim(),
            unidad_negocio: tiendaInfo.unidad || String(row[10] || '').trim(),
            gerente_area: tiendaInfo.gerenteArea || String(row[11] || '').trim(),
            gerente_regional: tiendaInfo.gerenteRegional || String(row[12] || '').trim(),
            tienda_id: tiendaInfo.tienda_id,
          }
        })

      const stats = {
        totalRegistros: preview.length,
        totalMonto: preview.reduce((sum, g) => sum + g.monto, 0),
        cajaChica: preview.filter(g => g.clasificacion === 'Caja Chica').length,
        repuestos: preview.filter(g => g.clasificacion === 'Repuestos de Bodega').length,
        otros: preview.filter(g => g.clasificacion !== 'Caja Chica' && g.clasificacion !== 'Repuestos de Bodega' && g.clasificacion !== 'N/A').length,
        na: preview.filter(g => g.clasificacion === 'N/A').length,
      }

      setResumenStats(stats)
      setPreviewData(preview)
      setShowPreview(true)

      if (preview.length === 0) {
        setMessage({ type: 'warning', text: 'No se encontraron registros válidos en el archivo.' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error procesando archivo: ' + err.message })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const downloadBackup = () => {
    if (gastosActuales.length === 0) {
      setMessage({ type: 'warning', text: 'No hay gastos diarios para hacer backup en este período.' })
      return
    }

    const data = gastosActuales.map(g => ({
      Fecha: g.fecha, Periodo: g.periodo, 'Orden de compra': g.orden_compra || 'N/A',
      Factura: g.factura || 'N/A', Descripcion: g.descripcion, Clasificacion: g.clasificacion,
      Monto: g.monto, Codigo: g.tienda_nombre?.split(' ')?.[0] || '', Tienda: g.tienda_nombre,
      'Unidad de Negocio': g.unidad_negocio, 'Gerente de Area': g.gerente_area,
      'Gerente Regional': g.gerente_regional, Estatus: g.estatus, 'Es Cierre': g.es_cierre ? 'Si' : 'No',
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Backup')
    XLSX.writeFile(wb, `backup_gastos_${MESES[mes-1]}_${año}.xlsx`)

    setMessage({ type: 'success', text: `Backup descargado: ${gastosActuales.length} registros` })
  }

  const confirmarCierre = async () => {
    if (previewData.length === 0) return

    setConfirmando(true)
    setMessage(null)

    try {
      const periodo = MESES[mes - 1]
      const ultimoDia = new Date(año, mes, 0).getDate()
      const fechaInicio = `${año}-${String(mes).padStart(2, '0')}-01`
      const fechaFin = `${año}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`

      const { error: deleteError } = await supabase
        .from('gastos_diarios')
        .delete()
        .eq('periodo', periodo)
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)

      if (deleteError) throw deleteError

      const registrosInsertar = previewData
        .filter(p => p.tienda_id !== null)
        .map(p => ({
          fecha: p.fecha, periodo: p.periodo,
          orden_compra: p.orden_compra === 'N/A' ? null : p.orden_compra,
          factura: p.factura === 'N/A' ? null : p.factura,
          descripcion: p.descripcion, clasificacion: p.clasificacion,
          monto: p.monto, tienda_id: p.tienda_id,
          proveedor_id: p.proveedor_id, estatus: 'Completado', es_cierre: true,
        }))

      if (registrosInsertar.length === 0) {
        throw new Error('No hay registros válidos para insertar. Verifica que los códigos de tienda existan.')
      }

      const batchSize = 100
      for (let i = 0; i < registrosInsertar.length; i += batchSize) {
        const batch = registrosInsertar.slice(i, i + batchSize)
        const { error: insertError } = await supabase.from('gastos_diarios').insert(batch)
        if (insertError) throw insertError
      }

      await fetchGastosActuales()
      setPreviewData([])
      setShowPreview(false)

      setMessage({ type: 'success', text: `¡Cierre completado! ${registrosInsertar.length} registros insertados.` })
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error en cierre: ' + err.message })
    } finally {
      setConfirmando(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Cierre de Mes</h2>
        <p className="text-sm text-slate-500 mt-1">Sube el archivo de contabilidad para reemplazar gastos del mes</p>
      </div>

      {/* Mensajes */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          message.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Selector de período */}
      <div className="card-solid">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          Período de Cierre
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Año</label>
            <input type="number" value={año} onChange={e => setAño(parseInt(e.target.value))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mes</label>
            <select value={mes} onChange={e => setMes(parseInt(e.target.value))} className="input-field">
              {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Info de gastos actuales */}
        <div className="mt-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">
                Gastos diarios actuales en <span className="font-bold text-slate-800">{MESES[mes-1]} {año}</span>:
              </p>
              <p className="text-2xl font-bold text-blue-600">{gastosActuales.length} registros</p>
              <p className="text-sm text-slate-500">Total: {formatMoney(gastosActuales.reduce((sum, g) => sum + g.monto, 0))}</p>
            </div>
            <button onClick={downloadBackup} disabled={gastosActuales.length === 0} className="btn-secondary flex items-center gap-2 disabled:opacity-50">
              <Download className="w-4 h-4" />
              Descargar Backup
            </button>
          </div>
        </div>
      </div>

      {/* Subida de archivo */}
      <div className="card-solid">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Subir archivo de Cierre Contable</h3>
            <p className="text-sm text-slate-500">Archivo Excel con los gastos oficiales de contabilidad para {MESES[mes-1]} {año}</p>
          </div>
        </div>

        <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" id="cierre-file-upload" />
          <label htmlFor="cierre-file-upload" className="cursor-pointer block">
            <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">Haz clic para seleccionar archivo</p>
            <p className="text-sm text-slate-400 mt-1">Formato: Excel (.xlsx, .xls)</p>
          </label>
        </div>

        {uploading && <p className="text-center mt-4 text-blue-600 font-medium">Procesando archivo...</p>}
      </div>

      {/* Previsualización */}
      {showPreview && previewData.length > 0 && (
        <div className="card-solid space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Previsualización del Cierre</h3>
            <button onClick={() => setShowPreview(false)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Resumen de estadísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
              <p className="text-2xl font-bold text-blue-600">{resumenStats.totalRegistros}</p>
              <p className="text-xs text-slate-500 font-medium">Registros</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
              <p className="text-2xl font-bold text-emerald-600">{resumenStats.cajaChica}</p>
              <p className="text-xs text-slate-500 font-medium">Caja Chica</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
              <p className="text-2xl font-bold text-blue-600">{resumenStats.repuestos}</p>
              <p className="text-xs text-slate-500 font-medium">Rep. Bodega</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
              <p className="text-2xl font-bold text-amber-600">{resumenStats.otros}</p>
              <p className="text-xs text-slate-500 font-medium">Otros</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
              <p className="text-2xl font-bold text-red-600">{resumenStats.na}</p>
              <p className="text-xs text-slate-500 font-medium">N/A</p>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-700 font-medium">
              <span className="font-bold">Total monto:</span> {formatMoney(resumenStats.totalMonto)}
            </p>
          </div>

          {/* Tabla de previsualización */}
          <div className="overflow-x-auto max-h-[400px] rounded-xl border border-slate-100">
            <table className="table-modern">
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  <th>Fecha</th>
                  <th>Tienda</th>
                  <th>Proveedor</th>
                  <th>Descripción</th>
                  <th>Clasificación</th>
                  <th className="text-right">Monto</th>
                  <th className="text-center">OC</th>
                  <th className="text-center">Fact</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((g, idx) => (
                  <tr key={idx} className={g.tienda_id ? '' : 'bg-red-50/50'}>
                    <td className="whitespace-nowrap text-slate-600">{g.fecha}</td>
                    <td>
                      <div className="font-medium text-slate-800">{g.tienda_nombre}</div>
                      <div className="text-xs text-slate-400">{g.codigo_tienda}</div>
                    </td>
                    <td className="max-w-xs truncate text-slate-600" title={g.proveedor}>{g.proveedor}</td>
                    <td className="max-w-xs truncate text-slate-600" title={g.descripcion}>{g.descripcion}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        g.clasificacion === 'Caja Chica' ? 'bg-emerald-100 text-emerald-700' :
                        g.clasificacion === 'Repuestos de Bodega' ? 'bg-blue-100 text-blue-700' :
                        g.clasificacion === 'N/A' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {g.clasificacion}
                      </span>
                    </td>
                    <td className="text-right font-bold text-slate-800">{formatMoney(g.monto)}</td>
                    <td className="text-center text-xs text-slate-500">{g.orden_compra}</td>
                    <td className="text-center text-xs text-slate-500">{g.factura}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alertas */}
          {previewData.some(p => p.tienda_id === null) && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Algunos registros no tienen tienda válida. Estos no se insertarán.
            </div>
          )}

          {/* Botón de confirmar */}
          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <button onClick={confirmarCierre} disabled={confirmando || previewData.filter(p => p.tienda_id !== null).length === 0} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {confirmando ? 'Procesando...' : <><Check className="w-4 h-4" />Confirmar Cierre de Mes</>}
            </button>
            <button onClick={() => { setPreviewData([]); setShowPreview(false); }} className="btn-secondary flex items-center gap-2">
              <X className="w-4 h-4" />Cancelar
            </button>
            <p className="text-sm text-slate-500">
              Se borrarán {gastosActuales.length} registros actuales y se insertarán {previewData.filter(p => p.tienda_id !== null).length} del cierre
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
