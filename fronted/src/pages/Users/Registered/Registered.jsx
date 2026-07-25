import React, { useState } from 'react';
import styles from './Registered.module.css';

const Registered = ({ users, onRefetch, onUpdateStatus, onCreateUser, showAddModal, setShowAddModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [ci_ruc, setCiRuc] = useState('');
  const [id_rol, setIdRol] = useState('');
  const [numero_vivienda, setNumeroVivienda] = useState('');
  const [correo_login, setCorreoLogin] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);

  // Filtrado y búsqueda en cliente (el backend ya soporta filtros por query,
  // pero mantenemos esto para respuesta instantánea mientras el usuario escribe)
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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const result = await onCreateUser({
      nombres,
      apellidos,
      ci_ruc,
      id_rol,
      numero_vivienda,
      correo_login,
      password,
    });
    if (result.success) {
      setShowAddModal(false);
      setNombres('');
      setApellidos('');
      setCiRuc('');
      setIdRol('');
      setNumeroVivienda('');
      setCorreoLogin('');
      setPassword('');
    } else {
      setFormError(result.error);
    }
  };

  return (
    <>
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
                      <p className={styles.name}>
                        {u.nombres} {u.apellidos}
                      </p>
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
                      <button
                        className={styles.actionBtn}
                        title="Cambiar Estado"
                        onClick={() =>
                          onUpdateStatus(u.id_usuario, u.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO')
                        }
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
                  <input
                    type="text"
                    value={numero_vivienda}
                    onChange={(e) => setNumeroVivienda(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Correo electrónico</label>
                <input
                  type="email"
                  value={correo_login}
                  onChange={(e) => setCorreoLogin(e.target.value)}
                  required
                />
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
    </>
  );
};

export default Registered;