import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/Modal'
import { useToast } from '../../hooks/useToast'
import { mensajeError } from '../../services/api'
import { huespedService } from '../../services/huespedService'
import { TIPOS_DOCUMENTO, type HuespedDTO, type TipoDocumento } from '../../types'
import { humanizar, validarDocumento } from '../../utils/format'

interface RegistroRapidoHuespedModalProps {
  open: boolean
  onClose: () => void
  onCreated: (huesped: HuespedDTO) => void
  documentoInicial?: string
}

/**
 * Modal de "Registro Rapido" para usar desde el Punto de Venta (POS) o Check-In
 * sin abandonar el carrito ni perder el flujo actual.
 */
export function RegistroRapidoHuespedModal({
  open,
  onClose,
  onCreated,
  documentoInicial = '',
}: RegistroRapidoHuespedModalProps) {
  const toast = useToast()
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>('DNI')
  const [numeroDocumento, setNumeroDocumento] = useState(documentoInicial)
  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  const handleDocumentoChange = (val: string) => {
    if (tipoDocumento === 'DNI') {
      setNumeroDocumento(val.replace(/\D/g, '').slice(0, 8))
    } else {
      setNumeroDocumento(val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20))
    }
  }

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    const errDoc = validarDocumento(tipoDocumento, numeroDocumento)
    if (errDoc) return toast.error(errDoc)
    setSaving(true)
    try {
      const creado = await huespedService.registrar({
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        tipoDocumento,
        numeroDocumento: numeroDocumento.trim(),
        nacionalidad: 'Peruana',
        telefono: telefono.trim() || undefined,
        email: email.trim() || undefined,
        activo: true,
      })
      toast.success(`Cliente ${creado.nombres} ${creado.apellidos} registrado y seleccionado`)
      onCreated(creado)
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
      title="Registro Rapido de Huesped / Cliente"
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="registro-rapido-form" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar y seleccionar'}
          </button>
        </>
      }
    >
      <form id="registro-rapido-form" className="form-grid" onSubmit={guardar}>
        <label className="field">
          <span>Tipo de documento *</span>
          <select
            value={tipoDocumento}
            onChange={(e) => {
              const nuevoTipo = e.target.value as TipoDocumento
              setTipoDocumento(nuevoTipo)
              if (nuevoTipo === 'DNI') setNumeroDocumento((d) => d.replace(/\D/g, '').slice(0, 8))
            }}
          >
            {TIPOS_DOCUMENTO.map((t) => (
              <option key={t} value={t}>
                {humanizar(t)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Numero ({tipoDocumento === 'DNI' ? '8 digitos' : '6-20 caracteres'}) *</span>
          <input
            required
            inputMode={tipoDocumento === 'DNI' ? 'numeric' : 'text'}
            maxLength={tipoDocumento === 'DNI' ? 8 : 20}
            placeholder={tipoDocumento === 'DNI' ? 'Ej. 71234567' : 'Documento'}
            value={numeroDocumento}
            onChange={(e) => handleDocumentoChange(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Nombres *</span>
          <input required value={nombres} onChange={(e) => setNombres(e.target.value)} />
        </label>
        <label className="field">
          <span>Apellidos *</span>
          <input required value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
        </label>
        <label className="field">
          <span>Telefono</span>
          <input
            inputMode="numeric"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/[^\d+ -]/g, '').slice(0, 15))}
          />
        </label>
        <label className="field">
          <span>Correo electronico</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      </form>
    </Modal>
  )
}
