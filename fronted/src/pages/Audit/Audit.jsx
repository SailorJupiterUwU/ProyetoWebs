import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';
import styles from './Audit.module.css';

const Audit = () => {
    const [searchParams] = useSearchParams();
    const moduloParam = searchParams.get('modulo');

    const [logs] = useState([
        {
            id: 'log1',
            timestamp: '23/07/2026 09:15',
            user: 'Oscar Ortega',
            role: 'Directiva',
            module: 'Finanzas',
            action: 'Registró un nuevo ingreso de $80.00',
            statusType: 'success',
        },
        {
            id: 'log2',
            timestamp: '23/07/2026 08:40',
            user: 'Sistema',
            role: 'Automatización',
            module: 'Seguridad',
            action: 'Falló la validación de un código QR expirado',
            statusType: 'error',
        },
    ]);

    const [filterDate, setFilterDate] = useState('');
    const [filterRole, setFilterRole] = useState('Todos los roles');
    const [searchUser, setSearchTerm] = useState('');
    const [filterModule, setFilterModule] = useState(moduloParam || 'Todos los módulos');

    // Si llega un nuevo query param (ej. navegando de nuevo desde el botón), actualiza el filtro
    useEffect(() => {
        if (moduloParam) {
            setFilterModule(moduloParam);
        }
    }, [moduloParam]);

    const filteredLogs = logs.filter((log) => {
        if (filterRole !== 'Todos los roles' && !log.role.toLowerCase().includes(filterRole.toLowerCase())) {
            return false;
        }
        if (filterModule !== 'Todos los módulos' && log.module !== filterModule) {
            return false;
        }
        if (searchUser && !log.user.toLowerCase().includes(searchUser.toLowerCase())) {
            return false;
        }
        if (filterDate && !log.timestamp.includes(filterDate)) {
            return false;
        }
        return true;
    });

    return (
        <Layout>
            <div className={styles.container}>
                <PageHeader
                    breadcrumbs={['Sistema', 'Auditoría']}
                    title={filterModule === 'Seguridad' ? 'Visitas y Accesos QR' : 'Auditoría del Sistema'}
                />

                <div className={styles.headerBlock}>
                    <div className={styles.tabs}>
                        <button className={styles.tabButton}>Historial</button>
                        <button className={`${styles.tabButton} ${styles.tabButtonActive}`}>
                            Auditoría
                        </button>
                    </div>
                </div>

                <section className={styles.filtersSection}>
                    <div className={styles.filtersRow}>
                        <div className={styles.filterGroup}>
                            <label className={styles.label}>Filtrar por Fecha</label>
                            <div className={styles.inputWrapper}>
                                <span className={`material-symbols-outlined ${styles.iconLeft}`}>
                                    calendar_today
                                </span>
                                <input
                                    type="text"
                                    placeholder="DD/MM/YYYY - DD/MM/YYYY"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.label}>Filtrar por Rol</label>
                            <div className={styles.inputWrapper}>
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="Todos los roles">Todos los roles</option>
                                    <option value="Directiva">Directiva</option>
                                    <option value="Guardia">Guardia</option>
                                    <option value="Automatización">Automatización</option>
                                </select>
                                <span className={`material-symbols-outlined ${styles.selectIcon}`}>
                                    arrow_drop_down
                                </span>
                            </div>
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.label}>Filtrar por Módulo</label>
                            <div className={styles.inputWrapper}>
                                <select
                                    value={filterModule}
                                    onChange={(e) => setFilterModule(e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="Todos los módulos">Todos los módulos</option>
                                    <option value="Seguridad">Seguridad</option>
                                    <option value="Finanzas">Finanzas</option>
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
                                    placeholder="Nombre o ID..."
                                    value={searchUser}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setFilterDate('');
                                setFilterRole('Todos los roles');
                                setSearchTerm('');
                                setFilterModule('Todos los módulos');
                            }}
                            className={styles.applyButton}
                        >
                            <span className={`material-symbols-outlined ${styles.applyIcon}`}>
                                filter_list
                            </span>
                            <span>Limpiar Filtros</span>
                        </button>
                    </div>
                </section>

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
                                {filteredLogs.map((row, idx) => (
                                    <tr
                                        key={row.id}
                                        className={`${styles.row} ${idx % 2 === 1 ? styles.rowAlt : ''}`}
                                    >
                                        <td className={styles.timestamp}>{row.timestamp}</td>
                                        <td className={styles.userCell}>{row.user}</td>
                                        <td className={styles.roleCell}>
                                            <span className={styles.roleBadge}>{row.role}</span>
                                        </td>
                                        <td className={styles.moduleCell}>{row.module}</td>
                                        <td
                                            className={`${styles.actionCell} ${row.statusType === 'error' || logIsFailure(row.action)
                                                    ? styles.actionError
                                                    : ''
                                                }`}
                                        >
                                            {row.action}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.pagination}>
                        <span className={styles.paginationInfo}>
                            Mostrando 1 a {filteredLogs.length} de {logs.length} registros
                        </span>
                        <div className={styles.pageButtons}>
                            <button className={styles.pageButton} disabled>
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className={styles.pageButton}>
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default Audit;

function logIsFailure(actionText) {
    return actionText.toLowerCase().includes('falló') || actionText.toLowerCase().includes('error');
}