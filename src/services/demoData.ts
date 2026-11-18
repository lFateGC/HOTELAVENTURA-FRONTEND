import type {
  AuditoriaDTO,
  AuthResponse,
  Cargo,
  DashboardKpiDTO,
  Estancia,
  Folio,
  HabitacionDTO,
  HuespedDTO,
  IncidenciaDTO,
  Pago,
  ProductoDTO,
  RegistroHuespedDTO,
  ReservaResponseDTO,
  Rol,
  TareaLimpiezaDTO,
  TipoHabitacionDTO,
  TurnoCaja,
  UsuarioDTO,
  VentaPOSDTO,
} from '../types'
import { hoyISO } from '../utils/format'

// Token JWT simulado con expiracion en 24h para el Modo Demo Interactivo
export function crearTokenDemo(username: string, roles: Rol[]): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      sub: username,
      roles,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    }),
  )
  return `${header}.${payload}.demo_signature`
}

export const DEMO_USERS: Record<string, { nombreCompleto: string; email: string; roles: Rol[] }> = {
  kenny: {
    nombreCompleto: 'Kenny Garay (Admin)',
    email: 'kenny@hotelaventura.pe',
    roles: ['ADMIN'],
  },
  david: {
    nombreCompleto: 'David Asto (Recepcion)',
    email: 'david@hotelaventura.pe',
    roles: ['RECEPCIONISTA'],
  },
  eliseo: {
    nombreCompleto: 'Eliseo Marino (Cajero POS)',
    email: 'eliseo@hotelaventura.pe',
    roles: ['CAJERO'],
  },
  hector: {
    nombreCompleto: 'Hector Urbano (Operaciones)',
    email: 'hector@hotelaventura.pe',
    roles: ['HOUSEKEEPING', 'MANTENIMIENTO'],
  },
}

const tipos: TipoHabitacionDTO[] = [
  { id: 1, nombre: 'Simple Estandar', capacidadAdultos: 1, capacidadNinos: 0, precioBase: 120, precioDayUse: 60 },
  { id: 2, nombre: 'Matrimonial', capacidadAdultos: 2, capacidadNinos: 1, precioBase: 180, precioDayUse: 90 },
  { id: 3, nombre: 'Doble Twin', capacidadAdultos: 2, capacidadNinos: 2, precioBase: 210, precioDayUse: 110 },
  { id: 4, nombre: 'Suite Ejecutiva', capacidadAdultos: 2, capacidadNinos: 2, precioBase: 320, precioDayUse: 160 },
]

const habitaciones: HabitacionDTO[] = [
  { id: 101, numero: '101', tipoHabitacionId: 1, tipoHabitacionNombre: 'Simple Estandar', pisoId: 1, pisoNumero: 1, estadoOperativo: 'DISPONIBLE', estadoLimpieza: 'LIMPIA', precioFinal: 120, activa: true },
  { id: 102, numero: '102', tipoHabitacionId: 2, tipoHabitacionNombre: 'Matrimonial', pisoId: 1, pisoNumero: 1, estadoOperativo: 'OCUPADA', estadoLimpieza: 'LIMPIA', precioFinal: 180, activa: true },
  { id: 103, numero: '103', tipoHabitacionId: 2, tipoHabitacionNombre: 'Matrimonial', pisoId: 1, pisoNumero: 1, estadoOperativo: 'DISPONIBLE', estadoLimpieza: 'SUCIA', precioFinal: 180, activa: true },
  { id: 104, numero: '104', tipoHabitacionId: 3, tipoHabitacionNombre: 'Doble Twin', pisoId: 1, pisoNumero: 1, estadoOperativo: 'DISPONIBLE', estadoLimpieza: 'LIMPIA', precioFinal: 210, activa: true },
  { id: 201, numero: '201', tipoHabitacionId: 2, tipoHabitacionNombre: 'Matrimonial', pisoId: 2, pisoNumero: 2, estadoOperativo: 'OCUPADA', estadoLimpieza: 'LIMPIA', precioFinal: 180, activa: true },
  { id: 202, numero: '202', tipoHabitacionId: 3, tipoHabitacionNombre: 'Doble Twin', pisoId: 2, pisoNumero: 2, estadoOperativo: 'DISPONIBLE', estadoLimpieza: 'LIMPIA', precioFinal: 210, activa: true },
  { id: 203, numero: '203', tipoHabitacionId: 4, tipoHabitacionNombre: 'Suite Ejecutiva', pisoId: 2, pisoNumero: 2, estadoOperativo: 'FUERA_DE_SERVICIO', estadoLimpieza: 'SUCIA', precioFinal: 320, activa: true, observaciones: 'Revision de aire acondicionado' },
  { id: 301, numero: '301', tipoHabitacionId: 4, tipoHabitacionNombre: 'Suite Ejecutiva', pisoId: 3, pisoNumero: 3, estadoOperativo: 'DISPONIBLE', estadoLimpieza: 'INSPECCIONADA', precioFinal: 320, activa: true },
  { id: 302, numero: '302', tipoHabitacionId: 2, tipoHabitacionNombre: 'Matrimonial', pisoId: 3, pisoNumero: 3, estadoOperativo: 'OCUPADA', estadoLimpieza: 'LIMPIA', precioFinal: 180, activa: true },
]

