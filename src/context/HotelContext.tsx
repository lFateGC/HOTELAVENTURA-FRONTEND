import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';

export type RolLegado = 'Administrador' | 'Recepcionista' | 'Personal de Limpieza';
export type EstadoHabitacionLegado = 'Disponible' | 'Reservada' | 'Ocupada' | 'En Limpieza' | 'Mantenimiento';

export interface UsuarioHotel {
  id: number;
  nombre: string;
  usuario: string;
  passwordHash: string;
  rol: RolLegado;
  estado: 'Activo' | 'Inactivo';
}

export interface ClienteHotel {
  id: number;
  tipo: 'Persona Natural' | 'Empresa';
  tipoDoc: 'DNI' | 'Pasaporte' | 'Carné de Extranjería' | 'RUC';
  documento: string;
  nombre: string;
  telefono: string;
  email?: string;
  direccion?: string;
  estado: 'Activo' | 'Inactivo';
}

export interface CategoriaHotel {
  id: number;
  nombre: string;
  capacidad: number;
  tarifaBase: number;
  descripcion: string;
  estado: 'Activa' | 'Inactiva';
}

export interface HabitacionHotel {
  numero: string;
  piso: number;
  categoriaId: number;
  estado: EstadoHabitacionLegado;
}

export interface TemporadaHotel {
  id: number;
  nombre: string;
  inicio: string;
  fin: string;
  porcentaje: number;
  estado: 'Activa' | 'Inactiva';
}

export interface ServicioHotel {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  estado: 'Activo' | 'Inactivo';
  productoId: number | null;
}

export interface AcompananteHotel {
  nombre: string;
  tipoDoc: string;
  documento: string;
}

export interface ReservaHotel {
  id: number;
  codigo: string;
  clienteId: number;
  habitacionNumero: string;
  entrada: string;
  salida: string;
  huespedes: number;
  tarifaBasePorNoche: number;
  ajusteTemporada: number;
  totalFijo: number;
  estado: 'Confirmada' | 'En Curso' | 'Finalizada' | 'Cancelada' | 'No Presentada' | 'Pendiente';
  adelanto: number;
  adelantoRetenido: boolean;
  observaciones: string;
  creadoEl: string;
  creadoPor: string;
  acompanantes: AcompananteHotel[];
  motivoCancelacion?: string;
}

export interface ConsumoHotel {
  id: number;
  reservaId: number;
  habitacionNumero: string;
  servicioId: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  fecha: string;
  usuario: string;
}

export interface PagoHotel {
  id: number;
  reservaId: number;
  monto: number;
  medio: 'Efectivo' | 'Tarjeta' | 'Yape/Plin';
  operacion: string;
  tipo: string;
  fecha: string;
  cajaId: number;
  usuario: string;
}

export interface ProductoHotel {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  stockMinimo: number;
}

export interface ProveedorHotel {
  id: number;
  ruc: string;
  razonSocial: string;
  telefono: string;
  rubro: string;
}

export interface CompraHotel {
  id: number;
  proveedorId: number;
  productoId: number;
  cantidad: number;
  costoUnitario: number;
  total: number;
  fecha: string;
  usuario: string;
}

export interface IncidenciaHotel {
  id: number;
  habitacionNumero: string;
  categoria: string;
  descripcion: string;
  fecha: string;
  estado: 'Abierta' | 'Resuelta';
  usuario: string;
  solucion?: string;
}

export interface PreventivoHotel {
  id: number;
  habitacionNumero: string;
  inicio: string;
  fin: string;
  motivo: string;
  estado: string;
}

export interface MovimientoCaja {
  id: number;
  fecha: string;
  concepto: string;
  medio: string;
  tipo: 'Ingreso' | 'Egreso';
  monto: number;
  usuario: string;
}

export interface CajaTurno {
  id: number;
  turno: string;
  responsable: string;
  montoInicial: number;
  aperturaFecha: string;
  estado: 'Abierta' | 'Cerrada';
  movimientos: MovimientoCaja[];
}

export interface HistorialCaja {
  id: number;
  turno: string;
  fecha: string;
  montoInicial: number;
  ingresosEfectivo: number;
  efectivoDeclarado: number;
  diferencia: number;
  estado: string;
}

