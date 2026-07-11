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

// ============================================
// USEGASTOS CON PAGINACION SERVER-SIDE
// ============================================
const PAGE_SIZE = 25
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export function useGastos() {
  const [gastos, setGastos] = useState<GastoDiario[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [serverFilters, setServerFilters] = useState<{
    clasificacion?: string;
    proveedor_id?: string;
    periodo?: string;
    tienda_id?: string;
    estatus?: string;
    search?: string;
  }>({})

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const buildQuery = (filters?: {
    clasificacion?: string;
    proveedor_id?: string;
    periodo?: string;
    tienda_id?: string;
    estatus?: string;
    search?: string;
  }) => {
    let query = supabase.from('gastos_diarios').select(`
      *,
      tiendas:tienda_id(codigo, nombre, unidad_negocio),
      proveedores:proveedor_id(codigo, nombre)
    `, { count: 'exact' }).order('created_at', { ascending: false })

    if (filters?.clasificacion) query = query.eq('clasificacion', filters.clasificacion)
    if (filters?.proveedor_id) query = query.eq('proveedor_id', filters.proveedor_id)
    if (filters?.periodo && filters.periodo !== 'Todos') query = query.eq('periodo', filters.periodo)
    if (filters?.tienda_id) query = query.eq('tienda_id', filters.tienda_id)
    if (filters?.estatus) query = query.eq('estatus', filters.estatus)

    if (filters?.search) {
      const search = filters.search.trim()
      if (search) {
        query = query.or(`descripcion.ilike.%${search}%,orden_compra.ilike.%${search}%,factura.ilike.%${search}%`)
      }
    }

    return query
  }

  const fetchGastos = useCallback(async (filters?: {
    clasificacion?: string;
    proveedor_id?: string;
    periodo?: string;
    tienda_id?: string;
    estatus?: string;
    search?: string;
  }, newPage = 0) => {
    setLoading(true)

    const activeFilters = filters || serverFilters
    if (filters) setServerFilters(activeFilters)

    let query = buildQuery(activeFilters)
    const from = newPage * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)

    const { data, error, count } = await query
    if (error) {
      console.error('Error fetching gastos:', error)
    } else {
      setGastos(data || [])
      setTotalCount(count || 0)
      setPage(newPage)
    }
    setLoading(false)
  }, [serverFilters])

  const exportGastos = useCallback(async (filters?: {
    clasificacion?: string;
    proveedor_id?: string;
    periodo?: string;
    tienda_id?: string;
    estatus?: string;
    search?: string;
  }) => {
    const activeFilters = filters || serverFilters
    let query = buildQuery(activeFilters)
    const { data, error } = await query
    if (error) {
      console.error('Error exporting gastos:', error)
      return []
    }
    return data || []
  }, [serverFilters])

  useEffect(() => {
    const mesActual = MESES[new Date().getMonth()]
    const defaultFilters = { periodo: mesActual }
    setServerFilters(defaultFilters)
    fetchGastos(defaultFilters, 0)
  }, [])

  const nextPage = () => {
    if (page < totalPages - 1) fetchGastos(serverFilters, page + 1)
  }

  const prevPage = () => {
    if (page > 0) fetchGastos(serverFilters, page - 1)
  }

  const goToPage = (p: number) => {
    if (p >= 0 && p < totalPages) fetchGastos(serverFilters, p)
  }

  const addGasto = async (gasto: any) => {
    let estatus = 'Completado'
    if (!gasto.orden_compra) estatus = 'Pendiente OC'
    else if (!gasto.factura) estatus = 'Pendiente Factura'

    const { data, error } = await supabase.from('gastos_diarios').insert({
      ...gasto,
      estatus
    }).select()

    if (!error) fetchGastos(serverFilters, page)
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
    if (!error) fetchGastos(serverFilters, page)
    return error
  }

  const deleteGasto = async (id: string) => {
    const { error } = await supabase.from('gastos_diarios').delete().eq('id', id)
    if (!error) fetchGastos(serverFilters, page)
    return error
  }

  return { 
    gastos, 
    loading, 
    page, 
    totalPages, 
    totalCount, 
    pageSize: PAGE_SIZE,
    nextPage, 
    prevPage, 
    goToPage,
    addGasto, 
    updateGasto, 
    deleteGasto, 
    fetchGastos,
    exportGastos
  }
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

// NUEVO: Resumen anual para grafico
export function useResumenAnual(año: number) {
  const [datos, setDatos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResumenAnual()
  }, [año])

  const fetchResumenAnual = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('resumen_mensual')
      .select('*')
      .eq('año', año)
      .order('mes')

    if (error) {
      console.error('Error fetching resumen anual:', error)
    } else {
      setDatos(data || [])
    }
    setLoading(false)
  }

  return { datos, loading, refetch: fetchResumenAnual }
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
