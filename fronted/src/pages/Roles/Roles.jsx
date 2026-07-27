import React, { useState } from 'react';
import styles from './Roles.module.css';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';
import LoadingSpinner from '../../components/comunes/LoadingSpinner/LoadingSpinner';
import useRoles from '../../hooks/useRoles';

const Roles = () => {
  const {
    data: roles,
    loading,
    error,
    getModulos,
    updateModulos,
    updateStatus,
    editRol,
    refetch,
  } = useRoles();

  // ── Modal Permisos (ver/editar módulos) ──────────────────────────────────
  const [selectedRole, setSelectedRole] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [loadingModulos, setLoadingModulos] = useState(false);
  const [editingPerms, setEditingPerms] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);
  const [permsError, setPermsError] = useState(null);

  // ── Modal Detalle ────────────────────────────────────────────────────────
  const [detailRole, setDetailRole] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ── Modal Editar ─────────────────────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editError, setEditError] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers: Permisos
  // ─────────────────────────────────────────────────────────────────────────
  const handleViewPermissions = async (role) => {
    setSelectedRole(role);
    setEditingPerms(false);
    setPermsError(null);
    setLoadingModulos(true);
    const result = await getModulos(role.id_rol);
    if (result.success) {
      setModulos(result.data);
    }
    setLoadingModulos(false);
  };

  const handleToggleModulo = (id_modulo) => {
    setModulos((prev) =>
      prev.map((m) =>
        m.id_modulo === id_modulo ? { ...m, asignado: !m.asignado } : m
      )
    );
  };

  const handleSavePerms = async () => {
    setSavingPerms(true);
    setPermsError(null);
    const asignados = modulos.filter((m) => m.asignado).map((m) => m.id_modulo);
    const result = await updateModulos(selectedRole.id_rol, asignados);
    if (result.success) {
      setEditingPerms(false);
    } else {
      setPermsError(result.error);
    }
    setSavingPerms(false);
  };

  const handleClosePerms = () => {
    setSelectedRole(null);
    setModulos([]);
    setEditingPerms(false);
    setPermsError(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers: Detalle
  // ─────────────────────────────────────────────────────────────────────────
  const handleOpenDetail = (role) => {
    setDetailRole(role);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setDetailRole(null);
    setShowDetailModal(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers: Editar
  // ─────────────────────────────────────────────────────────────────────────
  const handleOpenEdit = (role) => {
    setEditTarget(role);
    setEditNombre(role.nombre || '');
    setEditDescripcion(role.descripcion || '');
    setEditError(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError(null);
    setEditLoading(true);
    const result = await editRol(editTarget.id_rol, {
      nombre: editNombre,
      descripcion: editDescripcion,
    });
    if (result.success) {
      setShowEditModal(false);
      setEditTarget(null);
    } else {
      setEditError(result.error);
    }
    setEditLoading(false);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditTarget(null);
    setEditError(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers: Cambiar Estado
  // ─────────────────────────────────────────────────────────────────────────
  const handleToggleStatus = async (role) => {
    await updateStatus(role.id_rol, !role.estado);
  };

  return (
    <Layout>
      <div className={styles.container}>
        <PageHeader
          breadcrumbs={['Sistema', 'Roles']}
          title="Gestión de Roles"
          subtitle="Configuración de permisos y niveles de acceso al sistema."
        />

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className={styles.errorAlert}>{error}</div>
        ) : (
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.theadRow}>
                    <th className={styles.th}>Código</th>
                    <th className={styles.th}>Nombre del Rol</th>
                    <th className={styles.th}>Descripción</th>
                    <th className={styles.th}>Estado</th>
                    <th className={`${styles.th} ${styles.thRight}`}>Acciones</th>
                  </tr>
                </thead>
                <tbody className={styles.tbody}>
                  {roles.length > 0 ? (
                    roles.map((row, idx) => (
                      <tr
                        key={row.id_rol}
                        className={`${styles.row} ${idx % 2 === 1 ? styles.rowAlt : ''}`}
                      >
                        <td className={styles.codeCell}>{row.codigo}</td>
                        <td className={styles.nameCell}>{row.nombre}</td>
                        <td className={styles.descCell}>{row.descripcion || '—'}</td>
                        <td className={styles.statusCell}>
                          <span
                            className={`${styles.statusBadge} ${
                              row.estado ? styles.statusActive : styles.statusInactive
                            }`}
                          >
                            <span className={styles.statusDot} />
                            {row.estado ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </td>
                        <td className={styles.actionsCellWrap}>
                          <div className={styles.actionsCell}>
                            {/* Ver detalle */}
                            <button
                              onClick={() => handleOpenDetail(row)}
                              className={styles.iconButton}
                              title="Ver Detalle"
                            >
                              <span className="material-symbols-outlined">info</span>
                            </button>
                            {/* Ver / editar permisos */}
                            <button
                              onClick={() => handleViewPermissions(row)}
                              className={styles.iconButton}
                              title="Ver Permisos"
                            >
                              <span className="material-symbols-outlined">shield</span>
                            </button>
                            {/* Editar */}
                            <button
                              onClick={() => handleOpenEdit(row)}
                              className={`${styles.iconButton} ${styles.iconButtonEdit}`}
                              title="Editar Rol"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            {/* Cambiar estado */}
                            <button
                              onClick={() => handleToggleStatus(row)}
                              className={`${styles.iconButton} ${styles.iconButtonToggle}`}
                              title="Cambiar Estado"
                            >
                              <span className="material-symbols-outlined">sync</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className={styles.empty}>
                        No hay roles registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Modal Detalle ──────────────────────────────────────────────── */}
        {showDetailModal && detailRole && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleGroup}>
                  <span className={`material-symbols-outlined ${styles.modalTitleIcon}`}>
                    manage_accounts
                  </span>
                  <h3 className={styles.modalTitle}>Detalle del Rol</h3>
                </div>
                <button onClick={handleCloseDetail} className={styles.modalCloseButton}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className={styles.detailList}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Código</span>
                  <span className={styles.detailValue}>{detailRole.codigo}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Nombre</span>
                  <span className={`${styles.detailValue} ${styles.detailRole}`}>
                    {detailRole.nombre}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Descripción</span>
                  <span className={styles.detailValue}>{detailRole.descripcion || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Estado</span>
                  <span
                    className={`${styles.statusBadge} ${
                      detailRole.estado ? styles.statusActive : styles.statusInactive
                    }`}
                  >
                    <span className={styles.statusDot} />
                    {detailRole.estado ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={styles.editFromDetailBtn}
                  onClick={() => {
                    handleCloseDetail();
                    handleOpenEdit(detailRole);
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '16px', verticalAlign: 'middle' }}
                  >
                    edit
                  </span>{' '}
                  Editar
                </button>
                <button className={styles.confirmButton} onClick={handleCloseDetail}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal Permisos ─────────────────────────────────────────────── */}
        {selectedRole && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleGroup}>
                  <span className={`material-symbols-outlined ${styles.modalTitleIcon}`}>
                    shield
                  </span>
                  <h3 className={styles.modalTitle}>Permisos: {selectedRole.nombre}</h3>
                </div>
                <button onClick={handleClosePerms} className={styles.modalCloseButton}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <p className={styles.modalDescription}>{selectedRole.descripcion}</p>

              {loadingModulos ? (
                <LoadingSpinner />
              ) : (
                <div className={styles.permissionsList}>
                  {modulos.map((m) => (
                    <div key={m.id_modulo} className={styles.permissionRow}>
                      <span className={styles.permissionName}>{m.nombre}</span>
                      {editingPerms ? (
                        <label className={styles.toggleLabel}>
                          <input
                            type="checkbox"
                            checked={m.asignado}
                            onChange={() => handleToggleModulo(m.id_modulo)}
                            className={styles.toggleCheckbox}
                          />
                          <span className={m.asignado ? styles.permissionAllowed : styles.permissionDenied}>
                            {m.asignado ? 'Permitido' : 'Restringido'}
                          </span>
                        </label>
                      ) : (
                        <span
                          className={m.asignado ? styles.permissionAllowed : styles.permissionDenied}
                        >
                          {m.asignado ? 'Permitido' : 'Restringido'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {editingPerms && (
                <div className={styles.permsNotice}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>info</span>
                  <span>Los cambios aplican al siguiente inicio de sesión del usuario afectado.</span>
                </div>
              )}

              {permsError && <div className={styles.formErrorAlert}>{permsError}</div>}

              <div className={styles.modalFooter}>
                {editingPerms ? (
                  <>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => {
                        setEditingPerms(false);
                        handleViewPermissions(selectedRole);
                      }}
                      disabled={savingPerms}
                    >
                      Cancelar
                    </button>
                    <button
                      className={styles.confirmButton}
                      onClick={handleSavePerms}
                      disabled={savingPerms}
                    >
                      {savingPerms ? 'Guardando…' : 'Guardar Permisos'}
                    </button>
                  </>
                ) : (
                  <>
                    <button className={styles.cancelBtn} onClick={handleClosePerms}>
                      Cerrar
                    </button>
                    <button
                      className={styles.confirmButton}
                      onClick={() => setEditingPerms(true)}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '16px', verticalAlign: 'middle' }}
                      >
                        edit
                      </span>{' '}
                      Editar Permisos
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Modal Editar ───────────────────────────────────────────────── */}
        {showEditModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleGroup}>
                  <span className={`material-symbols-outlined ${styles.modalTitleIconEdit}`}>
                    edit
                  </span>
                  <h3 className={styles.modalTitle}>Editar Rol</h3>
                </div>
                <button onClick={handleCloseEdit} className={styles.modalCloseButton}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {editLoading || !editTarget ? (
                <div className={styles.modalLoading}>
                  <span className="material-symbols-outlined">hourglass_empty</span>
                  <p>Cargando...</p>
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className={styles.form}>
                  {editError && <div className={styles.formErrorAlert}>{editError}</div>}

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Nombre del Rol</label>
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      required
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Descripción</label>
                    <textarea
                      value={editDescripcion}
                      onChange={(e) => setEditDescripcion(e.target.value)}
                      rows={3}
                      className={styles.formTextarea}
                      placeholder="Descripción del rol..."
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={handleCloseEdit}
                      className={styles.cancelBtn}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className={styles.confirmButton}>
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Roles;