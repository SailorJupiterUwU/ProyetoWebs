import React from 'react';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const movements = [
    { fecha: '24 Oct 2023', casa: 'Casa 42', rubro: 'Cuota Mantenimiento', color: '#f97316', monto: '+$125.00', positivo: true },
    { fecha: '23 Oct 2023', casa: 'Administración', rubro: 'Pago Jardinería', color: '#565e74', monto: '-$450.00', positivo: false, alt: true },
    { fecha: '22 Oct 2023', casa: 'Casa 15', rubro: 'Multa Convivencia', color: '#ba1a1a', monto: '+$50.00', positivo: true },
  ];

  return (
    <Layout>
      <div className={styles.container}>
        <PageHeader breadcrumbs={['Dashboard', 'Financiero']} title="Dashboard Financiero" subtitle="Resumen general del estado administrativo y financiero" />

        {/* KPI Summary Cards */}
        <section className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiStripe} style={{ backgroundColor: '#f97316' }} />
            <p className={styles.kpiLabel}>TOTAL INGRESOS</p>
            <p className={styles.kpiValue}>$26,805.36</p>
            <div className={`${styles.kpiBadge} ${styles.kpiBadgeUp}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
              <span>+4.2% vs mes ant.</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiStripe} style={{ backgroundColor: '#565e74' }} />
            <p className={styles.kpiLabel}>TOTAL EGRESOS</p>
            <p className={styles.kpiValue}>$27,543.26</p>
            <div className={`${styles.kpiBadge} ${styles.kpiBadgeDown}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_down</span>
              <span>+12.5% vs mes ant.</span>
            </div>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiCardAlert}`}>
            <div className={styles.kpiStripe} style={{ backgroundColor: '#ba1a1a' }} />
            <p className={styles.kpiLabel}>SALDO DEL PERIODO</p>
            <p className={styles.kpiValueAlert}>-$737.90</p>
            <p className={styles.kpiNote}>Requiere revisión presupuestal</p>
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

            <div className={styles.chartArea}>
              <div className={styles.chartGridLines}>
                <div /><div /><div /><div />
              </div>

              {[
                { mes: 'Ene', ingreso: 75, egreso: 45 },
                { mes: 'Feb', ingreso: 60, egreso: 85 },
                { mes: 'Mar', ingreso: 90, egreso: 65 },
                { mes: 'Abr', ingreso: 50, egreso: 35 },
              ].map((d) => (
                <div key={d.mes} className={styles.barGroup}>
                  <div className={styles.bars} style={{ height: `${Math.max(d.ingreso, d.egreso)}%` }}>
                    <div className={styles.barIngreso} style={{ height: `${(d.ingreso / Math.max(d.ingreso, d.egreso)) * 100}%` }} />
                    <div className={styles.barEgreso} style={{ height: `${(d.egreso / Math.max(d.ingreso, d.egreso)) * 100}%` }} />
                  </div>
                  <span className={styles.barLabel}>{d.mes}</span>
                </div>
              ))}
            </div>
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
                  <span className={styles.carteraValue} style={{ color: '#ba1a1a' }}>12</span>
                </div>
                <div className={styles.carteraItem}>
                  <span className={styles.carteraLabel}>Multas Generadas</span>
                  <span className={styles.carteraValue} style={{ color: '#f97316' }}>8</span>
                </div>
              </div>
            </div>

            <div className={styles.totalPendiente}>
              <p className={styles.totalPendienteLabel}>TOTAL PENDIENTE</p>
              <p className={styles.totalPendienteValue}>$6,528.00</p>
            </div>
          </div>
        </section>

        {/* Data Table Section: Recent Movements */}
        <section className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.cardTitle}>Últimos Movimientos</h3>
            <button className={styles.verTodosBtn}>
              <span>Ver Todos</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
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
                {movements.map((m, idx) => (
                  <tr key={idx} className={m.alt ? styles.rowAlt : ''}>
                    <td>{m.fecha}</td>
                    <td className={styles.casaCell}>{m.casa}</td>
                    <td>
                      <div className={styles.rubroCell}>
                        <span className={styles.rubroDot} style={{ backgroundColor: m.color }} />
                        <span>{m.rubro}</span>
                      </div>
                    </td>
                    <td className={styles.montoCell} style={{ color: m.positivo ? '#15803d' : '#191c1e' }}>
                      {m.monto}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;