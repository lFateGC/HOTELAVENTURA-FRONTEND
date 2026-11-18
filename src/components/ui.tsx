import type { ReactNode } from 'react'

export function Loader({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="loader">
      <span className="spinner" aria-hidden="true" />
      {text}
    </div>
  )
}

export function ErrorAlert({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="alert alert-error">
      <span>{message}</span>
      {onRetry && (
        <button className="btn btn-sm btn-secondary" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}

/** Envoltorio estandar para estados de carga / error de una seccion */
export function AsyncContent({
  loading,
  error,
  onRetry,
  children,
}: {
  loading: boolean
  error: string | null
  onRetry?: () => void
  children: ReactNode
}) {
  if (loading) return <Loader />
  if (error) return <ErrorAlert message={error} onRetry={onRetry} />
  return <>{children}</>
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[]
  active: T
  onChange: (id: T) => void
}) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={`tab ${active === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
