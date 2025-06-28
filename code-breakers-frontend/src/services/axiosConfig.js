import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: false, // solo true si usas cookies con Sanctum
});

// Interceptor para adjuntar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor único para manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.log('🔴 Interceptor de respuesta:', {
      url,
      status,
      message: error.response?.data?.message,
    });

    if (status === 401) {
      const mensaje = error.response?.data?.message || '';

      // Solo redirige si es un error auténtico de token inválido
      if (
        mensaje.toLowerCase().includes('unauthenticated') ||
        mensaje.toLowerCase().includes('token') ||
        mensaje.toLowerCase().includes('no autorizado')
      ) {
        console.warn('🔐 Token inválido o expirado, redirigiendo...');
        localStorage.removeItem('token');

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else {
        console.warn('🔁 Error 401 no relacionado con token. No se redirige.');
      }
    }


    return Promise.reject(error);
  }
);

export default api;
