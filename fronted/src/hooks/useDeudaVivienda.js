import { useState, useEffect } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';

const useDeudaVivienda = (id_vivienda) => {
  const [alicuotas, setAlicuotas] = useState([]);
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id_vivienda) {
      setAlicuotas([]);
      setMultas([]);
      return;
    }
    const fetchDeuda = async () => {
      setLoading(true);
      setError(null);
      try {
        const [alicuotasRes, multasRes] = await Promise.all([
          api.get(ENDPOINTS.ALICUOTAS.LISTAR, { params: { id_vivienda, estado: 'PENDIENTE' } }),
          api.get(ENDPOINTS.MULTAS.LISTAR, { params: { id_vivienda, estado: 'PENDIENTE' } }),
        ]);
        setAlicuotas(alicuotasRes.data.data);
        setMultas(multasRes.data.data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchDeuda();
  }, [id_vivienda]);

  return { alicuotas, multas, loading, error };
};

export default useDeudaVivienda;