const huespedes: HuespedDTO[] = [
  { id: 1, nombres: 'Carlos Alberto', apellidos: 'Mendoza Rios', tipoDocumento: 'DNI', numeroDocumento: '72349812', nacionalidad: 'Peruana', residencia: 'Av. Arequipa 1450, Lima', telefono: '987654321', email: 'cmendoza@gmail.com', activo: true, fechaRegistro: hoyISO(-15), preferencias: 'Piso alto, lejos del ascensor' },
  { id: 2, nombres: 'Lucia Fernanda', apellidos: 'Vargas Paredes', tipoDocumento: 'DNI', numeroDocumento: '45891203', nacionalidad: 'Peruana', residencia: 'Calle Mercaderes 310, Arequipa', telefono: '912345678', email: 'lucia.vargas@outlook.com', activo: true, fechaRegistro: hoyISO(-7), preferencias: 'Almohada hipoalergenica' },
  { id: 3, nombres: 'Martin', apellidos: 'Gomez Echeverria', tipoDocumento: 'PASAPORTE', numeroDocumento: 'AR9988112', nacionalidad: 'Argentina', residencia: 'Buenos Aires', telefono: '+54 911 445566', email: 'mgomez@empresa.ar', activo: true, fechaRegistro: hoyISO(-3) },
  { id: 4, nombres: 'Elena Sofia', apellidos: 'Quispe Huaman', tipoDocumento: 'DNI', numeroDocumento: '70112233', nacionalidad: 'Peruana', residencia: 'Jr. Puno 420, Cusco', telefono: '955443322', email: 'elena.qh@correo.pe', activo: false, fechaRegistro: hoyISO(-30) },
]

const reservas: ReservaResponseDTO[] = [
  { id: 1, codigo: 'RES-2026-001', nombreTitular: 'Carlos Alberto Mendoza Rios', documentoTitular: '72349812', telefonoTitular: '987654321', emailTitular: 'cmendoza@gmail.com', tipoHabitacionId: 2, tipoHabitacionNombre: 'Matrimonial', habitacionAsignadaId: 102, habitacionNumero: '102', fechaLlegada: hoyISO(-1), fechaSalida: hoyISO(2), noches: 3, adultos: 2, ninos: 0, estado: 'EN_CASA', totalEstimado: 540, adelantoDeposito: 200 },
  { id: 2, codigo: 'RES-2026-002', nombreTitular: 'Lucia Fernanda Vargas Paredes', documentoTitular: '45891203', telefonoTitular: '912345678', emailTitular: 'lucia.vargas@outlook.com', tipoHabitacionId: 3, tipoHabitacionNombre: 'Doble Twin', fechaLlegada: hoyISO(0), fechaSalida: hoyISO(2), noches: 2, adultos: 2, ninos: 1, estado: 'CONFIRMADA', totalEstimado: 420, adelantoDeposito: 100 },
  { id: 3, codigo: 'RES-2026-003', nombreTitular: 'Martin Gomez Echeverria', documentoTitular: 'AR9988112', tipoHabitacionId: 4, tipoHabitacionNombre: 'Suite Ejecutiva', fechaLlegada: hoyISO(0), fechaSalida: hoyISO(3), noches: 3, adultos: 2, ninos: 0, estado: 'PENDIENTE', totalEstimado: 960, adelantoDeposito: 0 },
]

