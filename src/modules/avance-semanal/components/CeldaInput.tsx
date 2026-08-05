import { useState, useEffect } from 'react'

interface CeldaInputProps {
  value: number
  onChange: (val: number) => void
  type?: 'number' | 'percentage'
  readonly?: boolean
  isCalculated?: boolean
  className?: string
}

export default function CeldaInput({
  value,
  onChange,
  type = 'number',
  readonly = false,
  isCalculated = false,
  className = '',
}: CeldaInputProps) {
  const [localValue, setLocalValue] = useState(value.toString())

  useEffect(() => {
    setLocalValue(value.toString())
  }, [value])

  const handleBlur = () => {
    const num = parseFloat(localValue.replace(/,/g, ''))
    if (!isNaN(num)) {
      onChange(num)
    } else {
      setLocalValue(value.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur()
    }
  }

  const displayValue = type === 'percentage'
    ? `${(value * 100).toFixed(2)}%`
    : value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (readonly || isCalculated) {
    return (
      <div
        className={`px-3 py-2.5 text-right text-sm font-mono ${className} ${
          isCalculated ? 'bg-yellow-50/60 text-yellow-900' : 'bg-gray-50 text-gray-500'
        }`}
      >
        {displayValue}
      </div>
    )
  }

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`w-full px-3 py-2.5 text-right text-sm font-mono border-0 outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 ${className}`}
    />
  )
}
