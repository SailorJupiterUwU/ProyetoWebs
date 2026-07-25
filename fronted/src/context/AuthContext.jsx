import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

/**
 * Proveedor del contexto de autenticación
 * Gestiona el estado del usuario, el token y la persistencia
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al cargar la app, recuperar el usuario de localStorage si existe el token
    const storedUser = localStorage.getItem('userData');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  /**
   * Inicia sesión en la aplicación
   * @param {Object} userData - Datos del usuario devueltos por la API
   * @param {string} authToken - Token JWT
   */
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  /**
   * Cierra la sesión y limpia el almacenamiento local
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string|string[]} roles - Rol o lista de roles permitidos
   * @returns {boolean}
   */
  const hasRole = (roles) => {
    if (!user || !user.rol) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.rol);
    }
    return user.rol === roles;
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook personalizado para usar el contexto de autenticación
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  return context;
};
