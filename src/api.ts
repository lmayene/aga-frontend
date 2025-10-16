import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_URL) {
  console.error("ERRO CRÍTICO: A variável de ambiente VITE_API_BASE_URL não está definida!");
}

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;