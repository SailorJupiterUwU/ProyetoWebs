/**
 * Funciones auxiliares reutilizables para todo el proyecto
 */

/**
 * Formatea un precio a moneda local (USD por defecto)
 * @param {number} price - Precio a formatear
 * @param {string} currency - Código de moneda
 * @returns {string} Precio formateado
 */
export const formatPrice = (price, currency = 'USD') => {
  if (isNaN(price)) return '$0.00';
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado con "..."
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Maneja errores de Axios y retorna un mensaje amigable
 * @param {Error} error - Error de Axios
 * @returns {string} Mensaje de error amigable
 */
export const handleApiError = (error) => {
  if (error.response) {
    return (
      error.response.data?.msg ||
      error.response.data?.mensaje ||
      error.response.data?.message ||
      'Ocurrió un error en el servidor'
    );
  } else if (error.request) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión.';
  } else {
    return error.message || 'Error desconocido';
  }
};

/**
 * Valida si un objeto está vacío
 * @param {Object} obj - Objeto a validar
 * @returns {boolean} True si está vacío
 */
export const isEmptyObject = (obj) => {
  return !obj || Object.keys(obj).length === 0;
};

/**
 * Genera un ID único temporal (para listas sin backend)
 * @returns {string} ID único
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Formatea una fecha a un formato legible
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
