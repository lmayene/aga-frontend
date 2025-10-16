import axios from 'axios';

// Cria uma instância "pré-configurada" do Axios
const apiClient = axios.create({
  baseURL: 'https://aga-backend-cd9b.onrender.com/', 
});

// Isso é um "Interceptor": uma função que "intercepta" cada requisição antes de ela ser enviada
apiClient.interceptors.request.use(
  (config) => {
    // Pega o token do "porta-luvas" do navegador (localStorage)
    const token = localStorage.getItem('authToken');
    if (token) {
      // Se o token existir, adiciona o cabeçalho de Autorização
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;