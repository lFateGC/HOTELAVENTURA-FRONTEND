/**
 * MÓDULO 3: Habitaciones (Rack Interactivo con Estado de Reservas, Clientes y Reserva en 1 Clic)
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
  type HabitacionHotel,
  type ReservaHotel,
  type ClienteHotel,
} from '../../context/HotelContext';

export const RackPage: React.FC = () => {
  const {
    todayYMD,
    currentUser,
    habitaciones,
    setHabitaciones,
    categorias,
    setCategorias,
    temporadas,
    setTemporadas,
    reservas,
    setReservas,
    clientes,
    setClientes,
    setPagos,
    cajaActual,
    setCajaActual,
    preventivos,
    setPreventivos,
    incidencias,
    setIncidencias,
    procesarLimpiezaTerminada,
    procesarCheckIn,
    calcularCuentaHabitacion,
    cotizarEstadia,
    isHabitacionDisponible,
    logAuditoria,
    showToast,
  } = useHotel();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [subtab, setSubtab] = useState<'cuartos' | 'preventivo' | 'config'>('cuartos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroPiso, setFiltroPiso] = useState('Todos');

  // Filtro interactivo de fechas y cliente en el propio Rack
  const [fechaConsultaIn, setFechaConsultaIn] = useState(todayYMD);
  const [fechaConsultaOut, setFechaConsultaOut] = useState(addDaysYMD(todayYMD, 2));
  const [clientePreseleccionadoId, setClientePreseleccionadoId] = useState<number | null>(null);

  // Modal de Reserva / Walk-In en 1 Clic directamente desde la tarjeta de Habitación
  const [modalReservaHab, setModalReservaHab] = useState<HabitacionHotel | null>(null);
  const [modoWalkInHab, setModoWalkInHab] = useState(false);
  const [rIn, setRIn] = useState(todayYMD);
  const [rOut, setROut] = useState(addDaysYMD(todayYMD, 1));
  const [rCliId, setRCliId] = useState<number>(clientes[0]?.id || 1);
  const [rAdelanto, setRAdelanto] = useState('0');
  const [rMetodo, setRMetodo] = useState<'Efectivo' | 'Tarjeta' | 'Yape/Plin'>('Efectivo');
  const [rObs, setRObs] = useState('');
  const [busqCliModal, setBusqCliModal] = useState('');

  // Sub-formulario rápido de Nuevo Cliente dentro del modal de habitación
  const [crearCliInline, setCrearCliInline] = useState(false);
  const [ inlineTipoDoc, setInlineTipoDoc] = useState<'DNI' | 'RUC'>('DNI');
  const [inlineDoc, setInlineDoc] = useState('');
  const [inlineNombre, setInlineNombre] = useState('');
  const [inlineTel, setInlineTel] = useState('');

  // Modales de Configuración Dinámica (Habitaciones, Categorías, Temporadas)
  const [showNewHabModal, setShowNewHabModal] = useState(false);
  const [newHabNum, setNewHabNum] = useState('');
  const [newHabPiso, setNewHabPiso] = useState('1');
  const [newHabCat, setNewHabCat] = useState<number>(categorias[0]?.id || 1);

  const [showCatModal, setShowCatModal] = useState(false);
  const [editCatId, setEditCatId] = useState<number | null>(null);
  const [catNombre, setCatNombre] = useState('');
  const [catCap, setCatCap] = useState('2');
  const [catTarifa, setCatTarifa] = useState('180');
  const [catDesc, setCatDesc] = useState('');

  const [showTempModal, setShowTempModal] = useState(false);
  const [tempNombre, setTempNombre] = useState('');
  const [tempInicio, setTempInicio] = useState(todayYMD);
  const [tempFin, setTempFin] = useState(todayYMD);
  const [tempPct, setTempPct] = useState('15');

  // Modales de Avería, Cuenta y Preventivo
  const [averiaHab, setAveriaHab] = useState<string | null>(null);
  const [averiaCat, setAveriaCat] = useState('Aire Acondicionado');
  const [averiaDesc, setAveriaDesc] = useState('');
  const [averiaErr, setAveriaErr] = useState('');

  const [cuentaHab, setCuentaHab] = useState<string | null>(null);
  const [showPrevModal, setShowPrevModal] = useState(false);
  const [prevHab, setPrevHab] = useState('');
  const [prevInicio, setPrevInicio] = useState(todayYMD);
  const [prevFin, setPrevFin] = useState(todayYMD);
  const [prevMotivo, setPrevMotivo] = useState('');
  const [prevErr, setPrevErr] = useState('');

  const isLimpieza = currentUser.rol === 'Personal de Limpieza';
  const isAdmin = currentUser.rol === 'Administrador';

  // Leer si se vino con ?clienteId=... desde Clientes
  useEffect(() => {
    const cid = searchParams.get('clienteId');
    if (cid) {
      setClientePreseleccionadoId(Number(cid));
      setRCliId(Number(cid));
      setFiltroEstado('Disponible');
      const next = new URLSearchParams(searchParams);
      next.delete('clienteId');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams]);

  // Estado real calculado en vivo para cada habitación según reservas e incidencias
  const obtenerContextoHabitacion = (h: HabitacionHotel) => {
    const averiaActiva = incidencias.find(
      (i) => i.habitacionNumero === h.numero && i.estado === 'Abierta'
    );
    const reservaEnCurso = reservas.find(
      (r) => r.habitacionNumero === h.numero && r.estado === 'En Curso'
    );
    const reservasConfirmadas = reservas
      .filter((r) => r.habitacionNumero === h.numero && r.estado === 'Confirmada')
      .sort((a, b) => a.entrada.localeCompare(b.entrada));

    const reservaHoy = reservasConfirmadas.find((r) => r.entrada === todayYMD);
    const proximaReserva = reservasConfirmadas.find((r) => r.entrada > todayYMD);

    let estadoEfectivo: HabitacionHotel['estado'] = h.estado;
    if (averiaActiva) {
      estadoEfectivo = 'Mantenimiento';
    } else if (reservaEnCurso) {
      estadoEfectivo = 'Ocupada';
    } else if (h.estado === 'En Limpieza') {
      estadoEfectivo = 'En Limpieza';
    } else if (reservaHoy) {
      estadoEfectivo = 'Reservada';
    } else {
      estadoEfectivo = 'Disponible';
    }

    const libreEnRangoConsultado = isHabitacionDisponible(
      h.numero,
      fechaConsultaIn,
      fechaConsultaOut
    );

    return {
      estadoEfectivo,
      averiaActiva,
      reservaEnCurso,
      reservaHoy,
      proximaReserva,
      reservasConfirmadas,
      libreEnRangoConsultado,
    };
  };

  const getBadgeClass = (estado: HabitacionHotel['estado']) => {
    if (estado === 'Reservada') return 'reservada';
    if (estado === 'Ocupada') return 'ocupada';
    if (estado === 'En Limpieza') return 'limpieza';
    if (estado === 'Mantenimiento') return 'mantenimiento';
    return 'disponible';
  };

  const cuartosFiltrados = habitaciones.filter((h) => {
    const ctx = obtenerContextoHabitacion(h);
    if (filtroEstado !== 'Todos' && ctx.estadoEfectivo !== filtroEstado) return false;
    if (filtroPiso !== 'Todos' && String(h.piso) !== filtroPiso) return false;
    return true;
  });

  // Contadores reales por estado
  const countPorEstado = (est: HabitacionHotel['estado']) =>
    habitaciones.filter((h) => obtenerContextoHabitacion(h).estadoEfectivo === est).length;

  // Abrir Modal de Reserva Rápida en 1 Clic desde cualquier tarjeta de Habitación
  const abrirModalReservaDirecta = (h: HabitacionHotel, walkIn: boolean) => {
    setModalReservaHab(h);
    setModoWalkInHab(walkIn);
    const start = walkIn ? todayYMD : fechaConsultaIn;
    const end = walkIn ? addDaysYMD(todayYMD, 1) : fechaConsultaOut > start ? fechaConsultaOut : addDaysYMD(start, 1);
    setRIn(start);
    setROut(end);
    if (clientePreseleccionadoId) {
      setRCliId(clientePreseleccionadoId);
    } else if (clientes.length > 0 && !rCliId) {
      setRCliId(clientes[0].id);
    }
    setRAdelanto('0');
    setRObs('');
    setBusqCliModal('');
    setCrearCliInline(false);
  };

  const guardarClienteInlineRack = () => {
    if (!inlineDoc.trim() || !inlineNombre.trim()) return;
    const nuevoId = clientes.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const nuevo: ClienteHotel = {
      id: nuevoId,
      tipo: inlineTipoDoc === 'RUC' ? 'Empresa' : 'Persona Natural',
      tipoDoc: inlineTipoDoc,
      documento: inlineDoc.trim(),
      nombre: inlineNombre.trim(),
      telefono: inlineTel.trim() || '999888777',
      estado: 'Activo',
    };
    setClientes((prev) => [...prev, nuevo]);
    setRCliId(nuevoId);
    setCrearCliInline(false);
    setInlineDoc('');
    setInlineNombre('');
    setInlineTel('');
    showToast(`Cliente ${nuevo.nombre} creado y vinculado`, 'success');
  };

  const confirmarReservaDesdeRack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalReservaHab) return;

    if (!isHabitacionDisponible(modalReservaHab.numero, rIn, rOut)) {
      showToast(`La Habitación #${modalReservaHab.numero} ya tiene una reserva en esas fechas.`, 'danger');
      return;
    }

    const cat = categorias.find((c) => c.id === modalReservaHab.categoriaId);
    const cot = cotizarEstadia(modalReservaHab.categoriaId, rIn, rOut);
    if (!cat || !cot) return;

    const adelantoNum = Math.max(0, Number(rAdelanto) || 0);
    const nuevoId = reservas.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const codigo = `RES-${String(nuevoId).padStart(4, '0')}`;
    const esWalkInEfectivo = modoWalkInHab && rIn === todayYMD;
    const estadoInicial: ReservaHotel['estado'] = esWalkInEfectivo ? 'En Curso' : 'Confirmada';

    const nuevaReserva: ReservaHotel = {
      id: nuevoId,
      codigo,
      clienteId: Number(rCliId),
      habitacionNumero: modalReservaHab.numero,
      entrada: rIn,
      salida: rOut,
      huespedes: cat.capacidad,
      tarifaBasePorNoche: cat.tarifaBase,
      ajusteTemporada: 0,
      totalFijo: cot.total,
      estado: estadoInicial,
      adelanto: adelantoNum,
      adelantoRetenido: false,
      observaciones: rObs.trim(),
      creadoEl: `${todayYMD} ${formatTimeNow()}`,
      creadoPor: currentUser.usuario,
      acompanantes: [],
    };

    setReservas((prev) => [nuevaReserva, ...prev]);

    if (esWalkInEfectivo) {
      setHabitaciones((prev) =>
        prev.map((h) => (h.numero === modalReservaHab.numero ? { ...h, estado: 'Ocupada' } : h))
      );
    } else if (rIn === todayYMD) {
      setHabitaciones((prev) =>
        prev.map((h) => (h.numero === modalReservaHab.numero ? { ...h, estado: 'Reservada' } : h))
      );
    }

    if (adelantoNum > 0) {
      setPagos((prev) => [
        ...prev,
        {
          id: Date.now(),
          reservaId: nuevoId,
          monto: adelantoNum,
          medio: rMetodo,
          operacion: rMetodo === 'Efectivo' ? '-' : 'OP-RACK',
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
                    concepto: `Adelanto ${codigo} (Hab. #${modalReservaHab.numero})`,
                    medio: rMetodo,
                    tipo: 'Ingreso',
                    monto: adelantoNum,
                    usuario: currentUser.usuario,
                  },
                ],
              }
            : null
        );
      }
    }

    const cliObj = clientes.find((c) => c.id === Number(rCliId));
    logAuditoria(
      'Habitaciones',
      esWalkInEfectivo ? 'Walk-In desde Rack' : 'Reserva desde Rack',
      `${codigo} asignada a ${cliObj?.nombre || 'Cliente'} en Hab. #${modalReservaHab.numero}.`
    );
    showToast(
      esWalkInEfectivo
        ? `Walk-In ${codigo} registrado: Habitación #${modalReservaHab.numero} ahora está Ocupada.`
        : `Reserva ${codigo} confirmada en Habitación #${modalReservaHab.numero}.`,
      'success'
    );
    setModalReservaHab(null);
    setClientePreseleccionadoId(null);
  };

  const handleReportarAveria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!averiaHab) return;
    if (averiaDesc.trim().length < 10) {
      setAveriaErr('La descripción de la falla debe tener al menos 10 caracteres');
      return;
    }

    setIncidencias((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        habitacionNumero: averiaHab,
        categoria: averiaCat,
        descripcion: averiaDesc.trim(),
        fecha: `${todayYMD}`,
        estado: 'Abierta',
        usuario: currentUser.usuario,
      },
    ]);
    setHabitaciones((prev) =>
      prev.map((h) => (h.numero === averiaHab ? { ...h, estado: 'Mantenimiento' } : h))
    );
    logAuditoria(
      'Incidentes',
      'Reporte de Avería',
      `Habitación #${averiaHab} pasada a Mantenimiento por ${averiaCat}.`
    );
    showToast(`Avería registrada. Habitación #${averiaHab} en Mantenimiento`, 'warning');
    setAveriaHab(null);
    setAveriaDesc('');
    setAveriaErr('');
  };

  const handleResolverAveriaDirecta = (habNumero: string) => {
    const inc = incidencias.find((i) => i.habitacionNumero === habNumero && i.estado === 'Abierta');
    if (inc) {
      setIncidencias((prev) =>
        prev.map((i) =>
          i.id === inc.id ? { ...i, estado: 'Resuelta', solucion: 'Reparación técnica verificada' } : i
        )
      );
    }
    setHabitaciones((prev) =>
      prev.map((h) => (h.numero === habNumero ? { ...h, estado: 'En Limpieza' } : h))
    );
    logAuditoria('Incidentes', 'Avería Resuelta', `Avería resuelta en Hab. #${habNumero}. Pasa a En Limpieza.`);
    showToast(`Avería resuelta. Habitación #${habNumero} pasa a En Limpieza`, 'success');
  };

  const handleGuardarPreventivo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prevHab || !prevInicio || !prevFin || prevMotivo.trim().length < 10) {
      setPrevErr('Seleccione cuarto, fechas válidas y un motivo de mínimo 10 caracteres.');
      return;
    }
    if (prevFin < prevInicio) {
      setPrevErr('La fecha fin no puede ser menor a la fecha inicio.');
      return;
    }
    setPreventivos((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        habitacionNumero: prevHab,
        inicio: prevInicio,
        fin: prevFin,
        motivo: prevMotivo.trim(),
        estado: 'Programado',
      },
    ]);
    logAuditoria('Mantenimiento', 'Preventivo Programado', `Programado mantenimiento en Hab. #${prevHab} (${prevInicio} a ${prevFin}).`);
    showToast(`Mantenimiento preventivo programado para Hab. #${prevHab}`, 'success');
    setShowPrevModal(false);
    setPrevMotivo('');
    setPrevErr('');
  };

  const resActivaCuenta = cuentaHab
    ? reservas.find((r) => r.habitacionNumero === cuentaHab && r.estado === 'En Curso')
    : null;
  const detalleCuenta = resActivaCuenta ? calcularCuentaHabitacion(resActivaCuenta.id) : null;
  const cliPreseleccionadoObj = clientePreseleccionadoId
    ? clientes.find((c) => c.id === clientePreseleccionadoId)
    : null;
  const cotModalRack = modalReservaHab
    ? cotizarEstadia(modalReservaHab.categoriaId, rIn, rOut)
    : null;

  return (
    <div>
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
          <h1 className="view-title">Rack Visual de Habitaciones</h1>
          <p className="view-subtitle">
            Consulte qué habitaciones están libres, reservadas u ocupadas, quién las ocupa y reserve en 1 clic
          </p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-gold"
            onClick={() => {
              setNewHabNum('');
              setShowNewHabModal(true);
            }}
          >
            + Nueva Habitación
          </button>
        )}
      </div>

      {/* BANNER SI VIENE CON UN CLIENTE SELECCIONADO PARA ASIGNARLE HABITACIÓN */}
      {cliPreseleccionadoObj && (
        <div
          style={{
            padding: '12px 18px',
            marginBottom: 16,
            borderRadius: 10,
            background: '#f0fdf4',
            border: '2px solid #16a34a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div>
            <strong style={{ color: '#14532d', fontSize: 14 }}>
              Cliente activo para reservar: {cliPreseleccionadoObj.nombre} ({cliPreseleccionadoObj.tipoDoc}:{' '}
              {cliPreseleccionadoObj.documento})
            </strong>
            <div style={{ fontSize: 12, color: '#166534' }}>
              Elija cualquier habitación disponible abajo y haga clic en <strong>Reservar en 1 Clic</strong> o{' '}
              <strong>Walk-In</strong>.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => setClientePreseleccionadoId(null)}
          >
            Quitar Selección
          </button>
        </div>
      )}

      <div className="subtabs-container">
        <button
          className={`subtab-btn ${subtab === 'cuartos' ? 'active' : ''}`}
          onClick={() => setSubtab('cuartos')}
        >
          Panel de Cuartos ({habitaciones.length})
        </button>
        {!isLimpieza && (
          <button
            className={`subtab-btn ${subtab === 'preventivo' ? 'active' : ''}`}
            onClick={() => setSubtab('preventivo')}
          >
            Mantenimiento Preventivo ({preventivos.length})
          </button>
        )}
        {isAdmin && (
          <button
            className={`subtab-btn ${subtab === 'config' ? 'active' : ''}`}
            onClick={() => setSubtab('config')}
          >
            Categorías y Tarifas ({categorias.length})
          </button>
        )}
      </div>

      {subtab === 'cuartos' && (
        <>
          {/* BARRA DE FILTROS DE ESTADO EN 1 CLIC + CONSULTA DE FECHAS Y CLIENTE */}
          <div
            className="table-card"
            style={{
              padding: '14px 18px',
              marginBottom: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${filtroEstado === 'Todos' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFiltroEstado('Todos')}
                >
                  Todas ({habitaciones.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${filtroEstado === 'Disponible' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFiltroEstado('Disponible')}
                >
                  ● Disponibles ({countPorEstado('Disponible')})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${filtroEstado === 'Reservada' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFiltroEstado('Reservada')}
                >
                  ● Reservadas Hoy ({countPorEstado('Reservada')})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${filtroEstado === 'Ocupada' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFiltroEstado('Ocupada')}
                >
                  ● Ocupadas ({countPorEstado('Ocupada')})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${filtroEstado === 'En Limpieza' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFiltroEstado('En Limpieza')}
                >
                  ● En Limpieza ({countPorEstado('En Limpieza')})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${filtroEstado === 'Mantenimiento' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFiltroEstado('Mantenimiento')}
                >
                  ● Mantenimiento ({countPorEstado('Mantenimiento')})
                </button>
              </div>

              <select className="select-role" value={filtroPiso} onChange={(e) => setFiltroPiso(e.target.value)}>
                <option value="Todos">Todos los Pisos</option>
                <option value="1">Piso 1</option>
                <option value="2">Piso 2</option>
                <option value="3">Piso 3</option>
              </select>
            </div>

            {/* Buscador de disponibilidad por fechas y selector rápido de cliente */}
            {!isLimpieza && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                  paddingTop: 12,
                  borderTop: '1px solid var(--line)',
                  fontSize: 12.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ color: 'var(--wine-900)' }}>Verificar fechas para reservar:</strong>
                  <span>Entrada:</span>
                  <input
                    type="date"
                    className="form-input"
                    min={todayYMD}
                    value={fechaConsultaIn}
                    onChange={(e) => {
                      setFechaConsultaIn(e.target.value);
                      if (fechaConsultaOut <= e.target.value) {
                        setFechaConsultaOut(addDaysYMD(e.target.value, 1));
                      }
                    }}
                    style={{ width: 145, padding: '5px 8px', fontSize: 12 }}
                  />
                  <span>Salida:</span>
                  <input
                    type="date"
                    className="form-input"
                    min={addDaysYMD(fechaConsultaIn, 1)}
                    value={fechaConsultaOut}
                    onChange={(e) => setFechaConsultaOut(e.target.value)}
                    style={{ width: 145, padding: '5px 8px', fontSize: 12 }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--muted)' }}>Vincular Cliente:</span>
                  <select
                    className="select-role"
                    value={clientePreseleccionadoId || ''}
                    onChange={(e) =>
                      setClientePreseleccionadoId(e.target.value ? Number(e.target.value) : null)
                    }
                    style={{ maxWidth: 240 }}
                  >
                    <option value="">-- Elegir en el modal --</option>
                    {clientes
                      .filter((c) => c.estado === 'Activo')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre} ({c.documento})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* GRILLA DE HABITACIONES CON CONTEXTO COMPLETO DE RESERVAS Y CLIENTES */}
          <div className="rooms-grid">
            {cuartosFiltrados.map((h) => {
              const cat = categorias.find((c) => c.id === h.categoriaId) || {
                nombre: 'Estándar',
                tarifaBase: 140,
                capacidad: 1,
              };
              const ctx = obtenerContextoHabitacion(h);
              const badgeClass = getBadgeClass(ctx.estadoEfectivo);

              const cliOcupante = ctx.reservaEnCurso
                ? clientes.find((c) => c.id === ctx.reservaEnCurso?.clienteId)
                : null;
              const cliReservaHoy = ctx.reservaHoy
                ? clientes.find((c) => c.id === ctx.reservaHoy?.clienteId)
                : null;
              const cliProxima = ctx.proximaReserva
                ? clientes.find((c) => c.id === ctx.proximaReserva?.clienteId)
                : null;

              return (
                <div
                  className="room-card"
                  key={h.numero}
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div className={`room-card-colorbar ${badgeClass}`}></div>
                    <div className="room-card-body">
                      <div className="room-card-header">
                        <div>
                          <span className="room-number">#{h.numero}</span>
                          <span style={{ fontSize: 11.5, color: 'var(--muted)', marginLeft: 8 }}>
                            Piso {h.piso}
                          </span>
                        </div>
                        <span className={`badge-status ${badgeClass}`}>{ctx.estadoEfectivo}</span>
                      </div>

                      <div className="room-card-meta" style={{ marginBottom: 10 }}>
                        <strong>{cat.nombre}</strong> · Máx. {cat.capacidad} pers. ·{' '}
                        <strong style={{ color: 'var(--wine-800)' }}>{formatMoney(cat.tarifaBase)}/n</strong>
                      </div>

                      {/* BLOQUE DINÁMICO DE ESTADO DE OCUPACIÓN / RESERVA / DISPONIBILIDAD */}
                      {ctx.estadoEfectivo === 'Ocupada' && ctx.reservaEnCurso && (
                        <div
                          style={{
                            padding: '9px 11px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: 8,
                            fontSize: 12,
                            marginBottom: 8,
                          }}
                        >
                          <div style={{ fontWeight: 700, color: '#991b1b' }}>
                            Hospedado: {cliOcupante?.nombre || 'Huésped'}
                          </div>
                          <div style={{ color: '#7f1d1d', fontSize: 11.5, marginTop: 2 }}>
                            {ctx.reservaEnCurso.codigo} · Del {formatDateDMY(ctx.reservaEnCurso.entrada)} al{' '}
                            <strong>{formatDateDMY(ctx.reservaEnCurso.salida)}</strong>
                          </div>
                        </div>
                      )}

                      {ctx.estadoEfectivo === 'Reservada' && ctx.reservaHoy && (
                        <div
                          style={{
                            padding: '9px 11px',
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: 8,
                            fontSize: 12,
                            marginBottom: 8,
                          }}
                        >
                          <div style={{ fontWeight: 700, color: '#92400e' }}>
                            Llega Hoy: {cliReservaHoy?.nombre || 'Cliente'}
                          </div>
                          <div style={{ color: '#78350f', fontSize: 11.5, marginTop: 2 }}>
                            {ctx.reservaHoy.codigo} · {formatDateDMY(ctx.reservaHoy.entrada)} al{' '}
                            {formatDateDMY(ctx.reservaHoy.salida)}
                          </div>
                        </div>
                      )}

                      {ctx.estadoEfectivo === 'Disponible' && (
                        <div
                          style={{
                            padding: '9px 11px',
                            background: ctx.proximaReserva ? '#f0f9ff' : '#f0fdf4',
                            border: `1px solid ${ctx.proximaReserva ? '#bae6fd' : '#bbf7d0'}`,
                            borderRadius: 8,
                            fontSize: 12,
                            marginBottom: 8,
                          }}
                        >
                          {ctx.proximaReserva ? (
                            <>
                              <div style={{ fontWeight: 700, color: '#0369a1' }}>
                                Libre Hoy · Próxima Reserva:
                              </div>
                              <div style={{ color: '#0c4a6e', fontSize: 11.5, marginTop: 2 }}>
                                <strong>
                                  {formatDateDMY(ctx.proximaReserva.entrada)} al{' '}
                                  {formatDateDMY(ctx.proximaReserva.salida)}
                                </strong>{' '}
                                — {cliProxima?.nombre || 'Cliente'} ({ctx.proximaReserva.codigo})
                              </div>
                            </>
                          ) : (
                            <div style={{ fontWeight: 600, color: '#166534' }}>
                              ✓ Disponible hoy y sin reservas próximas
                            </div>
                          )}
                        </div>
                      )}

                      {ctx.estadoEfectivo === 'En Limpieza' && (
                        <div
                          style={{
                            padding: '9px 11px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: 8,
                            fontSize: 12,
                            color: '#1e40af',
                            marginBottom: 8,
                          }}
                        >
                          En cola de Housekeeping tras Check-Out. Habilítela para permitir nuevas reservas.
                        </div>
                      )}

                      {ctx.estadoEfectivo === 'Mantenimiento' && (
                        <div
                          style={{
                            padding: '9px 11px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: 8,
                            fontSize: 12,
                            color: '#991b1b',
                            marginBottom: 8,
                          }}
                        >
                          <strong>Avería:</strong> {ctx.averiaActiva?.categoria || 'Mantenimiento técnico'} —{' '}
                          {ctx.averiaActiva?.descripcion || 'En revisión'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACCIONES DIRECTAS DE LA TARJETA */}
                  <div className="room-card-actions">
                    {ctx.estadoEfectivo === 'Disponible' && !isLimpieza && (
                      <>
                        <button
                          className="btn btn-sm btn-gold"
                          onClick={() => abrirModalReservaDirecta(h, true)}
                          title="Ingresar huésped ahora mismo"
                        >
                          Walk-In
                        </button>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => abrirModalReservaDirecta(h, false)}
                        >
                          Reservar 1 Clic
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setAveriaHab(h.numero);
                            setAveriaDesc('');
                            setAveriaErr('');
                          }}
                        >
                          Avería
                        </button>
                      </>
                    )}

                    {ctx.estadoEfectivo === 'Reservada' && !isLimpieza && (
                      <>
                        <button
                          className="btn btn-sm btn-gold"
                          onClick={() => {
                            if (ctx.reservaHoy) procesarCheckIn(ctx.reservaHoy.id);
                          }}
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          Realizar Check-In Ahora →
                        </button>
                      </>
                    )}

                    {ctx.estadoEfectivo === 'Ocupada' && !isLimpieza && (
                      <>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => setCuentaHab(h.numero)}
                        >
                          Ver Cuenta
                        </button>
                        <button
                          className="btn btn-sm btn-gold"
                          onClick={() => navigate('/estancias')}
                        >
                          Check-Out →
                        </button>
                      </>
                    )}

                    {ctx.estadoEfectivo === 'En Limpieza' && (
                      <>
                        <button
                          className="btn btn-sm btn-gold"
                          onClick={() => procesarLimpiezaTerminada(h.numero)}
                        >
                          ✓ Habilitar Habitación
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setAveriaHab(h.numero);
                            setAveriaDesc('');
                            setAveriaErr('');
                          }}
                        >
                          Avería
                        </button>
                      </>
                    )}

                    {ctx.estadoEfectivo === 'Mantenimiento' && (
                      <button
                        className="btn btn-sm btn-gold"
                        onClick={() => handleResolverAveriaDirecta(h.numero)}
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        ✓ Resolver Avería y Pasar a Limpieza
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {subtab === 'preventivo' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--wine-900)' }}>
                Bloqueos de Mantenimiento Preventivo
              </h3>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                Reserve fechas de revisión técnica para evitar que un cuarto sea reservado en esos días.
              </p>
            </div>
            <button
              className="btn btn-gold"
              onClick={() => {
                setPrevHab(habitaciones[0]?.numero || '101');
                setShowPrevModal(true);
              }}
            >
              Programar Mantenimiento
            </button>
          </div>

          <div className="table-card">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Habitación</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th>Motivo Técnico</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {preventivos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-state">No hay mantenimientos preventivos programados.</td>
                    </tr>
                  ) : (
                    preventivos.map((p) => (
                      <tr key={p.id}>
                        <td><strong>#{p.habitacionNumero}</strong></td>
                        <td>{formatDateDMY(p.inicio)}</td>
                        <td>{formatDateDMY(p.fin)}</td>
                        <td>{p.motivo}</td>
                        <td><span className="badge-status mantenimiento">{p.estado}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {subtab === 'config' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div className="table-card">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--wine-900)' }}>Categorías de Habitación</strong>
                <button
                  className="btn btn-sm btn-gold"
                  onClick={() => {
                    setEditCatId(null);
                    setCatNombre('');
                    setCatCap('2');
                    setCatTarifa('180');
                    setCatDesc('');
                    setShowCatModal(true);
                  }}
                >
                  + Nueva Categoría
                </button>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Capacidad</th>
                      <th>Tarifa Base</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.nombre}</strong>
                          <br />
                          <small style={{ color: 'var(--muted)' }}>{c.descripcion}</small>
                        </td>
                        <td>{c.capacidad} pers.</td>
                        <td><strong>{formatMoney(c.tarifaBase)}</strong></td>
                        <td>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setEditCatId(c.id);
                              setCatNombre(c.nombre);
                              setCatCap(String(c.capacidad));
                              setCatTarifa(String(c.tarifaBase));
                              setCatDesc(c.descripcion);
                              setShowCatModal(true);
                            }}
                          >
                            Editar Tarifa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="table-card">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--wine-900)' }}>Tarifas de Temporada y Promociones</strong>
                <button
                  className="btn btn-sm btn-gold"
                  onClick={() => {
                    setTempNombre('');
                    setTempPct('15');
                    setShowTempModal(true);
                  }}
                >
                  + Nueva Temporada
                </button>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Temporada</th>
                      <th>Vigencia</th>
                      <th>Ajuste</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {temporadas.map((t) => (
                      <tr key={t.id}>
                        <td><strong>{t.nombre}</strong></td>
                        <td>{formatDateDMY(t.inicio)} al {formatDateDMY(t.fin)}</td>
                        <td><strong>{t.porcentaje > 0 ? `+${t.porcentaje}%` : `${t.porcentaje}%`}</strong></td>
                        <td><span className="badge-status disponible">{t.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* =====================================================================
          MODAL RESERVA / WALK-IN EN 1 CLIC DESDE LA HABITACIÓN SELECCIONADA
         ===================================================================== */}
      {modalReservaHab && (
        <div className="modal-backdrop" onClick={() => setModalReservaHab(null)}>
          <div className="modal-dialog" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modoWalkInHab ? 'Walk-In Directo' : 'Reservar'} — Habitación #{modalReservaHab.numero}
              </h3>
              <button className="btn-close-modal" onClick={() => setModalReservaHab(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={confirmarReservaDesdeRack}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div
                  style={{
                    padding: 12,
                    background: '#f0fdf4',
                    borderRadius: 8,
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 13,
                  }}
                >
                  <div>
                    <strong>Habitación #{modalReservaHab.numero}</strong> (Piso {modalReservaHab.piso}) —{' '}
                    {categorias.find((c) => c.id === modalReservaHab.categoriaId)?.nombre}
                  </div>
                  <strong style={{ color: '#14532d', fontSize: 15 }}>
                    {cotModalRack ? `${cotModalRack.noches} noche(s) · ${formatMoney(cotModalRack.total)}` : ''}
                  </strong>
                </div>

                {/* Fechas */}
                <div className="form-grid">
                  <div>
                    <label className="field-label">Fecha de Entrada</label>
                    <input
                      type="date"
                      className="form-input"
                      min={todayYMD}
                      value={rIn}
                      disabled={modoWalkInHab}
                      onChange={(e) => {
                        setRIn(e.target.value);
                        if (rOut <= e.target.value) {
                          setROut(addDaysYMD(e.target.value, 1));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="field-label">Fecha de Salida</label>
                    <input
                      type="date"
                      className="form-input"
                      min={addDaysYMD(rIn, 1)}
                      value={rOut}
                      onChange={(e) => setROut(e.target.value)}
                    />
                  </div>
                </div>

                {/* Selección o creación de Cliente */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="field-label" style={{ margin: 0 }}>
                      Cliente / Huésped Titular <span className="req">*</span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => setCrearCliInline((p) => !p)}
                      style={{ padding: '2px 8px', fontSize: 11 }}
                    >
                      {crearCliInline ? '← Elegir existente' : '+ Nuevo Cliente Rápido'}
                    </button>
                  </div>

                  {!crearCliInline ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Filtrar cliente por nombre o DNI/RUC..."
                        value={busqCliModal}
                        onChange={(e) => setBusqCliModal(e.target.value)}
                      />
                      <select
                        className="form-select"
                        value={rCliId}
                        onChange={(e) => setRCliId(Number(e.target.value))}
                      >
                        {clientes
                          .filter(
                            (c) =>
                              c.estado === 'Activo' &&
                              (!busqCliModal.trim() ||
                                c.nombre.toLowerCase().includes(busqCliModal.toLowerCase()) ||
                                c.documento.includes(busqCliModal))
                          )
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre} — {c.tipoDoc}: {c.documento}
                            </option>
                          ))}
                      </select>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: 12,
                        background: '#f8fafc',
                        borderRadius: 8,
                        border: '1px solid var(--line)',
                        display: 'grid',
                        gridTemplateColumns: '90px 1fr 1.3fr auto',
                        gap: 6,
                        alignItems: 'end',
                      }}
                    >
                      <select
                        className="form-select"
                        value={inlineTipoDoc}
                        onChange={(e) => setInlineTipoDoc(e.target.value as 'DNI' | 'RUC')}
                      >
                        <option value="DNI">DNI</option>
                        <option value="RUC">RUC</option>
                      </select>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="N° Doc"
                        value={inlineDoc}
                        onChange={(e) => setInlineDoc(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Nombre o Razón Social"
                        value={inlineNombre}
                        onChange={(e) => setInlineNombre(e.target.value)}
                      />
                      <button type="button" className="btn btn-sm btn-gold" onClick={guardarClienteInlineRack}>
                        Crear
                      </button>
                    </div>
                  )}
                </div>

                {/* Adelanto y Medio de Pago */}
                <div className="form-grid">
                  <div>
                    <label className="field-label">Adelanto / Abono Ahora (S/)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      value={rAdelanto}
                      onChange={(e) => setRAdelanto(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">Medio de Pago</label>
                    <select
                      className="form-select"
                      value={rMetodo}
                      onChange={(e) => setRMetodo(e.target.value as 'Efectivo' | 'Tarjeta' | 'Yape/Plin')}
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Yape/Plin">Yape / Plin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="field-label">Observaciones</label>
                  <input
                    type="text"
                    className="form-input"
                    value={rObs}
                    onChange={(e) => setRObs(e.target.value)}
                    placeholder="Notas opcionales de la reserva..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalReservaHab(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-gold">
                  {modoWalkInHab
                    ? `Confirmar Walk-In y Ocupar Hab. #${modalReservaHab.numero}`
                    : `Confirmar Reserva en Hab. #${modalReservaHab.numero}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVA HABITACIÓN */}
      {showNewHabModal && (
        <div className="modal-backdrop" onClick={() => setShowNewHabModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registrar Nueva Habitación</h3>
              <button className="btn-close-modal" onClick={() => setShowNewHabModal(false)}>&times;</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const num = newHabNum.trim();
                if (!num) return;
                if (habitaciones.some((h) => h.numero === num)) {
                  showToast(`La habitación #${num} ya existe`, 'danger');
                  return;
                }
                setHabitaciones((prev) => [
                  ...prev,
                  {
                    numero: num,
                    piso: Number(newHabPiso) || 1,
                    categoriaId: Number(newHabCat) || 1,
                    estado: 'Disponible',
                  },
                ]);
                logAuditoria('Habitaciones', 'Nueva Habitación', `Registrada habitación #${num} en Piso ${newHabPiso}.`);
                showToast(`Habitación #${num} creada correctamente`, 'success');
                setShowNewHabModal(false);
              }}
            >
              <div className="modal-body">
                <div className="form-grid">
                  <div>
                    <label className="field-label">N° Habitación <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej. 305"
                      value={newHabNum}
                      onChange={(e) => setNewHabNum(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    />
                  </div>
                  <div>
                    <label className="field-label">Piso <span className="req">*</span></label>
                    <select className="form-select" value={newHabPiso} onChange={(e) => setNewHabPiso(e.target.value)}>
                      <option value="1">Piso 1</option>
                      <option value="2">Piso 2</option>
                      <option value="3">Piso 3</option>
                    </select>
                  </div>
                  <div className="form-col-full">
                    <label className="field-label">Categoría <span className="req">*</span></label>
                    <select className="form-select" value={newHabCat} onChange={(e) => setNewHabCat(Number(e.target.value))}>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre} ({formatMoney(c.tarifaBase)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewHabModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Guardar Habitación</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR CATEGORÍA */}
      {showCatModal && (
        <div className="modal-backdrop" onClick={() => setShowCatModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editCatId ? 'Editar Categoría y Tarifa' : 'Nueva Categoría de Habitación'}</h3>
              <button className="btn-close-modal" onClick={() => setShowCatModal(false)}>&times;</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!catNombre.trim()) return;
                if (editCatId) {
                  setCategorias((prev) =>
                    prev.map((c) =>
                      c.id === editCatId
                        ? {
                            ...c,
                            nombre: catNombre.trim(),
                            capacidad: Number(catCap) || 1,
                            tarifaBase: Number(catTarifa) || 100,
                            descripcion: catDesc.trim(),
                          }
                        : c
                    )
                  );
                  logAuditoria('Categorías', 'Actualización de Tarifa', `Categoría ${catNombre} actualizada a ${formatMoney(Number(catTarifa))}.`);
                  showToast('Categoría actualizada', 'success');
                } else {
                  setCategorias((prev) => [
                    ...prev,
                    {
                      id: prev.length + 1,
                      nombre: catNombre.trim(),
                      capacidad: Number(catCap) || 2,
                      tarifaBase: Number(catTarifa) || 180,
                      descripcion: catDesc.trim() || 'Habitación equipada con TV y Wi-Fi.',
                      estado: 'Activa',
                    },
                  ]);
                  logAuditoria('Categorías', 'Nueva Categoría', `Creada categoría ${catNombre}.`);
                  showToast('Nueva categoría registrada', 'success');
                }
                setShowCatModal(false);
              }}
            >
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-col-full">
                    <label className="field-label">Nombre de Categoría <span className="req">*</span></label>
                    <input type="text" className="form-input" value={catNombre} onChange={(e) => setCatNombre(e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Capacidad (Huéspedes) <span className="req">*</span></label>
                    <input type="number" min={1} max={8} className="form-input" value={catCap} onChange={(e) => setCatCap(e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Tarifa Base / Noche (S/) <span className="req">*</span></label>
                    <input type="number" step="0.5" className="form-input" value={catTarifa} onChange={(e) => setCatTarifa(e.target.value)} />
                  </div>
                  <div className="form-col-full">
                    <label className="field-label">Descripción</label>
                    <textarea className="form-textarea" rows={2} value={catDesc} onChange={(e) => setCatDesc(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCatModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVA TEMPORADA */}
      {showTempModal && (
        <div className="modal-backdrop" onClick={() => setShowTempModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registrar Temporada o Promoción</h3>
              <button className="btn-close-modal" onClick={() => setShowTempModal(false)}>&times;</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!tempNombre.trim()) return;
                setTemporadas((prev) => [
                  ...prev,
                  {
                    id: prev.length + 1,
                    nombre: tempNombre.trim(),
                    inicio: tempInicio,
                    fin: tempFin,
                    porcentaje: Number(tempPct) || 0,
                    estado: 'Activa',
                  },
                ]);
                logAuditoria('Tarifas', 'Nueva Temporada', `Registrada temporada ${tempNombre} (${tempPct}%).`);
                showToast('Temporada registrada', 'success');
                setShowTempModal(false);
              }}
            >
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-col-full">
                    <label className="field-label">Nombre de Temporada / Campaña <span className="req">*</span></label>
                    <input type="text" className="form-input" placeholder="Ej. Temporada Verano" value={tempNombre} onChange={(e) => setTempNombre(e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Fecha Inicio <span className="req">*</span></label>
                    <input type="date" className="form-input" value={tempInicio} onChange={(e) => setTempInicio(e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Fecha Fin <span className="req">*</span></label>
                    <input type="date" className="form-input" value={tempFin} onChange={(e) => setTempFin(e.target.value)} />
                  </div>
                  <div className="form-col-full">
                    <label className="field-label">Porcentaje de Ajuste (% positivo o negativo) <span className="req">*</span></label>
                    <input type="number" className="form-input" value={tempPct} onChange={(e) => setTempPct(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTempModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Guardar Temporada</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REPORTAR AVERÍA DESDE HABITACIÓN */}
      {averiaHab && (
        <div className="modal-backdrop" onClick={() => setAveriaHab(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reportar Avería Técnica - Hab. #{averiaHab}</h3>
              <button className="btn-close-modal" onClick={() => setAveriaHab(null)}>&times;</button>
            </div>
            <form onSubmit={handleReportarAveria}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-col-full">
                    <label className="field-label">Categoría de la Falla <span className="req">*</span></label>
                    <select className="form-select" value={averiaCat} onChange={(e) => setAveriaCat(e.target.value)}>
                      <option value="Aire Acondicionado">Aire Acondicionado / Climatización</option>
                      <option value="Plomería / Agua Caliente">Plomería / Agua Caliente</option>
                      <option value="Sistema Eléctrico / Iluminación">Sistema Eléctrico / Iluminación</option>
                      <option value="Mobiliario / Cerradura">Mobiliario / Cerradura Electrónica</option>
                      <option value="TV / Conectividad Wi-Fi">TV / Conectividad Wi-Fi</option>
                    </select>
                  </div>
                  <div className="form-col-full">
                    <label className="field-label">Descripción Detallada <span className="req">*</span></label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {[
                        'Equipo de aire acondicionado no enfría',
                        'Fuga de agua en grifería del baño',
                        'Falla en cerradura de tarjeta magnética',
                        'Televisor o señal Wi-Fi sin conexión',
                      ].map((mot) => (
                        <button
                          key={mot}
                          type="button"
                          className="btn btn-sm btn-secondary"
                          style={{ fontSize: 11, padding: '4px 10px' }}
                          onClick={() => {
                            setAveriaDesc(mot);
                            setAveriaErr('');
                          }}
                        >
                          {mot}
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Seleccione una falla arriba o escriba el detalle..."
                      value={averiaDesc}
                      onChange={(e) => setAveriaDesc(e.target.value)}
                    />
                    {averiaErr && <small className="field-msg-error">{averiaErr}</small>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAveriaHab(null)}>Cancelar</button>
                <button type="submit" className="btn btn-danger">Enviar a Mantenimiento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VER CUENTA DE HABITACIÓN */}
      {cuentaHab && detalleCuenta && (
        <div className="modal-backdrop" onClick={() => setCuentaHab(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Estado de Cuenta - Habitación #{cuentaHab}</h3>
              <button className="btn-close-modal" onClick={() => setCuentaHab(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                <div style={{ padding: 12, background: 'var(--cream)', borderRadius: 10, textAlign: 'center' }}>
                  <small style={{ color: 'var(--muted)', display: 'block' }}>Hospedaje</small>
                  <strong>{formatMoney(detalleCuenta.totalHospedaje)}</strong>
                </div>
                <div style={{ padding: 12, background: 'var(--cream)', borderRadius: 10, textAlign: 'center' }}>
                  <small style={{ color: 'var(--muted)', display: 'block' }}>Consumos</small>
                  <strong>{formatMoney(detalleCuenta.totalConsumos)}</strong>
                </div>
                <div style={{ padding: 12, background: 'var(--cream)', borderRadius: 10, textAlign: 'center' }}>
                  <small style={{ color: 'var(--muted)', display: 'block' }}>Pagado</small>
                  <strong style={{ color: 'var(--status-disponible)' }}>{formatMoney(detalleCuenta.totalPagado)}</strong>
                </div>
                <div style={{ padding: 12, background: 'var(--cream)', borderRadius: 10, textAlign: 'center' }}>
                  <small style={{ color: 'var(--muted)', display: 'block' }}>Saldo</small>
                  <strong style={{ color: 'var(--status-ocupada)' }}>{formatMoney(detalleCuenta.saldoPendiente)}</strong>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                Reserva: <strong>{detalleCuenta.reserva.codigo}</strong> · Salida prevista: <strong>{formatDateDMY(detalleCuenta.reserva.salida)}</strong>
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCuentaHab(null)}>Cerrar</button>
              <button
                className="btn btn-gold"
                onClick={() => {
                  setCuentaHab(null);
                  navigate('/estancias');
                }}
              >
                Administrar en Estadías / Check-Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROGRAMAR PREVENTIVO */}
      {showPrevModal && (
        <div className="modal-backdrop" onClick={() => setShowPrevModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Programar Mantenimiento Preventivo</h3>
              <button className="btn-close-modal" onClick={() => setShowPrevModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleGuardarPreventivo}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-col-full">
                    <label className="field-label">Habitación <span className="req">*</span></label>
                    <select className="form-select" value={prevHab} onChange={(e) => setPrevHab(e.target.value)}>
                      {habitaciones.map((h) => (
                        <option key={h.numero} value={h.numero}>
                          Habitación #{h.numero} (Piso {h.piso})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Fecha Inicio <span className="req">*</span></label>
                    <input type="date" className="form-input" value={prevInicio} onChange={(e) => setPrevInicio(e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Fecha Fin <span className="req">*</span></label>
                    <input type="date" className="form-input" value={prevFin} onChange={(e) => setPrevFin(e.target.value)} />
                  </div>
                  <div className="form-col-full">
                    <label className="field-label">Motivo Técnico <span className="req">*</span></label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Ej. Revisión preventiva de termostato..."
                      value={prevMotivo}
                      onChange={(e) => setPrevMotivo(e.target.value)}
                    />
                    {prevErr && <small className="field-msg-error">{prevErr}</small>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPrevModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Guardar Programación</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
