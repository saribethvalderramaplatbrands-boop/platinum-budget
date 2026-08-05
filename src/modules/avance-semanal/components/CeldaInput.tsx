import { useState, useEffect, useRef } from 'react'
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
  className?: string
}

export default function CeldaInput({
  value,
  onChange,
  campo,
  type = 'number',
  readonly = false,
  isCalculated = false,
  className = '',
}: CeldaInputProps) {
  const [localValue, setLocalValue] = useState(value.toString())
  const [hasFocus, setHasFocus] = useState(false)
  const isMoney = campo ? CAMPOS_DINERO.includes(campo as string) : false
  const prevValueRef = useRef(value)

  // Solo sincronizar desde props cuando NO tenemos el foco
  // y el valor realmente cambió desde fuera
  useEffect(() => {
    if (!hasFocus && value !== prevValueRef.current) {
      setLocalValue(value.toString())
      prevValueRef.current = value
    }
  }, [value, hasFocus])

  const handleFocus = () => {
    setHasFocus(true)
    // Al hacer focus, mostramos el número limpio sin formato
    setLocalValue(value.toString())
  }

  const handleBlur = () => {
    setHasFocus(false)
    const num = parseFloat(localValue.replace(/,/g, '').replace(/\$/g, ''))
    if (!isNaN(num)) {
      onChange(num)
      setLocalValue(num.toString())
      prevValueRef.current = num
    } else {
      setLocalValue(value.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur()
    }
  }

  // Formato para mostrar cuando NO tiene foco
  const formatDisplay = (val: number): string => {
    if (type === 'percentage') {
      return (val * 100).toFixed(2) + '%'
    }
    const formatted = val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (isMoney && !hasFocus) {
      return '$' + formatted
    }
    return formatted
  }

  if (readonly || isCalculated) {
    return (
      <div
        className={`px-4 py-3 text-right text-base font-mono ${className} ${
          isCalculated ? 'bg-yellow-50/60 text-yellow-900' : 'bg-gray-50 text-gray-600'
        }`}
      >
        {formatDisplay(value)}
      </div>
    )
  }

  return (
    <div className="relative">
      {isMoney && hasFocus && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-base text-gray-400 font-mono pointer-events-none">$</span>
      )}
      <input
        type="text"
        value={hasFocus ? localValue : formatDisplay(value)}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full px-4 py-3 text-right text-base font-mono border-0 outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 transition-colors ${
          isMoney && hasFocus ? 'pl-6' : ''
        } ${className}`}
      />
    </div>
  )
}
