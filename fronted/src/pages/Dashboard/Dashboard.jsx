import React from 'react';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';
import LoadingSpinner from '../../components/comunes/LoadingSpinner/LoadingSpinner';
import useDashboard from '../../hooks/useDashboard';
import { formatPrice, formatDate } from '../../utils/helpers';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { resumen, chartData, cartera, movimientos, loading, error } = useDashboard();

  const maxDelMes = (d) => Math.max(d.ingresos, d.egresos, 1);

  return (
    <Layout>
      <div className={styles.container}>
        <PageHeader
          breadcrumbs={['Dashboard', 'Financiero']}
          title="Dashboard Financiero"
          subtitle="Resumen general del estado administrativo y financiero"
        />

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className={styles.errorAlert}>{error}</div>
        ) : (
          <>
            {/* KPI Summary Cards */}
            <section className={styles.kpiGrid}>
              <div className={styles.kpiCard}>
                <div className={styles.kpiStripe} style={{ backgroundColor: '#f97316' }} />
                <p className={styles.kpiLabel}>TOTAL INGRESOS</p>
                <p className={styles.kpiValue}>{formatPrice(resumen.total_ingresos)}</p>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiStripe} style={{ backgroundColor: '#565e74' }} />
                <p className={styles.kpiLabel}>TOTAL EGRESOS</p>
                <p className={styles.kpiValue}>{formatPrice(resumen.total_egresos)}</p>
              </div>

              <div className={`${styles.kpiCard} ${resumen.saldo < 0 ? styles.kpiCardAlert : ''}`}>
                <div
                  className={styles.kpiStripe}
                  style={{ backgroundColor: resumen.saldo < 0 ? '#ba1a1a' : '#16a34a' }}
                />
                <p className={styles.kpiLabel}>SALDO DEL PERIODO</p>
                <p
                  className={resumen.saldo < 0 ? styles.kpiValueAlert : styles.kpiValue}
                >
                  {formatPrice(resumen.saldo)}
                </p>
                {resumen.saldo < 0 && (
                  <p className={styles.kpiNote}>Requiere revisión presupuestal</p>
                )}
              </div>
            </section>

            {/* Middle Section: Charts & Summary */}
            <section className={styles.middleGrid}>
              {/* Chart Area */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3 className={styles.cardTitle}>Ingresos vs Egresos</h3>
                  <div className={styles.legend}>
                    <span className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ backgroundColor: '#f97316' }} /> Ingresos
                    </span>
                    <span className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ backgroundColor: '#565e74' }} /> Egresos
                    </span>
                  </div>
                </div>

                {chartData.length === 0 ? (
                  <p className={styles.emptyChart}>No hay datos suficientes para graficar.</p>
                ) : (
                  <div className={styles.chartArea}>
                    <div className={styles.chartGridLines}>
                      <div /><div /><div /><div />
                    </div>

                    {chartData.map((d) => {
                      const max = maxDelMes(d);
                      return (
                        <div key={d.mes} className={styles.barGroup}>
                          <div className={styles.bars} style={{ height: '100%' }}>
                            <div
                              className={styles.barIngreso}
                              style={{ height: `${(d.ingresos / max) * 100}%` }}
                            />
                            <div
                              className={styles.barEgreso}
                              style={{ height: `${(d.egresos / max) * 100}%` }}
                            />
                          </div>
                          <span className={styles.barLabel}>{d.mes}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* State of Portfolio Area */}
              <div className={styles.carteraCard}>
                <div>
                  <h3 className={styles.carteraTitle}>
                    <span className="material-symbols-outlined" style={{ color: '#f97316' }}>warning</span>
                    <span>Estado de Cartera</span>
                  </h3>

                  <div className={styles.carteraList}>
                    <div className={styles.carteraItem}>
                      <span className={styles.carteraLabel}>Viviendas en Mora</span>
                      <span className={styles.carteraValue} style={{ color: '#ba1a1a' }}>
                        {cartera.viviendas_en_mora}
                      </span>
                    </div>
                    <div className={styles.carteraItem}>
                      <span className={styles.carteraLabel}>Multas Generadas</span>
                      <span className={styles.carteraValue} style={{ color: '#f97316' }}>
                        {cartera.multas_generadas}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.totalPendiente}>
                  <p className={styles.totalPendienteLabel}>TOTAL PENDIENTE</p>
                  <p className={styles.totalPendienteValue}>{formatPrice(cartera.total_pendiente)}</p>
                </div>
              </div>
            </section>

            {/* Data Table Section: Recent Movements */}
            <section className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <h3 className={styles.cardTitle}>Últimos Movimientos</h3>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>FECHA</th>
                      <th>CASA</th>
                      <th>RUBRO</th>
                      <th style={{ textAlign: 'right' }}>MONTO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.length === 0 ? (
                      <tr>
                        <td colSpan={4} className={styles.emptyCell}>
                          No hay movimientos recientes.
                        </td>
                      </tr>
                    ) : (
                      movimientos.map((m, idx) => {
                        const esIngreso = m.tipo === 'INGRESO';
                        return (
                          <tr key={idx} className={idx % 2 === 1 ? styles.rowAlt : ''}>
                            <td>{formatDate(m.fecha)}</td>
                            <td className={styles.casaCell}>{m.casa}</td>
                            <td>
                              <div className={styles.rubroCell}>
                                <span
                                  className={styles.rubroDot}
                                  style={{ backgroundColor: esIngreso ? '#f97316' : '#565e74' }}
                                />
                                <span>{m.rubro}</span>
                              </div>
                            </td>
                            <td
                              className={styles.montoCell}
                              style={{ color: esIngreso ? '#15803d' : '#191c1e' }}
                            >
                              {esIngreso ? '+' : '-'}
                              {formatPrice(Math.abs(m.monto))}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;