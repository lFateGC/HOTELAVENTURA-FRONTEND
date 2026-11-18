/**
 * MÓDULO PORTAL WEB EXCLUSIVO DEL CLIENTE
 * Responsable: Erik Barrera (Rama: Erik)
 * 
 * Reglas de negocio clave:
 * 1. El portal es exclusivo para el cliente; no tiene accesos directos al panel administrativo (solo desde /login).
 * 2. El cliente solo puede reservar si se ha autenticado / registrado con sus datos completos.
 * 3. Al generar una reserva se crea una Solicitud 'Pendiente' con plazo de 15 minutos para confirmarla.
 *    Si vence el plazo sin confirmación, pasa automáticamente a 'No Presentada' (Ausente) y se libera el cuarto.
 * 4. La reprogramación de fechas solo se permite con al menos 8 horas de antelación al Check-In (14:00 hrs).
 * 5. Se visualizan todas las habitaciones y categorías disponibles, con fotos HD en habitaciones y servicios.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useHotel,
  addDaysYMD,
  formatMoney,
  formatDateDMY,
  formatTimeNow,
  type CategoriaHotel,
  type ReservaHotel,
  type ClienteHotel,
} from '../../context/HotelContext';

const PADRON_PORTAL: Record<string, { nombre: string; tel: string; email: string }> = {
  '45892136': { nombre: 'Alejandro Vargas Llosa', tel: '987654321', email: 'avargas@correo.pe' },
  '72145698': { nombre: 'Valeria Montesinos Ríos', tel: '994123654', email: 'valeria.montesinos@gmail.com' },
  '41258741': { nombre: 'Carlos Eduardo Mendoza Salazar', tel: '981223344', email: 'cmendoza@outlook.com' },
  '74125896': { nombre: 'Camila Andrea Benavides Paz', tel: '954112233', email: 'cbenavides@hotmail.com' },
  '70895412': { nombre: 'Lucía Fernanda Paredes Quispe', tel: '977889900', email: 'lparedes@pucp.edu.pe' },
  '43698521': { nombre: 'Jorge Luis Santisteban Castro', tel: '965432187', email: 'jsantisteban@gmail.com' },
  '20547896321': { nombre: 'Constructora Los Andes S.A.C.', tel: '014458963', email: 'logistica@losandes.com.pe' },
  '20458963214': { nombre: 'Consultora Tecnológica Pacífico S.A.C.', tel: '014785236', email: 'admin@techpacifico.pe' },
  '20112233445': { nombre: 'Minera Yanacocha Corporación S.A.', tel: '012214587', email: 'reservas@yanacocha.pe' },
};

// Duración de confirmación de una solicitud generada en el portal (15 minutos = 900 segundos)
const PLAZO_CONFIRMACION_SEGUNDOS = 15 * 60;

// Mapeo de fotos HD para las 6 categorías de habitación
const ROOM_IMAGES: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80', // Simple Estándar
  2: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80', // Doble Superior
  3: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80', // Suite Ejecutiva
  4: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80', // Suite Presidencial Aventura
  5: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80', // Matrimonial Confort
  6: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=900&q=80', // Familiar Deluxe Aventura
};

const getRoomImage = (cat: CategoriaHotel): string => {
  if (ROOM_IMAGES[cat.id]) return ROOM_IMAGES[cat.id];
  const n = cat.nombre.toLowerCase();
  if (n.includes('matrimonial')) return ROOM_IMAGES[5];
  if (n.includes('familiar')) return ROOM_IMAGES[6];
  if (n.includes('presidencial')) return ROOM_IMAGES[4];
  if (n.includes('ejecutiva') || n.includes('suite')) return ROOM_IMAGES[3];
  if (n.includes('doble')) return ROOM_IMAGES[2];
  return ROOM_IMAGES[1];
};

// Mapeo de fotos HD para los servicios del hotel
const SERVICE_IMAGES: Record<string, string> = {
  'Acceso Spa & Sauna Privado (1h)': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
  'Cena Ejecutiva Room Service': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  'Desayuno Buffet Americano Extra': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80',
  'Servicio de Lavandería Express': 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=600&q=80',
  'Vino Tinto Reserva Malbec 750ml': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
  'Cerveza Artesanal Cusqueña Trigo 330ml': 'https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?auto=format&fit=crop&w=600&q=80',
  'Chocolate Ibérico Fondant 100g': 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
  'Papas Pringles Original 124g': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
  'Gaseosa Inca Kola Zero 500ml': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
  'Agua Mineral San Mateo 600ml': 'https://images.unsplash.com/photo-1559839914-1b34645a890e?auto=format&fit=crop&w=600&q=80',
};

const getServiceImage = (srv: { nombre: string; categoria: string }): string => {
  if (SERVICE_IMAGES[srv.nombre]) return SERVICE_IMAGES[srv.nombre];
  const nom = srv.nombre.toLowerCase();
  if (nom.includes('spa') || nom.includes('sauna')) return SERVICE_IMAGES['Acceso Spa & Sauna Privado (1h)'];
  if (nom.includes('cena') || nom.includes('room service')) return SERVICE_IMAGES['Cena Ejecutiva Room Service'];
  if (nom.includes('desayuno') || nom.includes('buffet')) return SERVICE_IMAGES['Desayuno Buffet Americano Extra'];
  if (nom.includes('lavander')) return SERVICE_IMAGES['Servicio de Lavandería Express'];
  if (nom.includes('vino')) return SERVICE_IMAGES['Vino Tinto Reserva Malbec 750ml'];
  if (nom.includes('cerveza') || nom.includes('cusqueña')) return SERVICE_IMAGES['Cerveza Artesanal Cusqueña Trigo 330ml'];
  if (nom.includes('chocolate')) return SERVICE_IMAGES['Chocolate Ibérico Fondant 100g'];
  if (nom.includes('papas') || nom.includes('snack') || nom.includes('pringles')) return SERVICE_IMAGES['Papas Pringles Original 124g'];
  if (nom.includes('gaseosa') || nom.includes('inca')) return SERVICE_IMAGES['Gaseosa Inca Kola Zero 500ml'];
  if (nom.includes('agua') || nom.includes('mineral')) return SERVICE_IMAGES['Agua Mineral San Mateo 600ml'];
  return 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80';
};

export const PortalClientePage: React.FC = () => {
  const {
    todayYMD,
    categorias,
    habitaciones,
    setHabitaciones,
    servicios,
    clientes,
    setClientes,
    reservas,
    setReservas,
    pagos,
    setPagos,
    cajaActual,
    setCajaActual,
    cotizarEstadia,
    isHabitacionDisponible,
    calcularCuentaHabitacion,
    logAuditoria,
    showToast,
  } = useHotel();
  const navigate = useNavigate();

  // Navegación en el portal del cliente
  const [vistaActiva, setVistaActiva] = useState<'explorar' | 'servicios' | 'wizard' | 'mis-reservas'>('explorar');
  const [pasoWizard, setPasoWizard] = useState<1 | 2 | 3>(1);

  // Sesión e Identificación del Huésped
  const [clientePortalDoc, setClientePortalDoc] = useState<string>(() => {
    return sessionStorage.getItem('portal_cliente_doc') || '';
  });
  const [docInputLogin, setDocInputLogin] = useState('');

  // Modal de Detalle Completo de la Reserva (Voucher Digital)
  const [detalleModalRes, setDetalleModalRes] = useState<ReservaHotel | null>(null);

  // Modal de Login / Registro Obligatorio del Huésped
  const [modalAuthOpen, setModalAuthOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'registro'>('login');
  const [docAuthInput, setDocAuthInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [pendingCatSelection, setPendingCatSelection] = useState<CategoriaHotel | null>(null);

  // Formulario de Registro de Nuevo Huésped
  const [tipoReg, setTipoReg] = useState<'NATURAL' | 'EMPRESA'>('NATURAL');
  const [docReg, setDocReg] = useState('');
  const [nombreReg, setNombreReg] = useState('');
  const [telReg, setTelReg] = useState('');
  const [emailReg, setEmailReg] = useState('');

  // Buscador de disponibilidad
  const [checkIn, setCheckIn] = useState(addDaysYMD(todayYMD, 1));
  const [checkOut, setCheckOut] = useState(addDaysYMD(todayYMD, 3));
  const [huespedes, setHuespedes] = useState(1);
  const [catFiltro, setCatFiltro] = useState('TODAS');

  // Selección en el Wizard
  const [catSeleccionada, setCatSeleccionada] = useState<CategoriaHotel | null>(null);
  const [habAsignada, setHabAsignada] = useState<string>('101');
  const [extrasCant, setExtrasCant] = useState<Record<number, number>>({});

  // Datos en el Wizard
  const [telInput, setTelInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [solicitudesInput, setSolicitudesInput] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [formErr, setFormErr] = useState('');

  // Temporizadores de confirmación por código de reserva (segundos restantes)
  const [timersConfirmacion, setTimersConfirmacion] = useState<Record<string, number>>({});

  // Modal de Confirmación de Solicitud (con garantía opcional)
  const [confirmarModalRes, setConfirmarModalRes] = useState<ReservaHotel | null>(null);
  const [metodoGarantia, setMetodoGarantia] = useState<'Yape/Plin' | 'Tarjeta' | 'Efectivo'>('Yape/Plin');
  const [montoGarantia, setMontoGarantia] = useState('100');

  // Modal de Reprogramación (validado con mínimo 8 horas de antelación)
  const [reprogModalRes, setReprogModalRes] = useState<ReservaHotel | null>(null);
  const [nuevaEntradaReprog, setNuevaEntradaReprog] = useState('');
  const [nuevaSalidaReprog, setNuevaSalidaReprog] = useState('');
  const [reprogError, setReprogError] = useState('');

  // Reloj en tiempo real que descuenta cada segundo a las solicitudes en estado 'Pendiente'
  // Si el tiempo llega a 0, pasa automáticamente a 'No Presentada' (Ausente por no confirmar)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimersConfirmacion((prev) => {
        const next = { ...prev };
        let changed = false;
        const expiradas: string[] = [];

        for (const [codigo, segs] of Object.entries(next)) {
          if (segs > 1) {
            next[codigo] = segs - 1;
            changed = true;
          } else if (segs === 1) {
            next[codigo] = 0;
            changed = true;
            expiradas.push(codigo);
          }
        }

        if (expiradas.length > 0) {
          // REGLA: Si no se confirmó dentro del plazo de 15 minutos, NO SE GUARDA:
          // Se descarta y elimina completamente de las reservas sin dejar registro guardado.
          setReservas((prevRes) =>
            prevRes.filter((r) => !expiradas.includes(r.codigo))
          );
          for (const cod of expiradas) {
            showToast(
              `La solicitud ${cod} no fue confirmada dentro del plazo: fue descartada y NO se guardó en el sistema.`,
              'warning'
            );
          }
        }

        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Objeto del Huésped actualmente identificado en la sesión
  const clienteActualObj: ClienteHotel | null = clientePortalDoc
    ? clientes.find((c) => c.documento.toLowerCase() === clientePortalDoc.toLowerCase()) || null
    : null;

  // Sincronizar datos del cliente autenticado con los campos del formulario
  useEffect(() => {
    if (clienteActualObj) {
      setTelInput(clienteActualObj.telefono);
      setEmailInput(clienteActualObj.email || '');
    }
  }, [clienteActualObj]);

  // Reservas pertenecientes EXCLUSIVAMENTE al cliente identificado en el portal
  // Si una solicitud del portal no se confirmó o fue cancelada, NO cuenta como algo para guardar
  const misReservasCliente = clienteActualObj
    ? reservas.filter((r) => {
        if (r.clienteId !== clienteActualObj.id) return false;
        if (r.estado === 'No Presentada' && r.creadoPor === 'portal_cliente') return false;
        return true;
      })
    : [];

  // Calcular cuántas horas faltan para el Check-In oficial (14:00 hrs del día de entrada)
  const calcularHorasParaCheckIn = (fechaEntradaYMD: string): number => {
    const [y, m, d] = fechaEntradaYMD.split('-').map(Number);
    // Check-In estándar a las 14:00 hrs
    const fechaCheckIn = new Date(y, m - 1, d, 14, 0, 0);
    const ahora = new Date();
    const diffHoras = (fechaCheckIn.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    return Math.round(diffHoras * 10) / 10;
  };

  const puedeReprogramar8Horas = (r: ReservaHotel): { permitido: boolean; horasRestantes: number } => {
    const horas = calcularHorasParaCheckIn(r.entrada);
    return {
      permitido: horas >= 8,
      horasRestantes: horas,
    };
  };

  const formatCountdown = (segundos: number) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Filtrado de Categorías de Habitación (todas las 6 categorías visibles)
  const categoriasDisponibles = categorias.filter((c) => {
    if (c.estado !== 'Activa') return false;
    if (catFiltro !== 'TODAS' && String(c.id) !== catFiltro) return false;
    if (huespedes > 1 && c.capacidad < huespedes) return false;
    return true;
  });

  // Manejo de Selección de Habitación: REGLA DE LOGIN OBLIGATORIO
  const handleSeleccionarCategoria = (cat: CategoriaHotel) => {
    if (!clienteActualObj) {
      setPendingCatSelection(cat);
      setModalAuthOpen(true);
      setAuthModalTab('login');
      showToast('Por favor, inicie sesión o regístrese como huésped para continuar con su reserva', 'info');
      return;
    }

    const cuartoLibre = habitaciones.find(
      (h) => h.categoriaId === cat.id && isHabitacionDisponible(h.numero, checkIn, checkOut)
    );
    if (!cuartoLibre) {
      showToast('No quedan habitaciones disponibles en esta categoría para esas fechas', 'warning');
      return;
    }
    setCatSeleccionada(cat);
    setHabAsignada(cuartoLibre.numero);
    setTelInput(clienteActualObj.telefono);
    setEmailInput(clienteActualObj.email || '');
    setPasoWizard(1);
    setVistaActiva('wizard');
  };

  // Autenticación por DNI / RUC desde el modal
  const handleLoginPorDoc = (doc: string) => {
    const docTrim = doc.trim();
    if (!docTrim) {
      setAuthError('Ingrese su número de DNI o RUC.');
      return;
    }
    const clienteEncontrado = clientes.find((c) => c.documento === docTrim);
    if (clienteEncontrado) {
      setClientePortalDoc(clienteEncontrado.documento);
      sessionStorage.setItem('portal_cliente_doc', clienteEncontrado.documento);
      setModalAuthOpen(false);
      setAuthError('');
      showToast(`Bienvenido de nuevo, ${clienteEncontrado.nombre}`, 'success');
      if (pendingCatSelection) {
        const cat = pendingCatSelection;
        setPendingCatSelection(null);
        handleSeleccionarCategoria(cat);
      }
      return;
    }

    const padron = PADRON_PORTAL[docTrim];
    if (padron) {
      const nuevoId = clientes.reduce((max, c) => Math.max(max, c.id), 0) + 1;
      const nuevoCliente: ClienteHotel = {
        id: nuevoId,
        tipo: docTrim.length === 11 ? 'Empresa' : 'Persona Natural',
        tipoDoc: docTrim.length === 11 ? 'RUC' : 'DNI',
        documento: docTrim,
        nombre: padron.nombre,
        telefono: padron.tel,
        email: padron.email,
        estado: 'Activo',
      };
      setClientes((prev) => [...prev, nuevoCliente]);
      setClientePortalDoc(docTrim);
      sessionStorage.setItem('portal_cliente_doc', docTrim);
      setModalAuthOpen(false);
      setAuthError('');
      showToast(`Bienvenido a Hotel Aventura, ${padron.nombre}`, 'success');
      if (pendingCatSelection) {
        const cat = pendingCatSelection;
        setPendingCatSelection(null);
        handleSeleccionarCategoria(cat);
      }
      return;
    }

    setAuthError(`No se encontró un huésped con documento ${docTrim}. Regístrese en la pestaña "Nuevo Huésped".`);
  };

  // Registro de nuevo huésped desde el portal
  const handleRegistrarNuevoHuesped = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const docTrim = docReg.trim();
    const nomTrim = nombreReg.trim();
    const telTrim = telReg.trim();
    const emailTrim = emailReg.trim();

    if (tipoReg === 'NATURAL' && !/^\d{8}$/.test(docTrim)) {
      setAuthError('El DNI debe tener exactamente 8 dígitos numéricos.');
      return;
    }
    if (tipoReg === 'EMPRESA' && !/^(10|20)\d{9}$/.test(docTrim)) {
      setAuthError('El RUC debe tener 11 dígitos y empezar con 10 o 20.');
      return;
    }
    if (!nomTrim || !telTrim || !emailTrim) {
      setAuthError('Por favor complete todos los datos requeridos.');
      return;
    }

    const yaExiste = clientes.find((c) => c.documento === docTrim);
    if (yaExiste) {
      setClientePortalDoc(yaExiste.documento);
      sessionStorage.setItem('portal_cliente_doc', yaExiste.documento);
      setModalAuthOpen(false);
      showToast(`Identificado exitosamente como ${yaExiste.nombre}`, 'success');
      if (pendingCatSelection) {
        const cat = pendingCatSelection;
        setPendingCatSelection(null);
        handleSeleccionarCategoria(cat);
      }
      return;
    }

    const nuevoId = clientes.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const nuevoCliente: ClienteHotel = {
      id: nuevoId,
      tipo: tipoReg === 'EMPRESA' ? 'Empresa' : 'Persona Natural',
      tipoDoc: tipoReg === 'EMPRESA' ? 'RUC' : 'DNI',
      documento: docTrim,
      nombre: nomTrim,
      telefono: telTrim,
      email: emailTrim,
      estado: 'Activo',
    };

    setClientes((prev) => [...prev, nuevoCliente]);
    setClientePortalDoc(docTrim);
    sessionStorage.setItem('portal_cliente_doc', docTrim);
    setModalAuthOpen(false);
    showToast(`¡Registro completado! Bienvenido a Hotel Aventura, ${nomTrim}`, 'success');

    if (pendingCatSelection) {
      const cat = pendingCatSelection;
      setPendingCatSelection(null);
      handleSeleccionarCategoria(cat);
    }
  };

  const handleAutocompletarRegistro = () => {
    const docTrim = docReg.trim();
    if (!docTrim) {
      setAuthError('Ingrese su número de documento para autocompletar.');
      return;
    }
    const pad = PADRON_PORTAL[docTrim];
    if (pad) {
      setNombreReg(pad.nombre);
      setTelReg(pad.tel);
      setEmailReg(pad.email);
      setAuthError('');
      showToast('Datos validados desde RENIEC / SUNAT', 'info');
      return;
    }
    if (tipoReg === 'EMPRESA' && docTrim.length === 11) {
      setNombreReg(`Corporación Empresarial ${docTrim.slice(-4)} S.A.C.`);
      setTelReg('014458900');
      setEmailReg(`contacto@empresa${docTrim.slice(-4)}.pe`);
      setAuthError('');
    } else if (tipoReg === 'NATURAL' && docTrim.length === 8) {
      setNombreReg(`Huésped Registrado DNI ${docTrim.slice(-4)}`);
      setTelReg('987654321');
      setEmailReg(`huesped${docTrim.slice(-4)}@correo.pe`);
      setAuthError('');
    }
  };

  const handleLogoutCliente = () => {
    setClientePortalDoc('');
    sessionStorage.removeItem('portal_cliente_doc');
    setTelInput('');
    setEmailInput('');
    setVistaActiva('explorar');
    showToast('Has cerrado sesión como huésped en el portal', 'info');
  };

  const cotizacionActual =
    catSeleccionada && checkOut > checkIn
      ? cotizarEstadia(catSeleccionada.id, checkIn, checkOut)
      : null;

  const totalExtras = Object.entries(extrasCant).reduce((sum, [sId, cant]) => {
    const s = servicios.find((srv) => srv.id === Number(sId));
    return sum + (s ? s.precio * cant : 0);
  }, 0);

  const totalGeneral = (cotizacionActual?.total || 0) + totalExtras;

  // Paso Final del Wizard: Genera una SOLICITUD DE RESERVA ('Pendiente') con tiempo límite para confirmar
  const handleGenerarSolicitudReserva = () => {
    if (!catSeleccionada || !cotizacionActual) return;
    if (!clienteActualObj) {
      setModalAuthOpen(true);
      showToast('Debe estar identificado con sus datos para generar la reserva.', 'warning');
      return;
    }
    if (!aceptaTerminos) {
      setFormErr('Debe aceptar las políticas de confirmación y reprogramación (8 horas de antelación).');
      return;
    }

    const nuevoIdRes = reservas.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const nuevoCodigo = `RES-${String(nuevoIdRes).padStart(4, '0')}`;

    const resumenExtras = Object.entries(extrasCant)
      .filter(([, cant]) => cant > 0)
      .map(([sId, cant]) => {
        const s = servicios.find((srv) => srv.id === Number(sId));
        return s ? `${s.nombre} (x${cant})` : '';
      })
      .filter(Boolean)
      .join(', ');

    const obsFinal = [
      solicitudesInput.trim(),
      resumenExtras ? `Servicios incluidos: ${resumenExtras}` : '',
    ]
      .filter(Boolean)
      .join(' · ') || 'Solicitud creada desde el Portal Web del Cliente.';

    const nuevaSolicitud: ReservaHotel = {
      id: nuevoIdRes,
      codigo: nuevoCodigo,
      clienteId: clienteActualObj.id,
      habitacionNumero: habAsignada,
      entrada: checkIn,
      salida: checkOut,
      huespedes,
      tarifaBasePorNoche: catSeleccionada.tarifaBase,
      ajusteTemporada: 0,
      totalFijo: totalGeneral,
      estado: 'Pendiente', // Queda como Solicitud Pendiente hasta que el cliente la confirme a tiempo
      adelanto: 0,
      adelantoRetenido: false,
      observaciones: obsFinal,
      creadoEl: `${todayYMD} ${formatTimeNow()}`,
      creadoPor: 'portal_cliente',
      acompanantes: [],
    };

    setReservas((prev) => [nuevaSolicitud, ...prev]);

    // Iniciar cuenta regresiva de 15 minutos para que el cliente confirme su solicitud
    setTimersConfirmacion((prev) => ({
      ...prev,
      [nuevoCodigo]: PLAZO_CONFIRMACION_SEGUNDOS,
    }));

    logAuditoria(
      'Portal Cliente',
      'Solicitud de Reserva Web',
      `Cliente ${clienteActualObj.nombre} generó solicitud ${nuevoCodigo} (Hab. #${habAsignada}) pendiente de confirmación.`
    );
    showToast(
      `Solicitud ${nuevoCodigo} generada. Tienes 15 minutos para confirmarla antes de que se dé por ausente.`,
      'warning'
    );
    setExtrasCant({});
    setVistaActiva('mis-reservas');
  };

  // Confirmar la Solicitud dentro del tiempo límite -> pasa de 'Pendiente' a 'Confirmada'
  const handleConfirmarSolicitudCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmarModalRes) return;

    const abono = Math.max(0, Number(montoGarantia) || 0);

    setReservas((prev) =>
      prev.map((r) =>
        r.id === confirmarModalRes.id
          ? {
              ...r,
              estado: 'Confirmada',
              adelanto: r.adelanto + abono,
            }
          : r
      )
    );

    if (confirmarModalRes.entrada === todayYMD) {
      setHabitaciones((prev) =>
        prev.map((h) =>
          h.numero === confirmarModalRes.habitacionNumero && h.estado === 'Disponible'
            ? { ...h, estado: 'Reservada' }
            : h
        )
      );
    }

    if (abono > 0) {
      setPagos((prev) => [
        ...prev,
        {
          id: Date.now(),
          reservaId: confirmarModalRes.id,
          monto: abono,
          medio: metodoGarantia,
          operacion: 'WEB-CONF',
          tipo: 'Garantía Portal Web',
          fecha: `${todayYMD} ${formatTimeNow()}`,
          cajaId: cajaActual?.id || 1,
          usuario: 'portal_cliente',
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
                    concepto: `Confirmación Web ${confirmarModalRes.codigo} (Hab. #${confirmarModalRes.habitacionNumero})`,
                    medio: metodoGarantia,
                    tipo: 'Ingreso',
                    monto: abono,
                    usuario: 'portal_cliente',
                  },
                ],
              }
            : null
        );
      }
    }

    // Quitar temporizador porque ya fue confirmada
    setTimersConfirmacion((prev) => {
      const next = { ...prev };
      delete next[confirmarModalRes.codigo];
      return next;
    });

    logAuditoria(
      'Portal Cliente',
      'Confirmación de Reserva Web',
      `Cliente confirmó su reserva ${confirmarModalRes.codigo} (Hab. #${confirmarModalRes.habitacionNumero}).`
    );
    showToast(`¡Reserva ${confirmarModalRes.codigo} Confirmada con éxito!`, 'success');
    setConfirmarModalRes(null);
  };

  // REGLA CLAVE: Si una solicitud no se confirmó, NO se guarda en el sistema
  // Se elimina inmediatamente de las reservas y se libera la habitación
  const descartarSolicitudNoConfirmada = (r: ReservaHotel) => {
    setTimersConfirmacion((prev) => {
      const next = { ...prev };
      delete next[r.codigo];
      return next;
    });
    setReservas((prev) => prev.filter((item) => item.id !== r.id));
    logAuditoria(
      'Portal Cliente',
      'Solicitud No Guardada',
      `Solicitud ${r.codigo} eliminada al no haber sido confirmada (no guardada).`
    );
    showToast(`Solicitud ${r.codigo} descartada: no se guardó en el sistema por falta de confirmación.`, 'info');
  };

  // Guardar Reprogramación validando las 8 horas de antelación
  const handleGuardarReprogramacion = (e: React.FormEvent) => {
    e.preventDefault();
    setReprogError('');
    if (!reprogModalRes) return;

    const validacion = puedeReprogramar8Horas(reprogModalRes);
    if (!validacion.permitido) {
      setReprogError(
        `No se puede reprogramar: solo faltan ${validacion.horasRestantes}h para el Check-In y se requiere un mínimo de 8 horas de antelación.`
      );
      return;
    }

    if (!nuevaEntradaReprog || !nuevaSalidaReprog || nuevaSalidaReprog <= nuevaEntradaReprog) {
      setReprogError('Seleccione fechas válidas de entrada y salida.');
      return;
    }

    if (
      !isHabitacionDisponible(
        reprogModalRes.habitacionNumero,
        nuevaEntradaReprog,
        nuevaSalidaReprog,
        reprogModalRes.id
      )
    ) {
      setReprogError(
        `La Habitación #${reprogModalRes.habitacionNumero} no está disponible en esas nuevas fechas.`
      );
      return;
    }

    const hab = habitaciones.find((h) => h.numero === reprogModalRes.habitacionNumero);
    const cot = hab ? cotizarEstadia(hab.categoriaId, nuevaEntradaReprog, nuevaSalidaReprog) : null;
    const nuevoTotal = cot ? cot.total : reprogModalRes.totalFijo;

    setReservas((prev) =>
      prev.map((r) =>
        r.id === reprogModalRes.id
          ? {
              ...r,
              entrada: nuevaEntradaReprog,
              salida: nuevaSalidaReprog,
              totalFijo: nuevoTotal,
              observaciones: `${r.observaciones} (Reprogramada por el cliente con >8h de antelación)`.trim(),
            }
          : r
      )
    );

    logAuditoria(
      'Portal Cliente',
      'Reprogramación de Reserva',
      `Reserva ${reprogModalRes.codigo} reprogramada del ${formatDateDMY(nuevaEntradaReprog)} al ${formatDateDMY(nuevaSalidaReprog)}.`
    );
    showToast(
      `Reserva ${reprogModalRes.codigo} reprogramada para el ${formatDateDMY(nuevaEntradaReprog)}`,
      'success'
    );
    setReprogModalRes(null);
  };

  const cantidadExtrasSeleccionados = Object.values(extrasCant).reduce((a, b) => a + b, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--beige)' }}>
      {/* HEADER EXCLUSIVO DEL PORTAL DEL CLIENTE (SIN SWITCHER AL PANEL ADMINISTRATIVO) */}
      <header className="hsm-header">
        <div className="header-container">
          <div className="hsm-brand" onClick={() => setVistaActiva('explorar')}>
            <div className="brand-crest">
              <span className="crest-icon" style={{ fontSize: 14, fontWeight: 800 }}>HA</span>
            </div>
            <div className="brand-text">
              <span className="brand-name">HOTEL AVENTURA</span>
              <span className="brand-tagline">PORTAL EXCLUSIVO DE HUÉSPEDES</span>
            </div>
          </div>

          <nav className="hsm-nav">
            <button
              className={`nav-btn ${vistaActiva === 'explorar' ? 'active' : ''}`}
              onClick={() => setVistaActiva('explorar')}
            >
              1. Habitaciones y Suites
            </button>
            <button
              className={`nav-btn ${vistaActiva === 'servicios' ? 'active' : ''}`}
              onClick={() => setVistaActiva('servicios')}
            >
              2. Servicios del Hotel
              {cantidadExtrasSeleccionados > 0 && (
                <span className="badge-count">{cantidadExtrasSeleccionados}</span>
              )}
            </button>
            <button
              className={`nav-btn ${vistaActiva === 'mis-reservas' ? 'active' : ''}`}
              onClick={() => setVistaActiva('mis-reservas')}
            >
              3. Mis Reservas
              {misReservasCliente.length > 0 && (
                <span className="badge-count">{misReservasCliente.length}</span>
              )}
            </button>

            {/* IDENTIFICACIÓN DEL CLIENTE EN LA BARRA SUPERIOR */}
            {clienteActualObj ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255,255,255,0.08)',
                  padding: '4px 12px',
                  borderRadius: 20,
                  border: '1px solid rgba(22, 163, 74, 0.4)',
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: '#16a34a',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {clienteActualObj.nombre.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.2 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: '#fff',
                      maxWidth: 130,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {clienteActualObj.nombre}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#86efac' }}>
                    {clienteActualObj.tipoDoc}: {clienteActualObj.documento}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: 10.5, padding: '2px 8px', marginLeft: 4 }}
                  onClick={handleLogoutCliente}
                  title="Cerrar sesión de huésped"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button
                className="btn btn-sm btn-gold"
                onClick={() => {
                  setModalAuthOpen(true);
                  setAuthModalTab('login');
                }}
                title="Identifícate con tus datos para poder reservar"
              >
                Iniciar Sesión / Registrarse
              </button>
            )}

            <button
              className="btn-user-pill"
              onClick={() => navigate('/login')}
              title="Volver a la pantalla de Inicio de Sesión"
            >
              <span>Salir al Login</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {/* =====================================================================
            PANTALLA 1: EXPLORAR HABITACIONES DISPONIBLES (6 CATEGORÍAS - 20 CUARTOS)
           ===================================================================== */}
        {vistaActiva === 'explorar' && (
          <section className="screen-pane active">
            <div
              style={{
                background:
                  'linear-gradient(135deg, rgba(11,17,32,0.88) 0%, rgba(20,83,45,0.84) 100%), url("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80") center/cover',
                padding: '44px 24px',
                color: '#fff',
                textAlign: 'center',
              }}
            >
              <div style={{ maxWidth: 960, margin: '0 auto' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 14px',
                    borderRadius: 6,
                    border: '1px solid #4ade80',
                    color: '#4ade80',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    marginBottom: 10,
                  }}
                >
                  PORTAL WEB DE CLIENTES · RESERVAS Y SERVICIOS EN LÍNEA
                </span>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(26px, 3.2vw, 38px)',
                    marginBottom: 8,
                  }}
                >
                  Reserva tu estadía en Hotel Aventura
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 14, marginBottom: 22 }}>
                  Descubre nuestras 20 habitaciones en 4 pisos, personaliza tus servicios adicionales y confirma en tiempo real. Reprogramación permitida con mínimo 8 horas de antelación.
                </p>

                {/* BARRA DE BÚSQUEDA DE DISPONIBILIDAD */}
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 18,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 14,
                    textAlign: 'left',
                    color: 'var(--ink)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.28)',
                  }}
                >
                  <div>
                    <label className="field-label">Fecha de Llegada (Check-In 14:00)</label>
                    <input
                      type="date"
                      className="form-input"
                      value={checkIn}
                      min={todayYMD}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        if (checkOut <= e.target.value) {
                          setCheckOut(addDaysYMD(e.target.value, 1));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="field-label">Fecha de Salida (Check-Out 12:00)</label>
                    <input
                      type="date"
                      className="form-input"
                      value={checkOut}
                      min={addDaysYMD(checkIn, 1)}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">Huéspedes</label>
                    <select
                      className="form-select"
                      value={huespedes}
                      onChange={(e) => setHuespedes(Number(e.target.value))}
                    >
                      <option value={1}>1 Huésped</option>
                      <option value={2}>2 Huéspedes</option>
                      <option value={3}>3 Huéspedes</option>
                      <option value={4}>4 Huéspedes</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Tipo de Habitación</label>
                    <select
                      className="form-select"
                      value={catFiltro}
                      onChange={(e) => setCatFiltro(e.target.value)}
                    >
                      <option value="TODAS">Todas las categorías ({categorias.length})</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="content-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--wine-900)', margin: 0 }}>
                    Habitaciones y Suites Disponibles ({categoriasDisponibles.length})
                  </h2>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                    Tarifas incluyen impuestos (IGV 18%) y desayuno buffet · Del {formatDateDMY(checkIn)} al {formatDateDMY(checkOut)}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setVistaActiva('servicios')}
                >
                  Ver Catálogo de Servicios con Imágenes →
                </button>
              </div>

              {/* GRILLA DE CATEGORÍAS CON TODAS LAS 6 CATEGORÍAS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                {categoriasDisponibles.map((cat) => {
                  const cot = cotizarEstadia(cat.id, checkIn, checkOut);
                  const cuartosLibres = habitaciones.filter(
                    (h) => h.categoriaId === cat.id && isHabitacionDisponible(h.numero, checkIn, checkOut)
                  );
                  const cuartosLibresCount = cuartosLibres.length;
                  const pisosStr = Array.from(new Set(cuartosLibres.map((h) => h.piso))).sort().join(', ');

                  return (
                    <div className="table-card" key={cat.id} style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: 210, overflow: 'hidden', position: 'relative' }}>
                        <img
                          src={getRoomImage(cat)}
                          alt={cat.nombre}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span
                          className={`badge-status ${cuartosLibresCount > 0 ? 'disponible' : 'ocupada'}`}
                          style={{ position: 'absolute', top: 14, right: 14 }}
                        >
                          {cuartosLibresCount > 0
                            ? `${cuartosLibresCount} habitación(es) libre(s)`
                            : 'Agotada en estas fechas'}
                        </span>
                      </div>
                      <div style={{ padding: 22, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--wine-900)', marginBottom: 6 }}>
                          {cat.nombre}
                        </h3>
                        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                          {cat.descripcion}
                        </p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                          <span className="home-meta-chip">Hasta {cat.capacidad} persona(s)</span>
                          <span className="home-meta-chip">Desayuno Buffet</span>
                          <span className="home-meta-chip">Wi-Fi Fibra</span>
                        </div>
                        {cuartosLibresCount > 0 ? (
                          <div style={{ fontSize: 11.5, color: '#15803d', fontWeight: 600, marginBottom: 12 }}>
                            Habitaciones disponibles: {cuartosLibres.map((h) => '#' + h.numero).join(', ')} (Piso {pisosStr})
                          </div>
                        ) : (
                          <div style={{ fontSize: 11.5, color: '#dc2626', fontWeight: 600, marginBottom: 12 }}>
                            Sin disponibilidad para las fechas seleccionadas
                          </div>
                        )}
                        <div
                          style={{
                            marginTop: 'auto',
                            paddingTop: 14,
                            borderTop: '1px solid var(--line)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>
                              Total por {cot?.noches || 1} noche(s) ({formatMoney(cat.tarifaBase)}/n)
                            </span>
                            <strong style={{ fontSize: 20, color: 'var(--wine-900)' }}>
                              {formatMoney(cot?.total || cat.tarifaBase)}
                            </strong>
                          </div>
                          <button
                            type="button"
                            className="btn btn-gold"
                            disabled={cuartosLibresCount === 0}
                            onClick={() => handleSeleccionarCategoria(cat)}
                          >
                            {cuartosLibresCount > 0 ? 'Reservar Ahora →' : 'Agotada'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            PANTALLA 2: CATÁLOGO DE SERVICIOS Y EXPERIENCIAS CON FOTOS HD
           ===================================================================== */}
        {vistaActiva === 'servicios' && (
          <section className="screen-pane active">
            <div className="content-container">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <h1 className="view-title">Servicios y Experiencias de Hotel Aventura</h1>
                  <p className="view-subtitle">
                    Pre-seleccione servicios adicionales de Spa, Restaurante, Lavandería o Minibar con entrega directa a su habitación
                  </p>
                </div>
                <button className="btn btn-gold" onClick={() => setVistaActiva('explorar')}>
                  Elegir Habitación para Reservar ({cantidadExtrasSeleccionados} servicio(s) elegidos) →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 20 }}>
                {servicios
                  .filter((s) => s.estado === 'Activo')
                  .map((srv) => {
                    const qty = extrasCant[srv.id] || 0;
                    return (
                      <div
                        key={srv.id}
                        className="table-card"
                        style={{
                          border: qty > 0 ? '2px solid #16a34a' : undefined,
                          background: qty > 0 ? '#f0fdf4' : '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                        }}
                      >
                        {/* FOTO HD DEL SERVICIO */}
                        <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                          <img
                            src={getServiceImage(srv)}
                            alt={srv.nombre}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              top: 10,
                              left: 10,
                              background: 'rgba(11, 17, 32, 0.78)',
                              backdropFilter: 'blur(4px)',
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: 6,
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                            }}
                          >
                            {srv.categoria}
                          </span>
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 10,
                              right: 10,
                              background: '#16a34a',
                              color: '#fff',
                              fontSize: 13,
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: 8,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            }}
                          >
                            {formatMoney(srv.precio)}
                          </span>
                        </div>

                        {/* CUERPO DE LA TARJETA */}
                        <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
                              {srv.nombre}
                            </h3>
                            <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: 0 }}>
                              Disponible para entrega directa en habitación o atención preferencial durante su estadía.
                            </p>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                              {qty > 0 ? `Subtotal: ${formatMoney(srv.precio * qty)}` : 'Sin agregar'}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                onClick={() =>
                                  setExtrasCant((p) => ({ ...p, [srv.id]: Math.max(0, (p[srv.id] || 0) - 1) }))
                                }
                              >
                                -
                              </button>
                              <strong style={{ minWidth: 22, textAlign: 'center' }}>{qty}</strong>
                              <button
                                type="button"
                                className="btn btn-sm btn-gold"
                                onClick={() =>
                                  setExtrasCant((p) => ({ ...p, [srv.id]: (p[srv.id] || 0) + 1 }))
                                }
                              >
                                + Incluir
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            PANTALLA 3: WIZARD DE REGISTRO Y SOLICITUD DE RESERVA DEL CLIENTE
           ===================================================================== */}
        {vistaActiva === 'wizard' && catSeleccionada && (
          <section className="screen-pane active">
            <div className="content-container">
              <div style={{ marginBottom: 16 }}>
                <button className="btn btn-secondary" onClick={() => setVistaActiva('explorar')}>
                  ← Cambiar Categoría de Habitación
                </button>
              </div>

              {/* PROGRESO EN 3 PASOS CLAROS */}
              <div className="subtabs-container" style={{ marginBottom: 24 }}>
                <button className={`subtab-btn ${pasoWizard === 1 ? 'active' : ''}`} onClick={() => setPasoWizard(1)}>
                  1. Habitación y Servicios
                </button>
                <button className={`subtab-btn ${pasoWizard === 2 ? 'active' : ''}`} onClick={() => setPasoWizard(2)}>
                  2. Huésped Titular
                </button>
                <button className={`subtab-btn ${pasoWizard === 3 ? 'active' : ''}`} onClick={() => clienteActualObj && setPasoWizard(3)}>
                  3. Generar Solicitud de Reserva
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                <div className="table-card" style={{ padding: 28 }}>
                  {/* PASO 1: ELEGIR NÚMERO DE HABITACIÓN DISPONIBLE Y SERVICIOS EXTRA */}
                  {pasoWizard === 1 && (
                    <>
                      <span className="view-header-badge">PASO 1 DE 3 · PERSONALIZA TU HABITACIÓN Y SERVICIOS</span>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--wine-900)', marginBottom: 14 }}>
                        {catSeleccionada.nombre}
                      </h3>

                      <div style={{ marginBottom: 20 }}>
                        <label className="field-label">Elige tu Número de Habitación Disponible:</label>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                          {habitaciones
                            .filter(
                              (h) =>
                                h.categoriaId === catSeleccionada.id &&
                                isHabitacionDisponible(h.numero, checkIn, checkOut)
                            )
                            .map((h) => (
                              <button
                                key={h.numero}
                                type="button"
                                onClick={() => setHabAsignada(h.numero)}
                                style={{
                                  padding: '10px 16px',
                                  borderRadius: 10,
                                  border: habAsignada === h.numero ? '2px solid #16a34a' : '1px solid var(--line)',
                                  background: habAsignada === h.numero ? '#f0fdf4' : '#fff',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Habitación #{h.numero} (Piso {h.piso}) {habAsignada === h.numero ? '✓' : ''}
                              </button>
                            ))}
                        </div>
                      </div>

                      {/* LISTA DE SERVICIOS ADICIONALES CON FOTOS MINIATURA */}
                      <div style={{ marginBottom: 22 }}>
                        <label className="field-label">¿Deseas incluir servicios adicionales en tu estadía?</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 270, overflowY: 'auto', marginTop: 6 }}>
                          {servicios
                            .filter((s) => s.estado === 'Activo')
                            .map((srv) => {
                              const qty = extrasCant[srv.id] || 0;
                              return (
                                <div
                                  key={srv.id}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    border: '1px solid var(--line)',
                                    borderRadius: 10,
                                    background: qty > 0 ? '#f0fdf4' : '#fff',
                                    gap: 12,
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <img
                                      src={getServiceImage(srv)}
                                      alt={srv.nombre}
                                      style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                                    />
                                    <div>
                                      <strong style={{ fontSize: 13.5 }}>{srv.nombre}</strong>
                                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                                        {srv.categoria} · <span style={{ color: '#16a34a', fontWeight: 600 }}>{formatMoney(srv.precio)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-secondary"
                                      onClick={() =>
                                        setExtrasCant((p) => ({ ...p, [srv.id]: Math.max(0, (p[srv.id] || 0) - 1) }))
                                      }
                                    >
                                      -
                                    </button>
                                    <strong style={{ minWidth: 20, textAlign: 'center' }}>{qty}</strong>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-gold"
                                      onClick={() =>
                                        setExtrasCant((p) => ({ ...p, [srv.id]: (p[srv.id] || 0) + 1 }))
                                      }
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <button className="btn btn-gold" onClick={() => setPasoWizard(2)}>
                          Siguiente: Verificar Mis Datos →
                        </button>
                      </div>
                    </>
                  )}

                  {/* PASO 2: VERIFICACIÓN DE IDENTIDAD DEL HUÉSPED REGISTRADO */}
                  {pasoWizard === 2 && (
                    <>
                      <span className="view-header-badge">PASO 2 DE 3 · HUÉSPED TITULAR VERIFICADO</span>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--wine-900)', marginBottom: 14 }}>
                        Datos del Huésped Titular
                      </h3>

                      {clienteActualObj ? (
                        <div
                          style={{
                            background: '#f0fdf4',
                            border: '1.5px solid #86efac',
                            borderRadius: 12,
                            padding: 20,
                            marginBottom: 20,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: '50%',
                                background: '#16a34a',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 16,
                              }}
                            >
                              ✓
                            </div>
                            <div>
                              <strong style={{ fontSize: 16, color: '#14532d' }}>Huésped Titular Autenticado</strong>
                              <div style={{ fontSize: 12, color: '#166534' }}>
                                Datos validados en el sistema de Hotel Aventura
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, fontSize: 13 }}>
                            <div>
                              <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11 }}>Titular / Razón Social:</span>
                              <strong>{clienteActualObj.nombre}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11 }}>Documento ({clienteActualObj.tipoDoc}):</span>
                              <strong>{clienteActualObj.documento}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11 }}>Teléfono de Contacto:</span>
                              <strong>{telInput || clienteActualObj.telefono}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11 }}>Correo Electrónico:</span>
                              <strong>{emailInput || clienteActualObj.email || 'cliente@hotelaventura.pe'}</strong>
                            </div>
                          </div>

                          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #bbf7d0', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            <label className="field-label" style={{ margin: 0 }}>Actualizar celular para confirmación vía WhatsApp/SMS:</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ maxWidth: 170, height: 34, background: '#fff' }}
                              value={telInput}
                              onChange={(e) => setTelInput(e.target.value.replace(/\D/g, '').slice(0, 9))}
                              placeholder={clienteActualObj.telefono}
                            />
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: 24,
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: 12,
                            textAlign: 'center',
                            marginBottom: 20,
                          }}
                        >
                          <h4 style={{ color: '#991b1b', marginBottom: 8 }}>Se requiere iniciar sesión para continuar</h4>
                          <p style={{ fontSize: 13, color: '#7f1d1d', marginBottom: 14 }}>
                            Por políticas del hotel, el cliente debe identificarse con su documento para poder reservar.
                          </p>
                          <button
                            type="button"
                            className="btn btn-gold"
                            onClick={() => {
                              setModalAuthOpen(true);
                              setAuthModalTab('login');
                            }}
                          >
                            Iniciar Sesión o Registrarse Ahora
                          </button>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button className="btn btn-secondary" onClick={() => setPasoWizard(1)}>
                          ← Atrás
                        </button>
                        <button
                          className="btn btn-gold"
                          disabled={!clienteActualObj}
                          onClick={() => setPasoWizard(3)}
                        >
                          Siguiente: Revisar Condiciones →
                        </button>
                      </div>
                    </>
                  )}

                  {/* PASO 3: ENVÍO DE SOLICITUD CON PLAZO DE CONFIRMACIÓN Y REGLA DE 8 HORAS */}
                  {pasoWizard === 3 && (
                    <>
                      <span className="view-header-badge">PASO 3 DE 3 · CONDICIONES DE SOLICITUD Y REPROGRAMACIÓN</span>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--wine-900)', marginBottom: 14 }}>
                        Enviar Solicitud de Reserva
                      </h3>

                      <div
                        style={{
                          padding: 14,
                          background: '#fffbeb',
                          border: '1px solid #fde68a',
                          borderRadius: 10,
                          fontSize: 13,
                          color: '#92400e',
                          marginBottom: 16,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                        }}
                      >
                        <strong>Reglas de tu Solicitud de Reserva en Hotel Aventura:</strong>
                        <div>
                          1. <strong>Plazo de Confirmación (15 minutos):</strong> Al enviar tu registro se generará una{' '}
                          <strong>Solicitud Temporal</strong> y dispondrás de <strong>15 minutos</strong> en la pestaña{' '}
                          <em>Mis Reservas</em> para confirmarla. Si no confirmas tu solicitud dentro del plazo,{' '}
                          <strong>será descartada automáticamente y NO se guardará en el sistema</strong>, liberando la habitación de inmediato.
                        </div>
                        <div>
                          2. <strong>Política de Reprogramación (8 Horas):</strong> Solo podrás reprogramar las fechas de tu reserva con al menos <strong>8 horas de antelación</strong> a la hora de Check-In (14:00 hrs).
                        </div>
                      </div>

                      {formErr && (
                        <div className="banner danger" style={{ marginBottom: 14 }}>
                          <span className="banner-icon">✕</span>
                          <div className="banner-body">{formErr}</div>
                        </div>
                      )}

                      <div style={{ marginBottom: 16 }}>
                        <label className="field-label">Comentarios o Solicitudes Especiales (Opcional)</label>
                        <textarea
                          className="form-textarea"
                          rows={2}
                          placeholder="Ej: Llegada estimada a las 15:00 hrs, requerimiento de cuna o estacionamiento..."
                          value={solicitudesInput}
                          onChange={(e) => setSolicitudesInput(e.target.value)}
                        />
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, marginBottom: 20, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={aceptaTerminos}
                          onChange={(e) => setAceptaTerminos(e.target.checked)}
                        />
                        <span>
                          Acepto el plazo de confirmación de 15 minutos y la regla de reprogramación con mínimo 8 horas de antelación.
                        </span>
                      </label>

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button className="btn btn-secondary" onClick={() => setPasoWizard(2)}>
                          ← Atrás
                        </button>
                        <button className="btn btn-gold" onClick={handleGenerarSolicitudReserva}>
                          Generar Solicitud de Reserva →
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* RESUMEN LATERAL DE LA SOLICITUD */}
                <div className="table-card" style={{ padding: 24, height: 'fit-content', background: '#f8fafc' }}>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--wine-900)', marginBottom: 12 }}>
                    Resumen de tu Solicitud
                  </h4>
                  <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    <div>
                      <strong>Habitación:</strong> #{habAsignada} ({catSeleccionada.nombre})
                    </div>
                    <div>
                      <strong>Llegada:</strong> {formatDateDMY(checkIn)} (14:00 hrs)
                    </div>
                    <div>
                      <strong>Salida:</strong> {formatDateDMY(checkOut)} (12:00 hrs)
                    </div>
                    <div>
                      <strong>Huéspedes:</strong> {huespedes} persona(s)
                    </div>
                    {clienteActualObj && (
                      <div>
                        <strong>Titular:</strong> {clienteActualObj.nombre} ({clienteActualObj.documento})
                      </div>
                    )}
                  </div>
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span>Hospedaje ({cotizacionActual?.noches || 1} noches):</span>
                      <strong>{formatMoney(cotizacionActual?.total || 0)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span>Servicios Adicionales:</span>
                      <strong>{formatMoney(totalExtras)}</strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: '2px dashed var(--line)',
                        fontSize: 16,
                      }}
                    >
                      <span>Total General:</span>
                      <strong style={{ color: 'var(--wine-900)' }}>{formatMoney(totalGeneral)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            PANTALLA 4: MIS SOLICITUDES Y RESERVAS (CON TIMER Y REGLA DE 8 HORAS)
           ===================================================================== */}
        {vistaActiva === 'mis-reservas' && (
          <section className="screen-pane active">
            <div className="content-container">
              <div style={{ marginBottom: 20 }}>
                <h1 className="view-title">Mis Solicitudes y Reservas</h1>
                <p className="view-subtitle">
                  Confirma tus solicitudes pendientes dentro del plazo límite o reprograma tus fechas con al menos 8 horas de antelación
                </p>
              </div>

              {/* BARRA DE IDENTIFICACIÓN / BÚSQUEDA */}
              <div
                className="table-card"
                style={{
                  padding: '16px 20px',
                  marginBottom: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!docInputLogin.trim()) return;
                    setClientePortalDoc(docInputLogin.trim());
                    sessionStorage.setItem('portal_cliente_doc', docInputLogin.trim());
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}
                >
                  <strong style={{ fontSize: 13 }}>Consultar con mi DNI o RUC:</strong>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ingrese su DNI (ej. 72145698) o RUC..."
                    value={docInputLogin}
                    onChange={(e) => setDocInputLogin(e.target.value)}
                    style={{ width: 250 }}
                  />
                  <button type="submit" className="btn btn-sm btn-primary">
                    Buscar Mis Reservas
                  </button>
                  {clientePortalDoc && (
                    <span style={{ fontSize: 12.5, color: '#14532d', fontWeight: 600 }}>
                      Viendo reservas del documento: <strong>{clientePortalDoc}</strong>
                    </span>
                  )}
                </form>

                <div style={{ display: 'flex', gap: 10 }}>
                  {!clienteActualObj && (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setModalAuthOpen(true);
                        setAuthModalTab('login');
                      }}
                    >
                      Iniciar Sesión como Huésped
                    </button>
                  )}
                  <button className="btn btn-gold" onClick={() => setVistaActiva('explorar')}>
                    + Nueva Solicitud de Reserva
                  </button>
                </div>
              </div>

              {!clientePortalDoc ? (
                <div className="table-card" style={{ padding: 36, textAlign: 'center' }}>
                  <h3 style={{ fontSize: 18, color: 'var(--wine-900)', marginBottom: 8 }}>
                    Ingresa tu número de DNI o RUC arriba para ver tus reservas
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                    Por privacidad, cada huésped solo visualiza las solicitudes y reservas asociadas a su propio documento de identidad.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setDocInputLogin('72145698');
                        setClientePortalDoc('72145698');
                        sessionStorage.setItem('portal_cliente_doc', '72145698');
                      }}
                    >
                      Probar Cliente Hoy (DNI 72145698 - Menos de 8h)
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setDocInputLogin('74125896');
                        setClientePortalDoc('74125896');
                        sessionStorage.setItem('portal_cliente_doc', '74125896');
                      }}
                    >
                      Probar Cliente Futuro (DNI 74125896 - Más de 8h)
                    </button>
                  </div>
                </div>
              ) : misReservasCliente.length === 0 ? (
                <div className="table-card" style={{ padding: 36, textAlign: 'center', color: 'var(--muted)' }}>
                  No se encontraron reservas registradas con el documento <strong>{clientePortalDoc}</strong>.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {misReservasCliente.map((r) => {
                    const hab = habitaciones.find((h) => h.numero === r.habitacionNumero);
                    const cat = categorias.find((c) => c.id === hab?.categoriaId);
                    const segsRestantes =
                      timersConfirmacion[r.codigo] !== undefined
                        ? timersConfirmacion[r.codigo]
                        : r.estado === 'Pendiente'
                        ? PLAZO_CONFIRMACION_SEGUNDOS
                        : 0;
                    const reg8h = puedeReprogramar8Horas(r);

                    return (
                      <div
                        key={r.id}
                        className="table-card"
                        style={{
                          padding: 20,
                          border:
                            r.estado === 'Pendiente'
                              ? '2px solid #d97706'
                              : r.estado === 'Confirmada'
                              ? '1.5px solid #16a34a'
                              : undefined,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 12,
                            marginBottom: 12,
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <strong style={{ fontSize: 18, color: 'var(--wine-900)' }}>{r.codigo}</strong>
                              <span
                                className={`badge-status ${
                                  r.estado === 'Confirmada' || r.estado === 'En Curso'
                                    ? 'disponible'
                                    : r.estado === 'Pendiente'
                                    ? 'reservada'
                                    : r.estado === 'Finalizada'
                                    ? 'checkin'
                                    : 'mantenimiento'
                                }`}
                              >
                                {r.estado === 'Pendiente'
                                  ? 'Solicitud Pendiente de Confirmar'
                                  : r.estado === 'No Presentada'
                                  ? 'Ausente / Vencida por no confirmar'
                                  : r.estado}
                              </span>
                            </div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>
                              Habitación #{r.habitacionNumero} — {cat?.nombre || 'Estándar'} · Del{' '}
                              <strong>{formatDateDMY(r.entrada)}</strong> al{' '}
                              <strong>{formatDateDMY(r.salida)}</strong>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                              {r.observaciones}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>
                              Importe Total
                            </span>
                            <strong style={{ fontSize: 20, color: 'var(--wine-900)' }}>
                              {formatMoney(r.totalFijo)}
                            </strong>
                            {r.adelanto > 0 && (
                              <div style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 600 }}>
                                Garantizado: {formatMoney(r.adelanto)}
                              </div>
                            )}
                            <div style={{ marginTop: 6 }}>
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => setDetalleModalRes(r)}
                                style={{ padding: '3px 10px', fontSize: 11.5 }}
                              >
                                Ver Detalle 📄
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* BANNER DE TIEMPO LÍMITE SI ES UNA SOLICITUD PENDIENTE */}
                        {r.estado === 'Pendiente' && (
                          <div
                            style={{
                              padding: '12px 16px',
                              borderRadius: 10,
                              background: '#fffbeb',
                              border: '1px solid #fcd34d',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 12,
                              marginBottom: 12,
                            }}
                          >
                            <div>
                              <strong style={{ color: '#92400e', fontSize: 13.5 }}>
                                ⏱ Tiempo restante para confirmar tu solicitud: {formatCountdown(segsRestantes)}
                              </strong>
                              <div style={{ fontSize: 12, color: '#78350f' }}>
                                Si no confirmas tu solicitud dentro del plazo de 15 minutos, será <strong>descartada automáticamente y NO se guardará en el sistema</strong>, liberando la habitación de inmediato.
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                onClick={() => descartarSolicitudNoConfirmada(r)}
                                title="Descartar solicitud y no guardarla en el sistema"
                              >
                                ✕ Descartar Solicitud (No Guardar)
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-gold"
                                onClick={() => {
                                  setConfirmarModalRes(r);
                                  setMontoGarantia(String(Math.round(r.totalFijo * 0.3)));
                                }}
                              >
                                ✓ Confirmar y Guardar Reserva
                              </button>
                            </div>
                          </div>
                        )}

                        {/* BARRA DE ACCIONES INFERIOR (DISPONIBLE PARA TODAS LAS RESERVAS) */}
                        <div
                          style={{
                            paddingTop: 12,
                            borderTop: '1px solid var(--line)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 10,
                          }}
                        >
                          <div style={{ fontSize: 12 }}>
                            {r.estado === 'Pendiente' || r.estado === 'Confirmada' ? (
                              reg8h.permitido ? (
                                <span style={{ color: '#15803d', fontWeight: 600 }}>
                                  ✓ Reprogramación disponible (faltan {reg8h.horasRestantes} horas para el Check-In — cumple con el mínimo de 8h de antelación)
                                </span>
                              ) : (
                                <span style={{ color: '#dc2626', fontWeight: 600 }}>
                                  ✕ Reprogramación bloqueada: Solo se permite reprogramar con mínimo 8 horas de antelación al Check-In (14:00 hrs).
                                </span>
                              )
                            ) : r.estado === 'En Curso' ? (
                              <span style={{ color: '#0284c7', fontWeight: 600 }}>
                                ● Huésped actualmente en estadía en la Habitación #{r.habitacionNumero}. Check-Out el {formatDateDMY(r.salida)} (12:00 hrs).
                              </span>
                            ) : r.estado === 'Finalizada' ? (
                              <span style={{ color: '#475569', fontWeight: 600 }}>
                                ✓ Estadía completada y liquidada en Hotel Aventura.
                              </span>
                            ) : (
                              <span style={{ color: '#64748b' }}>
                                Registro histórico de la reserva.
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => setDetalleModalRes(r)}
                            >
                              Ver Detalle Completo 📄
                            </button>

                            {(r.estado === 'Pendiente' || r.estado === 'Confirmada') && (
                              <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                disabled={!reg8h.permitido}
                                onClick={() => {
                                  setReprogModalRes(r);
                                  setNuevaEntradaReprog(r.entrada);
                                  setNuevaSalidaReprog(r.salida);
                                  setReprogError('');
                                }}
                              >
                                Reprogramar Fechas
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* =====================================================================
          MODAL DE AUTENTICACIÓN / REGISTRO OBLIGATORIO DE HUÉSPED
         ===================================================================== */}
      {modalAuthOpen && (
        <div className="modal-backdrop" onClick={() => setModalAuthOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>Identificación de Huésped</h3>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Acceso exclusivo para clientes de Hotel Aventura
                </span>
              </div>
              <button className="btn-close-modal" onClick={() => setModalAuthOpen(false)}>
                &times;
              </button>
            </div>

            <div className="subtabs-container" style={{ margin: '14px 20px 0 20px' }}>
              <button
                className={`subtab-btn ${authModalTab === 'login' ? 'active' : ''}`}
                onClick={() => setAuthModalTab('login')}
              >
                Ya soy Huésped / Iniciar Sesión
              </button>
              <button
                className={`subtab-btn ${authModalTab === 'registro' ? 'active' : ''}`}
                onClick={() => setAuthModalTab('registro')}
              >
                Nuevo Huésped / Registrarse
              </button>
            </div>

            {authModalTab === 'login' ? (
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                  Ingrese su documento de identidad (DNI o RUC) registrado previamente en el hotel para identificarse y continuar.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLoginPorDoc(docAuthInput);
                  }}
                  style={{ display: 'flex', gap: 10 }}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ingrese su DNI (8 dígitos) o RUC (11 dígitos)..."
                    value={docAuthInput}
                    onChange={(e) => setDocAuthInput(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    autoFocus
                  />
                  <button type="submit" className="btn btn-gold" style={{ whiteSpace: 'nowrap' }}>
                    Identificarme →
                  </button>
                </form>

                {authError && <div style={{ color: '#dc2626', fontSize: 12 }}>{authError}</div>}

                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>
                    O seleccione un perfil de huésped registrado (Acceso Rápido Demo):
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {clientes.slice(0, 6).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="btn btn-sm btn-secondary"
                        style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', padding: '8px 10px', height: 'auto' }}
                        onClick={() => handleLoginPorDoc(c.documento)}
                      >
                        <strong style={{ fontSize: 12, color: 'var(--ink)' }}>{c.nombre}</strong>
                        <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>
                          {c.tipoDoc}: {c.documento} · {c.telefono}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegistrarNuevoHuesped}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${tipoReg === 'NATURAL' ? 'btn-gold' : 'btn-secondary'}`}
                      onClick={() => {
                        setTipoReg('NATURAL');
                        setDocReg('');
                      }}
                    >
                      Persona Natural (DNI)
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${tipoReg === 'EMPRESA' ? 'btn-gold' : 'btn-secondary'}`}
                      onClick={() => {
                        setTipoReg('EMPRESA');
                        setDocReg('');
                      }}
                    >
                      Empresa (RUC)
                    </button>
                  </div>

                  <div className="form-grid">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <label className="field-label" style={{ margin: 0 }}>
                          {tipoReg === 'NATURAL' ? 'N° DNI (8 dígitos)' : 'N° RUC (11 dígitos)'} <span className="req">*</span>
                        </label>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          style={{ padding: '2px 8px', fontSize: 10.5 }}
                          onClick={handleAutocompletarRegistro}
                        >
                          Autocompletar
                        </button>
                      </div>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={tipoReg === 'NATURAL' ? 'Ej. 74125896' : 'Ej. 20547896321'}
                        value={docReg}
                        onChange={(e) => setDocReg(e.target.value.replace(/\D/g, '').slice(0, tipoReg === 'NATURAL' ? 8 : 11))}
                        required
                      />
                    </div>

                    <div>
                      <label className="field-label">Teléfono Celular <span className="req">*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="9 dígitos (Ej. 987654321)"
                        value={telReg}
                        onChange={(e) => setTelReg(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        required
                      />
                    </div>

                    <div className="form-col-full">
                      <label className="field-label">
                        {tipoReg === 'NATURAL' ? 'Nombres y Apellidos Completos' : 'Razón Social'} <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Ej. Valeria Montesinos Ríos"
                        value={nombreReg}
                        onChange={(e) => setNombreReg(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-col-full">
                      <label className="field-label">Correo Electrónico <span className="req">*</span></label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="cliente@correo.com"
                        value={emailReg}
                        onChange={(e) => setEmailReg(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {authError && <div style={{ color: '#dc2626', fontSize: 12 }}>{authError}</div>}
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalAuthOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-gold">
                    Registrarme e Iniciar Sesión →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: CONFIRMAR SOLICITUD DE RESERVA DEL CLIENTE
         ===================================================================== */}
      {confirmarModalRes && (
        <div className="modal-backdrop" onClick={() => setConfirmarModalRes(null)}>
          <div className="modal-dialog" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Solicitud — {confirmarModalRes.codigo}</h3>
              <button className="btn-close-modal" onClick={() => setConfirmarModalRes(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleConfirmarSolicitudCliente}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 13 }}>
                  <div>
                    <strong>Habitación:</strong> #{confirmarModalRes.habitacionNumero} ·{' '}
                    <strong>Total Estadía:</strong> {formatMoney(confirmarModalRes.totalFijo)}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    Al confirmar ahora, tu reserva pasa de <strong>Solicitud Pendiente</strong> a{' '}
                    <strong>Confirmada</strong>.
                  </div>
                </div>

                <div className="form-grid">
                  <div>
                    <label className="field-label">Abono de Garantía (S/)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={confirmarModalRes.totalFijo}
                      className="form-input"
                      value={montoGarantia}
                      onChange={(e) => setMontoGarantia(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">Medio de Pago</label>
                    <select
                      className="form-select"
                      value={metodoGarantia}
                      onChange={(e) =>
                        setMetodoGarantia(e.target.value as 'Yape/Plin' | 'Tarjeta' | 'Efectivo')
                      }
                    >
                      <option value="Yape/Plin">Yape / Plin</option>
                      <option value="Tarjeta">Tarjeta Visa / Mastercard</option>
                      <option value="Efectivo">Pago en Recepción</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setConfirmarModalRes(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-gold">
                  ✓ Confirmar Mi Reserva Ahora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: REPROGRAMAR FECHAS (CON REGLA DE >= 8 HORAS DE ANTELACIÓN)
         ===================================================================== */}
      {reprogModalRes && (
        <div className="modal-backdrop" onClick={() => setReprogModalRes(null)}>
          <div className="modal-dialog" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reprogramar Reserva — {reprogModalRes.codigo}</h3>
              <button className="btn-close-modal" onClick={() => setReprogModalRes(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleGuardarReprogramacion}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid var(--line)', fontSize: 12.5 }}>
                  <strong>Política de Reprogramación:</strong> Cumples con el requisito de más de 8 horas de antelación al Check-In. Elige tus nuevas fechas para la Habitación #{reprogModalRes.habitacionNumero}:
                </div>

                <div className="form-grid">
                  <div>
                    <label className="field-label">Nueva Fecha de Llegada</label>
                    <input
                      type="date"
                      className="form-input"
                      min={addDaysYMD(todayYMD, 1)}
                      value={nuevaEntradaReprog}
                      onChange={(e) => {
                        setNuevaEntradaReprog(e.target.value);
                        if (nuevaSalidaReprog <= e.target.value) {
                          setNuevaSalidaReprog(addDaysYMD(e.target.value, 1));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="field-label">Nueva Fecha de Salida</label>
                    <input
                      type="date"
                      className="form-input"
                      min={addDaysYMD(nuevaEntradaReprog, 1)}
                      value={nuevaSalidaReprog}
                      onChange={(e) => setNuevaSalidaReprog(e.target.value)}
                    />
                  </div>
                </div>

                {reprogError && <div style={{ color: '#dc2626', fontSize: 12 }}>{reprogError}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setReprogModalRes(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-gold">
                  Guardar Nueva Fecha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: DETALLE COMPLETO Y VOUCHER DE RESERVA DEL HUÉSPED
         ===================================================================== */}
      {detalleModalRes && (() => {
        const cuenta = calcularCuentaHabitacion(detalleModalRes.id);
        const hab = habitaciones.find((h) => h.numero === detalleModalRes.habitacionNumero);
        const cat = categorias.find((c) => c.id === hab?.categoriaId);
        const cliente = clientes.find((c) => c.id === detalleModalRes.clienteId) || clienteActualObj;
        const pagosRes = pagos.filter((p) => p.reservaId === detalleModalRes.id);
        const totalPagado = pagosRes.length > 0
          ? pagosRes.reduce((acc, p) => acc + p.monto, 0)
          : detalleModalRes.adelanto;
        const saldoPendiente = Math.max(0, detalleModalRes.totalFijo - totalPagado);

        return (
          <div className="modal-backdrop" onClick={() => setDetalleModalRes(null)}>
            <div className="modal-dialog" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h3 style={{ margin: 0, fontSize: 19, color: 'var(--wine-900)' }}>
                      Detalle de Reserva — {detalleModalRes.codigo}
                    </h3>
                    <span
                      className={`badge-status ${
                        detalleModalRes.estado === 'Confirmada' || detalleModalRes.estado === 'En Curso'
                          ? 'disponible'
                          : detalleModalRes.estado === 'Pendiente'
                          ? 'reservada'
                          : detalleModalRes.estado === 'Finalizada'
                          ? 'checkin'
                          : 'mantenimiento'
                      }`}
                    >
                      {detalleModalRes.estado}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    Hotel Aventura · Emitida el {detalleModalRes.creadoEl}
                  </span>
                </div>
                <button className="btn-close-modal" onClick={() => setDetalleModalRes(null)}>
                  &times;
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '72vh', overflowY: 'auto' }}>
                {/* SECCIÓN 1: DATOS DE LA ESTADÍA */}
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#16a34a', letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>
                    Habitación y Estadía
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, fontSize: 13 }}>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: 11, display: 'block' }}>Habitación Asignada:</span>
                      <strong>#{detalleModalRes.habitacionNumero} — {cat?.nombre || 'Categoría Confort'}</strong>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>Piso {hab?.piso || 1}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: 11, display: 'block' }}>Llegada (Check-In 14:00):</span>
                      <strong>{formatDateDMY(detalleModalRes.entrada)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: 11, display: 'block' }}>Salida (Check-Out 12:00):</span>
                      <strong>{formatDateDMY(detalleModalRes.salida)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: 11, display: 'block' }}>Capacidad / Huéspedes:</span>
                      <strong>{detalleModalRes.huespedes} persona(s)</strong>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 2: DATOS DEL HUÉSPED TITULAR */}
                <div style={{ background: '#f0fdf4', padding: 16, borderRadius: 10, border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#15803d', letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>
                    Huésped Titular Registrado
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, fontSize: 13 }}>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: 11, display: 'block' }}>Nombres / Razón Social:</span>
                      <strong>{cliente?.nombre || 'Huésped Registrado'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: 11, display: 'block' }}>Documento ({cliente?.tipoDoc || 'DNI'}):</span>
                      <strong>{cliente?.documento || detalleModalRes.clienteId}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: 11, display: 'block' }}>Teléfono Celular:</span>
                      <strong>{cliente?.telefono || '987654321'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: 11, display: 'block' }}>Email:</span>
                      <strong>{cliente?.email || 'cliente@hotelaventura.pe'}</strong>
                    </div>
                  </div>
                  {detalleModalRes.observaciones && (
                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed #86efac', fontSize: 12, color: '#166534' }}>
                      <strong>Observaciones / Solicitudes:</strong> {detalleModalRes.observaciones}
                    </div>
                  )}
                </div>

                {/* SECCIÓN 3: ESTADO FINANCIERO Y CUENTA */}
                <div style={{ background: '#fff', padding: 16, borderRadius: 10, border: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>
                    Liquidación y Desglose de Cuenta
                  </span>
                  <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tarifa por noche:</span>
                      <span>{formatMoney(detalleModalRes.tarifaBasePorNoche)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total Hospedaje:</span>
                      <span>{formatMoney(detalleModalRes.totalFijo)}</span>
                    </div>
                    {cuenta && cuenta.totalConsumos > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Consumos y Extras en Estadía:</span>
                        <span>{formatMoney(cuenta.totalConsumos)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--line)', fontWeight: 700, fontSize: 15 }}>
                      <span>Importe Total de la Reserva:</span>
                      <span style={{ color: 'var(--wine-900)' }}>{formatMoney(detalleModalRes.totalFijo)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d', fontWeight: 600 }}>
                      <span>Monto Abonado / Garantizado:</span>
                      <span>{formatMoney(totalPagado)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: saldoPendiente > 0 ? '#b45309' : '#15803d', fontWeight: 700, fontSize: 14 }}>
                      <span>Saldo Pendiente:</span>
                      <span>{saldoPendiente > 0 ? formatMoney(saldoPendiente) : 'S/ 0.00 (Liquidado / Pagado)'}</span>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 4: HISTORIAL DE PAGOS REGISTRADOS */}
                {pagosRes.length > 0 && (
                  <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid var(--line)' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>
                      Comprobantes de Pago Asociados ({pagosRes.length})
                    </span>
                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', color: 'var(--muted)', borderBottom: '1px solid var(--line)' }}>
                          <th style={{ padding: '4px 6px' }}>Fecha</th>
                          <th style={{ padding: '4px 6px' }}>Concepto</th>
                          <th style={{ padding: '4px 6px' }}>Medio</th>
                          <th style={{ padding: '4px 6px', textAlign: 'right' }}>Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagosRes.map((p) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '6px 6px' }}>{p.fecha}</td>
                            <td style={{ padding: '6px 6px' }}>{p.tipo}</td>
                            <td style={{ padding: '6px 6px' }}>{p.medio}</td>
                            <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 700, color: '#15803d' }}>
                              {formatMoney(p.monto)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => window.print()}
                  title="Imprimir comprobante oficial de reserva"
                >
                  🖨️ Imprimir Voucher
                </button>
                <button type="submit" className="btn btn-gold" onClick={() => setDetalleModalRes(null)}>
                  Cerrar Detalle
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* FOOTER PREMIUM DEL PORTAL CLIENTE HOTEL AVENTURA */}
      <footer
        style={{
          background: 'linear-gradient(180deg, #0b1120 0%, #060b14 100%)',
          color: '#e2e8f0',
          borderTop: '2px solid #16a34a',
          marginTop: 60,
          padding: '48px 24px 24px 24px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 36,
              paddingBottom: 36,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Columna 1: Marca y Propósito */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #16a34a, #0ea5e9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 16,
                    boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                  }}
                >
                  HA
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: 0.5, color: '#fff' }}>
                    HOTEL AVENTURA
                  </div>
                  <div style={{ fontSize: 11, color: '#86efac', letterSpacing: 1, textTransform: 'uppercase' }}>
                    PORTAL EXCLUSIVO DE HUÉSPEDES
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                Experiencias de confort, gastronomía y descanso de primer nivel. Reservas directas en línea garantizadas, gestión en tiempo real y atención personalizada 24/7.
              </p>
            </div>

            {/* Columna 2: Horarios y Políticas Clave */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                Políticas del Huésped
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#4ade80' }}>●</span>
                  <span><strong>Check-In Oficial:</strong> 14:00 hrs</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#38bdf8' }}>●</span>
                  <span><strong>Check-Out Oficial:</strong> 12:00 hrs</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#facc15' }}>●</span>
                  <span><strong>Reprogramación de Fechas:</strong> Mínimo 8 horas de antelación</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#f43f5e' }}>●</span>
                  <span><strong>Confirmación de Solicitud:</strong> Plazo de 15 minutos en línea</span>
                </li>
              </ul>
            </div>

            {/* Columna 3: Contacto y Ubicación */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                Contacto & Atención
              </h4>
              <div style={{ fontSize: 13, color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <strong style={{ color: '#fff', display: 'block' }}>Ubicación:</strong>
                  Av. Principal Aventura 1050, Miraflores, Lima - Perú
                </div>
                <div>
                  <strong style={{ color: '#fff', display: 'block' }}>Central Telefónica:</strong>
                  (01) 445-8900 · WhatsApp 24h: +51 987 654 321
                </div>
                <div>
                  <strong style={{ color: '#fff', display: 'block' }}>Correo de Reservas:</strong>
                  reservas@hotelaventura.pe
                </div>
              </div>
            </div>
          </div>

          {/* Barra Inferior de Copyright */}
          <div
            style={{
              paddingTop: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              fontSize: 12,
              color: '#64748b',
            }}
          >
            <div>
              © 2026 Hotel Aventura. Todos los derechos reservados.
            </div>
            <div style={{ display: 'flex', gap: 18 }}>
              <span>Términos y Condiciones</span>
              <span>·</span>
              <span>Privacidad de Datos</span>
              <span>·</span>
              <span>Libro de Reclamaciones</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
