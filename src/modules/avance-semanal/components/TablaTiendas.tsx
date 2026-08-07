import { useCallback, Fragment } from 'react'
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
const W_TOTAL = 120
const W_TIENDA_MIN = 130

export default function TablaTiendas({ gerente, tiendas, datos, onUpdateDato }: TablaTiendasProps) {
  const updateDato = useCallback((tiendaIndex: number, campo: keyof DatosTienda, valor: number) => {
    onUpdateDato(tiendaIndex, campo, valor)
  }, [onUpdateDato])

  const n = tiendas.length
  // Ancho por tienda: si hay pocas, se expanden; si hay muchas, scroll
  const tiendaWidth = n > 0 ? `calc((100% - ${W_FIRST + W_TOTAL}px) / ${n})` : 'auto'

  // ---- Helpers de filas ----

  const StickyLabel = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <td
      className={`sticky left-0 z-20 border-r border-gray-200 whitespace-nowrap ${className}`}
      style={{ minWidth: W_FIRST, width: W_FIRST, position: 'sticky', left: 0 }}
    >
      {children}
    </td>
  )

  // Header de sección: primera celda sticky con texto, las demás celdas vacías con fondo
  const HeaderSeccion = ({ titulo, color, bg, border }: { titulo: string, color: string, bg: string, border: string }) => (
    <tr>
      <StickyLabel className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider ${color} ${bg} ${border} border-y`}>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-2 align-middle" />
        {titulo}
      </StickyLabel>
      {tiendas.map((_, i) => (
        <td key={i} className={`${bg} ${border} border-y`} style={{ minWidth: W_TIENDA_MIN, width: tiendaWidth }} />
      ))}
      <td className={`${bg} ${border} border-y`} style={{ minWidth: W_TOTAL, width: W_TOTAL }} />
    </tr>
  )

  const FilaEditable = ({ label, campo, bgClass = '', digits = 2, type }: { label: string, campo: keyof DatosTienda, bgClass?: string, digits?: number, type?: 'number' | 'percentage' }) => (
    <tr className={bgClass}>
      <StickyLabel className="px-5 py-3 text-sm font-semibold text-gray-700 bg-white">
        {label}
      </StickyLabel>
      {tiendas.map((_, i) => (
        <td key={i} className="border-r border-gray-200 bg-white" style={{ minWidth: W_TIENDA_MIN, width: tiendaWidth }}>
          <CeldaInput value={datos[i]?.[campo] as number || 0} onChange={(v) => updateDato(i, campo, v)} campo={campo} type={type} />
        </td>
      ))}
      <td className="px-4 py-2.5 text-right text-sm font-bold text-gray-800 bg-gray-50/50 whitespace-nowrap" style={{ minWidth: W_TOTAL, width: W_TOTAL }}>
        {formatValor(campo as string, calcularTotalesFila(datos, campo), digits)}
      </td>
    </tr>
  )

  const FilaVariacion = ({ label, valores, totalVal }: { label: string, valores: number[], totalVal: number }) => (
    <tr className="bg-gray-50/60">
      <StickyLabel className="px-5 py-2.5 text-sm font-medium text-gray-500 bg-gray-50/60">
        {label}
      </StickyLabel>
      {valores.map((val, i) => (
        <td key={i} className="px-4 py-2.5 text-right text-sm border-r border-gray-200" style={{ minWidth: W_TIENDA_MIN, width: tiendaWidth }}>
          <span className={getColorVariacion(val)}>{(val * 100).toFixed(2)}%</span>
        </td>
      ))}
      <td className="px-4 py-2.5 text-right text-sm font-bold whitespace-nowrap" style={{ minWidth: W_TOTAL, width: W_TOTAL }}>
        <span className={getColorVariacion(totalVal)}>{(totalVal * 100).toFixed(2)}%</span>
      </td>
    </tr>
  )

  const FilaPorcentaje = ({ label, valores, totalVal, digits = 2 }: { label: string, valores: number[], totalVal: number, digits?: number }) => (
    <tr className="bg-gray-50/40">
      <StickyLabel className="px-5 py-2 text-sm text-gray-400 bg-gray-50/40">
        {label}
      </StickyLabel>
      {valores.map((val, i) => (
        <td key={i} className="px-4 py-2 text-right text-sm text-gray-500 border-r border-gray-200" style={{ minWidth: W_TIENDA_MIN, width: tiendaWidth }}>
          {(val * 100).toFixed(digits)}%
        </td>
      ))}
      <td className="px-4 py-2 text-right text-sm font-bold text-gray-500 whitespace-nowrap" style={{ minWidth: W_TOTAL, width: W_TOTAL }}>
        {(totalVal * 100).toFixed(digits)}%
      </td>
    </tr>
  )

  const FilaValor = ({ label, valores, totalVal }: { label: string, valores: string[], totalVal: string }) => (
    <tr>
      <StickyLabel className="px-5 py-3 text-sm font-semibold text-gray-700 bg-white">
        {label}
      </StickyLabel>
      {valores.map((val, i) => (
        <td key={i} className="px-4 py-2.5 text-right text-sm bg-amber-50/40 border-r border-gray-200" style={{ minWidth: W_TIENDA_MIN, width: tiendaWidth }}>
          {val}
        </td>
      ))}
      <td className="px-4 py-2.5 text-right text-sm font-bold text-gray-800 bg-amber-50/60 whitespace-nowrap" style={{ minWidth: W_TOTAL, width: W_TOTAL }}>
        {totalVal}
      </td>
    </tr>
  )

  return (
    <div className="rounded-2xl border border-gray-200/60 shadow-[0_8px_40px_rgba(0,0,0,0.06)] bg-white overflow-hidden">
      <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        <table className="border-separate border-spacing-0 w-full" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th
                className="sticky top-0 left-0 z-30 px-4 py-3 text-xs font-bold text-white text-left bg-gradient-to-r from-red-600 to-red-700 border-r border-red-400/30 rounded-tl-2xl whitespace-nowrap"
                style={{ minWidth: W_FIRST, width: W_FIRST, position: 'sticky', top: 0, left: 0 }}
              >
                <span className="opacity-90">GERENTE:</span> <span className="ml-1">{gerente}</span>
              </th>
              {tiendas.map(t => (
                <th
                  key={t.codigo}
                  className="sticky top-0 z-20 px-2 py-3 text-center text-[11px] font-bold text-white bg-gradient-to-r from-red-600 to-red-700 border-r border-red-400/30 align-middle"
                  style={{ minWidth: W_TIENDA_MIN, width: tiendaWidth, position: 'sticky', top: 0 }}
                >
                  {t.nombre.replace('KFC ', '')}
                </th>
              ))}
              <th
                className="sticky top-0 z-20 px-2 py-3 text-center text-xs font-bold text-white bg-red-800 rounded-tr-2xl whitespace-nowrap align-middle"
                style={{ minWidth: W_TOTAL, width: W_TOTAL, position: 'sticky', top: 0 }}
              >
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody>
            {/* ===== VENTAS ===== */}
            <HeaderSeccion titulo="Ventas" color="text-red-800" bg="bg-red-50" border="border-red-200" />
            <FilaEditable label="Ventas Neta" campo="ventaNeta" bgClass="bg-red-50/30" />
            <FilaEditable label="Presupuesto Ventas" campo="presupuestoVentas" bgClass="bg-red-50/30" />
            <FilaVariacion
              label="Variación vs PPTO"
              valores={tiendas.map((_, i) => (datos[i]?.presupuestoVentas || 0) > 0 ? ((datos[i]?.ventaNeta || 0) / datos[i].presupuestoVentas) - 1 : 0)}
              totalVal={calcularTotalesFila(datos, 'presupuestoVentas') > 0 ? (calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'presupuestoVentas')) - 1 : 0}
            />
            <FilaEditable label="Ventas 2025" campo="ventas2025" bgClass="bg-red-50/30" />
            <FilaVariacion
              label="Variación 2025 vs 2026"
              valores={tiendas.map((_, i) => (datos[i]?.ventas2025 || 0) > 0 ? ((datos[i]?.ventaNeta || 0) / datos[i].ventas2025) - 1 : 0)}
              totalVal={calcularTotalesFila(datos, 'ventas2025') > 0 ? (calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'ventas2025')) - 1 : 0}
            />

            {/* ===== TRANSACCIONES ===== */}
            <HeaderSeccion titulo="Transacciones" color="text-blue-800" bg="bg-blue-50" border="border-blue-200" />
            <FilaEditable label="Transacciones Actuales" campo="transaccionesActuales" bgClass="bg-blue-50/30" digits={0} />
            <FilaEditable label="Presupuesto Transacciones" campo="presupuestoTransacciones" bgClass="bg-blue-50/30" digits={0} />
            <FilaVariacion
              label="Variación vs PPTO"
              valores={tiendas.map((_, i) => (datos[i]?.presupuestoTransacciones || 0) > 0 ? ((datos[i]?.transaccionesActuales || 0) / datos[i].presupuestoTransacciones) - 1 : 0)}
              totalVal={calcularTotalesFila(datos, 'presupuestoTransacciones') > 0 ? (calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'presupuestoTransacciones')) - 1 : 0}
            />
            <FilaEditable label="Transacciones 2025" campo="transacciones2025" bgClass="bg-blue-50/30" digits={0} />
            <FilaVariacion
              label="Variación 2025 vs 2026"
              valores={tiendas.map((_, i) => (datos[i]?.transacciones2025 || 0) > 0 ? ((datos[i]?.transaccionesActuales || 0) / datos[i].transacciones2025) - 1 : 0)}
              totalVal={calcularTotalesFila(datos, 'transacciones2025') > 0 ? (calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'transacciones2025')) - 1 : 0}
            />

            {/* ===== TICKET PROMEDIO ===== */}
            <HeaderSeccion titulo="Ticket Promedio" color="text-violet-800" bg="bg-violet-50" border="border-violet-200" />
            <FilaValor
              label="Ticket Prom."
              valores={tiendas.map((_, i) => {
                const val = (datos[i]?.transaccionesActuales || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].transaccionesActuales : 0
                return formatValor('presupuestoTicket', val)
              })}
              totalVal={(() => {
                const tv = calcularTotalesFila(datos, 'ventaNeta')
                const tx = calcularTotalesFila(datos, 'transaccionesActuales')
                return tx > 0 ? formatValor('presupuestoTicket', tv / tx) : '$0.00'
              })()}
            />
            <FilaEditable label="Presupuesto Ticket" campo="presupuestoTicket" bgClass="bg-violet-50/30" />
            <FilaVariacion
              label="Variación vs PPTO"
              valores={tiendas.map((_, i) => {
                const ticket = (datos[i]?.transaccionesActuales || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].transaccionesActuales : 0
                return (datos[i]?.presupuestoTicket || 0) > 0 ? (ticket / datos[i].presupuestoTicket) - 1 : 0
              })}
              totalVal={(() => {
                const tv = calcularTotalesFila(datos, 'ventaNeta')
                const tx = calcularTotalesFila(datos, 'transaccionesActuales')
                const tt = tx > 0 ? tv / tx : 0
                const tp = calcularTotalesFila(datos, 'presupuestoTicket')
                return tp > 0 ? (tt / tp) - 1 : 0
              })()}
            />

            {/* ===== CANALES ===== */}
            <HeaderSeccion titulo="Canales" color="text-emerald-800" bg="bg-emerald-50" border="border-emerald-200" />
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
              <Fragment key={key as string}>
                <FilaEditable label={label} campo={key} bgClass="bg-emerald-50/20" digits={(key as string).includes('Trx') ? 0 : 2} />
                <FilaPorcentaje
                  label="%"
                  valores={tiendas.map((_, i) => {
                    const totalVenta = datos[i]?.ventaNeta || 0
                    const totalTrx = datos[i]?.transaccionesActuales || 0
                    return (key as string).includes('Trx')
                      ? (totalTrx > 0 ? ((datos[i]?.[key] as number) || 0) / totalTrx : 0)
                      : (totalVenta > 0 ? ((datos[i]?.[key] as number) || 0) / totalVenta : 0)
                  })}
                  totalVal={(() => {
                    const totalVenta = calcularTotalesFila(datos, 'ventaNeta')
                    const totalTrx = calcularTotalesFila(datos, 'transaccionesActuales')
                    const totalConcepto = calcularTotalesFila(datos, key)
                    return (key as string).includes('Trx')
                      ? (totalTrx > 0 ? totalConcepto / totalTrx : 0)
                      : (totalVenta > 0 ? totalConcepto / totalVenta : 0)
                  })()}
                />
              </Fragment>
            ))}

            {/* ===== DAY PART ===== */}
            <HeaderSeccion titulo="Ventas por Day Part" color="text-amber-800" bg="bg-amber-50" border="border-amber-200" />
            {[
              { key: 'dayPartApertura' as keyof DatosTienda, label: 'Apertura - 12 MD' },
              { key: 'dayPart12a3' as keyof DatosTienda, label: '12 MD - 3 PM' },
              { key: 'dayPart3a6' as keyof DatosTienda, label: '3 - 6 PM' },
              { key: 'dayPart6a9' as keyof DatosTienda, label: '6 - 9 PM' },
              { key: 'dayPart9aCierre' as keyof DatosTienda, label: '9 PM - Cierre' },
            ].map(({ key, label }) => (
              <FilaEditable key={key as string} label={label} campo={key} bgClass="bg-amber-50/20" />
            ))}

            {/* ===== INFO FINANCIERA ===== */}
            <HeaderSeccion titulo="Información Financiera" color="text-orange-800" bg="bg-orange-50" border="border-orange-200" />
            {[
              { key: 'borrantes' as keyof DatosTienda, label: 'Borrantes ($)' },
              { key: 'notasCredito' as keyof DatosTienda, label: 'Notas de crédito ($)' },
              { key: 'notasCreditoCantidad' as keyof DatosTienda, label: 'N° notas de crédito' },
              { key: 'descuentosEmpleados' as keyof DatosTienda, label: 'Desc. empleados ($)' },
              { key: 'descuentosJubilados' as keyof DatosTienda, label: 'Desc. jubilados ($)' },
            ].map(({ key, label }) => (
              <Fragment key={key as string}>
                <FilaEditable label={label} campo={key} bgClass="bg-orange-50/20" digits={key === 'notasCreditoCantidad' ? 0 : 2} />
                {key !== 'notasCreditoCantidad' && (
                  <FilaPorcentaje
                    label="%"
                    valores={tiendas.map((_, i) => (datos[i]?.ventaNeta || 0) > 0 ? ((datos[i]?.[key] as number) || 0) / datos[i].ventaNeta : 0)}
                    totalVal={(() => {
                      const totalVenta = calcularTotalesFila(datos, 'ventaNeta')
                      const totalConcepto = calcularTotalesFila(datos, key)
                      return totalVenta > 0 ? totalConcepto / totalVenta : 0
                    })()}
                    digits={3}
                  />
                )}
              </Fragment>
            ))}

            {/* ===== ENTRENAMIENTO ===== */}
            <HeaderSeccion titulo="Entrenamiento" color="text-cyan-800" bg="bg-cyan-50" border="border-cyan-200" />
            <FilaEditable label="Personal en entrenamiento" campo="personalEntrenamiento" bgClass="bg-cyan-50/20" digits={0} />
            <tr className="bg-cyan-50/20">
              <StickyLabel className="px-5 py-3 text-sm font-semibold text-gray-700 bg-white">
                % The Vault
              </StickyLabel>
              {tiendas.map((_, i) => (
                <td key={i} className="border-r border-gray-200 bg-white" style={{ minWidth: W_TIENDA_MIN, width: tiendaWidth }}>
                  <CeldaInput value={datos[i]?.theVault || 0} onChange={(v) => updateDato(i, 'theVault', v)} campo="theVault" type="percentage" />
                </td>
              ))}
              <td className="px-4 py-2.5 text-right text-sm font-bold text-gray-800 bg-gray-50/50 whitespace-nowrap" style={{ minWidth: W_TOTAL, width: W_TOTAL }}>
                {calcularTotalesFila(datos, 'theVault').toFixed(2)}%
              </td>
            </tr>

            {/* ===== MANO DE OBRA ===== */}
            <HeaderSeccion titulo="Mano de Obra" color="text-indigo-800" bg="bg-indigo-50" border="border-indigo-200" />
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
              <Fragment key={key as string}>
                <FilaEditable label={label} campo={key} bgClass="bg-indigo-50/20" />
                {key === 'costoManoObra' && (
                  <FilaPorcentaje
                    label="% Mano de Obra"
                    valores={tiendas.map((_, i) => (datos[i]?.ventaNeta || 0) > 0 ? (datos[i]?.costoManoObra || 0) / datos[i].ventaNeta : 0)}
                    totalVal={(() => {
                      const totalVenta = calcularTotalesFila(datos, 'ventaNeta')
                      const totalMO = calcularTotalesFila(datos, 'costoManoObra')
                      return totalVenta > 0 ? totalMO / totalVenta : 0
                    })()}
                  />
                )}
                {key === 'empleadosActivos' && (
                  <tr>
                    <StickyLabel className="px-5 py-2 text-sm text-gray-400 bg-gray-50/40">
                      Productividad
                    </StickyLabel>
                    {tiendas.map((_, i) => {
                      const val = (datos[i]?.empleadosActivos || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].empleadosActivos : 0
                      return (
                        <td key={i} className="px-4 py-2 text-right text-sm text-gray-500 border-r border-gray-200" style={{ minWidth: W_TIENDA_MIN, width: tiendaWidth }}>
                          {val.toFixed(2)}
                        </td>
                      )
                    })}
                    <td className="px-4 py-2 text-right text-sm font-bold text-gray-500 whitespace-nowrap" style={{ minWidth: W_TOTAL, width: W_TOTAL }}>
                      {(() => {
                        const totalVenta = calcularTotalesFila(datos, 'ventaNeta')
                        const totalEmp = calcularTotalesFila(datos, 'empleadosActivos')
                        return totalEmp > 0 ? (totalVenta / totalEmp).toFixed(2) : '0.00'
                      })()}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}

            {/* ===== COSTOS ===== */}
            <HeaderSeccion titulo="Costos" color="text-rose-800" bg="bg-rose-50" border="border-rose-200" />
            <FilaEditable label="Costo Semanal %" campo="costoSemanal" bgClass="bg-rose-50/20" type="percentage" />
            <FilaEditable label="Costo Teórico %" campo="costoTeorico" bgClass="bg-rose-50/20" type="percentage" />
            <FilaVariacion
              label="Variación %"
              valores={tiendas.map((_, i) => (datos[i]?.costoSemanal || 0) - (datos[i]?.costoTeorico || 0))}
              totalVal={calcularTotalesFila(datos, 'costoSemanal') - calcularTotalesFila(datos, 'costoTeorico')}
            />
            {[
              { key: 'merma' as keyof DatosTienda, label: 'Merma Semanal' },
              { key: 'gap' as keyof DatosTienda, label: 'Diferencias Negativas (GAP)' },
            ].map(({ key, label }) => (
              <Fragment key={key as string}>
                <FilaEditable label={label} campo={key} bgClass="bg-rose-50/20" />
                <FilaPorcentaje
                  label="%"
                  valores={tiendas.map((_, i) => (datos[i]?.ventaNeta || 0) > 0 ? ((datos[i]?.[key] as number) || 0) / datos[i].ventaNeta : 0)}
                  totalVal={(() => {
                    const totalVenta = calcularTotalesFila(datos, 'ventaNeta')
                    const totalConcepto = calcularTotalesFila(datos, key)
                    return totalVenta > 0 ? totalConcepto / totalVenta : 0
                  })()}
                  digits={3}
                />
              </Fragment>
            ))}

            {/* ===== CLIENTES ===== */}
            <HeaderSeccion titulo="Clientes" color="text-teal-800" bg="bg-teal-50" border="border-teal-200" />
            {[
              { key: 'tiempoAutoSegundos' as keyof DatosTienda, label: 'Tiempo Auto (seg)' },
              { key: 'tiempoAutoDia' as keyof DatosTienda, label: 'Tiempo Auto (día)' },
              { key: 'dp1' as keyof DatosTienda, label: 'DP#1 Apertura-12MD' },
              { key: 'dp2' as keyof DatosTienda, label: 'DP#2 12MD-3PM' },
              { key: 'dp3' as keyof DatosTienda, label: 'DP#3 3-6PM' },
              { key: 'dp4' as keyof DatosTienda, label: 'DP#4 6-9PM' },
              { key: 'dp5' as keyof DatosTienda, label: 'DP#5 9PM-Cierre' },
            ].map(({ key, label }) => (
              <tr key={key as string}>
                <StickyLabel className="px-5 py-3 text-sm font-semibold text-gray-700 bg-white">
                  {label}
                </StickyLabel>
                {tiendas.map((_, i) => (
                  <td key={i} className="border-r border-gray-200 bg-white" style={{ minWidth: W_TIENDA_MIN, width: tiendaWidth }}>
                    <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} />
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right text-sm font-bold text-gray-800 bg-gray-50/50 whitespace-nowrap" style={{ minWidth: W_TOTAL, width: W_TOTAL }}>
                  {calcularTotalesFila(datos, key).toFixed(2)}
                </td>
              </tr>
            ))}

            {/* ===== ROCC ===== */}
            <HeaderSeccion titulo="ROCC" color="text-gray-800" bg="bg-gray-100" border="border-gray-200" />
            {[
              { key: 'roccL1' as keyof DatosTienda, label: 'L1' },
              { key: 'roccL3' as keyof DatosTienda, label: 'L3' },
            ].map(({ key, label }) => (
              <tr key={key as string}>
                <StickyLabel className="px-5 py-3 text-sm font-semibold text-gray-700 bg-white">
                  {label}
                </StickyLabel>
                {tiendas.map((_, i) => (
                  <td key={i} className="border-r border-gray-200 bg-white" style={{ minWidth: W_TIENDA_MIN, width: tiendaWidth }}>
                    <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} />
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right text-sm font-bold text-gray-800 bg-gray-50/50 whitespace-nowrap" style={{ minWidth: W_TOTAL, width: W_TOTAL }}>
                  {calcularTotalesFila(datos, key).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </td>
              </tr>
            ))}

            {/* ===== DOMICILIO ===== */}
            <HeaderSeccion titulo="Domicilio" color="text-fuchsia-800" bg="bg-fuchsia-50" border="border-fuchsia-200" />
            <tr>
              <StickyLabel className="px-5 py-3 text-sm font-semibold text-gray-700 bg-white">
                % Penalizaciones
              </StickyLabel>
              {tiendas.map((_, i) => (
                <td key={i} className="border-r border-gray-200 bg-white" style={{ minWidth: W_TIENDA_MIN, width: tiendaWidth }}>
                  <CeldaInput value={datos[i]?.penalizacionesPct || 0} onChange={(v) => updateDato(i, 'penalizacionesPct', v)} campo="penalizacionesPct" type="percentage" />
                </td>
              ))}
              <td className="px-4 py-2.5 text-right text-sm font-bold text-gray-800 bg-gray-50/50 whitespace-nowrap" style={{ minWidth: W_TOTAL, width: W_TOTAL }}>
                {calcularTotalesFila(datos, 'penalizacionesPct').toFixed(2)}%
              </td>
            </tr>
            <FilaEditable label="Monto penalizado" campo="montoPenalizado" bgClass="bg-fuchsia-50/20" />
            <tr>
              <StickyLabel className="px-5 py-3 text-sm font-semibold text-gray-700 bg-white">
                Tiempo cocina (min)
              </StickyLabel>
              {tiendas.map((_, i) => (
                <td key={i} className="border-r border-gray-200 bg-white" style={{ minWidth: W_TIENDA_MIN, width: tiendaWidth }}>
                  <CeldaInput value={datos[i]?.tiempoCocina || 0} onChange={(v) => updateDato(i, 'tiempoCocina', v)} campo="tiempoCocina" />
                </td>
              ))}
              <td className="px-4 py-2.5 text-right text-sm font-bold text-gray-800 bg-gray-50/50 whitespace-nowrap" style={{ minWidth: W_TOTAL, width: W_TOTAL }}>
                {calcularTotalesFila(datos, 'tiempoCocina').toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
