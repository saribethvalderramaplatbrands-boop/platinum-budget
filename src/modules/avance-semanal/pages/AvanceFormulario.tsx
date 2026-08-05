import { useState, useEffect } from 'react'
import { Save, FileSpreadsheet, Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import { getTiendasPorGerente, GERENTES } from '../data/tiendas'
import { useAvanceSemanal } from '../hooks/useAvanceSemanal'
import TablaTiendas from '../components/TablaTiendas'
import type { DatosTienda } from '../types'

// TODO: En el futuro, esto vendrá del login/email del usuario
const GERENTE_ACTUAL = 'IDA APARICIO'

const EMPTY_DATOS: DatosTienda = {
  ventaNeta: 0, presupuestoVentas: 0, ventas2025: 0,
  transaccionesActuales: 0, presupuestoTransacciones: 0, transacciones2025: 0,
  ticketPromedio: 0, presupuestoTicket: 0,
  kioskos: 0, kioskoTrx: 0, localLlevar: 0, localLlevarTrx: 0,
  autoservicio: 0, autoservicioTrx: 0, domicilio: 0, domicilioTrx: 0,
  dayPartApertura: 0, dayPart12a3: 0, dayPart3a6: 0, dayPart6a9: 0, dayPart9aCierre: 0,
  borrantes: 0, notasCredito: 0, notasCreditoCantidad: 0,
  descuentosEmpleados: 0, descuentosJubilados: 0,
  personalEntrenamiento: 0, theVault: 0,
  manpowerAprobado: 0, empleadosActivos: 0, empleadosVacaciones: 0, gerentesActivos: 0,
  costoManoObra: 0, horasColaboradores: 0, horasInasistencia: 0, horasExtras: 0,
  costoSemanal: 0, costoTeorico: 0, merma: 0, gap: 0,
  tiempoAutoSegundos: 0, tiempoAutoDia: 0, dp1: 0, dp2: 0, dp3: 0, dp4: 0, dp5: 0,
  roccL1: 0, roccL3: 0,
  penalizacionesPct: 0, montoPenalizado: 0, tiempoCocina: 0,
}

export default function AvanceFormulario() {
  const [semana, setSemana] = useState('')
  const [gerenteSeleccionado, setGerenteSeleccionado] = useState(GERENTE_ACTUAL)
  const [datos, setDatos] = useState<DatosTienda[]>([])
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const tiendas = getTiendasPorGerente(gerenteSeleccionado)

  const {
    cargando,
    guardando,
    error,
    guardarRegistros,
    cargarDatosGuardados,
  } = useAvanceSemanal(semana, gerenteSeleccionado, tiendas)

  // Inicializar datos cuando cambian tiendas o se cargan registros
  useEffect(() => {
    if (tiendas.length > 0) {
      const guardados = cargarDatosGuardados()
      setDatos(guardados)
    }
  }, [tiendas, cargarDatosGuardados])

  const handleGuardar = async () => {
    if (!semana) {
      setMensaje({ tipo: 'error', texto: 'Selecciona una semana antes de guardar' })
      return
    }

    const ok = await guardarRegistros(datos)
    if (ok) {
      setMensaje({ tipo: 'ok', texto: 'Datos guardados correctamente en Supabase' })
      setTimeout(() => setMensaje(null), 4000)
    } else {
      setMensaje({ tipo: 'error', texto: error || 'Error al guardar' })
    }
  }

  const handleExportar = () => {
    alert('Exportar a Excel (próximamente en Fase 4)')
  }

  const updateDato = (tiendaIndex: number, campo: keyof DatosTienda, valor: number) => {
    setDatos(prev => {
      const next = [...prev]
      next[tiendaIndex] = { ...next[tiendaIndex], [campo]: valor }
      return next
    })
  }

  // Cuando cambia la semana, limpiar mensaje
  useEffect(() => {
    setMensaje(null)
  }, [semana])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Formulario Semanal</h1>
          <p className="text-sm text-gray-500">
            Ingresa los datos de todas tus tiendas para la semana seleccionada
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
            disabled={guardando || !semana}
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
      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-red-800">
          <span className="font-bold">Gerente:</span> {gerenteSeleccionado} &nbsp;|&nbsp;
          <span className="font-bold"> Tiendas:</span> {tiendas.length} &nbsp;|&nbsp;
          <span className="font-bold"> Regional:</span> {tiendas[0]?.regional || ''}
        </p>
        {cargando && (
          <span className="text-xs text-red-600 animate-pulse">Cargando datos...</span>
        )}
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
          mensaje.tipo === 'ok' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {mensaje.tipo === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {mensaje.texto}
        </div>
      )}

      {/* Alerta si no hay semana */}
      {!semana && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Selecciona una semana arriba para empezar a ingresar datos. Los datos se guardan por semana.
        </div>
      )}

      {/* Tabla */}
      {tiendas.length > 0 && (
        <TablaTiendas
          gerente={gerenteSeleccionado}
          tiendas={tiendas}
          datos={datos}
          onUpdateDato={updateDato}
        />
      )}
    </div>
  )
}
