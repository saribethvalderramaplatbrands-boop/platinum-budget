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

// ===== CONSTANTES DE ANCHO =====
const W_FIRST = 260
const W_TIENDA = 140
const W_TOTAL = 120

export default function TablaTiendas({ gerente, tiendas, datos, onUpdateDato }: TablaTiendasProps) {
  const updateDato = useCallback((tiendaIndex: number, campo: keyof DatosTienda, valor: number) => {
    onUpdateDato(tiendaIndex, campo, valor)
  }, [onUpdateDato])

  const n = tiendas.length
  // Grid con anchos EXACTOS en px: 260px | 140px | 140px | ... | 120px
  const gridTemplate = `${W_FIRST}px repeat(${n}, ${W_TIENDA}px) ${W_TOTAL}px`
  const totalWidth = W_FIRST + (n * W_TIENDA) + W_TOTAL

  // Clases reutilizables
  const cellBase = "border-r border-gray-200"
  const cellFirst = `sticky left-0 z-20 ${cellBase}`
  const cellHeader = `sticky top-0 z-30 ${cellBase}`
  const cellCorner = `sticky top-0 left-0 z-50 ${cellBase}`

  return (
    <div className="rounded-3xl border border-gray-200/60 shadow-[0_8px_40px_rgba(0,0,0,0.06)] bg-white overflow-hidden">
      <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: gridTemplate,
            width: totalWidth,
          }}
        >
          {/* ===== HEADER ROJO ===== */}
          <div className={`${cellCorner} px-4 py-4 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 flex items-center rounded-tl-3xl`}>
            <span className="opacity-90">GERENTE:</span> <span className="ml-1.5">{gerente}</span>
          </div>
          {tiendas.map(t => (
            <div key={t.codigo} className={`${cellHeader} px-2 py-3 text-center text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center leading-tight`}>
              {t.nombre.replace('KFC ', '')}
            </div>
          ))}
          <div className={`sticky top-0 z-30 px-2 py-3 text-center text-sm font-bold text-white bg-black/10 rounded-tr-3xl flex items-center justify-center`}>
            TOTAL
          </div>

          {/* ===== VENTAS ===== */}
          <div className={`${cellFirst} px-5 py-3 text-base font-bold uppercase tracking-wider text-red-800 bg-gradient-to-r from-red-500/10 to-red-600/5 border-y border-red-200/60 flex items-center gap-2`} style={{ gridColumn: `1 / ${n + 3}` }}>
            <div className="w-2 h-2 rounded-full bg-current" />Ventas
          </div>
          {[
            { key: 'ventaNeta' as keyof DatosTienda, label: 'Ventas Neta', bg: 'bg-red-50/30' },
            { key: 'presupuestoVentas' as keyof DatosTienda, label: 'Presupuesto Ventas', bg: 'bg-red-50/30' },
          ].map(({ key, label, bg }) => (
            <div key={key} className="contents">
              <div className={`${cellFirst} px-5 py-3 text-base font-semibold text-gray-700 ${bg} flex items-center`}>{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className={cellBase}><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key))}</div>
            </div>
          ))}
          <div className="contents">
            <div className={`${cellFirst} px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60`}>Variación vs PPTO</div>
            {tiendas.map((_, i) => {
              const val = (datos[i]?.presupuestoVentas || 0) > 0 ? ((datos[i]?.ventaNeta || 0) / datos[i].presupuestoVentas) - 1 : 0
              return <div key={i} className={`px-4 py-3 text-right text-base ${getColorVariacion(val)}`}>{(val * 100).toFixed(2)}%</div>
            })}
            <div className={`px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 ${getColorVariacion(calcularTotalesFila(datos, 'presupuestoVentas') > 0 ? (calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'presupuestoVentas')) - 1 : 0)}`}>
              {calcularTotalesFila(datos, 'presupuestoVentas') > 0 ? (((calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'presupuestoVentas')) - 1) * 100).toFixed(2) : '0.00'}%
            </div>
          </div>
          {[
            { key: 'ventas2025' as keyof DatosTienda, label: 'Ventas 2025', bg: 'bg-red-50/30' },
          ].map(({ key, label, bg }) => (
            <div key={key} className="contents">
              <div className={`${cellFirst} px-5 py-3 text-base font-semibold text-gray-700 ${bg} flex items-center`}>{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className={cellBase}><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key))}</div>
            </div>
          ))}
          <div className="contents">
            <div className={`${cellFirst} px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60`}>Variación 2025 vs 2026</div>
            {tiendas.map((_, i) => {
              const val = (datos[i]?.ventas2025 || 0) > 0 ? ((datos[i]?.ventaNeta || 0) / datos[i].ventas2025) - 1 : 0
              return <div key={i} className={`px-4 py-3 text-right text-base ${getColorVariacion(val)}`}>{(val * 100).toFixed(2)}%</div>
            })}
            <div className={`px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 ${getColorVariacion(calcularTotalesFila(datos, 'ventas2025') > 0 ? (calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'ventas2025')) - 1 : 0)}`}>
              {calcularTotalesFila(datos, 'ventas2025') > 0 ? (((calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'ventas2025')) - 1) * 100).toFixed(2) : '0.00'}%
            </div>
          </div>

          {/* ===== TRANSACCIONES ===== */}
          <div className={`${cellFirst} px-5 py-3 text-base font-bold uppercase tracking-wider text-blue-800 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-y border-blue-200/60 flex items-center gap-2`} style={{ gridColumn: `1 / ${n + 3}` }}>
            <div className="w-2 h-2 rounded-full bg-current" />Transacciones
          </div>
          {[
            { key: 'transaccionesActuales' as keyof DatosTienda, label: 'Transacciones Actuales', bg: 'bg-blue-50/30' },
            { key: 'presupuestoTransacciones' as keyof DatosTienda, label: 'Presupuesto Transacciones', bg: 'bg-blue-50/30' },
          ].map(({ key, label, bg }) => (
            <div key={key} className="contents">
              <div className={`${cellFirst} px-5 py-3 text-base font-semibold text-gray-700 ${bg} flex items-center`}>{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className={cellBase}><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key), 0)}</div>
            </div>
          ))}
          <div className="contents">
            <div className={`${cellFirst} px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60`}>Variación vs PPTO</div>
            {tiendas.map((_, i) => {
              const val = (datos[i]?.presupuestoTransacciones || 0) > 0 ? ((datos[i]?.transaccionesActuales || 0) / datos[i].presupuestoTransacciones) - 1 : 0
              return <div key={i} className={`px-4 py-3 text-right text-base ${getColorVariacion(val)}`}>{(val * 100).toFixed(2)}%</div>
            })}
            <div className={`px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 ${getColorVariacion(calcularTotalesFila(datos, 'presupuestoTransacciones') > 0 ? (calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'presupuestoTransacciones')) - 1 : 0)}`}>
              {calcularTotalesFila(datos, 'presupuestoTransacciones') > 0 ? (((calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'presupuestoTransacciones')) - 1) * 100).toFixed(2) : '0.00'}%
            </div>
          </div>
          {[
            { key: 'transacciones2025' as keyof DatosTienda, label: 'Transacciones 2025', bg: 'bg-blue-50/30' },
          ].map(({ key, label, bg }) => (
            <div key={key} className="contents">
              <div className={`${cellFirst} px-5 py-3 text-base font-semibold text-gray-700 ${bg} flex items-center`}>{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className={cellBase}><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key), 0)}</div>
            </div>
          ))}
          <div className="contents">
            <div className={`${cellFirst} px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60`}>Variación 2025 vs 2026</div>
            {tiendas.map((_, i) => {
              const val = (datos[i]?.transacciones2025 || 0) > 0 ? ((datos[i]?.transaccionesActuales || 0) / datos[i].transacciones2025) - 1 : 0
              return <div key={i} className={`px-4 py-3 text-right text-base ${getColorVariacion(val)}`}>{(val * 100).toFixed(2)}%</div>
            })}
            <div className={`px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 ${getColorVariacion(calcularTotalesFila(datos, 'transacciones2025') > 0 ? (calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'transacciones2025')) - 1 : 0)}`}>
              {calcularTotalesFila(datos, 'transacciones2025') > 0 ? (((calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'transacciones2025')) - 1) * 100).toFixed(2) : '0.00'}%
            </div>
          </div>

          {/* ===== TICKET PROMEDIO ===== */}
          <div className={`${cellFirst} px-5 py-3 text-base font-bold uppercase tracking-wider text-violet-800 bg-gradient-to-r from-violet-500/10 to-violet-600/5 border-y border-violet-200/60 flex items-center gap-2`} style={{ gridColumn: `1 / ${n + 3}` }}>
            <div className="w-2 h-2 rounded-full bg-current" />Ticket Promedio
          </div>
          <div className="contents">
            <div className={`${cellFirst} px-5 py-3 text-base font-semibold text-gray-700 bg-violet-50/30 flex items-center`}>Ticket Prom.</div>
            {tiendas.map((_, i) => {
              const val = (datos[i]?.transaccionesActuales || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].transaccionesActuales : 0
              return <div key={i} className="px-4 py-3 text-right text-base bg-amber-50/40">{formatValor('presupuestoTicket', val)}</div>
            })}
            <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-amber-50/60">
              {(() => { const tv = calcularTotalesFila(datos, 'ventaNeta'); const tx = calcularTotalesFila(datos, 'transaccionesActuales'); return tx > 0 ? formatValor('presupuestoTicket', tv / tx) : '$0.00'; })()}
            </div>
          </div>
          <div className="contents">
            <div className={`${cellFirst} px-5 py-3 text-base font-semibold text-gray-700 bg-violet-50/30 flex items-center`}>Presupuesto Ticket</div>
            {tiendas.map((_, i) => (
              <div key={i} className={cellBase}><CeldaInput value={datos[i]?.presupuestoTicket || 0} onChange={(v) => updateDato(i, 'presupuestoTicket', v)} campo="presupuestoTicket" /></div>
            ))}
            <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor('presupuestoTicket', calcularTotalesFila(datos, 'presupuestoTicket'))}</div>
          </div>
          <div className="contents">
            <div className={`${cellFirst} px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60`}>Variación vs PPTO</div>
            {tiendas.map((_, i) => {
              const ticket = (datos[i]?.transaccionesActuales || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].transaccionesActuales : 0
              const val = (datos[i]?.presupuestoTicket || 0) > 0 ? (ticket / datos[i].presupuestoTicket) - 1 : 0
              return <div key={i} className={`px-4 py-3 text-right text-base ${getColorVariacion(val)}`}>{(val * 100).toFixed(2)}%</div>
            })}
            <div className={`px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 ${getColorVariacion((() => { const tv = calcularTotalesFila(datos, 'ventaNeta'); const tx = calcularTotalesFila(datos, 'transaccionesActuales'); const tt = tx > 0 ? tv / tx : 0; const tp = calcularTotalesFila(datos, 'presupuestoTicket'); return tp > 0 ? (tt / tp) - 1 : 0; })())}`}>
              {(() => { const tv = calcularTotalesFila(datos, 'ventaNeta'); const tx = calcularTotalesFila(datos, 'transaccionesActuales'); const tt = tx > 0 ? tv / tx : 0; const tp = calcularTotalesFila(datos, 'presupuestoTicket'); return tp > 0 ? (((tt / tp) - 1) * 100).toFixed(2) : '0.00'; })()}%
            </div>
          </div>

          {/* ===== CANALES ===== */}
          <div className={`${cellFirst} px-5 py-3 text-base font-bold uppercase tracking-wider text-emerald-800 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border-y border-emerald-200/60 flex items-center gap-2`} style={{ gridColumn: `1 / ${n + 3}` }}>
            <div className="w-2 h-2 rounded-full bg-current" />Canales
          </div>
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
              <div className="contents">
                <div className={`${cellFirst} px-5 py-3 text-base font-semibold text-gray-700 bg-emerald-50/20 flex items-center`}>{label}</div>
                {tiendas.map((_, i) => (
                  <div key={i} className={cellBase}><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
                ))}
                <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key))}</div>
              </div>
              <div className="contents">
                <div className={`${cellFirst} px-5 py-2 text-sm text-gray-400 bg-gray-50/40`}>%</div>
                {tiendas.map((_, i) => {
                  const totalVenta = datos[i]?.ventaNeta || 0
                  const totalTrx = datos[i]?.transaccionesActuales || 0
                  const val = (key as string).includes('Trx') ? (totalTrx > 0 ? ((datos[i]?.[key] as number) || 0) / totalTrx : 0) : (totalVenta > 0 ? ((datos[i]?.[key] as number) || 0) / totalVenta : 0)
                  return <div key={i} className="px-4 py-2 text-right text-sm text-gray-500">{(val * 100).toFixed(2)}%</div>
                })}
                <div className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40">
                  {(() => { const totalVenta = calcularTotalesFila(datos, 'ventaNeta'); const totalTrx = calcularTotalesFila(datos, 'transaccionesActuales'); const totalConcepto = calcularTotalesFila(datos, key); const val = (key as string).includes('Trx') ? (totalTrx > 0 ? totalConcepto / totalTrx : 0) : (totalVenta > 0 ? totalConcepto / totalVenta : 0); return (val * 100).toFixed(2) + '%'; })()}
                </div>
              </div>
            </div>
          ))}

          {/* ===== DAY PART ===== */}
          <div className={`${cellFirst} px-5 py-3 text-base font-bold uppercase tracking-wider text-amber-800 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-y border-amber-200/60 flex items-center gap-2`} style={{ gridColumn: `1 / ${n + 3}` }}>
            <div className="w-2 h-2 rounded-full bg-current" />Ventas por Day Part
          </div>
          {[
            { key: 'dayPartApertura' as keyof DatosTienda, label: 'Apertura - 12 MD' },
            { key: 'dayPart12a3' as keyof DatosTienda, label: '12 MD - 3 PM' },
            { key: 'dayPart3a6' as keyof DatosTienda, label: '3 - 6 PM' },
            { key: 'dayPart6a9' as keyof DatosTienda, label: '6 - 9 PM' },
            { key: 'dayPart9aCierre' as keyof DatosTienda, label: '9 PM - Cierre' },
          ].map(({ key, label }) => (
            <div key={key} className="contents">
              <div className={`${cellFirst} px-5 py-3 text-base font-semibold text-gray-700 bg-amber-50/20 flex items-center`}>{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className={cellBase}><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key))}</div>
            </div>
          ))}

          {/* ===== INFO FINANCIERA ===== */}
          <div className={`${cellFirst} px-5 py-3 text-base font-bold uppercase tracking-wider text-orange-800 bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-y border-orange-200/60 flex items-center gap-2`} style={{ gridColumn: `1 / ${n + 3}` }}>
            <div className="w-2 h-2 rounded-full bg-current" />Información Financiera
          </div>
          {[
            { key: 'borrantes' as keyof DatosTienda, label: 'Borrantes ($)' },
            { key: 'notasCredito' as keyof DatosTienda, label: 'Notas de crédito ($)' },
            { key: 'notasCreditoCantidad' as keyof DatosTienda, label: 'N° notas de crédito' },
            { key: 'descuentosEmpleados' as keyof DatosTienda, label: 'Desc. empleados ($)' },
            { key: 'descuentosJubilados' as keyof DatosTienda, label: 'Desc. jubilados ($)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <div className="contents">
                <div className={`${cellFirst} px-5 py-3 text-base font-semibold text-gray-700 bg-orange-50/20 flex items-center`}>{label}</div>
                {tiendas.map((_, i) => (
                  <div key={i} className={cellBase}><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
                ))}
                <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key), key === 'notasCreditoCantidad' ? 0 : 2)}</div>
              </div>
              {key !== 'notasCreditoCantidad' && (
                <div className="contents">
                  <div className={`${cellFirst} px-5 py-2 text-sm text-gray-400 bg-gray-50/40`}>%</div>
                  {tiendas.map((_, i) => {
                    const val = (datos[i]?.ventaNeta || 0) > 0 ? ((datos[i]?.[key] as number) || 0) / datos[i].ventaNeta : 0
                    return <div key={i} className="px-4 py-2 text-right text-sm text-gray-500">{(val * 100).toFixed(3)}%</div>
                  })}
                  <div className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40">
                    {(() => { const totalVenta = calcularTotalesFila(datos, 'ventaNeta'); const totalConcepto = calcularTotalesFila(datos, key); return totalVenta > 0 ? ((totalConcepto / totalVenta) * 100).toFixed(3) + '%' : '0.000%'; })()}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* ===== ENTRENAMIENTO ===== */}
          <div className={`${cellFirst} px-5 py-3 text-base font-bold uppercase tracking-wider text-cyan-800 bg-gradient-to-r from-cyan-500/10 to-cyan-600/5 border-y border-cyan-200/60 flex items-center gap-2`} style={{ gridColumn: `1 / ${n + 3}` }}>
            <div className="w-2 h-2 rounded-full bg-current" />Entrenamiento
          </div>
          {[
            { key: 'personalEntrenamiento' as keyof DatosTienda, label: 'Personal en entrenamiento' },
            { key: 'theVault' as keyof DatosTienda, label: '% The Vault' },
          ].map(({ key, label }) => (
            <div key={key} className="contents">
              <div className={`${cellFirst} px-5 py-3 text-base font-semibold text-gray-700 bg-cyan-50/20 flex items-center`}>{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className={cellBase}><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} type={key === 'theVault' ? 'percentage' : 'number'} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key), key === 'theVault' ? 2 : 0)}</div>
            </div>
          ))}

          {/* ===== MANO DE OBRA ===== */}
          <div className={`${cellFirst} px-5 py-3 text-base font-bold uppercase tracking-wider text-indigo-800 bg-gradient-to-r from-indigo-500/10 to-indigo-600/5 border-y border-indigo-200/60 flex items-center gap-2`} style={{ gridColumn: `1 / ${n + 3}` }}>
            <div className="w-2 h-2 rounded-full bg-current" />Mano de Obra
          </div>
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
              <div className="contents">
                <div className={`${cellFirst} px-5 py-3 text-base font-semibold text-gray-700 bg-indigo-50/20 flex items-center`}>{label}</div>
                {tiendas.map((_, i) => (
                  <div key={i} className={cellBase}><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
                ))}
                <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key))}</div>
              </div>
              {key === 'costoManoObra' && (
                <div className="contents">
                  <div className={`${cellFirst} px-5 py-2 text-sm text-gray-400 bg-gray-50/40`}>% Mano de Obra</div>
                  {tiendas.map((_, i) => {
                    const val = (datos[i]?.ventaNeta || 0) > 0 ? (datos[i]?.costoManoObra || 0) / datos[i].ventaNeta : 0
                    return <div key={i} className="px-4 py-2 text-right text-sm text-gray-500">{(val * 100).toFixed(2)}%</div>
                  })}
                  <div className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40">
                    {(() => { const totalVenta = calcularTotalesFila(datos, 'ventaNeta'); const totalMO = calcularTotalesFila(datos, 'costoManoObra'); return totalVenta > 0 ? ((totalMO / totalVenta) * 100).toFixed(2) + '%' : '0.00%'; })()}
                  </div>
                </div>
              )}
              {key === 'empleadosActivos' && (
                <div className="contents">
                  <div className={`${cellFirst} px-5 py-2 text-sm text-gray-400 bg-gray-50/40`}>Productividad</div>
                  {tiendas.map((_, i) => {
                    const val = (datos[i]?.empleadosActivos || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].empleadosActivos : 0
                    return <div key={i} className="px-4 py-2 text-right text-sm text-gray-500">{val.toFixed(2)}</div>
                  })}
                  <div className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40">
                    {(() => { const totalVenta = calcularTotalesFila(datos, 'ventaNeta'); const totalEmp = calcularTotalesFila(datos, 'empleadosActivos'); return totalEmp > 0 ? (totalVenta / totalEmp).toFixed(2) : '0.00'; })()}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* ===== COSTOS ===== */}
          <div className={`${cellFirst} px-5 py-3 text-base font-bold uppercase tracking-wider text-rose-800 bg-gradient-to-r from-rose-500/10 to-rose-600/5 border-y border-rose-200/60 flex items-center gap-2`} style={{ gridColumn: `1 / ${n + 3}` }}>
            <div className="w-2 h-2 rounded-full bg-current" />Costos
          </div>
          {[
            { key: 'costoSemanal' as keyof DatosTienda, label: 'Costo Semanal %' },
            { key: 'costoTeorico' as keyof DatosTienda, label: 'Costo Teórico %' },
          ].map(({ key, label }) => (
            <div key={key} className="contents">
              <div className={`${cellFirst} px-5 py-3 text-base font-semibold text-gray-700 bg-rose-50/20 flex items-center`}>{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className={cellBase}><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} type="percentage" campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{calcularTotalesFila(datos, key).toFixed(2)}%</div>
            </div>
          ))}
          <div className="contents">
            <div className={`${cellFirst} px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60`}>Variación %</div>
            {tiendas.map((_, i) => {
              const val = (datos[i]?.costoSemanal || 0) - (datos[i]?.costoTeorico || 0)
              return <div key={i} className={`px-4 py-3 text-right text-base ${getColorVariacion(val)}`}>{(val * 100).toFixed(2)}%</div>
            })}
            <div className={`px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 ${getColorVariacion(calcularTotalesFila(datos, 'costoSemanal') - calcularTotalesFila(datos, 'costoTeorico'))}`}>
              {((calcularTotalesFila(datos, 'costoSemanal') - calcularTotalesFila(datos, 'costoTeorico')) * 100).toFixed(2)}%
            </div>
          </div>
          {[
            { key: 'merma' as keyof DatosTienda, label: 'Merma Semanal' },
            { key: 'gap' as keyof DatosTienda, label: 'Diferencias Negativas (GAP)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <div className="contents">
                <div className={`${cellFirst} px-5 py-3 text-base font-semibold text-gray-700 bg-rose-50/20 flex items-center`}>{label}</div>
                {tiendas.map((_, i) => (
                  <div key={i} className={cellBase}><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
                ))}
                <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key))}</div>
              </div>
              <div className="contents">
                <div className={`${cellFirst} px-5 py-2 text-sm text-gray-400 bg-gray-50/40`}>%</div>
                {tiendas.map((_, i) => {
                  const val = (datos[i]?.ventaNeta || 0) > 0 ? ((datos[i]?.[key] as number) || 0) / datos[i].ventaNeta : 0
                  return <div key={i} className="px-4 py-2 text-right text-sm text-gray-500">{(val * 100).toFixed(3)}%</div>
                })}
                <div className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40">
                  {(() => { const totalVenta = calcularTotalesFila(datos, 'ventaNeta'); const totalConcepto = calcularTotalesFila(datos, key); return totalVenta > 0 ? ((totalConcepto / totalVenta) * 100).toFixed(3) + '%' : '0.000%'; })()}
                </div>
              </div>
            </div>
          ))}

          {/* ===== CLIENTES ===== */}
          <div className={`${cellFirst} px-5 py-3 text-base font-bold uppercase tracking-wider text-teal-800 bg-gradient-to-r from-teal-500/10 to-teal-600/5 border-y border-teal-200/60 flex items-center gap-2`} style={{ gridColumn: `1 / ${n + 3}` }}>
            <div className="w-2 h-2 rounded-full bg-current" />Clientes
          </div>
          {[
            { key: 'tiempoAutoSegundos' as keyof DatosTienda, label: 'Tiempo Auto (seg)' },
            { key: 'tiempoAutoDia' as keyof DatosTienda, label: 'Tiempo Auto (día)' },
            { key: 'dp1' as keyof DatosTienda, label: 'DP#1 Apertura-12MD' },
            { key: 'dp2' as keyof DatosTienda, label: 'DP#2 12MD-3PM' },
            { key: 'dp3' as keyof DatosTienda, label: 'DP#3 3-6PM' },
            { key: 'dp4' as keyof DatosTienda, label: 'DP#4 6-9PM' },
            { key: 'dp5' as keyof DatosTienda, label: 'DP#5 9PM-Cierre' },
          ].map(({ key, label }) => (
            <div key={key} className="contents">
              <div className={`${cellFirst} px-5 py-3 text-base font-semibold text-gray-700 bg-teal-50/20 flex items-center`}>{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className={cellBase}><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{calcularTotalesFila(datos, key).toFixed(2)}</div>
            </div>
          ))}

          {/* ===== ROCC ===== */}
          <div className={`${cellFirst} px-5 py-3 text-base font-bold uppercase tracking-wider text-gray-800 bg-gradient-to-r from-gray-500/10 to-gray-600/5 border-y border-gray-200/60 flex items-center gap-2`} style={{ gridColumn: `1 / ${n + 3}` }}>
            <div className="w-2 h-2 rounded-full bg-current" />ROCC
          </div>
          {[
            { key: 'roccL1' as keyof DatosTienda, label: 'L1' },
            { key: 'roccL3' as keyof DatosTienda, label: 'L3' },
          ].map(({ key, label }) => (
            <div key={key} className="contents">
              <div className={`${cellFirst} px-5 py-3 text-base font-semibold text-gray-700 bg-gray-50/40 flex items-center`}>{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className={cellBase}><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{calcularTotalesFila(datos, key).toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
            </div>
          ))}

          {/* ===== DOMICILIO ===== */}
          <div className={`${cellFirst} px-5 py-3 text-base font-bold uppercase tracking-wider text-fuchsia-800 bg-gradient-to-r from-fuchsia-500/10 to-fuchsia-600/5 border-y border-fuchsia-200/60 flex items-center gap-2`} style={{ gridColumn: `1 / ${n + 3}` }}>
            <div className="w-2 h-2 rounded-full bg-current" />Domicilio
          </div>
          {[
            { key: 'penalizacionesPct' as keyof DatosTienda, label: '% Penalizaciones' },
            { key: 'montoPenalizado' as keyof DatosTienda, label: 'Monto penalizado' },
            { key: 'tiempoCocina' as keyof DatosTienda, label: 'Tiempo cocina (min)' },
          ].map(({ key, label }) => (
            <div key={key} className="contents">
              <div className={`${cellFirst} px-5 py-3 text-base font-semibold text-gray-700 bg-fuchsia-50/20 flex items-center`}>{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className={cellBase}><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} type={key === 'penalizacionesPct' ? 'percentage' : 'number'} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key), key === 'penalizacionesPct' ? 2 : 0)}</div>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}
