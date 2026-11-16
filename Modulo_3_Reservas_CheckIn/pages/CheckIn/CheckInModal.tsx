import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Modal } from '../../components/Modal'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { ApiError, mensajeError } from '../../services/api'
import { habitacionService, tipoHabitacionService } from '../../services/habitacionService'
import { huespedService } from '../../services/huespedService'
import { estanciaService, folioService, reservaService } from '../../services/recepcionService'
import {
  MOTIVOS_VIAJE,
  TIPOS_DOCUMENTO,
  type HabitacionDTO,
  type HuespedDTO,
  type ModalidadEstancia,
  type MotivoViaje,
  type ReservaResponseDTO,
  type TipoDocumento,
} from '../../types'
import { fechaHoraLocalISO, formatPEN, humanizar, nochesEntre } from '../../utils/format'

interface CheckInModalProps {
  open: boolean
  onClose: () => void
  onDone: () => void
  /** Habitacion preseleccionada (desde el Rack) */
  habitacion?: HabitacionDTO | null
  /** Reserva preseleccionada (desde Reservas) */
  reserva?: ReservaResponseDTO | null
}

function salidaPorDefecto(modalidad: ModalidadEstancia, reserva?: ReservaResponseDTO | null): string {
  if (modalidad === 'DAY_USE') {
    const d = new Date()
    d.setHours(d.getHours() + 6)
    return fechaHoraLocalISO(d)
  }
  if (reserva?.fechaSalida) return `${reserva.fechaSalida}T12:00`
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(12, 0, 0, 0)
  return fechaHoraLocalISO(d)
}

