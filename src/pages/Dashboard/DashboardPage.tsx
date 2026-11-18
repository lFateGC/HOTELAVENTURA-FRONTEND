/**
 * MÓDULO 2: Dashboard y Reportes Gerenciales (Exclusivo Dueño / Admin)
 * Responsable: Erik Barrera (Rama: Erik)
 */
import React, { useState } from 'react';
import { useHotel, formatMoney, addDaysYMD } from '../../context/HotelContext';

export const DashboardPage: React.FC = () => {
  const {
    todayYMD,
    habitaciones,
    reservas,
    categorias,
    comprobantes,
    compras,
    cajaActual,
    logAuditoria,
  } = useHotel();

  const [periodo, setPeriodo] = useState<'trimestre' | 'mes3' | 'mes2' | 'mes1'>('trimestre');

  // Rango de fechas según el período seleccionado (basado en los 3 meses reales en BD)
  const hace30 = addDaysYMD(todayYMD, -30);
  const hace60 = addDaysYMD(todayYMD, -60);
  const hace90 = addDaysYMD(todayYMD, -90);
  const futuro30 = addDaysYMD(todayYMD, 30);

  let fechaInicio = hace90;
  let fechaFin = futuro30;
  let diasPeriodo = 90;

  if (periodo === 'mes3') {
    fechaInicio = hace30;
    fechaFin = futuro30;
    diasPeriodo = 30;
  } else if (periodo === 'mes2') {
    fechaInicio = hace60;
    fechaFin = hace30;
    diasPeriodo = 30;
  } else if (periodo === 'mes1') {
    fechaInicio = hace90;
    fechaFin = hace60;
    diasPeriodo = 30;
  }

  const reservasPeriodo = reservas.filter(
    (r) =>
      r.estado !== 'Cancelada' &&
      r.estado !== 'No Presentada' &&
      r.entrada >= fechaInicio &&
      r.entrada <= fechaFin
  );

  const habitacionesActivas = Math.max(1, habitaciones.length);
  const nochesDisponibles = habitacionesActivas * diasPeriodo;

  const nochesOcupadas = reservasPeriodo.reduce((sum, r) => {
    const [y1, m1, d1] = r.entrada.split('-').map(Number);
    const [y2, m2, d2] = r.salida.split('-').map(Number);
    const diff = new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime();
    const noches = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    return sum + noches;
  }, 0);

  const porcentajeOcupacion = Math.min(
    100,
    Number(((nochesOcupadas / nochesDisponibles) * 100).toFixed(1))
  );

  const comprobantesVigentes = comprobantes.filter((c) => {
    if (c.estado !== 'Emitido') return false;
    const fStr = c.fecha.substring(0, 10);
    return fStr >= fechaInicio && fStr <= fechaFin;
  });

  const totalIngresos = comprobantesVigentes.reduce((sum, c) => sum + c.total, 0);
  const subtotalIngresos = comprobantesVigentes.reduce((sum, c) => sum + c.subtotal, 0);
  const igvTotal = comprobantesVigentes.reduce((sum, c) => sum + c.igv, 0);

  const boletasTotal = comprobantesVigentes
    .filter((c) => c.tipo === 'Boleta')
    .reduce((sum, c) => sum + c.total, 0);
  const facturasTotal = comprobantesVigentes
    .filter((c) => c.tipo === 'Factura')
    .reduce((sum, c) => sum + c.total, 0);

  const totalComprasPeriodo = compras
    .filter((co) => {
      const f = co.fecha.substring(0, 10);
      return f >= fechaInicio && f <= fechaFin;
    })
    .reduce((sum, co) => sum + co.total, 0);

  // Comparativo real de los 3 meses para la tabla y barras comparativas
  const calcMesStats = (ini: string, fin: string, label: string) => {
    const resM = reservas.filter(
      (r) => r.estado !== 'Cancelada' && r.entrada >= ini && r.entrada < fin
    );
    const compM = comprobantes.filter(
      (c) => c.estado === 'Emitido' && c.fecha.substring(0, 10) >= ini && c.fecha.substring(0, 10) < fin
    );
    const ingresosM = compM.reduce((s, c) => s + c.total, 0);
    return {
      label,
      reservasCount: resM.length,
      comprobantesCount: compM.length,
      ingresos: ingresosM,
    };
  };

  const comparativoTrimestral = [
    calcMesStats(hace90, hace60, 'Mes 1 (Hace 60 - 90 días)'),
    calcMesStats(hace60, hace30, 'Mes 2 (Hace 30 - 60 días)'),
    calcMesStats(hace30, futuro30, 'Mes 3 (Últimos 30 días + Actual)'),
  ];
  const maxIngresoMes = Math.max(1, ...comparativoTrimestral.map((m) => m.ingresos));

  let cajaDisplay = 'Caja Cerrada';
  let cajaSub = 'Requiere apertura de turno';
  if (cajaActual && cajaActual.estado === 'Abierta') {
    const ingresosEfectivo = cajaActual.movimientos
      .filter((m) => m.medio === 'Efectivo' && m.tipo === 'Ingreso')
      .reduce((sum, m) => sum + m.monto, 0);
    cajaDisplay = formatMoney(ingresosEfectivo);
    cajaSub = `Turno ${cajaActual.turno} (Apertura: ${formatMoney(cajaActual.montoInicial)})`;
  }

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Reportes y Estadísticas Trimestrales</h1>
        <p className="view-subtitle">
          Análisis real de los últimos 3 meses de operación hotelera, facturación B001/F001 y ocupación por categoría
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--wine-900)' }}>
            Período Analizado:
          </label>
          <select
            className="select-role"
            value={periodo}
            onChange={(e) =>
              setPeriodo(e.target.value as 'trimestre' | 'mes3' | 'mes2' | 'mes1')
            }
          >
            <option value="trimestre"> Consolidado Trimestral (Últimos 3 Meses)</option>
            <option value="mes3">Mes 3 — Últimos 30 Días (Actual)</option>
            <option value="mes2">Mes 2 — Hace 30 a 60 Días</option>
            <option value="mes1">Mes 1 — Hace 60 a 90 Días</option>
          </select>
        </div>
        <button
          className="btn btn-gold"
          onClick={() => {
            logAuditoria('Reportes', 'Exportación a PDF', 'Reporte gerencial trimestral exportado.');
            window.print();
          }}
        >
          Imprimir Reporte Gerencial
        </button>
      </div>

      {/* BLOQUE 1: OCUPACIÓN HOTELERA */}
      <div className="table-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--wine-900)', marginBottom: 16 }}>
          1. Indicadores de Ocupación Hotelera ({reservasPeriodo.length} reservas efectivas)
        </h3>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-info">
              <h4>Noches Ocupadas</h4>
              <div className="kpi-number">{nochesOcupadas}</div>
              <div className="kpi-desc">En el período seleccionado</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-info">
              <h4>Capacidad Instalada</h4>
              <div className="kpi-number">{nochesDisponibles}</div>
              <div className="kpi-desc">
                {habitacionesActivas} habitaciones × {diasPeriodo} días
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-info">
              <h4>Tasa de Ocupación</h4>
              <div className="kpi-number" style={{ color: 'var(--wine-700)' }}>
                {porcentajeOcupacion}%
              </div>
              <div className="kpi-desc">Rendimiento operativo real</div>
            </div>
          </div>
        </div>

        <h4 style={{ fontSize: 14, color: 'var(--wine-900)', margin: '18px 0 10px' }}>
          Ocupación Actual en Vivo por Categoría de Habitación:
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {categorias.map((cat) => {
            const habsCatList = habitaciones.filter((h) => h.categoriaId === cat.id);
            const habsCat = habsCatList.length;
            const ocupadasCat = habsCatList.filter(
              (h) => h.estado === 'Ocupada' || h.estado === 'Reservada'
            ).length;
            const pct = habsCat > 0 ? Math.round((ocupadasCat / habsCat) * 100) : 0;
            return (
              <div key={cat.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>
                    <strong>{cat.nombre}</strong> ({ocupadasCat} de {habsCat} cuartos ocupados/reservados · Tarifa:{' '}
                    {formatMoney(cat.tarifaBase)})
                  </span>
                  <strong>{pct}% ocupación hoy</strong>
                </div>
                <div style={{ height: 8, background: 'var(--cream)', borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, var(--gold), var(--wine-700))',
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BLOQUE 2: RESUMEN FINANCIERO E INGRESOS */}
      <div className="table-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--wine-900)', marginBottom: 16 }}>
          2. Resumen Financiero y Facturación ({comprobantesVigentes.length} comprobantes emitidos)
        </h3>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-info">
              <h4>Total Facturado</h4>
              <div className="kpi-number" style={{ color: 'var(--status-disponible)' }}>
                {formatMoney(totalIngresos)}
              </div>
              <div className="kpi-desc">Comprobantes vigentes del período</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-info">
              <h4>Valor Venta (Sin IGV)</h4>
              <div className="kpi-number">{formatMoney(subtotalIngresos)}</div>
              <div className="kpi-desc">Base imponible neta</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-info">
              <h4>IGV Recaudado (18%)</h4>
              <div className="kpi-number">{formatMoney(igvTotal)}</div>
              <div className="kpi-desc">Impuesto General a las Ventas</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-info">
              <h4>Efectivo en Turno Hoy</h4>
              <div className="kpi-number" style={{ color: 'var(--gold-dark)' }}>
                {cajaDisplay}
              </div>
              <div className="kpi-desc">{cajaSub}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 16 }}>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid var(--line)' }}>
            <h5 style={{ color: 'var(--wine-900)', marginBottom: 6 }}>Boletas de Venta (Serie B001)</h5>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--wine-700)' }}>{formatMoney(boletasTotal)}</div>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Huéspedes Personas Naturales</span>
          </div>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid var(--line)' }}>
            <h5 style={{ color: 'var(--wine-900)', marginBottom: 6 }}>Facturas Electrónicas (Serie F001)</h5>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--wine-700)' }}>{formatMoney(facturasTotal)}</div>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Convenios y Empresas con RUC</span>
          </div>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid var(--line)' }}>
            <h5 style={{ color: 'var(--wine-900)', marginBottom: 6 }}>Compras de Reposición Almacén</h5>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0284c7' }}>{formatMoney(totalComprasPeriodo)}</div>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Abastecimiento de Minibar e Insumos</span>
          </div>
        </div>
      </div>

      {/* BLOQUE 3: EVOLUCIÓN COMPARATIVA DE LOS 3 MESES */}
      <div className="table-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--wine-900)', marginBottom: 16 }}>
          3. Evolución Trimestral (Comparativo de los Últimos 3 Meses)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {comparativoTrimestral.map((m, idx) => {
            const pctWidth = Math.round((m.ingresos / maxIngresoMes) * 100);
            return (
              <div
                key={idx}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid var(--line)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <strong style={{ fontSize: 13.5, color: 'var(--ink)' }}>{m.label}</strong>
                    <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 10 }}>
                      {m.reservasCount} reservas · {m.comprobantesCount} comprobantes emitidos
                    </span>
                  </div>
                  <strong style={{ fontSize: 15, color: 'var(--wine-800)' }}>
                    {formatMoney(m.ingresos)}
                  </strong>
                </div>
                <div style={{ height: 10, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pctWidth}%`,
                      background: 'linear-gradient(90deg, #16a34a, #0284c7)',
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
