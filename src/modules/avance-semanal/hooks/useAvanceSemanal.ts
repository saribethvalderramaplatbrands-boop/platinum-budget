import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import type { DatosTienda, TotalesCalculados } from '../types'
import type { Tienda } from '../data/tiendas'
import { calcularTotales } from './useCalculadora'

export interface RegistroGuardado {
  id: string
  semana: string
  tienda_codigo: number
  gerente: string
  regional: string
  datos: DatosTienda
  totales: TotalesCalculados
  creado_en: string
}

export function useAvanceSemanal(semana: string, gerente: string, tiendas: Tienda[]) {
  const [registros, setRegistros] = useState<RegistroGuardado[]>([])
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar registros existentes de la semana
  const cargarRegistros = useCallback(async () => {
    if (!semana || tiendas.length === 0) return

    setCargando(true)
    setError(null)

    const codigos = tiendas.map(t => t.codigo)

    const { data, error: err } = await supabase
      .from('registros_semanales')
      .select('*')
      .eq('semana', semana)
      .in('tienda_codigo', codigos)
      .order('tienda_codigo')

    if (err) {
      console.error('Error cargando registros:', err)
      setError(err.message)
      setRegistros([])
    } else {
      setRegistros((data || []).map(r => ({
        ...r,
        datos: r.datos as DatosTienda,
        totales: r.totales as TotalesCalculados,
      })))
    }

    setCargando(false)
  }, [semana, tiendas])

  useEffect(() => {
    cargarRegistros()
  }, [cargarRegistros])

  // Guardar o actualizar registros de todas las tiendas
  const guardarRegistros = useCallback(async (
    datosTiendas: DatosTienda[]
  ): Promise<boolean> => {
    if (!semana || tiendas.length === 0) {
      setError('Selecciona una semana')
      return false
    }

    setGuardando(true)
    setError(null)

    const registrosParaUpsert = tiendas.map((tienda, index) => {
      const datos = datosTiendas[index]
      const totales = calcularTotales(datos)

      return {
        semana,
        tienda_codigo: tienda.codigo,
        gerente: tienda.gerente,
        regional: tienda.regional,
        datos,
        totales,
      }
    })

    const { error: err } = await supabase
      .from('registros_semanales')
      .upsert(registrosParaUpsert, {
        onConflict: 'semana,tienda_codigo',
        ignoreDuplicates: false,
      })

    setGuardando(false)

    if (err) {
      console.error('Error guardando:', err)
      setError(err.message)
      return false
    }

    // Recargar para confirmar
    await cargarRegistros()
    return true
  }, [semana, tiendas, cargarRegistros])

  // Cargar datos guardados en el formato del formulario
  const cargarDatosGuardados = useCallback((): DatosTienda[] => {
    return tiendas.map(tienda => {
      const reg = registros.find(r => r.tienda_codigo === tienda.codigo)
      if (reg) {
        return reg.datos
      }
      // Datos vacíos por defecto
      return {
        ventaNeta: 0, presupuestoVentas: 0, ventas2025: 0,
        transaccionesActuales: 0, presupuestoTransacciones: 0, transacciones2025: 0,
        ticketPromedio: 0, presupuestoTicket: 0,
        kioskos: 0, kioskoTrx: 0, localLlevar: 0, localLlevarTrx: 0,
        autoservicio: 0, autoservicioTrx: 0, domicilio: 0, domicilioTrx: 0,
        dayPartApertura: 0, dayPart12a3: 0, dayPart3a6: 0, dayPart6a9: 0, dayPart9aCierre: 0,
        borrantes: 0, notasCredito: 0, notasCreditoCantidad: 0,
        descuentosEmpleados: 0, descuentosJubilados: 0,
        personalEntrenamiento: 0, theVault: 0,
        manpowerAprobado: 0, empleadosActivos: 0, empleadosVacaciones: 0, gerentesActivos: 0,
        costoManoObra: 0, horasColaboradores: 0, horasInasistencia: 0, horasExtras: 0,
        costoSemanal: 0, costoTeorico: 0, merma: 0, gap: 0,
        tiempoAutoSegundos: 0, tiempoAutoDia: 0, dp1: 0, dp2: 0, dp3: 0, dp4: 0, dp5: 0,
        roccL1: 0, roccL3: 0,
        penalizacionesPct: 0, montoPenalizado: 0, tiempoCocina: 0,
      }
    })
  }, [registros, tiendas])

  return {
    registros,
    cargando,
    guardando,
    error,
    cargarRegistros,
    guardarRegistros,
    cargarDatosGuardados,
  }
}
