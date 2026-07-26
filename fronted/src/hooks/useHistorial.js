import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';

const useHistorial = (immediate = true) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHistorial = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                id_rubro: filters.id_rubro || undefined,
                fecha_inicio: filters.fecha_inicio || undefined,
                fecha_fin: filters.fecha_fin || undefined,
            };
            const { data: res } = await api.get(ENDPOINTS.HISTORIAL.LISTAR, { params });
            setData(res.data);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (immediate) {
            fetchHistorial();
        }
    }, [fetchHistorial, immediate]);

    return { data, loading, error, refetch: fetchHistorial };
};

export default useHistorial;