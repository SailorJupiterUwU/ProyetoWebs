import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';

const useVisitantes = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHoy = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const hoy = new Date().toISOString().split('T')[0];
            const { data: res } = await api.get(ENDPOINTS.VISITANTES.LISTAR, {
                params: { fecha_inicio: hoy, fecha_fin: hoy },
            });
            setData(res.data);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHoy();
    }, [fetchHoy]);

    const crearVisitante = async (payload) => {
        try {
            const { data: res } = await api.post(ENDPOINTS.VISITANTES.CREAR, payload);
            await fetchHoy();
            return { success: true, id_visitante: res.id_visitante, codigo_qr: res.codigo_qr, msg: res.msg };
        } catch (err) {
            return { success: false, error: handleApiError(err) };
        }
    };

    return { data, loading, error, refetch: fetchHoy, crearVisitante };
};

export default useVisitantes;