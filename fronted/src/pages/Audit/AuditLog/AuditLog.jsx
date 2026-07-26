import React, { useState } from 'react';
import LoadingSpinner from '../../../components/comunes/LoadingSpinner/LoadingSpinner';
import useAudit from '../../../hooks/useAudit';
import useRoles from '../../../hooks/useRoles';
import { formatDate } from '../../../utils/helpers';
import styles from './AuditLog.module.css';

const AuditLog = () => {
    const { data: logs, loading, error, refetch } = useAudit();
    const { data: roles } = useRoles();

    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [idRol, setIdRol] = useState('');
    const [searchUser, setSearchTerm] = useState('');

    const applyFilters = () => {
        refetch({
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            id_rol: idRol || undefined,
        });
    };

    const clearFilters = () => {
        setFechaInicio('');
        setFechaFin('');
        setIdRol('');
        setSearchTerm('');
        refetch();
    };

    const filteredLogs = logs.filter((log) =>
        searchUser ? log.usuario_nombre?.toLowerCase().includes(searchUser.toLowerCase()) : true
    );

    return (
        <>
            <section className={styles.filtersSection}>
                <div className={styles.filtersRow}>
                    <div className={styles.filterGroup}>
                        <label className={styles.label}>Desde</label>
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.label}>Hasta</label>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.label}>Filtrar por Rol</label>
                        <div className={styles.inputWrapper}>
                            <select
                                value={idRol}
                                onChange={(e) => setIdRol(e.target.value)}
                                className={styles.select}
                            >
                                <option value="">Todos los roles</option>
                                {roles.map((r) => (
                                    <option key={r.id_rol} value={r.id_rol}>
                                        {r.nombre}
                                    </option>
                                ))}
                            </select>
                            <span className={`material-symbols-outlined ${styles.selectIcon}`}>
                                arrow_drop_down
                            </span>
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.label}>Buscar por Usuario</label>
                        <div className={styles.inputWrapper}>
                            <span className={`material-symbols-outlined ${styles.iconLeft}`}>
                                person_search
                            </span>
                            <input
                                type="text"
                                placeholder="Nombre..."
                                value={searchUser}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <button onClick={applyFilters} className={styles.applyButton}>
                        <span className={`material-symbols-outlined ${styles.applyIcon}`}>
                            filter_list
                        </span>
                        <span>Aplicar Filtros</span>
                    </button>
                    <button onClick={clearFilters} className={styles.clearButton}>
                        <span className="material-symbols-outlined">close</span>
                        <span>Limpiar</span>
                    </button>
                </div>
            </section>

            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <div className={styles.errorAlert}>{error}</div>
            ) : (
                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr className={styles.theadRow}>
                                    <th className={styles.th}>Fecha y Hora</th>
                                    <th className={styles.th}>Usuario</th>
                                    <th className={styles.th}>Rol</th>
                                    <th className={styles.th}>Módulo</th>
                                    <th className={styles.th}>Acción Realizada</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className={styles.emptyCell}>
                                            No se encontraron registros con los filtros aplicados.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((row, idx) => (
                                        <tr
                                            key={`${row.usuario_nombre}-${row.fecha}-${idx}`}
                                            className={`${styles.row} ${idx % 2 === 1 ? styles.rowAlt : ''}`}
                                        >
                                            <td className={styles.timestamp}>{formatDate(row.fecha)}</td>
                                            <td className={styles.userCell}>{row.usuario_nombre}</td>
                                            <td className={styles.roleCell}>
                                                <span className={styles.roleBadge}>{row.rol_nombre}</span>
                                            </td>
                                            <td className={styles.moduleCell}>{row.modulo_nombre}</td>
                                            <td
                                                className={`${styles.actionCell} ${logIsFailure(row.accion) ? styles.actionError : ''
                                                    }`}
                                            >
                                                {row.accion}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.pagination}>
                        <span className={styles.paginationInfo}>
                            Mostrando {filteredLogs.length} de {logs.length} registros
                        </span>
                    </div>
                </section>
            )}
        </>
    );
};

export default AuditLog;

function logIsFailure(actionText) {
    return actionText?.toLowerCase().includes('falló') || actionText?.toLowerCase().includes('error');
}