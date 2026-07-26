import React, { useState } from 'react';
import LoadingSpinner from '../../../components/comunes/LoadingSpinner/LoadingSpinner';
import useHistorial from '../../../hooks/useHistorial';
import useRubros from '../../../hooks/useRubros';
import { formatDate, formatPrice } from '../../../utils/helpers';
import styles from './History.module.css';

const History = () => {
    const { data: movimientos, loading, error, refetch } = useHistorial();
    const { data: rubros } = useRubros();

    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [idRubro, setIdRubro] = useState('');

    const applyFilters = () => {
        refetch({
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            id_rubro: idRubro || undefined,
        });
    };

    const clearFilters = () => {
        setFechaInicio('');
        setFechaFin('');
        setIdRubro('');
        refetch();
    };

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
                        <label className={styles.label}>Filtrar por Rubro</label>
                        <div className={styles.inputWrapper}>
                            <select
                                value={idRubro}
                                onChange={(e) => setIdRubro(e.target.value)}
                                className={styles.select}
                            >
                                <option value="">Todos los rubros</option>
                                {rubros.map((r) => (
                                    <option key={r.id_rubro} value={r.id_rubro}>
                                        {r.codigo} — {r.nombre}
                                    </option>
                                ))}
                            </select>
                            <span className={`material-symbols-outlined ${styles.selectIcon}`}>
                                arrow_drop_down
                            </span>
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
                                    <th className={styles.th}>Fecha</th>
                                    <th className={styles.th}>Tipo</th>
                                    <th className={styles.th}>Rubro</th>
                                    <th className={styles.th}>Descripción</th>
                                    <th className={`${styles.th} ${styles.thRight}`}>Monto</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {movimientos.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className={styles.emptyCell}>
                                            No se encontraron movimientos con los filtros aplicados.
                                        </td>
                                    </tr>
                                ) : (
                                    movimientos.map((row, idx) => (
                                        <tr
                                            key={`${row.fecha}-${idx}`}
                                            className={`${styles.row} ${idx % 2 === 1 ? styles.rowAlt : ''}`}
                                        >
                                            <td className={styles.dateCell}>{formatDate(row.fecha)}</td>
                                            <td>
                                                <span
                                                    className={`${styles.tipoBadge} ${row.tipo === 'INGRESO' ? styles.tipoIngreso : styles.tipoEgreso
                                                        }`}
                                                >
                                                    {row.tipo}
                                                </span>
                                            </td>
                                            <td className={styles.rubroCell}>{row.rubro_nombre}</td>
                                            <td className={styles.descCell}>{row.descripcion}</td>
                                            <td
                                                className={`${styles.montoCell} ${row.tipo === 'INGRESO' ? styles.montoPositivo : ''
                                                    }`}
                                            >
                                                {row.tipo === 'INGRESO' ? '+' : '-'}
                                                {formatPrice(Math.abs(row.monto))}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.pagination}>
                        <span className={styles.paginationInfo}>
                            Mostrando {movimientos.length} registros
                        </span>
                    </div>
                </section>
            )}
        </>
    );
};

export default History;