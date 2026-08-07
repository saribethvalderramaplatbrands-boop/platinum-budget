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
  const totalCols = n + 2 // primera columna + n tiendas + total
  const gridTemplate = `${W_FIRST}px repeat(${n}, ${W_TIENDA}px) ${W_TOTAL}px`
  const totalWidth = W_FIRST + (n * W_TIENDA) + W_TOTAL

  // Helper para crear una fila de datos editable
  const FilaEditable = ({ label, campo, bg = '', digits = 2, type }: { label: string, campo: keyof DatosTienda, bg?: string, digits?: number, type?: 'number' | 'percentage' }) => (
    <div className="contents">
      <div className={`sticky left-0 z-20 border-r border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 ${bg} flex items-center bg-white`}>
        {label}
      </div>
      {tiendas.map((_, i) => (
        <div key={i} className="border-r border-gray-200 bg-white">
          <CeldaInput value={datos[i]?.[campo] as number || 0} onChange={(v) => updateDato(i, campo, v)} campo={campo} type={type} />
        </div>
      ))}
      <div className="px-4 py-2.5 text-right text-sm font-bold text-gray-800 bg-gray-50/50">
        {formatValor(campo as string, calcularTotalesFila(datos, campo), digits)}
      </div>
    </div>
  )

  // Helper para fila de variación porcentual
  const FilaVariacion = ({ label, valores, totalVal }: { label: string, valores: number[], totalVal: number }) => (
    <div className="contents">
      <div className="sticky left-0 z-20 border-r border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-500 bg-gray-50/60 flex items-center">
        {label}
      </div>
      {valores.map((val, i) => (
        <div key={i} className={`px-4 py-2.5 text-right text-sm ${getColorVariacion(val)}`}>
          {(val * 100).toFixed(2)}%
        </div>
      ))}
      <div className={`px-4 py-2.5 text-right text-sm font-bold bg-gray-50/60 ${getColorVariacion(totalVal)}`}>
        {(totalVal * 100).toFixed(2)}%
      </div>
    </div>
  )

  // Helper para fila de porcentaje calculado (ej. % de canal)
  const FilaPorcentaje = ({ label, valores, totalVal, digits = 2 }: { label: string, valores: number[], totalVal: number, digits?: number }) => (
    <div className="contents">
      <div className="sticky left-0 z-20 border-r border-gray-200 px-5 py-2 text-sm text-gray-400 bg-gray-50/40 flex items-center">
        {label}
      </div>
      {valores.map((val, i) => (
        <div key={i} className="px-4 py-2 text-right text-sm text-gray-500">
          {(val * 100).toFixed(digits)}%
        </div>
      ))}
      <div className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40">
        {(totalVal * 100).toFixed(digits)}%
      </div>
    </div>
  )

  // Helper para header de sección
  const HeaderSeccion = ({ titulo, colorClass, bgClass, borderClass }: { titulo: string, colorClass: string, bgClass: string, borderClass: string }) => (
    <div className="contents">
      <div
        style={{ gridColumn: `1 / ${totalCols + 1}` }}
        className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider ${colorClass} ${bgClass} ${borderClass} border-y flex items-center gap-2`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-current" />
        {titulo}
      </div>
    </div>
  )

  return (
    <div className="rounded-2xl border border-gray-200/60 shadow-[0_8px_40px_rgba(0,0,0,0.06)] bg-white overflow-hidden">
      <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: gridTemplate,
            width: totalWidth,
          }}
        >
          {/* ===== HEADER ROJO ===== */}
          <div className="contents">
            <div className="sticky top-0 left-0 z-50 border-r border-red-400/30 px-4 py-3 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-700 flex items-center rounded-tl-2xl">
              <span className="opacity-90">GERENTE:</span>
              <span className="ml-1.5">{gerente}</span>
            </div>
            {tiendas.map(t => (
              <div key={t.codigo} className="sticky top-0 z-40 border-r border-red-400/30 px-2 py-3 text-center text-[11px] font-bold text-white bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center leading-tight">
                {t.nombre.replace('KFC ', '')}
              </div>
            ))}
            <div className="sticky top-0 z-40 px-2 py-3 text-center text-xs font-bold text-white bg-red-800 rounded-tr-2xl flex items-center justify-center">
              TOTAL
            </div>
          </div>

          {/* ===== VENTAS ===== */}
          <HeaderSeccion titulo="Ventas" colorClass="text-red-800" bgClass="bg-red-50" borderClass="border-red-200" />
          <FilaEditable label="Ventas Neta" campo="ventaNeta" bg="bg-red-50/30" />
          <FilaEditable label="Presupuesto Ventas" campo="presupuestoVentas" bg="bg-red-50/30" />
          <FilaVariacion
            label="Variación vs PPTO"
            valores={tiendas.map((_, i) => (datos[i]?.presupuestoVentas || 0) > 0 ? ((datos[i]?.ventaNeta || 0) / datos[i].presupuestoVentas) - 1 : 0)}
            totalVal={calcularTotalesFila(datos, 'presupuestoVentas') > 0 ? (calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'presupuestoVentas')) - 1 : 0}
          />
          <FilaEditable label="Ventas 2025" campo="ventas2025" bg="bg-red-50/30" />
          <FilaVariacion
            label="Variación 2025 vs 2026"
            valores={tiendas.map((_, i) => (datos[i]?.ventas2025 || 0) > 0 ? ((datos[i]?.ventaNeta || 0) / datos[i].ventas2025) - 1 : 0)}
            totalVal={calcularTotalesFila(datos, 'ventas2025') > 0 ? (calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'ventas2025')) - 1 : 0}
          />

          {/* ===== TRANSACCIONES ===== */}
          <HeaderSeccion titulo="Transacciones" colorClass="text-blue-800" bgClass="bg-blue-50" borderClass="border-blue-200" />
          <FilaEditable label="Transacciones Actuales" campo="transaccionesActuales" bg="bg-blue-50/30" digits={0} />
          <FilaEditable label="Presupuesto Transacciones" campo="presupuestoTransacciones" bg="bg-blue-50/30" digits={0} />
          <FilaVariacion
            label="Variación vs PPTO"
            valores={tiendas.map((_, i) => (datos[i]?.presupuestoTransacciones || 0) > 0 ? ((datos[i]?.transaccionesActuales || 0) / datos[i].presupuestoTransacciones) - 1 : 0)}
            totalVal={calcularTotalesFila(datos, 'presupuestoTransacciones') > 0 ? (calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'presupuestoTransacciones')) - 1 : 0}
          />
          <FilaEditable label="Transacciones 2025" campo="transacciones2025" bg="bg-blue-50/30" digits={0} />
          <FilaVariacion
            label="Variación 2025 vs 2026"
            valores={tiendas.map((_, i) => (datos[i]?.transacciones2025 || 0) > 0 ? ((datos[i]?.transaccionesActuales || 0) / datos[i].transacciones2025) - 1 : 0)}
            totalVal={calcularTotalesFila(datos, 'transacciones2025') > 0 ? (calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'transacciones2025')) - 1 : 0}
          />

          {/* ===== TICKET PROMEDIO ===== */}
          <HeaderSeccion titulo="Ticket Promedio" colorClass="text-violet-800" bgClass="bg-violet-50" borderClass="border-violet-200" />
          <div className="contents">
            <div className="sticky left-0 z-20 border-r border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 bg-violet-50/30 flex items-center bg-white">
              Ticket Prom.
            </div>
            {tiendas.map((_, i) => {
              const val = (datos[i]?.transaccionesActuales || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].transaccionesActuales : 0
              return (
                <div key={i} className="px-4 py-2.5 text-right text-sm bg-amber-50/40">
                  {formatValor('presupuestoTicket', val)}
                </div>
              )
            })}
            <div className="px-4 py-2.5 text-right text-sm font-bold text-gray-800 bg-amber-50/60">
              {(() => {
                const tv = calcularTotalesFila(datos, 'ventaNeta')
                const tx = calcularTotalesFila(datos, 'transaccionesActuales')
                return tx > 0 ? formatValor('presupuestoTicket', tv / tx) : '$0.00'
              })()}
            </div>
          </div>
          <FilaEditable label="Presupuesto Ticket" campo="presupuestoTicket" bg="bg-violet-50/30" />
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
          <HeaderSeccion titulo="Canales" colorClass="text-emerald-800" bgClass="bg-emerald-50" borderClass="border-emerald-200" />
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
              <FilaEditable label={label} campo={key} bg="bg-emerald-50/20" digits={(key as string).includes('Trx') ? 0 : 2} />
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
            </div>
          ))}

          {/* ===== DAY PART ===== */}
          <HeaderSeccion titulo="Ventas por Day Part" colorClass="text-amber-800" bgClass="bg-amber-50" borderClass="border-amber-200" />
          {[
            { key: 'dayPartApertura' as keyof DatosTienda, label: 'Apertura - 12 MD' },
            { key: 'dayPart12a3' as keyof DatosTienda, label: '12 MD - 3 PM' },
            { key: 'dayPart3a6' as keyof DatosTienda, label: '3 - 6 PM' },
            { key: 'dayPart6a9' as keyof DatosTienda, label: '6 - 9 PM' },
            { key: 'dayPart9aCierre' as keyof DatosTienda, label: '9 PM - Cierre' },
          ].map(({ key, label }) => (
            <FilaEditable key={key} label={label} campo={key} bg="bg-amber-50/20" />
          ))}

          {/* ===== INFO FINANCIERA ===== */}
          <HeaderSeccion titulo="Información Financiera" colorClass="text-orange-800" bgClass="bg-orange-50" borderClass="border-orange-200" />
          {[
            { key: 'borrantes' as keyof DatosTienda, label: 'Borrantes ($)' },
            { key: 'notasCredito' as keyof DatosTienda, label: 'Notas de crédito ($)' },
            { key: 'notasCreditoCantidad' as keyof DatosTienda, label: 'N° notas de crédito' },
            { key: 'descuentosEmpleados' as keyof DatosTienda, label: 'Desc. empleados ($)' },
            { key: 'descuentosJubilados' as keyof DatosTienda, label: 'Desc. jubilados ($)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <FilaEditable label={label} campo={key} bg="bg-orange-50/20" digits={key === 'notasCreditoCantidad' ? 0 : 2} />
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
            </div>
          ))}

          {/* ===== ENTRENAMIENTO ===== */}
          <HeaderSeccion titulo="Entrenamiento" colorClass="text-cyan-800" bgClass="bg-cyan-50" borderClass="border-cyan-200" />
          <FilaEditable label="Personal en entrenamiento" campo="personalEntrenamiento" bg="bg-cyan-50/20" digits={0} />
          <div className="contents">
            <div className="sticky left-0 z-20 border-r border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 bg-cyan-50/20 flex items-center bg-white">
              % The Vault
            </div>
            {tiendas.map((_, i) => (
              <div key={i} className="border-r border-gray-200 bg-white">
                <CeldaInput value={datos[i]?.theVault || 0} onChange={(v) => updateDato(i, 'theVault', v)} campo="theVault" type="percentage" />
              </div>
            ))}
            <div className="px-4 py-2.5 text-right text-sm font-bold text-gray-800 bg-gray-50/50">
              {calcularTotalesFila(datos, 'theVault').toFixed(2)}%
            </div>
          </div>

          {/* ===== MANO DE OBRA ===== */}
          <HeaderSeccion titulo="Mano de Obra" colorClass="text-indigo-800" bgClass="bg-indigo-50" borderClass="border-indigo-200" />
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
              <FilaEditable label={label} campo={key} bg="bg-indigo-50/20" />
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
                <div className="contents">
                  <div className="sticky left-0 z-20 border-r border-gray-200 px-5 py-2 text-sm text-gray-400 bg-gray-50/40 flex items-center bg-white">
                    Productividad
                  </div>
                  {tiendas.map((_, i) => {
                    const val = (datos[i]?.empleadosActivos || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].empleadosActivos : 0
                    return <div key={i} className="px-4 py-2 text-right text-sm text-gray-500">{val.toFixed(2)}</div>
                  })}
                  <div className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40">
                    {(() => {
                      const totalVenta = calcularTotalesFila(datos, 'ventaNeta')
                      const totalEmp = calcularTotalesFila(datos, 'empleadosActivos')
                      return totalEmp > 0 ? (totalVenta / totalEmp).toFixed(2) : '0.00'
                    })()}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* ===== COSTOS ===== */}
          <HeaderSeccion titulo="Costos" colorClass="text-rose-800" bgClass="bg-rose-50" borderClass="border-rose-200" />
          <FilaEditable label="Costo Semanal %" campo="costoSemanal" bg="bg-rose-50/20" type="percentage" />
          <FilaEditable label="Costo Teórico %" campo="costoTeorico" bg="bg-rose-50/20" type="percentage" />
          <FilaVariacion
            label="Variación %"
            valores={tiendas.map((_, i) => (datos[i]?.costoSemanal || 0) - (datos[i]?.costoTeorico || 0))}
            totalVal={calcularTotalesFila(datos, 'costoSemanal') - calcularTotalesFila(datos, 'costoTeorico')}
          />
          {[
            { key: 'merma' as keyof DatosTienda, label: 'Merma Semanal' },
            { key: 'gap' as keyof DatosTienda, label: 'Diferencias Negativas (GAP)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <FilaEditable label={label} campo={key} bg="bg-rose-50/20" />
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
            </div>
          ))}

          {/* ===== CLIENTES ===== */}
          <HeaderSeccion titulo="Clientes" colorClass="text-teal-800" bgClass="bg-teal-50" borderClass="border-teal-200" />
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
              <div className="sticky left-0 z-20 border-r border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 bg-teal-50/20 flex items-center bg-white">
                {label}
              </div>
              {tiendas.map((_, i) => (
                <div key={i} className="border-r border-gray-200 bg-white">
                  <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} />
                </div>
              ))}
              <div className="px-4 py-2.5 text-right text-sm font-bold text-gray-800 bg-gray-50/50">
                {calcularTotalesFila(datos, key).toFixed(2)}
              </div>
            </div>
          ))}

          {/* ===== ROCC ===== */}
          <HeaderSeccion titulo="ROCC" colorClass="text-gray-800" bgClass="bg-gray-100" borderClass="border-gray-200" />
          {[
            { key: 'roccL1' as keyof DatosTienda, label: 'L1' },
            { key: 'roccL3' as keyof DatosTienda, label: 'L3' },
          ].map(({ key, label }) => (
            <div key={key} className="contents">
              <div className="sticky left-0 z-20 border-r border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 bg-gray-50/40 flex items-center bg-white">
                {label}
              </div>
              {tiendas.map((_, i) => (
                <div key={i} className="border-r border-gray-200 bg-white">
                  <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} />
                </div>
              ))}
              <div className="px-4 py-2.5 text-right text-sm font-bold text-gray-800 bg-gray-50/50">
                {calcularTotalesFila(datos, key).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
            </div>
          ))}

          {/* ===== DOMICILIO ===== */}
          <HeaderSeccion titulo="Domicilio" colorClass="text-fuchsia-800" bgClass="bg-fuchsia-50" borderClass="border-fuchsia-200" />
          <div className="contents">
            <div className="sticky left-0 z-20 border-r border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 bg-fuchsia-50/20 flex items-center bg-white">
              % Penalizaciones
            </div>
            {tiendas.map((_, i) => (
              <div key={i} className="border-r border-gray-200 bg-white">
                <CeldaInput value={datos[i]?.penalizacionesPct || 0} onChange={(v) => updateDato(i, 'penalizacionesPct', v)} campo="penalizacionesPct" type="percentage" />
              </div>
            ))}
            <div className="px-4 py-2.5 text-right text-sm font-bold text-gray-800 bg-gray-50/50">
              {calcularTotalesFila(datos, 'penalizacionesPct').toFixed(2)}%
            </div>
          </div>
          <FilaEditable label="Monto penalizado" campo="montoPenalizado" bg="bg-fuchsia-50/20" />
          <div className="contents">
            <div className="sticky left-0 z-20 border-r border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 bg-fuchsia-50/20 flex items-center bg-white">
              Tiempo cocina (min)
            </div>
            {tiendas.map((_, i) => (
              <div key={i} className="border-r border-gray-200 bg-white">
                <CeldaInput value={datos[i]?.tiempoCocina || 0} onChange={(v) => updateDato(i, 'tiempoCocina', v)} campo="tiempoCocina" />
              </div>
            ))}
            <div className="px-4 py-2.5 text-right text-sm font-bold text-gray-800 bg-gray-50/50">
              {calcularTotalesFila(datos, 'tiempoCocina').toFixed(2)}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
