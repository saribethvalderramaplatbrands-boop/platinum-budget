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

  // NUEVO: Exportar todos los registros filtrados (sin paginación)
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
    // Sin range = trae todos los que coincidan con los filtros
    const { data, error } = await query
    if (error) {
      console.error('Error exporting gastos:', error)
      return []
    }
    return data || []
  }, [serverFilters])

  // Cargar mes actual por defecto al montar
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
    exportGastos  // NUEVO
  }
}
