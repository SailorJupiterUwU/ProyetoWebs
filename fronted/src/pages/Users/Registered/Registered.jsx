import React, { useState } from 'react';
import styles from './Registered.module.css';

const Registered = ({ users, onStatusChange, showAddModal, setShowAddModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [selectedUser, setSelectedUser] = useState(null);

  const [name, setName] = useState('');
  const [doc, setDoc] = useState('');
  const [role, setRole] = useState('Residente');
  const [house, setHouse] = useState('');
  const [email, setEmail] = useState('');

  const matchesSearch = (u) =>
    u.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.ci_ruc?.toLowerCase().includes(searchTerm.toLowerCase());

  const filteredUsers = users.filter((u) => {
    if (!matchesSearch(u)) return false;
    if (statusFilter === 'Activos') return u.estado === 'Activo';
    if (statusFilter === 'Inactivos') return u.estado === 'Inactivo';
    return true;
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    // TODO: conectar con la función real de creación de usuario (ej. createUser del hook)
    console.warn('createUser no implementado en useUsers todavía');
    setShowAddModal(false);
    setName('');
    setDoc('');
    setHouse('');
    setEmail('');
  };

  return (
    <>
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Buscar por nombre, CI/RUC o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterTabs}>
          {['Todos', 'Activos', 'Inactivos'].map((f) => (
            <button
              key={f}
              className={statusFilter === f ? styles.activeFilter : styles.filterBtn}
              onClick={() => setStatusFilter(f)}
            >
              {f}
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
                      <div>
                        <p className={styles.name}>
                          {u.nombres} {u.apellidos}
                        </p>
                        <p className={styles.email}>{u.correo}</p>
                      </div>
                    </div>
                  </td>
                  <td>{u.ci_ruc}</td>
                  <td>
                    <span className={styles.roleTag}>{u.Rol?.nombre || 'Sin Rol'}</span>
                  </td>
                  <td>
                    <span className={`${styles.statusTag} ${styles[u.estado.toLowerCase()]}`}>
                      {u.estado}
                    </span>
                  </td>
                  <td>{u.Casa?.numero_casa || 'N/A'}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        title="Ver Detalles"
                        onClick={() => setSelectedUser(u)}
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      <button className={styles.actionBtn} title="Editar">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        className={styles.actionBtn}
                        title="Cambiar Estado"
                        onClick={() =>
                          onStatusChange(u.id_usuario, u.estado === 'Activo' ? 'Inactivo' : 'Activo')
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
        <div className={styles.tableFooter}>
          <span>Mostrando {filteredUsers.length} resultados</span>
          <div className={styles.pageButtons}>
            <button className={styles.pageBtn} disabled>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                chevron_left
              </span>
            </button>
            <button className={styles.pageBtn}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
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
              <div className={styles.formGroup}>
                <label>Nombre Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Cynthia Artieda"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>CI/RUC</label>
                <input
                  type="text"
                  value={doc}
                  onChange={(e) => setDoc(e.target.value)}
                  placeholder="17XXXXXXXX"
                  required
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Rol</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="Presidenta (Directiva)">Presidenta (Directiva)</option>
                    <option value="Tesorero (Directiva)">Tesorero (Directiva)</option>
                    <option value="Residente">Residente</option>
                    <option value="Guardia">Guardia</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>#Casa / Ubicación</label>
                  <input
                    type="text"
                    value={house}
                    onChange={(e) => setHouse(e.target.value)}
                    placeholder="A-01"
                    required
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
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

      {/* Detail Modal */}
      {selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Ficha de Usuario</h3>
              <button onClick={() => setSelectedUser(null)} className={styles.modalClose}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className={styles.detailList}>
              <div className={styles.detailRow}>
                <span>Nombre:</span>
                <span className={styles.detailValue}>
                  {selectedUser.nombres} {selectedUser.apellidos}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span>CI/RUC:</span>
                <span className={styles.detailMono}>{selectedUser.ci_ruc}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Rol:</span>
                <span className={styles.detailRole}>{selectedUser.Rol?.nombre || 'Sin Rol'}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Casa:</span>
                <span>{selectedUser.Casa?.numero_casa || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Correo:</span>
                <span>{selectedUser.correo || 'No registrado'}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Estado:</span>
                <span className={`${styles.statusTag} ${styles[selectedUser.estado.toLowerCase()]}`}>
                  {selectedUser.estado}
                </span>
              </div>
            </div>
            <div className={styles.formActions}>
              <button onClick={() => setSelectedUser(null)} className={styles.cancelBtn}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Registered;