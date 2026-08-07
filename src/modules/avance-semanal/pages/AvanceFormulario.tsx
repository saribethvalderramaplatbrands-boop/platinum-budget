import { useState, useEffect, useMemo, useRef } from 'react'
import { Save, FileSpreadsheet, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { getTiendasPorGerente, GERENTES } from '../data/tiendas'
import { useAvanceSemanal } from '../hooks/useAvanceSemanal'
import { getSemanasMartesLunes, getSemanaActualMartesLunes } from '../hooks/useSemanaMartesLunes'
import TablaTiendas from '../components/TablaTiendas'
import type { DatosTienda } from '../types'

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
  const anioActual = new Date().getFullYear()
  const semanasDisponibles = useMemo(() => getSemanasMartesLunes(anioActual), [anioActual])
  const semanaInicial = useMemo(() => getSemanaActualMartesLunes(), [])

  const [semanaIndex, setSemanaIndex] = useState(() => {
    if (semanaInicial) {
      const idx = semanasDisponibles.findIndex(s => s.value === semanaInicial.value)
      return idx >= 0 ? idx : 0
    }
    return 0
  })

  const semana = semanasDisponibles[semanaIndex]
  const [gerenteSeleccionado, setGerenteSeleccionado] = useState(GERENTE_ACTUAL)
  const [datos, setDatos] = useState<DatosTienda[]>([])
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [mostrarToast, setMostrarToast] = useState(false)

  // Usamos useRef para evitar re-renders infinitos al cargar datos
  const datosInicializados = useRef(false)

  const tiendas = useMemo(() => getTiendasPorGerente(gerenteSeleccionado), [gerenteSeleccionado])

  const {
    cargando,
    guardando,
    error,
    guardarRegistros,
    cargarDatosGuardados,
  } = useAvanceSemanal(semana?.value || '', gerenteSeleccionado, tiendas)

  // Cargar datos una sola vez cuando cambia la semana o el gerente
  useEffect(() => {
    datosInicializados.current = false
  }, [semana?.value, gerenteSeleccionado])

  useEffect(() => {
    if (tiendas.length > 0 && !datosInicializados.current) {
      const guardados = cargarDatosGuardados()
      setDatos(guardados.length > 0 ? guardados : tiendas.map(() => ({ ...EMPTY_DATOS })))
      datosInicializados.current = true
    }
  }, [tiendas, cargarDatosGuardados])

  const handleGuardar = async () => {
    if (!semana) {
      setMensaje({ tipo: 'error', texto: 'Selecciona una semana' })
      return
    }
    const ok = await guardarRegistros(datos)
    if (ok) {
      setMensaje({ tipo: 'ok', texto: 'Guardado correctamente' })
      setMostrarToast(true)
      setTimeout(() => setMostrarToast(false), 3000)
    } else {
      setMensaje({ tipo: 'error', texto: error || 'Error al guardar' })
    }
  }

  const handleExportar = () => {
    alert('Exportar a Excel (próximamente)')
  }

  const updateDato = (tiendaIndex: number, campo: keyof DatosTienda, valor: number) => {
    setDatos(prev => {
      const next = [...prev]
      next[tiendaIndex] = { ...next[tiendaIndex], [campo]: valor }
      return next
    })
  }

  useEffect(() => {
    setMensaje(null)
  }, [semana])

  const semanaAnterior = () => {
    if (semanaIndex > 0) setSemanaIndex(semanaIndex - 1)
  }

  const semanaSiguiente = () => {
    if (semanaIndex < semanasDisponibles.length - 1) setSemanaIndex(semanaIndex + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast flotante iOS */}
      {mostrarToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-gray-900/90 backdrop-blur-xl text-white px-6 py-3 rounded-full shadow-2xl text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Guardado correctamente
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-5">

        {/* HEADER iOS */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-5 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            {/* Izquierda: Logo + Título */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-lg overflow-hidden">
                  <img src="/kfc-logo.png" alt="KFC" className="h-10 w-auto object-contain" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Avance Semanal</h1>
                <p className="text-sm text-gray-500">Reporte operativo KFC — {gerenteSeleccionado}</p>
              </div>
            </div>

            {/* Centro: Selector de semana estilo iOS */}
            <div className="flex items-center gap-3">
              <button 
                onClick={semanaAnterior}
                disabled={semanaIndex === 0}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center transition-all active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>

              <div className="bg-gray-100/80 rounded-2xl px-5 py-3 min-w-[320px] text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-0.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Período de la semana</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{semana?.label || 'Selecciona semana'}</p>
              </div>

              <button 
                onClick={semanaSiguiente}
                disabled={semanaIndex === semanasDisponibles.length - 1}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center transition-all active:scale-95"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Derecha: Acciones */}
            <div className="flex items-center gap-2.5">
              <select
                value={gerenteSeleccionado}
                onChange={(e) => setGerenteSeleccionado(e.target.value)}
                className="px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 border-0 outline-none focus:ring-2 focus:ring-red-500/30 cursor-pointer"
              >
                {GERENTES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>

              <button
                onClick={handleExportar}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Mensaje de error */}
        {mensaje?.tipo === 'error' && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-red-700 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {mensaje.texto}
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
    </div>
  )
}
