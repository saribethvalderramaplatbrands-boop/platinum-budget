import { useState, useEffect, useRef } from 'react'

interface CeldaInputProps {
  value: number
  onChange: (val: number) => void
  campo?: string
  type?: 'number' | 'percentage'
}

export default function CeldaInput({ value, onChange, campo, type }: CeldaInputProps) {
  const [editValue, setEditValue] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const esMonto = (c?: string): boolean => {
    if (!c) return false
    const montos = [
      'ventaNeta','presupuestoVentas','ventas2025',
      'kioskos','localLlevar','autoservicio','domicilio',
      'borrantes','notasCredito','descuentosEmpleados','descuentosJubilados',
      'costoManoObra','merma','gap','montoPenalizado',
      'dayPartApertura','dayPart12a3','dayPart3a6','dayPart6a9','dayPart9aCierre',
      'presupuestoTicket',
    ]
    return montos.includes(c)
  }

  const isPct = type === 'percentage'
  const isMoney = esMonto(campo)

  const formatDisplay = (v: number): string => {
    if (isPct) return v.toFixed(2) + '%'
    if (isMoney) return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleClick = () => {
    setIsEditing(true)
    setEditValue(value.toString())
  }

  const handleBlur = () => {
    setIsEditing(false)
    const parsed = parseFloat(editValue.replace(/,/g, ''))
    if (!isNaN(parsed)) {
      onChange(parsed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (/^-?\d*\.?\d*$/.test(val) || val === '') {
      setEditValue(val)
    }
  }

  if (isEditing) {
    return (
      <div className="relative w-full h-full">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full h-full px-2 py-2 text-right text-sm bg-white border-2 border-red-500 rounded outline-none"
        />
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      className="w-full h-full px-2 py-2 text-right text-sm cursor-pointer hover:bg-red-50 transition-colors select-none"
    >
      {formatDisplay(value)}
    </div>
  )
}
