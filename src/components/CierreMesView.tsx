import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Upload, FileSpreadsheet, Check, AlertCircle, Download, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

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

export default function CierreMesView() {
  const [año, setAño] = useState(2026)
  const [mes, setMes] = useState(6) // Junio por defecto
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

  // Cargar catálogos al montar
  useEffect(() => {
    fetchCatalogos()
  }, [])

  // Cargar gastos actuales cuando cambia año/mes
  useEffect(() => {
    fetchGastosActuales()
  }, [año, mes])

  const fetchCatalogos = async () => {
    const { data: tiendasData } = await supabase.from('tiendas').select('*')
    const { data: provData } = await supabase.from('proveedores').select('*')

    if (tiendasData) setTiendas(tiendasData.map((t: any) => ({
      id: t.id,
      codigo: t.codigo,
      nombre: t.nombre,
      unidad_negocio: t.unidad_negocio || '',
      gerente_area: t.gerente_area || '',
      gerente_regional: t.gerente_regional || '',
    })))

    if (provData) setProveedores(provData.map((p: any) => ({
      id: p.id,
      nombre: p.nombre || '',
      clasificacion: p.clasificacion || 'N/A',
    })))
  }

  const fetchGastosActuales = async () => {
    const periodo = MESES[mes - 1]
    const ultimoDia = new Date(año, mes, 0).getDate()
    const { data } = await supabase
      .from('gastos_diarios')
      .select(`
        *,
        tiendas:tienda_id(codigo, nombre)
      `)
      .eq('periodo', periodo)
      .gte('fecha', `${año}-${String(mes).padStart(2, '0')}-01`)
      .lte('fecha', `${año}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`)

    if (data) {
      const gastos: GastoDiario[] = data.map((g: any) => ({
        id: g.id,
        fecha: g.fecha,
        periodo: g.periodo,
        orden_compra: g.orden_compra,
        factura: g.factura,
        descripcion: g.descripcion,
        clasificacion: g.clasificacion,
        monto: g.monto,
        tienda_id: g.tienda_id,
        tienda_nombre: g.tiendas?.nombre || '',
        unidad_negocio: g.unidad_negocio || '',
        gerente_area: g.gerente_area || '',
        gerente_regional: g.gerente_regional || '',
        estatus: g.estatus,
        es_cierre: g.es_cierre,
        created_at: g.created_at,
      }))
      setGastosActuales(gastos)
    }
  }

  const getClasificacion = (proveedorNombre: string, clasificacionExcel: string): string => {
    // Regla 1: Usar clasificación del Excel si viene llena
    const excelClasif = (clasificacionExcel || '').trim()
    if (excelClasif && excelClasif !== '') return excelClasif

    // Regla 2: Buscar en catálogo de proveedores
    const provUpper = (proveedorNombre || '').toUpperCase().trim()
    const proveedorMatch = proveedores.find(p => {
      const pUpper = p.nombre.toUpperCase().trim()
      return pUpper === provUpper || provUpper.includes(pUpper) || pUpper.includes(provUpper)
    })

    if (proveedorMatch) return proveedorMatch.clasificacion

    // Regla 3: N/A
    return 'N/A'
  }

  const getTiendaInfo = (codigo: number): { tienda_id: string | null, nombre: string, unidad: string, gerenteArea: string, gerenteRegional: string } => {
    const tienda = tiendas.find(t => t.codigo === codigo)
    if (tienda) {
      return {
        tienda_id: tienda.id,
        nombre: tienda.nombre,
        unidad: tienda.unidad_negocio,
        gerenteArea: tienda.gerente_area,
        gerenteRegional: tienda.gerente_regional,
      }
    }
    return { tienda_id: null, nombre: '', unidad: '', gerenteArea: '', gerenteRegional: '' }
  }

  const parseMonto = (valor: any): number => {
    if (typeof valor === 'number') return valor
    if (typeof valor === 'string') {
      // Quitar $, comas, espacios
      const limpio = valor.replace(/[$,\s]/g, '').trim()
      return parseFloat(limpio) || 0
    }
    return 0
  }

  const parseFecha = (valor: any): string => {
    if (!valor) return `${año}-${String(mes).padStart(2, '0')}-01`

    // Si es string tipo "06/01/2026"
    if (typeof valor === 'string') {
      const parts = valor.split('/')
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0')
        const month = parts[1].padStart(2, '0')
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2]
        return `${year}-${month}-${day}`
      }
    }

    // Si es fecha de Excel (número serial)
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

      // La primera fila son encabezados
      const rows = jsonData.slice(1)

      const preview: GastoPreview[] = rows
        .filter(row => row[0] && row[8]) // Debe tener fecha y código de tienda
        .map(row => {
          const codigoTienda = parseInt(row[8]) || 0
          const tiendaInfo = getTiendaInfo(codigoTienda)
          const proveedorNombre = String(row[4] || '')
          const clasificacion = getClasificacion(proveedorNombre, String(row[6] || ''))

          return {
            fecha: parseFecha(row[0]),
            periodo: String(row[1] || MESES[mes - 1]).trim(),
            orden_compra: String(row[2] || '').trim() || 'N/A',
            factura: String(row[3] || '').trim() || 'N/A',
            proveedor: proveedorNombre,
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

      // Calcular estadísticas
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
      Fecha: g.fecha,
      Periodo: g.periodo,
      'Orden de compra': g.orden_compra || 'N/A',
      Factura: g.factura || 'N/A',
      Descripcion: g.descripcion,
      Clasificacion: g.clasificacion,
      Monto: g.monto,
      Codigo: g.tienda_nombre?.split(' ')?.[0] || '',
      Tienda: g.tienda_nombre,
      'Unidad de Negocio': g.unidad_negocio,
      'Gerente de Area': g.gerente_area,
      'Gerente Regional': g.gerente_regional,
      Estatus: g.estatus,
      'Es Cierre': g.es_cierre ? 'Si' : 'No',
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

      // 1. Calcular último día del mes correctamente
      const ultimoDia = new Date(año, mes, 0).getDate() // mes es 1-based, día 0 = último día del mes anterior
      const fechaInicio = `${año}-${String(mes).padStart(2, '0')}-01`
      const fechaFin = `${año}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`

      // 2. Borrar gastos diarios del mes (todos, sean cierre o no)
      const { error: deleteError } = await supabase
        .from('gastos_diarios')
        .delete()
        .eq('periodo', periodo)
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)

      if (deleteError) throw deleteError

      // 2. Insertar nuevos registros del cierre
      const registrosInsertar = previewData
        .filter(p => p.tienda_id !== null)
        .map(p => ({
          fecha: p.fecha,
          periodo: p.periodo,
          orden_compra: p.orden_compra === 'N/A' ? null : p.orden_compra,
          factura: p.factura === 'N/A' ? null : p.factura,
          descripcion: p.descripcion,
          clasificacion: p.clasificacion,
          monto: p.monto,
          tienda_id: p.tienda_id,
          unidad_negocio: p.unidad_negocio,
          gerente_area: p.gerente_area,
          gerente_regional: p.gerente_regional,
          estatus: 'Completado',
          es_cierre: true,
        }))

      if (registrosInsertar.length === 0) {
        throw new Error('No hay registros válidos para insertar. Verifica que los códigos de tienda existan.')
      }

      // Insertar en batches de 100 para no saturar
      const batchSize = 100
      for (let i = 0; i < registrosInsertar.length; i += batchSize) {
        const batch = registrosInsertar.slice(i, i + batchSize)
        const { error: insertError } = await supabase
          .from('gastos_diarios')
          .insert(batch)

        if (insertError) throw insertError
      }

      // 3. Refrescar datos
      await fetchGastosActuales()
      setPreviewData([])
      setShowPreview(false)

      setMessage({ 
        type: 'success', 
        text: `¡Cierre completado! ${registrosInsertar.length} registros insertados. Los gastos diarios del mes fueron reemplazados.` 
      })
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error en cierre: ' + err.message })
    } finally {
      setConfirmando(false)
    }
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Cierre de Mes</h2>

      {/* Mensajes */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          message.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : 
           message.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
           <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Selector de período */}
      <div className="card">
        <h3 className="font-bold mb-4">Período de Cierre</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              value={mes}
              onChange={e => setMes(parseInt(e.target.value))}
              className="input-field"
            >
              {MESES.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Info de gastos actuales */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Gastos diarios actuales en <span className="font-bold">{MESES[mes-1]} {año}</span>:
              </p>
              <p className="text-2xl font-bold text-primary-600">
                {gastosActuales.length} registros
              </p>
              <p className="text-sm text-gray-500">
                Total: {formatMoney(gastosActuales.reduce((sum, g) => sum + g.monto, 0))}
              </p>
            </div>
            <button
              onClick={downloadBackup}
              disabled={gastosActuales.length === 0}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Descargar Backup
            </button>
          </div>
        </div>
      </div>

      {/* Subida de archivo */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <FileSpreadsheet className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-bold">Subir archivo de Cierre Contable</h3>
            <p className="text-sm text-gray-500">
              Archivo Excel con los gastos oficiales de contabilidad para {MESES[mes-1]} {año}
            </p>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="cierre-file-upload"
          />
          <label htmlFor="cierre-file-upload" className="cursor-pointer">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Haz clic para seleccionar archivo</p>
            <p className="text-sm text-gray-400 mt-1">Formato: Excel (.xlsx, .xls)</p>
          </label>
        </div>

        {uploading && (
          <p className="text-center mt-4 text-primary-600">Procesando archivo...</p>
        )}
      </div>

      {/* Previsualización */}
      {showPreview && previewData.length > 0 && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Previsualización del Cierre</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Resumen de estadísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary-600">{resumenStats.totalRegistros}</p>
              <p className="text-xs text-gray-500">Registros</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{resumenStats.cajaChica}</p>
              <p className="text-xs text-gray-500">Caja Chica</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{resumenStats.repuestos}</p>
              <p className="text-xs text-gray-500">Rep. Bodega</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-orange-600">{resumenStats.otros}</p>
              <p className="text-xs text-gray-500">Otros</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-600">{resumenStats.na}</p>
              <p className="text-xs text-gray-500">N/A</p>
            </div>
          </div>

          <div className="bg-primary-50 p-3 rounded-lg">
            <p className="text-sm text-primary-700">
              <span className="font-bold">Total monto:</span> {formatMoney(resumenStats.totalMonto)}
            </p>
          </div>

          {/* Tabla de previsualización */}
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-200">
                  <th className="text-left px-2 py-2">Fecha</th>
                  <th className="text-left px-2 py-2">Tienda</th>
                  <th className="text-left px-2 py-2">Proveedor</th>
                  <th className="text-left px-2 py-2">Descripción</th>
                  <th className="text-left px-2 py-2">Clasificación</th>
                  <th className="text-right px-2 py-2">Monto</th>
                  <th className="text-center px-2 py-2">OC</th>
                  <th className="text-center px-2 py-2">Fact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {previewData.map((g, idx) => (
                  <tr key={idx} className={g.tienda_id ? '' : 'bg-red-50'}>
                    <td className="px-2 py-2 whitespace-nowrap">{g.fecha}</td>
                    <td className="px-2 py-2">
                      <div className="font-medium">{g.tienda_nombre}</div>
                      <div className="text-xs text-gray-500">{g.codigo_tienda}</div>
                    </td>
                    <td className="px-2 py-2 max-w-xs truncate" title={g.proveedor}>{g.proveedor}</td>
                    <td className="px-2 py-2 max-w-xs truncate" title={g.descripcion}>{g.descripcion}</td>
                    <td className="px-2 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        g.clasificacion === 'Caja Chica' ? 'bg-green-100 text-green-700' :
                        g.clasificacion === 'Repuestos de Bodega' ? 'bg-blue-100 text-blue-700' :
                        g.clasificacion === 'N/A' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {g.clasificacion}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right font-medium">{formatMoney(g.monto)}</td>
                    <td className="px-2 py-2 text-center text-xs">{g.orden_compra}</td>
                    <td className="px-2 py-2 text-center text-xs">{g.factura}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alertas */}
          {previewData.some(p => p.tienda_id === null) && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Algunos registros no tienen tienda válida (código no encontrado). Estos no se insertarán.
            </div>
          )}

          {/* Botón de confirmar */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={confirmarCierre}
              disabled={confirmando || previewData.filter(p => p.tienda_id !== null).length === 0}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {confirmando ? 'Procesando...' : (
                <>
                  <Check className="w-4 h-4" />
                  Confirmar Cierre de Mes
                </>
              )}
            </button>
            <button
              onClick={() => { setPreviewData([]); setShowPreview(false); }}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <p className="text-sm text-gray-500">
              Se borrarán {gastosActuales.length} registros actuales y se insertarán {previewData.filter(p => p.tienda_id !== null).length} del cierre
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
