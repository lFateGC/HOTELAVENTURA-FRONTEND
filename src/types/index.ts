// Modelos TypeScript alineados con los DTOs / entidades del backend (com.hotelaventura.dto)
// Fechas: LocalDate -> 'YYYY-MM-DD', LocalDateTime -> 'YYYY-MM-DDTHH:mm:ss'. BigDecimal -> number.

// ---------- Enums ----------
export type Rol = 'ADMIN' | 'RECEPCIONISTA' | 'HOUSEKEEPING' | 'CAJERO' | 'MANTENIMIENTO'
export const ROLES: Rol[] = ['ADMIN', 'RECEPCIONISTA', 'HOUSEKEEPING', 'CAJERO', 'MANTENIMIENTO']

export type EstadoOperativo = 'DISPONIBLE' | 'OCUPADA' | 'FUERA_DE_SERVICIO' | 'BLOQUEADA'
export const ESTADOS_OPERATIVOS: EstadoOperativo[] = ['DISPONIBLE', 'OCUPADA', 'FUERA_DE_SERVICIO', 'BLOQUEADA']

export type EstadoLimpieza = 'LIMPIA' | 'SUCIA' | 'INSPECCIONADA'
export const ESTADOS_LIMPIEZA: EstadoLimpieza[] = ['LIMPIA', 'SUCIA', 'INSPECCIONADA']

export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'EN_CASA' | 'FINALIZADA' | 'CANCELADA' | 'NO_SHOW'
export const ESTADOS_RESERVA: EstadoReserva[] = ['PENDIENTE', 'CONFIRMADA', 'EN_CASA', 'FINALIZADA', 'CANCELADA', 'NO_SHOW']

export type ModalidadEstancia = 'PERNOCTE' | 'DAY_USE'
export type EstadoEstancia = 'ACTIVA' | 'FINALIZADA'
export type EstadoFolio = 'ABIERTO' | 'CERRADO'
export type EstadoCaja = 'ABIERTA' | 'CERRADA'

export type MetodoPago = 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA'
export const METODOS_PAGO: MetodoPago[] = ['EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'YAPE', 'PLIN', 'TRANSFERENCIA']

export type CategoriaCargo = 'ALOJAMIENTO' | 'CONSUMO_POS' | 'MINIBAR' | 'LAVANDERIA' | 'PENALIDAD'
export const CATEGORIAS_CARGO: CategoriaCargo[] = ['ALOJAMIENTO', 'CONSUMO_POS', 'MINIBAR', 'LAVANDERIA', 'PENALIDAD']

export type CategoriaProducto = 'BEBIDAS' | 'SNACKS' | 'MINIBAR' | 'LAVANDERIA' | 'RESTAURANTE' | 'SERVICIOS'
export const CATEGORIAS_PRODUCTO: CategoriaProducto[] = ['BEBIDAS', 'SNACKS', 'MINIBAR', 'LAVANDERIA', 'RESTAURANTE', 'SERVICIOS']

export type TipoDocumento = 'DNI' | 'PASAPORTE' | 'CARNET_EXTRANJERIA' | 'OTRO'
export const TIPOS_DOCUMENTO: TipoDocumento[] = ['DNI', 'PASAPORTE', 'CARNET_EXTRANJERIA', 'OTRO']

export type MotivoViaje = 'TURISMO' | 'NEGOCIOS' | 'TRABAJO' | 'SALUD' | 'ESTUDIOS' | 'OTRO'
export const MOTIVOS_VIAJE: MotivoViaje[] = ['TURISMO', 'NEGOCIOS', 'TRABAJO', 'SALUD', 'ESTUDIOS', 'OTRO']

export type TipoLimpieza = 'SALIDA' | 'ESTANCIA' | 'RETOQUE' | 'PROFUNDA'
export const TIPOS_LIMPIEZA: TipoLimpieza[] = ['SALIDA', 'ESTANCIA', 'RETOQUE', 'PROFUNDA']
export type EstadoLimpiezaTarea = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA'

export type PrioridadIncidencia = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE'
export const PRIORIDADES: PrioridadIncidencia[] = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE']
export type EstadoIncidencia = 'REPORTADA' | 'EN_REPARACION' | 'RESUELTA'

// ---------- Auth / Usuarios ----------
export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  tipo: string
  id: number
  username: string
  email: string
  nombreCompleto: string
  roles: string[]
}

