import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react'
import { useAmortizaciones } from '../hooks/useSupabase'

// @ts-ignore
import * as XLSX from 'xlsx'

export default function AmortizacionesUpload() {
  const { amortizaciones, uploadAmortizaciones, refetch } = useAmortizaciones()
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
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
          periodo: String(row[4] || 'Junio'),
        }))

      const error = await uploadAmortizaciones(amortizacionesData)

      if (error) {
        setMessage({ type: 'error', text: 'Error al subir: ' + error.message })
      } else {
        setMessage({ type: 'success', text: `¡${amortizacionesData.length} amortizaciones subidas exitosamente!` })
        refetch()
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error procesando archivo: ' + err.message })
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

        {message && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
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