const estancias: Estancia[] = [
  {
    id: 1,
    codigo: 'EST-2026-001',
    reserva: { ...reservas[0], tipoHabitacion: tipos[1] },
    habitacion: { id: 102, numero: '102', tipoHabitacion: tipos[1], estadoOperativo: 'OCUPADA', estadoLimpieza: 'LIMPIA' },
    modalidad: 'PERNOCTE',
    checkInReal: `${hoyISO(-1)}T14:15:00`,
    checkOutPrevisto: `${hoyISO(2)}T12:00:00`,
    tarifaAcordada: 180,
    estado: 'ACTIVA',
    observaciones: 'Cliente frecuente',
  },
  {
    id: 2,
    codigo: 'EST-2026-002',
    reserva: null,
    habitacion: { id: 201, numero: '201', tipoHabitacion: tipos[1], estadoOperativo: 'OCUPADA', estadoLimpieza: 'LIMPIA' },
    modalidad: 'DAY_USE',
    checkInReal: `${hoyISO(0)}T09:00:00`,
    checkOutPrevisto: `${hoyISO(0)}T15:00:00`,
    tarifaAcordada: 90,
    estado: 'ACTIVA',
    observaciones: 'Day use por 6 horas',
  },
]

const folios: Folio[] = [
  { id: 1, estanciaId: 1, estado: 'ABIERTO', totalCargos: 575, totalAbonos: 200, saldo: 375, fechaApertura: `${hoyISO(-1)}T14:15:00` },
  { id: 2, estanciaId: 2, estado: 'ABIERTO', totalCargos: 90, totalAbonos: 90, saldo: 0, fechaApertura: `${hoyISO(0)}T09:00:00` },
]

const cargosPorFolio: Record<number, Cargo[]> = {
  1: [
    { id: 1, concepto: 'Alojamiento Hab. 102 (3 noches)', categoria: 'ALOJAMIENTO', cantidad: 3, precioUnitario: 180, montoTotal: 540, fecha: `${hoyISO(-1)}T14:16:00`, anulado: false },
    { id: 2, concepto: 'Consumo POS: Agua Mineral + Pringles', categoria: 'CONSUMO_POS', cantidad: 1, precioUnitario: 35, montoTotal: 35, fecha: `${hoyISO(0)}T10:30:00`, anulado: false },
  ],
  2: [
    { id: 3, concepto: 'Day use Hab. 201', categoria: 'ALOJAMIENTO', cantidad: 1, precioUnitario: 90, montoTotal: 90, fecha: `${hoyISO(0)}T09:01:00`, anulado: false },
  ],
}

const pagosPorFolio: Record<number, Pago[]> = {
  1: [{ id: 1, metodo: 'YAPE', monto: 200, referencia: 'OP-882190', fecha: `${hoyISO(-1)}T14:20:00` }],
  2: [{ id: 2, metodo: 'EFECTIVO', monto: 90, fecha: `${hoyISO(0)}T09:05:00` }],
}

const productos: ProductoDTO[] = [
  { id: 1, nombre: 'Agua Mineral San Mateo 600ml', categoria: 'BEBIDAS', precioVenta: 6, stockActual: 42, stockMinimo: 10, controlaStock: true, activo: true },
  { id: 2, nombre: 'Gaseosa Inca Kola 500ml', categoria: 'BEBIDAS', precioVenta: 8, stockActual: 30, stockMinimo: 8, controlaStock: true, activo: true },
  { id: 3, nombre: 'Cafe Espresso Doble', categoria: 'RESTAURANTE', precioVenta: 12, stockActual: 99, stockMinimo: 5, controlaStock: false, activo: true },
  { id: 4, nombre: 'Papas Pringles Original', categoria: 'SNACKS', precioVenta: 14, stockActual: 15, stockMinimo: 5, controlaStock: true, activo: true },
  { id: 5, nombre: 'Cerveza Cusquena Dorada 330ml', categoria: 'MINIBAR', precioVenta: 15, stockActual: 24, stockMinimo: 6, controlaStock: true, activo: true },
  { id: 6, nombre: 'Servicio de Lavanderia Express', categoria: 'LAVANDERIA', precioVenta: 35, stockActual: 100, stockMinimo: 0, controlaStock: false, activo: true },
]

