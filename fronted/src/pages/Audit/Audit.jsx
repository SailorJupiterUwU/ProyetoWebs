import React, { useState } from 'react';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';
import AuditLog from './AuditLog/AuditLog';
import History from './History/History';
import styles from './Audit.module.css';

const Audit = () => {
    const [activeTab, setActiveTab] = useState('auditoria');

    return (
        <Layout>
            <div className={styles.container}>
                <PageHeader breadcrumbs={['Sistema', 'Auditoría']} title="Auditoría del Sistema" />

                <div className={styles.tabs}>
                    <button
                        className={activeTab === 'historial' ? `${styles.tabButton} ${styles.tabButtonActive}` : styles.tabButton}
                        onClick={() => setActiveTab('historial')}
                    >
                        Historial
                    </button>
                    <button
                        className={activeTab === 'auditoria' ? `${styles.tabButton} ${styles.tabButtonActive}` : styles.tabButton}
                        onClick={() => setActiveTab('auditoria')}
                    >
                        Auditoría
                    </button>
                </div>

                {activeTab === 'historial' ? <History /> : <AuditLog />}
            </div>
        </Layout>
    );
};

export default Audit;