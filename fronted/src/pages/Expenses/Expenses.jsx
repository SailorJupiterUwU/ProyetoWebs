import React, { useState } from 'react';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';
import Button from '../../components/comunes/Button/Button';
import LoadingSpinner from '../../components/comunes/LoadingSpinner/LoadingSpinner';
import useEgresos from '../../hooks/useEgresos';
import useProveedores from '../../hooks/useProveedores';
import useRubros from '../../hooks/useRubros';
import useReportes from '../../hooks/useReportes';
import { formatPrice, formatDate } from '../../utils/helpers';
import styles from './Expenses.module.css';

const Expenses = () => {
    const { data: expenses, total, page, setPage, limit, resumen, loading, error, applyFilters, crearEgreso, editarEgreso } = useEgresos();
    const { data: proveedores } = useProveedores();
    const { data: rubros } = useRubros();
    const { generarYDescargar, generating } = useReportes();

    const rubrosEgreso = rubros.filter((r) => r.tipo === 'EGRESO');

    const [filterDate, setFilterDate] = useState('');
    const [filterDoc, setFilterDoc] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);

    const [newProveedorId, setNewProveedorId] = useState('');
    const [newRubroId, setNewRubroId] = useState('');
    const [newFactura, setNewFactura] = useState('');
    const [newFecha, setNewFecha] = useState('');
    const [newValor, setNewValor] = useState('');
    const [newCheque, setNewCheque] = useState('');
    const [newAutoDebit, setNewAutoDebit] = useState(false);
    const [formError, setFormError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const applyTableFilters = () => {
        applyFilters({
            fecha: filterDate,
            num_factura: filterDoc,
            estado: filterStatus,
            monto_min: minAmount,
            monto_max: maxAmount,
        });
    };

    const clearFilters = () => {
        setFilterDate('');
        setFilterDoc('');
        setFilterStatus('');
        setMinAmount('');
        setMaxAmount('');
        applyFilters({});
    };

    const resetForm = () => {
        setNewProveedorId('');
        setNewRubroId('');
        setNewFactura('');
        setNewFecha('');
        setNewValor('');
        setNewCheque('');
        setNewAutoDebit(false);
        setFormError(null);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setSubmitting(true);
        const result = await crearEgreso({
            id_proveedor: Number(newProveedorId),
            id_rubro: Number(newRubroId),
            num_factura: newFactura,
            fecha_comprobante: newFecha,
            valor: parseFloat(newValor),
            num_cheque: newCheque || undefined,
            debito_automatico: newAutoDebit,
        });
        setSubmitting(false);

        if (result.success) {
            setShowAddModal(false);
            resetForm();
        } else {
            setFormError(result.error);
        }
    };

    const handleMarkAsPaid = async (row) => {
        await editarEgreso(row.id_egreso, { estado: 'Pagado' });
    };

    const handleDownloadReport = () => {
        const now = new Date();
        const fecha_inicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const fecha_fin = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        generarYDescargar('EGRESOS', fecha_inicio, fecha_fin);
    };

    return (
        <Layout>
            <div className={styles.container}>
                <PageHeader
                    breadcrumbs={['Finanzas', 'Egresos']}
                    title="Registro de Egresos"
                    subtitle="Gestión y control detallado de pagos, facturas y proveedores."
                    action={
                        <div className={styles.headerActions}>
                            <Button
                                variant="outline"
                                onClick={handleDownloadReport}
                                loading={generating}
                                icon="download"
                                iconPosition="left"
                            >
                                Reporte
                            </Button>
                            <Button variant="primary" onClick={() => setShowAddModal(true)} icon="add" iconPosition="left">
                                Nuevo Egreso
                            </Button>
                        </div>
                    }
                />

                {/* Summary Cards */}
                <div className={styles.cardsGrid}>
                    <div className={styles.card}>
                        <span className={styles.cardLabel}>Egresos del Mes</span>
                        <span className={styles.cardValue}>{formatPrice(resumen.egresos_del_mes)}</span>
                        <div className={styles.cardTrendUp}>
                            <span className="material-symbols-outlined">arrow_upward</span>
                            <span>{resumen.variacion_pct >= 0 ? '+' : ''}{resumen.variacion_pct}% vs mes anterior</span>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <span className={styles.cardLabel}>Pagos Pendientes</span>
                        <span className={styles.cardValue}>{formatPrice(resumen.pagos_pendientes)}</span>
                        <div className={styles.cardTrendWarn}>
                            <span className="material-symbols-outlined">warning</span>
                            <span>{resumen.facturas_por_vencer} facturas por vencer</span>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <span className={styles.cardLabel}>Presupuesto Restante</span>
                        <span className={styles.cardValue}>{formatPrice(resumen.presupuesto_restante)}</span>
                    </div>
                </div>

                {/* Data Table */}
                <div className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <h3 className={styles.tableTitle}>Historial de Transacciones</h3>

                        <div className={styles.filterBar}>
                            <div className={styles.filterGroup}>
                                <label className={styles.filterLabel}>Fecha</label>
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className={styles.filterInput}
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <label className={styles.filterLabel}>Nº Factura</label>
                                <input
                                    type="text"
                                    placeholder="Ej: FAC-000"
                                    value={filterDoc}
                                    onChange={(e) => setFilterDoc(e.target.value)}
                                    className={`${styles.filterInput} ${styles.filterInputSm}`}
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <label className={styles.filterLabel}>Estado</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className={styles.filterInput}
                                >
                                    <option value="">Todos</option>
                                    <option value="Pagado">Pagado</option>
                                    <option value="Pendiente">Pendiente</option>
                                </select>
                            </div>

                            <div className={styles.filterGroup}>
                                <label className={styles.filterLabel}>Rango de Montos ($)</label>
                                <div className={styles.rangeRow}>
                                    <input
                                        type="number"
                                        placeholder="Mín"
                                        value={minAmount}
                                        onChange={(e) => setMinAmount(e.target.value)}
                                        className={`${styles.filterInput} ${styles.filterInputXs}`}
                                    />
                                    <span>-</span>
                                    <input
                                        type="number"
                                        placeholder="Máx"
                                        value={maxAmount}
                                        onChange={(e) => setMaxAmount(e.target.value)}
                                        className={`${styles.filterInput} ${styles.filterInputXs}`}
                                    />
                                </div>
                            </div>

                            <button onClick={applyTableFilters} className={styles.applyButton}>
                                <span className="material-symbols-outlined">filter_alt</span>
                                <span>Aplicar Filtros</span>
                            </button>
                            <button onClick={clearFilters} className={styles.clearButton}>
                                <span className="material-symbols-outlined">close</span>
                                <span>Limpiar</span>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <div className={styles.errorAlert}>{error}</div>
                    ) : (
                        <>
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr className={styles.theadRow}>
                                            <th className={styles.th}>Fecha</th>
                                            <th className={styles.th}>Proveedor</th>
                                            <th className={styles.th}>Rubro</th>
                                            <th className={`${styles.th} ${styles.thRight}`}>Monto</th>
                                            <th className={styles.th}>Nº Factura</th>
                                            <th className={styles.th}>Débito Automático</th>
                                            <th className={`${styles.th} ${styles.thCenter}`}>Estado</th>
                                            <th className={`${styles.th} ${styles.thCenter}`}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className={styles.tbody}>
                                        {expenses.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className={styles.emptyCell}>
                                                    No se encontraron egresos con los filtros aplicados.
                                                </td>
                                            </tr>
                                        ) : (
                                            expenses.map((row, idx) => (
                                                <tr key={row.id_egreso} className={`${styles.row} ${idx % 2 === 1 ? styles.rowAlt : ''}`}>
                                                    <td className={styles.dateCell}>{formatDate(row.fecha_comprobante)}</td>
                                                    <td className={styles.providerCell}>{row.proveedor_nombre}</td>
                                                    <td>{row.rubro_nombre}</td>
                                                    <td className={styles.amountCell}>{formatPrice(row.valor)}</td>
                                                    <td className={styles.docCell}>{row.num_factura}</td>
                                                    <td>{row.debito_automatico ? 'Sí' : 'No'}</td>
                                                    <td className={styles.statusCellWrap}>
                                                        <span
                                                            className={`${styles.statusBadge} ${row.estado === 'Pagado' ? styles.statusPaid : styles.statusPending
                                                                }`}
                                                        >
                                                            {row.estado}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className={styles.actionsCell}>
                                                            <button
                                                                onClick={() => setSelectedDetail(row)}
                                                                className={styles.iconButton}
                                                                title="Ver Detalles"
                                                            >
                                                                <span className="material-symbols-outlined">visibility</span>
                                                            </button>
                                                            {row.estado === 'Pendiente' && (
                                                                <button
                                                                    onClick={() => handleMarkAsPaid(row)}
                                                                    className={styles.iconButton}
                                                                    title="Marcar como Pagado"
                                                                >
                                                                    <span className="material-symbols-outlined">check_circle</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className={styles.pagination}>
                                <span>
                                    Mostrando {expenses.length > 0 ? (page - 1) * limit + 1 : 0} a{' '}
                                    {(page - 1) * limit + expenses.length} de {total} registros
                                </span>
                                <div className={styles.pageButtons}>
                                    <button className={styles.pageButton} disabled={page <= 1} onClick={() => setPage(page - 1)}>
                                        Anterior
                                    </button>
                                    <span className={styles.pageIndicator}>
                                        Página {page} de {Math.max(1, Math.ceil(total / limit))}
                                    </span>
                                    <button
                                        className={styles.pageButton}
                                        disabled={page >= Math.ceil(total / limit)}
                                        onClick={() => setPage(page + 1)}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Add Expense Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Registrar Nuevo Egreso</h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetForm();
                                }}
                                className={styles.modalCloseButton}
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className={styles.form}>
                            {formError && <div className={styles.formErrorAlert}>{formError}</div>}

                            <div className={styles.formField}>
                                <label className={styles.formLabel}>Proveedor</label>
                                <select
                                    value={newProveedorId}
                                    onChange={(e) => setNewProveedorId(e.target.value)}
                                    className={styles.formInput}
                                    required
                                >
                                    <option value="">Selecciona un proveedor...</option>
                                    {proveedores.map((p) => (
                                        <option key={p.id_proveedor} value={p.id_proveedor}>
                                            {p.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formField}>
                                <label className={styles.formLabel}>Rubro</label>
                                <select
                                    value={newRubroId}
                                    onChange={(e) => setNewRubroId(e.target.value)}
                                    className={styles.formInput}
                                    required
                                >
                                    <option value="">Selecciona un rubro...</option>
                                    {rubrosEgreso.map((r) => (
                                        <option key={r.id_rubro} value={r.id_rubro}>
                                            {r.codigo} — {r.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGrid2}>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>Monto ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newValor}
                                        onChange={(e) => setNewValor(e.target.value)}
                                        className={styles.formInput}
                                        required
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>Nº Factura</label>
                                    <input
                                        type="text"
                                        placeholder="FAC-1029"
                                        value={newFactura}
                                        onChange={(e) => setNewFactura(e.target.value)}
                                        className={styles.formInput}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formGrid2}>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>Fecha del Comprobante</label>
                                    <input
                                        type="date"
                                        value={newFecha}
                                        onChange={(e) => setNewFecha(e.target.value)}
                                        className={styles.formInput}
                                        required
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>Nº Cheque (opcional)</label>
                                    <input
                                        type="text"
                                        value={newCheque}
                                        onChange={(e) => setNewCheque(e.target.value)}
                                        className={styles.formInput}
                                    />
                                </div>
                            </div>

                            <label className={styles.checkboxRow}>
                                <input
                                    type="checkbox"
                                    checked={newAutoDebit}
                                    onChange={(e) => setNewAutoDebit(e.target.checked)}
                                />
                                <span>Débito Automático</span>
                            </label>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                    className={styles.cancelButton}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.submitButton} disabled={submitting}>
                                    {submitting ? 'Guardando...' : 'Guardar Egreso'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedDetail && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modal} ${styles.modalSm}`}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Detalle del Egreso</h3>
                            <button onClick={() => setSelectedDetail(null)} className={styles.modalCloseButton}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className={styles.detailList}>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Proveedor:</span>
                                <span className={styles.detailValueBold}>{selectedDetail.proveedor_nombre}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Rubro:</span>
                                <span>{selectedDetail.rubro_nombre}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Monto:</span>
                                <span className={styles.detailValueLarge}>{formatPrice(selectedDetail.valor)}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Nº Factura:</span>
                                <span className={styles.detailMono}>{selectedDetail.num_factura}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Estado:</span>
                                <span
                                    className={`${styles.statusBadge} ${selectedDetail.estado === 'Pagado' ? styles.statusPaid : styles.statusPending
                                        }`}
                                >
                                    {selectedDetail.estado}
                                </span>
                            </div>
                        </div>
                        <div className={styles.detailFooter}>
                            <button onClick={() => setSelectedDetail(null)} className={styles.closeButton}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Expenses;