const turnosCaja: TurnoCaja[] = [
  { id: 1, cajero: 'eliseo', fechaApertura: `${hoyISO(0)}T07:00:00`, montoInicial: 200, totalVentasEfectivo: 145, totalVentasDigital: 230, estado: 'ABIERTA', observaciones: 'Turno manana' },
]

const ventasPOS: VentaPOSDTO[] = [
  { id: 1, codigo: 'POS-0001', vendedor: 'eliseo', habitacionNumero: '102', metodoPago: 'YAPE', montoTotal: 35, fecha: `${hoyISO(0)}T10:30:00`, items: [{ productoId: 1, productoNombre: 'Agua Mineral San Mateo 600ml', cantidad: 1, precioUnitario: 6, subtotal: 6 }, { productoId: 4, productoNombre: 'Papas Pringles Original', cantidad: 2, precioUnitario: 14.5, subtotal: 29 }] },
]

const tareasLimpieza: TareaLimpiezaDTO[] = [
  { id: 1, habitacionId: 103, habitacionNumero: '103', tipo: 'SALIDA', estado: 'PENDIENTE', asignadoA: 'Rosa Quispe', fechaHoraCreacion: `${hoyISO(0)}T11:20:00`, notas: 'Cambio completo de sabanas y toallas' },
  { id: 2, habitacionId: 102, habitacionNumero: '102', tipo: 'ESTANCIA', estado: 'EN_PROCESO', asignadoA: 'Carmen Flores', fechaHoraCreacion: `${hoyISO(0)}T10:00:00`, notas: 'Reposicion de amenities' },
]

const incidencias: IncidenciaDTO[] = [
  { id: 1, habitacionId: 203, habitacionNumero: '203', titulo: 'Aire acondicionado no enfria', descripcion: 'El split enciende pero no enfria adecuadamente', prioridad: 'ALTA', estado: 'EN_REPARACION', reportadaPor: 'hector', asignadaA: 'Tecnico Jorge', fechaReporte: `${hoyISO(0)}T08:40:00` },
]

const usuarios: UsuarioDTO[] = [
  { id: 1, username: 'kenny', email: 'kenny@hotelaventura.pe', nombreCompleto: 'Kenny Sebastian Garay Carlos', activo: true, ultimoAcceso: `${hoyISO(0)}T13:30:00`, roles: ['ADMIN'] },
  { id: 2, username: 'david', email: 'david@hotelaventura.pe', nombreCompleto: 'David Josue Asto Condori', activo: true, ultimoAcceso: `${hoyISO(0)}T12:15:00`, roles: ['RECEPCIONISTA'] },
  { id: 3, username: 'erik', email: 'erik@hotelaventura.pe', nombreCompleto: 'Erik Eduardo Barrera Chavez', activo: true, ultimoAcceso: `${hoyISO(0)}T11:45:00`, roles: ['RECEPCIONISTA'] },
  { id: 4, username: 'eliseo', email: 'eliseo@hotelaventura.pe', nombreCompleto: 'Eliseo Marino Avila', activo: true, ultimoAcceso: `${hoyISO(0)}T11:00:00`, roles: ['CAJERO'] },
  { id: 5, username: 'hector', email: 'hector@hotelaventura.pe', nombreCompleto: 'Hector Ivan Urbano Pilco', activo: true, ultimoAcceso: `${hoyISO(0)}T10:20:00`, roles: ['HOUSEKEEPING', 'MANTENIMIENTO'] },
]

const auditoria: AuditoriaDTO[] = [
  { id: 1, usuario: 'kenny', accion: 'LOGIN_EXITOSO', entidad: 'Usuario', entidadId: 1, detalle: 'Inicio de sesion administrativo', ip: '127.0.0.1', fechaHora: `${hoyISO(0)}T13:30:00` },
  { id: 2, usuario: 'david', accion: 'CHECK_IN', entidad: 'Estancia', entidadId: 1, detalle: 'Check-In realizado en Hab. 102 (EST-2026-001)', ip: '127.0.0.1', fechaHora: `${hoyISO(-1)}T14:15:00` },
  { id: 3, usuario: 'eliseo', accion: 'APERTURA_CAJA', entidad: 'TurnoCaja', entidadId: 1, detalle: 'Apertura de caja chica con S/ 200.00', ip: '127.0.0.1', fechaHora: `${hoyISO(0)}T07:00:00` },
]

