import { useMemo } from 'react'
import type { DatosTienda, TotalesCalculados } from '../types'

export function calcularTotales(d: DatosTienda): TotalesCalculados {
  const ventaNeta = d.ventaNeta || 0
  const transacciones = d.transaccionesActuales || 0
  const ticketProm = transacciones > 0 ? ventaNeta / transacciones : 0

  return {
    variacionVsPpto: d.presupuestoVentas > 0 ? (ventaNeta / d.presupuestoVentas) - 1 : 0,
    variacion2025: d.ventas2025 > 0 ? (ventaNeta / d.ventas2025) - 1 : 0,
    variacionTrxVsPpto: d.presupuestoTransacciones > 0 ? (transacciones / d.presupuestoTransacciones) - 1 : 0,
    variacionTrx2025: d.transacciones2025 > 0 ? (transacciones / d.transacciones2025) - 1 : 0,
    variacionTicketVsPpto: d.presupuestoTicket > 0 ? (ticketProm / d.presupuestoTicket) - 1 : 0,
    pctKioskos: ventaNeta > 0 ? d.kioskos / ventaNeta : 0,
    pctKioskoTrx: transacciones > 0 ? d.kioskoTrx / transacciones : 0,
    pctLocalLlevar: ventaNeta > 0 ? d.localLlevar / ventaNeta : 0,
    pctLocalLlevarTrx: transacciones > 0 ? d.localLlevarTrx / transacciones : 0,
    pctAutoservicio: ventaNeta > 0 ? d.autoservicio / ventaNeta : 0,
    pctAutoservicioTrx: transacciones > 0 ? d.autoservicioTrx / transacciones : 0,
    pctDomicilio: ventaNeta > 0 ? d.domicilio / ventaNeta : 0,
    pctDomicilioTrx: transacciones > 0 ? d.domicilioTrx / transacciones : 0,
    pctBorrantes: ventaNeta > 0 ? d.borrantes / ventaNeta : 0,
    pctNotasCredito: ventaNeta > 0 ? d.notasCredito / ventaNeta : 0,
    pctDescEmpleados: ventaNeta > 0 ? d.descuentosEmpleados / ventaNeta : 0,
    pctDescJubilados: ventaNeta > 0 ? d.descuentosJubilados / ventaNeta : 0,
    pctManoObra: ventaNeta > 0 ? d.costoManoObra / ventaNeta : 0,
    productividad: d.empleadosActivos > 0 ? ventaNeta / d.empleadosActivos : 0,
    variacionCosto: d.costoSemanal - d.costoTeorico,
    pctMerma: ventaNeta > 0 ? d.merma / ventaNeta : 0,
    pctGap: ventaNeta > 0 ? d.gap / ventaNeta : 0,
  }
}

export function calcularTotalesFila(
  tiendasDatos: DatosTienda[],
  campo: keyof DatosTienda
): number {
  if (tiendasDatos.length === 0) return 0

  // Campos que se suman
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

  // Promedio simple
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

// Calcula el total de una fila de PORCENTAJE basado en totales de cantidad
export function calcularPctFila(totalNumerador: number, totalDenominador: number): number {
  return totalDenominador > 0 ? totalNumerador / totalDenominador : 0
}

export function useCalculadora(datos: DatosTienda[]) {
  return useMemo(() => {
    const porTienda = datos.map(d => calcularTotales(d))
    return { porTienda }
  }, [datos])
}
