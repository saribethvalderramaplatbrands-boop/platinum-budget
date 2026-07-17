import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, Check, AlertCircle, Receipt } from 'lucide-react'
import { useAmortizaciones } from '../hooks/useSupabase'
import { supabase } from '../lib/supabase'

// @ts-ignore
import * as XLSX from 'xlsx'

const formatMoney = (amount: number) => {
  return '$' + (amount || 0).toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function AmortizacionesUpload() {
  const { amortizaciones, uploadAmortizaciones, refetch } = useAmortizaciones()
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage(null)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

      const rows = jsonData.slice(1)

      const amortizacionesData = rows
        .filter(row => row[0] && row[1])
        .map(row => ({
          codigo_tienda: parseInt(row[0]) || 0,
          tienda_nombre: String(row[1] || ''),
          descripcion: String(row[2] || ''),
          monto: parseFloat(row[3]) || 0,
          periodo: String(row[4] || 'Junio').trim(),
        }))

      if (amortizacionesData.length === 0) {
        setMessage({ type: 'error', text: 'No se encontraron registros válidos en el archivo.' })
        setUploading(false)
        return
      }

      const periodoDetectado = amortizacionesData[0]?.periodo || 'Junio'

      // Verificar si ya existen amortizaciones para este periodo
      const { count, error: countError } = await supabase
        .from('amortizaciones')
        .select('*', { count: 'exact', head: true })
        .eq('periodo', periodoDetectado)

      if (countError) throw countError

      // Si ya existen, borrarlas primero (igual que Cierre de Mes)
      if (count && count > 0) {
        const { error: deleteError } = await supabase
          .from('amortizaciones')
          .delete()
          .eq('periodo', periodoDetectado)

        if (deleteError) throw deleteError
      }

      // Insertar las nuevas
      const error = await uploadAmortizaciones(amortizacionesData)

      if (error) {
        setMessage({ type: 'error', text: 'Error al subir: ' + error.message })
      } else {
        setMessage({ 
          type: 'success', 
          text: `¡${amortizacionesData.length} amortizaciones subidas para ${periodoDetectado}!${count && count > 0 ? ` (${count} anteriores reemplazadas)` : ''}` 
        })
        refetch()
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error procesando archivo: ' + err.message })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Amortizaciones</h2>
        <p className="text-sm text-slate-500 mt-1">Sube y gestiona las amortizaciones mensuales</p>
      </div>

      <div className="card-solid">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Subir archivo Excel</h3>
            <p className="text-sm text-slate-500">Sube la hoja de amortizaciones mensual</p>
          </div>
        </div>

        <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer block">
            <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">Haz clic para seleccionar archivo</p>
            <p className="text-sm text-slate-400 mt-1">Formato: Excel (.xlsx, .xls)</p>
          </label>
        </div>

        {uploading && <p className="text-center mt-4 text-blue-600 font-medium">Procesando...</p>}

        {message && (
          <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : message.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}
      </div>

      {amortizaciones.length > 0 && (
        <div className="card-solid overflow-hidden">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-slate-400" />
            Amortizaciones Registradas
          </h3>
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Tienda</th>
                  <th>Descripción</th>
                  <th className="text-right">Monto</th>
                  <th className="text-center">Periodo</th>
                </tr>
              </thead>
              <tbody>
                {amortizaciones.map(a => (
                  <tr key={a.id}>
                    <td className="font-bold text-slate-700">{a.codigo_tienda}</td>
                    <td className="text-slate-700">{a.tienda_nombre}</td>
                    <td className="max-w-md truncate text-slate-600" title={a.descripcion}>{a.descripcion}</td>
                    <td className="text-right font-bold text-slate-800">{formatMoney(a.monto)}</td>
                    <td className="text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{a.periodo}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
