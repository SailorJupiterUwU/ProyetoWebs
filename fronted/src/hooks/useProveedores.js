import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';

const useProveedores = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProveedores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get(ENDPOINTS.PROVEEDORES.LISTAR);
      setData(res.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  const crearProveedor = async (nombre) => {
    try {
      const { data: res } = await api.post(ENDPOINTS.PROVEEDORES.CREAR, { nombre });
      await fetchProveedores();
      return { success: true, id: res.id_proveedor };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const editarProveedor = async (id, cambios) => {
    try {
      await api.put(ENDPOINTS.PROVEEDORES.ACTUALIZAR(id), cambios);
      await fetchProveedores();
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const eliminarProveedor = async (id) => {
    // No existe DELETE real en el backend — "eliminar" = desactivar
    return editarProveedor(id, { estado: false });
  };

  return {
    data,
    loading,
    error,
    refetch: fetchProveedores,
    crearProveedor,
    editarProveedor,
    eliminarProveedor,
  };
};

export default useProveedores;