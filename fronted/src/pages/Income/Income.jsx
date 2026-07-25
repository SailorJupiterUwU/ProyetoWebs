import React, { useState } from 'react';
import styles from './Income.module.css';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';

const Income = () => {
    const [incomes, setIncomes] = useState([]);

    const onAddIncome = (newIncome) => {
        setIncomes((prev) => [newIncome, ...prev]);
    };

    const [showAddModal, setShowAddModal] = useState(false);
    const [downloadingReport, setDownloadingReport] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);

    const [house, setHouse] = useState('');
    const [resident, setResident] = useState('');
    const [concept, setConcept] = useState('Cuota Mantenimiento');
    const [amount, setAmount] = useState('80.00');
    const [docNumber, setDocNumber] = useState('');

    const handleAddSubmit = (e) => {
        e.preventDefault();
        const newIncome = {
            id: 'i' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            houseNumber: house || 'A-01',
            resident: resident || 'Residente Habitacional',
            concept: concept,
            amount: parseFloat(amount) || 80.0,
            docNumber: docNumber || `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
            status: 'Pagado',
        };
        onAddIncome(newIncome);
        setShowAddModal(false);
        setHouse('');
        setResident('');
        setDocNumber('');
    };

    const triggerPDFDownload = () => {
        setDownloadingReport(true);
        setTimeout(() => {
            setDownloadingReport(false);
            setReportSuccess(true);
            setTimeout(() => setReportSuccess(false), 4000);
        }, 1500);
    };

    return (
        <Layout>
            <div className={styles.container}>
                {/* Header Actions */}
                <PageHeader
                    breadcrumbs={['Finanzas', 'Ingresos']}
                    title="Registro de Ingresos"
                    action={
                        <button onClick={() => setShowAddModal(true)} className={styles.addButton}>
                            <span className="material-symbols-outlined">add</span>
                            <span>Nuevo Ingreso</span>
                        </button>
                    }
                />

                {/* Summary Cards */}
                <div className={styles.cardsGrid}>
                    <div className={styles.card}>
                        <div className={styles.cardTop}>
                            <span className={styles.cardLabel}>INGRESOS DEL MES</span>
                            <div className={`${styles.cardIcon} ${styles.cardIconOrange}`}>
                                <span className="material-symbols-outlined">account_balance</span>
                            </div>
                        </div>
                        <div className={styles.cardBottom}>
                            <span className={styles.cardValue}>$12,500.00</span>
                            <div className={styles.cardTrendUp}>
                                <span className="material-symbols-outlined">trending_up</span>
                                <span>+8.2% vs mes anterior</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardTop}>
                            <span className={styles.cardLabel}>PENDIENTES DE COBRO</span>
                            <div className={`${styles.cardIcon} ${styles.cardIconGray}`}>
                                <span className="material-symbols-outlined">hourglass_empty</span>
                            </div>
                        </div>
                        <div className={styles.cardBottom}>
                            <span className={styles.cardValue}>$1,200.00</span>
                            <p className={styles.cardNote}>14 recibos pendientes</p>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardTop}>
                            <span className={styles.cardLabel}>MULTAS RECAUDADAS</span>
                            <div className={`${styles.cardIcon} ${styles.cardIconRed}`}>
                                <span className="material-symbols-outlined">gavel</span>
                            </div>
                        </div>
                        <div className={styles.cardBottom}>
                            <span className={styles.cardValue}>$350.00</span>
                            <p className={styles.cardNote}>Acumulado del periodo</p>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className={styles.tableCard}>
                    <div className={styles.tableToolbar}>
                        <div className={styles.tabsGroup}>
                            <button className={`${styles.tabButton} ${styles.tabButtonActive}`}>
                                Todos los registros
                            </button>
                            <button className={styles.tabButton}>Mes actual</button>
                        </div>
                        <div className={styles.toolbarActions}>
                            <button className={styles.toolbarIconButton}>
                                <span className="material-symbols-outlined">filter_list</span>
                            </button>
                            <button
                                onClick={triggerPDFDownload}
                                className={styles.toolbarIconButton}
                                title="Descargar Reporte"
                            >
                                <span className="material-symbols-outlined">download</span>
                            </button>
                        </div>
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr className={styles.theadRow}>
                                    <th className={styles.th}>FECHA</th>
                                    <th className={styles.th}>CASA</th>
                                    <th className={styles.th}>RESIDENTE</th>
                                    <th className={styles.th}>CONCEPTO</th>
                                    <th className={styles.th}>MONTO</th>
                                    <th className={styles.th}>Nº DOCUMENTO</th>
                                    <th className={styles.th}>ESTADO</th>
                                    <th className={`${styles.th} ${styles.thCenter}`}>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {incomes.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className={styles.emptyCell}>
                                            Aún no hay ingresos registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    incomes.map((row, idx) => (
                                        <tr
                                            key={row.id}
                                            className={`${styles.row} ${idx % 2 === 1 ? styles.rowAlt : ''}`}
                                        >
                                            <td className={styles.dateCell}>{row.date}</td>
                                            <td className={styles.houseCell}>{row.houseNumber}</td>
                                            <td className={styles.residentCell}>{row.resident}</td>
                                            <td className={styles.conceptCell}>{row.concept}</td>
                                            <td className={styles.amountCell}>${row.amount.toFixed(2)}</td>
                                            <td className={styles.docCell}>{row.docNumber}</td>
                                            <td>
                                                <span
                                                    className={`${styles.statusBadge} ${row.status === 'Pagado' ? styles.statusPaid : styles.statusPending
                                                        }`}
                                                >
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className={styles.actionsCellWrap}>
                                                <div className={styles.actionsCell}>
                                                    <button className={styles.iconButton} title="Editar">
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                    <button className={styles.iconButton} title="Ver">
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
                        <span>Mostrando 1 a {incomes.length} de {incomes.length} registros</span>
                        <div className={styles.pageButtons}>
                            <button className={styles.pageButton} disabled>Anterior</button>
                            <button className={`${styles.pageButton} ${styles.pageButtonActive}`}>1</button>
                            <button className={styles.pageButton}>2</button>
                            <button className={styles.pageButton}>3</button>
                            <button className={styles.pageButton}>Siguiente</button>
                        </div>
                    </div>
                </div>

                {/* Distribution + Report */}
                <div className={styles.secondaryGrid}>
                    <div className={styles.panel}>
                        <h3 className={styles.panelTitle}>Distribución por Concepto</h3>
                        <div className={styles.barTrack}>
                            <div className={styles.barSegmentOrange} style={{ width: '70%' }} />
                            <div className={styles.barSegmentGray} style={{ width: '20%' }} />
                            <div className={styles.barSegmentBrown} style={{ width: '10%' }} />
                        </div>
                        <div className={styles.legendGrid}>
                            <div className={styles.legendItem}>
                                <span className={styles.legendLabel}>Mantenimiento</span>
                                <span className={styles.legendValue}>70%</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={styles.legendLabel}>Reservas</span>
                                <span className={styles.legendValue}>20%</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={styles.legendLabel}>Otros</span>
                                <span className={styles.legendValue}>10%</span>
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.panel} ${styles.reportPanel}`}>
                        <div>
                            <h3 className={styles.panelTitle}>Reporte Consolidado</h3>
                            <p className={styles.reportText}>
                                Generar PDF detallado de todos los ingresos del mes actual.
                            </p>

                            {reportSuccess && (
                                <p className={styles.reportSuccess}>
                                    <span className="material-symbols-outlined">check_circle</span>
                                    ¡PDF generado con éxito!
                                </p>
                            )}

                            <button
                                onClick={triggerPDFDownload}
                                disabled={downloadingReport}
                                className={styles.reportButton}
                            >
                                {downloadingReport ? 'Generando PDF...' : 'Descargar Reporte'}
                            </button>
                        </div>
                        <div className={styles.reportIcon}>
                            <span className="material-symbols-outlined">picture_as_pdf</span>
                        </div>
                    </div>
                </div>

                {/* Modal Add Income */}
                {showAddModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Registrar Nuevo Ingreso</h3>
                                <button onClick={() => setShowAddModal(false)} className={styles.modalCloseButton}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleAddSubmit} className={styles.form}>
                                <div className={styles.formGrid2}>
                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}># Casa</label>
                                        <input
                                            type="text"
                                            placeholder="A-01"
                                            value={house}
                                            onChange={(e) => setHouse(e.target.value)}
                                            className={styles.formInput}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}>Residente</label>
                                        <input
                                            type="text"
                                            placeholder="Nombre del residente"
                                            value={resident}
                                            onChange={(e) => setResident(e.target.value)}
                                            className={styles.formInput}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>Concepto</label>
                                    <select
                                        value={concept}
                                        onChange={(e) => setConcept(e.target.value)}
                                        className={styles.formInput}
                                    >
                                        <option value="Cuota Mantenimiento">Cuota Mantenimiento</option>
                                        <option value="Reserva BBQ">Reserva BBQ</option>
                                        <option value="Multa Ruido">Multa Ruido</option>
                                        <option value="Tag Extra Acceso">Tag Extra Acceso</option>
                                        <option value="Otro Ingreso">Otro Ingreso</option>
                                    </select>
                                </div>

                                <div className={styles.formGrid2}>
                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}>Monto ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className={styles.formInput}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}>Nº Comprobante</label>
                                        <input
                                            type="text"
                                            placeholder="FAC-1050"
                                            value={docNumber}
                                            onChange={(e) => setDocNumber(e.target.value)}
                                            className={styles.formInput}
                                        />
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
                                        Guardar Ingreso
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Income;