/**
 * Responde las peticiones REST en memoria cuando el backend de Spring Boot / Supabase
 * no esta disponible, permitiendo probar todos los flujos sin errores.
 */
export function handleDemoRequest<T>(path: string, method = 'GET', body?: unknown, query?: Record<string, unknown>): T {
  const clean = path.split('?')[0]

  // Auth
  if (clean === '/auth/login' && method === 'POST') {
    const req = (body ?? {}) as { username?: string }
    const uKey = (req.username ?? 'kenny').toLowerCase()
    const u = DEMO_USERS[uKey] ?? {
      nombreCompleto: req.username || 'Usuario Demo',
      email: `${uKey}@hotelaventura.pe`,
      roles: ['ADMIN'] as Rol[],
    }
    const resp: AuthResponse = {
      token: crearTokenDemo(uKey, u.roles),
      tipo: 'Bearer',
      id: 1,
      username: uKey,
      email: u.email,
      nombreCompleto: u.nombreCompleto,
      roles: u.roles,
    }
    return resp as T
  }

  if (clean === '/auth/registro' && method === 'POST') {
    const req = body as UsuarioDTO
    const nuevo: UsuarioDTO = {
      id: usuarios.length + 1,
      username: req.username,
      email: req.email,
      nombreCompleto: req.nombreCompleto,
      activo: true,
      ultimoAcceso: new Date().toISOString(),
      roles: req.roles,
    }
    usuarios.push(nuevo)
    return nuevo as T
  }

  // Dashboard KPIs
  if (clean === '/dashboard/kpis') {
    const disp = habitaciones.filter((h) => h.estadoOperativo === 'DISPONIBLE' && h.estadoLimpieza !== 'SUCIA').length
    const ocup = habitaciones.filter((h) => h.estadoOperativo === 'OCUPADA').length
    const limp = habitaciones.filter((h) => h.estadoLimpieza === 'SUCIA').length
    const mant = habitaciones.filter((h) => h.estadoOperativo === 'FUERA_DE_SERVICIO').length
    const kpi: DashboardKpiDTO = {
      totalHabitaciones: habitaciones.length,
      habitacionesDisponibles: disp,
      habitacionesOcupadas: ocup,
      habitacionesEnLimpieza: limp,
      habitacionesEnMantenimiento: mant,
      porcentajeOcupacion: (ocup / habitaciones.length) * 100,
      estanciasActivas: estancias.filter((e) => e.estado === 'ACTIVA').length,
      reservasPendientes: reservas.filter((r) => r.estado === 'PENDIENTE').length,
      reservasConfirmadas: reservas.filter((r) => r.estado === 'CONFIRMADA').length,
      ingresosAproximadosMes: 14850,
      ocupacionPorPiso: { '1': 1, '2': 1, '3': 1 },
    }
    return kpi as T
  }

  // Habitaciones y Tipos
  if (clean === '/tipos-habitacion') return [...tipos] as T
  if (clean === '/habitaciones' || clean === '/habitaciones/rack') return [...habitaciones] as T
  if (clean.startsWith('/habitaciones/') && clean.endsWith('/estado-operativo')) {
    const id = Number(clean.split('/')[2])
    const h = habitaciones.find((x) => x.id === id)
    if (h && query?.estado) h.estadoOperativo = query.estado as HabitacionDTO['estadoOperativo']
    return { ...h } as T
  }
  if (clean.startsWith('/habitaciones/') && clean.endsWith('/estado-limpieza')) {
    const id = Number(clean.split('/')[2])
    const h = habitaciones.find((x) => x.id === id)
    if (h && query?.estado) h.estadoLimpieza = query.estado as HabitacionDTO['estadoLimpieza']
    return { ...h } as T
  }

  // Reservas
  if (clean === '/reservas' && method === 'GET') return [...reservas] as T
  if (clean === '/reservas' && method === 'POST') {
    const req = body as Partial<ReservaResponseDTO>
    const tipo = tipos.find((t) => t.id === Number(req.tipoHabitacionId)) ?? tipos[0]
    const nueva: ReservaResponseDTO = {
      id: reservas.length + 1,
      codigo: `RES-2026-00${reservas.length + 1}`,
      nombreTitular: req.nombreTitular ?? '',
      documentoTitular: req.documentoTitular ?? '',
      telefonoTitular: req.telefonoTitular,
      emailTitular: req.emailTitular,
      tipoHabitacionId: tipo.id!,
      tipoHabitacionNombre: tipo.nombre,
      fechaLlegada: req.fechaLlegada ?? hoyISO(0),
      fechaSalida: req.fechaSalida ?? hoyISO(1),
      noches: 1,
      adultos: req.adultos ?? 1,
      ninos: req.ninos ?? 0,
      estado: 'CONFIRMADA',
      totalEstimado: tipo.precioBase,
      adelantoDeposito: req.adelantoDeposito ?? 0,
    }
    reservas.unshift(nueva)
    return nueva as T
  }
  if (clean.startsWith('/reservas/') && clean.endsWith('/confirmar')) {
    const id = Number(clean.split('/')[2])
    const r = reservas.find((x) => x.id === id)
    if (r) r.estado = 'CONFIRMADA'
    return { ...r } as T
  }
  if (clean.startsWith('/reservas/') && clean.endsWith('/cancelar')) {
    const id = Number(clean.split('/')[2])
    const r = reservas.find((x) => x.id === id)
    if (r) r.estado = 'CANCELADA'
    return { ...r } as T
  }

  // Estancias (Check-in / Check-out)
  if (clean === '/estancias/activas') return estancias.filter((e) => e.estado === 'ACTIVA') as T
  if (clean === '/estancias') return [...estancias] as T
  if (clean === '/estancias/check-in' && method === 'POST') {
    const req = body as { habitacionId: number; modalidad: Estancia['modalidad']; checkOutPrevisto: string; tarifaAcordada?: number; observaciones?: string }
    const hab = habitaciones.find((h) => h.id === Number(req.habitacionId)) ?? habitaciones[0]
    hab.estadoOperativo = 'OCUPADA'
    const nueva: Estancia = {
      id: estancias.length + 1,
      codigo: `EST-2026-00${estancias.length + 1}`,
      habitacion: { id: hab.id!, numero: hab.numero, estadoOperativo: 'OCUPADA', estadoLimpieza: hab.estadoLimpieza ?? 'LIMPIA' },
      modalidad: req.modalidad,
      checkInReal: new Date().toISOString(),
      checkOutPrevisto: req.checkOutPrevisto,
      tarifaAcordada: req.tarifaAcordada ?? hab.precioFinal ?? 150,
      estado: 'ACTIVA',
      observaciones: req.observaciones,
    }
    estancias.unshift(nueva)
    folios.push({
      id: folios.length + 1,
      estanciaId: nueva.id,
      estado: 'ABIERTO',
      totalCargos: 0,
      totalAbonos: 0,
      saldo: 0,
      fechaApertura: new Date().toISOString(),
    })
    return nueva as T
  }
  if (clean === '/estancias/check-out' && method === 'POST') {
    const req = body as { estanciaId: number }
    const est = estancias.find((e) => e.id === Number(req.estanciaId))
    if (est) {
      est.estado = 'FINALIZADA'
      est.checkOutReal = new Date().toISOString()
      const hab = habitaciones.find((h) => h.id === est.habitacion.id)
      if (hab) {
        hab.estadoOperativo = 'DISPONIBLE'
        hab.estadoLimpieza = 'SUCIA'
      }
    }
    return { ...est } as T
  }

  // Folios
  if (clean.startsWith('/folios/estancia/')) {
    const estanciaId = Number(clean.split('/')[3])
    let f = folios.find((x) => x.estanciaId === estanciaId)
    if (!f) {
      f = { id: folios.length + 1, estanciaId, estado: 'ABIERTO', totalCargos: 0, totalAbonos: 0, saldo: 0, fechaApertura: new Date().toISOString() }
      folios.push(f)
    }
    return { ...f } as T
  }
  if (clean.match(/^\/folios\/\d+\/cargos$/)) {
    const id = Number(clean.split('/')[2])
    return (cargosPorFolio[id] ?? []) as T
  }
  if (clean.match(/^\/folios\/\d+\/pagos$/)) {
    const id = Number(clean.split('/')[2])
    return (pagosPorFolio[id] ?? []) as T
  }
  if (clean === '/folios/cargos' && method === 'POST') {
    const req = body as { folioId: number; concepto: string; categoria: Cargo['categoria']; cantidad: number; precioUnitario: number }
    const total = req.cantidad * req.precioUnitario
    const c: Cargo = { id: Date.now(), concepto: req.concepto, categoria: req.categoria, cantidad: req.cantidad, precioUnitario: req.precioUnitario, montoTotal: total, fecha: new Date().toISOString(), anulado: false }
    cargosPorFolio[req.folioId] = [...(cargosPorFolio[req.folioId] ?? []), c]
    const f = folios.find((x) => x.id === req.folioId)
    if (f) {
      f.totalCargos += total
      f.saldo = f.totalCargos - f.totalAbonos
    }
    return c as T
  }
  if (clean === '/folios/pagos' && method === 'POST') {
    const req = body as { folioId: number; metodo: Pago['metodo']; monto: number; referencia?: string }
    const p: Pago = { id: Date.now(), metodo: req.metodo, monto: req.monto, referencia: req.referencia, fecha: new Date().toISOString() }
    pagosPorFolio[req.folioId] = [...(pagosPorFolio[req.folioId] ?? []), p]
    const f = folios.find((x) => x.id === req.folioId)
    if (f) {
      f.totalAbonos += req.monto
      f.saldo = f.totalCargos - f.totalAbonos
    }
    return p as T
  }
  if (clean.match(/^\/folios\/\d+\/cerrar$/)) {
    const id = Number(clean.split('/')[2])
    const f = folios.find((x) => x.id === id)
    if (f) f.estado = 'CERRADO'
    return { ...f } as T
  }

  // Huespedes / Clientes
  if (clean === '/huespedes' && method === 'GET') return [...huespedes] as T
  if (clean.startsWith('/huespedes/documento/')) {
    const doc = decodeURIComponent(clean.split('/')[3])
    const h = huespedes.find((x) => x.numeroDocumento === doc) ?? huespedes[0]
    return { ...h } as T
  }
  if (clean === '/huespedes' && method === 'POST') {
    const req = body as HuespedDTO
    const nuevo: HuespedDTO = { ...req, id: huespedes.length + 1, activo: true, fechaRegistro: hoyISO(0) }
    huespedes.unshift(nuevo)
    return nuevo as T
  }
  if (clean.startsWith('/huespedes/') && method === 'PUT') {
    const id = Number(clean.split('/')[2])
    const idx = huespedes.findIndex((x) => x.id === id)
    if (idx !== -1) huespedes[idx] = { ...huespedes[idx], ...(body as HuespedDTO) }
    return huespedes[idx] as T
  }
  if (clean.startsWith('/huespedes/estancia/')) {
    const reg: RegistroHuespedDTO[] = [
      { id: 1, estanciaId: 1, huespedId: 1, huespedNombreCompleto: 'Carlos Alberto Mendoza Rios', huespedDocumento: '72349812', motivoViaje: 'TURISMO', esTitular: true },
    ]
    return reg as T
  }
  if (clean === '/huespedes/registro-estancia') return body as T

  // POS / Productos / Caja
  if (clean === '/productos' && method === 'GET') return [...productos] as T
  if (clean === '/productos' && method === 'POST') {
    const nuevo = { ...(body as ProductoDTO), id: productos.length + 1 }
    productos.push(nuevo)
    return nuevo as T
  }
  if (clean.startsWith('/productos/') && method === 'PUT') {
    const id = Number(clean.split('/')[2])
    const idx = productos.findIndex((p) => p.id === id)
    if (idx !== -1) productos[idx] = { ...productos[idx], ...(body as ProductoDTO) }
    return productos[idx] as T
  }
  if (clean === '/pos/ventas' && method === 'GET') return [...ventasPOS] as T
  if (clean === '/pos/ventas' && method === 'POST') {
    const req = body as VentaPOSDTO
    const items = req.items.map((it) => {
      const prod = productos.find((p) => p.id === it.productoId)!
      if (prod.controlaStock) prod.stockActual = Math.max(0, prod.stockActual - it.cantidad)
      return {
        productoId: prod.id!,
        productoNombre: prod.nombre,
        cantidad: it.cantidad,
        precioUnitario: prod.precioVenta,
        subtotal: prod.precioVenta * it.cantidad,
      }
    })
    const montoTotal = items.reduce((a, b) => a + b.subtotal, 0)
    const venta: VentaPOSDTO = {
      id: ventasPOS.length + 1,
      codigo: `POS-000${ventasPOS.length + 1}`,
      vendedor: String(query?.usuario ?? 'cajero'),
      habitacionNumero: req.habitacionNumero,
      metodoPago: req.metodoPago,
      montoTotal,
      fecha: new Date().toISOString(),
      items,
    }
    ventasPOS.unshift(venta)
    return venta as T
  }
  if (clean === '/caja/turno-actual') return turnosCaja[0] as T
  if (clean === '/caja/turnos') return [...turnosCaja] as T
  if (clean === '/caja/abrir') {
    const req = body as { montoInicial: number; observaciones?: string }
    const nuevo: TurnoCaja = {
      id: turnosCaja.length + 1,
      cajero: String(query?.cajero ?? 'cajero'),
      fechaApertura: new Date().toISOString(),
      montoInicial: req.montoInicial,
      totalVentasEfectivo: 0,
      totalVentasDigital: 0,
      estado: 'ABIERTA',
      observaciones: req.observaciones,
    }
    turnosCaja.unshift(nuevo)
    return nuevo as T
  }
  if (clean.startsWith('/caja/cerrar/')) {
    const t = turnosCaja[0]
    if (t) {
      t.estado = 'CERRADA'
      t.fechaCierre = new Date().toISOString()
      t.montoFinalContado = Number(query?.montoFinalContado ?? t.montoInicial)
      t.diferencia = t.montoFinalContado - (t.montoInicial + t.totalVentasEfectivo)
    }
    return { ...t } as T
  }

  // Operaciones: Limpieza e Incidencias
  if (clean === '/limpieza' && method === 'GET') return [...tareasLimpieza] as T
  if (clean === '/limpieza' && method === 'POST') {
    const req = body as TareaLimpiezaDTO
    const hab = habitaciones.find((h) => h.id === Number(req.habitacionId))
    const nueva: TareaLimpiezaDTO = {
      ...req,
      id: tareasLimpieza.length + 1,
      habitacionNumero: hab?.numero ?? String(req.habitacionId),
      estado: 'PENDIENTE',
      fechaHoraCreacion: new Date().toISOString(),
    }
    tareasLimpieza.unshift(nueva)
    return nueva as T
  }
  if (clean.startsWith('/limpieza/') && clean.endsWith('/iniciar')) {
    const id = Number(clean.split('/')[2])
    const t = tareasLimpieza.find((x) => x.id === id)
    if (t) t.estado = 'EN_PROCESO'
    return { ...t } as T
  }
  if (clean.startsWith('/limpieza/') && clean.endsWith('/completar')) {
    const id = Number(clean.split('/')[2])
    const t = tareasLimpieza.find((x) => x.id === id)
    if (t) {
      t.estado = 'COMPLETADA'
      const hab = habitaciones.find((h) => h.id === t.habitacionId)
      if (hab) hab.estadoLimpieza = 'LIMPIA'
    }
    return { ...t } as T
  }

  if (clean === '/incidencias' && method === 'GET') return [...incidencias] as T
  if (clean === '/incidencias' && method === 'POST') {
    const req = body as IncidenciaDTO
    const hab = habitaciones.find((h) => h.id === Number(req.habitacionId))
    const nueva: IncidenciaDTO = {
      ...req,
      id: incidencias.length + 1,
      habitacionNumero: hab?.numero ?? String(req.habitacionId),
      estado: 'REPORTADA',
      fechaReporte: new Date().toISOString(),
    }
    incidencias.unshift(nueva)
    return nueva as T
  }
  if (clean.startsWith('/incidencias/') && clean.endsWith('/resolver')) {
    const id = Number(clean.split('/')[2])
    const inc = incidencias.find((x) => x.id === id)
    if (inc) {
      inc.estado = 'RESUELTA'
      inc.solucionAplicada = String(query?.solucion ?? 'Resuelto')
    }
    return { ...inc } as T
  }

  // Usuarios y Auditoria
  if (clean === '/usuarios') return [...usuarios] as T
  if (clean.startsWith('/usuarios/') && clean.endsWith('/estado')) {
    const id = Number(clean.split('/')[2])
    const u = usuarios.find((x) => x.id === id)
    if (u) u.activo = Boolean(query?.activo)
    return { ...u } as T
  }
  if (clean.startsWith('/auditoria')) return [...auditoria] as T

  return ([] as unknown) as T
}