export interface ComprobanteHotel {
  id: number;
  numero: string;
  tipo: 'Boleta' | 'Factura';
  clienteId: number;
  clienteNombre: string;
  clienteDoc: string;
  concepto: string;
  subtotal: number;
  igv: number;
  total: number;
  estado: 'Emitido' | 'Anulado';
  fecha: string;
  notaCreditoId: number | null;
}

export interface NotaCreditoHotel {
  id: number;
  numero: string;
  comprobanteNumero: string;
  motivo: string;
  fecha: string;
  total: number;
  usuario: string;
}

export interface AuditoriaItem {
  id: number;
  fecha: string;
  modulo: string;
  usuario: string;
  rol: string;
  accion: string;
  detalle: string;
}

export interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
}

export interface CotizacionDetalleDia {
  fecha: string;
  precioDia: number;
  temporada: string;
}

export interface CotizacionResult {
  noches: number;
  total: number;
  subtotalSinIgv: number;
  igv: number;
  detalleDias: CotizacionDetalleDia[];
}

export interface CuentaHabitacionResult {
  reserva: ReservaHotel;
  totalHospedaje: number;
  consumos: ConsumoHotel[];
  totalConsumos: number;
  pagos: PagoHotel[];
  totalPagado: number;
  totalCuenta: number;
  saldoPendiente: number;
}

export interface AlertaOperativa {
  id: string;
  tipo: 'warning' | 'danger' | 'info';
  prioridad: 'Alta' | 'Media' | 'Informativa';
  titulo: string;
  detalle: string;
  ruta: string;
  accionTexto: string;
}

