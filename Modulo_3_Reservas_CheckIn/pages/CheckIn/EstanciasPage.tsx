/**
 * MÓDULO 3: Control de Check-In, Estadías en Curso y Check-Out
 * Responsable: David Asto (Rama: David)
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useHotel,
  formatMoney,
  formatDateDMY,
  formatTimeNow,
  addDaysYMD,
  type ReservaHotel,
  type AcompananteHotel,
} from '../../context/HotelContext';

export const EstanciasPage: React.FC = () => {
  const {
    todayYMD,
    currentUser,
    reservas,
    setReservas,
    habitaciones,
    setHabitaciones,
    categorias,
    clientes,
    servicios,
    productos,
    setProductos,
    setConsumos,
    setPagos,
    comprobantes,
    setComprobantes,
    cajaActual,
    setCajaActual,
    calcularCuentaHabitacion,
    cotizarEstadia,
    logAuditoria,
    showToast,
  } = useHotel();
  const navigate = useNavigate();

  // Dos pestañas claras para no mezclar tareas:
  // 1. 'checkin' -> Reservas que van a entrar (Entregar llave)
  // 2. 'encasa'  -> Habitaciones ocupadas actualmente (Consumos, Pagos y Check-Out)
  const [tabActiva, setTabActiva] = useState<'checkin' | 'encasa'>('checkin');
  const [busqueda, setBusqueda] = useState('');

  // Modal único de Check-In (simple y directo)
  const [checkInRes, setCheckInRes] = useState<ReservaHotel | null>(null);
  const [ciHabitacion, setCiHabitacion] = useState('');
  const [ciAdelantoExtra, setCiAdelantoExtra] = useState('0');
  const [ciMetodoPago, setCiMetodoPago] = useState<'Efectivo' | 'Tarjeta' | 'Yape/Plin'>('Efectivo');
  const [ciObservaciones, setCiObservaciones] = useState('');

  // Modal unificado "Administrar Habitación Ocupada" (con 3 pestañas internas simples: Consumos | Abonos | Estadía)
  const [habActivaModal, setHabActivaModal] = useState<string | null>(null);
  const [subModalTab, setSubModalTab] = useState<'consumos' | 'abonos' | 'estadia'>('consumos');

  // Campos dentro de Administrar Habitación -> Consumos
  const [consServId, setConsServId] = useState<number>(servicios[0]?.id || 1);
  const [consCantidad, setConsCantidad] = useState<number>(1);
  const [consError, setConsError] = useState('');

  // Campos dentro de Administrar Habitación -> Abonos
  const [abonoMonto, setAbonoMonto] = useState('');
  const [abonoMetodo, setAbonoMetodo] = useState<'Efectivo' | 'Tarjeta' | 'Yape/Plin'>('Efectivo');
  const [abonoOperacion, setAbonoOperacion] = useState('');
  const [abonoError, setAbonoError] = useState('');

  // Campos dentro de Administrar Habitación -> Estadía y Acompañantes
  const [nuevaSalida, setNuevaSalida] = useState('');
  const [acompNombre, setAcompNombre] = useState('');
  const [acompDoc, setAcompDoc] = useState('');

  // Modal limpio de Check-Out (Dar Salida)
  const [checkOutHab, setCheckOutHab] = useState<string | null>(null);
  const [metodoCobroOut, setMetodoCobroOut] = useState<'Efectivo' | 'Tarjeta' | 'Yape/Plin'>('Efectivo');

  const porLlegarAll = reservas.filter((r) => r.estado === 'Confirmada');
  const enCursoAll = reservas.filter((r) => r.estado === 'En Curso');
  const llegadasHoyCount = porLlegarAll.filter((r) => r.entrada === todayYMD).length;
  const salidasHoyCount = enCursoAll.filter((r) => r.salida === todayYMD).length;

  const q = busqueda.trim().toLowerCase();
  const matchesSearch = (r: ReservaHotel) => {
    if (!q) return true;
    const cli = clientes.find((c) => c.id === r.clienteId);
    return (
      r.codigo.toLowerCase().includes(q) ||
      r.habitacionNumero.toLowerCase().includes(q) ||
      (cli?.nombre || '').toLowerCase().includes(q) ||
      (cli?.documento || '').toLowerCase().includes(q)
    );
  };

  const porLlegar = porLlegarAll
    .filter(matchesSearch)
    .sort((a, b) => (a.entrada === todayYMD ? -1 : b.entrada === todayYMD ? 1 : a.entrada.localeCompare(b.entrada)));

  const enCurso = enCursoAll
    .filter(matchesSearch)
    .sort((a, b) => (a.salida === todayYMD ? -1 : b.salida === todayYMD ? 1 : a.habitacionNumero.localeCompare(b.habitacionNumero)));

  // --- ACCIÓN 1: ABRIR Y CONFIRMAR CHECK-IN ---
  const abrirModalCheckIn = (r: ReservaHotel) => {
    setCheckInRes(r);
    setCiHabitacion(r.habitacionNumero);
    setCiAdelantoExtra('0');
    setCiMetodoPago('Efectivo');
    setCiObservaciones(r.observaciones || '');
  };

  const confirmarCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInRes) return;

    const habAnterior = checkInRes.habitacionNumero;
    const habFinal = ciHabitacion || habAnterior;
    const abonoExtra = Math.max(0, Number(ciAdelantoExtra) || 0);

    setReservas((prev) =>
      prev.map((r) =>
        r.id === checkInRes.id
          ? {
              ...r,
              habitacionNumero: habFinal,
              entrada: r.entrada > todayYMD ? todayYMD : r.entrada,
              estado: 'En Curso',
              adelanto: r.adelanto + abonoExtra,
              observaciones: ciObservaciones,
            }
          : r
      )
    );

    setHabitaciones((prev) =>
      prev.map((h) => {
        if (h.numero === habFinal) return { ...h, estado: 'Ocupada' };
        if (habAnterior !== habFinal && h.numero === habAnterior) return { ...h, estado: 'Disponible' };
        return h;
      })
    );

    if (abonoExtra > 0) {
      setPagos((prev) => [
        ...prev,
        {
          id: Date.now(),
          reservaId: checkInRes.id,
          monto: abonoExtra,
          medio: ciMetodoPago,
          operacion: ciMetodoPago === 'Efectivo' ? '-' : 'CI-PAGO',
          tipo: 'Adelanto Check-In',
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
                    concepto: `Pago en Check-In ${checkInRes.codigo} (Hab. #${habFinal})`,
                    medio: ciMetodoPago,
                    tipo: 'Ingreso',
                    monto: abonoExtra,
                    usuario: currentUser.usuario,
                  },
                ],
              }
            : null
        );
      }
    }

    logAuditoria(
      'Check-In',
      'Ingreso de Huésped',
      `Check-In realizado para ${checkInRes.codigo} en Habitación #${habFinal}.`
    );
    showToast(`Check-In completado. Habitación #${habFinal} ahora está Ocupada.`, 'success');
    setCheckInRes(null);
    setTabActiva('encasa');
  };

  // --- ACCIÓN 2: ADMINISTRAR HABITACIÓN OCUPADA (CONSUMOS / ABONOS / ESTADÍA) ---
  const abrirGestionHabitacion = (habNum: string, initialTab: 'consumos' | 'abonos' | 'estadia' = 'consumos') => {
    const res = reservas.find((r) => r.habitacionNumero === habNum && r.estado === 'En Curso');
    if (!res) return;
    const cta = calcularCuentaHabitacion(res.id);
    setHabActivaModal(habNum);
    setSubModalTab(initialTab);
    setConsServId(servicios[0]?.id || 1);
    setConsCantidad(1);
    setConsError('');
    setAbonoMonto(cta && cta.saldoPendiente > 0 ? String(cta.saldoPendiente) : '');
    setAbonoMetodo('Efectivo');
    setAbonoOperacion('');
    setAbonoError('');
    setNuevaSalida(res.salida);
    setAcompNombre('');
    setAcompDoc('');
  };

  const resActivaModal = habActivaModal
    ? reservas.find((r) => r.habitacionNumero === habActivaModal && r.estado === 'En Curso')
    : null;
  const cuentaActivaModal = resActivaModal ? calcularCuentaHabitacion(resActivaModal.id) : null;
  const cliActivoModal = resActivaModal ? clientes.find((c) => c.id === resActivaModal.clienteId) : null;

  const guardarConsumoHabitacion = (e: React.FormEvent) => {
    e.preventDefault();
    setConsError('');
    if (!resActivaModal || !habActivaModal) return;

    const serv = servicios.find((s) => s.id === Number(consServId)) || servicios[0];
    if (!serv) return;

    if (serv.productoId) {
      const prod = productos.find((p) => p.id === serv.productoId);
      if (prod) {
        if (prod.stock < consCantidad) {
          setConsError(`Stock insuficiente (${prod.stock} disponibles).`);
          return;
        }
        setProductos((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, stock: p.stock - consCantidad } : p))
        );
      }
    }

    const subtotal = Number((serv.precio * consCantidad).toFixed(2));
    setConsumos((prev) => [
      ...prev,
      {
        id: Date.now(),
        reservaId: resActivaModal.id,
        habitacionNumero: habActivaModal,
        servicioId: serv.id,
        descripcion: serv.nombre,
        cantidad: consCantidad,
        precioUnitario: serv.precio,
        subtotal,
        fecha: `${todayYMD} ${formatTimeNow()}`,
        usuario: currentUser.usuario,
      },
    ]);

    logAuditoria(
      'Cuentas',
      'Cargo de Consumo',
      `Cargado ${serv.nombre} (x${consCantidad}) por ${formatMoney(subtotal)} a Hab. #${habActivaModal}.`
    );
    showToast(`Agregado: ${serv.nombre} (${formatMoney(subtotal)})`, 'success');
    setConsCantidad(1);
  };

  const guardarAbonoHabitacion = (e: React.FormEvent) => {
    e.preventDefault();
    setAbonoError('');
    if (!resActivaModal || !cuentaActivaModal || !habActivaModal) return;

    const monto = Number(abonoMonto);
    if (!monto || monto <= 0 || monto > cuentaActivaModal.saldoPendiente) {
      setAbonoError(`Ingrese un monto válido hasta ${formatMoney(cuentaActivaModal.saldoPendiente)}`);
      return;
    }

    setPagos((prev) => [
      ...prev,
      {
        id: Date.now(),
        reservaId: resActivaModal.id,
        monto,
        medio: abonoMetodo,
        operacion: abonoMetodo === 'Efectivo' ? '-' : abonoOperacion.trim() || 'OP-POS',
        tipo: 'Abono',
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
                  concepto: `Abono Hab. #${habActivaModal} (${resActivaModal.codigo})`,
                  medio: abonoMetodo,
                  tipo: 'Ingreso',
                  monto,
                  usuario: currentUser.usuario,
                },
              ],
            }
          : null
      );
    }

    if (cliActivoModal) {
      const esRuc = cliActivoModal.tipoDoc === 'RUC';
      const serie = esRuc ? 'F001' : 'B001';
      const numComp = `${serie}-${String(comprobantes.length + 1).padStart(6, '0')}`;
      const subtotal = Number((monto / 1.18).toFixed(2));
      const igv = Number((monto - subtotal).toFixed(2));

      setComprobantes((prev) => [
        {
          id: Date.now(),
          numero: numComp,
          tipo: esRuc ? 'Factura' : 'Boleta',
          clienteId: cliActivoModal.id,
          clienteNombre: cliActivoModal.nombre,
          clienteDoc: cliActivoModal.documento,
          concepto: `Abono de Estadía Hab. #${habActivaModal} (${resActivaModal.codigo})`,
          subtotal,
          igv,
          total: monto,
          estado: 'Emitido',
          fecha: `${todayYMD} ${formatTimeNow()}`,
          notaCreditoId: null,
        },
        ...prev,
      ]);
    }

    logAuditoria('Caja', 'Abono a Habitación', `Abono de ${formatMoney(monto)} en Hab. #${habActivaModal}.`);
    showToast(`Pago de ${formatMoney(monto)} registrado correctamente`, 'success');
    setAbonoMonto('');
  };

  const guardarCambioEstadia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resActivaModal || !nuevaSalida) return;

    const hab = habitaciones.find((h) => h.numero === resActivaModal.habitacionNumero);
    const cot = hab ? cotizarEstadia(hab.categoriaId, resActivaModal.entrada, nuevaSalida) : null;
    const nuevoTotal = cot ? cot.total : resActivaModal.totalFijo;

    setReservas((prev) =>
      prev.map((r) =>
        r.id === resActivaModal.id ? { ...r, salida: nuevaSalida, totalFijo: nuevoTotal } : r
      )
    );
    showToast(`Fecha de salida actualizada al ${formatDateDMY(nuevaSalida)}`, 'success');
  };

  const agregarAcompananteModal = () => {
    if (!resActivaModal || !acompNombre.trim() || !acompDoc.trim()) return;
    const nuevo: AcompananteHotel = {
      nombre: acompNombre.trim(),
      tipoDoc: 'DNI',
      documento: acompDoc.trim(),
    };
    const lista = [...(resActivaModal.acompanantes || []), nuevo];
    setReservas((prev) =>
      prev.map((r) => (r.id === resActivaModal.id ? { ...r, acompanantes: lista } : r))
    );
    setAcompNombre('');
    setAcompDoc('');
    showToast('Acompañante agregado', 'info');
  };

  // --- ACCIÓN 3: LIQUIDAR Y DAR SALIDA (CHECK-OUT) ---
  const resOut = checkOutHab
    ? reservas.find((r) => r.habitacionNumero === checkOutHab && r.estado === 'En Curso')
    : null;
  const cuentaOut = resOut ? calcularCuentaHabitacion(resOut.id) : null;
  const cliOut = resOut ? clientes.find((c) => c.id === resOut.clienteId) : null;

  const confirmarCheckOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkOutHab || !resOut || !cuentaOut) return;

    const monto = cuentaOut.saldoPendiente;
    const cli = cliOut || {
      id: 0,
      nombre: 'Cliente General',
      tipoDoc: 'DNI',
      documento: '00000000',
    };

    if (monto > 0) {
      const esRuc = cli.tipoDoc === 'RUC';
      const serie = esRuc ? 'F001' : 'B001';
      const numComp = `${serie}-${String(comprobantes.length + 1).padStart(6, '0')}`;
      const subtotal = Number((monto / 1.18).toFixed(2));
      const igv = Number((monto - subtotal).toFixed(2));

      setPagos((prev) => [
        ...prev,
        {
          id: Date.now(),
          reservaId: resOut.id,
          monto,
          medio: metodoCobroOut,
          operacion: metodoCobroOut === 'Efectivo' ? '-' : 'OP-OUT',
          tipo: 'Liquidación Check-Out',
          fecha: `${todayYMD} ${formatTimeNow()}`,
          cajaId: cajaActual?.id || 1,
          usuario: currentUser.usuario,
        },
      ]);

      setComprobantes((prev) => [
        {
          id: Date.now(),
          numero: numComp,
          tipo: esRuc ? 'Factura' : 'Boleta',
          clienteId: cli.id,
          clienteNombre: cli.nombre,
          clienteDoc: cli.documento,
          concepto: `Liquidación de Estadía Hab. #${checkOutHab} (${resOut.codigo})`,
          subtotal,
          igv,
          total: monto,
          estado: 'Emitido',
          fecha: `${todayYMD} ${formatTimeNow()}`,
          notaCreditoId: null,
        },
        ...prev,
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
                    concepto: `Check-Out Hab. #${checkOutHab} (${numComp})`,
                    medio: metodoCobroOut,
                    tipo: 'Ingreso',
                    monto,
                    usuario: currentUser.usuario,
                  },
                ],
              }
            : null
        );
      }
    }

    setReservas((prev) => prev.map((r) => (r.id === resOut.id ? { ...r, estado: 'Finalizada' } : r)));
    setHabitaciones((prev) =>
      prev.map((h) => (h.numero === checkOutHab ? { ...h, estado: 'En Limpieza' } : h))
    );

    logAuditoria(
      'Estadía',
      'Check-Out Realizado',
      `Salida registrada en Hab. #${checkOutHab} (${resOut.codigo}). Habitación pasa a En Limpieza.`
    );
    showToast(`Check-Out completado. Habitación #${checkOutHab} enviada a Limpieza.`, 'success');
    setCheckOutHab(null);
  };

  return (
    <div>
      {/* CABECERA SIMPLE Y CLARA */}
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
          <h1 className="view-title">Recepción: Check-In y Check-Out</h1>
          <p className="view-subtitle">
            Seleccione una pestaña para dar ingreso a reservas confirmadas o administrar habitaciones ocupadas
          </p>
        </div>
        <button className="btn btn-gold" onClick={() => navigate('/reservas')}>
          + Nueva Reserva / Walk-In
        </button>
      </div>

      {/* BARRA DE 2 PESTAÑAS GRANDES Y CLARAS + BUSCADOR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
          marginBottom: 20,
          background: '#ffffff',
          padding: '12px 16px',
          borderRadius: 12,
          border: '1px solid var(--line)',
        }}
      >
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setTabActiva('checkin')}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: tabActiva === 'checkin' ? '2px solid var(--wine-700)' : '1px solid var(--line)',
              background: tabActiva === 'checkin' ? '#f0fdf4' : '#f8fafc',
              color: tabActiva === 'checkin' ? '#14532d' : 'var(--ink)',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>1. Llegadas para Check-In ({porLlegarAll.length})</span>
            {llegadasHoyCount > 0 && (
              <span
                style={{
                  background: '#16a34a',
                  color: '#fff',
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 999,
                }}
              >
                {llegadasHoyCount} hoy
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('encasa')}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: tabActiva === 'encasa' ? '2px solid var(--wine-700)' : '1px solid var(--line)',
              background: tabActiva === 'encasa' ? '#f0fdf4' : '#f8fafc',
              color: tabActiva === 'encasa' ? '#14532d' : 'var(--ink)',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>2. Huéspedes en Casa / Check-Out ({enCursoAll.length})</span>
            {salidasHoyCount > 0 && (
              <span
                style={{
                  background: '#d97706',
                  color: '#fff',
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 999,
                }}
              >
                {salidasHoyCount} sale(n) hoy
              </span>
            )}
          </button>
        </div>

        <input
          type="text"
          className="form-input"
          placeholder="Buscar por habitación (#101), nombre o DNI..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>

      {/* =====================================================================
          PESTAÑA 1: LLEGADAS PENDIENTES DE CHECK-IN
         ===================================================================== */}
      {tabActiva === 'checkin' && (
        <div className="table-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
            <strong style={{ fontSize: 15, color: 'var(--wine-900)' }}>
              Reservas Confirmadas Listas para Ingresar ({porLlegar.length})
            </strong>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 0' }}>
              Haga clic en <strong>Realizar Check-In</strong> cuando el huésped llegue a recepción para entregarle su habitación.
            </p>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Habitación</th>
                  <th>Huésped / Empresa Titular</th>
                  <th>Fechas de Estadía</th>
                  <th>Estado de Pago</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {porLlegar.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      No hay reservas pendientes de Check-In en este momento.
                    </td>
                  </tr>
                ) : (
                  porLlegar.map((r) => {
                    const cli = clientes.find((c) => c.id === r.clienteId);
                    const hab = habitaciones.find((h) => h.numero === r.habitacionNumero);
                    const cat = categorias.find((c) => c.id === hab?.categoriaId);
                    const esHoy = r.entrada === todayYMD;
                    const saldo = Math.max(0, r.totalFijo - r.adelanto);

                    return (
                      <tr key={r.id} style={{ background: esHoy ? '#f0fdf4' : undefined }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                fontSize: 15,
                                fontWeight: 800,
                                padding: '5px 10px',
                                borderRadius: 8,
                                background: '#0f172a',
                                color: '#fff',
                              }}
                            >
                              #{r.habitacionNumero}
                            </span>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{cat?.nombre || 'Habitación'}</div>
                              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                                Piso {hab?.piso || 1} · {r.codigo}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong style={{ fontSize: 13.5 }}>{cli?.nombre || 'Huésped'}</strong>
                          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                            {cli?.tipoDoc}: {cli?.documento} · Tel: {cli?.telefono || '-'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>
                            {formatDateDMY(r.entrada)} al {formatDateDMY(r.salida)}
                          </div>
                          {esHoy ? (
                            <span
                              style={{
                                display: 'inline-block',
                                marginTop: 3,
                                padding: '2px 8px',
                                borderRadius: 4,
                                background: '#16a34a',
                                color: '#fff',
                                fontSize: 10.5,
                                fontWeight: 700,
                              }}
                            >
                              Llega Hoy
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Reserva próxima</span>
                          )}
                        </td>
                        <td>
                          <div>
                            Total: <strong>{formatMoney(r.totalFijo)}</strong>
                          </div>
                          <div style={{ fontSize: 11.5, color: saldo > 0 ? '#d97706' : '#16a34a', fontWeight: 600 }}>
                            {r.adelanto > 0 ? `Adelanto: ${formatMoney(r.adelanto)} · ` : ''}
                            {saldo > 0 ? `Resta: ${formatMoney(saldo)}` : 'Pagado'}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-gold"
                            onClick={() => abrirModalCheckIn(r)}
                            style={{ padding: '8px 16px', fontSize: 12.5 }}
                          >
                            Realizar Check-In →
                          </button>
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
          PESTAÑA 2: HUÉSPEDES EN CASA (HABITACIONES OCUPADAS Y CHECK-OUT)
         ===================================================================== */}
      {tabActiva === 'encasa' && (
        <div className="rooms-grid">
          {enCurso.length === 0 ? (
            <div className="table-card" style={{ padding: 36, gridColumn: '1/-1', textAlign: 'center', color: 'var(--muted)' }}>
              No hay habitaciones ocupadas en este momento.
            </div>
          ) : (
            enCurso.map((r) => {
              const cli = clientes.find((c) => c.id === r.clienteId);
              const cuenta = calcularCuentaHabitacion(r.id);
              const saldo = cuenta ? cuenta.saldoPendiente : 0;
              const totalConsumos = cuenta ? cuenta.totalConsumos : 0;
              const totalCuenta = cuenta ? cuenta.totalCuenta : r.totalFijo;
              const hab = habitaciones.find((h) => h.numero === r.habitacionNumero);
              const cat = categorias.find((c) => c.id === hab?.categoriaId);
              const saleHoy = r.salida === todayYMD;

              return (
                <div
                  className="room-card"
                  key={r.id}
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div className={`room-card-colorbar ${saleHoy ? 'reservada' : 'ocupada'}`}></div>
                    <div className="room-card-body">
                      <div className="room-card-header" style={{ marginBottom: 10 }}>
                        <div>
                          <span className="room-number">#{r.habitacionNumero}</span>
                          <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>
                            {cat?.nombre || 'Estándar'}
                          </span>
                        </div>
                        <span className={`badge-status ${saleHoy ? 'reservada' : 'ocupada'}`}>
                          {saleHoy ? 'Sale Hoy' : 'Hospedado'}
                        </span>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
                          {cli?.nombre || 'Huésped'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                          {cli?.tipoDoc}: {cli?.documento} · Salida: <strong>{formatDateDMY(r.salida)}</strong>
                        </div>
                      </div>

                      {/* Resumen claro de 2 líneas */}
                      <div
                        style={{
                          padding: '10px 12px',
                          background: '#f8fafc',
                          borderRadius: 8,
                          border: '1px solid var(--line)',
                          fontSize: 12.5,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                          <span>Total Estadía + Consumos ({formatMoney(totalConsumos)}):</span>
                          <strong style={{ color: 'var(--ink)' }}>{formatMoney(totalCuenta)}</strong>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingTop: 6,
                            borderTop: '1px solid var(--line)',
                            fontSize: 13.5,
                          }}
                        >
                          <span>Saldo por Pagar:</span>
                          <strong style={{ color: saldo > 0 ? '#dc2626' : '#16a34a' }}>
                            {saldo > 0 ? formatMoney(saldo) : 'Pagado (S/ 0.00)'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SOLO 2 BOTONES CLAROS POR TARJETA */}
                  <div className="room-card-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => abrirGestionHabitacion(r.habitacionNumero, 'consumos')}
                      style={{ justifyContent: 'center' }}
                    >
                      Consumos / Cuenta
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-gold"
                      onClick={() => setCheckOutHab(r.habitacionNumero)}
                      style={{ justifyContent: 'center' }}
                    >
                      Dar Salida (Check-Out)
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =====================================================================
          MODAL 1: CONFIRMAR CHECK-IN (SIMPLE Y DIRECTO)
         ===================================================================== */}
      {checkInRes && (
        <div className="modal-backdrop" onClick={() => setCheckInRes(null)}>
          <div className="modal-dialog" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Check-In — {checkInRes.codigo}</h3>
              <button className="btn-close-modal" onClick={() => setCheckInRes(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={confirmarCheckIn}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 13 }}>
                  <div>
                    <strong>Huésped:</strong>{' '}
                    {clientes.find((c) => c.id === checkInRes.clienteId)?.nombre || 'Titular'}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <strong>Estadía:</strong> {formatDateDMY(checkInRes.entrada)} al{' '}
                    {formatDateDMY(checkInRes.salida)} · Total: <strong>{formatMoney(checkInRes.totalFijo)}</strong>
                  </div>
                </div>

                <div>
                  <label className="field-label">Habitación a Entregar</label>
                  <select
                    className="form-select"
                    value={ciHabitacion}
                    onChange={(e) => setCiHabitacion(e.target.value)}
                  >
                    {habitaciones
                      .filter((h) => h.numero === checkInRes.habitacionNumero || h.estado === 'Disponible')
                      .map((h) => {
                        const cat = categorias.find((c) => c.id === h.categoriaId);
                        return (
                          <option key={h.numero} value={h.numero}>
                            Habitación #{h.numero} — {cat?.nombre || 'Estándar'} (Piso {h.piso})
                          </option>
                        );
                      })}
                  </select>
                </div>

                <div className="form-grid">
                  <div>
                    <label className="field-label">¿Deja algún abono ahora? (S/)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      value={ciAdelantoExtra}
                      onChange={(e) => setCiAdelantoExtra(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">Medio de Pago</label>
                    <select
                      className="form-select"
                      value={ciMetodoPago}
                      onChange={(e) =>
                        setCiMetodoPago(e.target.value as 'Efectivo' | 'Tarjeta' | 'Yape/Plin')
                      }
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Yape/Plin">Yape / Plin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="field-label">Notas de Recepción (Opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={ciObservaciones}
                    onChange={(e) => setCiObservaciones(e.target.value)}
                    placeholder="Ej. Entregó llave magnética #1, solicita despertador..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setCheckInRes(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-gold">
                  Confirmar Check-In y Ocupar Hab. #{ciHabitacion}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: PANEL UNIFICADO DE LA HABITACIÓN OCUPADA (CONSUMOS / ABONOS / ESTADÍA)
         ===================================================================== */}
      {habActivaModal && resActivaModal && cuentaActivaModal && (
        <div className="modal-backdrop" onClick={() => setHabActivaModal(null)}>
          <div className="modal-dialog" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                Habitación #{habActivaModal} — {cliActivoModal?.nombre || 'Huésped'}
              </h3>
              <button className="btn-close-modal" onClick={() => setHabActivaModal(null)}>
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Resumen superior fijo */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                  padding: 12,
                  background: '#f8fafc',
                  borderRadius: 10,
                  border: '1px solid var(--line)',
                  textAlign: 'center',
                  fontSize: 12.5,
                }}
              >
                <div>
                  <span style={{ color: 'var(--muted)', display: 'block' }}>Total Cuenta</span>
                  <strong style={{ fontSize: 15 }}>{formatMoney(cuentaActivaModal.totalCuenta)}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', display: 'block' }}>Pagado</span>
                  <strong style={{ fontSize: 15, color: '#16a34a' }}>
                    {formatMoney(cuentaActivaModal.totalPagado)}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', display: 'block' }}>Saldo Pendiente</span>
                  <strong
                    style={{
                      fontSize: 15,
                      color: cuentaActivaModal.saldoPendiente > 0 ? '#dc2626' : '#16a34a',
                    }}
                  >
                    {formatMoney(cuentaActivaModal.saldoPendiente)}
                  </strong>
                </div>
              </div>

              {/* 3 Sub-pestañas simples dentro del modal */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${subModalTab === 'consumos' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSubModalTab('consumos')}
                  style={{ justifyContent: 'center' }}
                >
                  1. Consumos ({cuentaActivaModal.consumos.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${subModalTab === 'abonos' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSubModalTab('abonos')}
                  style={{ justifyContent: 'center' }}
                >
                  2. Registrar Pago
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${subModalTab === 'estadia' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSubModalTab('estadia')}
                  style={{ justifyContent: 'center' }}
                >
                  3. Alargar Estadía
                </button>
              </div>

              {/* CONTENIDO SUB-TAB 1: CONSUMOS */}
              {subModalTab === 'consumos' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <form
                    onSubmit={guardarConsumoHabitacion}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 80px auto',
                      gap: 8,
                      alignItems: 'end',
                      padding: 12,
                      background: '#f0fdf4',
                      borderRadius: 8,
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    <div>
                      <label className="field-label">Agregar Producto o Servicio</label>
                      <select
                        className="form-select"
                        value={consServId}
                        onChange={(e) => setConsServId(Number(e.target.value))}
                      >
                        {servicios
                          .filter((s) => s.estado === 'Activo')
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nombre} — {formatMoney(s.precio)}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="field-label">Cant.</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        className="form-input"
                        value={consCantidad}
                        onChange={(e) => setConsCantidad(Math.max(1, Number(e.target.value) || 1))}
                      />
                    </div>
                    <button type="submit" className="btn btn-gold" style={{ height: 38 }}>
                      + Cargar
                    </button>
                  </form>
                  {consError && <div style={{ color: '#dc2626', fontSize: 12 }}>{consError}</div>}

                  <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 8 }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Concepto</th>
                          <th>Cant.</th>
                          <th style={{ textAlign: 'right' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cuentaActivaModal.consumos.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="empty-state" style={{ padding: 14 }}>
                              Sin consumos adicionales registrados.
                            </td>
                          </tr>
                        ) : (
                          cuentaActivaModal.consumos.map((c) => (
                            <tr key={c.id}>
                              <td>{c.descripcion}</td>
                              <td>x{c.cantidad}</td>
                              <td style={{ textAlign: 'right' }}>
                                <strong>{formatMoney(c.subtotal)}</strong>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CONTENIDO SUB-TAB 2: REGISTRAR PAGO / ABONO */}
              {subModalTab === 'abonos' && (
                <form onSubmit={guardarAbonoHabitacion} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="form-grid">
                    <div>
                      <label className="field-label">Monto a Pagar (S/)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        value={abonoMonto}
                        onChange={(e) => setAbonoMonto(e.target.value)}
                        placeholder={String(cuentaActivaModal.saldoPendiente)}
                      />
                    </div>
                    <div>
                      <label className="field-label">Medio de Pago</label>
                      <select
                        className="form-select"
                        value={abonoMetodo}
                        onChange={(e) =>
                          setAbonoMetodo(e.target.value as 'Efectivo' | 'Tarjeta' | 'Yape/Plin')
                        }
                      >
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta">Tarjeta Visa / Mastercard</option>
                        <option value="Yape/Plin">Yape / Plin</option>
                      </select>
                    </div>
                  </div>
                  {abonoMetodo !== 'Efectivo' && (
                    <div>
                      <label className="field-label">N° de Operación</label>
                      <input
                        type="text"
                        className="form-input"
                        value={abonoOperacion}
                        onChange={(e) => setAbonoOperacion(e.target.value)}
                        placeholder="Ej. OP-458912"
                      />
                    </div>
                  )}
                  {abonoError && <div style={{ color: '#dc2626', fontSize: 12 }}>{abonoError}</div>}
                  <button
                    type="submit"
                    className="btn btn-gold"
                    disabled={cuentaActivaModal.saldoPendiente <= 0}
                    style={{ justifyContent: 'center' }}
                  >
                    Registrar Pago y Emitir Comprobante
                  </button>
                </form>
              )}

              {/* CONTENIDO SUB-TAB 3: ALARGAR ESTADÍA Y ACOMPAÑANTES */}
              {subModalTab === 'estadia' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <form onSubmit={guardarCambioEstadia} style={{ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <label className="field-label">Fecha de Salida</label>
                      <input
                        type="date"
                        className="form-input"
                        min={addDaysYMD(resActivaModal.entrada, 1)}
                        value={nuevaSalida}
                        onChange={(e) => setNuevaSalida(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setNuevaSalida(addDaysYMD(nuevaSalida, 1))}
                    >
                      +1 Noche
                    </button>
                    <button type="submit" className="btn btn-gold">
                      Guardar Fecha
                    </button>
                  </form>

                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                    <label className="field-label">Acompañantes en la Habitación</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: 8, marginTop: 6 }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Nombre completo"
                        value={acompNombre}
                        onChange={(e) => setAcompNombre(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="DNI / Pasaporte"
                        value={acompDoc}
                        onChange={(e) => setAcompDoc(e.target.value)}
                      />
                      <button type="button" className="btn btn-secondary" onClick={agregarAcompananteModal}>
                        + Añadir
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setHabActivaModal(null)}>
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-gold"
                onClick={() => {
                  const h = habActivaModal;
                  setHabActivaModal(null);
                  setCheckOutHab(h);
                }}
              >
                Ir a Dar Salida (Check-Out) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: DAR SALIDA / CHECK-OUT EN 1 SOLO PASO
         ===================================================================== */}
      {checkOutHab && cuentaOut && (
        <div className="modal-backdrop" onClick={() => setCheckOutHab(null)}>
          <div className="modal-dialog" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Dar Salida (Check-Out) — Habitación #{checkOutHab}</h3>
              <button className="btn-close-modal" onClick={() => setCheckOutHab(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={confirmarCheckOut}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid var(--line)', fontSize: 13 }}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Huésped:</strong> {cliOut?.nombre} ({cliOut?.tipoDoc}: {cliOut?.documento})
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Hospedaje ({cuentaOut.reserva.codigo}):</span>
                    <strong>{formatMoney(cuentaOut.totalHospedaje)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Consumos Extra ({cuentaOut.consumos.length}):</span>
                    <strong>{formatMoney(cuentaOut.totalConsumos)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', marginBottom: 8 }}>
                    <span>Pagos / Adelantos Previos:</span>
                    <strong>- {formatMoney(cuentaOut.totalPagado)}</strong>
                  </div>
                  <div
                    style={{
                      paddingTop: 8,
                      borderTop: '1px solid var(--line)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 15.5,
                    }}
                  >
                    <strong>Saldo a Cobrar Ahora:</strong>
                    <strong style={{ color: cuentaOut.saldoPendiente > 0 ? '#dc2626' : '#16a34a' }}>
                      {formatMoney(cuentaOut.saldoPendiente)}
                    </strong>
                  </div>
                </div>

                {cuentaOut.saldoPendiente > 0 && (
                  <div>
                    <label className="field-label">Medio de Pago para Liquidar Saldo</label>
                    <select
                      className="form-select"
                      value={metodoCobroOut}
                      onChange={(e) =>
                        setMetodoCobroOut(e.target.value as 'Efectivo' | 'Tarjeta' | 'Yape/Plin')
                      }
                    >
                      <option value="Efectivo">Efectivo (Caja Chica)</option>
                      <option value="Tarjeta">Tarjeta Visa / Mastercard</option>
                      <option value="Yape/Plin">Yape / Plin</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setCheckOutHab(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-gold">
                  {cuentaOut.saldoPendiente > 0
                    ? `Cobrar ${formatMoney(cuentaOut.saldoPendiente)} y Finalizar Check-Out`
                    : 'Confirmar Check-Out y Liberar Cuarto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
