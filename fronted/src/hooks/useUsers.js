import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';

const useUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search: filters.search || '',
        estado: filters.estado || 'todos',
      };
      const { data: res } = await api.get(ENDPOINTS.USUARIOS.LISTAR, { params });
      setData(res.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (payload) => {
    try {
      const { data: res } = await api.post(ENDPOINTS.USUARIOS.CREAR, payload);
      await fetchUsers();
      return { success: true, id: res.id_usuario };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const updateStatus = async (id, estado) => {
    try {
      await api.patch(ENDPOINTS.USUARIOS.CAMBIAR_ESTADO(id), { estado });
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const getDetalle = async (id) => {
    try {
      const { data: res } = await api.get(ENDPOINTS.USUARIOS.OBTENER(id));
      return { success: true, data: res };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const editUser = async (id, payload) => {
    try {
      await api.put(ENDPOINTS.USUARIOS.ACTUALIZAR(id), payload);
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  return { data, loading, error, fetchUsers, createUser, updateStatus, getDetalle, editUser };
};

export default useUsers;