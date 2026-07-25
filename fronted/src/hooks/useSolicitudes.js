import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';

const useSolicitudes = () => {
  const [data, setData] = useState([]);
  const [resumen, setResumen] = useState({ solicitudes_hoy: 0, aprobados_mes: 0, rechazados: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get(ENDPOINTS.USUARIOS.SOLICITUDES.LISTAR);
      setData(res.data);
      setResumen(res.resumen);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const aprobar = async (id) => {
    try {
      await api.patch(ENDPOINTS.USUARIOS.SOLICITUDES.APROBAR(id));
      await fetchSolicitudes();
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const rechazar = async (id, motivo_rechazo) => {
    try {
      await api.patch(ENDPOINTS.USUARIOS.SOLICITUDES.RECHAZAR(id), { motivo_rechazo });
      await fetchSolicitudes();
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  return { data, resumen, loading, error, refetch: fetchSolicitudes, aprobar, rechazar };
};

export default useSolicitudes;