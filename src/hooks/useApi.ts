import { useCallback, useEffect, useRef, useState } from 'react'
import { mensajeError } from '../services/api'

interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  setData: React.Dispatch<React.SetStateAction<T | null>>
}

/**
 * Hook generico para cargar datos desde un servicio.
 * Ejemplo: const { data, loading, error, reload } = useApi(habitacionService.rack)
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = [], enabled = true): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await fetcherRef.current())
    } catch (e) {
      setError(mensajeError(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (enabled) void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reload, ...deps])

  return { data, loading, error, reload, setData }
}
