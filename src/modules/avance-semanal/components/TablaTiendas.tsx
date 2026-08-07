import { useCallback } from 'react'
import type { DatosTienda } from '../types'
import type { Tienda } from '../data/tiendas'
import CeldaInput from './CeldaInput'

interface TablaTiendasProps {
  gerente: string
  tiendas: Tienda[]
  datos: DatosTienda[]
  onUpdateDato: (tiendaIndex: number, campo: keyof DatosTienda, valor: number) => void
}

function calcularTotalesFila(tiendasDatos: DatosTienda[], campo: keyof DatosTienda): number {
  if (tiendasDatos.length === 0) return 0
  const camposSuma: (keyof DatosTienda)[] = [
    'ventaNeta', 'presupuestoVentas', 'ventas2025',
    'transaccionesActuales', 'presupuestoTransacciones', 'transacciones2025',
    'kioskos', 'kioskoTrx', 'localLlevar', 'localLlevarTrx',
    'autoservicio', 'autoservicioTrx', 'domicilio', 'domicilioTrx',
    'dayPartApertura', 'dayPart12a3', 'dayPart3a6', 'dayPart6a9', 'dayPart9aCierre',
    'borrantes', 'notasCredito', 'notasCreditoCantidad',
    'descuentosEmpleados', 'descuentosJubilados',
    'personalEntrenamiento',
    'manpowerAprobado', 'empleadosActivos', 'empleadosVacaciones', 'gerentesActivos',
    'costoManoObra', 'horasColaboradores', 'horasInasistencia', 'horasExtras',
    'merma', 'gap',
    'roccL1', 'roccL3',
    'montoPenalizado',
  ]
  if (camposSuma.includes(campo)) {
    return tiendasDatos.reduce((sum, d) => sum + ((d[campo] as number) || 0), 0)
  }
  const camposPromedio: (keyof DatosTienda)[] = [
    'presupuestoTicket', 'ticketPromedio', 'theVault',
    'costoSemanal', 'costoTeorico', 'tiempoAutoSegundos', 'tiempoAutoDia',
    'dp1', 'dp2', 'dp3', 'dp4', 'dp5',
    'penalizacionesPct', 'tiempoCocina',
  ]
  if (camposPromedio.includes(campo)) {
    const suma = tiendasDatos.reduce((sum, d) => sum + ((d[campo] as number) || 0), 0)
    return suma / tiendasDatos.length
  }
  return 0
}

const getColorVariacion = (val: number): string => {
  if (val < -0.05) return 'text-rose-600 font-bold'
  if (val < 0) return 'text-rose-500'
  if (val > 0.05) return 'text-emerald-600 font-bold'
  if (val > 0) return 'text-emerald-500'
  return 'text-gray-400'
}

const esMonto = (campo: string): boolean => {
  const montos = [
    'ventaNeta', 'presupuestoVentas', 'ventas2025',
    'kioskos', 'localLlevar', 'autoservicio', 'domicilio',
    'borrantes', 'notasCredito', 'descuentosEmpleados', 'descuentosJubilados',
    'costoManoObra', 'merma', 'gap', 'montoPenalizado',
    'dayPartApertura', 'dayPart12a3', 'dayPart3a6', 'dayPart6a9', 'dayPart9aCierre',
    'presupuestoTicket',
  ]
  return montos.includes(campo)
}