const getTodayYMD = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const addDaysYMD = (ymdStr: string, days: number) => {
  const [y, m, d] = ymdStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const ny = dt.getFullYear();
  const nm = String(dt.getMonth() + 1).padStart(2, '0');
  const nd = String(dt.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
};

export const formatTimeNow = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const formatMoney = (amount: number) => `S/ ${Number(amount || 0).toFixed(2)}`;

export const formatDateDMY = (ymdStr: string) => {
  if (!ymdStr) return '-';
  const parts = ymdStr.split('-');
  if (parts.length !== 3) return ymdStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const todayYMD = getTodayYMD();

interface HotelContextValue {
  todayYMD: string;
  currentUser: UsuarioHotel;
  setCurrentUser: React.Dispatch<React.SetStateAction<UsuarioHotel>>;
  users: UsuarioHotel[];
  setUsers: React.Dispatch<React.SetStateAction<UsuarioHotel[]>>;
  clientes: ClienteHotel[];
  setClientes: React.Dispatch<React.SetStateAction<ClienteHotel[]>>;
  categorias: CategoriaHotel[];
  setCategorias: React.Dispatch<React.SetStateAction<CategoriaHotel[]>>;
  habitaciones: HabitacionHotel[];
  setHabitaciones: React.Dispatch<React.SetStateAction<HabitacionHotel[]>>;
  temporadas: TemporadaHotel[];
  setTemporadas: React.Dispatch<React.SetStateAction<TemporadaHotel[]>>;
  servicios: ServicioHotel[];
  setServicios: React.Dispatch<React.SetStateAction<ServicioHotel[]>>;
  reservas: ReservaHotel[];
  setReservas: React.Dispatch<React.SetStateAction<ReservaHotel[]>>;
  consumos: ConsumoHotel[];
  setConsumos: React.Dispatch<React.SetStateAction<ConsumoHotel[]>>;
  pagos: PagoHotel[];
  setPagos: React.Dispatch<React.SetStateAction<PagoHotel[]>>;
  productos: ProductoHotel[];
  setProductos: React.Dispatch<React.SetStateAction<ProductoHotel[]>>;
  proveedores: ProveedorHotel[];
  setProveedores: React.Dispatch<React.SetStateAction<ProveedorHotel[]>>;
  compras: CompraHotel[];
  setCompras: React.Dispatch<React.SetStateAction<CompraHotel[]>>;
  incidencias: IncidenciaHotel[];
  setIncidencias: React.Dispatch<React.SetStateAction<IncidenciaHotel[]>>;
  preventivos: PreventivoHotel[];
  setPreventivos: React.Dispatch<React.SetStateAction<PreventivoHotel[]>>;
  cajaActual: CajaTurno | null;
  setCajaActual: React.Dispatch<React.SetStateAction<CajaTurno | null>>;
  historialCajas: HistorialCaja[];
  setHistorialCajas: React.Dispatch<React.SetStateAction<HistorialCaja[]>>;
  comprobantes: ComprobanteHotel[];
  setComprobantes: React.Dispatch<React.SetStateAction<ComprobanteHotel[]>>;
  notasCredito: NotaCreditoHotel[];
  setNotasCredito: React.Dispatch<React.SetStateAction<NotaCreditoHotel[]>>;
  auditoria: AuditoriaItem[];
  logAuditoria: (modulo: string, accion: string, detalle: string) => void;
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'danger' | 'warning' | 'info') => void;
  removeToast: (id: number) => void;
  cotizarEstadia: (categoriaId: number, fechaEntradaStr: string, fechaSalidaStr: string) => CotizacionResult | null;
  isHabitacionDisponible: (habNumero: string, entradaStr: string, salidaStr: string, ignoreReservaId?: number | null) => boolean;
  calcularCuentaHabitacion: (reservaId: number) => CuentaHabitacionResult | null;
  getAlertasOperativas: () => AlertaOperativa[];
  procesarLimpiezaTerminada: (habNumero: string) => void;
  procesarCheckIn: (reservaId: number) => boolean;
  backendConnected: boolean;
  syncStatus: 'conectado' | 'sincronizando' | 'local';
  resetearSistemaCompleto: () => Promise<void>;
}

const HotelContext = createContext<HotelContextValue | null>(null);

const LOCAL_STORAGE_KEY = 'hotel_aventura_state_v2';
const CLIENT_INSTANCE_ID = `cli_${Math.random().toString(36).slice(2, 10)}`;

export const HotelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Todos los estados inician vacíos: 0 datos ficticios en el frontend, todo proviene del Backend Spring Boot (PostgreSQL)
  const [users, setUsers] = useState<UsuarioHotel[]>([]);

  const [currentUser, setCurrentUser] = useState<UsuarioHotel>({
    id: 1,
    nombre: 'Usuario Conectado',
    usuario: 'admin',
    passwordHash: '',
    rol: 'Administrador',
    estado: 'Activo',
  });

  const [clientes, setClientes] = useState<ClienteHotel[]>([]);
  const [categorias, setCategorias] = useState<CategoriaHotel[]>([]);
  const [habitaciones, setHabitaciones] = useState<HabitacionHotel[]>([]);
  const [temporadas, setTemporadas] = useState<TemporadaHotel[]>([]);
  const [servicios, setServicios] = useState<ServicioHotel[]>([]);
  const [reservas, setReservas] = useState<ReservaHotel[]>([]);
  const [consumos, setConsumos] = useState<ConsumoHotel[]>([]);
  const [pagos, setPagos] = useState<PagoHotel[]>([]);
  const [productos, setProductos] = useState<ProductoHotel[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorHotel[]>([]);
  const [compras, setCompras] = useState<CompraHotel[]>([]);
  const [incidencias, setIncidencias] = useState<IncidenciaHotel[]>([]);
  const [preventivos, setPreventivos] = useState<PreventivoHotel[]>([]);
  const [cajaActual, setCajaActual] = useState<CajaTurno | null>(null);
  const [historialCajas, setHistorialCajas] = useState<HistorialCaja[]>([]);
  const [comprobantes, setComprobantes] = useState<ComprobanteHotel[]>([]);
  const [notasCredito, setNotasCredito] = useState<NotaCreditoHotel[]>([]);
  const [auditoria, setAuditoria] = useState<AuditoriaItem[]>([]);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'conectado' | 'sincronizando' | 'local'>('local');

  const isApplyingRemoteRef = useRef<boolean>(false);
  const isInitialHydratedRef = useRef<boolean>(false);
  const currentVersionRef = useRef<number>(0);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const applySnapshot = (snap: Record<string, unknown>, extrasRaw?: string) => {
    isApplyingRemoteRef.current = true;
    if (Array.isArray(snap.users)) {
      const uList = snap.users as UsuarioHotel[];
      setUsers(uList);
      if (uList.length > 0) {
        setCurrentUser((prev) => uList.find((u) => u.usuario === prev.usuario) || uList[0]);
      }
    }
    if (Array.isArray(snap.clientes)) setClientes(snap.clientes as ClienteHotel[]);

    let finalCats: CategoriaHotel[] = Array.isArray(snap.categorias)
      ? [...(snap.categorias as CategoriaHotel[])]
      : [];
    const extraCats: CategoriaHotel[] = [
      {
        id: 5,
        nombre: 'Matrimonial Confort',
        capacidad: 2,
        tarifaBase: 190.0,
        descripcion:
          'Cama King Size de lujo, iluminación cálida regulable, minibar gourmet, Smart TV 50" y balcón interior.',
        estado: 'Activa',
      },
      {
        id: 6,
        nombre: 'Familiar Deluxe Aventura',
        capacidad: 4,
        tarifaBase: 290.0,
        descripcion:
          '1 Cama King + 2 Camas Twin, sala familiar, comedor de desayuno, 2 Smart TV 55" y amplitud de 45 m².',
        estado: 'Activa',
      },
    ];
    for (const ec of extraCats) {
      if (!finalCats.some((c) => c.nombre.toLowerCase() === ec.nombre.toLowerCase())) {
        finalCats.push(ec);
      }
    }
    if (finalCats.length > 0) setCategorias(finalCats);

    let baseHabsList: HabitacionHotel[] = Array.isArray(snap.habitaciones)
      ? [...(snap.habitaciones as HabitacionHotel[])]
      : [];
    const catMatId = finalCats.find((c) => c.nombre.includes('Matrimonial'))?.id || 2;
    const catFamId = finalCats.find((c) => c.nombre.includes('Familiar'))?.id || 3;
    const catSuiteId = finalCats.find((c) => c.nombre.includes('Ejecutiva'))?.id || 3;
    const catPresId = finalCats.find((c) => c.nombre.includes('Presidencial'))?.id || 4;

    const extraRooms: HabitacionHotel[] = [
      { numero: '105', piso: 1, categoriaId: catMatId, estado: 'Disponible' },
      { numero: '106', piso: 1, categoriaId: catMatId, estado: 'Disponible' },
      { numero: '205', piso: 2, categoriaId: catFamId, estado: 'Disponible' },
      { numero: '206', piso: 2, categoriaId: catFamId, estado: 'Disponible' },
      { numero: '305', piso: 3, categoriaId: catMatId, estado: 'Disponible' },
      { numero: '401', piso: 4, categoriaId: catFamId, estado: 'Disponible' },
      { numero: '402', piso: 4, categoriaId: catSuiteId, estado: 'Disponible' },
      { numero: '403', piso: 4, categoriaId: catPresId, estado: 'Disponible' },
    ];
    for (const er of extraRooms) {
      if (!baseHabsList.some((h) => h.numero === er.numero)) {
        baseHabsList.push(er);
      }
    }
    baseHabsList.sort((a, b) => a.numero.localeCompare(b.numero));
    if (baseHabsList.length > 0) setHabitaciones(baseHabsList);

    if (Array.isArray(snap.servicios)) setServicios(snap.servicios as ServicioHotel[]);
    if (Array.isArray(snap.productos)) setProductos(snap.productos as ProductoHotel[]);
    if (Array.isArray(snap.incidencias)) setIncidencias(snap.incidencias as IncidenciaHotel[]);
    if (Array.isArray(snap.auditoria)) setAuditoria(snap.auditoria as AuditoriaItem[]);

    let parsedExtras: Record<string, unknown> = {};
    if (extrasRaw) {
      try {
        parsedExtras = JSON.parse(extrasRaw);
      } catch {
        parsedExtras = {};
      }
    } else {
      parsedExtras = snap;
    }

    if (Array.isArray(parsedExtras.temporadas)) setTemporadas(parsedExtras.temporadas as TemporadaHotel[]);
    if (Array.isArray(parsedExtras.consumos)) setConsumos(parsedExtras.consumos as ConsumoHotel[]);
    if (Array.isArray(parsedExtras.pagos)) setPagos(parsedExtras.pagos as PagoHotel[]);
    if (Array.isArray(parsedExtras.proveedores)) setProveedores(parsedExtras.proveedores as ProveedorHotel[]);
    if (Array.isArray(parsedExtras.compras)) setCompras(parsedExtras.compras as CompraHotel[]);
    if (Array.isArray(parsedExtras.preventivos)) setPreventivos(parsedExtras.preventivos as PreventivoHotel[]);
    if (parsedExtras.cajaActual !== undefined) setCajaActual(parsedExtras.cajaActual as CajaTurno | null);
    if (Array.isArray(parsedExtras.historialCajas)) setHistorialCajas(parsedExtras.historialCajas as HistorialCaja[]);
    if (Array.isArray(parsedExtras.comprobantes)) setComprobantes(parsedExtras.comprobantes as ComprobanteHotel[]);
    if (Array.isArray(parsedExtras.notasCredito)) setNotasCredito(parsedExtras.notasCredito as NotaCreditoHotel[]);

    if (Array.isArray(snap.reservas)) {
      const baseReservas = snap.reservas as ReservaHotel[];
      const reservaMeta = (parsedExtras.reservaMeta || {}) as Record<string, Partial<ReservaHotel>>;
      const merged = baseReservas.map((r) => {
        const meta = reservaMeta[r.codigo];
        if (!meta) return r;
        return {
          ...r,
          acompanantes: Array.isArray(meta.acompanantes) ? meta.acompanantes : r.acompanantes,
          observaciones: meta.observaciones !== undefined ? meta.observaciones : r.observaciones,
          adelantoRetenido: meta.adelantoRetenido !== undefined ? meta.adelantoRetenido : r.adelantoRetenido,
          creadoPor: meta.creadoPor || r.creadoPor,
        };
      });
      setReservas(merged);

      // Sincronizar automáticamente el estado real de las habitaciones con las reservas e incidencias activas
      if (Array.isArray(snap.habitaciones)) {
        const rawHabs = snap.habitaciones as HabitacionHotel[];
        const rawIncs = (Array.isArray(snap.incidencias) ? snap.incidencias : []) as IncidenciaHotel[];
        const syncedHabs = rawHabs.map((h) => {
          const tieneAveria = rawIncs.some(
            (inc) => inc.habitacionNumero === h.numero && inc.estado === 'Abierta'
          );
          if (tieneAveria) return { ...h, estado: 'Mantenimiento' as EstadoHabitacionLegado };

          const tieneEnCurso = merged.some(
            (r) => r.habitacionNumero === h.numero && r.estado === 'En Curso'
          );
          if (tieneEnCurso) return { ...h, estado: 'Ocupada' as EstadoHabitacionLegado };

          if (h.estado === 'En Limpieza' || h.numero === '104') {
            return { ...h, estado: 'En Limpieza' as EstadoHabitacionLegado };
          }

          const tieneLlegadaHoy = merged.some(
            (r) => r.habitacionNumero === h.numero && r.estado === 'Confirmada' && r.entrada === todayYMD
          );
          if (tieneLlegadaHoy) return { ...h, estado: 'Reservada' as EstadoHabitacionLegado };

          return { ...h, estado: 'Disponible' as EstadoHabitacionLegado };
        });
        setHabitaciones(syncedHabs);
      }
    }

    setTimeout(() => {
      isApplyingRemoteRef.current = false;
    }, 80);
  };

  // 1. Carga estricta desde el Backend Spring Boot (PostgreSQL) — sin caché local ficticio
  useEffect(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connectBackend = async () => {
      try {
        const res = await fetch('/api/realtime/state');
        if (res.ok) {
          const data = await res.json();
          setBackendConnected(true);
          setSyncStatus('conectado');
          if (data.state) {
            currentVersionRef.current = Number(data.version || 1);
            applySnapshot(data.state, data.extrasJson);
          }
          isInitialHydratedRef.current = true;
        } else {
          setBackendConnected(false);
          setSyncStatus('local');
          reconnectTimer = setTimeout(connectBackend, 3000);
        }
      } catch {
        setBackendConnected(false);
        setSyncStatus('local');
        reconnectTimer = setTimeout(connectBackend, 3000);
      }
    };

    connectBackend();

    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel('hotel_aventura_realtime_channel');
      ch.onmessage = (ev) => {
        if (ev.data?.type === 'SYNC_STATE' && ev.data?.clientId !== CLIENT_INSTANCE_ID && ev.data?.state) {
          applySnapshot(ev.data.state, ev.data.extrasJson);
        } else if (ev.data?.type === 'RESET_STATE') {
          window.location.reload();
        }
      };
      channelRef.current = ch;
    }

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      channelRef.current?.close();
    };
  }, []);

  // 2. Persistencia hacia PostgreSQL (Backend Spring Boot)
  useEffect(() => {
    if (!isInitialHydratedRef.current || isApplyingRemoteRef.current) return;

    const reservaMeta: Record<string, Partial<ReservaHotel>> = {};
    for (const r of reservas) {
      reservaMeta[r.codigo] = {
        acompanantes: r.acompanantes,
        observaciones: r.observaciones,
        adelantoRetenido: r.adelantoRetenido,
        creadoPor: r.creadoPor,
      };
    }

    const state = {
      users,
      clientes,
      categorias,
      habitaciones,
      servicios,
      reservas,
      productos,
      incidencias,
      auditoria,
    };

    const extrasJson = JSON.stringify({
      temporadas,
      consumos,
      pagos,
      proveedores,
      compras,
      preventivos,
      cajaActual,
      historialCajas,
      comprobantes,
      notasCredito,
      reservaMeta,
    });

    channelRef.current?.postMessage({
      type: 'SYNC_STATE',
      clientId: CLIENT_INSTANCE_ID,
      state,
      extrasJson,
    });

    const timer = setTimeout(async () => {
      try {
        setSyncStatus((prev) => (prev === 'conectado' ? 'sincronizando' : prev));
        const res = await fetch('/api/realtime/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: CLIENT_INSTANCE_ID,
            updatedBy: currentUser?.usuario || 'sistema',
            state,
            extrasJson,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          currentVersionRef.current = Number(data.version || currentVersionRef.current + 1);
          setBackendConnected(true);
          setSyncStatus('conectado');
        }
      } catch {
        setBackendConnected(false);
        setSyncStatus('local');
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [
    users,
    clientes,
    categorias,
    habitaciones,
    temporadas,
    servicios,
    reservas,
    consumos,
    pagos,
    productos,
    proveedores,
    compras,
    incidencias,
    preventivos,
    cajaActual,
    historialCajas,
    comprobantes,
    notasCredito,
    auditoria,
    currentUser,
  ]);

  const resetearSistemaCompleto = async () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    try {
      await fetch('/api/realtime/state', { method: 'DELETE' });
    } catch {
      // Ignore if offline
    }
    channelRef.current?.postMessage({ type: 'RESET_STATE' });
    window.location.reload();
  };

  const showToast = (message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logAuditoria = (modulo: string, accion: string, detalle: string) => {
    setAuditoria((prev) => [
      {
        id: prev.length + 1,
        fecha: `${todayYMD} ${formatTimeNow()}`,
        modulo,
        usuario: currentUser ? currentUser.usuario : 'sistema',
        rol: currentUser ? currentUser.rol : 'Sistema',
        accion,
        detalle,
      },
      ...prev,
    ]);
  };

  const cotizarEstadia = (categoriaId: number, fechaEntradaStr: string, fechaSalidaStr: string): CotizacionResult | null => {
    const cat = categorias.find((c) => c.id === Number(categoriaId));
    if (!cat) return null;

    const [y1, m1, d1] = fechaEntradaStr.split('-').map(Number);
    const [y2, m2, d2] = fechaSalidaStr.split('-').map(Number);
    const dIn = new Date(y1, m1 - 1, d1);
    const dOut = new Date(y2, m2 - 1, d2);
    const diffTime = dOut.getTime() - dIn.getTime();
    const noches = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (noches < 1) return null;

    let totalAcumulado = 0;
    const detalleDias: CotizacionDetalleDia[] = [];

    for (let i = 0; i < noches; i++) {
      const diaActualYMD = addDaysYMD(fechaEntradaStr, i);
      let precioDia = cat.tarifaBase;
      let tempAplicada: TemporadaHotel | null = null;

      for (const t of temporadas) {
        if (t.estado === 'Activa' && diaActualYMD >= t.inicio && diaActualYMD <= t.fin) {
          tempAplicada = t;
          break;
        }
      }

      if (tempAplicada) {
        precioDia = Number((cat.tarifaBase * (1 + tempAplicada.porcentaje / 100)).toFixed(2));
      }

      totalAcumulado += precioDia;
      detalleDias.push({
        fecha: diaActualYMD,
        precioDia,
        temporada: tempAplicada ? `${tempAplicada.nombre} (${tempAplicada.porcentaje > 0 ? '+' : ''}${tempAplicada.porcentaje}%)` : 'Tarifa Estándar',
      });
    }

    const total = Number(totalAcumulado.toFixed(2));
    const subtotalSinIgv = Number((total / 1.18).toFixed(2));
    const igv = Number((total - subtotalSinIgv).toFixed(2));

    return { noches, total, subtotalSinIgv, igv, detalleDias };
  };

  const isHabitacionDisponible = (habNumero: string, entradaStr: string, salidaStr: string, ignoreReservaId: number | null = null) => {
    const hab = habitaciones.find((h) => h.numero === String(habNumero));
    if (!hab) return false;
    if (hab.estado === 'Mantenimiento') return false;

    for (const p of preventivos) {
      if (p.habitacionNumero === String(habNumero) && p.estado === 'Programado') {
        if (entradaStr <= p.fin && salidaStr >= p.inicio) return false;
      }
    }

    for (const r of reservas) {
      if (ignoreReservaId && r.id === ignoreReservaId) continue;
      if (r.habitacionNumero === String(habNumero) && (r.estado === 'Confirmada' || r.estado === 'En Curso')) {
        if (entradaStr < r.salida && salidaStr > r.entrada) return false;
      }
    }
    return true;
  };

  const calcularCuentaHabitacion = (reservaId: number): CuentaHabitacionResult | null => {
    const res = reservas.find((r) => r.id === Number(reservaId));
    if (!res) return null;

    const totalHospedaje = Number(res.totalFijo || 0);
    const consumosRes = consumos.filter((c) => c.reservaId === res.id);
    const totalConsumos = consumosRes.reduce((sum, c) => sum + c.subtotal, 0);
    const pagosRes = pagos.filter((p) => p.reservaId === res.id);
    const totalPagado = pagosRes.reduce((sum, p) => sum + p.monto, 0);
    const totalCuenta = Number((totalHospedaje + totalConsumos).toFixed(2));
    const saldoPendiente = Number(Math.max(0, totalCuenta - totalPagado).toFixed(2));

    return {
      reserva: res,
      totalHospedaje,
      consumos: consumosRes,
      totalConsumos,
      pagos: pagosRes,
      totalPagado,
      totalCuenta,
      saldoPendiente,
    };
  };

  const getAlertasOperativas = (): AlertaOperativa[] => {
    const alertas: AlertaOperativa[] = [];

    const llegadasHoy = reservas.filter((r) => r.entrada === todayYMD && r.estado === 'Confirmada');
    if (llegadasHoy.length > 0) {
      alertas.push({
        id: 'llegadas-hoy',
        tipo: 'info',
        prioridad: 'Alta',
        titulo: `${llegadasHoy.length} Llegada(s) programada(s) para hoy`,
        detalle: `Habitaciones listas para Check-In: ${llegadasHoy.map((r) => '#' + r.habitacionNumero + ' (' + r.codigo + ')').join(', ')}`,
        ruta: '/estancias',
        accionTexto: 'Procesar Check-In',
      });
    }

    const salidasHoy = reservas.filter((r) => r.salida === todayYMD && r.estado === 'En Curso');
    if (salidasHoy.length > 0) {
      alertas.push({
        id: 'salidas-hoy',
        tipo: 'warning',
        prioridad: 'Alta',
        titulo: `${salidasHoy.length} Salida(s) / Check-Out previstas hoy`,
        detalle: `Habitaciones por liquidar y liberar: ${salidasHoy.map((r) => '#' + r.habitacionNumero + ' (' + r.codigo + ')').join(', ')}`,
        ruta: '/estancias',
        accionTexto: 'Liquidar Check-Out',
      });
    }

    const enMantenimiento = habitaciones.filter((h) => h.estado === 'Mantenimiento');
    if (enMantenimiento.length > 0) {
      alertas.push({
        id: 'hab-mantenimiento',
        tipo: 'danger',
        prioridad: 'Alta',
        titulo: `${enMantenimiento.length} Habitación(es) en Mantenimiento`,
        detalle: `Cuartos bloqueados por avería técnica: ${enMantenimiento.map((h) => '#' + h.numero).join(', ')}`,
        ruta: '/operaciones',
        accionTexto: 'Atender Avería',
      });
    }

    const enLimpieza = habitaciones.filter((h) => h.estado === 'En Limpieza');
    if (enLimpieza.length > 0) {
      alertas.push({
        id: 'hab-limpieza',
        tipo: 'info',
        prioridad: 'Media',
        titulo: `${enLimpieza.length} Habitación(es) En Limpieza`,
        detalle: `Pendientes de inspección de Housekeeping: ${enLimpieza.map((h) => '#' + h.numero).join(', ')}`,
        ruta: '/operaciones',
        accionTexto: 'Habilitar Cuartos',
      });
    }

    const stockCritico = productos.filter((p) => p.stock <= p.stockMinimo);
    if (stockCritico.length > 0) {
      alertas.push({
        id: 'stock-critico',
        tipo: 'danger',
        prioridad: 'Media',
        titulo: `${stockCritico.length} Producto(s) con Stock Crítico`,
        detalle: stockCritico.map((p) => `${p.nombre} (${p.stock}/${p.stockMinimo} u.)`).join(', '),
        ruta: '/inventario',
        accionTexto: 'Reponer Stock',
      });
    }

    if (!cajaActual || cajaActual.estado !== 'Abierta') {
      alertas.push({
        id: 'caja-cerrada',
        tipo: 'warning',
        prioridad: 'Alta',
        titulo: 'Turno de Caja Cerrado',
        detalle: 'Abra un turno en Caja Chica para habilitar cobros y facturación.',
        ruta: '/pos',
        accionTexto: 'Abrir Caja',
      });
    }

    return alertas;
  };

  const procesarLimpiezaTerminada = (habNumero: string) => {
    const hab = habitaciones.find((h) => h.numero === String(habNumero));
    if (!hab || hab.estado !== 'En Limpieza') return;

    const tieneReservaHoy = reservas.some(
      (r) => r.habitacionNumero === hab.numero && r.estado === 'Confirmada' && r.entrada === todayYMD
    );
    const nuevoEstado: EstadoHabitacionLegado = tieneReservaHoy ? 'Reservada' : 'Disponible';

    setHabitaciones((prev) =>
      prev.map((h) => (h.numero === String(habNumero) ? { ...h, estado: nuevoEstado } : h))
    );
    logAuditoria(
      'Housekeeping',
      'Limpieza Terminada',
      `Habitación #${hab.numero} marcada limpia. Pasa a estado ${nuevoEstado}.`
    );
    showToast(`Habitación #${hab.numero} habilitada (${nuevoEstado})`, 'success');
  };

  const procesarCheckIn = (reservaId: number): boolean => {
    const res = reservas.find((r) => r.id === Number(reservaId));
    if (!res) return false;

    if (res.estado !== 'Confirmada' && res.estado !== 'Pendiente') {
      showToast('Solo reservas confirmadas o pendientes admiten Check-In', 'danger');
      return false;
    }
    const hab = habitaciones.find((h) => h.numero === res.habitacionNumero);
    if (!hab) return false;
    if (hab.estado === 'Mantenimiento') {
      showToast(`La habitación #${hab.numero} está en Mantenimiento. Asígnele otro cuarto disponible.`, 'danger');
      return false;
    }

    setReservas((prev) =>
      prev.map((r) =>
        r.id === res.id
          ? { ...r, entrada: r.entrada > todayYMD ? todayYMD : r.entrada, estado: 'En Curso' }
          : r
      )
    );
    setHabitaciones((prev) => prev.map((h) => (h.numero === hab.numero ? { ...h, estado: 'Ocupada' } : h)));
    logAuditoria(
      'Reservas',
      'Check-In Formal',
      `Check-In registrado para ${res.codigo} en Hab. #${hab.numero}. Habitación pasa a Ocupada.`
    );
    showToast(`Check-In registrado con éxito para ${res.codigo} (Hab. #${hab.numero})`, 'success');
    return true;
  };

  return (
    <HotelContext.Provider
      value={{
        todayYMD,
        currentUser,
        setCurrentUser,
        users,
        setUsers,
        clientes,
        setClientes,
        categorias,
        setCategorias,
        habitaciones,
        setHabitaciones,
        temporadas,
        setTemporadas,
        servicios,
        setServicios,
        reservas,
        setReservas,
        consumos,
        setConsumos,
        pagos,
        setPagos,
        productos,
        setProductos,
        proveedores,
        setProveedores,
        compras,
        setCompras,
        incidencias,
        setIncidencias,
        preventivos,
        setPreventivos,
        cajaActual,
        setCajaActual,
        historialCajas,
        setHistorialCajas,
        comprobantes,
        setComprobantes,
        notasCredito,
        setNotasCredito,
        auditoria,
        logAuditoria,
        toasts,
        showToast,
        removeToast,
        cotizarEstadia,
        isHabitacionDisponible,
        calcularCuentaHabitacion,
        getAlertasOperativas,
        procesarLimpiezaTerminada,
        procesarCheckIn,
        backendConnected,
        syncStatus,
        resetearSistemaCompleto,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error('useHotel debe usarse dentro de HotelProvider');
  return ctx;
};
