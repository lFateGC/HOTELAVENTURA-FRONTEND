/**
 * MÓDULO 3: Gestión Operativa de Reservas (Foco en: Hoy [Llegan / Salen], Programadas y En Estadía)
 * Responsable: David Asto (Rama: David)
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useHotel,
  formatMoney,
  formatDateDMY,
  addDaysYMD,
  formatTimeNow,
  type ReservaHotel,
  type ClienteHotel,
  type HabitacionHotel,
} from '../../context/HotelContext';

const PADRON_MOCK: Record<string, { nombre: string; direccion: string }> = {
  '45892136': { nombre: 'Alejandro Vargas Llosa', direccion: 'Av. Pardo 420, Miraflores' },
  '72145698': { nombre: 'Valeria Montesinos Ríos', direccion: 'Calle Las Begonias 180, San Isidro' },
  '10203040': { nombre: 'Carlos Alberto Mendoza Pérez', direccion: 'Av. Arequipa 1250, Lince' },
  '74859632': { nombre: 'Lucía Fernanda Paredes Castro', direccion: 'Jr. Unión 840, Lima' },
  '20547896321': { nombre: 'Constructora Los Andes S.A.C.', direccion: 'Av. Javier Prado Este 2450, San Borja' },
  '20112233445': { nombre: 'Minera Yanacocha Corporación S.A.', direccion: 'Av. La Paz 1040, Miraflores' },
};

export const ReservasPage: React.FC = () => {
  const {
    todayYMD,
    currentUser,
    reservas,
    setReservas,
    clientes,
    setClientes,
    habitaciones,
    setHabitaciones,
    categorias,
    incidencias,
    setPagos,
    cajaActual,
    setCajaActual,
    cotizarEstadia,
    isHabitacionDisponible,
    calcularCuentaHabitacion,
    procesarCheckIn,
    logAuditoria,
    showToast,
  } = useHotel();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Las 3 vistas operativas clave que necesita Recepción:
  // 1. 'hoy'         -> Llegan Hoy (Check-In) y Salen Hoy (Check-Out)
  // 2. 'programadas' -> Reservas futuras confirmadas/pendientes (entrada > hoy)
  // 3. 'estadia'     -> Huéspedes actualmente alojados (En Curso)
  const [vistaActiva, setVistaActiva] = useState<'hoy' | 'programadas' | 'estadia'>('hoy');
  const [searchTerm, setSearchTerm] = useState('');

  // Wizard de Nueva Reserva en 3 pasos simples
  const [showNewModal, setShowNewModal] = useState(false);
  const [pasoWizard, setPasoWizard] = useState<1 | 2 | 3>(1);
  const [esWalkIn, setEsWalkIn] = useState(false);

  // Datos del Wizard
  const [resIn, setResIn] = useState(todayYMD);
  const [resOut, setResOut] = useState(addDaysYMD(todayYMD, 1));
  const [resHuesp, setResHuesp] = useState(1);
  const [resHab, setResHab] = useState('');
  const [resCliId, setResCliId] = useState<number>(clientes[0]?.id || 1);
  const [resAdelanto, setResAdelanto] = useState('0');
  const [resMetodoPago, setResMetodoPago] = useState<'Efectivo' | 'Tarjeta' | 'Yape/Plin'>('Efectivo');
  const [resObs, setResObs] = useState('');
  const [clienteSearch, setClienteSearch] = useState('');

  // Sub-formulario para crear cliente nuevo dentro del Paso 2
  const [modoNuevoCliente, setModoNuevoCliente] = useState(false);
  const [nuevoTipoDoc, setNuevoTipoDoc] = useState<'DNI' | 'RUC' | 'Pasaporte'>('DNI');
  const [nuevoDoc, setNuevoDoc] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTel, setNuevoTel] = useState('');
  const [nuevoError, setNuevoError] = useState('');

  // Modal Reprogramar / Cambiar Cuarto (Casos Reales: cambio de fecha con >=8h o cambio de habitación)
  const [reprogRes, setReprogRes] = useState<ReservaHotel | null>(null);
  const [repEntrada, setRepEntrada] = useState('');
  const [repSalida, setRepSalida] = useState('');
  const [repHab, setRepHab] = useState('');
  const [repError, setRepError] = useState('');

  // Modal Ficha de Reserva y Cancelación
  const [fichaReserva, setFichaReserva] = useState<ReservaHotel | null>(null);
  const [cancelModalRes, setCancelModalRes] = useState<ReservaHotel | null>(null);
  const [motivoCancel, setMotivoCancel] = useState('');

  // Habitaciones disponibles para las fechas seleccionadas en el Wizard
  const habsDisponibles = habitaciones.filter((h) => {
    const cat = categorias.find((c) => c.id === h.categoriaId);
    if (!cat || cat.capacidad < resHuesp) return false;
    return isHabitacionDisponible(h.numero, resIn, resOut);
  });

  useEffect(() => {
    if (habsDisponibles.length > 0 && !habsDisponibles.some((h) => h.numero === resHab)) {
      setResHab(habsDisponibles[0].numero);
    } else if (habsDisponibles.length === 0) {
      setResHab('');
    }
  }, [resIn, resOut, resHuesp, habitaciones, reservas]);

  // Leer parámetros URL (?clienteId=..., ?hab=..., ?walkin=1)
  useEffect(() => {
    const cid = searchParams.get('clienteId');
    const habParam = searchParams.get('hab');
    const walkinParam = searchParams.get('walkin');

    if (cid || habParam) {
      setResIn(todayYMD);
      setResOut(addDaysYMD(todayYMD, 1));
      setResHuesp(1);
      setResAdelanto('0');
      setResObs('');
      setEsWalkIn(walkinParam === '1');
      setModoNuevoCliente(false);

      if (cid) {
        setResCliId(Number(cid));
      } else if (clientes.length > 0 && !resCliId) {
        setResCliId(clientes[0].id);
      }

      if (habParam) {
        setResHab(habParam);
        setPasoWizard(cid ? 3 : 2);
      } else {
        setPasoWizard(1);
      }

      setShowNewModal(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, clientes]);

  const habSeleccionadaObj = habitaciones.find((h) => h.numero === resHab);
  const catSeleccionadaObj = categorias.find((c) => c.id === habSeleccionadaObj?.categoriaId);
  const cotizacionActual = habSeleccionadaObj
    ? cotizarEstadia(habSeleccionadaObj.categoriaId, resIn, resOut)
    : null;
  const clienteSeleccionadoObj = clientes.find((c) => c.id === Number(resCliId));

  // Reservar desde 1 Clic en una Habitación Disponible del mapa superior
  const reservarHabitacionEnUnClick = (habNumero: string, walkIn = false) => {
    setResIn(todayYMD);
    setResOut(addDaysYMD(todayYMD, 1));
    setResHuesp(1);
    setResHab(habNumero);
    setResAdelanto('0');
    setResObs('');
    setEsWalkIn(walkIn);
    setModoNuevoCliente(false);
    setClienteSearch('');
    if (clientes.length > 0 && !resCliId) {
      setResCliId(clientes[0].id);
    }
    setPasoWizard(2);
    setShowNewModal(true);
  };

  const abrirAsistenteReserva = (walkInMode = false) => {
    setResIn(todayYMD);
    setResOut(addDaysYMD(todayYMD, 1));
    setResHuesp(1);
    setResAdelanto('0');
    setResObs('');
    setEsWalkIn(walkInMode);
    setModoNuevoCliente(false);
    setClienteSearch('');
    if (clientes.length > 0 && !resCliId) {
      setResCliId(clientes[0].id);
    }
    setPasoWizard(1);
    setShowNewModal(true);
  };

  const handleAutocompletarPadron = () => {
    setNuevoError('');
    const doc = nuevoDoc.trim();
    if (!doc) {
      setNuevoError('Ingrese el número de DNI o RUC primero.');
      return;
    }
    const encontrado = PADRON_MOCK[doc];
    if (encontrado) {
      setNuevoNombre(encontrado.nombre);
    } else if (nuevoTipoDoc === 'RUC' && doc.length === 11) {
      setNuevoNombre(`Corporación Empresarial ${doc.slice(-4)} S.A.C.`);
    } else if (nuevoTipoDoc === 'DNI' && doc.length === 8) {
      setNuevoNombre(`Ciudadano Registrado DNI ${doc.slice(-4)}`);
    } else {
      setNuevoError('Verifique la longitud del documento (DNI 8 dígitos / RUC 11 dígitos).');
    }
  };

  const handleGuardarClienteRapido = () => {
    setNuevoError('');
    const doc = nuevoDoc.trim();
    const nom = nuevoNombre.trim();
    if (!doc || !nom) {
      setNuevoError('Complete el documento y el nombre del cliente.');
      return;
    }
    const existente = clientes.find((c) => c.documento.toLowerCase() === doc.toLowerCase());
    if (existente) {
      setResCliId(existente.id);
      setModoNuevoCliente(false);
      showToast(`Cliente ${existente.nombre} seleccionado`, 'info');
      return;
    }

    const nuevoId = clientes.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const nuevoCli: ClienteHotel = {
      id: nuevoId,
      tipo: nuevoTipoDoc === 'RUC' ? 'Empresa' : 'Persona Natural',
      tipoDoc: nuevoTipoDoc,
      documento: doc,
      nombre: nom,
      telefono: nuevoTel.trim() || '999000111',
      estado: 'Activo',
    };
    setClientes((prev) => [...prev, nuevoCli]);
    setResCliId(nuevoId);
    setModoNuevoCliente(false);
    setNuevoDoc('');
    setNuevoNombre('');
    setNuevoTel('');
    showToast(`Cliente ${nom} creado y vinculado`, 'success');
  };

  const handleConfirmarReservaFinal = (ingresarAhoraWalkIn: boolean) => {
    if (!resHab || !cotizacionActual || !habSeleccionadaObj || !catSeleccionadaObj) return;

    const adelantoVal = Math.max(0, Number(resAdelanto) || 0);
    const nuevoId = reservas.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const codigo = `RES-${String(nuevoId).padStart(4, '0')}`;
    const checkInDirecto = ingresarAhoraWalkIn && resIn === todayYMD;
    const estadoInicial: ReservaHotel['estado'] = checkInDirecto ? 'En Curso' : 'Confirmada';

    const nuevaRes: ReservaHotel = {
      id: nuevoId,
      codigo,
      clienteId: Number(resCliId),
      habitacionNumero: resHab,
      entrada: resIn,
      salida: resOut,
      huespedes: Number(resHuesp),
      tarifaBasePorNoche: catSeleccionadaObj.tarifaBase,
      ajusteTemporada: Number((cotizacionActual.total / cotizacionActual.noches - catSeleccionadaObj.tarifaBase).toFixed(2)),
      totalFijo: cotizacionActual.total,
      estado: estadoInicial,
      adelanto: adelantoVal,
      adelantoRetenido: false,
      observaciones: resObs.trim(),
      creadoEl: `${todayYMD} ${formatTimeNow()}`,
      creadoPor: currentUser.usuario,
      acompanantes: [],
    };

    setReservas((prev) => [nuevaRes, ...prev]);

    if (checkInDirecto) {
      setHabitaciones((prev) =>
        prev.map((h) => (h.numero === resHab ? { ...h, estado: 'Ocupada' } : h))
      );
    } else if (resIn === todayYMD) {
      setHabitaciones((prev) =>
        prev.map((h) => (h.numero === resHab && h.estado === 'Disponible' ? { ...h, estado: 'Reservada' } : h))
      );
    }

    if (adelantoVal > 0) {
      setPagos((prev) => [
        ...prev,
        {
          id: Date.now(),
          reservaId: nuevoId,
          monto: adelantoVal,
          medio: resMetodoPago,
          operacion: resMetodoPago === 'Efectivo' ? '-' : 'OP-RES',
          tipo: 'Adelanto',
          fecha: `${todayYMD} ${formatTimeNow()}`,
          cajaId: cajaActual?.id || 1,
          usuario: currentUser.usuario,
        },
      ]);

      if (cajaActual) {
        setCajaActual((prev) =>
          prev
            ? {
                ...prev,
                movimientos: [
                  ...prev.movimientos,
                  {
                    id: Date.now(),
                    fecha: `${todayYMD} ${formatTimeNow()}`,
                    concepto: `Adelanto Reserva ${codigo} (Hab. #${resHab})`,
                    medio: resMetodoPago,
                    tipo: 'Ingreso',
                    monto: adelantoVal,
                    usuario: currentUser.usuario,
                  },
                ],
              }
            : null
        );
      }
    }

    logAuditoria(
      'Reservas',
      checkInDirecto ? 'Walk-In Directo' : 'Nueva Reserva',
      `Reserva ${codigo} registrada en Hab. #${resHab} (${estadoInicial}) por ${formatMoney(cotizacionActual.total)}.`
    );
    showToast(
      checkInDirecto
        ? `Walk-In ${codigo} registrado: Habitación #${resHab} ahora está Ocupada.`
        : `Reserva ${codigo} confirmada para Habitación #${resHab}.`,
      'success'
    );
    setShowNewModal(false);
    if (checkInDirecto) {
      setVistaActiva('estadia');
    } else if (resIn === todayYMD) {
      setVistaActiva('hoy');
    } else {
      setVistaActiva('programadas');
    }
  };

  // --- CASOS OPERATIVOS REALES ---

  // Caso 1: Huésped que salía hoy pide extender +1 noche su estadía
  const handleExtenderUnaNoche = (r: ReservaHotel) => {
    const nuevaSalida = addDaysYMD(r.salida, 1);
    if (!isHabitacionDisponible(r.habitacionNumero, r.entrada, nuevaSalida, r.id)) {
      showToast(
        `La Hab. #${r.habitacionNumero} tiene otra reserva para hoy. Use 'Cambiar Cuarto / Reprogramar' para reubicarlo.`,
        'warning'
      );
      abrirModalReprogramar(r);
      return;
    }
    const hab = habitaciones.find((h) => h.numero === r.habitacionNumero);
    const cot = hab ? cotizarEstadia(hab.categoriaId, r.entrada, nuevaSalida) : null;
    const nuevoTotal = cot ? cot.total : r.totalFijo + r.tarifaBasePorNoche;

    setReservas((prev) =>
      prev.map((item) =>
        item.id === r.id ? { ...item, salida: nuevaSalida, totalFijo: nuevoTotal } : item
      )
    );
    logAuditoria(
      'Reservas',
      'Prórroga +1 Noche',
      `Estadía ${r.codigo} (Hab. #${r.habitacionNumero}) extendida hasta ${formatDateDMY(nuevaSalida)}.`
    );
    showToast(
      `Estadía de Hab. #${r.habitacionNumero} extendida +1 noche (hasta ${formatDateDMY(nuevaSalida)}).`,
      'success'
    );
  };

  // Caso 2: Cliente con reserva hoy no se presenta -> Marcar Ausente (No-Show) y liberar habitación
  const handleMarcarNoShow = (r: ReservaHotel) => {
    setReservas((prev) =>
      prev.map((item) =>
        item.id === r.id
          ? {
              ...item,
              estado: 'No Presentada',
              motivoCancelacion: 'Cliente no se presentó al Check-In del día (Ausente / No-Show).',
            }
          : item
      )
    );
    setHabitaciones((prev) =>
      prev.map((h) =>
        h.numero === r.habitacionNumero && h.estado === 'Reservada'
          ? { ...h, estado: 'Disponible' }
          : h
      )
    );
    logAuditoria(
      'Reservas',
      'No-Show / Ausente',
      `Reserva ${r.codigo} marcada como Ausente. Habitación #${r.habitacionNumero} liberada a Disponible.`
    );
    showToast(`Reserva ${r.codigo} marcada como Ausente. Hab. #${r.habitacionNumero} liberada.`, 'warning');
  };

  // Caso 3: Abrir Modal de Reprogramación / Cambio de Habitación
  const abrirModalReprogramar = (r: ReservaHotel) => {
    setReprogRes(r);
    setRepEntrada(r.entrada);
    setRepSalida(r.salida);
    setRepHab(r.habitacionNumero);
    setRepError('');
  };

  const handleGuardarReprogramacion = (e: React.FormEvent) => {
    e.preventDefault();
    setRepError('');
    if (!reprogRes) return;

    if (!repEntrada || !repSalida || repSalida <= repEntrada) {
      setRepError('La fecha de salida debe ser posterior a la fecha de entrada.');
      return;
    }

    if (!isHabitacionDisponible(repHab, repEntrada, repSalida, reprogRes.id)) {
      setRepError(`La Habitación #${repHab} ya está ocupada o reservada en ese rango de fechas.`);
      return;
    }

    const habAnterior = reprogRes.habitacionNumero;
    const habNuevaObj = habitaciones.find((h) => h.numero === repHab);
    const cot = habNuevaObj ? cotizarEstadia(habNuevaObj.categoriaId, repEntrada, repSalida) : null;
    const nuevoTotal = cot ? cot.total : reprogRes.totalFijo;

    setReservas((prev) =>
      prev.map((item) =>
        item.id === reprogRes.id
          ? {
              ...item,
              habitacionNumero: repHab,
              entrada: repEntrada,
              salida: repSalida,
              totalFijo: nuevoTotal,
            }
          : item
      )
    );

    if (habAnterior !== repHab) {
      setHabitaciones((prev) =>
        prev.map((h) => {
          if (h.numero === repHab) {
            return {
              ...h,
              estado: reprogRes.estado === 'En Curso' ? 'Ocupada' : repEntrada === todayYMD ? 'Reservada' : 'Disponible',
            };
          }
          if (h.numero === habAnterior) {
            return {
              ...h,
              estado: reprogRes.estado === 'En Curso' ? 'En Limpieza' : 'Disponible',
            };
          }
          return h;
        })
      );
    }

    logAuditoria(
      'Reservas',
      'Reprogramación / Cambio de Cuarto',
      `Reserva ${reprogRes.codigo} actualizada: Hab. #${repHab} (${formatDateDMY(repEntrada)} al ${formatDateDMY(repSalida)}).`
    );
    showToast(`Reserva ${reprogRes.codigo} actualizada correctamente`, 'success');
    setReprogRes(null);
  };

  const confirmarCancelacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalRes) return;

    setReservas((prev) =>
      prev.map((r) =>
        r.id === cancelModalRes.id
          ? { ...r, estado: 'Cancelada', motivoCancelacion: motivoCancel.trim() || 'Cancelada por el cliente' }
          : r
      )
    );
    setHabitaciones((prev) =>
      prev.map((h) =>
        h.numero === cancelModalRes.habitacionNumero && h.estado === 'Reservada'
          ? { ...h, estado: 'Disponible' }
          : h
      )
    );
    logAuditoria('Reservas', 'Cancelación', `Reserva ${cancelModalRes.codigo} cancelada.`);
    showToast(`Reserva ${cancelModalRes.codigo} cancelada`, 'info');
    setCancelModalRes(null);
    setMotivoCancel('');
  };

  // Estado real de cada habitación para el Mapa Rápido de 1 Clic
  const getRoomQuickInfo = (h: HabitacionHotel) => {
    const averia = incidencias.some((i) => i.habitacionNumero === h.numero && i.estado === 'Abierta');
    const resEnCurso = reservas.find((r) => r.habitacionNumero === h.numero && r.estado === 'En Curso');
    const resHoy = reservas.find(
      (r) =>
        r.habitacionNumero === h.numero &&
        (r.estado === 'Confirmada' || r.estado === 'Pendiente') &&
        r.entrada === todayYMD
    );
    const resFutura = reservas
      .filter(
        (r) =>
          r.habitacionNumero === h.numero &&
          (r.estado === 'Confirmada' || r.estado === 'Pendiente') &&
          r.entrada > todayYMD
      )
      .sort((a, b) => a.entrada.localeCompare(b.entrada))[0];

    let estado: HabitacionHotel['estado'] = 'Disponible';
    if (averia) estado = 'Mantenimiento';
    else if (resEnCurso) estado = 'Ocupada';
    else if (h.estado === 'En Limpieza') estado = 'En Limpieza';
    else if (resHoy) estado = 'Reservada';

    const titular = resEnCurso
      ? clientes.find((c) => c.id === resEnCurso.clienteId)?.nombre
      : resHoy
      ? clientes.find((c) => c.id === resHoy.clienteId)?.nombre
      : resFutura
      ? clientes.find((c) => c.id === resFutura.clienteId)?.nombre
      : null;

    return { estado, resEnCurso, resHoy, resFutura, titular };
  };

  // --- SUBCONJUNTOS OPERATIVOS CLAROS ---
  const q = searchTerm.trim().toLowerCase();
  const matchSearch = (r: ReservaHotel) => {
    if (!q) return true;
    const cli = clientes.find((c) => c.id === r.clienteId);
    return (
      r.codigo.toLowerCase().includes(q) ||
      r.habitacionNumero.toLowerCase().includes(q) ||
      (cli?.nombre || '').toLowerCase().includes(q) ||
      (cli?.documento || '').toLowerCase().includes(q)
    );
  };

  // 1. Movimientos de Hoy: Llegan Hoy + Salen Hoy
  const lleganHoyList = reservas
    .filter((r) => (r.estado === 'Confirmada' || r.estado === 'Pendiente') && r.entrada === todayYMD)
    .filter(matchSearch);

  const salenHoyList = reservas
    .filter((r) => r.estado === 'En Curso' && r.salida === todayYMD)
    .filter(matchSearch);

  // 2. Programadas (Próximas fechas: entrada > hoy)
  const programadasList = reservas
    .filter((r) => (r.estado === 'Confirmada' || r.estado === 'Pendiente') && r.entrada > todayYMD)
    .filter(matchSearch)
    .sort((a, b) => a.entrada.localeCompare(b.entrada));

  // 3. En Estadía (Todas las habitaciones actualmente alojadas En Curso)
  const enEstadiaList = reservas
    .filter((r) => r.estado === 'En Curso')
    .filter(matchSearch)
    .sort((a, b) => (a.salida === todayYMD ? -1 : b.salida === todayYMD ? 1 : a.habitacionNumero.localeCompare(b.habitacionNumero)));

  const totalHoy = lleganHoyList.length + salenHoyList.length;

  const clientesFiltradosModal = clientes.filter((c) => {
    if (c.estado !== 'Activo') return false;
    if (!clienteSearch.trim()) return true;
    const sq = clienteSearch.toLowerCase();
    return c.nombre.toLowerCase().includes(sq) || c.documento.toLowerCase().includes(sq);
  });

  return (
    <div>
      {/* CABECERA CON BOTONES DIRECTOS */}
      <div
        className="view-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 className="view-title">Centro Operativo de Reservas</h1>
          <p className="view-subtitle">
            Control enfocado en Movimientos de Hoy (Llegadas y Salidas), Reservas Programadas y Huéspedes en Estadía
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => abrirAsistenteReserva(true)}
          >
            Walk-In (Ingreso Directo Hoy)
          </button>
          <button
            type="button"
            className="btn btn-gold"
            onClick={() => abrirAsistenteReserva(false)}
          >
            + Nueva Reserva
          </button>
        </div>
      </div>

      {/* =====================================================================
          MAPA RÁPIDO DE HABITACIONES (RESERVA DESDE 1 CLIC)
         ===================================================================== */}
      <div
        className="table-card"
        style={{
          padding: '14px 18px',
          marginBottom: 18,
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div>
            <strong style={{ fontSize: 14, color: 'var(--wine-900)' }}>
              Disponibilidad Rápida por Habitación (1 Clic para Reservar)
            </strong>
            <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 10 }}>
              Verde = Libre ahora · Ámbar = Llega hoy · Rojo = En estadía
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => navigate('/rack')}
            style={{ fontSize: 11.5 }}
          >
            Ir al Rack de Habitaciones →
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
            gap: 8,
          }}
        >
          {habitaciones.map((h) => {
            const cat = categorias.find((c) => c.id === h.categoriaId);
            const info = getRoomQuickInfo(h);
            const esLibre = info.estado === 'Disponible';
            const esReservadaHoy = info.estado === 'Reservada';
            const esOcupada = info.estado === 'Ocupada';

            let borderCol = '#bbf7d0';
            let bgCol = '#f0fdf4';
            let statusTextCol = '#166534';
            if (esReservadaHoy) {
              borderCol = '#fde68a';
              bgCol = '#fffbeb';
              statusTextCol = '#92400e';
            } else if (esOcupada) {
              borderCol = '#fecaca';
              bgCol = '#fef2f2';
              statusTextCol = '#991b1b';
            } else if (!esLibre) {
              borderCol = '#cbd5e1';
              bgCol = '#f1f5f9';
              statusTextCol = '#475569';
            }

            return (
              <div
                key={h.numero}
                onClick={() => {
                  if (esLibre) {
                    reservarHabitacionEnUnClick(h.numero, false);
                  } else if (esReservadaHoy && info.resHoy) {
                    setFichaReserva(info.resHoy);
                  } else if (esOcupada && info.resEnCurso) {
                    setFichaReserva(info.resEnCurso);
                  }
                }}
                style={{
                  padding: '9px 11px',
                  borderRadius: 10,
                  border: `1.5px solid ${borderCol}`,
                  background: bgCol,
                  cursor: esLibre || esReservadaHoy || esOcupada ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: 14.5, color: '#0f172a' }}>#{h.numero}</strong>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: statusTextCol,
                      padding: '1px 6px',
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.85)',
                    }}
                  >
                    {info.estado}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink)', fontWeight: 600 }}>
                  {cat?.nombre || 'Estándar'} · {formatMoney(cat?.tarifaBase || 140)}
                </div>
                {esLibre && (
                  <div style={{ fontSize: 10.5, color: info.resFutura ? '#0369a1' : '#15803d', fontWeight: 700 }}>
                    {info.resFutura
                      ? `Próx: ${formatDateDMY(info.resFutura.entrada)}`
                      : '+ Reservar en 1 Clic'}
                  </div>
                )}
                {(esReservadaHoy || esOcupada) && (
                  <div
                    style={{
                      fontSize: 10.5,
                      color: statusTextCol,
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {info.titular}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          3 PESTAÑAS OPERATIVAS ENFOCADAS (HOY | PROGRAMADAS | EN ESTADÍA)
         ===================================================================== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 18,
          background: '#ffffff',
          padding: '12px 16px',
          borderRadius: 12,
          border: '1px solid var(--line)',
        }}
      >
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setVistaActiva('hoy')}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: vistaActiva === 'hoy' ? '2px solid var(--wine-700)' : '1px solid var(--line)',
              background: vistaActiva === 'hoy' ? '#f0fdf4' : '#f8fafc',
              color: vistaActiva === 'hoy' ? '#14532d' : 'var(--ink)',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>1. Movimientos de Hoy: Llegan y Salen</span>
            <span
              style={{
                background: '#16a34a',
                color: '#fff',
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 999,
              }}
            >
              {totalHoy}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setVistaActiva('programadas')}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: vistaActiva === 'programadas' ? '2px solid var(--wine-700)' : '1px solid var(--line)',
              background: vistaActiva === 'programadas' ? '#f0fdf4' : '#f8fafc',
              color: vistaActiva === 'programadas' ? '#14532d' : 'var(--ink)',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>2. Programadas (Próximos Días)</span>
            <span
              style={{
                background: '#0284c7',
                color: '#fff',
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 999,
              }}
            >
              {programadasList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setVistaActiva('estadia')}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: vistaActiva === 'estadia' ? '2px solid var(--wine-700)' : '1px solid var(--line)',
              background: vistaActiva === 'estadia' ? '#f0fdf4' : '#f8fafc',
              color: vistaActiva === 'estadia' ? '#14532d' : 'var(--ink)',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>3. En Estadía (Alojados Ahora)</span>
            <span
              style={{
                background: '#0f172a',
                color: '#fff',
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 999,
              }}
            >
              {enEstadiaList.length}
            </span>
          </button>
        </div>

        <input
          type="text"
          className="form-input"
          placeholder="Buscar por habitación (#103), cliente o RES-..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 300 }}
        />
      </div>

      {/* =====================================================================
          VISTA 1: MOVIMIENTOS DE HOY (LLEGAN HOY + SALEN HOY)
         ===================================================================== */}
      {vistaActiva === 'hoy' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 20 }}>
          {/* COLUMNA A: LLEGAN HOY (CHECK-IN DEL DÍA) */}
          <div className="table-card">
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--line)',
                background: '#f0fdf4',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong style={{ fontSize: 15, color: '#14532d' }}>
                  Llegan Hoy — Pendientes de Check-In ({lleganHoyList.length})
                </strong>
                <div style={{ fontSize: 11.5, color: '#166534' }}>
                  Clientes que inician su estadía hoy ({formatDateDMY(todayYMD)}). Si no se presentan, márquelos como Ausente para liberar el cuarto.
                </div>
              </div>
            </div>

            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {lleganHoyList.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  No quedan llegadas pendientes para hoy.
                </div>
              ) : (
                lleganHoyList.map((r) => {
                  const cli = clientes.find((c) => c.id === r.clienteId);
                  const hab = habitaciones.find((h) => h.numero === r.habitacionNumero);
                  const cat = categorias.find((c) => c.id === hab?.categoriaId);
                  const saldo = Math.max(0, r.totalFijo - r.adelanto);

                  return (
                    <div
                      key={r.id}
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        border: '1px solid #bbf7d0',
                        background: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span
                            style={{
                              fontSize: 16,
                              fontWeight: 800,
                              padding: '6px 12px',
                              borderRadius: 8,
                              background: '#14532d',
                              color: '#fff',
                            }}
                          >
                            #{r.habitacionNumero}
                          </span>
                          <div>
                            <strong style={{ fontSize: 14 }}>{cli?.nombre || 'Cliente'}</strong>
                            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                              {cli?.tipoDoc}: {cli?.documento} · {cat?.nombre} · {r.codigo}
                            </div>
                          </div>
                        </div>
                        <span className="badge-status disponible">
                          {r.estado === 'Pendiente' ? 'Solicitud Web Hoy' : 'Llega Hoy'}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: 8,
                          borderTop: '1px solid var(--line)',
                          fontSize: 12.5,
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        <div>
                          Salida: <strong>{formatDateDMY(r.salida)}</strong> · Total:{' '}
                          <strong>{formatMoney(r.totalFijo)}</strong>{' '}
                          <span style={{ color: saldo > 0 ? '#d97706' : '#16a34a', fontWeight: 600 }}>
                            ({saldo > 0 ? `Falta: ${formatMoney(saldo)}` : 'Pagado'})
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => abrirModalReprogramar(r)}
                            title="Cambiar habitación o fecha"
                          >
                            Cambiar Cuarto
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleMarcarNoShow(r)}
                            title="Marcar ausente y liberar habitación"
                          >
                            Ausente (No-Show)
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-gold"
                            onClick={() => procesarCheckIn(r.id)}
                          >
                            Check-In Ahora →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMNA B: SALEN HOY (CHECK-OUT DEL DÍA O EXTENSIÓN DE ESTADÍA) */}
          <div className="table-card">
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--line)',
                background: '#fffbeb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong style={{ fontSize: 15, color: '#92400e' }}>
                  Salen Hoy — Check-Out del Día ({salenHoyList.length})
                </strong>
                <div style={{ fontSize: 11.5, color: '#78350f' }}>
                  Huéspedes cuya salida vence hoy a las 12:00 hrs. Puede liquidar su salida o extenderles +1 noche si desean quedarse.
                </div>
              </div>
            </div>

            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {salenHoyList.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  No hay salidas pendientes para hoy.
                </div>
              ) : (
                salenHoyList.map((r) => {
                  const cli = clientes.find((c) => c.id === r.clienteId);
                  const hab = habitaciones.find((h) => h.numero === r.habitacionNumero);
                  const cat = categorias.find((c) => c.id === hab?.categoriaId);
                  const cta = calcularCuentaHabitacion(r.id);
                  const saldo = cta ? cta.saldoPendiente : 0;

                  return (
                    <div
                      key={r.id}
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        border: '1px solid #fde68a',
                        background: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span
                            style={{
                              fontSize: 16,
                              fontWeight: 800,
                              padding: '6px 12px',
                              borderRadius: 8,
                              background: '#d97706',
                              color: '#fff',
                            }}
                          >
                            #{r.habitacionNumero}
                          </span>
                          <div>
                            <strong style={{ fontSize: 14 }}>{cli?.nombre || 'Huésped'}</strong>
                            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                              {cli?.tipoDoc}: {cli?.documento} · {cat?.nombre} · {r.codigo}
                            </div>
                          </div>
                        </div>
                        <span className="badge-status reservada">Sale Hoy 12:00</span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: 8,
                          borderTop: '1px solid var(--line)',
                          fontSize: 12.5,
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        <div>
                          Total Cuenta: <strong>{formatMoney(cta ? cta.totalCuenta : r.totalFijo)}</strong> ·{' '}
                          <strong style={{ color: saldo > 0 ? '#dc2626' : '#16a34a' }}>
                            {saldo > 0 ? `Saldo por cobrar: ${formatMoney(saldo)}` : 'Cuenta Pagada'}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleExtenderUnaNoche(r)}
                            title="Caso: El huésped pide quedarse 1 noche más"
                          >
                            +1 Noche (Extender)
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-gold"
                            onClick={() => navigate('/estancias')}
                          >
                            Liquidar Check-Out →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 2: PROGRAMADAS (PRÓXIMAS RESERVAS FUTURAS)
         ===================================================================== */}
      {vistaActiva === 'programadas' && (
        <div className="table-card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
            <strong style={{ fontSize: 15, color: 'var(--wine-900)' }}>
              Reservas Programadas para Próximos Días ({programadasList.length})
            </strong>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              Permite reprogramar fechas/habitación, adelantar el Check-In a hoy si el huésped llegó antes, o cancelar.
            </div>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reserva</th>
                  <th>Cliente Titular</th>
                  <th>Habitación Asignada</th>
                  <th>Fechas Programadas</th>
                  <th>Importe y Adelanto</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones (Casos)</th>
                </tr>
              </thead>
              <tbody>
                {programadasList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      No hay reservas programadas para fechas futuras.
                    </td>
                  </tr>
                ) : (
                  programadasList.map((r) => {
                    const cli = clientes.find((c) => c.id === r.clienteId);
                    const hab = habitaciones.find((h) => h.numero === r.habitacionNumero);
                    const cat = categorias.find((c) => c.id === hab?.categoriaId);
                    const saldo = Math.max(0, r.totalFijo - r.adelanto);

                    return (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.codigo}</strong>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.huespedes} pers.</div>
                        </td>
                        <td>
                          <strong>{cli?.nombre || 'Cliente'}</strong>
                          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                            {cli?.tipoDoc}: {cli?.documento}
                          </div>
                        </td>
                        <td>
                          <strong>Hab. #{r.habitacionNumero}</strong>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                            {cat?.nombre} · Piso {hab?.piso || 1}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>
                            {formatDateDMY(r.entrada)} → {formatDateDMY(r.salida)}
                          </div>
                        </td>
                        <td>
                          <strong>{formatMoney(r.totalFijo)}</strong>
                          <div style={{ fontSize: 11, color: '#0284c7', fontWeight: 600 }}>
                            Adelanto: {formatMoney(r.adelanto)} (Resta: {formatMoney(saldo)})
                          </div>
                        </td>
                        <td>
                          <span className="badge-status reservada">
                            {r.estado === 'Pendiente' ? 'Solicitud Web' : 'Programada'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => abrirModalReprogramar(r)}
                            >
                              Reprogramar / Cuarto
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-gold"
                              onClick={() => {
                                if (procesarCheckIn(r.id)) {
                                  setVistaActiva('estadia');
                                }
                              }}
                              title="Caso: El cliente llegó antes de la fecha e ingresa hoy"
                            >
                              Adelantar Check-In
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                setCancelModalRes(r);
                                setMotivoCancel('');
                              }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 3: EN ESTADÍA (HUÉSPEDES ALOJADOS ACTUALMENTE)
         ===================================================================== */}
      {vistaActiva === 'estadia' && (
        <div className="table-card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
            <strong style={{ fontSize: 15, color: 'var(--wine-900)' }}>
              Huéspedes Actualmente en Estadía ({enEstadiaList.length})
            </strong>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              Habitaciones ocupadas en este momento. Permite extender noches, cambiar de habitación o ir a liquidación y Check-Out.
            </div>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Habitación</th>
                  <th>Huésped / Empresa</th>
                  <th>Estadía (Ingreso → Salida)</th>
                  <th>Cuenta Total y Saldo</th>
                  <th style={{ textAlign: 'right' }}>Acciones en Estadía</th>
                </tr>
              </thead>
              <tbody>
                {enEstadiaList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      No hay huéspedes en estadía en este momento.
                    </td>
                  </tr>
                ) : (
                  enEstadiaList.map((r) => {
                    const cli = clientes.find((c) => c.id === r.clienteId);
                    const hab = habitaciones.find((h) => h.numero === r.habitacionNumero);
                    const cat = categorias.find((c) => c.id === hab?.categoriaId);
                    const cta = calcularCuentaHabitacion(r.id);
                    const saldo = cta ? cta.saldoPendiente : 0;
                    const saleHoy = r.salida === todayYMD;

                    return (
                      <tr key={r.id} style={{ background: saleHoy ? '#fffbeb' : undefined }}>
                        <td>
                          <span
                            style={{
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: 6,
                              background: '#0f172a',
                              color: '#fff',
                              fontSize: 13,
                            }}
                          >
                            Hab. #{r.habitacionNumero}
                          </span>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                            {cat?.nombre} · {r.codigo}
                          </div>
                        </td>
                        <td>
                          <strong>{cli?.nombre || 'Huésped'}</strong>
                          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                            {cli?.tipoDoc}: {cli?.documento}
                          </div>
                        </td>
                        <td>
                          <div>
                            {formatDateDMY(r.entrada)} → <strong>{formatDateDMY(r.salida)}</strong>
                          </div>
                          {saleHoy && (
                            <span className="badge-status reservada" style={{ marginTop: 2 }}>
                              Sale Hoy
                            </span>
                          )}
                        </td>
                        <td>
                          <div>
                            Total: <strong>{formatMoney(cta ? cta.totalCuenta : r.totalFijo)}</strong>
                          </div>
                          <div style={{ fontSize: 11.5, color: saldo > 0 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                            {saldo > 0 ? `Saldo pendiente: ${formatMoney(saldo)}` : 'Liquidada (S/ 0.00)'}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleExtenderUnaNoche(r)}
                            >
                              +1 Noche
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => abrirModalReprogramar(r)}
                            >
                              Cambiar Cuarto
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-gold"
                              onClick={() => navigate('/estancias')}
                            >
                              Consumos / Check-Out →
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL REPROGRAMAR FECHAS / CAMBIAR DE HABITACIÓN
         ===================================================================== */}
      {reprogRes && (
        <div className="modal-backdrop" onClick={() => setReprogRes(null)}>
          <div className="modal-dialog" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reprogramar o Cambiar Cuarto — {reprogRes.codigo}</h3>
              <button className="btn-close-modal" onClick={() => setReprogRes(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleGuardarReprogramacion}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="field-label">Habitación Asignada</label>
                  <select
                    className="form-select"
                    value={repHab}
                    onChange={(e) => setRepHab(e.target.value)}
                  >
                    {habitaciones
                      .filter(
                        (h) =>
                          h.numero === reprogRes.habitacionNumero ||
                          isHabitacionDisponible(h.numero, repEntrada, repSalida, reprogRes.id)
                      )
                      .map((h) => {
                        const c = categorias.find((cat) => cat.id === h.categoriaId);
                        return (
                          <option key={h.numero} value={h.numero}>
                            Habitación #{h.numero} — {c?.nombre} ({formatMoney(c?.tarifaBase || 140)}/n)
                          </option>
                        );
                      })}
                  </select>
                </div>

                <div className="form-grid">
                  <div>
                    <label className="field-label">Fecha de Entrada</label>
                    <input
                      type="date"
                      className="form-input"
                      value={repEntrada}
                      disabled={reprogRes.estado === 'En Curso'}
                      onChange={(e) => {
                        setRepEntrada(e.target.value);
                        if (repSalida <= e.target.value) {
                          setRepSalida(addDaysYMD(e.target.value, 1));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="field-label">Fecha de Salida</label>
                    <input
                      type="date"
                      className="form-input"
                      min={addDaysYMD(repEntrada, 1)}
                      value={repSalida}
                      onChange={(e) => setRepSalida(e.target.value)}
                    />
                  </div>
                </div>

                {repError && <div style={{ color: '#dc2626', fontSize: 12 }}>{repError}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setReprogRes(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-gold">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL WIZARD PASO A PASO (3 PASOS CLAROS)
         ===================================================================== */}
      {showNewModal && (
        <div className="modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {esWalkIn ? 'Walk-In (Ingreso Directo)' : 'Nueva Reserva'} — Paso {pasoWizard} de 3
              </h3>
              <button className="btn-close-modal" onClick={() => setShowNewModal(false)}>
                &times;
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                padding: '12px 20px',
                background: '#f8fafc',
                borderBottom: '1px solid var(--line)',
                fontSize: 12.5,
              }}
            >
              <div
                onClick={() => setPasoWizard(1)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: pasoWizard === 1 ? '#14532d' : '#e2e8f0',
                  color: pasoWizard === 1 ? '#fff' : 'var(--ink)',
                  fontWeight: 700,
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                1. Habitación Libre {resHab ? `(#${resHab})` : ''}
              </div>
              <div
                onClick={() => resHab && setPasoWizard(2)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: pasoWizard === 2 ? '#14532d' : '#e2e8f0',
                  color: pasoWizard === 2 ? '#fff' : 'var(--ink)',
                  fontWeight: 700,
                  textAlign: 'center',
                  cursor: resHab ? 'pointer' : 'not-allowed',
                }}
              >
                2. Cliente Titular
              </div>
              <div
                onClick={() => resHab && resCliId && setPasoWizard(3)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: pasoWizard === 3 ? '#14532d' : '#e2e8f0',
                  color: pasoWizard === 3 ? '#fff' : 'var(--ink)',
                  fontWeight: 700,
                  textAlign: 'center',
                  cursor: resHab && resCliId ? 'pointer' : 'not-allowed',
                }}
              >
                3. Confirmar Reserva
              </div>
            </div>

            <div className="modal-body">
              {pasoWizard === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 110px',
                      gap: 12,
                      alignItems: 'end',
                    }}
                  >
                    <div>
                      <label className="field-label">Fecha de Entrada</label>
                      <input
                        type="date"
                        className="form-input"
                        min={todayYMD}
                        value={resIn}
                        onChange={(e) => {
                          setResIn(e.target.value);
                          if (resOut <= e.target.value) {
                            setResOut(addDaysYMD(e.target.value, 1));
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="field-label">Fecha de Salida</label>
                      <input
                        type="date"
                        className="form-input"
                        min={addDaysYMD(resIn, 1)}
                        value={resOut}
                        onChange={(e) => setResOut(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label">Personas</label>
                      <input
                        type="number"
                        min="1"
                        max="4"
                        className="form-input"
                        value={resHuesp}
                        onChange={(e) => setResHuesp(Math.max(1, Number(e.target.value) || 1))}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>Duración rápida:</span>
                    {[1, 2, 3, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => setResOut(addDaysYMD(resIn, n))}
                      >
                        {n} {n === 1 ? 'Noche' : 'Noches'}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="field-label" style={{ marginBottom: 8 }}>
                      Haga clic en una Habitación Disponible ({habsDisponibles.length} libres):
                    </label>
                    {habsDisponibles.length === 0 ? (
                      <div style={{ padding: 16, background: '#fef2f2', color: '#991b1b', borderRadius: 8, fontSize: 13 }}>
                        No hay habitaciones disponibles para esas fechas y capacidad.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))',
                          gap: 10,
                          maxHeight: 240,
                          overflowY: 'auto',
                        }}
                      >
                        {habsDisponibles.map((h) => {
                          const cat = categorias.find((c) => c.id === h.categoriaId);
                          const selected = h.numero === resHab;
                          return (
                            <div
                              key={h.numero}
                              onClick={() => setResHab(h.numero)}
                              style={{
                                padding: 12,
                                borderRadius: 10,
                                border: selected ? '2px solid #16a34a' : '1px solid var(--line)',
                                background: selected ? '#f0fdf4' : '#ffffff',
                                cursor: 'pointer',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: 15 }}>Hab. #{h.numero}</strong>
                                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Piso {h.piso}</span>
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--wine-800)', marginTop: 4 }}>
                                {cat?.nombre}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                                {formatMoney(cat?.tarifaBase || 0)} / noche
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {pasoWizard === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div
                    style={{
                      padding: '10px 14px',
                      background: '#f0fdf4',
                      borderRadius: 8,
                      border: '1px solid #bbf7d0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 13,
                    }}
                  >
                    <span>
                      Habitación seleccionada: <strong>#{resHab} ({catSeleccionadaObj?.nombre})</strong> · Del{' '}
                      {formatDateDMY(resIn)} al {formatDateDMY(resOut)}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => setPasoWizard(1)}
                      style={{ padding: '2px 8px', fontSize: 11 }}
                    >
                      Cambiar Cuarto
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="field-label" style={{ margin: 0 }}>
                      Seleccione al Cliente Titular para la Habitación #{resHab}
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => setModoNuevoCliente((prev) => !prev)}
                    >
                      {modoNuevoCliente ? '← Volver a la Lista' : '+ Crear Nuevo Cliente'}
                    </button>
                  </div>

                  {!modoNuevoCliente ? (
                    <>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Buscar cliente por DNI, RUC o nombre..."
                        value={clienteSearch}
                        onChange={(e) => setClienteSearch(e.target.value)}
                      />
                      <div
                        style={{
                          maxHeight: 230,
                          overflowY: 'auto',
                          border: '1px solid var(--line)',
                          borderRadius: 10,
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        {clientesFiltradosModal.map((c) => {
                          const sel = c.id === Number(resCliId);
                          return (
                            <div
                              key={c.id}
                              onClick={() => setResCliId(c.id)}
                              style={{
                                padding: '10px 14px',
                                borderBottom: '1px solid var(--line)',
                                background: sel ? '#f0fdf4' : '#ffffff',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <div>
                                <strong style={{ fontSize: 13.5 }}>{c.nombre}</strong>
                                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                                  {c.tipoDoc}: {c.documento} · Tel: {c.telefono}
                                </div>
                              </div>
                              {sel && <span className="badge-status disponible">Seleccionado ✓</span>}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        padding: 16,
                        background: '#f8fafc',
                        borderRadius: 10,
                        border: '1px solid var(--line)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr auto', gap: 8, alignItems: 'end' }}>
                        <div>
                          <label className="field-label">Documento</label>
                          <select
                            className="form-select"
                            value={nuevoTipoDoc}
                            onChange={(e) => setNuevoTipoDoc(e.target.value as 'DNI' | 'RUC' | 'Pasaporte')}
                          >
                            <option value="DNI">DNI</option>
                            <option value="RUC">RUC Empresa</option>
                            <option value="Pasaporte">Pasaporte</option>
                          </select>
                        </div>
                        <div>
                          <label className="field-label">Número</label>
                          <input
                            type="text"
                            className="form-input"
                            value={nuevoDoc}
                            onChange={(e) => setNuevoDoc(e.target.value)}
                            placeholder={nuevoTipoDoc === 'RUC' ? '11 dígitos' : '8 dígitos'}
                          />
                        </div>
                        <button type="button" className="btn btn-secondary" onClick={handleAutocompletarPadron}>
                          Buscar RENIEC/SUNAT
                        </button>
                      </div>

                      <div className="form-grid">
                        <div>
                          <label className="field-label">Nombre Completo o Razón Social</label>
                          <input
                            type="text"
                            className="form-input"
                            value={nuevoNombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="field-label">Teléfono</label>
                          <input
                            type="text"
                            className="form-input"
                            value={nuevoTel}
                            onChange={(e) => setNuevoTel(e.target.value)}
                          />
                        </div>
                      </div>

                      {nuevoError && <div style={{ color: '#dc2626', fontSize: 12 }}>{nuevoError}</div>}

                      <button type="button" className="btn btn-gold" onClick={handleGuardarClienteRapido}>
                        Guardar y Vincular Cliente
                      </button>
                    </div>
                  )}
                </div>
              )}

              {pasoWizard === 3 && cotizacionActual && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div
                    style={{
                      padding: 16,
                      background: '#f8fafc',
                      borderRadius: 10,
                      border: '1px solid var(--line)',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 12,
                      fontSize: 13,
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block' }}>Habitación Asignada</span>
                      <strong style={{ fontSize: 15 }}>
                        #{resHab} — {catSeleccionadaObj?.nombre}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block' }}>Cliente Vinculado</span>
                      <strong style={{ fontSize: 14 }}>{clienteSeleccionadoObj?.nombre}</strong>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                        {clienteSeleccionadoObj?.tipoDoc}: {clienteSeleccionadoObj?.documento}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block' }}>Fechas ({cotizacionActual.noches} noches)</span>
                      <strong>
                        {formatDateDMY(resIn)} al {formatDateDMY(resOut)}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block' }}>Total Hospedaje (Inc. IGV)</span>
                      <strong style={{ fontSize: 16, color: 'var(--wine-900)' }}>
                        {formatMoney(cotizacionActual.total)}
                      </strong>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div>
                      <label className="field-label">Adelanto / Garantía Opcional (S/)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={cotizacionActual.total}
                        className="form-input"
                        value={resAdelanto}
                        onChange={(e) => setResAdelanto(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label">Medio de Pago del Adelanto</label>
                      <select
                        className="form-select"
                        value={resMetodoPago}
                        onChange={(e) =>
                          setResMetodoPago(e.target.value as 'Efectivo' | 'Tarjeta' | 'Yape/Plin')
                        }
                      >
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta">Tarjeta Visa / Mastercard</option>
                        <option value="Yape/Plin">Yape / Plin</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="field-label">Observaciones (Opcional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={resObs}
                      onChange={(e) => setResObs(e.target.value)}
                      placeholder="Ej. Llega a las 15:00 hrs, requiere factura..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              {pasoWizard > 1 ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPasoWizard((prev) => (prev - 1) as 1 | 2 | 3)}
                >
                  ← Paso Anterior
                </button>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewModal(false)}>
                  Cancelar
                </button>
              )}

              {pasoWizard === 1 && (
                <button
                  type="button"
                  className="btn btn-gold"
                  disabled={!resHab}
                  onClick={() => setPasoWizard(2)}
                >
                  Siguiente: Elegir Cliente →
                </button>
              )}

              {pasoWizard === 2 && (
                <button
                  type="button"
                  className="btn btn-gold"
                  disabled={!resCliId}
                  onClick={() => setPasoWizard(3)}
                >
                  Siguiente: Ver Resumen →
                </button>
              )}

              {pasoWizard === 3 && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {resIn === todayYMD && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleConfirmarReservaFinal(true)}
                    >
                      Guardar e Ingresar Ahora (Walk-In)
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-gold"
                    onClick={() => handleConfirmarReservaFinal(esWalkIn)}
                  >
                    Confirmar Reserva
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE RESERVA */}
      {fichaReserva && (
        <div className="modal-backdrop" onClick={() => setFichaReserva(null)}>
          <div className="modal-dialog" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle de Reserva — {fichaReserva.codigo}</h3>
              <button className="btn-close-modal" onClick={() => setFichaReserva(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div>
                <strong>Cliente Titular:</strong>{' '}
                {clientes.find((c) => c.id === fichaReserva.clienteId)?.nombre || 'Titular'}
              </div>
              <div>
                <strong>Habitación:</strong> #{fichaReserva.habitacionNumero} ·{' '}
                <strong>Estado:</strong> {fichaReserva.estado}
              </div>
              <div>
                <strong>Estadía:</strong> {formatDateDMY(fichaReserva.entrada)} al{' '}
                {formatDateDMY(fichaReserva.salida)}
              </div>
              <div>
                <strong>Total Pactado:</strong> {formatMoney(fichaReserva.totalFijo)} ·{' '}
                <strong>Adelanto:</strong> {formatMoney(fichaReserva.adelanto)}
              </div>
              {fichaReserva.observaciones && (
                <div>
                  <strong>Observaciones:</strong> {fichaReserva.observaciones}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setFichaReserva(null)}>
                Cerrar
              </button>
              {fichaReserva.estado === 'Confirmada' && (
                <button
                  type="button"
                  className="btn btn-gold"
                  onClick={() => {
                    const id = fichaReserva.id;
                    setFichaReserva(null);
                    if (procesarCheckIn(id)) {
                      setVistaActiva('estadia');
                    }
                  }}
                >
                  Realizar Check-In Ahora
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CANCELAR RESERVA */}
      {cancelModalRes && (
        <div className="modal-backdrop" onClick={() => setCancelModalRes(null)}>
          <div className="modal-dialog" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancelar Reserva — {cancelModalRes.codigo}</h3>
              <button className="btn-close-modal" onClick={() => setCancelModalRes(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={confirmarCancelacion}>
              <div className="modal-body">
                <label className="field-label">Motivo de Cancelación</label>
                <input
                  type="text"
                  className="form-input"
                  value={motivoCancel}
                  onChange={(e) => setMotivoCancel(e.target.value)}
                  placeholder="Ej. Reprogramación de viaje del cliente"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setCancelModalRes(null)}>
                  Volver
                </button>
                <button type="submit" className="btn btn-danger">
                  Confirmar Cancelación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
