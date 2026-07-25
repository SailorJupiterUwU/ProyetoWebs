import { useState } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { handleApiError } from '../utils/helpers';

const useReportes = () => {
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);

    const generarYDescargar = async (tipo, fecha_inicio, fecha_fin) => {
        setGenerating(true);
        setError(null);
        try {
            const { data } = await api.post(ENDPOINTS.REPORTES.GENERAR, {
                tipo,
                fecha_inicio,
                fecha_fin,
            });

            const response = await api.get(ENDPOINTS.REPORTES.DESCARGAR(data.id_reporte), {
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `reporte_${tipo.toLowerCase()}_${fecha_inicio}_${fecha_fin}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (err) {
            const msg = handleApiError(err);
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setGenerating(false);
        }
    };

    return { generarYDescargar, generating, error };
};

export default useReportes;