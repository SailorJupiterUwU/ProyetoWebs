import React, { useState } from 'react';
import useUsers from '../../hooks/useUsers';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';
import Button from '../../components/comunes/Button/Button';
import LoadingSpinner from '../../components/comunes/LoadingSpinner/LoadingSpinner';
import UsersRegistered from './Registered/Registered';
import UsersPending from './Pending/Pending';
import styles from './Users.module.css';

const Users = () => {
  const { data: users, loading, error, updateStatus } = useUsers();
  const [activeTab, setActiveTab] = useState('registered');
  const [showAddModal, setShowAddModal] = useState(false);

  const registeredUsers = users.filter((u) => u.estado !== 'Pendiente');
  const pendingUsers = users.filter((u) => u.estado === 'Pendiente');

  const handleStatusChange = async (id, newStatus) => {
    if (window.confirm(`¿Está seguro de cambiar el estado a ${newStatus}?`)) {
      await updateStatus(id, newStatus);
    }
  };

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
          Usuarios Registrados ({registeredUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={activeTab === 'pending' ? styles.tabActive : styles.tab}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            pending_actions
          </span>
          <span>Pendientes de Aprobación</span>
          {pendingUsers.length > 0 && (
            <span className={styles.tabBadge}>{pendingUsers.length}</span>
          )}
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : activeTab === 'registered' ? (
        <UsersRegistered
          users={registeredUsers}
          onStatusChange={handleStatusChange}
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
        />
      ) : (
        <UsersPending
          pendingUsers={pendingUsers}
          registeredCount={registeredUsers.length}
          activeCount={registeredUsers.filter((u) => u.estado === 'Activo').length}
          inactiveCount={registeredUsers.filter((u) => u.estado === 'Inactivo').length}
          onApprove={(id) => handleStatusChange(id, 'Activo')}
          onReject={(id) => handleStatusChange(id, 'Inactivo')}
        />
      )}
    </Layout>
  );
};

export default Users;