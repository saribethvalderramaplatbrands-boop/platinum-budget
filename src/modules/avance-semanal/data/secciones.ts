export interface CampoFormulario {
  key: keyof import('../types').DatosTienda
  label: string
  type: 'number' | 'percentage' | 'text'
  calculado?: boolean
  formula?: string
  readonly?: boolean
}

export interface Seccion {
  id: string
  titulo: string
  color: string
  bgColor: string
  campos: CampoFormulario[]
}

export const SECCIONES: Seccion[] = [
  {
    id: 'ventas',
    titulo: 'VENTAS',
    color: '#dc2626',
    bgColor: '#fef2f2',
    campos: [
      { key: 'ventaNeta', label: 'VENTAS NETA', type: 'number' },
      { key: 'presupuestoVentas', label: 'PRESUPUESTO DE VENTAS', type: 'number' },
      { key: 'ventas2025', label: 'VENTAS 2025', type: 'number' },
    ]
  },
  {
    id: 'transacciones',
    titulo: 'TRANSACCIONES',
    color: '#2563eb',
    bgColor: '#eff6ff',
    campos: [
      { key: 'transaccionesActuales', label: 'TRANSACCIONES ACTUALES', type: 'number' },
      { key: 'presupuestoTransacciones', label: 'PRESUPUESTO DE TRANSACCIONES', type: 'number' },
      { key: 'transacciones2025', label: 'TRANSACCIONES 2025', type: 'number' },
    ]
  },
  {
    id: 'ticket',
    titulo: 'TICKET PROMEDIO',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    campos: [
      { key: 'ticketPromedio', label: 'TICKET PROM.', type: 'number', calculado: true },
      { key: 'presupuestoTicket', label: 'PRESUPUESTO TICKET', type: 'number' },
    ]
  },
  {
    id: 'canales',
    titulo: 'CANALES',
    color: '#059669',
    bgColor: '#ecfdf5',
    campos: [
      { key: 'kioskos', label: 'KIOSKOS ($)', type: 'number' },
      { key: 'kioskoTrx', label: 'KIOSKO TRX LOCAL Y LLEVAR', type: 'number' },
      { key: 'localLlevar', label: 'VENTA DE LOCAL Y LLEVAR ($)', type: 'number' },
      { key: 'localLlevarTrx', label: 'TRX LOCAL Y LLEVAR', type: 'number' },
      { key: 'autoservicio', label: 'VENTA AUTOSERVICIO ($)', type: 'number' },
      { key: 'autoservicioTrx', label: 'TRX AUTOSERVICIO', type: 'number' },
      { key: 'domicilio', label: 'VENTA DE DOMICILIO ($)', type: 'number' },
      { key: 'domicilioTrx', label: 'TRX DOMICILIO', type: 'number' },
    ]
  },
  {
    id: 'daypart',
    titulo: 'VENTAS POR DAY PART',
    color: '#d97706',
    bgColor: '#fffbeb',
    campos: [
      { key: 'dayPartApertura', label: 'Apertura - 12 MD', type: 'number' },
      { key: 'dayPart12a3', label: '12 MD - 3 PM', type: 'number' },
      { key: 'dayPart3a6', label: '3 - 6 PM', type: 'number' },
      { key: 'dayPart6a9', label: '6 - 9 PM', type: 'number' },
      { key: 'dayPart9aCierre', label: '9 PM - Cierre', type: 'number' },
    ]
  },
  {
    id: 'financiera',
    titulo: 'INFORMACIÓN FINANCIERA',
    color: '#ea580c',
    bgColor: '#fff7ed',
    campos: [
      { key: 'borrantes', label: 'Borrantes ($)', type: 'number' },
      { key: 'notasCredito', label: 'Notas de crédito ($)', type: 'number' },
      { key: 'notasCreditoCantidad', label: 'Número de notas de crédito', type: 'number' },
      { key: 'descuentosEmpleados', label: 'Descuentos de empleados ($)', type: 'number' },
      { key: 'descuentosJubilados', label: 'Descuentos de jubilados ($)', type: 'number' },
    ]
  },
  {
    id: 'entrenamiento',
    titulo: 'ENTRENAMIENTO',
    color: '#0891b2',
    bgColor: '#ecfeff',
    campos: [
      { key: 'personalEntrenamiento', label: 'PERSONAL EN ENTRENAMIENTO', type: 'number' },
      { key: 'theVault', label: '% THE VAULT', type: 'percentage' },
    ]
  },
  {
    id: 'manoobra',
    titulo: 'MANO DE OBRA',
    color: '#4f46e5',
    bgColor: '#eef2ff',
    campos: [
      { key: 'manpowerAprobado', label: 'Manpower aprobado', type: 'number' },
      { key: 'empleadosActivos', label: 'Empleados Activos', type: 'number' },
      { key: 'empleadosVacaciones', label: 'Empleados de vacaciones', type: 'number' },
      { key: 'gerentesActivos', label: 'Gerentes Activos', type: 'number' },
      { key: 'costoManoObra', label: 'Costo de mano de obra', type: 'number' },
      { key: 'horasColaboradores', label: 'Horas Colaboradores', type: 'number' },
      { key: 'horasInasistencia', label: 'Número de (hrs) Inasis / Incapac', type: 'number' },
      { key: 'horasExtras', label: 'Horas Extras Colaboradores', type: 'number' },
    ]
  },
  {
    id: 'costos',
    titulo: 'COSTOS',
    color: '#be123c',
    bgColor: '#fff1f2',
    campos: [
      { key: 'costoSemanal', label: 'Costo Semanal %', type: 'percentage' },
      { key: 'costoTeorico', label: 'Costo Teórico Semanal %', type: 'percentage' },
      { key: 'merma', label: 'Merma Semanal', type: 'number' },
      { key: 'gap', label: 'DIFERENCIAS NEGATIVAS (GAP)', type: 'number' },
    ]
  },
  {
    id: 'clientes',
    titulo: 'CLIENTES',
    color: '#0d9488',
    bgColor: '#f0fdfa',
    campos: [
      { key: 'tiempoAutoSegundos', label: 'Tiempos de AUTO DEL DIA (segundos)', type: 'number' },
      { key: 'tiempoAutoDia', label: 'Tiempos de AUTO DEL DIA', type: 'number' },
      { key: 'dp1', label: 'DP# 1 - Apertura-12 MD', type: 'number' },
      { key: 'dp2', label: 'DP# 2 - 12 MD-3 PM', type: 'number' },
      { key: 'dp3', label: 'DP# 3 - 3-6 PM', type: 'number' },
      { key: 'dp4', label: 'DP# 4 - 6-9 PM', type: 'number' },
      { key: 'dp5', label: 'DP# 5 - 9 PM-Cierre', type: 'number' },
    ]
  },
  {
    id: 'rocc',
    titulo: 'ROCC',
    color: '#6b7280',
    bgColor: '#f9fafb',
    campos: [
      { key: 'roccL1', label: 'L1', type: 'number' },
      { key: 'roccL3', label: 'L3', type: 'number' },
    ]
  },
  {
    id: 'domicilio',
    titulo: 'DOMICILIO',
    color: '#9333ea',
    bgColor: '#faf5ff',
    campos: [
      { key: 'penalizacionesPct', label: '% de penalizaciones', type: 'percentage' },
      { key: 'montoPenalizado', label: 'Monto penalizado', type: 'number' },
      { key: 'tiempoCocina', label: 'Tiempo de cocina (minutos)', type: 'number' },
    ]
  },
]
