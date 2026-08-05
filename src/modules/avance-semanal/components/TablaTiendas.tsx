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
  if (val < -0.05) return 'text-red-600 font-bold'
  if (val < 0) return 'text-red-500'
  if (val > 0.05) return 'text-green-600 font-bold'
  if (val > 0) return 'text-green-500'
  return 'text-gray-500'
}

export default function TablaTiendas({ gerente, tiendas, datos, onUpdateDato }: TablaTiendasProps) {
  const updateDato = useCallback((tiendaIndex: number, campo: keyof DatosTienda, valor: number) => {
    onUpdateDato(tiendaIndex, campo, valor)
  }, [onUpdateDato])

  const colWidth = 280
  const tiendaWidth = 140
  const totalWidth = 140
  const gridTemplate = `${colWidth}px repeat(${tiendas.length}, ${tiendaWidth}px) ${totalWidth}px`

  return (
    <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
      <div className="min-w-max">
        {/* ENCABEZADO */}
        <div className="grid bg-red-700 text-white" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-bold border-r border-red-600">GERENTE: {gerente}</div>
          {tiendas.map(t => (
            <div key={t.codigo} className="px-2 py-2 text-center text-xs font-bold border-r border-red-600">
              <div>{t.nombre}</div>
              <div className="text-red-200 text-[10px]">({t.codigo})</div>
            </div>
          ))}
          <div className="px-2 py-2 text-center text-xs font-bold bg-red-800">TOTAL</div>
        </div>

        {/* VENTAS NETA */}
        <div className="grid bg-gray-100" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-b border-gray-300">VENTAS NETA</div>
          {tiendas.map((_, i) => (
            <div key={i} className="border-r border-b border-gray-300">
              <CeldaInput value={datos[i]?.ventaNeta || 0} onChange={(v) => updateDato(i, 'ventaNeta', v)} />
            </div>
          ))}
          <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-gray-50 border-b border-gray-300">
            {calcularTotalesFila(datos, 'ventaNeta').toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* PRESUPUESTO DE VENTAS */}
        <div className="grid bg-gray-100" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-b border-gray-300">PRESUPUESTO DE VENTAS</div>
          {tiendas.map((_, i) => (
            <div key={i} className="border-r border-b border-gray-300">
              <CeldaInput value={datos[i]?.presupuestoVentas || 0} onChange={(v) => updateDato(i, 'presupuestoVentas', v)} />
            </div>
          ))}
          <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-gray-50 border-b border-gray-300">
            {calcularTotalesFila(datos, 'presupuestoVentas').toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* VARIACIÓN VS PPTO */}
        <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border-r border-b border-gray-200">VARIACIÓN VS PPTO</div>
          {tiendas.map((_, i) => {
            const val = (datos[i]?.presupuestoVentas || 0) > 0 ? ((datos[i]?.ventaNeta || 0) / datos[i].presupuestoVentas) - 1 : 0
            return (
              <div key={i} className={`px-2 py-1.5 text-right text-xs font-mono border-r border-b border-gray-200 ${getColorVariacion(val)}`}>
                {(val * 100).toFixed(2)}%
              </div>
            )
          })}
          <div className={`px-2 py-1.5 text-right text-xs font-mono font-bold border-b border-gray-200 ${getColorVariacion(
            calcularTotalesFila(datos, 'presupuestoVentas') > 0
              ? (calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'presupuestoVentas')) - 1
              : 0
          )}`}>
            {calcularTotalesFila(datos, 'presupuestoVentas') > 0
              ? (((calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'presupuestoVentas')) - 1) * 100).toFixed(2)
              : '0.00'}%
          </div>
        </div>

        {/* VENTAS 2025 */}
        <div className="grid bg-gray-100" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-b border-gray-300">VENTAS 2025</div>
          {tiendas.map((_, i) => (
            <div key={i} className="border-r border-b border-gray-300">
              <CeldaInput value={datos[i]?.ventas2025 || 0} onChange={(v) => updateDato(i, 'ventas2025', v)} />
            </div>
          ))}
          <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-gray-50 border-b border-gray-300">
            {calcularTotalesFila(datos, 'ventas2025').toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* VARIACIÓN 2025 VS 2026 */}
        <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border-r border-b border-gray-200">VARIACIÓN 2025 % VS 2026</div>
          {tiendas.map((_, i) => {
            const val = (datos[i]?.ventas2025 || 0) > 0 ? ((datos[i]?.ventaNeta || 0) / datos[i].ventas2025) - 1 : 0
            return (
              <div key={i} className={`px-2 py-1.5 text-right text-xs font-mono border-r border-b border-gray-200 ${getColorVariacion(val)}`}>
                {(val * 100).toFixed(2)}%
              </div>
            )
          })}
          <div className={`px-2 py-1.5 text-right text-xs font-mono font-bold border-b border-gray-200 ${getColorVariacion(
            calcularTotalesFila(datos, 'ventas2025') > 0
              ? (calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'ventas2025')) - 1
              : 0
          )}`}>
            {calcularTotalesFila(datos, 'ventas2025') > 0
              ? (((calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'ventas2025')) - 1) * 100).toFixed(2)
              : '0.00'}%
          </div>
        </div>

        <div className="h-3 bg-white" />

        {/* TRANSACCIONES */}
        <div className="grid bg-blue-50" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-semibold text-blue-800 border-r border-b border-blue-200">TRANSACCIONES ACTUALES</div>
          {tiendas.map((_, i) => (
            <div key={i} className="border-r border-b border-blue-200">
              <CeldaInput value={datos[i]?.transaccionesActuales || 0} onChange={(v) => updateDato(i, 'transaccionesActuales', v)} />
            </div>
          ))}
          <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-blue-100 border-b border-blue-200">
            {calcularTotalesFila(datos, 'transaccionesActuales').toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
        </div>

        <div className="grid bg-blue-50" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-semibold text-blue-800 border-r border-b border-blue-200">PRESUPUESTO DE TRANSACCIONES</div>
          {tiendas.map((_, i) => (
            <div key={i} className="border-r border-b border-blue-200">
              <CeldaInput value={datos[i]?.presupuestoTransacciones || 0} onChange={(v) => updateDato(i, 'presupuestoTransacciones', v)} />
            </div>
          ))}
          <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-blue-100 border-b border-blue-200">
            {calcularTotalesFila(datos, 'presupuestoTransacciones').toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border-r border-b border-gray-200">VARIACIÓN VS PPTO</div>
          {tiendas.map((_, i) => {
            const val = (datos[i]?.presupuestoTransacciones || 0) > 0 ? ((datos[i]?.transaccionesActuales || 0) / datos[i].presupuestoTransacciones) - 1 : 0
            return (
              <div key={i} className={`px-2 py-1.5 text-right text-xs font-mono border-r border-b border-gray-200 ${getColorVariacion(val)}`}>
                {(val * 100).toFixed(2)}%
              </div>
            )
          })}
          <div className={`px-2 py-1.5 text-right text-xs font-mono font-bold border-b border-gray-200 ${getColorVariacion(
            calcularTotalesFila(datos, 'presupuestoTransacciones') > 0
              ? (calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'presupuestoTransacciones')) - 1
              : 0
          )}`}>
            {calcularTotalesFila(datos, 'presupuestoTransacciones') > 0
              ? (((calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'presupuestoTransacciones')) - 1) * 100).toFixed(2)
              : '0.00'}%
          </div>
        </div>

        <div className="grid bg-blue-50" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-semibold text-blue-800 border-r border-b border-blue-200">TRANSACCIONES 2025</div>
          {tiendas.map((_, i) => (
            <div key={i} className="border-r border-b border-blue-200">
              <CeldaInput value={datos[i]?.transacciones2025 || 0} onChange={(v) => updateDato(i, 'transacciones2025', v)} />
            </div>
          ))}
          <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-blue-100 border-b border-blue-200">
            {calcularTotalesFila(datos, 'transacciones2025').toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border-r border-b border-gray-200">VARIACIÓN 2025 VS 2026</div>
          {tiendas.map((_, i) => {
            const val = (datos[i]?.transacciones2025 || 0) > 0 ? ((datos[i]?.transaccionesActuales || 0) / datos[i].transacciones2025) - 1 : 0
            return (
              <div key={i} className={`px-2 py-1.5 text-right text-xs font-mono border-r border-b border-gray-200 ${getColorVariacion(val)}`}>
                {(val * 100).toFixed(2)}%
              </div>
            )
          })}
          <div className={`px-2 py-1.5 text-right text-xs font-mono font-bold border-b border-gray-200 ${getColorVariacion(
            calcularTotalesFila(datos, 'transacciones2025') > 0
              ? (calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'transacciones2025')) - 1
              : 0
          )}`}>
            {calcularTotalesFila(datos, 'transacciones2025') > 0
              ? (((calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'transacciones2025')) - 1) * 100).toFixed(2)
              : '0.00'}%
          </div>
        </div>

        <div className="h-3 bg-white" />

        {/* TICKET PROM. */}
        <div className="grid bg-purple-50" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-semibold text-purple-800 border-r border-b border-purple-200">TICKET PROM.</div>
          {tiendas.map((_, i) => {
            const val = (datos[i]?.transaccionesActuales || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].transaccionesActuales : 0
            return (
              <div key={i} className="px-2 py-1.5 text-right text-sm font-mono bg-yellow-50 border-r border-b border-purple-200">{val.toFixed(2)}</div>
            )
          })}
          <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-yellow-100 border-b border-purple-200">
            {(() => {
              const totalVenta = calcularTotalesFila(datos, 'ventaNeta')
              const totalTrx = calcularTotalesFila(datos, 'transaccionesActuales')
              return totalTrx > 0 ? (totalVenta / totalTrx).toFixed(2) : '0.00'
            })()}
          </div>
        </div>

        <div className="grid bg-purple-50" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-semibold text-purple-800 border-r border-b border-purple-200">PRESUPUESTO TICKET</div>
          {tiendas.map((_, i) => (
            <div key={i} className="border-r border-b border-purple-200">
              <CeldaInput value={datos[i]?.presupuestoTicket || 0} onChange={(v) => updateDato(i, 'presupuestoTicket', v)} />
            </div>
          ))}
          <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-purple-100 border-b border-purple-200">
            {calcularTotalesFila(datos, 'presupuestoTicket').toFixed(2)}
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border-r border-b border-gray-200">VARIACIÓN VS PPTO</div>
          {tiendas.map((_, i) => {
            const ticket = (datos[i]?.transaccionesActuales || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].transaccionesActuales : 0
            const val = (datos[i]?.presupuestoTicket || 0) > 0 ? (ticket / datos[i].presupuestoTicket) - 1 : 0
            return (
              <div key={i} className={`px-2 py-1.5 text-right text-xs font-mono border-r border-b border-gray-200 ${getColorVariacion(val)}`}>
                {(val * 100).toFixed(2)}%
              </div>
            )
          })}
          <div className={`px-2 py-1.5 text-right text-xs font-mono font-bold border-b border-gray-200 ${getColorVariacion(
            (() => {
              const totalVenta = calcularTotalesFila(datos, 'ventaNeta')
              const totalTrx = calcularTotalesFila(datos, 'transaccionesActuales')
              const totalTicket = totalTrx > 0 ? totalVenta / totalTrx : 0
              const totalPpto = calcularTotalesFila(datos, 'presupuestoTicket')
              return totalPpto > 0 ? (totalTicket / totalPpto) - 1 : 0
            })()
          )}`}>
            {(() => {
              const totalVenta = calcularTotalesFila(datos, 'ventaNeta')
              const totalTrx = calcularTotalesFila(datos, 'transaccionesActuales')
              const totalTicket = totalTrx > 0 ? totalVenta / totalTrx : 0
              const totalPpto = calcularTotalesFila(datos, 'presupuestoTicket')
              return totalPpto > 0 ? (((totalTicket / totalPpto) - 1) * 100).toFixed(2) : '0.00'
            })()}%
          </div>
        </div>

        <div className="h-3 bg-white" />

        {/* CANALES */}
        <div className="grid bg-emerald-50" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-bold text-emerald-800 border-r border-b border-emerald-200 col-span-full">CANALES</div>
        </div>

        {[
          { key: 'kioskos' as keyof DatosTienda, label: 'KIOSKOS ($)' },
          { key: 'kioskoTrx' as keyof DatosTienda, label: 'KIOSKO TRX LOCAL Y LLEVAR' },
          { key: 'localLlevar' as keyof DatosTienda, label: 'VENTA DE LOCAL Y LLEVAR ($)' },
          { key: 'localLlevarTrx' as keyof DatosTienda, label: 'TRX LOCAL Y LLEVAR' },
          { key: 'autoservicio' as keyof DatosTienda, label: 'VENTA AUTOSERVICIO ($)' },
          { key: 'autoservicioTrx' as keyof DatosTienda, label: 'TRX AUTOSERVICIO' },
          { key: 'domicilio' as keyof DatosTienda, label: 'VENTA DE DOMICILIO ($)' },
          { key: 'domicilioTrx' as keyof DatosTienda, label: 'TRX DOMICILIO' },
        ].map(({ key, label }) => (
          <div key={key}>
            <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
              <div className="px-3 py-1.5 text-xs font-medium text-gray-700 border-r border-b border-gray-200">{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className="border-r border-b border-gray-200">
                  <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} />
                </div>
              ))}
              <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-gray-50 border-b border-gray-200">
                {calcularTotalesFila(datos, key).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
              <div className="px-3 py-1 text-xs text-gray-500 bg-gray-50 border-r border-b border-gray-200">%</div>
              {tiendas.map((_, i) => {
                const totalVenta = datos[i]?.ventaNeta || 0
                const totalTrx = datos[i]?.transaccionesActuales || 0
                const val = key.includes('Trx') ? (totalTrx > 0 ? ((datos[i]?.[key] as number) || 0) / totalTrx : 0) : (totalVenta > 0 ? ((datos[i]?.[key] as number) || 0) / totalVenta : 0)
                return (
                  <div key={i} className="px-2 py-1 text-right text-xs font-mono text-gray-600 border-r border-b border-gray-200">{(val * 100).toFixed(2)}%</div>
                )
              })}
              <div className="px-2 py-1 text-right text-xs font-mono font-bold text-gray-600 bg-gray-50 border-b border-gray-200">
                {(() => {
                  const totalVenta = calcularTotalesFila(datos, 'ventaNeta')
                  const totalTrx = calcularTotalesFila(datos, 'transaccionesActuales')
                  const totalConcepto = calcularTotalesFila(datos, key)
                  const val = key.includes('Trx') ? (totalTrx > 0 ? totalConcepto / totalTrx : 0) : (totalVenta > 0 ? totalConcepto / totalVenta : 0)
                  return (val * 100).toFixed(2) + '%'
                })()}
              </div>
            </div>
          </div>
        ))}

        <div className="h-3 bg-white" />

        {/* DAY PART */}
        <div className="grid bg-amber-50" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-bold text-amber-800 border-r border-b border-amber-200 col-span-full">VENTAS POR DAY PART</div>
        </div>

        {[
          { key: 'dayPartApertura' as keyof DatosTienda, label: 'Apertura - 12 MD' },
          { key: 'dayPart12a3' as keyof DatosTienda, label: '12 MD - 3 PM' },
          { key: 'dayPart3a6' as keyof DatosTienda, label: '3 - 6 PM' },
          { key: 'dayPart6a9' as keyof DatosTienda, label: '6 - 9 PM' },
          { key: 'dayPart9aCierre' as keyof DatosTienda, label: '9 PM - Cierre' },
        ].map(({ key, label }) => (
          <div key={key} className="grid" style={{ gridTemplateColumns: gridTemplate }}>
            <div className="px-3 py-1.5 text-xs font-medium text-gray-700 border-r border-b border-gray-200">{label}</div>
            {tiendas.map((_, i) => (
              <div key={i} className="border-r border-b border-gray-200">
                <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} />
              </div>
            ))}
            <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-gray-50 border-b border-gray-200">
              {calcularTotalesFila(datos, key).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}

        <div className="h-3 bg-white" />

        {/* INFO FINANCIERA */}
        <div className="grid bg-orange-50" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-bold text-orange-800 border-r border-b border-orange-200 col-span-full">INFORMACIÓN FINANCIERA</div>
        </div>

        {[
          { key: 'borrantes' as keyof DatosTienda, label: 'Borrantes ($)' },
          { key: 'notasCredito' as keyof DatosTienda, label: 'Notas de crédito ($)' },
          { key: 'notasCreditoCantidad' as keyof DatosTienda, label: 'Número de notas de crédito' },
          { key: 'descuentosEmpleados' as keyof DatosTienda, label: 'Descuentos de empleados ($)' },
          { key: 'descuentosJubilados' as keyof DatosTienda, label: 'Descuentos de jubilados ($)' },
        ].map(({ key, label }) => (
          <div key={key}>
            <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
              <div className="px-3 py-1.5 text-xs font-medium text-gray-700 border-r border-b border-gray-200">{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className="border-r border-b border-gray-200">
                  <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} />
                </div>
              ))}
              <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-gray-50 border-b border-gray-200">
                {calcularTotalesFila(datos, key).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            {key !== 'notasCreditoCantidad' && (
              <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
                <div className="px-3 py-1 text-xs text-gray-500 bg-gray-50 border-r border-b border-gray-200">%</div>
                {tiendas.map((_, i) => {
                  const val = (datos[i]?.ventaNeta || 0) > 0 ? ((datos[i]?.[key] as number) || 0) / datos[i].ventaNeta : 0
                  return (
                    <div key={i} className="px-2 py-1 text-right text-xs font-mono text-gray-600 border-r border-b border-gray-200">{(val * 100).toFixed(3)}%</div>
                  )
                })}
                <div className="px-2 py-1 text-right text-xs font-mono font-bold text-gray-600 bg-gray-50 border-b border-gray-200">
                  {(() => {
                    const totalVenta = calcularTotalesFila(datos, 'ventaNeta')
                    const totalConcepto = calcularTotalesFila(datos, key)
                    return totalVenta > 0 ? ((totalConcepto / totalVenta) * 100).toFixed(3) + '%' : '0.000%'
                  })()}
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="h-3 bg-white" />

        {/* ENTRENAMIENTO */}
        <div className="grid bg-cyan-50" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-bold text-cyan-800 border-r border-b border-cyan-200 col-span-full">ENTRENAMIENTO</div>
        </div>

        {[
          { key: 'personalEntrenamiento' as keyof DatosTienda, label: 'PERSONAL EN ENTRENAMIENTO' },
          { key: 'theVault' as keyof DatosTienda, label: '% THE VAULT' },
        ].map(({ key, label }) => (
          <div key={key} className="grid" style={{ gridTemplateColumns: gridTemplate }}>
            <div className="px-3 py-1.5 text-xs font-medium text-gray-700 border-r border-b border-gray-200">{label}</div>
            {tiendas.map((_, i) => (
              <div key={i} className="border-r border-b border-gray-200">
                <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} type={key === 'theVault' ? 'percentage' : 'number'} />
              </div>
            ))}
            <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-gray-50 border-b border-gray-200">
              {calcularTotalesFila(datos, key).toLocaleString('en-US', { minimumFractionDigits: key === 'theVault' ? 2 : 0 })}
            </div>
          </div>
        ))}

        <div className="h-3 bg-white" />

        {/* MANO DE OBRA */}
        <div className="grid bg-indigo-50" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-bold text-indigo-800 border-r border-b border-indigo-200 col-span-full">MANO DE OBRA</div>
        </div>

        {[
          { key: 'manpowerAprobado' as keyof DatosTienda, label: 'Manpower aprobado' },
          { key: 'empleadosActivos' as keyof DatosTienda, label: 'Empleados Activos' },
          { key: 'empleadosVacaciones' as keyof DatosTienda, label: 'Empleados de vacaciones' },
          { key: 'gerentesActivos' as keyof DatosTienda, label: 'Gerentes Activos' },
          { key: 'costoManoObra' as keyof DatosTienda, label: 'Costo de mano de obra' },
          { key: 'horasColaboradores' as keyof DatosTienda, label: 'Horas Colaboradores' },
          { key: 'horasInasistencia' as keyof DatosTienda, label: 'Número de (hrs) Inasis / Incapac' },
          { key: 'horasExtras' as keyof DatosTienda, label: 'Horas Extras Colaboradores' },
        ].map(({ key, label }) => (
          <div key={key}>
            <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
              <div className="px-3 py-1.5 text-xs font-medium text-gray-700 border-r border-b border-gray-200">{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className="border-r border-b border-gray-200">
                  <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} />
                </div>
              ))}
              <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-gray-50 border-b border-gray-200">
                {calcularTotalesFila(datos, key).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            {key === 'costoManoObra' && (
              <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
                <div className="px-3 py-1 text-xs text-gray-500 bg-gray-50 border-r border-b border-gray-200">% Mano de Obra</div>
                {tiendas.map((_, i) => {
                  const val = (datos[i]?.ventaNeta || 0) > 0 ? (datos[i]?.costoManoObra || 0) / datos[i].ventaNeta : 0
                  return (
                    <div key={i} className="px-2 py-1 text-right text-xs font-mono text-gray-600 border-r border-b border-gray-200">{(val * 100).toFixed(2)}%</div>
                  )
                })}
                <div className="px-2 py-1 text-right text-xs font-mono font-bold text-gray-600 bg-gray-50 border-b border-gray-200">
                  {(() => {
                    const totalVenta = calcularTotalesFila(datos, 'ventaNeta')
                    const totalMO = calcularTotalesFila(datos, 'costoManoObra')
                    return totalVenta > 0 ? ((totalMO / totalVenta) * 100).toFixed(2) + '%' : '0.00%'
                  })()}
                </div>
              </div>
            )}
            {key === 'empleadosActivos' && (
              <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
                <div className="px-3 py-1 text-xs text-gray-500 bg-gray-50 border-r border-b border-gray-200">Productividad</div>
                {tiendas.map((_, i) => {
                  const val = (datos[i]?.empleadosActivos || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].empleadosActivos : 0
                  return (
                    <div key={i} className="px-2 py-1 text-right text-xs font-mono text-gray-600 border-r border-b border-gray-200">{val.toFixed(2)}</div>
                  )
                })}
                <div className="px-2 py-1 text-right text-xs font-mono font-bold text-gray-600 bg-gray-50 border-b border-gray-200">
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

        <div className="h-3 bg-white" />

        {/* COSTOS */}
        <div className="grid bg-rose-50" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-bold text-rose-800 border-r border-b border-rose-200 col-span-full">COSTOS</div>
        </div>

        {[
          { key: 'costoSemanal' as keyof DatosTienda, label: 'Costo Semanal %' },
          { key: 'costoTeorico' as keyof DatosTienda, label: 'Costo Teórico Semanal %' },
        ].map(({ key, label }) => (
          <div key={key} className="grid" style={{ gridTemplateColumns: gridTemplate }}>
            <div className="px-3 py-1.5 text-xs font-medium text-gray-700 border-r border-b border-gray-200">{label}</div>
            {tiendas.map((_, i) => (
              <div key={i} className="border-r border-b border-gray-200">
                <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} type="percentage" />
              </div>
            ))}
            <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-gray-50 border-b border-gray-200">
              {calcularTotalesFila(datos, key).toFixed(2)}%
            </div>
          </div>
        ))}

        <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border-r border-b border-gray-200">Variación %</div>
          {tiendas.map((_, i) => {
            const val = (datos[i]?.costoSemanal || 0) - (datos[i]?.costoTeorico || 0)
            return (
              <div key={i} className={`px-2 py-1.5 text-right text-xs font-mono border-r border-b border-gray-200 ${getColorVariacion(val)}`}>
                {(val * 100).toFixed(2)}%
              </div>
            )
          })}
          <div className={`px-2 py-1.5 text-right text-xs font-mono font-bold border-b border-gray-200 ${getColorVariacion(
            calcularTotalesFila(datos, 'costoSemanal') - calcularTotalesFila(datos, 'costoTeorico')
          )}`}>
            {((calcularTotalesFila(datos, 'costoSemanal') - calcularTotalesFila(datos, 'costoTeorico')) * 100).toFixed(2)}%
          </div>
        </div>

        {[
          { key: 'merma' as keyof DatosTienda, label: 'Merma Semanal' },
          { key: 'gap' as keyof DatosTienda, label: 'DIFERENCIAS NEGATIVAS (GAP)' },
        ].map(({ key, label }) => (
          <div key={key}>
            <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
              <div className="px-3 py-1.5 text-xs font-medium text-gray-700 border-r border-b border-gray-200">{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className="border-r border-b border-gray-200">
                  <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} />
                </div>
              ))}
              <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-gray-50 border-b border-gray-200">
                {calcularTotalesFila(datos, key).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
              <div className="px-3 py-1 text-xs text-gray-500 bg-gray-50 border-r border-b border-gray-200">%</div>
              {tiendas.map((_, i) => {
                const val = (datos[i]?.ventaNeta || 0) > 0 ? ((datos[i]?.[key] as number) || 0) / datos[i].ventaNeta : 0
                return (
                  <div key={i} className="px-2 py-1 text-right text-xs font-mono text-gray-600 border-r border-b border-gray-200">{(val * 100).toFixed(3)}%</div>
                )
              })}
              <div className="px-2 py-1 text-right text-xs font-mono font-bold text-gray-600 bg-gray-50 border-b border-gray-200">
                {(() => {
                  const totalVenta = calcularTotalesFila(datos, 'ventaNeta')
                  const totalConcepto = calcularTotalesFila(datos, key)
                  return totalVenta > 0 ? ((totalConcepto / totalVenta) * 100).toFixed(3) + '%' : '0.000%'
                })()}
              </div>
            </div>
          </div>
        ))}

        <div className="h-3 bg-white" />

        {/* CLIENTES */}
        <div className="grid bg-teal-50" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-bold text-teal-800 border-r border-b border-teal-200 col-span-full">CLIENTES</div>
        </div>

        {[
          { key: 'tiempoAutoSegundos' as keyof DatosTienda, label: 'Tiempos de AUTO DEL DIA (segundos)' },
          { key: 'tiempoAutoDia' as keyof DatosTienda, label: 'Tiempos de AUTO DEL DIA' },
          { key: 'dp1' as keyof DatosTienda, label: 'DP# 1 - Apertura-12 MD' },
          { key: 'dp2' as keyof DatosTienda, label: 'DP# 2 - 12 MD-3 PM' },
          { key: 'dp3' as keyof DatosTienda, label: 'DP# 3 - 3-6 PM' },
          { key: 'dp4' as keyof DatosTienda, label: 'DP# 4 - 6-9 PM' },
          { key: 'dp5' as keyof DatosTienda, label: 'DP# 5 - 9 PM-Cierre' },
        ].map(({ key, label }) => (
          <div key={key} className="grid" style={{ gridTemplateColumns: gridTemplate }}>
            <div className="px-3 py-1.5 text-xs font-medium text-gray-700 border-r border-b border-gray-200">{label}</div>
            {tiendas.map((_, i) => (
              <div key={i} className="border-r border-b border-gray-200">
                <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} />
              </div>
            ))}
            <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-gray-50 border-b border-gray-200">
              {calcularTotalesFila(datos, key).toFixed(2)}
            </div>
          </div>
        ))}

        <div className="h-3 bg-white" />

        {/* ROCC */}
        <div className="grid bg-gray-100" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-bold text-gray-800 border-r border-b border-gray-300 col-span-full">ROCC</div>
        </div>

        {[
          { key: 'roccL1' as keyof DatosTienda, label: 'L1' },
          { key: 'roccL3' as keyof DatosTienda, label: 'L3' },
        ].map(({ key, label }) => (
          <div key={key} className="grid" style={{ gridTemplateColumns: gridTemplate }}>
            <div className="px-3 py-1.5 text-xs font-medium text-gray-700 border-r border-b border-gray-200">{label}</div>
            {tiendas.map((_, i) => (
              <div key={i} className="border-r border-b border-gray-200">
                <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} />
              </div>
            ))}
            <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-gray-50 border-b border-gray-200">
              {calcularTotalesFila(datos, key).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
          </div>
        ))}

        <div className="h-3 bg-white" />

        {/* DOMICILIO */}
        <div className="grid bg-purple-50" style={{ gridTemplateColumns: gridTemplate }}>
          <div className="px-3 py-2 text-xs font-bold text-purple-800 border-r border-b border-purple-200 col-span-full">DOMICILIO</div>
        </div>

        {[
          { key: 'penalizacionesPct' as keyof DatosTienda, label: '% de penalizaciones' },
          { key: 'montoPenalizado' as keyof DatosTienda, label: 'Monto penalizado' },
          { key: 'tiempoCocina' as keyof DatosTienda, label: 'Tiempo de cocina (minutos)' },
        ].map(({ key, label }) => (
          <div key={key} className="grid" style={{ gridTemplateColumns: gridTemplate }}>
            <div className="px-3 py-1.5 text-xs font-medium text-gray-700 border-r border-b border-gray-200">{label}</div>
            {tiendas.map((_, i) => (
              <div key={i} className="border-r border-b border-gray-200">
                <CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} type={key === 'penalizacionesPct' ? 'percentage' : 'number'} />
              </div>
            ))}
            <div className="px-2 py-1.5 text-right text-sm font-mono font-bold bg-gray-50 border-b border-gray-200">
              {calcularTotalesFila(datos, key).toLocaleString('en-US', { minimumFractionDigits: key === 'penalizacionesPct' ? 2 : 0 })}
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
