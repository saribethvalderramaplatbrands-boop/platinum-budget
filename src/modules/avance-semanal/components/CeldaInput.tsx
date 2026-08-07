import { useState, useCallback } from 'react'
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
  // null = no tiene foco, muestra el valor formateado del padre
  // string = tiene foco, muestra el valor editable limpio
  const [editValue, setEditValue] = useState<string | null>(null)
  const isMoney = campo ? CAMPOS_DINERO.includes(campo as string) : false

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

  const handleFocus = useCallback(() => {
    // Al hacer foco: mostrar número limpio sin formato para editar
    setEditValue(value.toString())
  }, [value])

  const handleBlur = useCallback(() => {
    if (editValue !== null) {
      const cleaned = editValue.replace(/,/g, '').replace(/\$/g, '').trim()
      const num = parseFloat(cleaned)
      if (!isNaN(num) && cleaned !== '') {
        onChange(num)
      }
    }
    // Al perder foco: volver a mostrar el valor formateado del padre
    setEditValue(null)
  }, [editValue, onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.currentTarget.blur()
    }
  }, [])

  // Cuando tiene foco => editValue (número limpio)
  // Cuando NO tiene foco => formatDisplay(value) (formateado con $ y comas)
  const displayValue = editValue !== null ? editValue : formatDisplay(value)
  const isEditing = editValue !== null

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
      {isMoney && isEditing && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-gray-400 pointer-events-none select-none">$</span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={(e) => setEditValue(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full h-full px-4 py-3 text-right text-base border-0 outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 transition-colors bg-transparent ${
          isMoney && isEditing ? 'pl-7' : ''
        }`}
      />
    </div>
  )
}
