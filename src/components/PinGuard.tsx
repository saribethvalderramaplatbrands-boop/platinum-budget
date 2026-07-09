import { useState, useEffect } from 'react'
import { Lock, Unlock } from 'lucide-react'

const PIN_CORRECTO = '3024' // ← Cambia este PIN por el que quieras

interface PinGuardProps {
  children: React.ReactNode
  title: string
}

export default function PinGuard({ children, title }: PinGuardProps) {
  const [pin, setPin] = useState('')
  const [autorizado, setAutorizado] = useState(false)
  const [error, setError] = useState(false)

  // Verificar si ya está autorizado en esta sesión
  useEffect(() => {
    const sessionKey = `pin_auth_${title.replace(/\s/g, '_')}`
    if (sessionStorage.getItem(sessionKey) === 'true') {
      setAutorizado(true)
    }
  }, [title])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === PIN_CORRECTO) {
      setAutorizado(true)
      setError(false)
      sessionStorage.setItem(`pin_auth_${title.replace(/\s/g, '_')}`, 'true')
    } else {
      setError(true)
      setPin('')
    }
  }

  const handleLogout = () => {
    setAutorizado(false)
    setPin('')
    sessionStorage.removeItem(`pin_auth_${title.replace(/\s/g, '_')}`)
  }

  if (autorizado) {
    return (
      <div className="relative">
        <button
          onClick={handleLogout}
          className="absolute top-0 right-0 z-10 flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <Lock className="w-3 h-3" />
          Bloquear
        </button>
        <div className="pt-8">{children}</div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="card-solid w-full max-w-md p-8 text-center space-y-6">
        <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/20 w-16 h-16 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">Acceso restringido. Ingresa el PIN para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, '').slice(0, 4))
              setError(false)
            }}
            placeholder="• • • •"
            className={`input-field text-center text-2xl tracking-[0.5em] py-3 ${error ? 'border-red-300 bg-red-50' : ''}`}
            autoFocus
          />
          
          {error && (
            <p className="text-sm text-red-600 font-medium animate-shake">
              PIN incorrecto. Intenta de nuevo.
            </p>
          )}

          <button type="submit" className="btn-primary w-full py-3">
            <Unlock className="w-4 h-4 inline mr-2" />
            Desbloquear
          </button>
        </form>

        <p className="text-xs text-slate-400">
          La sesión se mantendrá activa mientras no cierres la pestaña.
        </p>
      </div>
    </div>
  )
}
