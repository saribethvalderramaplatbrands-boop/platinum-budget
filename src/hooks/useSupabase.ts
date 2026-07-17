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

  // FIX: uploadAmortizaciones ahora solo inserta, no hace refetch
  // El componente manejará el refetch después de confirmar
  const uploadAmortizaciones = async (rows: any[]) => {
    const { error } = await supabase.from('amortizaciones').insert(rows)
    // No hacer refetch aquí - el componente lo hará después
    return error
  }

  return { amortizaciones, loading, uploadAmortizaciones, refetch: fetchAmortizaciones }
}
