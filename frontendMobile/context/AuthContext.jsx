import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authEvents } from '../utils/authEvents';

const AuthContext = createContext();

/**
 * Proveedor del contexto de autenticación
 * Gestiona el estado del usuario, el token y la persistencia (AsyncStorage)
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Al cargar la app, recuperar token + usuario de AsyncStorage
        const rehydrate = async () => {
            try {
                const [[, storedToken], [, storedUser]] = await AsyncStorage.multiGet([
                    'authToken',
                    'userData',
                ]);
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Error al parsear datos del usuario:', error);
                await logout();
            } finally {
                setLoading(false);
            }
        };
        rehydrate();
    }, []);

    useEffect(() => {
        // api.js emite este evento cuando el backend responde 401
        const unsubscribe = authEvents.onUnauthorized(() => {
            setUser(null);
            setToken(null);
        });
        return unsubscribe;
    }, []);

    /**
     * Inicia sesión en la aplicación
     * @param {Object} userData - Datos del usuario devueltos por la API
     * @param {string} authToken - Token JWT
     */
    const login = async (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        await AsyncStorage.multiSet([
            ['authToken', authToken],
            ['userData', JSON.stringify(userData)],
        ]);
    };

    /**
     * Cierra la sesión y limpia el almacenamiento local
     */
    const logout = async () => {
        setUser(null);
        setToken(null);
        await AsyncStorage.multiRemove(['authToken', 'userData']);
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
        hasRole,
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