export type SessionUser = Omit<AuthResponse, 'token' | 'tipo'>

export interface UsuarioDTO {
  id: number
  username: string
  email: string
  nombreCompleto: string
  activo: boolean
  fechaCreacion?: string
  ultimoAcceso?: string
  roles: string[]
}

export interface RegistroUsuarioRequest {
  username: string
  email: string
  password: string
  nombreCompleto: string
  roles: string[]
}

export interface AuditoriaDTO {
  id: number
  usuario: string
  accion: string
  entidad: string
  entidadId?: number
  detalle?: string
  ip?: string
  fechaHora: string
}

// ---------- Habitaciones ----------
export interface TipoHabitacionDTO {
  id?: number
  nombre: string
  descripcion?: string
  capacidadAdultos: number
  capacidadNinos: number
  precioBase: number
  precioDayUse?: number
  imagenUrl?: string
}

export interface HabitacionDTO {
  id?: number
  numero: string
  tipoHabitacionId: number
  tipoHabitacionNombre?: string
  pisoId: number
  pisoNumero?: number
  estadoOperativo?: EstadoOperativo
  estadoLimpieza?: EstadoLimpieza
  tarifaPersonalizada?: number
  precioFinal?: number
  activa?: boolean
  observaciones?: string
}

// ---------- Reservas ----------
export interface ReservaRequestDTO {
  nombreTitular: string
  documentoTitular: string
  telefonoTitular?: string
  emailTitular?: string
  tipoHabitacionId: number
  habitacionAsignadaId?: number
  fechaLlegada: string
  fechaSalida: string
  adultos: number
  ninos: number
  adelantoDeposito?: number
}

export interface ReservaResponseDTO {
  id: number
  codigo: string
  nombreTitular: string
  documentoTitular: string
  telefonoTitular?: string
  emailTitular?: string
  tipoHabitacionId: number
  tipoHabitacionNombre?: string
  habitacionAsignadaId?: number
  habitacionNumero?: string
  fechaLlegada: string
  fechaSalida: string
  noches: number
  adultos: number
  ninos: number
  estado: EstadoReserva
  totalEstimado?: number
  adelantoDeposito?: number
  motivoCancelacion?: string
  fechaCreacion?: string
}

// ---------- Estancias (Check-In / Check-Out) ----------
// El backend devuelve la entidad completa (no DTO), con relaciones anidadas.
export interface HabitacionEntidad {
  id: number
  numero: string
  tipoHabitacion?: TipoHabitacionDTO
  piso?: { id: number; numero: number; nombre: string }
  estadoOperativo: EstadoOperativo
  estadoLimpieza: EstadoLimpieza
  tarifaPersonalizada?: number
  activa?: boolean
  observaciones?: string
}

export interface Estancia {
  id: number
  codigo: string
  reserva?: (Omit<ReservaResponseDTO, 'tipoHabitacionNombre'> & { tipoHabitacion?: TipoHabitacionDTO }) | null
  habitacion: HabitacionEntidad
  modalidad: ModalidadEstancia
  checkInReal: string
  checkOutPrevisto: string
  checkOutReal?: string
  tarifaAcordada: number
  estado: EstadoEstancia
  observaciones?: string
}

export interface CheckInRequestDTO {
  reservaId?: number
  habitacionId: number
  modalidad: ModalidadEstancia
  checkOutPrevisto: string
  tarifaAcordada?: number
  observaciones?: string
}

export interface CheckOutRequestDTO {
  estanciaId: number
  observaciones?: string
  usuarioResponsable?: string
}

