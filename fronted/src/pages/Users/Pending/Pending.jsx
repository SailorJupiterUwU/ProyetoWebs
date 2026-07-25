import React, { useState } from 'react';
import styles from './Pending.module.css';

const Pending = ({ pendingUsers, resumen, onApprove, onReject }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPending = pendingUsers.filter(
    (u) =>
      u.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.ci_ruc?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReject = (id) => {
    const motivo = window.prompt('Motivo del rechazo:');
    if (motivo === null) return; // canceló
    onReject(id, motivo || 'No especificado');
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
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fecha de Solicitud</th>
              <th>Nombres</th>
              <th>CI/RUC</th>
              <th>#Casa</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPending.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.empty}>
                  No hay solicitudes pendientes de aprobación
                </td>
              </tr>
            ) : (
              filteredPending.map((p) => {
                const initials = `${p.nombres?.[0] || ''}${p.apellidos?.[0] || ''}`.toUpperCase();
                return (
                  <tr key={p.id_usuario}>
                    <td>{p.fecha_registro || '—'}</td>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatarPending}>{initials || 'JP'}</div>
                        <span className={styles.name}>
                          {p.nombres} {p.apellidos}
                        </span>
                      </div>
                    </td>
                    <td className={styles.docCell}>{p.ci_ruc}</td>
                    <td>
                      <span className={styles.houseTag}>{p.numero_vivienda || 'N/A'}</span>
                    </td>
                    <td>
                      <div className={styles.pendingActions}>
                        <button className={styles.approveBtn} onClick={() => onApprove(p.id_usuario)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            check_circle
                          </span>
                          <span>Aprobar</span>
                        </button>
                        <button className={styles.rejectBtn} onClick={() => handleReject(p.id_usuario)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            cancel
                          </span>
                          <span>Rechazar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statBox}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(249,115,22,0.15)', color: '#f97316' }}>
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div>
            <p className={styles.statLabel}>SOLICITUDES HOY</p>
            <h4 className={styles.statValue}>{resumen.solicitudes_hoy}</h4>
          </div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(36,51,72,0.15)', color: '#243348' }}>
            <span className="material-symbols-outlined">how_to_reg</span>
          </div>
          <div>
            <p className={styles.statLabel}>APROBADOS MES</p>
            <h4 className={styles.statValue}>{resumen.aprobados_mes}</h4>
          </div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statIcon} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div>
            <p className={styles.statLabel}>RECHAZADOS</p>
            <h4 className={styles.statValue}>{resumen.rechazados}</h4>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pending;