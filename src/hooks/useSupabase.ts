import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Tienda, Proveedor, GastoDiario, Amortizacion, ResumenMensual } from '../types'

export function useTiendas() {
  const [tiendas, setTiendas] = useState<Tienda[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTiendas()
  }, [])

  const fetchTiendas = async () => {
    const { data, error } = await supabase
      .from('tiendas')
      .select('*')
      .eq('activa', true)
      .order('codigo')
    
    if (error) console.error('Error fetching tiendas:', error)
    else setTiendas(data || [])
    setLoading(false)
  }

  return { tiendas, loading, refetch: fetchTiendas }
}

export function useProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProveedores()
  }, [])

  const fetchProveedores = async () => {
    const { data, error } = await supabase
      .from('proveedores')
      .select(`
        *,
        clasificacion:clasificacion_id(nombre)
      `)
      .eq('activo', true)
      .order('codigo')
    
    if (error) console.error('Error fetching proveedores:', error)
    else setProveedores(data || [])
    setLoading(false)
  }

  const addProveedor = async (codigo: string, nombre: string) => {
    const { error } = await supabase.from('proveedores').insert({ codigo, nombre })
    if (!error) fetchProveedores()
    return error
  }

  const deactivateProveedor = async (id: string) => {
    const { error } = await supabase.from('proveedores').update({ activo: false }).eq('id', id)
    if (!error) fetchProveedores()
    return error
  }

  return { proveedores, loading, addProveedor, deactivateProveedor, refetch: fetchProveedores }
}

export function useGastos() {
  const [gastos, setGastos] = useState<GastoDiario[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGastos = useCallback(async (filters?: {
    clasificacion?: string;
    proveedor_id?: string;
    periodo?: string;
    tienda_id?: string;
    estatus?: string;
  }) => {
    let query = supabase.from('gastos_diarios').select(`
      *,
      tiendas:tienda_id(codigo, nombre, unidad_negocio),
      proveedores:proveedor_id(codigo, nombre)
    `).order('created_at', { ascending: false })

    if (filters?.clasificacion) query = query.eq('clasificacion', filters.clasificacion)
    if (filters?.proveedor_id) query = query.eq('proveedor_id', filters.proveedor_id)
    if (filters?.periodo) query = query.eq('periodo', filters.periodo)
    if (filters?.tienda_id) query = query.eq('tienda_id', filters.tienda_id)
    if (filters?.estatus) query = query.eq('estatus', filters.estatus)

    const { data, error } = await query
    if (error) console.error('Error fetching gastos:', error)
    else setGastos(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchGastos()
  }, [fetchGastos])

  const addGasto = async (gasto: any) => {
    let estatus = 'Completado'
    if (!gasto.orden_compra) estatus = 'Pendiente OC'
    else if (!gasto.factura) estatus = 'Pendiente Factura'

    const { data, error } = await supabase.from('gastos_diarios').insert({
      ...gasto,
      estatus
    }).select()

    if (!error) fetchGastos()
    return { data, error }
  }

  const updateGasto = async (id: string, updates: any) => {
    if (updates.orden_compra !== undefined || updates.factura !== undefined || updates.periodo !== undefined) {
      const { data: current } = await supabase.from('gastos_diarios').select('orden_compra, factura').eq('id', id).single()
      const oc = updates.orden_compra !== undefined ? updates.orden_compra : current?.orden_compra
      const fac = updates.factura !== undefined ? updates.factura : current?.factura
      
      if (!oc) updates.estatus = 'Pendiente OC'
      else if (!fac) updates.estatus = 'Pendiente Factura'
      else updates.estatus = 'Completado'
    }

    const { error } = await supabase.from('gastos_diarios').update(updates).eq('id', id)
    if (!error) fetchGastos()
    return error
  }

  const deleteGasto = async (id: string) => {
    const { error } = await supabase.from('gastos_diarios').delete().eq('id', id)
    if (!error) fetchGastos()
    return error
  }

  return { gastos, loading, addGasto, updateGasto, deleteGasto, fetchGastos }
}

export function useResumen(año?: number, mes?: number) {
  const [resumen, setResumen] = useState<ResumenMensual[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResumen()
  }, [año, mes])

  const fetchResumen = async () => {
    let query = supabase.from('resumen_mensual').select('*')
    if (año) query = query.eq('año', año)
    if (mes) query = query.eq('mes', mes)

    const { data, error } = await query
    if (error) console.error('Error fetching resumen:', error)
    else setResumen(data || [])
    setLoading(false)
  }

  return { resumen, loading, refetch: fetchResumen }
}

export function useAmortizaciones() {
  const [amortizaciones, setAmortizaciones] = useState<Amortizacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAmortizaciones()
  }, [])

  const fetchAmortizaciones = async () => {
    const { data, error } = await supabase.from('amortizaciones').select('*').order('created_at', { ascending: false })
    if (error) console.error('Error fetching amortizaciones:', error)
    else setAmortizaciones(data || [])
    setLoading(false)
  }

  const uploadAmortizaciones = async (rows: any[]) => {
    const { error } = await supabase.from('amortizaciones').insert(rows)
    if (!error) fetchAmortizaciones()
    return error
  }

  return { amortizaciones, loading, uploadAmortizaciones, refetch: fetchAmortizaciones }
}

// NUEVO: Hook para el planificador de presupuesto
export function usePlanificador(año: number) {
  const [datos, setDatos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlanificador()
  }, [año])

  const fetchPlanificador = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vista_planificador')
      .select('*')
      .eq('año', año)
      .order('mes')

    if (error) {
      console.error('Error fetching planificador:', error)
    } else {
      setDatos(data || [])
    }
    setLoading(false)
  }

  const recalcular = async () => {
    const { error } = await supabase.rpc('recalcular_planificador', { p_año: año })
    if (error) {
      console.error('Error recalculando planificador:', error)
    } else {
      fetchPlanificador()
    }
    return error
  }

  return { datos, loading, recalcular, refetch: fetchPlanificador }
}
