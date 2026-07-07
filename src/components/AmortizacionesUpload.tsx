import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, Check, AlertCircle, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAmortizaciones } from '../hooks/useSupabase'

// @ts-ignore
import * as XLSX from 'xlsx'

export default function AmortizacionesUpload() {
  const { amortizaciones, refetch } = useAmortizaciones()
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
        setMessage({ type: 'warning', text: 'No se encontraron registros válidos en el archivo.' })
        setUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      // Detectar el periodo del archivo (toma el primero, asume que todos son del mismo mes)
      const periodo = amortizacionesData[0].periodo

      // 1. CONTAR cuántas amortizaciones existen de este periodo
      const { data: existentes, error: countError } = await supabase
        .from('amortizaciones')
        .select('id')
        .eq('periodo', periodo)

      if (countError) throw countError

      const cantidadExistentes = existentes?.length || 0

      // 2. BORRAR todas las amortizaciones de ese periodo
      if (cantidadExistentes > 0) {
        const { error: deleteError } = await supabase
          .from('amortizaciones')
          .delete()
          .eq('periodo', periodo)

        if (deleteError) throw deleteError
      }

      // 3. INSERTAR las nuevas amortizaciones
      const { error: insertError } = await supabase
        .from('amortizaciones')
        .insert(amortizacionesData)

      if (insertError) throw insertError

      // 4. Refrescar datos
      await refetch()

      setMessage({
        type: 'success',
        text: cantidadExistentes > 0
          ? `¡${amortizacionesData.length} amortizaciones subidas! Se reemplazaron ${cantidadExistentes} registros anteriores de ${periodo}.`
          : `¡${amortizacionesData.length} amortizaciones subidas exitosamente para ${periodo}!`
      })
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error: ' + err.message })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
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
      <h2 className="text-2xl font-bold">Amortizaciones</h2>

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

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <FileSpreadsheet className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-bold">Subir archivo Excel</h3>
            <p className="text-sm text-gray-500">Sube la hoja de amortizaciones mensual</p>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Haz clic para seleccionar archivo</p>
            <p className="text-sm text-gray-400 mt-1">Formato: Excel (.xlsx, .xls)</p>
          </label>
        </div>

        {uploading && (
          <p className="text-center mt-4 text-primary-600">Procesando...</p>
        )}
      </div>

      {amortizaciones.length > 0 && (
        <div className="card overflow-x-auto">
          <h3 className="font-bold mb-4">Amortizaciones Registradas</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-3 py-2">Código</th>
                <th className="text-left px-3 py-2">Tienda</th>
                <th className="text-left px-3 py-2">Descripción</th>
                <th className="text-right px-3 py-2">Monto</th>
                <th className="text-center px-3 py-2">Periodo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {amortizaciones.map(a => (
                <tr key={a.id}>
                  <td className="px-3 py-2 font-medium">{a.codigo_tienda}</td>
                  <td className="px-3 py-2">{a.tienda_nombre}</td>
                  <td className="px-3 py-2 max-w-md truncate" title={a.descripcion}>{a.descripcion}</td>
                  <td className="px-3 py-2 text-right">{formatMoney(a.monto)}</td>
                  <td className="px-3 py-2 text-center">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100">{a.periodo}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
