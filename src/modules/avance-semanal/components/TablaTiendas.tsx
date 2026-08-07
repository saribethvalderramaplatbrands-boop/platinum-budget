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

const SectionHeader = ({ title, color }: { title: string; color: string }) => {
  const colors: Record<string, string> = {
    red: 'from-red-500/10 to-red-600/5 border-red-200/60 text-red-800',
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-200/60 text-blue-800',
    purple: 'from-violet-500/10 to-violet-600/5 border-violet-200/60 text-violet-800',
    emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-200/60 text-emerald-800',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-200/60 text-amber-800',
    orange: 'from-orange-500/10 to-orange-600/5 border-orange-200/60 text-orange-800',
    cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-200/60 text-cyan-800',
    indigo: 'from-indigo-500/10 to-indigo-600/5 border-indigo-200/60 text-indigo-800',
    rose: 'from-rose-500/10 to-rose-600/5 border-rose-200/60 text-rose-800',
    teal: 'from-teal-500/10 to-teal-600/5 border-teal-200/60 text-teal-800',
    gray: 'from-gray-500/10 to-gray-600/5 border-gray-200/60 text-gray-800',
    fuchsia: 'from-fuchsia-500/10 to-fuchsia-600/5 border-fuchsia-200/60 text-fuchsia-800',
  }
  return (
    <div className={"grid bg-gradient-to-r " + (colors[color] || colors.gray) + " border-y"} style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
      <div className="px-5 py-3 text-base font-bold uppercase tracking-wider col-span-full flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-current" />
        {title}
      </div>
    </div>
  )
}