// ---------- Folios ----------
export interface Folio {
  id: number
  estanciaId: number
  estado: EstadoFolio
  totalCargos: number
  totalAbonos: number
  saldo: number
  fechaApertura: string
  fechaCierre?: string
}

export interface Cargo {
  id: number
  concepto: string
  categoria: CategoriaCargo
  cantidad: number
  precioUnitario: number
  montoTotal: number
  fecha: string
  anulado: boolean
  motivoAnulacion?: string
}

export interface CargoDTO {
  folioId: number
  concepto: string
  categoria: CategoriaCargo
  cantidad: number
  precioUnitario: number
}

export interface Pago {
  id: number
  metodo: MetodoPago
  monto: number
  referencia?: string
  turnoCajaId?: number
  fecha: string
}

export interface PagoDTO {
  folioId: number
  metodo: MetodoPago
  monto: number
  referencia?: string
  turnoCajaId?: number
}

// ---------- Huespedes ----------
export interface HuespedDTO {
  id?: number
  nombres: string
  apellidos: string
  tipoDocumento: TipoDocumento
  numeroDocumento: string
  fechaNacimiento?: string
  sexo?: string
  nacionalidad?: string
  residencia?: string
  telefono?: string
  email?: string
  activo?: boolean
  fechaRegistro?: string
  preferencias?: string
}

export interface RegistroHuespedDTO {
  id?: number
  estanciaId: number
  huespedId: number
  huespedNombreCompleto?: string
  huespedDocumento?: string
  motivoViaje: MotivoViaje
  esTitular: boolean
  fechaIngreso?: string
  fechaSalida?: string
  observaciones?: string
}

// ---------- Dashboard ----------
export interface DashboardKpiDTO {
  totalHabitaciones: number
  habitacionesDisponibles: number
  habitacionesOcupadas: number
  habitacionesEnLimpieza: number
  habitacionesEnMantenimiento: number
  porcentajeOcupacion: number
  estanciasActivas: number
  reservasPendientes: number
  reservasConfirmadas: number
  ingresosAproximadosMes: number
  ocupacionPorPiso: Record<string, number>
}

// ---------- POS / Caja / Productos ----------
export interface ProductoDTO {
  id?: number
  nombre: string
  categoria: CategoriaProducto
  precioVenta: number
  costoUnitario?: number
  stockActual: number
  stockMinimo: number
  controlaStock: boolean
  activo: boolean
  imagenUrl?: string
}

export interface ItemVentaDTO {
  productoId: number
  productoNombre?: string
  cantidad: number
  precioUnitario?: number
  subtotal?: number
}

export interface VentaPOSDTO {
  id?: number
  codigo?: string
  vendedor?: string
  folioId?: number | null
  habitacionNumero?: string
  metodoPago: MetodoPago
  montoTotal?: number
  fecha?: string
  items: ItemVentaDTO[]
}

export interface TurnoCaja {
  id: number
  cajero: string
  fechaApertura: string
  fechaCierre?: string
  montoInicial: number
  totalVentasEfectivo: number
  totalVentasDigital: number
  montoFinalContado?: number
  diferencia?: number
  estado: EstadoCaja
  observaciones?: string
}

// ---------- Operaciones ----------
export interface TareaLimpiezaDTO {
  id?: number
  habitacionId: number
  habitacionNumero?: string
  tipo: TipoLimpieza
  estado?: EstadoLimpiezaTarea
  asignadoA?: string
  fechaHoraCreacion?: string
  fechaHoraInicio?: string
  fechaHoraFin?: string
  notas?: string
}

export interface IncidenciaDTO {
  id?: number
  habitacionId: number
  habitacionNumero?: string
  titulo: string
  descripcion: string
  prioridad: PrioridadIncidencia
  estado?: EstadoIncidencia
  reportadaPor: string
  asignadaA?: string
  fechaReporte?: string
  fechaSolucion?: string
  solucionAplicada?: string
  fotoEvidenciaUrl?: string
}

// ---------- Errores ----------
export interface ErrorResponse {
  timestamp?: string
  status: number
  error?: string
  message?: string
  path?: string
  details?: string[]
}
