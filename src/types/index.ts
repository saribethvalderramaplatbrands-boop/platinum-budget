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
