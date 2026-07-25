/**
 * Definición de todos los endpoints de la API
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTRO: `${BASE_URL}/auth/registro`,
    FORGOT_PASSWORD: `${BASE_URL}/auth/recuperar-password`,
    RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
    LOGOUT: `${BASE_URL}/auth/logout`,
  },
  USUARIOS: {
    LISTAR: `${BASE_URL}/usuarios`,
    OBTENER: (id) => `${BASE_URL}/usuarios/${id}`,
    CREAR: `${BASE_URL}/usuarios`,
    ACTUALIZAR: (id) => `${BASE_URL}/usuarios/${id}`,
    CAMBIAR_ESTADO: (id) => `${BASE_URL}/usuarios/${id}/estado`,
    HISTORIAL: (id) => `${BASE_URL}/usuarios/${id}/historial`,
  },
  CASAS: {
    LISTAR: `${BASE_URL}/casas`,
    OBTENER: (id) => `${BASE_URL}/casas/${id}`,
    CREAR: `${BASE_URL}/casas`,
    ACTUALIZAR: (id) => `${BASE_URL}/casas/${id}`,
    ELIMINAR: (id) => `${BASE_URL}/casas/${id}`,
  },
  ROLES: {
    LISTAR: `${BASE_URL}/roles`,
    OBTENER: (id) => `${BASE_URL}/roles/${id}`,
    CREAR: `${BASE_URL}/roles`,
    ACTUALIZAR: (id) => `${BASE_URL}/roles/${id}`,
    CAMBIAR_ESTADO: (id) => `${BASE_URL}/roles/${id}/estado`,
    ELIMINAR: (id) => `${BASE_URL}/roles/${id}`,
  },
  PRESUPUESTO: {
    LISTAR: `${BASE_URL}/presupuesto`,
    OBTENER: (id) => `${BASE_URL}/presupuesto/${id}`,
    PROYECTAR: `${BASE_URL}/presupuesto/proyectar`,
    CARGAR: `${BASE_URL}/presupuesto/cargar`,
    CONFIRMAR: `${BASE_URL}/presupuesto/confirmar`,
  },
  FINANZAS: {
    INGRESOS: `${BASE_URL}/ingresos`,
    EGRESOS: `${BASE_URL}/egresos`,
  },
  SEGURIDAD: {
    GENERAR_QR: `${BASE_URL}/seguridad/generar-qr`,
    VALIDAR_QR: `${BASE_URL}/seguridad/validar-qr`,
    HISTORIAL_ACCESOS: `${BASE_URL}/seguridad/accesos`,
  }
};

export default ENDPOINTS;