import { useState } from 'react';
import api from '../utils/api'
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';
import { useAuthContext } from '../context/AuthContext';

/**
 * Hook de autenticación: conecta con AuthController del backend
 * y sincroniza el resultado con AuthContext.
 */
const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login: setAuthSession, logout: clearAuthSession } = useAuthContext();

  const login = async (correo, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, {
        correo_login: correo,
        password,
      });
      setAuthSession(data.usuario, data.token);
      return { success: true };
    } catch (err) {
      const msg = handleApiError(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * @param {Object} formData - { nombres, apellidos, ci_ruc, numero_vivienda, correo_login, password, foto? }
   */
  const registro = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append('nombres', formData.nombres);
      payload.append('apellidos', formData.apellidos);
      payload.append('ci_ruc', formData.ci_ruc);
      payload.append('numero_vivienda', formData.numero_vivienda);
      payload.append('correo_login', formData.correo_login);
      payload.append('password', formData.password);
      if (formData.foto) {
        payload.append('foto', formData.foto);
      }

      const { data } = await api.post(ENDPOINTS.AUTH.REGISTRO, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { success: true, msg: data.msg };
    } catch (err) {
      const msg = handleApiError(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const recuperarPassword = async (correo) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        correo_login: correo,
      });
      return { success: true, msg: data.msg };
    } catch (err) {
      const msg = handleApiError(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, nuevaPassword) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        nueva_password: nuevaPassword,
      });
      return { success: true, msg: data.msg };
    } catch (err) {
      const msg = handleApiError(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (err) {
      // No bloqueamos el logout local aunque falle la llamada al backend
    } finally {
      clearAuthSession();
    }
  };

  return { login, registro, recuperarPassword, resetPassword, logout, loading, error };
};

export default useAuth;