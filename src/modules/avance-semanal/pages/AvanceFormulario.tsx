import { useState } from 'react'
import { Save, FileSpreadsheet, Calendar } from 'lucide-react'
import { getTiendasPorGerente, GERENTES } from '../data/tiendas'
import TablaTiendas from '../components/TablaTiendas'

// TODO: En el futuro, esto vendrá del login/email del usuario
const GERENTE_ACTUAL = 'IDA APARICIO' // Cambia esto para probar otros gerentes

export default function AvanceFormulario() {
  const [semana, setSemana] = useState('')
  const [gerenteSeleccionado, setGerenteSeleccionado] = useState(GERENTE_ACTUAL)
  const [guardando, setGuardando] = useState(false)

  const tiendas = getTiendasPorGerente(gerenteSeleccionado)

  const handleGuardar = async () => {
    setGuardando(true)
    // Aquí irá la lógica de guardado en Supabase
    await new Promise(r => setTimeout(r, 1000))
    setGuardando(false)
    alert('Datos guardados (demo)')
  }

  const handleExportar = () => {
    alert('Exportar a Excel (próximamente)')
  }

  return (
    <div className="space-y-4">
      {/* Header del formulario */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Formulario Semanal</h1>
          <p className="text-sm text-gray-500">
            Ingresa los datos de todas tus tiendas para la semana seleccionada
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de gerente (solo para admin/demo) */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="week"
              value={semana}
              onChange={(e) => setSemana(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <select
            value={gerenteSeleccionado}
            onChange={(e) => setGerenteSeleccionado(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            {GERENTES.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-sm font-medium rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>

          <button
            onClick={handleExportar}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Info del gerente */}
      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        <p className="text-sm text-red-800">
          <span className="font-bold">Gerente:</span> {gerenteSeleccionado} &nbsp;|&nbsp;
          <span className="font-bold"> Tiendas:</span> {tiendas.length} &nbsp;|&nbsp;
          <span className="font-bold"> Regional:</span> {tiendas[0]?.regional || ''}
        </p>
      </div>

      {/* La tabla gigante */}
      <TablaTiendas gerente={gerenteSeleccionado} tiendas={tiendas} />
    </div>
  )
}
