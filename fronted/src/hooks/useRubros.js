import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';

const useRubros = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRubros = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: res } = await api.get(ENDPOINTS.RUBROS.LISTAR);
            setData(res.data);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRubros();
    }, [fetchRubros]);

    return { data, loading, error, refetch: fetchRubros };
};

export default useRubros;