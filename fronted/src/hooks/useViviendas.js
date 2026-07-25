import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';

const useViviendas = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchViviendas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get(ENDPOINTS.VIVIENDAS.LISTAR);
      setData(res.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchViviendas();
  }, [fetchViviendas]);

  const crearVivienda = async ({ numero, porcentaje_alicuota }) => {
    try {
      const { data: res } = await api.post(ENDPOINTS.VIVIENDAS.CREAR, {
        numero,
        porcentaje_alicuota,
      });
      await fetchViviendas();
      return { success: true, id: res.id_vivienda };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const editarVivienda = async (id, cambios) => {
    try {
      await api.put(ENDPOINTS.VIVIENDAS.ACTUALIZAR(id), cambios);
      await fetchViviendas();
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await api.patch(ENDPOINTS.VIVIENDAS.CAMBIAR_ESTADO(id), { estado });
      await fetchViviendas();
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchViviendas,
    crearVivienda,
    editarVivienda,
    cambiarEstado,
  };
};

export default useViviendas;