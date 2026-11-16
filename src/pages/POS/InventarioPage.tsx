/**
 * MÓDULO 5: Inventario, Logística, Proveedores y Compras de Insumos
 * Responsable: Eliseo Mariño (Rama: Eliseo)
 */
import React, { useState } from 'react';
import { useHotel, formatMoney, formatTimeNow } from '../../context/HotelContext';

export const InventarioPage: React.FC = () => {
  const {
    todayYMD,
    currentUser,
    productos,
    setProductos,
    proveedores,
    setProveedores,
    compras,
    setCompras,
    logAuditoria,
    showToast,
  } = useHotel();

  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [showProdModal, setShowProdModal] = useState(false);
  const [prodNom, setProdNom] = useState('');
  const [prodCat, setProdCat] = useState('Minibar');
  const [prodPrecio, setProdPrecio] = useState('10.00');
  const [prodStock, setProdStock] = useState('10');
  const [prodMin, setProdMin] = useState('5');
  const [prodErr, setProdErr] = useState('');

  const [showProvModal, setShowProvModal] = useState(false);
  const [provRuc, setProvRuc] = useState('');
  const [provRazon, setProvRazon] = useState('');
  const [provTel, setProvTel] = useState('');
  const [provRubro, setProvRubro] = useState('Bebidas y Minibar');
  const [provErr, setProvErr] = useState('');

  const [showCompraModal, setShowCompraModal] = useState(false);
  const [compProvId, setCompProvId] = useState(proveedores[0]?.id || 1);
  const [compProdId, setCompProdId] = useState(productos[0]?.id || 1);
  const [compCant, setCompCant] = useState('12');
  const [compCosto, setCompCosto] = useState('3.50');
  const [compErr, setCompErr] = useState('');

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase().trim())
  );

  const handleCrearProducto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNom.trim()) {
      setProdErr('El nombre del producto es obligatorio');
      return;
    }
    const nuevo = {
      id: productos.length + 1,
      nombre: prodNom.trim(),
      categoria: prodCat,
      precio: Number(prodPrecio) || 0,
      stock: Number(prodStock) || 0,
      stockMinimo: Number(prodMin) || 5,
    };
    setProductos((prev) => [...prev, nuevo]);
    logAuditoria('Inventario', 'Nuevo Producto', `Registrado producto "${nuevo.nombre}" (${nuevo.stock} u.).`);
    showToast('Producto registrado en catálogo', 'success');
    setShowProdModal(false);
    setProdNom('');
    setProdErr('');
  };

  const handleCrearProveedor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^(10|20)\d{9}$/.test(provRuc.trim())) {
      setProvErr('El RUC debe tener 11 dígitos numéricos y empezar con 10 o 20');
      return;
    }
    if (!provRazon.trim()) {
      setProvErr('La Razón Social es obligatoria');
      return;
    }
    const nuevo = {
      id: proveedores.length + 1,
      ruc: provRuc.trim(),
      razonSocial: provRazon.trim(),
      telefono: provTel.trim() || '014000000',
      rubro: provRubro,
    };
    setProveedores((prev) => [...prev, nuevo]);
    logAuditoria('Inventario', 'Nuevo Proveedor', `Registrado proveedor ${nuevo.razonSocial} (RUC ${nuevo.ruc}).`);
    showToast('Proveedor corporativo registrado', 'success');
    setShowProvModal(false);
    setProvRuc('');
    setProvRazon('');
    setProvErr('');
  };

  const handleRegistrarCompra = (e: React.FormEvent) => {
    e.preventDefault();
    const cant = Number(compCant);
    const costo = Number(compCosto);
    if (cant < 1 || costo <= 0) {
      setCompErr('Cantidad y costo unitario deben ser mayores a 0');
      return;
    }

    const total = Number((cant * costo).toFixed(2));
    const prod = productos.find((p) => p.id === Number(compProdId));

    setProductos((prev) =>
      prev.map((p) => (p.id === Number(compProdId) ? { ...p, stock: p.stock + cant } : p))
    );
    setCompras((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        proveedorId: Number(compProvId),
        productoId: Number(compProdId),
        cantidad: cant,
        costoUnitario: costo,
        total,
        fecha: `${todayYMD} ${formatTimeNow()}`,
        usuario: currentUser.usuario,
      },
    ]);
    logAuditoria(
      'Inventario',
      'Compra de Insumos',
      `Comprados ${cant} u. de ${prod?.nombre || 'Insumo'} por total ${formatMoney(total)}.`
    );
    showToast('Compra registrada y stock actualizado en almacén', 'success');
    setShowCompraModal(false);
    setCompErr('');
  };

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Inventario y Logística</h1>
        <p className="view-subtitle">Control de stock de minibar, amenidades, proveedores y compras de insumos</p>
      </div>

      <div className="filters-toolbar">
        <div className="search-box-wrapper">
          <input
            type="text"
            placeholder="Buscar por nombre de producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ paddingLeft: 16 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setShowProvModal(true)}>
            Nuevo Proveedor
          </button>
          <button className="btn btn-secondary" onClick={() => setShowCompraModal(true)}>
            Registrar Compra
          </button>
          <button className="btn btn-gold" onClick={() => setShowProdModal(true)}>
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="table-card" style={{ marginBottom: 24 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, color: 'var(--wine-900)' }}>
          Catálogo de Productos de Almacén y Minibar
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio Venta</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Estado de Stock</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((p) => {
                let badgeClass = 'disponible';
                let badgeText = 'Normal';
                if (p.stock === 0) {
                  badgeClass = 'ocupada';
                  badgeText = 'Agotado';
                } else if (p.stock <= p.stockMinimo) {
                  badgeClass = 'reservada';
                  badgeText = 'Stock Bajo';
                }

                return (
                  <tr key={p.id}>
                    <td><strong>{p.nombre}</strong></td>
                    <td>{p.categoria}</td>
                    <td>{formatMoney(p.precio)}</td>
                    <td><strong>{p.stock}</strong> u.</td>
                    <td>{p.stockMinimo} u.</td>
                    <td>
                      <span className={`badge-status ${badgeClass}`}>{badgeText}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, color: 'var(--wine-900)' }}>
          Historial de Compras de Insumos
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Costo Unit.</th>
                <th>Total Compra</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((c) => {
                const prov = proveedores.find((p) => p.id === c.proveedorId);
                const prod = productos.find((p) => p.id === c.productoId);
                return (
                  <tr key={c.id}>
                    <td>{c.fecha}</td>
                    <td>{prov?.razonSocial || '-'}</td>
                    <td>{prod?.nombre || '-'}</td>
                    <td><strong>{c.cantidad}</strong> u.</td>
                    <td>{formatMoney(c.costoUnitario)}</td>
                    <td><strong>{formatMoney(c.total)}</strong></td>
                    <td>{c.usuario}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NUEVO PRODUCTO */}
      {showProdModal && (
        <div className="modal-backdrop" onClick={() => setShowProdModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registrar Producto en Almacén</h3>
              <button className="btn-close-modal" onClick={() => setShowProdModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCrearProducto}>
              <div className="modal-body">
                {prodErr && <small className="field-msg-error">{prodErr}</small>}
                <div className="form-grid">
                  <div className="form-col-full">
                    <label className="field-label">Nombre del Producto <span className="req">*</span></label>
                    <input type="text" className="form-input" value={prodNom} onChange={(e) => setProdNom(e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Categoría</label>
                    <select className="form-select" value={prodCat} onChange={(e) => setProdCat(e.target.value)}>
                      <option value="Minibar">Minibar</option>
                      <option value="Amenidades">Amenidades</option>
                      <option value="Blancos">Blancos / Toallas</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Precio Venta (S/)</label>
                    <input type="number" step="0.1" className="form-input" value={prodPrecio} onChange={(e) => setProdPrecio(e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Stock Inicial</label>
                    <input type="number" className="form-input" value={prodStock} onChange={(e) => setProdStock(e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Stock Mínimo (Alerta)</label>
                    <input type="number" className="form-input" value={prodMin} onChange={(e) => setProdMin(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProdModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVO PROVEEDOR */}
      {showProvModal && (
        <div className="modal-backdrop" onClick={() => setShowProvModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registrar Proveedor (RUC)</h3>
              <button className="btn-close-modal" onClick={() => setShowProvModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCrearProveedor}>
              <div className="modal-body">
                {provErr && <small className="field-msg-error">{provErr}</small>}
                <div className="form-grid">
                  <div>
                    <label className="field-label">RUC (11 dígitos) <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={provRuc}
                      onChange={(e) => setProvRuc(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    />
                  </div>
                  <div>
                    <label className="field-label">Teléfono</label>
                    <input
                      type="text"
                      className="form-input"
                      value={provTel}
                      onChange={(e) => setProvTel(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    />
                  </div>
                  <div className="form-col-full">
                    <label className="field-label">Razón Social <span className="req">*</span></label>
                    <input type="text" className="form-input" value={provRazon} onChange={(e) => setProvRazon(e.target.value)} />
                  </div>
                  <div className="form-col-full">
                    <label className="field-label">Rubro</label>
                    <input type="text" className="form-input" value={provRubro} onChange={(e) => setProvRubro(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProvModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Guardar Proveedor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR COMPRA */}
      {showCompraModal && (
        <div className="modal-backdrop" onClick={() => setShowCompraModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registrar Compra de Insumos</h3>
              <button className="btn-close-modal" onClick={() => setShowCompraModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleRegistrarCompra}>
              <div className="modal-body">
                {compErr && <small className="field-msg-error">{compErr}</small>}
                <div className="form-grid">
                  <div className="form-col-full">
                    <label className="field-label">Proveedor <span className="req">*</span></label>
                    <select className="form-select" value={compProvId} onChange={(e) => setCompProvId(Number(e.target.value))}>
                      {proveedores.map((p) => (
                        <option key={p.id} value={p.id}>{p.razonSocial} (RUC: {p.ruc})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-col-full">
                    <label className="field-label">Producto a Reponer <span className="req">*</span></label>
                    <select className="form-select" value={compProdId} onChange={(e) => setCompProdId(Number(e.target.value))}>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre} (Stock actual: {p.stock})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Cantidad Comprada <span className="req">*</span></label>
                    <input type="number" className="form-input" min={1} value={compCant} onChange={(e) => setCompCant(e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Costo Unitario (S/) <span className="req">*</span></label>
                    <input type="number" step="0.01" className="form-input" value={compCosto} onChange={(e) => setCompCosto(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompraModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Registrar Compra</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
