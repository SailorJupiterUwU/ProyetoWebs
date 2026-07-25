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
    SOLICITUDES: {
      LISTAR: `${BASE_URL}/usuarios/solicitudes`,
      HISTORIAL: `${BASE_URL}/usuarios/solicitudes/historial`,
      APROBAR: (id) => `${BASE_URL}/usuarios/solicitudes/${id}/aprobar`,
      RECHAZAR: (id) => `${BASE_URL}/usuarios/solicitudes/${id}/rechazar`,
    },
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
    CREAR: `${BASE_URL}/roles`,
    ACTUALIZAR: (id) => `${BASE_URL}/roles/${id}`,
    CAMBIAR_ESTADO: (id) => `${BASE_URL}/roles/${id}/estado`,
    MODULOS: (id) => `${BASE_URL}/roles/${id}/modulos`,
  },
  PRESUPUESTO: {
    LISTAR: `${BASE_URL}/presupuestos`,
    OBTENER: (id) => `${BASE_URL}/presupuestos/${id}`,
    IMPORTAR: `${BASE_URL}/presupuestos/importar`,
    RUBROS: {
      LISTAR: (id) => `${BASE_URL}/presupuestos/${id}/rubros`,
      AGREGAR: (id) => `${BASE_URL}/presupuestos/${id}/rubros`,
      EDITAR_MONTO: (id, idRubro) => `${BASE_URL}/presupuestos/${id}/rubros/${idRubro}`,
    },
  },
  RUBROS: {
    LISTAR: `${BASE_URL}/rubros`,
    CREAR: `${BASE_URL}/rubros`,
    ACTUALIZAR: (id) => `${BASE_URL}/rubros/${id}`,
  },
  INGRESOS: {
    LISTAR: `${BASE_URL}/ingresos`,
    OBTENER: (id) => `${BASE_URL}/ingresos/${id}`,
    CREAR: `${BASE_URL}/ingresos`,
    RESUMEN: `${BASE_URL}/ingresos/resumen`,
    DISTRIBUCION: `${BASE_URL}/ingresos/distribucion`,
    MIS_PAGOS: `${BASE_URL}/ingresos/mis-pagos`,
  },
  EGRESOS: {
    LISTAR: `${BASE_URL}/egresos`,
    OBTENER: (id) => `${BASE_URL}/egresos/${id}`,
    CREAR: `${BASE_URL}/egresos`,
    ACTUALIZAR: (id) => `${BASE_URL}/egresos/${id}`,
    RESUMEN: `${BASE_URL}/egresos/resumen`,
  },
  VIVIENDAS: {
    LISTAR: `${BASE_URL}/viviendas`,
    OBTENER: (id) => `${BASE_URL}/viviendas/${id}`,
  },
  ALICUOTAS: {
    LISTAR: `${BASE_URL}/alicuotas`,
  },
  MULTAS: {
    LISTAR: `${BASE_URL}/multas`,
  },
  SEGURIDAD: {
    GENERAR_QR: `${BASE_URL}/seguridad/generar-qr`,
    VALIDAR_QR: `${BASE_URL}/seguridad/validar-qr`,
    HISTORIAL_ACCESOS: `${BASE_URL}/seguridad/accesos`,
  }
};

export default ENDPOINTS;