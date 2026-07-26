import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authEvents } from './authEvents';

/**
 * Instancia centralizada de Axios con interceptores
 */
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores globales
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      // En web se redirigía con window.location; en RN el AuthContext
      // escucha este evento y limpia su estado / navega a Login.
      authEvents.emitUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;