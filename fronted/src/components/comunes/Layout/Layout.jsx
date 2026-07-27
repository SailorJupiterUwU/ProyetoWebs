import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';
import styles from './Layout.module.css';

const NAV_ITEMS = [
  { to: '/', icon: 'dashboard', label: 'Dashboard', modulo: 'Dashboard', roles: ['Presidenta', 'Tesorera'] },
  { to: '/usuarios', icon: 'group', label: 'Usuarios', modulo: 'Usuarios', roles: ['Presidenta'] },
  { to: '/roles', icon: 'shield_person', label: 'Roles', modulo: 'Roles', roles: ['Presidenta'] },
  { to: '/viviendas', icon: 'home_work', label: 'Viviendas', modulo: 'Viviendas', roles: ['Presidenta'] },
  { to: '/presupuesto', icon: 'account_balance_wallet', label: 'Presupuestos', modulo: 'Presupuestos', roles: ['Presidenta', 'Tesorera'] },
  { to: '/ingresos', icon: 'receipt_long', label: 'Ingresos', modulo: 'Ingresos', roles: ['Presidenta', 'Tesorera', 'Residente'] },
  { to: '/egresos', icon: 'trending_down', label: 'Egresos', modulo: 'Egresos', roles: ['Presidenta', 'Tesorera'] },
  { to: '/seguridad/generar', icon: 'qr_code_2', label: 'Control QR', modulo: 'Control QR', roles: ['Presidenta', 'Tesorera', 'Residente', 'Guardia'] },
  { to: '/auditoria', icon: 'change_history', label: 'Auditoría', modulo: 'Auditoria', roles: ['Presidenta', 'Tesorera'] },
  { to: '/proveedores', icon: 'local_shipping', label: 'Proveedores', modulo: 'Proveedores', roles: ['Presidenta', 'Tesorera'] },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter((item) => {
    // 1. Filtrado dinámico por módulos devueltos por el backend (Opción B)
    if (Array.isArray(user?.modulos) && user.modulos.length > 0) {
      return user.modulos.some(
        (m) =>
          typeof m === 'string' &&
          (m.toLowerCase() === item.modulo.toLowerCase() ||
           m.toLowerCase() === item.label.toLowerCase())
      );
    }

    // 2. Fallback retrocompatible por rol (string u objeto)
    const userRole = typeof user?.rol === 'object' ? user?.rol?.nombre : user?.rol;
    return item.roles.some(
      (r) => typeof r === 'string' && r.toLowerCase() === userRole?.toLowerCase()
    );
  });

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.logoContainer}>
          <div className={styles.logoBadge}>
            <span className="material-symbols-outlined">security</span>
          </div>
          {!collapsed && <h1 className={styles.logoText}>CondoSecure</h1>}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={styles.toggleButton}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <span className="material-symbols-outlined">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>

        <nav className={styles.nav}>
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.userFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.nombres?.charAt(0) || 'U'}{user?.apellidos?.charAt(0) || ''}
            </div>
            {!collapsed && (
              <div className={styles.userDetails}>
                <p className={styles.userName}>{user?.nombres} {user?.apellidos}</p>
                <p className={styles.userRole}>
                  Rol: {typeof user?.rol === 'object' ? user?.rol?.nombre : (user?.rol || 'Usuario')}
                </p>
              </div>
            )}
          </div>

          {!collapsed ? (
            <div className={styles.footerActions}>
              <button
                onClick={() => navigate('/auditoria?modulo=Seguridad')}
                className={styles.footerLinkButton}
              >
                <span className="material-symbols-outlined">visibility</span>
                <span>Ver Visitas</span>
              </button>
              <button onClick={handleLogout} className={styles.footerLinkButton}>
                <span className="material-symbols-outlined">logout</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className={styles.logoutButtonCollapsed} title="Cerrar Sesión">
              <span className="material-symbols-outlined">logout</span>
            </button>
          )}
        </div>
      </aside>

      <main className={`${styles.main} ${collapsed ? styles.mainExpanded : ''}`}>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;