export function CheckInModal({ open, onClose, onDone, habitacion, reserva }: CheckInModalProps) {
  const { user } = useAuth()
  const toast = useToast()
  const usuario = user?.username ?? 'RECEPCION'

  const tipos = useApi(tipoHabitacionService.listar, [], open)
  const rack = useApi(habitacionService.rack, [], open && !habitacion)
  const reservas = useApi(reservaService.listar, [], open && !reserva)

  const [habitacionId, setHabitacionId] = useState<number | ''>('')
  const [reservaId, setReservaId] = useState<number | ''>('')
  const [modalidad, setModalidad] = useState<ModalidadEstancia>('PERNOCTE')
  const [checkOut, setCheckOut] = useState('')
  const [tarifa, setTarifa] = useState<string>('')
  const [observaciones, setObservaciones] = useState('')
  const [cargarAlojamiento, setCargarAlojamiento] = useState(true)

  // Huesped titular
  const [doc, setDoc] = useState('')
  const [huesped, setHuesped] = useState<HuespedDTO | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [nuevo, setNuevo] = useState<{ nombres: string; apellidos: string; tipoDocumento: TipoDocumento } | null>(null)
  const [motivo, setMotivo] = useState<MotivoViaje>('TURISMO')
  const [saving, setSaving] = useState(false)

  // Reset al abrir
  useEffect(() => {
    if (!open) return
    setHabitacionId(habitacion?.id ?? reserva?.habitacionAsignadaId ?? '')
    setReservaId(reserva?.id ?? '')
    setModalidad('PERNOCTE')
    setCheckOut(salidaPorDefecto('PERNOCTE', reserva))
    setTarifa('')
    setObservaciones('')
    setCargarAlojamiento(true)
    setDoc(reserva?.documentoTitular ?? '')
    setHuesped(null)
    setNuevo(null)
    setMotivo('TURISMO')
  }, [open, habitacion, reserva])

  const reservaSel = useMemo(
    () => reserva ?? reservas.data?.find((r) => r.id === reservaId) ?? null,
    [reserva, reservas.data, reservaId],
  )

  const habitacionesDisponibles = useMemo(
    () =>
      (rack.data ?? []).filter(
        (h) =>
          h.estadoOperativo === 'DISPONIBLE' &&
          h.activa !== false &&
          (!reservaSel || h.tipoHabitacionId === reservaSel.tipoHabitacionId),
      ),
    [rack.data, reservaSel],
  )

  const habSel: HabitacionDTO | undefined =
    habitacion ?? (rack.data ?? []).find((h) => h.id === habitacionId)
  const tipoSel = tipos.data?.find((t) => t.id === habSel?.tipoHabitacionId)

  const tarifaSugerida =
    modalidad === 'DAY_USE'
      ? (tipoSel?.precioDayUse ?? habSel?.precioFinal ?? 0)
      : (habSel?.precioFinal ?? tipoSel?.precioBase ?? 0)
  const tarifaFinal = tarifa === '' ? Number(tarifaSugerida) : Number(tarifa)
  const noches = modalidad === 'DAY_USE' ? 1 : checkOut ? nochesEntre(new Date(), checkOut) : 1

  const reservasElegibles = (reservas.data ?? []).filter(
    (r) => r.estado === 'CONFIRMADA' || r.estado === 'PENDIENTE',
  )

  const cambiarModalidad = (m: ModalidadEstancia) => {
    setModalidad(m)
    setCheckOut(salidaPorDefecto(m, reservaSel))
    setTarifa('')
  }

  const buscarHuesped = async () => {
    if (!doc.trim()) return
    setBuscando(true)
    setHuesped(null)
    setNuevo(null)
    try {
      setHuesped(await huespedService.porDocumento(doc.trim()))
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        const [nombres, ...resto] = (reservaSel?.nombreTitular ?? '').split(' ')
        setNuevo({ nombres: nombres ?? '', apellidos: resto.join(' '), tipoDocumento: 'DNI' })
      } else {
        toast.error(mensajeError(e))
      }
    } finally {
      setBuscando(false)
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!habSel?.id) return toast.error('Selecciona una habitacion')
    if (nuevo && (!nuevo.nombres.trim() || !nuevo.apellidos.trim()))
      return toast.error('Completa nombres y apellidos del huesped')

    setSaving(true)
    try {
      // 1) Check-in
      const estancia = await estanciaService.checkIn(
        {
          habitacionId: habSel.id,
          reservaId: reservaSel?.id,
          modalidad,
          checkOutPrevisto: checkOut,
          tarifaAcordada: tarifaFinal || undefined,
          observaciones: observaciones || undefined,
        },
        usuario,
      )

      const avisos: string[] = []
      // 2) Folio (cuenta de la estancia)
      let folioId: number | null = null
      try {
        folioId = (await folioService.crearParaEstancia(estancia.id)).id
      } catch (err) {
        avisos.push(`Folio: ${mensajeError(err)}`)
      }

      // 3) Huesped titular
      try {
        let h = huesped
        if (!h && nuevo) {
          h = await huespedService.registrar({ ...nuevo, numeroDocumento: doc.trim() })
        }
        if (h?.id) {
          await huespedService.registrarEnEstancia({
            estanciaId: estancia.id,
            huespedId: h.id,
            motivoViaje: motivo,
            esTitular: true,
          })
        }
      } catch (err) {
        avisos.push(`Huesped: ${mensajeError(err)}`)
      }

      // 4) Cargo de alojamiento
      if (cargarAlojamiento && folioId && estancia.tarifaAcordada > 0) {
        try {
          await folioService.agregarCargo(
            {
              folioId,
              concepto: `${modalidad === 'DAY_USE' ? 'Day use' : 'Alojamiento'} Hab. ${habSel.numero}`,
              categoria: 'ALOJAMIENTO',
              cantidad: noches,
              precioUnitario: Number(estancia.tarifaAcordada),
            },
            usuario,
          )
        } catch (err) {
          avisos.push(`Cargo: ${mensajeError(err)}`)
        }
      }

      toast.success(`Check-in ${estancia.codigo} registrado en la habitacion ${habSel.numero}`)
      avisos.forEach((a) => toast.error(a))
      onDone()
      onClose()
    } catch (err) {
      toast.error(mensajeError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={habSel ? `Check-in · Habitacion ${habSel.numero}` : 'Nuevo check-in'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="btn btn-primary" form="checkin-form" disabled={saving}>
            {saving ? 'Registrando...' : 'Confirmar check-in'}
          </button>
        </>
      }
    >
      <form id="checkin-form" onSubmit={onSubmit} className="form-grid">
        {reserva ? (
          <div className="info-box col-span-2">
            Reserva <strong>{reserva.codigo}</strong> · {reserva.nombreTitular} · {reserva.tipoHabitacionNombre} ·{' '}
            {reserva.noches} noche(s)
          </div>
        ) : (
          <label className="field col-span-2">
            <span>Reserva (opcional, dejar vacio si es walk-in)</span>
            <select value={reservaId} onChange={(e) => setReservaId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">— Walk-in (sin reserva) —</option>
              {reservasElegibles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.codigo} · {r.nombreTitular} · {r.tipoHabitacionNombre} · llega {r.fechaLlegada}
                </option>
              ))}
            </select>
          </label>
        )}

        {!habitacion && (
          <label className="field col-span-2">
            <span>Habitacion</span>
            <select
              required
              value={habitacionId}
              onChange={(e) => setHabitacionId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Selecciona una habitacion disponible</option>
              {habitacionesDisponibles.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.numero} · {h.tipoHabitacionNombre} · Piso {h.pisoNumero} · {humanizar(h.estadoLimpieza)} ·{' '}
                  {formatPEN(h.precioFinal)}
                </option>
              ))}
            </select>
          </label>
        )}

        {habSel?.estadoLimpieza === 'SUCIA' && (
          <div className="alert alert-warning col-span-2">La habitacion figura como SUCIA. Verifica antes de entregarla.</div>
        )}

        <div className="field">
          <span>Modalidad</span>
          <div className="segmented">
            {(['PERNOCTE', 'DAY_USE'] as ModalidadEstancia[]).map((m) => (
              <button
                type="button"
                key={m}
                className={modalidad === m ? 'active' : ''}
                onClick={() => cambiarModalidad(m)}
              >
                {m === 'PERNOCTE' ? 'Pernocte' : 'Day use'}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span>Check-out previsto</span>
          <input type="datetime-local" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        </label>

        <label className="field">
          <span>Tarifa acordada ({modalidad === 'DAY_USE' ? 'por uso' : 'por noche'})</span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder={String(tarifaSugerida ?? '')}
            value={tarifa}
            onChange={(e) => setTarifa(e.target.value)}
          />
        </label>

        <div className="field">
          <span>Total estimado</span>
          <div className="total-box">
            {noches} × {formatPEN(tarifaFinal)} = <strong>{formatPEN(noches * tarifaFinal)}</strong>
          </div>
        </div>

        <fieldset className="col-span-2 fieldset">
          <legend>Huesped titular</legend>
          <div className="inline-search">
            <input
              placeholder="Numero de documento"
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void buscarHuesped()
                }
              }}
            />
            <button type="button" className="btn btn-secondary" onClick={buscarHuesped} disabled={buscando}>
              {buscando ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          {huesped && (
            <div className="info-box">
              ✔ {huesped.nombres} {huesped.apellidos} · {humanizar(huesped.tipoDocumento)} {huesped.numeroDocumento}
              {huesped.nacionalidad && ` · ${huesped.nacionalidad}`}
            </div>
          )}
          {nuevo && (
            <div className="form-grid">
              <p className="muted small col-span-2">No existe un huesped con ese documento. Registralo rapidamente:</p>
              <label className="field">
                <span>Nombres</span>
                <input value={nuevo.nombres} onChange={(e) => setNuevo({ ...nuevo, nombres: e.target.value })} />
              </label>
              <label className="field">
                <span>Apellidos</span>
                <input value={nuevo.apellidos} onChange={(e) => setNuevo({ ...nuevo, apellidos: e.target.value })} />
              </label>
              <label className="field">
                <span>Tipo de documento</span>
                <select
                  value={nuevo.tipoDocumento}
                  onChange={(e) => setNuevo({ ...nuevo, tipoDocumento: e.target.value as TipoDocumento })}
                >
                  {TIPOS_DOCUMENTO.map((t) => (
                    <option key={t} value={t}>
                      {humanizar(t)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {(huesped || nuevo) && (
            <label className="field">
              <span>Motivo de viaje</span>
              <select value={motivo} onChange={(e) => setMotivo(e.target.value as MotivoViaje)}>
                {MOTIVOS_VIAJE.map((m) => (
                  <option key={m} value={m}>
                    {humanizar(m)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </fieldset>

        <label className="field col-span-2">
          <span>Observaciones</span>
          <textarea rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
        </label>

        <label className="checkbox col-span-2">
          <input type="checkbox" checked={cargarAlojamiento} onChange={(e) => setCargarAlojamiento(e.target.checked)} />
          Cargar el alojamiento al folio de la estancia
        </label>
      </form>
    </Modal>
  )
}