export default function TablaTiendas({ gerente, tiendas, datos, onUpdateDato }: TablaTiendasProps) {
  const updateDato = useCallback((tiendaIndex: number, campo: keyof DatosTienda, valor: number) => {
    onUpdateDato(tiendaIndex, campo, valor)
  }, [onUpdateDato])

  const n = tiendas.length
  // Columnas más anchas para que quepan los nombres completos
  const gridCols = "minmax(240px, 1.2fr) repeat(" + n + ", minmax(150px, 1fr)) minmax(140px, 1fr)"

  return (
    <div className="rounded-3xl border border-gray-200/60 shadow-[0_8px_40px_rgba(0,0,0,0.06)] bg-white overflow-hidden">
      {/* FIX: overflow-auto + max-h para que el scroll sea DENTRO de la tabla y el header se quede pegado */}
      <div className="overflow-auto max-h-[calc(100vh-260px)]">
        <div className="min-w-full" style={{ ['--grid-cols' as any]: gridCols }}>

          {/* HEADER ROJO KFC — STICKY DENTRO DEL SCROLL DE LA TABLA */}
          <div className="grid sticky top-0 z-30 bg-gradient-to-r from-red-600 to-red-700 text-white" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
            <div className="px-4 py-4 text-sm font-bold border-r border-white/10 flex items-center">
              <span className="opacity-90">GERENTE:</span> <span className="ml-1.5">{gerente}</span>
            </div>
            {tiendas.map(t => (
              <div key={t.codigo} className="px-2 py-3 text-center border-r border-white/10 flex flex-col items-center justify-center">
                {/* Nombre completo, sin código duplicado, texto pequeño con wrap */}
                <div className="text-[11px] font-bold leading-tight whitespace-normal">
                  {t.nombre.replace('KFC ', '')}
                </div>
              </div>
            ))}
            <div className="px-2 py-3 text-center text-sm font-bold bg-black/10 flex items-center justify-center">TOTAL</div>
          </div>

          {/* VENTAS */}
          <SectionHeader title="Ventas" color="red" />
          {[
            { key: 'ventaNeta' as keyof DatosTienda, label: 'Ventas Neta', bg: 'bg-red-50/30' },
            { key: 'presupuestoVentas' as keyof DatosTienda, label: 'Presupuesto Ventas', bg: 'bg-red-50/30' },
          ].map(({ key, label, bg }) => (
            <div key={key} className="grid hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
              <div className={"px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-100 " + bg + " flex items-center"}>{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className="border-r border-gray-100"><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key))}</div>
            </div>
          ))}
          <div className="grid" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
            <div className="px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60 border-r border-gray-100">Variación vs PPTO</div>
            {tiendas.map((_, i) => {
              const val = (datos[i]?.presupuestoVentas || 0) > 0 ? ((datos[i]?.ventaNeta || 0) / datos[i].presupuestoVentas) - 1 : 0
              return <div key={i} className={"px-4 py-3 text-right text-base border-r border-gray-100 " + getColorVariacion(val)}>{(val * 100).toFixed(2)}%</div>
            })}
            <div className={"px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 " + getColorVariacion(calcularTotalesFila(datos, 'presupuestoVentas') > 0 ? (calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'presupuestoVentas')) - 1 : 0)}>
              {calcularTotalesFila(datos, 'presupuestoVentas') > 0 ? (((calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'presupuestoVentas')) - 1) * 100).toFixed(2) : '0.00'}%
            </div>
          </div>
          {[
            { key: 'ventas2025' as keyof DatosTienda, label: 'Ventas 2025', bg: 'bg-red-50/30' },
          ].map(({ key, label, bg }) => (
            <div key={key} className="grid hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
              <div className={"px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-100 " + bg + " flex items-center"}>{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className="border-r border-gray-100"><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key))}</div>
            </div>
          ))}
          <div className="grid" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
            <div className="px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60 border-r border-gray-100">Variación 2025 vs 2026</div>
            {tiendas.map((_, i) => {
              const val = (datos[i]?.ventas2025 || 0) > 0 ? ((datos[i]?.ventaNeta || 0) / datos[i].ventas2025) - 1 : 0
              return <div key={i} className={"px-4 py-3 text-right text-base border-r border-gray-100 " + getColorVariacion(val)}>{(val * 100).toFixed(2)}%</div>
            })}
            <div className={"px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 " + getColorVariacion(calcularTotalesFila(datos, 'ventas2025') > 0 ? (calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'ventas2025')) - 1 : 0)}>
              {calcularTotalesFila(datos, 'ventas2025') > 0 ? (((calcularTotalesFila(datos, 'ventaNeta') / calcularTotalesFila(datos, 'ventas2025')) - 1) * 100).toFixed(2) : '0.00'}%
            </div>
          </div>

          {/* TRANSACCIONES */}
          <SectionHeader title="Transacciones" color="blue" />
          {[
            { key: 'transaccionesActuales' as keyof DatosTienda, label: 'Transacciones Actuales', bg: 'bg-blue-50/30' },
            { key: 'presupuestoTransacciones' as keyof DatosTienda, label: 'Presupuesto Transacciones', bg: 'bg-blue-50/30' },
          ].map(({ key, label, bg }) => (
            <div key={key} className="grid hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
              <div className={"px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-100 " + bg + " flex items-center"}>{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className="border-r border-gray-100"><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key), 0)}</div>
            </div>
          ))}
          <div className="grid" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
            <div className="px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60 border-r border-gray-100">Variación vs PPTO</div>
            {tiendas.map((_, i) => {
              const val = (datos[i]?.presupuestoTransacciones || 0) > 0 ? ((datos[i]?.transaccionesActuales || 0) / datos[i].presupuestoTransacciones) - 1 : 0
              return <div key={i} className={"px-4 py-3 text-right text-base border-r border-gray-100 " + getColorVariacion(val)}>{(val * 100).toFixed(2)}%</div>
            })}
            <div className={"px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 " + getColorVariacion(calcularTotalesFila(datos, 'presupuestoTransacciones') > 0 ? (calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'presupuestoTransacciones')) - 1 : 0)}>
              {calcularTotalesFila(datos, 'presupuestoTransacciones') > 0 ? (((calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'presupuestoTransacciones')) - 1) * 100).toFixed(2) : '0.00'}%
            </div>
          </div>
          {[
            { key: 'transacciones2025' as keyof DatosTienda, label: 'Transacciones 2025', bg: 'bg-blue-50/30' },
          ].map(({ key, label, bg }) => (
            <div key={key} className="grid hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
              <div className={"px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-100 " + bg + " flex items-center"}>{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className="border-r border-gray-100"><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key), 0)}</div>
            </div>
          ))}
          <div className="grid" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
            <div className="px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60 border-r border-gray-100">Variación 2025 vs 2026</div>
            {tiendas.map((_, i) => {
              const val = (datos[i]?.transacciones2025 || 0) > 0 ? ((datos[i]?.transaccionesActuales || 0) / datos[i].transacciones2025) - 1 : 0
              return <div key={i} className={"px-4 py-3 text-right text-base border-r border-gray-100 " + getColorVariacion(val)}>{(val * 100).toFixed(2)}%</div>
            })}
            <div className={"px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 " + getColorVariacion(calcularTotalesFila(datos, 'transacciones2025') > 0 ? (calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'transacciones2025')) - 1 : 0)}>
              {calcularTotalesFila(datos, 'transacciones2025') > 0 ? (((calcularTotalesFila(datos, 'transaccionesActuales') / calcularTotalesFila(datos, 'transacciones2025')) - 1) * 100).toFixed(2) : '0.00'}%
            </div>
          </div>

          {/* TICKET PROMEDIO */}
          <SectionHeader title="Ticket Promedio" color="purple" />
          <div className="grid hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
            <div className="px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-100 bg-violet-50/30 flex items-center">Ticket Prom.</div>
            {tiendas.map((_, i) => {
              const val = (datos[i]?.transaccionesActuales || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].transaccionesActuales : 0
              return <div key={i} className="px-4 py-3 text-right text-base bg-amber-50/40 border-r border-gray-100">{formatValor('presupuestoTicket', val)}</div>
            })}
            <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-amber-50/60">
              {(() => { const tv = calcularTotalesFila(datos, 'ventaNeta'); const tx = calcularTotalesFila(datos, 'transaccionesActuales'); return tx > 0 ? formatValor('presupuestoTicket', tv / tx) : '$0.00'; })()}
            </div>
          </div>
          <div className="grid hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
            <div className="px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-100 bg-violet-50/30 flex items-center">Presupuesto Ticket</div>
            {tiendas.map((_, i) => (
              <div key={i} className="border-r border-gray-100"><CeldaInput value={datos[i]?.presupuestoTicket || 0} onChange={(v) => updateDato(i, 'presupuestoTicket', v)} campo="presupuestoTicket" /></div>
            ))}
            <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor('presupuestoTicket', calcularTotalesFila(datos, 'presupuestoTicket'))}</div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
            <div className="px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60 border-r border-gray-100">Variación vs PPTO</div>
            {tiendas.map((_, i) => {
              const ticket = (datos[i]?.transaccionesActuales || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].transaccionesActuales : 0
              const val = (datos[i]?.presupuestoTicket || 0) > 0 ? (ticket / datos[i].presupuestoTicket) - 1 : 0
              return <div key={i} className={"px-4 py-3 text-right text-base border-r border-gray-100 " + getColorVariacion(val)}>{(val * 100).toFixed(2)}%</div>
            })}
            <div className={"px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 " + getColorVariacion((() => { const tv = calcularTotalesFila(datos, 'ventaNeta'); const tx = calcularTotalesFila(datos, 'transaccionesActuales'); const tt = tx > 0 ? tv / tx : 0; const tp = calcularTotalesFila(datos, 'presupuestoTicket'); return tp > 0 ? (tt / tp) - 1 : 0; })())}>
              {(() => { const tv = calcularTotalesFila(datos, 'ventaNeta'); const tx = calcularTotalesFila(datos, 'transaccionesActuales'); const tt = tx > 0 ? tv / tx : 0; const tp = calcularTotalesFila(datos, 'presupuestoTicket'); return tp > 0 ? (((tt / tp) - 1) * 100).toFixed(2) : '0.00'; })()}%
            </div>
          </div>

          {/* CANALES */}
          <SectionHeader title="Canales" color="emerald" />
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
              <div className="grid hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
                <div className="px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-100 bg-emerald-50/20 flex items-center">{label}</div>
                {tiendas.map((_, i) => (
                  <div key={i} className="border-r border-gray-100"><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
                ))}
                <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key))}</div>
              </div>
              <div className="grid" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
                <div className="px-5 py-2 text-sm text-gray-400 bg-gray-50/40 border-r border-gray-100">%</div>
                {tiendas.map((_, i) => {
                  const totalVenta = datos[i]?.ventaNeta || 0
                  const totalTrx = datos[i]?.transaccionesActuales || 0
                  const val = (key as string).includes('Trx') ? (totalTrx > 0 ? ((datos[i]?.[key] as number) || 0) / totalTrx : 0) : (totalVenta > 0 ? ((datos[i]?.[key] as number) || 0) / totalVenta : 0)
                  return <div key={i} className="px-4 py-2 text-right text-sm text-gray-500 border-r border-gray-100">{(val * 100).toFixed(2)}%</div>
                })}
                <div className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40">
                  {(() => { const totalVenta = calcularTotalesFila(datos, 'ventaNeta'); const totalTrx = calcularTotalesFila(datos, 'transaccionesActuales'); const totalConcepto = calcularTotalesFila(datos, key); const val = (key as string).includes('Trx') ? (totalTrx > 0 ? totalConcepto / totalTrx : 0) : (totalVenta > 0 ? totalConcepto / totalVenta : 0); return (val * 100).toFixed(2) + '%'; })()}
                </div>
              </div>
            </div>
          ))}

          {/* DAY PART */}
          <SectionHeader title="Ventas por Day Part" color="amber" />
          {[
            { key: 'dayPartApertura' as keyof DatosTienda, label: 'Apertura - 12 MD' },
            { key: 'dayPart12a3' as keyof DatosTienda, label: '12 MD - 3 PM' },
            { key: 'dayPart3a6' as keyof DatosTienda, label: '3 - 6 PM' },
            { key: 'dayPart6a9' as keyof DatosTienda, label: '6 - 9 PM' },
            { key: 'dayPart9aCierre' as keyof DatosTienda, label: '9 PM - Cierre' },
          ].map(({ key, label }) => (
            <div key={key} className="grid hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
              <div className="px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-100 bg-amber-50/20 flex items-center">{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className="border-r border-gray-100"><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key))}</div>
            </div>
          ))}

          {/* INFO FINANCIERA */}
          <SectionHeader title="Información Financiera" color="orange" />
          {[
            { key: 'borrantes' as keyof DatosTienda, label: 'Borrantes ($)' },
            { key: 'notasCredito' as keyof DatosTienda, label: 'Notas de crédito ($)' },
            { key: 'notasCreditoCantidad' as keyof DatosTienda, label: 'N° notas de crédito' },
            { key: 'descuentosEmpleados' as keyof DatosTienda, label: 'Desc. empleados ($)' },
            { key: 'descuentosJubilados' as keyof DatosTienda, label: 'Desc. jubilados ($)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <div className="grid hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
                <div className="px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-100 bg-orange-50/20 flex items-center">{label}</div>
                {tiendas.map((_, i) => (
                  <div key={i} className="border-r border-gray-100"><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
                ))}
                <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key), key === 'notasCreditoCantidad' ? 0 : 2)}</div>
              </div>
              {key !== 'notasCreditoCantidad' && (
                <div className="grid" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
                  <div className="px-5 py-2 text-sm text-gray-400 bg-gray-50/40 border-r border-gray-100">%</div>
                  {tiendas.map((_, i) => {
                    const val = (datos[i]?.ventaNeta || 0) > 0 ? ((datos[i]?.[key] as number) || 0) / datos[i].ventaNeta : 0
                    return <div key={i} className="px-4 py-2 text-right text-sm text-gray-500 border-r border-gray-100">{(val * 100).toFixed(3)}%</div>
                  })}
                  <div className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40">
                    {(() => { const totalVenta = calcularTotalesFila(datos, 'ventaNeta'); const totalConcepto = calcularTotalesFila(datos, key); return totalVenta > 0 ? ((totalConcepto / totalVenta) * 100).toFixed(3) + '%' : '0.000%'; })()}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* ENTRENAMIENTO */}
          <SectionHeader title="Entrenamiento" color="cyan" />
          {[
            { key: 'personalEntrenamiento' as keyof DatosTienda, label: 'Personal en entrenamiento' },
            { key: 'theVault' as keyof DatosTienda, label: '% The Vault' },
          ].map(({ key, label }) => (
            <div key={key} className="grid hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
              <div className="px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-100 bg-cyan-50/20 flex items-center">{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className="border-r border-gray-100"><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} type={key === 'theVault' ? 'percentage' : 'number'} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key), key === 'theVault' ? 2 : 0)}</div>
            </div>
          ))}

          {/* MANO DE OBRA */}
          <SectionHeader title="Mano de Obra" color="indigo" />
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
              <div className="grid hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
                <div className="px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-100 bg-indigo-50/20 flex items-center">{label}</div>
                {tiendas.map((_, i) => (
                  <div key={i} className="border-r border-gray-100"><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
                ))}
                <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key))}</div>
              </div>
              {key === 'costoManoObra' && (
                <div className="grid" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
                  <div className="px-5 py-2 text-sm text-gray-400 bg-gray-50/40 border-r border-gray-100">% Mano de Obra</div>
                  {tiendas.map((_, i) => {
                    const val = (datos[i]?.ventaNeta || 0) > 0 ? (datos[i]?.costoManoObra || 0) / datos[i].ventaNeta : 0
                    return <div key={i} className="px-4 py-2 text-right text-sm text-gray-500 border-r border-gray-100">{(val * 100).toFixed(2)}%</div>
                  })}
                  <div className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40">
                    {(() => { const totalVenta = calcularTotalesFila(datos, 'ventaNeta'); const totalMO = calcularTotalesFila(datos, 'costoManoObra'); return totalVenta > 0 ? ((totalMO / totalVenta) * 100).toFixed(2) + '%' : '0.00%'; })()}
                  </div>
                </div>
              )}
              {key === 'empleadosActivos' && (
                <div className="grid" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
                  <div className="px-5 py-2 text-sm text-gray-400 bg-gray-50/40 border-r border-gray-100">Productividad</div>
                  {tiendas.map((_, i) => {
                    const val = (datos[i]?.empleadosActivos || 0) > 0 ? (datos[i]?.ventaNeta || 0) / datos[i].empleadosActivos : 0
                    return <div key={i} className="px-4 py-2 text-right text-sm text-gray-500 border-r border-gray-100">{val.toFixed(2)}</div>
                  })}
                  <div className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40">
                    {(() => { const totalVenta = calcularTotalesFila(datos, 'ventaNeta'); const totalEmp = calcularTotalesFila(datos, 'empleadosActivos'); return totalEmp > 0 ? (totalVenta / totalEmp).toFixed(2) : '0.00'; })()}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* COSTOS */}
          <SectionHeader title="Costos" color="rose" />
          {[
            { key: 'costoSemanal' as keyof DatosTienda, label: 'Costo Semanal %' },
            { key: 'costoTeorico' as keyof DatosTienda, label: 'Costo Teórico %' },
          ].map(({ key, label }) => (
            <div key={key} className="grid hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
              <div className="px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-100 bg-rose-50/20 flex items-center">{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className="border-r border-gray-100"><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} type="percentage" campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{calcularTotalesFila(datos, key).toFixed(2)}%</div>
            </div>
          ))}
          <div className="grid" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
            <div className="px-5 py-2.5 text-base font-medium text-gray-500 bg-gray-50/60 border-r border-gray-100">Variación %</div>
            {tiendas.map((_, i) => {
              const val = (datos[i]?.costoSemanal || 0) - (datos[i]?.costoTeorico || 0)
              return <div key={i} className={"px-4 py-3 text-right text-base border-r border-gray-100 " + getColorVariacion(val)}>{(val * 100).toFixed(2)}%</div>
            })}
            <div className={"px-4 py-2.5 text-right text-base font-bold bg-gray-50/60 " + getColorVariacion(calcularTotalesFila(datos, 'costoSemanal') - calcularTotalesFila(datos, 'costoTeorico'))}>
              {((calcularTotalesFila(datos, 'costoSemanal') - calcularTotalesFila(datos, 'costoTeorico')) * 100).toFixed(2)}%
            </div>
          </div>
          {[
            { key: 'merma' as keyof DatosTienda, label: 'Merma Semanal' },
            { key: 'gap' as keyof DatosTienda, label: 'Diferencias Negativas (GAP)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <div className="grid hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
                <div className="px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-100 bg-rose-50/20 flex items-center">{label}</div>
                {tiendas.map((_, i) => (
                  <div key={i} className="border-r border-gray-100"><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
                ))}
                <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key))}</div>
              </div>
              <div className="grid" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
                <div className="px-5 py-2 text-sm text-gray-400 bg-gray-50/40 border-r border-gray-100">%</div>
                {tiendas.map((_, i) => {
                  const val = (datos[i]?.ventaNeta || 0) > 0 ? ((datos[i]?.[key] as number) || 0) / datos[i].ventaNeta : 0
                  return <div key={i} className="px-4 py-2 text-right text-sm text-gray-500 border-r border-gray-100">{(val * 100).toFixed(3)}%</div>
                })}
                <div className="px-4 py-2 text-right text-sm font-bold text-gray-500 bg-gray-50/40">
                  {(() => { const totalVenta = calcularTotalesFila(datos, 'ventaNeta'); const totalConcepto = calcularTotalesFila(datos, key); return totalVenta > 0 ? ((totalConcepto / totalVenta) * 100).toFixed(3) + '%' : '0.000%'; })()}
                </div>
              </div>
            </div>
          ))}

          {/* CLIENTES */}
          <SectionHeader title="Clientes" color="teal" />
          {[
            { key: 'tiempoAutoSegundos' as keyof DatosTienda, label: 'Tiempo Auto (seg)' },
            { key: 'tiempoAutoDia' as keyof DatosTienda, label: 'Tiempo Auto (día)' },
            { key: 'dp1' as keyof DatosTienda, label: 'DP#1 Apertura-12MD' },
            { key: 'dp2' as keyof DatosTienda, label: 'DP#2 12MD-3PM' },
            { key: 'dp3' as keyof DatosTienda, label: 'DP#3 3-6PM' },
            { key: 'dp4' as keyof DatosTienda, label: 'DP#4 6-9PM' },
            { key: 'dp5' as keyof DatosTienda, label: 'DP#5 9PM-Cierre' },
          ].map(({ key, label }) => (
            <div key={key} className="grid hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
              <div className="px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-100 bg-teal-50/20 flex items-center">{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className="border-r border-gray-100"><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{calcularTotalesFila(datos, key).toFixed(2)}</div>
            </div>
          ))}

          {/* ROCC */}
          <SectionHeader title="ROCC" color="gray" />
          {[
            { key: 'roccL1' as keyof DatosTienda, label: 'L1' },
            { key: 'roccL3' as keyof DatosTienda, label: 'L3' },
          ].map(({ key, label }) => (
            <div key={key} className="grid hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
              <div className="px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-100 bg-gray-50/40 flex items-center">{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className="border-r border-gray-100"><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{calcularTotalesFila(datos, key).toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
            </div>
          ))}

          {/* DOMICILIO */}
          <SectionHeader title="Domicilio" color="fuchsia" />
          {[
            { key: 'penalizacionesPct' as keyof DatosTienda, label: '% Penalizaciones' },
            { key: 'montoPenalizado' as keyof DatosTienda, label: 'Monto penalizado' },
            { key: 'tiempoCocina' as keyof DatosTienda, label: 'Tiempo cocina (min)' },
          ].map(({ key, label }) => (
            <div key={key} className="grid hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: 'var(--grid-cols)' }}>
              <div className="px-5 py-3 text-base font-semibold text-gray-700 border-r border-gray-100 bg-fuchsia-50/20 flex items-center">{label}</div>
              {tiendas.map((_, i) => (
                <div key={i} className="border-r border-gray-100"><CeldaInput value={datos[i]?.[key] as number || 0} onChange={(v) => updateDato(i, key, v)} type={key === 'penalizacionesPct' ? 'percentage' : 'number'} campo={key} /></div>
              ))}
              <div className="px-4 py-2.5 text-right text-base font-bold text-gray-800 bg-gray-50/50">{formatValor(key as string, calcularTotalesFila(datos, key), key === 'penalizacionesPct' ? 2 : 0)}</div>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}
