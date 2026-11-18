import { useEffect, useState, type FormEvent } from 'react'
import { Badge } from '../../components/Badge'
import { Modal } from '../../components/Modal'
import { EmptyState, Loader } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { ApiError, mensajeError } from '../../services/api'
import { cajaService } from '../../services/posService'
import { folioService } from '../../services/recepcionService'
import {
  CATEGORIAS_CARGO,
  METODOS_PAGO,
  type Cargo,
  type CategoriaCargo,
  type Folio,
  type MetodoPago,
  type Pago,
} from '../../types'
import { formatFechaHora, formatPEN, humanizar } from '../../utils/format'

interface FolioModalProps {
  open: boolean
  estanciaId: number | null
  titulo: string
  onClose: () => void
  onChange?: () => void
}

/** Cuenta corriente (folio) de una estancia: cargos, pagos y cierre */
export function FolioModal({ open, estanciaId, titulo, onClose, onChange }: FolioModalProps) {
  const { user } = useAuth()
  const toast = useToast()
  const [folio, setFolio] = useState<Folio | null>(null)
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(false)
  const [sinFolio, setSinFolio] = useState(false)
  const [saving, setSaving] = useState(false)

  const [cargo, setCargo] = useState({ concepto: '', categoria: 'CONSUMO_POS' as CategoriaCargo, cantidad: 1, precio: '' })
  const [pago, setPago] = useState({ metodo: 'EFECTIVO' as MetodoPago, monto: '', referencia: '' })

  const cargar = async () => {
    if (!estanciaId) return
    setLoading(true)
    setSinFolio(false)
    try {
      const f = await folioService.porEstancia(estanciaId)
      const [c, p] = await Promise.all([folioService.cargos(f.id), folioService.pagos(f.id)])
      setFolio(f)
      setCargos(c)
      setPagos(p)
      setPago((x) => ({ ...x, monto: f.saldo > 0 ? String(f.saldo) : '' }))
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setFolio(null)
        setSinFolio(true)
      } else toast.error(mensajeError(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) void cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, estanciaId])

  const accion = async (fn: () => Promise<unknown>, ok: string) => {
    setSaving(true)
    try {
      await fn()
      toast.success(ok)
      await cargar()
      onChange?.()
    } catch (e) {
      toast.error(mensajeError(e))
    } finally {
      setSaving(false)
    }
  }

  const agregarCargo = (e: FormEvent) => {
    e.preventDefault()
    if (!folio) return
    void accion(
      () =>
        folioService.agregarCargo(
          {
            folioId: folio.id,
            concepto: cargo.concepto,
            categoria: cargo.categoria,
            cantidad: cargo.cantidad,
            precioUnitario: Number(cargo.precio),
          },
          user!.username,
        ),
      'Cargo agregado',
    ).then(() => setCargo({ concepto: '', categoria: 'CONSUMO_POS', cantidad: 1, precio: '' }))
  }

  const registrarPago = (e: FormEvent) => {
    e.preventDefault()
    if (!folio) return
    void accion(async () => {
      // Asociamos el pago al turno de caja abierto (si existe)
      const turnoCajaId = await cajaService
        .turnoActual()
        .then((t) => t.id)
        .catch(() => undefined)
      return folioService.registrarPago(
        {
          folioId: folio.id,
          metodo: pago.metodo,
          monto: Number(pago.monto),
          referencia: pago.referencia || undefined,
          turnoCajaId,
        },
        user!.username,
      )
    }, 'Pago registrado').then(() => setPago((p) => ({ ...p, referencia: '' })))
  }

  const abierto = folio?.estado === 'ABIERTO'

  return (
    <Modal open={open} onClose={onClose} title={`Folio · ${titulo}`} size="lg">
      {loading ? (
        <Loader />
      ) : sinFolio ? (
        <EmptyState>
          <p>Esta estancia aun no tiene folio.</p>
          <button
            className="btn btn-primary"
            disabled={saving}
            onClick={() => accion(() => folioService.crearParaEstancia(estanciaId!), 'Folio abierto')}
          >
            Abrir folio
          </button>
        </EmptyState>
      ) : folio ? (
        <>
          <div className="kpi-grid kpi-grid-sm">
            <div className="kpi-card">
              <span>Total cargos</span>
              <strong>{formatPEN(folio.totalCargos)}</strong>
            </div>
            <div className="kpi-card">
              <span>Total abonos</span>
              <strong className="text-green">{formatPEN(folio.totalAbonos)}</strong>
            </div>
            <div className="kpi-card">
              <span>Saldo</span>
              <strong className={folio.saldo > 0 ? 'text-red' : 'text-green'}>{formatPEN(folio.saldo)}</strong>
            </div>
            <div className="kpi-card">
              <span>Estado</span>
              <Badge value={folio.estado} />
            </div>
          </div>

          <h4>Cargos</h4>
          {cargos.length === 0 ? (
            <p className="muted small">Sin cargos.</p>
          ) : (
            <table className="table table-compact">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Concepto</th>
                  <th>Categoria</th>
                  <th>Cant.</th>
                  <th>P. unit</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {cargos.map((c) => (
                  <tr key={c.id}>
                    <td>{formatFechaHora(c.fecha)}</td>
                    <td>{c.concepto}</td>
                    <td>{humanizar(c.categoria)}</td>
                    <td>{c.cantidad}</td>
                    <td>{formatPEN(c.precioUnitario)}</td>
                    <td>{formatPEN(c.montoTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h4>Pagos</h4>
          {pagos.length === 0 ? (
            <p className="muted small">Sin pagos.</p>
          ) : (
            <table className="table table-compact">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Metodo</th>
                  <th>Referencia</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((p) => (
                  <tr key={p.id}>
                    <td>{formatFechaHora(p.fecha)}</td>
                    <td>{humanizar(p.metodo)}</td>
                    <td>{p.referencia ?? '-'}</td>
                    <td>{formatPEN(p.monto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {abierto && (
            <div className="grid-2">
              <form className="card card-flat" onSubmit={agregarCargo}>
                <h4>Agregar cargo</h4>
                <label className="field">
                  <span>Concepto</span>
                  <input
                    required
                    value={cargo.concepto}
                    onChange={(e) => setCargo({ ...cargo, concepto: e.target.value })}
                  />
                </label>
                <div className="form-grid">
                  <label className="field">
                    <span>Categoria</span>
                    <select
                      value={cargo.categoria}
                      onChange={(e) => setCargo({ ...cargo, categoria: e.target.value as CategoriaCargo })}
                    >
                      {CATEGORIAS_CARGO.map((c) => (
                        <option key={c} value={c}>
                          {humanizar(c)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Cantidad</span>
                    <input
                      type="number"
                      min={1}
                      value={cargo.cantidad}
                      onChange={(e) => setCargo({ ...cargo, cantidad: Number(e.target.value) })}
                    />
                  </label>
                </div>
                <label className="field">
                  <span>Precio unitario</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={cargo.precio}
                    onChange={(e) => setCargo({ ...cargo, precio: e.target.value })}
                  />
                </label>
                <button className="btn btn-secondary btn-block" disabled={saving}>
                  Agregar cargo
                </button>
              </form>

              <form className="card card-flat" onSubmit={registrarPago}>
                <h4>Registrar pago</h4>
                <label className="field">
                  <span>Metodo</span>
                  <select value={pago.metodo} onChange={(e) => setPago({ ...pago, metodo: e.target.value as MetodoPago })}>
                    {METODOS_PAGO.map((m) => (
                      <option key={m} value={m}>
                        {humanizar(m)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Monto</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={pago.monto}
                    onChange={(e) => setPago({ ...pago, monto: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Referencia (voucher / operacion)</span>
                  <input value={pago.referencia} onChange={(e) => setPago({ ...pago, referencia: e.target.value })} />
                </label>
                <button className="btn btn-primary btn-block" disabled={saving}>
                  Registrar pago
                </button>
              </form>
            </div>
          )}

          {abierto && (
            <div className="modal-inline-footer">
              <button
                className="btn btn-secondary"
                disabled={saving || folio.saldo > 0}
                title={folio.saldo > 0 ? 'El saldo debe estar en cero' : ''}
                onClick={() => accion(() => folioService.cerrar(folio.id, user!.username), 'Folio cerrado')}
              >
                Cerrar folio
              </button>
            </div>
          )}
        </>
      ) : null}
    </Modal>
  )
}
