export interface Tienda {
  id: string;
  codigo: number;
  nombre: string;
  unidad_negocio: string;
  gerente_area: string;
  gerente_regional: string;
  activa: boolean;
}

export interface Proveedor {
  id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
  clasificacion_id?: string;
  clasificacion?: {
    nombre: string;
  };
}

export interface PresupuestoMensual {
  id: string;
  tienda_id: string;
  año: number;
  mes: number;
  presupuesto_asignado: number;
}

export interface GastoDiario {
  id: string;
  fecha: string;
  periodo: string;
  orden_compra: string | null;
  factura: string | null;
  proveedor_id: string | null;
  descripcion: string;
  clasificacion: string;
  monto: number;
  tienda_id: string;
  gerente_area: string;
  gerente_regional: string;
  estatus: string;
  created_at: string;
}

export interface Amortizacion {
  id: string;
  codigo_tienda: number;
  tienda_nombre: string;
  descripcion: string;
  monto: number;
  periodo: string;
}

export interface ResumenMensual {
  tienda_id: string;
  codigo: number;
  tienda: string;
  unidad_negocio: string;
  año: number;
  mes: number;
  presupuesto_asignado: number;
  gasto_real: number;
  saldo: number;
}

// NUEVO: Interfaces para el planificador
export interface EscenarioPlanificador {
  id: string;
  nombre: string;
  año: number;
  recorte_mensual: number;
  mes_recorte_inicio: number;
  activo: boolean;
  created_at: string;
}

export interface PlanificadorMensual {
  escenario_id: string;
  nombre: string;
  año: number;
  recorte_mensual: number;
  mes_recorte_inicio: number;
  mes: number;
  presupuesto_original: number;
  presupuesto_ajustado: number;
  gasto_real: number;
  amortizaciones: number;
  total_consumido: number;
  saldo_ajustado: number;
  a_gastar: number;
  tope_activo: string;
  estado: string;
  colchon_acumulado: number;
}
