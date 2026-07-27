import React, { useState } from 'react';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';
import Button from '../../components/comunes/Button/Button';
import LoadingSpinner from '../../components/comunes/LoadingSpinner/LoadingSpinner';
import useProveedores from '../../hooks/useProveedores';
import styles from './Providers.module.css';

const Providers = () => {
    const { data: proveedores, loading, error, crearProveedor, editarProveedor, eliminarProveedor } =
        useProveedores();

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [nombre, setNombre] = useState('');
    const [formError, setFormError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const openCreateModal = () => {
        setEditingId(null);
        setNombre('');
        setFormError(null);
        setShowModal(true);
    };

    const openEditModal = (p) => {
        setEditingId(p.id_proveedor);
        setNombre(p.nombre);
        setFormError(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setSubmitting(true);

        const result = editingId
            ? await editarProveedor(editingId, { nombre })
            : await crearProveedor(nombre);

        setSubmitting(false);

        if (result.success) {
            setShowModal(false);
        } else {
            setFormError(result.error);
        }
    };

    const handleReactivar = async (p) => {
        await editarProveedor(p.id_proveedor, { estado: true });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        await eliminarProveedor(confirmDeleteId);
        setConfirmDeleteId(null);
    };

    const proveedorAEliminar = proveedores.find((p) => p.id_proveedor === confirmDeleteId);

    return (
        <Layout>
            <div className={styles.container}>
                <PageHeader
                    breadcrumbs={['Finanzas', 'Proveedores']}
                    title="Gestión de Proveedores"
                    subtitle="Proveedores registrados para el registro de egresos."
                    action={
                        <Button variant="primary" onClick={openCreateModal} icon="add" iconPosition="left">
                            Nuevo Proveedor
                        </Button>
                    }
                />

                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className={styles.errorAlert}>{error}</div>
                ) : (
                    <div className={styles.tableCard}>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <colgroup>
                                    <col style={{ width: '50%' }} />
                                    <col style={{ width: '25%' }} />
                                    <col style={{ width: '25%' }} />
                                </colgroup>
                                <thead>
                                    <tr className={styles.theadRow}>
                                        <th className={styles.th}>Nombre</th>
                                        <th className={`${styles.th} ${styles.thCenter}`}>Estado</th>
                                        <th className={`${styles.th} ${styles.thCenter}`}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className={styles.tbody}>
                                    {proveedores.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className={styles.emptyCell}>
                                                No hay proveedores registrados todavía.
                                            </td>
                                        </tr>
                                    ) : (
                                        proveedores.map((p, idx) => (
                                            <tr key={p.id_proveedor} className={`${styles.row} ${idx % 2 === 1 ? styles.rowAlt : ''}`}>
                                                <td className={styles.nameCell}>{p.nombre}</td>
                                                <td className={styles.textCenter}>
                                                    <span className={`${styles.statusBadge} ${p.estado ? styles.statusActive : styles.statusInactive}`}>
                                                        {p.estado ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className={styles.textCenter}>
                                                    <div className={styles.actionsCell}>
                                                        <button onClick={() => openEditModal(p)} className={styles.iconButton} title="Editar">
                                                            <span className="material-symbols-outlined">edit</span>
                                                        </button>
                                                        {p.estado ? (
                                                            <button
                                                                onClick={() => setConfirmDeleteId(p.id_proveedor)}
                                                                className={styles.iconButtonDanger}
                                                                title="Eliminar"
                                                            >
                                                                <span className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleReactivar(p)}
                                                                className={styles.iconButton}
                                                                title="Reactivar"
                                                            >
                                                                <span className="material-symbols-outlined">restore</span>
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
                    </div>
                )}
            </div>

            {/* Modal Crear/Editar */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>{editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
                            <button onClick={() => setShowModal(false)} className={styles.modalCloseButton}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {formError && <div className={styles.formErrorAlert}>{formError}</div>}

                            <div className={styles.formField}>
                                <label className={styles.formLabel}>Nombre del Proveedor</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ej. Empresa Eléctrica"
                                    className={styles.formInput}
                                    required
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.saveBtn} disabled={submitting}>
                                    {submitting ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Proveedor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Confirmar Eliminación */}
            {confirmDeleteId && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modal} ${styles.modalSm}`}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Eliminar Proveedor</h3>
                            <button onClick={() => setConfirmDeleteId(null)} className={styles.modalCloseButton}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className={styles.confirmBody}>
                            <p>
                                ¿Seguro que deseas eliminar a <strong>{proveedorAEliminar?.nombre}</strong>?
                            </p>
                            <p className={styles.confirmNote}>
                                No se borrará su historial de egresos — solo quedará marcado como inactivo y no
                                aparecerá disponible para nuevos registros.
                            </p>
                        </div>
                        <div className={styles.formActions}>
                            <button onClick={() => setConfirmDeleteId(null)} className={styles.cancelBtn}>
                                Cancelar
                            </button>
                            <button onClick={handleConfirmDelete} className={styles.deleteBtn}>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Providers;