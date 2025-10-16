import axios from 'axios';

// 1. Lê a URL do backend da variável de ambiente.
//    No ambiente local, virá do .env. No Vercel, virá das configurações do projeto.
const API_URL = import.meta.env.VITE_API_BASE_URL;

// 2. Verificação de segurança para garantir que a variável foi configurada.
if (!API_URL) {
  console.error("ERRO CRÍTICO: A variável de ambiente VITE_API_BASE_URL não está definida!");
}

// 3. Cria uma instância "pré-configurada" do Axios.
const apiClient = axios.create({
  baseURL: API_URL,
});

// 4. Interceptor: Uma função que "intercepta" cada requisição antes de ser enviada.
apiClient.interceptors.request.use(
  (config) => {
    // Pega o token do armazenamento do navegador.
    const token = localStorage.getItem('authToken');
    if (token) {
      // Se o token existir, adiciona o cabeçalho de Autorização.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;