const formatValor = (campo: string, val: number, digits: number = 2): string => {
  const prefix = esMonto(campo) ? '$' : ''
  return prefix + val.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

// Anchos fijos para cada tipo de columna
const COL_FIRST = 260   // Primera columna (nombres de fila)
const COL_TIENDA = 140  // Cada tienda
const COL_TOTAL = 120   // Columna TOTAL

export default function TablaTiendas({ gerente, tiendas, datos, onUpdateDato }: TablaTiendasProps) {
  const updateDato = useCallback((tiendaIndex: number, campo: keyof DatosTienda, valor: number) => {
    onUpdateDato(tiendaIndex, campo, valor)
  }, [onUpdateDato])

  const n = tiendas.length
  // Ancho mínimo total de la tabla
  const tableMinWidth = COL_FIRST + (n * COL_TIENDA) + COL_TOTAL

  return (
    <div className="rounded-3xl border border-gray-200/60 shadow-[0_8px_40px_rgba(0,0,0,0.06)] bg-white overflow-hidden">
      <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {/* table-layout: fixed fuerza anchos exactos, minWidth fuerza scroll cuando es necesario */}
        <table className="border-collapse" style={{ tableLayout: 'fixed', minWidth: tableMinWidth }}>
          <thead>
            {/* HEADER ROJO KFC */}
            <tr className="bg-gradient-to-r from-red-600 to-red-700 text-white">
              <th 
                className="sticky top-0 left-0 z-50 px-4 py-4 text-sm font-bold text-left border-r border-white/10 bg-gradient-to-r from-red-600 to-red-700 rounded-tl-3xl"
                style={{ width: COL_FIRST, minWidth: COL_FIRST }}
              >
                <span className="opacity-90">GERENTE:</span> <span className="ml-1.5">{gerente}</span>
              </th>
              {tiendas.map(t => (
                <th 
                  key={t.codigo} 
                  className="sticky top-0 z-40 px-2 py-3 text-center border-r border-white/10 bg-gradient-to-r from-red-600 to-red-700 text-xs font-bold leading-tight"
                  style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}
                >
                  {t.nombre.replace('KFC ', '')}
                </th>
              ))}
              <th 
                className="sticky top-0 z-40 px-2 py-3 text-center text-sm font-bold bg-black/10 rounded-tr-3xl"
                style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}
              >
                TOTAL
              </th>
            </tr>
          </thead>

          <tbody>
            {/* ===== VENTAS ===== */}
            <tr className="bg-gradient-to-r from-red-500/10 to-red-600/5 text-red-800 border-y border-red-200/60">
              <td className="sticky left-0 z-20 px-5 py-3 text-base font-bold uppercase tracking-wider" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  Ventas
                </div>
              </td>
              <td colSpan={n + 1}></td>
            </tr>
            {[
              { key: 'ventaNeta' as keyof DatosTienda, label: 'Ventas Neta', bg: 'bg-red-50/30' },
              { key: 'presupuestoVentas' as keyof DatosTienda, label: 'Presupuesto Ventas', bg: 'bg-red-50/30' },
            ].map(({ key, label, bg }) => (
              <tr key={key} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                <td className={`sticky left-0 z-20 px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-200 ${bg}`} style={{ width: COL_FIRST, minWidth: COL_FIRST }}>{label}</td>
                {tiendas.map((_, i) => (
                  <td key={i} className="border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>
                    <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} />
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                  {formatValor(key as string, calcularTotalesFila(datos, key))}
                </td>
              </tr>
            ))}
            <tr className="border-b border-gray-100">
              <td className="sticky left-0 z-20 px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60 border-r border-gray-200" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>Variación vs PPTO</td>
              {tiendas.map((_, i) => {
                const val = (datos[i]?.presupuestoVentas || 0) > 0 ? ((datos[i]?.ventaNeta || 0) / datos[i].presupuestoVentas) - 1 : 0
                return <td key={i} className={`px-4 py-3 text-right text-base border-r border-gray-100 ${getColorVariacion(val)}`} style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>{(val * 100).toFixed(2)}%</td>
              })}
              <td className={`px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 ${getColorVariacion(calcularTotalesFila(datos, 'presupuestoVentas') > 0 ? (calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'presupuestoVentas')) - 1 : 0)}`} style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                {calcularTotalesFila(datos, 'presupuestoVentas') > 0 ? (((calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'presupuestoVentas')) - 1) * 100).toFixed(2) : '0.00'}%
              </td>
            </tr>
            {[
              { key: 'ventas2025' as keyof DatosTienda, label: 'Ventas 2025', bg: 'bg-red-50/30' },
            ].map(({ key, label, bg }) => (
              <tr key={key} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                <td className={`sticky left-0 z-20 px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-200 ${bg}`} style={{ width: COL_FIRST, minWidth: COL_FIRST }}>{label}</td>
                {tiendas.map((_, i) => (
                  <td key={i} className="border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>
                    <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} />
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                  {formatValor(key as string, calcularTotalesFila(datos, key))}
                </td>
              </tr>
            ))}
            <tr className="border-b border-gray-100">
              <td className="sticky left-0 z-20 px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60 border-r border-gray-200" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>Variación 2025 vs 2026</td>
              {tiendas.map((_, i) => {
                const val = (datos[i]?.ventas2025 || 0) > 0 ? ((datos[i]?.ventaNeta || 0) / datos[i].ventas2025) - 1 : 0
                return <td key={i} className={`px-4 py-3 text-right text-base border-r border-gray-100 ${getColorVariacion(val)}`} style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>{(val * 100).toFixed(2)}%</td>
              })}
              <td className={`px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 ${getColorVariacion(calcularTotalesFila(datos, 'ventas2025') > 0 ? (calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'ventas2025')) - 1 : 0)}`} style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                {calcularTotalesFila(datos, 'ventas2025') > 0 ? (((calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'ventas2025')) - 1) * 100).toFixed(2) : '0.00'}%
              </td>
            </tr>

            {/* ===== TRANSACCIONES ===== */}
            <tr className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 text-blue-800 border-y border-blue-200/60">
              <td className="sticky left-0 z-20 px-5 py-3 text-base font-bold uppercase tracking-wider" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  Transacciones
                </div>
              </td>
              <td colSpan={n + 1}></td>
            </tr>
            {[
              { key: 'transaccionesActuales' as keyof DatosTienda, label: 'Transacciones Actuales', bg: 'bg-blue-50/30' },
              { key: 'presupuestoTransacciones' as keyof DatosTienda, label: 'Presupuesto Transacciones', bg: 'bg-blue-50/30' },
            ].map(({ key, label, bg }) => (
              <tr key={key} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                <td className={`sticky left-0 z-20 px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-200 ${bg}`} style={{ width: COL_FIRST, minWidth: COL_FIRST }}>{label}</td>
                {tiendas.map((_, i) => (
                  <td key={i} className="border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>
                    <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} />
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                  {formatValor(key as string, calcularTotalesFila(datos, key), 0)}
                </td>
              </tr>
            ))}
            <tr className="border-b border-gray-100">
              <td className="sticky left-0 z-20 px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60 border-r border-gray-200" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>Variación vs PPTO</td>
              {tiendas.map((_, i) => {
                const val = (datos[i]?.presupuestoTransacciones || 0) > 0 ? ((datos[i]?.transaccionesActuales || 0) / datos[i].presupuestoTransacciones) - 1 : 0
                return <td key={i} className={`px-4 py-3 text-right text-base border-r border-gray-100 ${getColorVariacion(val)}`} style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>{(val * 100).toFixed(2)}%</td>
              })}
              <td className={`px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 ${getColorVariacion(calcularTotalesFila(datos, 'presupuestoTransacciones') > 0 ? (calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'presupuestoTransacciones')) - 1 : 0)}`} style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                {calcularTotalesFila(datos, 'presupuestoTransacciones') > 0 ? (((calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'presupuestoTransacciones')) - 1) * 100).toFixed(2) : '0.00'}%
              </td>
            </tr>
            {[
              { key: 'transacciones2025' as keyof DatosTienda, label: 'Transacciones 2025', bg: 'bg-blue-50/30' },
            ].map(({ key, label, bg }) => (
              <tr key={key} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                <td className={`sticky left-0 z-20 px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-200 ${bg}`} style={{ width: COL_FIRST, minWidth: COL_FIRST }}>{label}</td>
                {tiendas.map((_, i) => (
                  <td key={i} className="border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>
                    <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} />
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                  {formatValor(key as string, calcularTotalesFila(datos, key), 0)}
                </td>
              </tr>
            ))}
            <tr className="border-b border-gray-100">
              <td className="sticky left-0 z-20 px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60 border-r border-gray-200" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>Variación 2025 vs 2026</td>
              {tiendas.map((_, i) => {
                const val = (datos[i]?.transacciones2025 || 0) > 0 ? ((datos[i]?.transaccionesActuales || 0) / datos[i].transacciones2025) - 1 : 0
                return <td key={i} className={`px-4 py-3 text-right text-base border-r border-gray-100 ${getColorVariacion(val)}`} style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>{(val * 100).toFixed(2)}%</td>
              })}
              <td className={`px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 ${getColorVariacion(calcularTotalesFila(datos, 'transacciones2025') > 0 ? (calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'transacciones2025')) - 1 : 0)}`} style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                {calcularTotalesFila(datos, 'transacciones2025') > 0 ? (((calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'transacciones2025')) - 1) * 100).toFixed(2) : '0.00'}%
              </td>
            </tr>

            {/* ===== TICKET PROMEDIO ===== */}
            <tr className="bg-gradient-to-r from-violet-500/10 to-violet-600/5 text-violet-800 border-y border-violet-200/60">
              <td className="sticky left-0 z-20 px-5 py-3 text-base font-bold uppercase tracking-wider" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  Ticket Promedio
                </div>
              </td>
              <td colSpan={n + 1}></td>
            </tr>
            <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
              <td className="sticky left-0 z-20 px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-200 bg-violet-50/30" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>Ticket Prom.</td>
              {tiendas.map((_, i) => {
                const val = (datos[i]?.transaccionesActuales || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].transaccionesActuales : 0
                return <td key={i} className="px-4 py-3 text-right text-base bg-amber-50/40 border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>{formatValor('presupuestoTicket', val)}</td>
              })}
              <td className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-amber-50/60" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                {(() => { const tv = calcularTotalesFila(datos, 'ventaNeta'); const tx = calcularTotalesFila(datos, 'transaccionesActuales'); return tx > 0 ? formatValor('presupuestoTicket', tv / tx) : '$0.00'; })()}
              </td>
            </tr>
            <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
              <td className="sticky left-0 z-20 px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-200 bg-violet-50/30" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>Presupuesto Ticket</td>
              {tiendas.map((_, i) => (
                <td key={i} className="border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>
                  <CeldaInput value={datos[i]?.presupuestoTicket || 0} onChange={(v) => updateDato(i, 'presupuestoTicket', v)} campo="presupuestoTicket" />
                </td>
              ))}
              <td className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                {formatValor('presupuestoTicket', calcularTotalesFila(datos, 'presupuestoTicket'))}
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="sticky left-0 z-20 px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60 border-r border-gray-200" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>Variación vs PPTO</td>
              {tiendas.map((_, i) => {
                const ticket = (datos[i]?.transaccionesActuales || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].transaccionesActuales : 0
                const val = (datos[i]?.presupuestoTicket || 0) > 0 ? (ticket / datos[i].presupuestoTicket) - 1 : 0
                return <td key={i} className={`px-4 py-3 text-right text-base border-r border-gray-100 ${getColorVariacion(val)}`} style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>{(val * 100).toFixed(2)}%</td>
              })}
              <td className={`px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 ${getColorVariacion((() => { const tv = calcularTotalesFila(datos, 'ventaNeta'); const tx = calcularTotalesFila(datos, 'transaccionesActuales'); const tt = tx > 0 ? tv / tx : 0; const tp = calcularTotalesFila(datos, 'presupuestoTicket'); return tp > 0 ? (tt / tp) - 1 : 0; })())}`} style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                {(() => { const tv = calcularTotalesFila(datos, 'ventaNeta'); const tx = calcularTotalesFila(datos, 'transaccionesActuales'); const tt = tx > 0 ? tv / tx : 0; const tp = calcularTotalesFila(datos, 'presupuestoTicket'); return tp > 0 ? (((tt / tp) - 1) * 100).toFixed(2) : '0.00'; })()}%
              </td>
            </tr>

            {/* ===== CANALES ===== */}
            <tr className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 text-emerald-800 border-y border-emerald-200/60">
              <td className="sticky left-0 z-20 px-5 py-3 text-base font-bold uppercase tracking-wider" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  Canales
                </div>
              </td>
              <td colSpan={n + 1}></td>
            </tr>
            {[
              { key: 'kioskos' as keyof DatosTienda, label: 'Kioskos ($)' },
              { key: 'kioskoTrx' as keyof DatosTienda, label: 'Kiosko TRX' },
              { key: 'localLlevar' as keyof DatosTienda, label: 'Local y Llevar ($)' },
              { key: 'localLlevarTrx' as keyof DatosTienda, label: 'TRX Local y Llevar' },
              { key: 'autoservicio' as keyof DatosTienda, label: 'Autoservicio ($)' },
              { key: 'autoservicioTrx' as keyof DatosTienda, label: 'TRX Autoservicio' },
              { key: 'domicilio' as keyof DatosTienda, label: 'Domicilio ($)' },
              { key: 'domicilioTrx' as keyof DatosTienda, label: 'TRX Domicilio' },
            ].map(({ key, label }) => (
              <div key={key}>
                <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                  <td className="sticky left-0 z-20 px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-200 bg-emerald-50/20" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>{label}</td>
                  {tiendas.map((_, i) => (
                    <td key={i} className="border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>
                      <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} />
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                    {formatValor(key as string, calcularTotalesFila(datos, key))}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="sticky left-0 z-20 px-5 py-2 text-sm text-gray-400 bg-gray-50/40 border-r border-gray-200" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>%</td>
                  {tiendas.map((_, i) => {
                    const totalVenta = datos[i]?.ventaNeta || 0
                    const totalTrx = datos[i]?.transaccionesActuales || 0
                    const val = (key as string).includes('Trx') ? (totalTrx > 0 ? ((datos[i]?.[key] as number) || 0) / totalTrx : 0) : (totalVenta > 0 ? ((datos[i]?.[key] as number) || 0) / totalVenta : 0)
                    return <td key={i} className="px-4 py-2 text-right text-sm text-gray-500 border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>{(val * 100).toFixed(2)}%</td>
                  })}
                  <td className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                    {(() => { const totalVenta = calcularTotalesFila(datos, 'ventaNeta'); const totalTrx = calcularTotalesFila(datos, 'transaccionesActuales'); const totalConcepto = calcularTotalesFila(datos, key); const val = (key as string).includes('Trx') ? (totalTrx > 0 ? totalConcepto / totalTrx : 0) : (totalVenta > 0 ? totalConcepto / totalVenta : 0); return (val * 100).toFixed(2) + '%'; })()}
                  </td>
                </tr>
              </div>
            ))}

            {/* ===== DAY PART ===== */}
            <tr className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 text-amber-800 border-y border-amber-200/60">
              <td className="sticky left-0 z-20 px-5 py-3 text-base font-bold uppercase tracking-wider" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  Ventas por Day Part
                </div>
              </td>
              <td colSpan={n + 1}></td>
            </tr>
            {[
              { key: 'dayPartApertura' as keyof DatosTienda, label: 'Apertura - 12 MD' },
              { key: 'dayPart12a3' as keyof DatosTienda, label: '12 MD - 3 PM' },
              { key: 'dayPart3a6' as keyof DatosTienda, label: '3 - 6 PM' },
              { key: 'dayPart6a9' as keyof DatosTienda, label: '6 - 9 PM' },
              { key: 'dayPart9aCierre' as keyof DatosTienda, label: '9 PM - Cierre' },
            ].map(({ key, label }) => (
              <tr key={key} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                <td className="sticky left-0 z-20 px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-200 bg-amber-50/20" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>{label}</td>
                {tiendas.map((_, i) => (
                  <td key={i} className="border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>
                    <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} />
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                  {formatValor(key as string, calcularTotalesFila(datos, key))}
                </td>
              </tr>
            ))}

            {/* ===== INFO FINANCIERA ===== */}
            <tr className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 text-orange-800 border-y border-orange-200/60">
              <td className="sticky left-0 z-20 px-5 py-3 text-base font-bold uppercase tracking-wider" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  Información Financiera
                </div>
              </td>
              <td colSpan={n + 1}></td>
            </tr>
            {[
              { key: 'borrantes' as keyof DatosTienda, label: 'Borrantes ($)' },
              { key: 'notasCredito' as keyof DatosTienda, label: 'Notas de crédito ($)' },
              { key: 'notasCreditoCantidad' as keyof DatosTienda, label: 'N° notas de crédito' },
              { key: 'descuentosEmpleados' as keyof DatosTienda, label: 'Desc. empleados ($)' },
              { key: 'descuentosJubilados' as keyof DatosTienda, label: 'Desc. jubilados ($)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                  <td className="sticky left-0 z-20 px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-200 bg-orange-50/20" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>{label}</td>
                  {tiendas.map((_, i) => (
                    <td key={i} className="border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>
                      <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} />
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                    {formatValor(key as string, calcularTotalesFila(datos, key), key === 'notasCreditoCantidad' ? 0 : 2)}
                  </td>
                </tr>
                {key !== 'notasCreditoCantidad' && (
                  <tr className="border-b border-gray-100">
                    <td className="sticky left-0 z-20 px-5 py-2 text-sm text-gray-400 bg-gray-50/40 border-r border-gray-200" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>%</td>
                    {tiendas.map((_, i) => {
                      const val = (datos[i]?.ventaNeta || 0) > 0 ? ((datos[i]?.[key] as number) || 0) / datos[i].ventaNeta : 0
                      return <td key={i} className="px-4 py-2 text-right text-sm text-gray-500 border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>{(val * 100).toFixed(3)}%</td>
                    })}
                    <td className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                      {(() => { const totalVenta = calcularTotalesFila(datos, 'ventaNeta'); const totalConcepto = calcularTotalesFila(datos, key); return totalVenta > 0 ? ((totalConcepto / totalVenta) * 100).toFixed(3) + '%' : '0.000%'; })()}
                    </td>
                  </tr>
                )}
              </div>
            ))}

            {/* ===== ENTRENAMIENTO ===== */}
            <tr className="bg-gradient-to-r from-cyan-500/10 to-cyan-600/5 text-cyan-800 border-y border-cyan-200/60">
              <td className="sticky left-0 z-20 px-5 py-3 text-base font-bold uppercase tracking-wider" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  Entrenamiento
                </div>
              </td>
              <td colSpan={n + 1}></td>
            </tr>
            {[
              { key: 'personalEntrenamiento' as keyof DatosTienda, label: 'Personal en entrenamiento' },
              { key: 'theVault' as keyof DatosTienda, label: '% The Vault' },
            ].map(({ key, label }) => (
              <tr key={key} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                <td className="sticky left-0 z-20 px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-200 bg-cyan-50/20" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>{label}</td>
                {tiendas.map((_, i) => (
                  <td key={i} className="border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>
                    <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} type={key === 'theVault' ? 'percentage' : 'number'} campo={key} />
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                  {formatValor(key as string, calcularTotalesFila(datos, key), key === 'theVault' ? 2 : 0)}
                </td>
              </tr>
            ))}

            {/* ===== MANO DE OBRA ===== */}
            <tr className="bg-gradient-to-r from-indigo-500/10 to-indigo-600/5 text-indigo-800 border-y border-indigo-200/60">
              <td className="sticky left-0 z-20 px-5 py-3 text-base font-bold uppercase tracking-wider" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  Mano de Obra
                </div>
              </td>
              <td colSpan={n + 1}></td>
            </tr>
            {[
              { key: 'manpowerAprobado' as keyof DatosTienda, label: 'Manpower aprobado' },
              { key: 'empleadosActivos' as keyof DatosTienda, label: 'Empleados activos' },
              { key: 'empleadosVacaciones' as keyof DatosTienda, label: 'Empleados vacaciones' },
              { key: 'gerentesActivos' as keyof DatosTienda, label: 'Gerentes activos' },
              { key: 'costoManoObra' as keyof DatosTienda, label: 'Costo mano de obra' },
              { key: 'horasColaboradores' as keyof DatosTienda, label: 'Horas colaboradores' },
              { key: 'horasInasistencia' as keyof DatosTienda, label: 'Hrs inasis/incapac' },
              { key: 'horasExtras' as keyof DatosTienda, label: 'Horas extras' },
            ].map(({ key, label }) => (
              <div key={key}>
                <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                  <td className="sticky left-0 z-20 px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-200 bg-indigo-50/20" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>{label}</td>
                  {tiendas.map((_, i) => (
                    <td key={i} className="border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>
                      <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} />
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                    {formatValor(key as string, calcularTotalesFila(datos, key))}
                  </td>
                </tr>
                {key === 'costoManoObra' && (
                  <tr className="border-b border-gray-100">
                    <td className="sticky left-0 z-20 px-5 py-2 text-sm text-gray-400 bg-gray-50/40 border-r border-gray-200" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>% Mano de Obra</td>
                    {tiendas.map((_, i) => {
                      const val = (datos[i]?.ventaNeta || 0) > 0 ? (datos[i]?.costoManoObra || 0) / datos[i].ventaNeta : 0
                      return <td key={i} className="px-4 py-2 text-right text-sm text-gray-500 border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>{(val * 100).toFixed(2)}%</td>
                    })}
                    <td className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                      {(() => { const totalVenta = calcularTotalesFila(datos, 'ventaNeta'); const totalMO = calcularTotalesFila(datos, 'costoManoObra'); return totalVenta > 0 ? ((totalMO / totalVenta) * 100).toFixed(2) + '%' : '0.00%'; })()}
                    </td>
                  </tr>
                )}
                {key === 'empleadosActivos' && (
                  <tr className="border-b border-gray-100">
                    <td className="sticky left-0 z-20 px-5 py-2 text-sm text-gray-400 bg-gray-50/40 border-r border-gray-200" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>Productividad</td>
                    {tiendas.map((_, i) => {
                      const val = (datos[i]?.empleadosActivos || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].empleadosActivos : 0
                      return <td key={i} className="px-4 py-2 text-right text-sm text-gray-500 border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>{val.toFixed(2)}</td>
                    })}
                    <td className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                      {(() => { const totalVenta = calcularTotalesFila(datos, 'ventaNeta'); const totalEmp = calcularTotalesFila(datos, 'empleadosActivos'); return totalEmp > 0 ? (totalVenta / totalEmp).toFixed(2) : '0.00'; })()}
                    </td>
                  </tr>
                )}
              </div>
            ))}

            {/* ===== COSTOS ===== */}
            <tr className="bg-gradient-to-r from-rose-500/10 to-rose-600/5 text-rose-800 border-y border-rose-200/60">
              <td className="sticky left-0 z-20 px-5 py-3 text-base font-bold uppercase tracking-wider" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  Costos
                </div>
              </td>
              <td colSpan={n + 1}></td>
            </tr>
            {[
              { key: 'costoSemanal' as keyof DatosTienda, label: 'Costo Semanal %' },
              { key: 'costoTeorico' as keyof DatosTienda, label: 'Costo Teórico %' },
            ].map(({ key, label }) => (
              <tr key={key} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                <td className="sticky left-0 z-20 px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-200 bg-rose-50/20" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>{label}</td>
                {tiendas.map((_, i) => (
                  <td key={i} className="border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>
                    <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} type="percentage" campo={key} />
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                  {calcularTotalesFila(datos, key).toFixed(2)}%
                </td>
              </tr>
            ))}
            <tr className="border-b border-gray-100">
              <td className="sticky left-0 z-20 px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60 border-r border-gray-200" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>Variación %</td>
              {tiendas.map((_, i) => {
                const val = (datos[i]?.costoSemanal || 0) - (datos[i]?.costoTeorico || 0)
                return <td key={i} className={`px-4 py-3 text-right text-base border-r border-gray-100 ${getColorVariacion(val)}`} style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>{(val * 100).toFixed(2)}%</td>
              })}
              <td className={`px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 ${getColorVariacion(calcularTotalesFila(datos, 'costoSemanal') - calcularTotalesFila(datos, 'costoTeorico'))}`} style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                {((calcularTotalesFila(datos, 'costoSemanal') - calcularTotalesFila(datos, 'costoTeorico')) * 100).toFixed(2)}%
              </td>
            </tr>
            {[
              { key: 'merma' as keyof DatosTienda, label: 'Merma Semanal' },
              { key: 'gap' as keyof DatosTienda, label: 'Diferencias Negativas (GAP)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                  <td className="sticky left-0 z-20 px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-200 bg-rose-50/20" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>{label}</td>
                  {tiendas.map((_, i) => (
                    <td key={i} className="border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>
                      <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} />
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                    {formatValor(key as string, calcularTotalesFila(datos, key))}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="sticky left-0 z-20 px-5 py-2 text-sm text-gray-400 bg-gray-50/40 border-r border-gray-200" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>%</td>
                  {tiendas.map((_, i) => {
                    const val = (datos[i]?.ventaNeta || 0) > 0 ? ((datos[i]?.[key] as number) || 0) / datos[i].ventaNeta : 0
                    return <td key={i} className="px-4 py-2 text-right text-sm text-gray-500 border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>{(val * 100).toFixed(3)}%</td>
                  })}
                  <td className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                    {(() => { const totalVenta = calcularTotalesFila(datos, 'ventaNeta'); const totalConcepto = calcularTotalesFila(datos, key); return totalVenta > 0 ? ((totalConcepto / totalVenta) * 100).toFixed(3) + '%' : '0.000%'; })()}
                  </td>
                </tr>
              </div>
            ))}

            {/* ===== CLIENTES ===== */}
            <tr className="bg-gradient-to-r from-teal-500/10 to-teal-600/5 text-teal-800 border-y border-teal-200/60">
              <td className="sticky left-0 z-20 px-5 py-3 text-base font-bold uppercase tracking-wider" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  Clientes
                </div>
              </td>
              <td colSpan={n + 1}></td>
            </tr>
            {[
              { key: 'tiempoAutoSegundos' as keyof DatosTienda, label: 'Tiempo Auto (seg)' },
              { key: 'tiempoAutoDia' as keyof DatosTienda, label: 'Tiempo Auto (día)' },
              { key: 'dp1' as keyof DatosTienda, label: 'DP#1 Apertura-12MD' },
              { key: 'dp2' as keyof DatosTienda, label: 'DP#2 12MD-3PM' },
              { key: 'dp3' as keyof DatosTienda, label: 'DP#3 3-6PM' },
              { key: 'dp4' as keyof DatosTienda, label: 'DP#4 6-9PM' },
              { key: 'dp5' as keyof DatosTienda, label: 'DP#5 9PM-Cierre' },
            ].map(({ key, label }) => (
              <tr key={key} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                <td className="sticky left-0 z-20 px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-200 bg-teal-50/20" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>{label}</td>
                {tiendas.map((_, i) => (
                  <td key={i} className="border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>
                    <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} />
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                  {calcularTotalesFila(datos, key).toFixed(2)}
                </td>
              </tr>
            ))}

            {/* ===== ROCC ===== */}
            <tr className="bg-gradient-to-r from-gray-500/10 to-gray-600/5 text-gray-800 border-y border-gray-200/60">
              <td className="sticky left-0 z-20 px-5 py-3 text-base font-bold uppercase tracking-wider" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  ROCC
                </div>
              </td>
              <td colSpan={n + 1}></td>
            </tr>
            {[
              { key: 'roccL1' as keyof DatosTienda, label: 'L1' },
              { key: 'roccL3' as keyof DatosTienda, label: 'L3' },
            ].map(({ key, label }) => (
              <tr key={key} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                <td className="sticky left-0 z-20 px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-200 bg-gray-50/40" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>{label}</td>
                {tiendas.map((_, i) => (
                  <td key={i} className="border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>
                    <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} />
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                  {calcularTotalesFila(datos, key).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </td>
              </tr>
            ))}

            {/* ===== DOMICILIO ===== */}
            <tr className="bg-gradient-to-r from-fuchsia-500/10 to-fuchsia-600/5 text-fuchsia-800 border-y border-fuchsia-200/60">
              <td className="sticky left-0 z-20 px-5 py-3 text-base font-bold uppercase tracking-wider" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  Domicilio
                </div>
              </td>
              <td colSpan={n + 1}></td>
            </tr>
            {[
              { key: 'penalizacionesPct' as keyof DatosTienda, label: '% Penalizaciones' },
              { key: 'montoPenalizado' as keyof DatosTienda, label: 'Monto penalizado' },
              { key: 'tiempoCocina' as keyof DatosTienda, label: 'Tiempo cocina (min)' },
            ].map(({ key, label }) => (
              <tr key={key} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                <td className="sticky left-0 z-20 px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-200 bg-fuchsia-50/20" style={{ width: COL_FIRST, minWidth: COL_FIRST }}>{label}</td>
                {tiendas.map((_, i) => (
                  <td key={i} className="border-r border-gray-100" style={{ width: COL_TIENDA, minWidth: COL_TIENDA }}>
                    <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} type={key === 'penalizacionesPct' ? 'percentage' : 'number'} campo={key} />
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50" style={{ width: COL_TOTAL, minWidth: COL_TOTAL }}>
                  {formatValor(key as string, calcularTotalesFila(datos, key), key === 'penalizacionesPct' ? 2 : 0)}
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  )
}
