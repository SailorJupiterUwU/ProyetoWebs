import React, { useState } from 'react';
import styles from './Registered.module.css';

const Registered = ({
  users,
  onRefetch,
  onUpdateStatus,
  onCreateUser,
  onGetDetalle,
  onEditUser,
  showAddModal,
  setShowAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // ── Modal Crear ──────────────────────────────────────────────────────────
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [ci_ruc, setCiRuc] = useState('');
  const [id_rol, setIdRol] = useState('');
  const [numero_vivienda, setNumeroVivienda] = useState('');
  const [correo_login, setCorreoLogin] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);

  // ── Modal Detalle ─────────────────────────────────────────────────────────
  const [detailUser, setDetailUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Modal Editar ──────────────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState(null); // usuario que se edita
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNombres, setEditNombres] = useState('');
  const [editApellidos, setEditApellidos] = useState('');
  const [editCorreo, setEditCorreo] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editError, setEditError] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.ci_ruc?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'Activos') return u.estado === 'ACTIVO';
    if (statusFilter === 'Inactivos') return u.estado === 'INACTIVO';
    return true;
  });

  // ── Handlers Crear ────────────────────────────────────────────────────────
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const result = await onCreateUser({
      nombres, apellidos, ci_ruc, id_rol, numero_vivienda, correo_login, password,
    });
    if (result.success) {
      setShowAddModal(false);
      setNombres(''); setApellidos(''); setCiRuc('');
      setIdRol(''); setNumeroVivienda(''); setCorreoLogin(''); setPassword('');
    } else {
      setFormError(result.error);
    }
  };

  // ── Handlers Detalle ──────────────────────────────────────────────────────
  const handleOpenDetail = async (id) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    const result = await onGetDetalle(id);
    if (result.success) {
      setDetailUser(result.data);
    }
    setDetailLoading(false);
  };

  // ── Handlers Editar ───────────────────────────────────────────────────────
  const handleOpenEdit = async (id) => {
    setEditError(null);
    setEditLoading(true);
    setShowEditModal(true);
    const result = await onGetDetalle(id);
    if (result.success) {
      const u = result.data;
      setEditTarget(u);
      setEditNombres(u.nombres || '');
      setEditApellidos(u.apellidos || '');
      setEditCorreo(u.correo || '');
      setEditTelefono(u.telefono || '');
    }
    setEditLoading(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError(null);
    const result = await onEditUser(editTarget.id_usuario, {
      nombres: editNombres,
      apellidos: editApellidos,
      correo: editCorreo,
      telefono: editTelefono,
    });
    if (result.success) {
      setShowEditModal(false);
      setEditTarget(null);
    } else {
      setEditError(result.error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-EC', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <>
      {/* ── Filtros ──────────────────────────────────────────────────────── */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Buscar por nombre o CI/RUC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterTabs}>
          {['todos', 'Activos', 'Inactivos'].map((f) => (
            <button
              key={f}
              className={statusFilter === f ? styles.activeFilter : styles.filterBtn}
              onClick={() => setStatusFilter(f)}
            >
              {f === 'todos' ? 'Todos' : f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabla ────────────────────────────────────────────────────────── */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>CI/RUC</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Casa</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr key={u.id_usuario}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>{u.nombres?.charAt(0)}</div>
                      <p className={styles.name}>{u.nombres} {u.apellidos}</p>
                    </div>
                  </td>
                  <td>{u.ci_ruc}</td>
                  <td>
                    <span className={styles.roleTag}>{u.rol_nombre || 'Sin Rol'}</span>
                  </td>
                  <td>
                    <span className={`${styles.statusTag} ${styles[u.estado?.toLowerCase()]}`}>
                      {u.estado}
                    </span>
                  </td>
                  <td>{u.numero_vivienda || 'N/A'}</td>
                  <td>
                    <div className={styles.actions}>
                      {/* Ver detalle */}
                      <button
                        className={styles.actionBtn}
                        title="Ver Detalle"
                        onClick={() => handleOpenDetail(u.id_usuario)}
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      {/* Editar */}
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                        title="Editar Usuario"
                        onClick={() => handleOpenEdit(u.id_usuario)}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      {/* Cambiar estado */}
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnToggle}`}
                        title="Cambiar Estado"
                        onClick={() => onUpdateStatus(u.id_usuario, u.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO')}
                      >
                        <span className="material-symbols-outlined">sync</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={styles.empty}>
                  No se encontraron usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal Crear ───────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Registrar Nuevo Usuario</h3>
              <button onClick={() => setShowAddModal(false)} className={styles.modalClose}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className={styles.form}>
              {formError && <div className={styles.formErrorAlert}>{formError}</div>}
              <div className={styles.formGroup}>
                <label>Nombres</label>
                <input type="text" value={nombres} onChange={(e) => setNombres(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label>Apellidos</label>
                <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label>CI/RUC</label>
                <input type="text" value={ci_ruc} onChange={(e) => setCiRuc(e.target.value)} required />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>ID de Rol</label>
                  <input type="number" value={id_rol} onChange={(e) => setIdRol(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label>#Casa</label>
                  <input type="text" value={numero_vivienda} onChange={(e) => setNumeroVivienda(e.target.value)} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Correo electrónico</label>
                <input type="email" value={correo_login} onChange={(e) => setCorreoLogin(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label>Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Detalle ─────────────────────────────────────────────────── */}
      {showDetailModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <span className={`material-symbols-outlined ${styles.modalTitleIcon}`}>person</span>
                <h3>Detalle de Usuario</h3>
              </div>
              <button onClick={() => { setShowDetailModal(false); setDetailUser(null); }} className={styles.modalClose}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {detailLoading || !detailUser ? (
              <div className={styles.modalLoading}>
                <span className="material-symbols-outlined">hourglass_empty</span>
                <p>Cargando...</p>
              </div>
            ) : (
              <>
                <div className={styles.detailAvatar}>
                  <div className={styles.detailAvatarCircle}>
                    {detailUser.nombres?.charAt(0)}
                  </div>
                  <div>
                    <p className={styles.detailName}>{detailUser.nombres} {detailUser.apellidos}</p>
                    <span className={`${styles.statusTag} ${styles[detailUser.estado?.toLowerCase()]}`}>
                      {detailUser.estado}
                    </span>
                  </div>
                </div>
                <div className={styles.detailList}>
                  <div className={styles.detailRow}>
                    <span>CI/RUC</span>
                    <span className={styles.detailValue}>{detailUser.ci_ruc || '—'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Correo</span>
                    <span className={styles.detailValue}>{detailUser.correo || '—'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Teléfono</span>
                    <span className={styles.detailValue}>{detailUser.telefono || '—'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Rol</span>
                    <span className={`${styles.detailValue} ${styles.detailRole}`}>
                      {detailUser.rol?.nombre || '—'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Vivienda</span>
                    <span className={styles.detailValue}>
                      {detailUser.vivienda ? `#${detailUser.vivienda.numero}` : '—'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Fecha de registro</span>
                    <span className={styles.detailValue}>{formatDate(detailUser.fecha_registro)}</span>
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button
                    className={styles.saveBtn}
                    onClick={() => {
                      setShowDetailModal(false);
                      handleOpenEdit(detailUser.id_usuario);
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle' }}>edit</span>
                    {' '}Editar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modal Editar ──────────────────────────────────────────────────── */}
      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <span className={`material-symbols-outlined ${styles.modalTitleIconEdit}`}>edit</span>
                <h3>Editar Usuario</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className={styles.modalClose}>
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
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Nombres</label>
                    <input type="text" value={editNombres} onChange={(e) => setEditNombres(e.target.value)} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Apellidos</label>
                    <input type="text" value={editApellidos} onChange={(e) => setEditApellidos(e.target.value)} required />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Correo electrónico</label>
                  <input type="email" value={editCorreo} onChange={(e) => setEditCorreo(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>Teléfono</label>
                  <input type="tel" value={editTelefono} onChange={(e) => setEditTelefono(e.target.value)} placeholder="0991234567" />
                </div>
                <div className={styles.formActions}>
                  <button type="button" onClick={() => setShowEditModal(false)} className={styles.cancelBtn}>
                    Cancelar
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    Guardar Cambios
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Registered;