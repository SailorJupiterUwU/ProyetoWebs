import React, { useState } from 'react';
import useUsers from '../../hooks/useUsers';
import useSolicitudes from '../../hooks/useSolicitudes';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';
import Button from '../../components/comunes/Button/Button';
import LoadingSpinner from '../../components/comunes/LoadingSpinner/LoadingSpinner';
import UsersRegistered from './Registered/Registered';
import UsersPending from './Pending/Pending';
import styles from './Users.module.css';

const Users = () => {
  const usersHook = useUsers();
  const solicitudesHook = useSolicitudes();
  const [activeTab, setActiveTab] = useState('registered');
  const [showAddModal, setShowAddModal] = useState(false);

  const loading = activeTab === 'registered' ? usersHook.loading : solicitudesHook.loading;
  const error = activeTab === 'registered' ? usersHook.error : solicitudesHook.error;

  return (
    <Layout>
      <PageHeader
        breadcrumbs={['Usuarios', activeTab === 'registered' ? 'Registrados' : 'Solicitudes']}
        title={
          activeTab === 'registered'
            ? 'Usuarios Registrados'
            : 'Usuarios Pendientes de Aprobación'
        }
        subtitle={
          activeTab === 'registered'
            ? 'Directorio de residentes, guardias y directiva del conjunto.'
            : 'Gestione las nuevas solicitudes de ingreso al sistema residencial.'
        }
        action={
          activeTab === 'registered' && (
            <Button variant="primary" onClick={() => setShowAddModal(true)} icon="person_add" iconPosition="left">
              Nuevo Usuario
            </Button>
          )
        }
      />

      <div className={styles.tabBar}>
        <button
          onClick={() => setActiveTab('registered')}
          className={activeTab === 'registered' ? styles.tabActive : styles.tab}
        >
          Usuarios Registrados ({usersHook.data.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={activeTab === 'pending' ? styles.tabActive : styles.tab}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            pending_actions
          </span>
          <span>Pendientes de Aprobación</span>
          {solicitudesHook.data.length > 0 && (
            <span className={styles.tabBadge}>{solicitudesHook.data.length}</span>
          )}
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : activeTab === 'registered' ? (
        <UsersRegistered
          users={usersHook.data}
          onRefetch={usersHook.fetchUsers}
          onUpdateStatus={usersHook.updateStatus}
          onCreateUser={usersHook.createUser}
          onGetDetalle={usersHook.getDetalle}
          onEditUser={usersHook.editUser}
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
        />
      ) : (
        <UsersPending
          pendingUsers={solicitudesHook.data}
          resumen={solicitudesHook.resumen}
          onApprove={solicitudesHook.aprobar}
          onReject={solicitudesHook.rechazar}
        />
      )}
    </Layout>
  );
};

export default Users;