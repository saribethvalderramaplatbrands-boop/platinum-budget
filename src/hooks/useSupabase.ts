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
