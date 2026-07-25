import React, { useState } from 'react';
import styles from './Roles.module.css';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';

const Roles = () => {
  const [roles] = useState([
    {
      id: 'r1',
      name: 'Directiva',
      description: 'Acceso a finanzas, usuarios y administración',
      status: 'ACTIVO',
      permissionCount: 18,
    },
    {
      id: 'r2',
      name: 'Residente',
      description: 'Acceso a pagos, control QR y áreas comunes',
      status: 'ACTIVO',
      permissionCount: 6,
    },
    {
      id: 'r3',
      name: 'Guardia',
      description: 'Acceso a control QR, registro de visitas y bitácora',
      status: 'ACTIVO',
      permissionCount: 8,
    },
  ]);

  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <Layout>
      <div className={styles.container}>
        <PageHeader
          breadcrumbs={['Sistema', 'Roles']}
          title="Gestión de Roles"
          subtitle="Configuración de permisos y niveles de acceso al sistema."
        />

        {/* Data Table Card */}
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
                    key={row.id}
                    className={`${styles.row} ${idx % 2 === 1 ? styles.rowAlt : ''}`}
                  >
                    <td className={styles.nameCell}>{row.name}</td>
                    <td className={styles.descCell}>{row.description}</td>
                    <td className={styles.statusCell}>
                      <span className={styles.statusBadge}>
                        <span className={styles.statusDot} />
                        {row.status}
                      </span>
                    </td>
                    <td className={styles.actionsCellWrap}>
                      <div className={styles.actionsCell}>
                        <button
                          onClick={() => setSelectedRole(row)}
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

        {/* Role Permissions Modal */}
        {selectedRole && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Permisos: {selectedRole.name}</h3>
                <button onClick={() => setSelectedRole(null)} className={styles.modalCloseButton}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <p className={styles.modalDescription}>{selectedRole.description}</p>

              <div className={styles.permissionsList}>
                <div className={styles.permissionRow}>
                  <span>Gestión de Finanzas e Ingresos</span>
                  <span className={styles.permissionAllowed}>Permitido</span>
                </div>
                <div className={styles.permissionRow}>
                  <span>Generación y Escaneo de Pases QR</span>
                  <span className={styles.permissionAllowed}>Permitido</span>
                </div>
                <div className={styles.permissionRow}>
                  <span>Aprobación de Solicitudes de Usuario</span>
                  <span className={styles.permissionAllowed}>
                    {selectedRole.name === 'Directiva' ? 'Permitido' : 'Restringido'}
                  </span>
                </div>
                <div className={styles.permissionRow}>
                  <span>Acceso a Auditoría del Sistema</span>
                  <span className={styles.permissionAllowed}>
                    {selectedRole.name === 'Directiva' ? 'Permitido' : 'Restringido'}
                  </span>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button onClick={() => setSelectedRole(null)} className={styles.confirmButton}>
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