import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';

const usePresupuesto = (anioInicial = new Date().getFullYear()) => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [anio, setAnio] = useState(anioInicial);
  const [presupuestoActual, setPresupuestoActual] = useState(null);
  const [rubros, setRubros] = useState([]);
  const [totales, setTotales] = useState({ monto_asignado: 0, gasto_ejecutado: 0, saldo_disponible: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPresupuestos = useCallback(async () => {
    try {
      const { data: res } = await api.get(ENDPOINTS.PRESUPUESTO.LISTAR);
      setPresupuestos(res.data);
      return res.data;
    } catch (err) {
      setError(handleApiError(err));
      return [];
    }
  }, []);

  const fetchRubrosDePresupuesto = useCallback(async (id_presupuesto) => {
    try {
      const { data: res } = await api.get(ENDPOINTS.PRESUPUESTO.RUBROS.LISTAR(id_presupuesto));
      setRubros(res.data);
      setTotales(res.totales);
    } catch (err) {
      setError(handleApiError(err));
    }
  }, []);

  const loadAnio = useCallback(
    async (targetAnio) => {
      setLoading(true);
      setError(null);
      setRubros([]);
      setTotales({ monto_asignado: 0, gasto_ejecutado: 0, saldo_disponible: 0 });
      try {
        const lista = await fetchPresupuestos();
        const encontrado = lista
          .filter((p) => p.anio === targetAnio)
          .sort((a, b) => new Date(b.fecha_carga) - new Date(a.fecha_carga))[0] || null;
        setPresupuestoActual(encontrado || null);
        if (encontrado) {
          await fetchRubrosDePresupuesto(encontrado.id_presupuesto);
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchPresupuestos, fetchRubrosDePresupuesto]
  );

  useEffect(() => {
    loadAnio(anio);
  }, [anio, loadAnio]);

  const uploadBudget = async (archivo) => {
    try {
      // Enviamos el archivo como FormData (multipart/form-data)
      // para que multer en el backend pueda recibirlo correctamente.
      // Antes se enviaba como Base64 en JSON, lo que causaba error 413 (Payload Too Large).
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('anio', anio);

      const { data: res } = await api.post(ENDPOINTS.PRESUPUESTO.IMPORTAR, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await loadAnio(anio);
      return { success: true, msg: res.msg, rubros_creados: res.rubros_creados, alicuotas_creadas: res.alicuotas_creadas ?? 0 };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const agregarRubro = async (id_rubro, monto_asignado) => {
    if (!presupuestoActual) {
      return { success: false, error: `No existe un presupuesto creado para el año ${anio}. Impórtalo primero.` };
    }
    try {
      await api.post(ENDPOINTS.PRESUPUESTO.RUBROS.AGREGAR(presupuestoActual.id_presupuesto), {
        id_rubro,
        monto_asignado,
      });
      await fetchRubrosDePresupuesto(presupuestoActual.id_presupuesto);
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const editarMontoRubro = async (id_rubro, monto_asignado) => {
    if (!presupuestoActual) {
      return { success: false, error: 'No hay un presupuesto activo para editar.' };
    }
    try {
      await api.put(
        ENDPOINTS.PRESUPUESTO.RUBROS.EDITAR_MONTO(presupuestoActual.id_presupuesto, id_rubro),
        { monto_asignado }
      );
      await fetchRubrosDePresupuesto(presupuestoActual.id_presupuesto);
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  return {
    presupuestos,
    anio,
    setAnio,
    presupuestoActual,
    rubros,
    totales,
    loading,
    error,
    uploadBudget,
    agregarRubro,
    editarMontoRubro,
  };
};

export default usePresupuesto;