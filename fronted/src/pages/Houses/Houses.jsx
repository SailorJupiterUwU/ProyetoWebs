import React, { useState } from 'react';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';
import Button from '../../components/comunes/Button/Button';
import LoadingSpinner from '../../components/comunes/LoadingSpinner/LoadingSpinner';
import useViviendas from '../../hooks/useViviendas';
import styles from './Houses.module.css';

const Houses = () => {
    const { data: viviendas, loading, error, crearVivienda, editarVivienda, cambiarEstado } = useViviendas();

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [numero, setNumero] = useState('');
    const [porcentaje, setPorcentaje] = useState('');
    const [formError, setFormError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const sumaAlicuotasActual = viviendas.reduce((acc, v) => acc + Number(v.porcentaje_alicuota) * 100, 0);
    const sumaExcluyendoEditada = editingId
        ? sumaAlicuotasActual - Number(viviendas.find((v) => v.id_vivienda === editingId)?.porcentaje_alicuota || 0) * 100
        : sumaAlicuotasActual;

    const openCreateModal = () => {
        setEditingId(null);
        setNumero('');
        setPorcentaje('');
        setFormError(null);
        setShowModal(true);
    };

    const openEditModal = (v) => {
        setEditingId(v.id_vivienda);
        setNumero(v.numero);
        setPorcentaje(String(Number(v.porcentaje_alicuota) * 100));
        setFormError(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setSubmitting(true);

        const porcentajeFraccion = parseFloat(porcentaje) / 100; // porcentaje visual → fracción

        let result;
        if (editingId) {
            result = await editarVivienda(editingId, {
                numero,
                porcentaje_alicuota: porcentajeFraccion,
            });
        } else {
            result = await crearVivienda({
                numero,
                porcentaje_alicuota: porcentajeFraccion,
            });
        }

        setSubmitting(false);

        if (result.success) {
            setShowModal(false);
        } else {
            setFormError(result.error);
        }
    };

    const handleToggleEstado = async (v) => {
        await cambiarEstado(v.id_vivienda, !v.estado);
    };

    return (
        <Layout>
            <div className={styles.container}>
                <PageHeader
                    breadcrumbs={['Sistema', 'Casas']}
                    title="Gestión de Casas"
                    subtitle="Viviendas registradas y su porcentaje de alícuota asignado."
                    action={
                        <Button variant="primary" onClick={openCreateModal} icon="add" iconPosition="left">
                            Nueva Casa
                        </Button>
                    }
                />

                <div className={styles.summaryBar}>
                    <span>
                        Suma total de alícuotas asignadas:{' '}
                        <strong className={sumaAlicuotasActual > 100 ? styles.overLimit : ''}>
                            {sumaAlicuotasActual.toFixed(2)}%
                        </strong>
                    </span>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className={styles.errorAlert}>{error}</div>
                ) : (
                    <div className={styles.tableCard}>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <colgroup>
                                    <col style={{ width: '35%' }} />
                                    <col style={{ width: '20%' }} />
                                    <col style={{ width: '20%' }} />
                                    <col style={{ width: '25%' }} />
                                </colgroup>
                                <thead>
                                    <tr className={styles.theadRow}>
                                        <th className={styles.th}>Nº Casa</th>
                                        <th className={`${styles.th} ${styles.thRight}`}>% Alícuota</th>
                                        <th className={styles.th}>Estado</th>
                                        <th className={`${styles.th} ${styles.thRight}`}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className={styles.tbody}>
                                    {viviendas.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className={styles.emptyCell}>
                                                No hay casas registradas todavía.
                                            </td>
                                        </tr>
                                    ) : (
                                        viviendas.map((v, idx) => (
                                            <tr key={v.id_vivienda} className={`${styles.row} ${idx % 2 === 1 ? styles.rowAlt : ''}`}>
                                                <td className={styles.numeroCell}>Casa {v.numero}</td>
                                                <td className={styles.textRight}>{(Number(v.porcentaje_alicuota) * 100).toFixed(2)}%</td>
                                                <td>
                                                    <span className={`${styles.statusBadge} ${v.estado ? styles.statusActive : styles.statusInactive}`}>
                                                        {v.estado ? 'Activa' : 'Inactiva'}
                                                    </span>
                                                </td>
                                                <td className={styles.actionsCellWrap}>
                                                    <div className={styles.actionsCell}>
                                                        <button onClick={() => openEditModal(v)} className={styles.iconButton} title="Editar">
                                                            <span className="material-symbols-outlined">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleEstado(v)}
                                                            className={styles.iconButton}
                                                            title={v.estado ? 'Desactivar' : 'Activar'}
                                                        >
                                                            <span className="material-symbols-outlined">
                                                                {v.estado ? 'toggle_on' : 'toggle_off'}
                                                            </span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>{editingId ? 'Editar Casa' : 'Nueva Casa'}</h3>
                            <button onClick={() => setShowModal(false)} className={styles.modalCloseButton}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {formError && <div className={styles.formErrorAlert}>{formError}</div>}

                            <div className={styles.formField}>
                                <label className={styles.formLabel}>Número de Casa</label>
                                <input
                                    type="text"
                                    value={numero}
                                    onChange={(e) => setNumero(e.target.value)}
                                    placeholder="Ej. A-01"
                                    className={styles.formInput}
                                    required
                                />
                            </div>

                            <div className={styles.formField}>
                                <label className={styles.formLabel}>% Alícuota</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={porcentaje}
                                    onChange={(e) => setPorcentaje(e.target.value)}
                                    placeholder="Ej. 4.5"
                                    className={styles.formInput}
                                    required
                                />
                                <p className={styles.formHint}>
                                    Suma actual sin esta casa: {sumaExcluyendoEditada.toFixed(2)}% — con esta, quedaría en{' '}
                                    {(sumaExcluyendoEditada + (parseFloat(porcentaje) || 0)).toFixed(2)}%
                                </p>
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.saveBtn} disabled={submitting}>
                                    {submitting ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Casa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Houses;