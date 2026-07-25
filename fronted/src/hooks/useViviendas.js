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

  return { data, loading, error, refetch: fetchViviendas };
};

export default useViviendas;