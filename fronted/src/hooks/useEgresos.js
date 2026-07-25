import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';

const useEgresos = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [resumen, setResumen] = useState({
    egresos_del_mes: 0,
    variacion_pct: 0,
    pagos_pendientes: 0,
    facturas_por_vencer: 0,
    presupuesto_restante: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchEgresos = useCallback(
    async (customFilters) => {
      setLoading(true);
      setError(null);
      try {
        const activeFilters = customFilters || filters;
        const params = {
          fecha: activeFilters.fecha || undefined,
          num_factura: activeFilters.num_factura || undefined,
          estado: activeFilters.estado || undefined,
          monto_min: activeFilters.monto_min || undefined,
          monto_max: activeFilters.monto_max || undefined,
          page: activeFilters.page || page,
          limit,
        };
        const { data: res } = await api.get(ENDPOINTS.EGRESOS.LISTAR, { params });
        setData(res.data);
        setTotal(res.total);
        setPage(res.page);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [filters, page, limit]
  );

  const fetchResumen = useCallback(async () => {
    const now = new Date();
    try {
      const { data: res } = await api.get(ENDPOINTS.EGRESOS.RESUMEN, {
        params: { mes: now.getMonth() + 1, anio: now.getFullYear() },
      });
      setResumen(res);
    } catch (err) {
      setError(handleApiError(err));
    }
  }, []);

  useEffect(() => {
    fetchEgresos();
    fetchResumen();
  }, [fetchEgresos, fetchResumen]);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    fetchEgresos({ ...newFilters, page: 1 });
  };

  const crearEgreso = async (payload) => {
    try {
      const { data: res } = await api.post(ENDPOINTS.EGRESOS.CREAR, payload);
      await fetchEgresos();
      await fetchResumen();
      return { success: true, id: res.id_egreso };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const editarEgreso = async (id, cambios) => {
    try {
      await api.put(ENDPOINTS.EGRESOS.ACTUALIZAR(id), cambios);
      await fetchEgresos();
      await fetchResumen();
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  return {
    data,
    total,
    page,
    setPage,
    limit,
    resumen,
    loading,
    error,
    applyFilters,
    crearEgreso,
    editarEgreso,
  };
};

export default useEgresos;