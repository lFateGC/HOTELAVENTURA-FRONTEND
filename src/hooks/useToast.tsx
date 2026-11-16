import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type ToastTipo = 'success' | 'error' | 'info'
interface Toast {
  id: number
  tipo: ToastTipo
  mensaje: string
}

interface ToastContextValue {
  notify: (mensaje: string, tipo?: ToastTipo) => void
  success: (mensaje: string) => void
  error: (mensaje: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)
let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((mensaje: string, tipo: ToastTipo = 'info') => {
    const id = nextId++
    setToasts((t) => [...t, { id, tipo, mensaje }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tipo === 'error' ? 6000 : 3500)
  }, [])

  const value: ToastContextValue = {
    notify,
    success: (m) => notify(m, 'success'),
    error: (m) => notify(m, 'error'),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tipo}`}>
            {t.mensaje}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
