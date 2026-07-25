/**
 * Funciones de validación para formularios
 */

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida una contraseña (mínimo 8 caracteres, una mayúscula, un número)
 * @param {string} password - Contraseña a validar
 * @returns {boolean} True si es válida
 */
export const isValidPassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

/**
 * Valida un número de teléfono (Ecuador)
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} True si es válido
 */
export const isValidPhone = (phone) => {
  const regex = /^[0-9+\-\s()]{10,15}$/;
  return regex.test(phone);
};

/**
 * Valida un número de cédula ecuatoriana
 * @param {string} cedula - Cédula a validar
 * @returns {boolean} True si es válida
 */
export const isValidCedula = (cedula) => {
  if (!cedula || cedula.length !== 10) return false;
  if (!/^\d+$/.test(cedula)) return false;

  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;

  const tercerDigito = parseInt(cedula.substring(2, 3), 10);
  if (tercerDigito > 5) return false;

  const digitoVerificador = parseInt(cedula.substring(9, 10), 10);
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.substring(i, i + 1), 10) * coeficientes[i];
    if (valor > 9) valor -= 9;
    suma += valor;
  }

  const residuo = suma % 10;
  const resultado = residuo === 0 ? 0 : 10 - residuo;

  return resultado === digitoVerificador;
};
