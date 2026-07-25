import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';

const useIngresos = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [resumen, setResumen] = useState({
    ingresos_del_mes: 0,
    variacion_pct: 0,
    pendientes_cobro: 0,
    recibos_pendientes: 0,
    multas_recaudadas: 0,
  });
  const [distribucion, setDistribucion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIngresos = useCallback(
    async (filters = {}) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          fecha_inicio: filters.fecha_inicio || undefined,
          fecha_fin: filters.fecha_fin || undefined,
          numero_vivienda: filters.numero_vivienda || undefined,
          estado: filters.estado || undefined,
          page: filters.page || page,
          limit,
        };
        const { data: res } = await api.get(ENDPOINTS.INGRESOS.LISTAR, { params });
        setData(res.data);
        setTotal(res.total);
        setPage(res.page);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [page, limit]
  );

  const fetchResumenYDistribucion = useCallback(async () => {
    const now = new Date();
    const mes = now.getMonth() + 1;
    const anio = now.getFullYear();
    try {
      const [resumenRes, distRes] = await Promise.all([
        api.get(ENDPOINTS.INGRESOS.RESUMEN, { params: { mes, anio } }),
        api.get(ENDPOINTS.INGRESOS.DISTRIBUCION, { params: { mes, anio } }),
      ]);
      setResumen(resumenRes.data);
      setDistribucion(distRes.data.data);
    } catch (err) {
      setError(handleApiError(err));
    }
  }, []);

  useEffect(() => {
    fetchIngresos();
    fetchResumenYDistribucion();
  }, [fetchIngresos, fetchResumenYDistribucion]);

  const crearIngreso = async ({ id_vivienda, id_alicuota, id_multa, descripcion, comprobante }) => {
    try {
      let payload;
      let headers = {};
      if (comprobante) {
        payload = new FormData();
        payload.append('id_vivienda', id_vivienda);
        if (id_alicuota) payload.append('id_alicuota', id_alicuota);
        if (id_multa) payload.append('id_multa', id_multa);
        payload.append('descripcion', descripcion);
        payload.append('comprobante', comprobante);
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        payload = { id_vivienda, id_alicuota, id_multa, descripcion };
      }
      const { data: res } = await api.post(ENDPOINTS.INGRESOS.CREAR, payload, { headers });
      await fetchIngresos();
      await fetchResumenYDistribucion();
      return { success: true, id: res.id_ingreso };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  return {
    data,
    total,
    page,
    setPage,
    resumen,
    distribucion,
    loading,
    error,
    fetchIngresos,
    crearIngreso,
  };
};

export default useIngresos;