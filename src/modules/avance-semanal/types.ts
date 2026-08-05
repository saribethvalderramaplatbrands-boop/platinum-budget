// Datos de UNA tienda para UNA semana
export interface DatosTienda {
  // === VENTAS (filas 5-9) ===
  ventaNeta: number
  presupuestoVentas: number
  ventas2025: number
  
  // === TRANSACCIONES (filas 11-15) ===
  transaccionesActuales: number
  presupuestoTransacciones: number
  transacciones2025: number
  
  // === TICKET PROMEDIO (filas 16-18) ===
  ticketPromedio: number      // calculado
  presupuestoTicket: number
  
  // === CANALES (filas 20-27) ===
  kioskos: number
  kioskoTrx: number
  localLlevar: number
  localLlevarTrx: number
  autoservicio: number
  autoservicioTrx: number
  domicilio: number
  domicilioTrx: number
  
  // === DAY PART (filas 29-33) ===
  dayPartApertura: number
  dayPart12a3: number
  dayPart3a6: number
  dayPart6a9: number
  dayPart9aCierre: number
  
  // === INFO FINANCIERA (filas 36-44) ===
  borrantes: number
  notasCredito: number
  notasCreditoCantidad: number
  descuentosEmpleados: number
  descuentosJubilados: number
  
  // === ENTRENAMIENTO (filas 46-47) ===
  personalEntrenamiento: number
  theVault: number
  
  // === MANO DE OBRA (filas 49-58) ===
  manpowerAprobado: number
  empleadosActivos: number
  empleadosVacaciones: number
  gerentesActivos: number
  costoManoObra: number
  horasColaboradores: number
  horasInasistencia: number
  horasExtras: number
  
  // === COSTOS (filas 60-66) ===
  costoSemanal: number
  costoTeorico: number
  merma: number
  gap: number
  
  // === CLIENTES (filas 68-74) ===
  tiempoAutoSegundos: number
  tiempoAutoDia: number
  dp1: number
  dp2: number
  dp3: number
  dp4: number
  dp5: number
  
  // === ROCC (filas 76-77) ===
  roccL1: number
  roccL3: number
  
  // === DOMICILIO (filas 79-81) ===
  penalizacionesPct: number
  montoPenalizado: number
  tiempoCocina: number
}

// Totales calculados automáticamente
export interface TotalesCalculados {
  variacionVsPpto: number
  variacion2025: number
  variacionTrxVsPpto: number
  variacionTrx2025: number
  variacionTicketVsPpto: number
  pctKioskos: number
  pctKioskoTrx: number
  pctLocalLlevar: number
  pctLocalLlevarTrx: number
  pctAutoservicio: number
  pctAutoservicioTrx: number
  pctDomicilio: number
  pctDomicilioTrx: number
  pctBorrantes: number
  pctNotasCredito: number
  pctDescEmpleados: number
  pctDescJubilados: number
  pctManoObra: number
  productividad: number
  variacionCosto: number
  pctMerma: number
  pctGap: number
}

export interface RegistroSemanal {
  id?: string
  semana: string        // formato: "2026-W32" o similar
  tiendaCodigo: number
  gerente: string
  regional: string
  datos: DatosTienda
  totales: TotalesCalculados
  creadoEn?: string
}
