import { useState, useRef, useCallback } from 'react'
import type { DatosTienda } from '../types'

const CAMPOS_DINERO: string[] = [
  'ventaNeta', 'presupuestoVentas', 'ventas2025',
  'kioskos', 'localLlevar', 'autoservicio', 'domicilio',
  'dayPartApertura', 'dayPart12a3', 'dayPart3a6', 'dayPart6a9', 'dayPart9aCierre',
  'borrantes', 'notasCredito',
  'descuentosEmpleados', 'descuentosJubilados',
  'costoManoObra',
  'merma', 'gap',
  'montoPenalizado',
]

interface CeldaInputProps {
  value: number
  onChange: (val: number) => void
  campo?: keyof DatosTienda
  type?: 'number' | 'percentage'
  readonly?: boolean
  isCalculated?: boolean
}

export default function CeldaInput({
  value,
  onChange,
  campo,
  type = 'number',
  readonly = false,
  isCalculated = false,
}: CeldaInputProps) {
  const [localValue, setLocalValue] = useState(value.toString())
  const [hasFocus, setHasFocus] = useState(false)
  const isMoney = campo ? CAMPOS_DINERO.includes(campo as string) : false
  const committedRef = useRef(value)

  // Solo sincronizar cuando el valor prop cambia REALMENTE desde fuera
  // y NO tenemos el foco (evita sobrescribir mientras escribe)
  if (value !== committedRef.current && !hasFocus) {
    setLocalValue(value.toString())
    committedRef.current = value
  }

  const handleFocus = useCallback(() => {
    setHasFocus(true)
    // Al hacer focus, mostrar número limpio sin formato
    setLocalValue(value.toString())
  }, [value])

  const handleBlur = useCallback(() => {
    setHasFocus(false)
    const cleaned = localValue.replace(/,/g, '').replace(/\$/g, '').trim()
    const num = parseFloat(cleaned)
    if (!isNaN(num) && cleaned !== '') {
      onChange(num)
      committedRef.current = num
      setLocalValue(num.toString())
    } else {
      // Si escribió algo inválido, volver al valor anterior
      setLocalValue(value.toString())
    }
  }, [localValue, onChange, value])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      (e.target as HTMLInputElement).blur()
    }
  }, [])

  // Formato de visualización cuando NO tiene foco
  const formatDisplay = (val: number): string => {
    if (type === 'percentage') {
      return (val * 100).toFixed(2) + '%'
    }
    const formatted = val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (isMoney) {
      return '$' + formatted
    }
    return formatted
  }

  if (readonly || isCalculated) {
    return (
      <div className={`px-4 py-3 text-right text-base ${
        isCalculated ? 'bg-yellow-50/60 text-yellow-900' : 'bg-gray-50 text-gray-700'
      }`}>
        {formatDisplay(value)}
      </div>
    )
  }

  return (
    <div className="relative h-full">
      {isMoney && hasFocus && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-gray-400 pointer-events-none select-none">$</span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={hasFocus ? localValue : formatDisplay(value)}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full h-full px-4 py-3 text-right text-base border-0 outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 transition-colors bg-transparent ${
          isMoney && hasFocus ? 'pl-7' : ''
        }`}
      />
    </div>
  )
}
