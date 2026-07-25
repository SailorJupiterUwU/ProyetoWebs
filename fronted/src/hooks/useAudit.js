import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';

/**
 * Hook para gestionar la bitácora de auditoría
 * @returns {Object} { data, loading, error, refetch }
 */
const useAudit = (immediate = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAudit = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        fecha_inicio: filters.fecha_inicio || undefined,
        fecha_fin: filters.fecha_fin || undefined,
        id_rol: filters.id_rol || undefined,
        id_usuario: filters.id_usuario || undefined,
      };
      const { data: res } = await api.get(ENDPOINTS.AUDITORIA.LISTAR, { params });
      setData(res.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      fetchAudit();
    }
  }, [fetchAudit, immediate]);

  return {
    data,
    loading,
    error,
    refetch: fetchAudit,
  };
};

export default useAudit;