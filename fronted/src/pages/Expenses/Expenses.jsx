import React, { useState } from 'react';
import styles from './Expenses.module.css';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);

    const onAddExpense = (newExpense) => {
        setExpenses((prev) => [newExpense, ...prev]);
    };

    const [filterDate, setFilterDate] = useState('');
    const [filterDoc, setFilterDoc] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);

    const [newProvider, setNewProvider] = useState('');
    const [newConcept, setNewConcept] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newDocNumber, setNewDocNumber] = useState('');
    const [newAutoDebit, setNewAutoDebit] = useState('No');
    const [newStatus, setNewStatus] = useState('Pagado');

    const filteredExpenses = expenses.filter((item) => {
        if (filterDate && !item.date.includes(filterDate)) return false;
        if (filterDoc && !item.docNumber.toLowerCase().includes(filterDoc.toLowerCase())) return false;
        if (filterStatus && item.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
        if (minAmount && item.amount < Number(minAmount)) return false;
        if (maxAmount && item.amount > Number(maxAmount)) return false;
        return true;
    });

    const totalMonthlyExpenses = expenses
        .filter((e) => e.status === 'Pagado')
        .reduce((sum, e) => sum + e.amount, 0);

    const totalPendingExpenses = expenses
        .filter((e) => e.status === 'Pendiente')
        .reduce((sum, e) => sum + e.amount, 0);

    const pendingCount = expenses.filter((e) => e.status === 'Pendiente').length;

    const handleAddSubmit = (e) => {
        e.preventDefault();
        const newItem = {
            id: 'e' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            provider: newProvider || 'Proveedor Genérico',
            concept: newConcept || 'Gasto Operativo',
            amount: parseFloat(newAmount) || 100.0,
            docNumber: newDocNumber || `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
            autoDebit: newAutoDebit,
            status: newStatus,
        };
        onAddExpense(newItem);
        setShowAddModal(false);
        setNewProvider('');
        setNewConcept('');
        setNewAmount('');
        setNewDocNumber('');
    };

    return (
        <Layout>
            <div className={styles.container}>
                {/* Page Header */}
                <PageHeader
                    breadcrumbs={['Finanzas', 'Egresos']}
                    title="Registro de Egresos"
                    subtitle="Gestión y control detallado de pagos, facturas y proveedores."
                    action={
                        <button onClick={() => setShowAddModal(true)} className={styles.addButton}>
                            <span className="material-symbols-outlined">add</span>
                            <span>Nuevo Egreso</span>
                        </button>
                    }
                />

                {/* Summary Cards */}
                <div className={styles.cardsGrid}>
                    <div className={styles.card}>
                        <span className={styles.cardLabel}>Egresos del Mes</span>
                        <span className={styles.cardValue}>
                            ${totalMonthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <div className={styles.cardTrendUp}>
                            <span className="material-symbols-outlined">arrow_upward</span>
                            <span>+12% vs mes anterior</span>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <span className={styles.cardLabel}>Pagos Pendientes</span>
                        <span className={styles.cardValue}>
                            ${totalPendingExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <div className={styles.cardTrendWarn}>
                            <span className="material-symbols-outlined">warning</span>
                            <span>{pendingCount} facturas por vencer</span>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <span className={styles.cardLabel}>Presupuesto Restante</span>
                        <span className={styles.cardValue}>$4,300.00</span>
                        <div className={styles.progressTrack}>
                            <div className={styles.progressFill} style={{ width: '65%' }} />
                        </div>
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
                                    <option value="pagado">Pagado</option>
                                    <option value="pendiente">Pendiente</option>
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

                            <button
                                onClick={() => {
                                    setFilterDate('');
                                    setFilterDoc('');
                                    setFilterStatus('');
                                    setMinAmount('');
                                    setMaxAmount('');
                                }}
                                className={styles.clearButton}
                            >
                                <span className="material-symbols-outlined">filter_alt</span>
                                <span>Aplicar Filtros</span>
                            </button>
                        </div>
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr className={styles.theadRow}>
                                    <th className={styles.th}>Fecha</th>
                                    <th className={styles.th}>Proveedor</th>
                                    <th className={styles.th}>Concepto</th>
                                    <th className={`${styles.th} ${styles.thRight}`}>Monto</th>
                                    <th className={styles.th}>Nº Documento</th>
                                    <th className={styles.th}>Débito Automático</th>
                                    <th className={`${styles.th} ${styles.thCenter}`}>Estado</th>
                                    <th className={`${styles.th} ${styles.thCenter}`}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {filteredExpenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className={styles.emptyCell}>
                                            No se encontraron egresos con los filtros aplicados.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredExpenses.map((row, idx) => (
                                        <tr
                                            key={row.id}
                                            className={`${styles.row} ${idx % 2 === 1 ? styles.rowAlt : ''}`}
                                        >
                                            <td className={styles.dateCell}>{row.date}</td>
                                            <td className={styles.providerCell}>{row.provider}</td>
                                            <td>{row.concept}</td>
                                            <td className={styles.amountCell}>${row.amount.toFixed(2)}</td>
                                            <td className={styles.docCell}>{row.docNumber}</td>
                                            <td>{row.autoDebit}</td>
                                            <td className={styles.statusCellWrap}>
                                                <span
                                                    className={`${styles.statusBadge} ${row.status === 'Pagado' ? styles.statusPaid : styles.statusPending
                                                        }`}
                                                >
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.actionsCell}>
                                                    <button className={styles.iconButton} title="Editar">
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedDetail(row)}
                                                        className={styles.iconButton}
                                                        title="Ver Detalles"
                                                    >
                                                        <span className="material-symbols-outlined">visibility</span>
                                                    </button>
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
                            Mostrando 1 a {filteredExpenses.length} de {expenses.length} registros
                        </span>
                        <div className={styles.pageButtons}>
                            <button className={styles.pageButton} disabled>Anterior</button>
                            <button className={`${styles.pageButton} ${styles.pageButtonActive}`}>1</button>
                            <button className={styles.pageButton}>2</button>
                            <button className={styles.pageButton}>3</button>
                            <button className={styles.pageButton}>Siguiente</button>
                        </div>
                    </div>
                </div>

                {/* Add Expense Modal */}
                {showAddModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Registrar Nuevo Egreso</h3>
                                <button onClick={() => setShowAddModal(false)} className={styles.modalCloseButton}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleAddSubmit} className={styles.form}>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>Proveedor</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Empresa Eléctrica"
                                        value={newProvider}
                                        onChange={(e) => setNewProvider(e.target.value)}
                                        className={styles.formInput}
                                        required
                                    />
                                </div>

                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>Concepto</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Mantenimiento de Áreas Verdes"
                                        value={newConcept}
                                        onChange={(e) => setNewConcept(e.target.value)}
                                        className={styles.formInput}
                                        required
                                    />
                                </div>

                                <div className={styles.formGrid2}>
                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}>Monto ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="120.00"
                                            value={newAmount}
                                            onChange={(e) => setNewAmount(e.target.value)}
                                            className={styles.formInput}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}>Nº Documento/Factura</label>
                                        <input
                                            type="text"
                                            placeholder="FAC-1029"
                                            value={newDocNumber}
                                            onChange={(e) => setNewDocNumber(e.target.value)}
                                            className={styles.formInput}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGrid2}>
                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}>Débito Automático</label>
                                        <select
                                            value={newAutoDebit}
                                            onChange={(e) => setNewAutoDebit(e.target.value)}
                                            className={styles.formInput}
                                        >
                                            <option value="No">No</option>
                                            <option value="Sí">Sí</option>
                                        </select>
                                    </div>
                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}>Estado</label>
                                        <select
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                            className={styles.formInput}
                                        >
                                            <option value="Pagado">Pagado</option>
                                            <option value="Pendiente">Pendiente</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formActions}>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className={styles.cancelButton}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className={styles.submitButton}>
                                        Guardar Egreso
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
                                    <span className={styles.detailValueBold}>{selectedDetail.provider}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Concepto:</span>
                                    <span>{selectedDetail.concept}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Monto:</span>
                                    <span className={styles.detailValueLarge}>${selectedDetail.amount.toFixed(2)}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Nº Documento:</span>
                                    <span className={styles.detailMono}>{selectedDetail.docNumber}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Estado:</span>
                                    <span
                                        className={`${styles.statusBadge} ${selectedDetail.status === 'Pagado' ? styles.statusPaid : styles.statusPending
                                            }`}
                                    >
                                        {selectedDetail.status}
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
            </div>
        </Layout>
    );
};

export default Expenses;