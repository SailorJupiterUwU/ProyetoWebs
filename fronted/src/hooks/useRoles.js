import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';

const useRoles = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get(ENDPOINTS.ROLES.LISTAR);
      setData(res.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const updateStatus = async (id, estado) => {
    try {
      await api.patch(ENDPOINTS.ROLES.CAMBIAR_ESTADO(id), { estado });
      await fetchRoles();
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const getModulos = async (id) => {
    try {
      const { data: res } = await api.get(ENDPOINTS.ROLES.MODULOS(id));
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const updateModulos = async (id, modulos) => {
    try {
      await api.put(ENDPOINTS.ROLES.MODULOS(id), { modulos });
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const editRol = async (id, payload) => {
    try {
      await api.put(ENDPOINTS.ROLES.ACTUALIZAR(id), payload);
      await fetchRoles();
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  return { data, loading, error, refetch: fetchRoles, updateStatus, getModulos, updateModulos, editRol };
};

export default useRoles;