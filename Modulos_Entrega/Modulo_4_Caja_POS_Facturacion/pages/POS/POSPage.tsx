/**
 * MÓDULO 5: Ventas, Caja Chica, Cuentas de Habitación y Facturación Electrónica (Boletas / Facturas / NC)
 * Responsable: Eliseo Mariño (Rama: Eliseo)
 */
import React, { useState } from 'react';
import {
  useHotel,
  formatMoney,
  formatDateDMY,
  formatTimeNow,
  type ComprobanteHotel,
  type ClienteHotel,
} from '../../context/HotelContext';

export const POSPage: React.FC = () => {
  const {
    todayYMD,
    currentUser,
    habitaciones,
    setHabitaciones,
    reservas,
    setReservas,
    clientes,
    setClientes,
    servicios,
    productos,
    setProductos,
    setConsumos,
    setPagos,
    cajaActual,
    setCajaActual,
    historialCajas,
    setHistorialCajas,
    comprobantes,
    setComprobantes,
    notasCredito,
    setNotasCredito,
    calcularCuentaHabitacion,
    logAuditoria,
    showToast,
  } = useHotel();

  const [subtab, setSubtab] = useState<'caja' | 'cuentas' | 'comprobantes'>('cuentas');

  // Modales Caja
  const [showAbrirCaja, setShowAbrirCaja] = useState(false);
  const [turnoCaja, setTurnoCaja] = useState('Mañana');
  const [montoInicialCaja, setMontoInicialCaja] = useState('300.00');
  const [showCerrarCaja, setShowCerrarCaja] = useState(false);
  const [efectivoDeclarado, setEfectivoDeclarado] = useState('');

  // Modal Cargar Consumo
  const [showConsumoModal, setShowConsumoModal] = useState(false);
  const [consHab, setConsHab] = useState('');
  const [consServId, setConsServId] = useState<number>(servicios[0]?.id || 1);
  const [consCant, setConsCant] = useState(1);
  const [consErr, setConsErr] = useState('');

  // Modal Registrar Pago a Cuenta
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [pagoHab, setPagoHab] = useState('');
  const [pagoMonto, setPagoMonto] = useState('');
  const [pagoMetodo, setPagoMetodo] = useState<'Efectivo' | 'Tarjeta' | 'Yape/Plin'>('Efectivo');
  const [pagoRecibido, setPagoRecibido] = useState('');
  const [pagoOperacion, setPagoOperacion] = useState('');
  const [pagoErr, setPagoErr] = useState('');

  // Modal Detalle de Cuenta
  const [detalleHab, setDetalleHab] = useState<string | null>(null);

  // Modal Cobro Directo de Servicio + Registro Rápido de Cliente (Quick Registration)
  const [showDirectoModal, setShowDirectoModal] = useState(false);
  const [dirClienteId, setDirClienteId] = useState<number>(clientes[0]?.id || 1);
  const [dirServId, setDirServId] = useState<number>(servicios[0]?.id || 1);
  const [dirCant, setDirCant] = useState(1);
  const [dirMetodo, setDirMetodo] = useState<'Efectivo' | 'Tarjeta' | 'Yape/Plin'>('Efectivo');

  const [showQuickClientModal, setShowQuickClientModal] = useState(false);
  const [qTipo, setQTipo] = useState<'DNI' | 'RUC'>('DNI');
  const [qDoc, setQDoc] = useState('');
  const [qNombre, setQNombre] = useState('');
  const [qTel, setQTel] = useState('');
  const [qErr, setQErr] = useState('');

  // Modal Ver / Imprimir Comprobante & Anular con Nota de Crédito
  const [previewComp, setPreviewComp] = useState<ComprobanteHotel | null>(null);
  const [anularComp, setAnularComp] = useState<ComprobanteHotel | null>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [anulErr, setAnulErr] = useState('');

  const cajaAbierta = cajaActual && cajaActual.estado === 'Abierta';
  const cuartosOcupados = habitaciones.filter((h) => h.estado === 'Ocupada');

  const movimientos = cajaActual?.movimientos || [];
  const ingresosEfectivo = movimientos
    .filter((m) => m.medio === 'Efectivo' && m.tipo === 'Ingreso')
    .reduce((sum, m) => sum + m.monto, 0);
  const egresosEfectivo = movimientos
    .filter((m) => m.medio === 'Efectivo' && m.tipo === 'Egreso')
    .reduce((sum, m) => sum + m.monto, 0);
  const efectivoEsperado = (cajaActual?.montoInicial || 0) + ingresosEfectivo - egresosEfectivo;

  const handleAbrirCaja = (e: React.FormEvent) => {
    e.preventDefault();
    const monto = Number(montoInicialCaja) || 0;
    setCajaActual({
      id: Date.now(),
      turno: turnoCaja,
      responsable: currentUser.usuario,
      montoInicial: monto,
      aperturaFecha: `${todayYMD} ${formatTimeNow()}`,
      estado: 'Abierta',
      movimientos: [
        {
          id: 1,
          fecha: `${todayYMD} ${formatTimeNow()}`,
          concepto: 'Apertura de Caja (Fondo Fijo)',
          medio: 'Efectivo',
          tipo: 'Ingreso',
          monto,
          usuario: currentUser.usuario,
        },
      ],
    });
    logAuditoria('Caja', 'Apertura de Turno', `Caja abierta en turno ${turnoCaja} con fondo inicial de ${formatMoney(monto)}.`);
    showToast(`Turno de caja (${turnoCaja}) abierto correctamente`, 'success');
    setShowAbrirCaja(false);
  };

  const handleCerrarCaja = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cajaActual) return;
    const decl = Number(efectivoDeclarado) || 0;
    const dif = Number((decl - efectivoEsperado).toFixed(2));
    setHistorialCajas((prev) => [
      {
        id: cajaActual.id,
        turno: cajaActual.turno,
        fecha: todayYMD,
        montoInicial: cajaActual.montoInicial,
        ingresosEfectivo,
        efectivoDeclarado: decl,
        diferencia: dif,
        estado: dif === 0 ? 'Cerrada sin diferencias' : `Diferencia: ${formatMoney(dif)}`,
      },
      ...prev,
    ]);
    setCajaActual(null);
    logAuditoria('Caja', 'Cierre y Arqueo de Caja', `Turno cerrado. Efectivo declarado: ${formatMoney(decl)}.`);
    showToast('Turno de caja cerrado y arqueo registrado', 'info');
    setShowCerrarCaja(false);
  };

  const handleCargarConsumo = (e: React.FormEvent) => {
    e.preventDefault();
    setConsErr('');
    if (!consHab) {
      setConsErr('Seleccione una habitación ocupada');
      return;
    }
    const res = reservas.find((r) => r.habitacionNumero === consHab && r.estado === 'En Curso');
    if (!res) {
      setConsErr('Solo se pueden cargar consumos a habitaciones con estadía en curso');
      return;
    }
    const serv = servicios.find((s) => s.id === Number(consServId));
    if (!serv) return;

    if (serv.productoId) {
      const prod = productos.find((p) => p.id === serv.productoId);
      if (prod) {
        if (prod.stock < consCant) {
          setConsErr(`Stock insuficiente en almacén. Disponible: ${prod.stock} u.`);
          return;
        }
        setProductos((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, stock: p.stock - consCant } : p))
        );
      }
    }

    const subtotal = Number((serv.precio * consCant).toFixed(2));
    setConsumos((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        reservaId: res.id,
        habitacionNumero: consHab,
        servicioId: serv.id,
        descripcion: serv.nombre,
        cantidad: consCant,
        precioUnitario: serv.precio,
        subtotal,
        fecha: `${todayYMD} ${formatTimeNow()}`,
        usuario: currentUser.usuario,
      },
    ]);
    logAuditoria(
      'Cuentas',
      'Carga de Consumo',
      `Cargado ${serv.nombre} (x${consCant}) por ${formatMoney(subtotal)} a Hab. #${consHab}.`
    );
    showToast(`Consumo de ${formatMoney(subtotal)} cargado a la Hab. #${consHab}`, 'success');
    setShowConsumoModal(false);
  };

  const handleRegistrarPago = (e: React.FormEvent) => {
    e.preventDefault();
    setPagoErr('');
    if (!cajaAbierta || !cajaActual) {
      setPagoErr('Debe abrir un turno de caja primero');
      return;
    }
    if (!pagoHab) {
      setPagoErr('Seleccione una habitación ocupada');
      return;
    }
    const res = reservas.find((r) => r.habitacionNumero === pagoHab && r.estado === 'En Curso');
    if (!res) return;
    const cuenta = calcularCuentaHabitacion(res.id);
    if (!cuenta) return;

    const monto = Number(pagoMonto);
    if (monto <= 0 || monto > cuenta.saldoPendiente) {
      setPagoErr(`Ingrese un monto válido hasta ${formatMoney(cuenta.saldoPendiente)}`);
      return;
    }
    if (pagoMetodo === 'Efectivo' && Number(pagoRecibido) < monto) {
      setPagoErr('El efectivo recibido no puede ser menor al monto a pagar');
      return;
    }
    if (pagoMetodo !== 'Efectivo' && pagoOperacion.trim().length < 4) {
      setPagoErr('Ingrese el N° de operación (mínimo 4 caracteres)');
      return;
    }

    setPagos((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        reservaId: res.id,
        monto,
        medio: pagoMetodo,
        operacion: pagoMetodo === 'Efectivo' ? '-' : pagoOperacion.trim(),
        tipo: 'Abono',
        fecha: `${todayYMD} ${formatTimeNow()}`,
        cajaId: cajaActual.id,
        usuario: currentUser.usuario,
      },
    ]);

    setCajaActual((prev) =>
      prev
        ? {
            ...prev,
            movimientos: [
              ...prev.movimientos,
              {
                id: prev.movimientos.length + 1,
                fecha: `${todayYMD} ${formatTimeNow()}`,
                concepto: `Abono a Cuenta Hab. #${pagoHab}`,
                medio: pagoMetodo,
                tipo: 'Ingreso',
                monto,
                usuario: currentUser.usuario,
              },
            ],
          }
        : null
    );

    // Emitir comprobante electrónico automático si liquida
    const cliente = clientes.find((c) => c.id === res.clienteId);
    if (cliente) {
      const esFactura = cliente.tipo === 'Empresa';
      const tipoComp = esFactura ? 'Factura' : 'Boleta';
      const serie = esFactura ? 'F001' : 'B001';
      const correlativo = String(comprobantes.length + 1).padStart(6, '0');
      const subtotal = Number((monto / 1.18).toFixed(2));
      const igv = Number((monto - subtotal).toFixed(2));

      setComprobantes((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          numero: `${serie}-${correlativo}`,
          tipo: tipoComp,
          clienteId: cliente.id,
          clienteNombre: cliente.nombre,
          clienteDoc: cliente.documento,
          concepto: `Pago de estadía ${res.codigo} (Hab. #${pagoHab})`,
          subtotal,
          igv,
          total: monto,
          estado: 'Emitido',
          fecha: `${todayYMD} ${formatTimeNow()}`,
          notaCreditoId: null,
        },
      ]);
    }

    logAuditoria('Caja', 'Cobro de Pago a Cuenta', `Registrado pago de ${formatMoney(monto)} (${pagoMetodo}) para Hab. #${pagoHab}.`);
    showToast('Pago y comprobante registrados correctamente', 'success');
    setShowPagoModal(false);
  };

  const handleCheckOutDirecto = (habNumero: string) => {
    const res = reservas.find((r) => r.habitacionNumero === habNumero && r.estado === 'En Curso');
    if (!res) return;
    const cuenta = calcularCuentaHabitacion(res.id);
    if (!cuenta) return;

    if (cuenta.saldoPendiente > 0) {
      setPagoHab(habNumero);
      setPagoMonto(String(cuenta.saldoPendiente));
      setPagoRecibido(String(cuenta.saldoPendiente));
      setPagoErr('');
      setShowPagoModal(true);
      showToast(
        `Saldo pendiente de ${formatMoney(cuenta.saldoPendiente)} pre-cargado para liquidar la Hab. #${habNumero}`,
        'info'
      );
      return;
    }

    setReservas((prev) => prev.map((r) => (r.id === res.id ? { ...r, estado: 'Finalizada' } : r)));
    setHabitaciones((prev) =>
      prev.map((h) => (h.numero === habNumero ? { ...h, estado: 'En Limpieza' } : h))
    );
    logAuditoria('Estadía', 'Check-Out Realizado', `Check-Out completado para ${res.codigo} Hab. #${habNumero}. Pasa a En Limpieza.`);
    showToast('Check-Out procesado con éxito. Cuarto pasa a En Limpieza.', 'success');
  };

  const handleQuickClientSave = (e: React.FormEvent) => {
    e.preventDefault();
    setQErr('');
    if (qTipo === 'DNI' && !/^\d{8}$/.test(qDoc)) {
      setQErr('El DNI debe tener exactamente 8 dígitos numéricos');
      return;
    }
    if (qTipo === 'RUC' && !/^(10|20)\d{9}$/.test(qDoc)) {
      setQErr('El RUC debe tener 11 dígitos numéricos y empezar con 10 o 20');
      return;
    }
    if (!qNombre.trim()) {
      setQErr('El nombre o razón social es obligatorio');
      return;
    }

    const nuevo: ClienteHotel = {
      id: clientes.length + 1,
      tipo: qTipo === 'RUC' ? 'Empresa' : 'Persona Natural',
      tipoDoc: qTipo,
      documento: qDoc,
      nombre: qNombre.trim(),
      telefono: qTel || '999888777',
      estado: 'Activo',
    };
    setClientes((prev) => [...prev, nuevo]);
    setDirClienteId(nuevo.id);
    logAuditoria('Clientes', 'Registro Rápido en POS', `Cliente ${nuevo.nombre} (${nuevo.documento}) creado y auto-seleccionado.`);
    showToast(`Cliente ${nuevo.nombre} registrado y seleccionado automáticamente`, 'success');
    setShowQuickClientModal(false);
    setQDoc('');
    setQNombre('');
    setQTel('');
  };

  const handleCobroDirecto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cajaAbierta || !cajaActual) {
      showToast('Abra un turno de caja para registrar cobros directos', 'danger');
      return;
    }
    const serv = servicios.find((s) => s.id === Number(dirServId));
    const cli = clientes.find((c) => c.id === Number(dirClienteId));
    if (!serv || !cli) return;

    const total = Number((serv.precio * dirCant).toFixed(2));
    const subtotal = Number((total / 1.18).toFixed(2));
    const igv = Number((total - subtotal).toFixed(2));
    const esFactura = cli.tipo === 'Empresa';
    const serie = esFactura ? 'F001' : 'B001';
    const numComp = `${serie}-${String(comprobantes.length + 1).padStart(6, '0')}`;

    setComprobantes((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        numero: numComp,
        tipo: esFactura ? 'Factura' : 'Boleta',
        clienteId: cli.id,
        clienteNombre: cli.nombre,
        clienteDoc: cli.documento,
        concepto: `Venta directa: ${serv.nombre} (x${dirCant})`,
        subtotal,
        igv,
        total,
        estado: 'Emitido',
        fecha: `${todayYMD} ${formatTimeNow()}`,
        notaCreditoId: null,
      },
    ]);

    setCajaActual((prev) =>
      prev
        ? {
            ...prev,
            movimientos: [
              ...prev.movimientos,
              {
                id: prev.movimientos.length + 1,
                fecha: `${todayYMD} ${formatTimeNow()}`,
                concepto: `Venta Directa ${numComp} - ${serv.nombre}`,
                medio: dirMetodo,
                tipo: 'Ingreso',
                monto: total,
                usuario: currentUser.usuario,
              },
            ],
          }
        : null
    );

    logAuditoria('Facturación', 'Cobro Directo de Servicio', `Emitido ${numComp} por ${formatMoney(total)} a ${cli.nombre}.`);
    showToast(`Comprobante ${numComp} emitido por ${formatMoney(total)}`, 'success');
    setShowDirectoModal(false);
  };

  const handleAnularConNC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anularComp) return;
    if (motivoAnulacion.trim().length < 10) {
      setAnulErr('El motivo de anulación debe tener al menos 10 caracteres');
      return;
    }

    const ncNum = `NC01-${String(notasCredito.length + 1).padStart(6, '0')}`;
    const nuevaNC = {
      id: notasCredito.length + 1,
      numero: ncNum,
      comprobanteNumero: anularComp.numero,
      motivo: motivoAnulacion.trim(),
      fecha: `${todayYMD} ${formatTimeNow()}`,
      total: anularComp.total,
      usuario: currentUser.usuario,
    };

    setNotasCredito((prev) => [...prev, nuevaNC]);
    setComprobantes((prev) =>
      prev.map((c) =>
        c.id === anularComp.id ? { ...c, estado: 'Anulado', notaCreditoId: nuevaNC.id } : c
      )
    );
    logAuditoria('Facturación', 'Anulación con Nota de Crédito', `Comprobante ${anularComp.numero} anulado mediante ${ncNum}.`);
    showToast(`Comprobante anulado con Nota de Crédito ${ncNum}`, 'success');
    setAnularComp(null);
    setMotivoAnulacion('');
    setAnulErr('');
  };

  const resDetalle = detalleHab
    ? reservas.find((r) => r.habitacionNumero === detalleHab && r.estado === 'En Curso')
    : null;
  const cuentaDetalle = resDetalle ? calcularCuentaHabitacion(resDetalle.id) : null;

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Ventas, Caja y Facturación</h1>
        <p className="view-subtitle">
          Control de caja chica por turnos, cuentas de habitación y emisión de Boletas (B001) y Facturas (F001)
        </p>
      </div>

      <div className="subtabs-container">
        <button
          className={`subtab-btn ${subtab === 'caja' ? 'active' : ''}`}
          onClick={() => setSubtab('caja')}
        >
          Caja Chica
        </button>
        <button
          className={`subtab-btn ${subtab === 'cuentas' ? 'active' : ''}`}
          onClick={() => setSubtab('cuentas')}
        >
          Cuentas de Habitación y Cobros
        </button>
        <button
          className={`subtab-btn ${subtab === 'comprobantes' ? 'active' : ''}`}
          onClick={() => setSubtab('comprobantes')}
        >
          Comprobantes y Facturación ({comprobantes.length})
        </button>
      </div>

      {/* SUBTAB 1: CAJA CHICA */}
      {subtab === 'caja' && (
        <>
          {!cajaAbierta ? (
            <div className="table-card" style={{ padding: 40, textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--wine-900)', marginBottom: 8 }}>
                La Caja Chica se encuentra cerrada
              </h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
                Para registrar pagos, abonos y cobros directos, debe aperturar un turno de caja.
              </p>
              <button
                className="btn btn-gold"
                onClick={() => setShowAbrirCaja(true)}
                style={{ padding: '12px 32px', fontSize: 15 }}
              >
                Abrir Turno de Caja
              </button>
            </div>
          ) : (
            <>
              <div className="frontdesk-shift-bar">
                <div className="frontdesk-shift-header">
                  <div className="frontdesk-shift-title">
                    <div>
                      <h4>Turno de Caja · {cajaActual.turno}</h4>
                      <p>
                        Aperturado por <strong>{cajaActual.responsable}</strong> el {cajaActual.aperturaFecha}
                      </p>
                    </div>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      setEfectivoDeclarado(String(efectivoEsperado));
                      setShowCerrarCaja(true);
                    }}
                  >
                    Cerrar Turno y Realizar Arqueo
                  </button>
                </div>
                <div className="frontdesk-shift-pills">
                  <div className="frontdesk-pill">
                    <span className="pill-label">Fondo de Apertura:</span>
                    <strong className="pill-val">{formatMoney(cajaActual.montoInicial)}</strong>
                  </div>
                  <div className="frontdesk-pill">
                    <span className="pill-label">Cobros en Efectivo:</span>
                    <strong className="pill-val" style={{ color: 'var(--status-disponible)' }}>
                      {formatMoney(ingresosEfectivo)}
                    </strong>
                  </div>
                  <div className="frontdesk-pill">
                    <span className="pill-label">Efectivo para Arqueo:</span>
                    <strong className="pill-val" style={{ color: 'var(--wine-800)' }}>
                      {formatMoney(efectivoEsperado)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="table-card">
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, color: 'var(--wine-900)' }}>
                  Movimientos del Turno Actual
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Concepto</th>
                        <th>Medio de Pago</th>
                        <th>Tipo</th>
                        <th>Monto</th>
                        <th>Responsable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientos.map((m) => (
                        <tr key={m.id}>
                          <td>{m.fecha}</td>
                          <td><strong>{m.concepto}</strong></td>
                          <td>{m.medio}</td>
                          <td>
                            <span className={`badge-status ${m.tipo === 'Ingreso' ? 'disponible' : 'ocupada'}`}>
                              {m.tipo}
                            </span>
                          </td>
                          <td><strong>{formatMoney(m.monto)}</strong></td>
                          <td>{m.usuario}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* HISTORIAL DE TURNOS DE CAJA CERRADOS (ÚLTIMOS 3 MESES) */}
          <div className="table-card" style={{ marginTop: 22 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, color: 'var(--wine-900)' }}>
              Historial de Cierres y Arqueos de Caja ({historialCajas.length})
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Turno</th>
                    <th>Fondo Inicial</th>
                    <th>Ingresos Efectivo</th>
                    <th>Efectivo Declarado</th>
                    <th>Diferencia</th>
                    <th>Resultado de Arqueo</th>
                  </tr>
                </thead>
                <tbody>
                  {historialCajas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-state">No hay turnos cerrados en el historial.</td>
                    </tr>
                  ) : (
                    historialCajas.map((hc) => (
                      <tr key={hc.id}>
                        <td>{formatDateDMY(hc.fecha)}</td>
                        <td><strong>{hc.turno}</strong></td>
                        <td>{formatMoney(hc.montoInicial)}</td>
                        <td style={{ color: 'var(--status-disponible)', fontWeight: 600 }}>{formatMoney(hc.ingresosEfectivo)}</td>
                        <td><strong>{formatMoney(hc.efectivoDeclarado)}</strong></td>
                        <td style={{ color: hc.diferencia < 0 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                          {formatMoney(hc.diferencia)}
                        </td>
                        <td>
                          <span className={`badge-status ${hc.diferencia === 0 ? 'disponible' : 'reservada'}`}>
                            {hc.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* SUBTAB 2: CUENTAS DE HABITACIÓN Y COBROS */}
      {subtab === 'cuentas' && (
        <>
          <div className="table-card" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--wine-900)' }}>
                  Cuentas de Habitación Activas
                </h3>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Seleccione una habitación para inspeccionar el estado de cuenta, cargar consumos de minibar o registrar pagos.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-gold"
                  onClick={() => {
                    setConsHab(cuartosOcupados[0]?.numero || '');
                    setConsErr('');
                    setShowConsumoModal(true);
                  }}
                >
                  Cargar Consumo
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setPagoHab(cuartosOcupados[0]?.numero || '');
                    setPagoMonto('');
                    setPagoErr('');
                    setShowPagoModal(true);
                  }}
                >
                  Registrar Pago
                </button>
              </div>
            </div>
          </div>

          <div className="rooms-grid">
            {cuartosOcupados.length === 0 ? (
              <div className="table-card" style={{ padding: 30, gridColumn: '1/-1', textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)' }}>No hay habitaciones ocupadas en este momento.</p>
              </div>
            ) : (
              cuartosOcupados.map((h) => {
                const res = reservas.find(
                  (r) => r.habitacionNumero === h.numero && r.estado === 'En Curso'
                );
                if (!res) return null;
                const cuenta = calcularCuentaHabitacion(res.id);
                const saldo = cuenta ? cuenta.saldoPendiente : 0;
                const cliente = clientes.find((c) => c.id === res.clienteId) || { nombre: 'Cliente' };

                return (
                  <div className="room-card" key={h.numero}>
                    <div className="room-card-colorbar ocupada"></div>
                    <div className="room-card-body">
                      <div className="room-card-header">
                        <span className="room-number">#{h.numero}</span>
                        <span className="badge-status ocupada">Ocupada</span>
                      </div>
                      <div className="room-card-meta">
                        Titular: <strong>{cliente.nombre}</strong>
                        <br />
                        Reserva: {res.codigo}
                        <br />
                        Salida: {formatDateDMY(res.salida)}
                      </div>
                      <div className="room-price-line">
                        <span>Saldo</span>
                        {saldo > 0 ? (
                          <strong style={{ color: 'var(--status-ocupada)' }}>{formatMoney(saldo)}</strong>
                        ) : (
                          <strong style={{ color: 'var(--status-disponible)' }}>Liquidada</strong>
                        )}
                      </div>
                    </div>
                    <div className="room-card-actions">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setDetalleHab(h.numero)}
                      >
                        Ver Detalle Cuenta
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleCheckOutDirecto(h.numero)}
                      >
                        Check-Out
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* SUBTAB 3: COMPROBANTES Y FACTURACIÓN */}
      {subtab === 'comprobantes' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--wine-900)' }}>
                Comprobantes Emitidos y Facturación Electrónica
              </h3>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                Boletas (B001), Facturas (F001), Notas de Crédito y Cobros de Servicios Directos con Registro Rápido de Cliente.
              </p>
            </div>
            <button className="btn btn-gold" onClick={() => setShowDirectoModal(true)}>
              Cobro Directo de Servicio (POS)
            </button>
          </div>

          <div className="table-card">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>N° Comprobante</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Documento</th>
                    <th>Subtotal</th>
                    <th>IGV (18%)</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {comprobantes.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.numero}</strong></td>
                      <td>{c.tipo}</td>
                      <td>{c.fecha}</td>
                      <td>{c.clienteNombre}</td>
                      <td>{c.clienteDoc}</td>
                      <td>{formatMoney(c.subtotal)}</td>
                      <td>{formatMoney(c.igv)}</td>
                      <td><strong>{formatMoney(c.total)}</strong></td>
                      <td>
                        <span className={`badge-status ${c.estado === 'Emitido' ? 'disponible' : 'ocupada'}`}>
                          {c.estado}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setPreviewComp(c)}
                          >
                            Ver / PDF
                          </button>
                          {c.estado === 'Emitido' && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                setAnularComp(c);
                                setMotivoAnulacion('');
                                setAnulErr('');
                              }}
                            >
                              Anular (NC)
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* MODAL ABRIR CAJA */}
      {showAbrirCaja && (
        <div className="modal-backdrop" onClick={() => setShowAbrirCaja(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Aperturar Turno de Caja Chica</h3>
              <button className="btn-close-modal" onClick={() => setShowAbrirCaja(false)}>&times;</button>
            </div>
            <form onSubmit={handleAbrirCaja}>
              <div className="modal-body">
                <div className="form-grid">
                  <div>
                    <label className="field-label">Turno Operativo</label>
                    <select className="form-select" value={turnoCaja} onChange={(e) => setTurnoCaja(e.target.value)}>
                      <option value="Mañana">Mañana (07:00 - 15:00)</option>
                      <option value="Tarde">Tarde (15:00 - 23:00)</option>
                      <option value="Noche">Noche (23:00 - 07:00)</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Fondo Fijo Inicial (S/)</label>
                    <input type="number" step="0.1" className="form-input" value={montoInicialCaja} onChange={(e) => setMontoInicialCaja(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAbrirCaja(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Abrir Caja</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CERRAR CAJA */}
      {showCerrarCaja && (
        <div className="modal-backdrop" onClick={() => setShowCerrarCaja(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cerrar Turno y Realizar Arqueo</h3>
              <button className="btn-close-modal" onClick={() => setShowCerrarCaja(false)}>&times;</button>
            </div>
            <form onSubmit={handleCerrarCaja}>
              <div className="modal-body">
                <p style={{ fontSize: 13, marginBottom: 12 }}>
                  Efectivo esperado en gaveta: <strong>{formatMoney(efectivoEsperado)}</strong>
                </p>
                <label className="field-label">Efectivo Físico Contado en Gaveta (S/) <span className="req">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={efectivoDeclarado}
                  onChange={(e) => setEfectivoDeclarado(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCerrarCaja(false)}>Cancelar</button>
                <button type="submit" className="btn btn-danger">Confirmar Cierre de Caja</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CARGAR CONSUMO */}
      {showConsumoModal && (
        <div className="modal-backdrop" onClick={() => setShowConsumoModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cargar Consumo a Habitación</h3>
              <button className="btn-close-modal" onClick={() => setShowConsumoModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCargarConsumo}>
              <div className="modal-body">
                {consErr && <small className="field-msg-error" style={{ marginBottom: 10 }}>{consErr}</small>}
                <div className="form-grid">
                  <div className="form-col-full">
                    <label className="field-label">Habitación Ocupada <span className="req">*</span></label>
                    <select className="form-select" value={consHab} onChange={(e) => setConsHab(e.target.value)}>
                      <option value="">-- Seleccione habitación ocupada --</option>
                      {cuartosOcupados.map((h) => {
                        const res = reservas.find((r) => r.habitacionNumero === h.numero && r.estado === 'En Curso');
                        const cli = clientes.find((c) => c.id === res?.clienteId);
                        return (
                          <option key={h.numero} value={h.numero}>
                            #{h.numero} - Huésped: {cli?.nombre || 'Titular'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Servicio / Producto <span className="req">*</span></label>
                    <select className="form-select" value={consServId} onChange={(e) => setConsServId(Number(e.target.value))}>
                      {servicios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} ({formatMoney(s.precio)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Cantidad <span className="req">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      min={1}
                      max={99}
                      value={consCant}
                      onChange={(e) => setConsCant(Number(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConsumoModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Cargar a la Cuenta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR PAGO A CUENTA */}
      {showPagoModal && (
        <div className="modal-backdrop" onClick={() => setShowPagoModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registrar Pago a Cuenta</h3>
              <button className="btn-close-modal" onClick={() => setShowPagoModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleRegistrarPago}>
              <div className="modal-body">
                {pagoErr && <small className="field-msg-error" style={{ marginBottom: 10 }}>{pagoErr}</small>}
                <div className="form-grid">
                  <div className="form-col-full">
                    <label className="field-label">Habitación Ocupada <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={pagoHab}
                      onChange={(e) => {
                        setPagoHab(e.target.value);
                        const r = reservas.find((res) => res.habitacionNumero === e.target.value && res.estado === 'En Curso');
                        if (r) {
                          const c = calcularCuentaHabitacion(r.id);
                          if (c) setPagoMonto(String(c.saldoPendiente));
                        }
                      }}
                    >
                      <option value="">-- Seleccione habitación --</option>
                      {cuartosOcupados.map((h) => {
                        const r = reservas.find((res) => res.habitacionNumero === h.numero && res.estado === 'En Curso');
                        const c = r ? calcularCuentaHabitacion(r.id) : null;
                        return (
                          <option key={h.numero} value={h.numero}>
                            #{h.numero} - Saldo Pendiente: {formatMoney(c?.saldoPendiente || 0)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Monto a Pagar (S/) <span className="req">*</span></label>
                    <input type="number" step="0.01" className="form-input" value={pagoMonto} onChange={(e) => setPagoMonto(e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Método de Pago <span className="req">*</span></label>
                    <select className="form-select" value={pagoMetodo} onChange={(e) => setPagoMetodo(e.target.value as 'Efectivo' | 'Tarjeta' | 'Yape/Plin')}>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                      <option value="Yape/Plin">Yape / Plin</option>
                    </select>
                  </div>
                  {pagoMetodo === 'Efectivo' ? (
                    <div className="form-col-full">
                      <label className="field-label">Efectivo Recibido del Cliente <span className="req">*</span></label>
                      <input type="number" step="0.01" className="form-input" value={pagoRecibido} onChange={(e) => setPagoRecibido(e.target.value)} />
                      {Number(pagoRecibido) >= Number(pagoMonto) && Number(pagoMonto) > 0 && (
                        <div style={{ marginTop: 6, fontWeight: 700, color: 'var(--wine-900)' }}>
                          Vuelto a entregar: {formatMoney(Number(pagoRecibido) - Number(pagoMonto))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="form-col-full">
                      <label className="field-label">N° de Operación <span className="req">*</span></label>
                      <input type="text" className="form-input" value={pagoOperacion} onChange={(e) => setPagoOperacion(e.target.value)} placeholder="Ej. OP984512" />
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPagoModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Confirmar Pago</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE CUENTA */}
      {detalleHab && cuentaDetalle && (
        <div className="modal-backdrop" onClick={() => setDetalleHab(null)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Estado de Cuenta - Habitación #{detalleHab}</h3>
              <button className="btn-close-modal" onClick={() => setDetalleHab(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="table-card" style={{ padding: 16, marginBottom: 16, background: 'var(--cream)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                  <div><strong>Habitación:</strong> #{cuentaDetalle.reserva.habitacionNumero}</div>
                  <div><strong>Reserva:</strong> {cuentaDetalle.reserva.codigo}</div>
                  <div><strong>Entrada:</strong> {formatDateDMY(cuentaDetalle.reserva.entrada)}</div>
                  <div><strong>Salida prevista:</strong> {formatDateDMY(cuentaDetalle.reserva.salida)}</div>
                </div>
              </div>

              <h4 style={{ fontSize: 14, color: 'var(--wine-900)', marginBottom: 6 }}>1. Hospedaje:</h4>
              <div style={{ fontSize: 13, marginBottom: 12 }}>
                Total hospedaje pactado: <strong>{formatMoney(cuentaDetalle.totalHospedaje)}</strong>
              </div>

              <h4 style={{ fontSize: 14, color: 'var(--wine-900)', marginBottom: 6 }}>2. Consumos Adicionales:</h4>
              <table className="data-table" style={{ marginBottom: 14, fontSize: 12 }}>
                <thead>
                  <tr><th>Fecha</th><th>Servicio</th><th>Cant.</th><th>Subtotal</th></tr>
                </thead>
                <tbody>
                  {cuentaDetalle.consumos.length === 0 ? (
                    <tr><td colSpan={4} style={{ color: 'var(--muted)' }}>Sin consumos cargados.</td></tr>
                  ) : (
                    cuentaDetalle.consumos.map((c) => (
                      <tr key={c.id}>
                        <td>{c.fecha}</td>
                        <td>{c.descripcion}</td>
                        <td>{c.cantidad}</td>
                        <td><strong>{formatMoney(c.subtotal)}</strong></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <h4 style={{ fontSize: 14, color: 'var(--wine-900)', marginBottom: 6 }}>3. Pagos y Adelantos Registrados:</h4>
              <table className="data-table" style={{ marginBottom: 14, fontSize: 12 }}>
                <thead>
                  <tr><th>Fecha</th><th>Tipo</th><th>Medio</th><th>Monto</th></tr>
                </thead>
                <tbody>
                  {cuentaDetalle.pagos.length === 0 ? (
                    <tr><td colSpan={4} style={{ color: 'var(--muted)' }}>Sin pagos registrados.</td></tr>
                  ) : (
                    cuentaDetalle.pagos.map((p) => (
                      <tr key={p.id}>
                        <td>{p.fecha}</td>
                        <td>{p.tipo}</td>
                        <td>{p.medio}</td>
                        <td><strong>{formatMoney(p.monto)}</strong></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div style={{ borderTop: '2px solid var(--wine-900)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 15 }}>
                <div>Total Cuenta: <strong>{formatMoney(cuentaDetalle.totalCuenta)}</strong></div>
                <div>
                  Saldo Pendiente:{' '}
                  {cuentaDetalle.saldoPendiente > 0 ? (
                    <span style={{ color: 'var(--status-ocupada)', fontWeight: 700 }}>{formatMoney(cuentaDetalle.saldoPendiente)}</span>
                  ) : (
                    <span style={{ color: 'var(--status-disponible)', fontWeight: 700 }}>Cuenta Liquidada (S/ 0.00)</span>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetalleHab(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL COBRO DIRECTO DE SERVICIO (CON REGISTRO RÁPIDO DE CLIENTE) */}
      {showDirectoModal && (
        <div className="modal-backdrop" onClick={() => setShowDirectoModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cobro Directo de Servicio en Punto de Venta</h3>
              <button className="btn-close-modal" onClick={() => setShowDirectoModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCobroDirecto}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-col-full">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="field-label" style={{ marginBottom: 0 }}>Cliente <span className="req">*</span></label>
                      <button
                        type="button"
                        className="btn btn-sm btn-gold"
                        onClick={() => setShowQuickClientModal(true)}
                      >
                        + Registro Rápido Cliente
                      </button>
                    </div>
                    <select className="form-select" value={dirClienteId} onChange={(e) => setDirClienteId(Number(e.target.value))}>
                      {clientes
                        .filter((c) => c.estado === 'Activo')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre} ({c.tipoDoc}: {c.documento})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Servicio / Producto <span className="req">*</span></label>
                    <select className="form-select" value={dirServId} onChange={(e) => setDirServId(Number(e.target.value))}>
                      {servicios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} ({formatMoney(s.precio)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Cantidad <span className="req">*</span></label>
                    <input type="number" className="form-input" min={1} value={dirCant} onChange={(e) => setDirCant(Number(e.target.value) || 1)} />
                  </div>
                  <div className="form-col-full">
                    <label className="field-label">Medio de Pago</label>
                    <select className="form-select" value={dirMetodo} onChange={(e) => setDirMetodo(e.target.value as 'Efectivo' | 'Tarjeta' | 'Yape/Plin')}>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Yape/Plin">Yape / Plin</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDirectoModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Emitir Comprobante y Cobrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE REGISTRO RÁPIDO DE CLIENTE DESDE EL POS */}
      {showQuickClientModal && (
        <div className="modal-backdrop" onClick={() => setShowQuickClientModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registro Rápido de Cliente (POS)</h3>
              <button className="btn-close-modal" onClick={() => setShowQuickClientModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleQuickClientSave}>
              <div className="modal-body">
                {qErr && <small className="field-msg-error" style={{ marginBottom: 10 }}>{qErr}</small>}
                <div className="form-grid">
                  <div>
                    <label className="field-label">Tipo Documento</label>
                    <select
                      className="form-select"
                      value={qTipo}
                      onChange={(e) => {
                        setQTipo(e.target.value as 'DNI' | 'RUC');
                        setQDoc('');
                      }}
                    >
                      <option value="DNI">DNI (8 dígitos - Boleta)</option>
                      <option value="RUC">RUC (11 dígitos - Factura)</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">
                      N° {qTipo} ({qDoc.length}/{qTipo === 'DNI' ? 8 : 11}) <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-input"
                      value={qDoc}
                      onChange={(e) =>
                        setQDoc(e.target.value.replace(/\D/g, '').slice(0, qTipo === 'DNI' ? 8 : 11))
                      }
                    />
                  </div>
                  <div className="form-col-full">
                    <label className="field-label">
                      {qTipo === 'RUC' ? 'Razón Social' : 'Nombres y Apellidos'} <span className="req">*</span>
                    </label>
                    <input type="text" className="form-input" value={qNombre} onChange={(e) => setQNombre(e.target.value)} />
                  </div>
                  <div className="form-col-full">
                    <label className="field-label">Teléfono</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-input"
                      value={qTel}
                      onChange={(e) => setQTel(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuickClientModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Guardar y Seleccionar en Venta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VISTA IMPRIMIBLE DE COMPROBANTE */}
      {previewComp && (
        <div className="modal-backdrop" onClick={() => setPreviewComp(null)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Comprobante Electrónico {previewComp.numero}</h3>
              <button className="btn-close-modal" onClick={() => setPreviewComp(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="invoice-preview">
                <div className="invoice-header-box">
                  <div className="invoice-hotel-info">
                    <h3>HOTEL AVENTURA</h3>
                    <p>RUC: 20609874512 · Av. Larco 850, Miraflores, Lima - Perú</p>
                    <p>Tel: (01) 456-7890 · reservaciones@hotelaventura.pe</p>
                  </div>
                  <div className="invoice-type-box">
                    <h4>{previewComp.tipo === 'Factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA'}</h4>
                    <span>{previewComp.numero}</span>
                  </div>
                </div>

                <div className="invoice-meta-grid">
                  <div><strong>Fecha de Emisión:</strong> {previewComp.fecha}</div>
                  <div><strong>Cliente:</strong> {previewComp.clienteNombre}</div>
                  <div><strong>Documento:</strong> {previewComp.clienteDoc}</div>
                  <div><strong>Estado Fiscal:</strong> {previewComp.estado}</div>
                </div>

                <table className="data-table" style={{ fontSize: 12, marginBottom: 12 }}>
                  <thead>
                    <tr><th>Descripción</th><th style={{ textAlign: 'right' }}>Importe Total</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{previewComp.concepto}</td>
                      <td style={{ textAlign: 'right' }}><strong>{formatMoney(previewComp.total)}</strong></td>
                    </tr>
                  </tbody>
                </table>

                <div className="invoice-totals-box">
                  <div className="invoice-total-row">
                    <span>Subtotal (Sin IGV):</span>
                    <span>{formatMoney(previewComp.subtotal)}</span>
                  </div>
                  <div className="invoice-total-row">
                    <span>IGV (18%):</span>
                    <span>{formatMoney(previewComp.igv)}</span>
                  </div>
                  <div className="invoice-total-row grand-total">
                    <span>Total:</span>
                    <span>{formatMoney(previewComp.total)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setPreviewComp(null)}>Cerrar</button>
              <button
                className="btn btn-gold"
                onClick={() => {
                  logAuditoria('Facturación', 'Impresión Comprobante', `Comprobante ${previewComp.numero} enviado a impresión.`);
                  window.print();
                }}
              >
                Imprimir / PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ANULAR COMPROBANTE CON NOTA DE CRÉDITO */}
      {anularComp && (
        <div className="modal-backdrop" onClick={() => setAnularComp(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Anular {anularComp.numero} con Nota de Crédito</h3>
              <button className="btn-close-modal" onClick={() => setAnularComp(null)}>&times;</button>
            </div>
            <form onSubmit={handleAnularConNC}>
              <div className="modal-body">
                <p style={{ fontSize: 14, marginBottom: 14 }}>
                  ¿Confirma la anulación del comprobante <strong>{anularComp.numero}</strong> ({anularComp.tipo}) por <strong>{formatMoney(anularComp.total)}</strong>?
                </p>
                <label className="field-label">Motivo de Anulación <span className="req">*</span></label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Mínimo 10 caracteres..."
                  value={motivoAnulacion}
                  onChange={(e) => setMotivoAnulacion(e.target.value)}
                />
                {anulErr && <small className="field-msg-error">{anulErr}</small>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAnularComp(null)}>Cancelar</button>
                <button type="submit" className="btn btn-danger">Emitir Nota de Crédito y Anular</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
