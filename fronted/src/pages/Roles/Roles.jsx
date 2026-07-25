import React, { useState } from 'react';
import styles from './Roles.module.css';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';
import LoadingSpinner from '../../components/comunes/LoadingSpinner/LoadingSpinner';
import useRoles from '../../hooks/useRoles';

const Roles = () => {
  const { data: roles, loading, error, getModulos } = useRoles();
  const [selectedRole, setSelectedRole] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [loadingModulos, setLoadingModulos] = useState(false);

  const handleViewPermissions = async (role) => {
    setSelectedRole(role);
    setLoadingModulos(true);
    const result = await getModulos(role.id_rol);
    if (result.success) {
      setModulos(result.data);
    }
    setLoadingModulos(false);
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
                    <th className={styles.th}>Nombre del Rol</th>
                    <th className={styles.th}>Descripción</th>
                    <th className={styles.th}>Estado</th>
                    <th className={`${styles.th} ${styles.thRight}`}>Acciones</th>
                  </tr>
                </thead>
                <tbody className={styles.tbody}>
                  {roles.map((row, idx) => (
                    <tr
                      key={row.id_rol}
                      className={`${styles.row} ${idx % 2 === 1 ? styles.rowAlt : ''}`}
                    >
                      <td className={styles.nameCell}>{row.nombre}</td>
                      <td className={styles.descCell}>{row.descripcion}</td>
                      <td className={styles.statusCell}>
                        <span className={styles.statusBadge}>
                          <span className={styles.statusDot} />
                          {row.estado ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td className={styles.actionsCellWrap}>
                        <div className={styles.actionsCell}>
                          <button
                            onClick={() => handleViewPermissions(row)}
                            className={styles.iconButton}
                            title="Ver Permisos"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedRole && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Permisos: {selectedRole.nombre}</h3>
                <button
                  onClick={() => {
                    setSelectedRole(null);
                    setModulos([]);
                  }}
                  className={styles.modalCloseButton}
                >
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
                      <span>{m.nombre}</span>
                      <span
                        className={styles.permissionAllowed}
                        style={{ color: m.asignado ? '#16a34a' : '#9ca3af' }}
                      >
                        {m.asignado ? 'Permitido' : 'Restringido'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.modalFooter}>
                <button
                  onClick={() => {
                    setSelectedRole(null);
                    setModulos([]);
                  }}
                  className={styles.confirmButton}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Roles;