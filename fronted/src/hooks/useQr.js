import { useState, useCallback } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';

const useQr = () => {
  const [validando, setValidando] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const validar = useCallback(async (codigo) => {
    setValidando(true);
    try {
      const { data } = await api.post(ENDPOINTS.QR.VALIDAR, { codigo });
      return data;
    } catch (err) {
      return { valido: false, motivo: 'ERROR', error: handleApiError(err) };
    } finally {
      setValidando(false);
    }
  }, []);

  const registrarIngreso = useCallback(async (id) => {
    setProcesando(true);
    try {
      await api.patch(ENDPOINTS.QR.INGRESO(id));
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    } finally {
      setProcesando(false);
    }
  }, []);

  const registrarSalida = useCallback(async (id) => {
    setProcesando(true);
    try {
      await api.patch(ENDPOINTS.QR.SALIDA(id));
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    } finally {
      setProcesando(false);
    }
  }, []);

  const revocar = useCallback(async (id) => {
    setProcesando(true);
    try {
      await api.patch(ENDPOINTS.QR.REVOCAR(id));
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    } finally {
      setProcesando(false);
    }
  }, []);

  return { validar, registrarIngreso, registrarSalida, revocar, validando, procesando };
};

export default useQr;