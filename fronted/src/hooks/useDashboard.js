import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';

const useDashboard = (anio = new Date().getFullYear()) => {
    const [resumen, setResumen] = useState({ total_ingresos: 0, total_egresos: 0, saldo: 0 });
    const [chartData, setChartData] = useState([]);
    const [cartera, setCartera] = useState({ viviendas_en_mora: 0, multas_generadas: 0, total_pendiente: 0 });
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [resumenRes, chartRes, carteraRes, movRes] = await Promise.all([
                api.get(ENDPOINTS.DASHBOARD.RESUMEN),
                api.get(ENDPOINTS.DASHBOARD.INGRESOS_VS_EGRESOS, { params: { anio } }),
                api.get(ENDPOINTS.DASHBOARD.CARTERA),
                api.get(ENDPOINTS.DASHBOARD.MOVIMIENTOS_RECIENTES, { params: { limit: 10 } }),
            ]);
            setResumen(resumenRes.data);
            setChartData(chartRes.data.data);
            setCartera(carteraRes.data);
            setMovimientos(movRes.data.data);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, [anio]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { resumen, chartData, cartera, movimientos, loading, error, refetch: fetchAll };
};

export default useDashboard;