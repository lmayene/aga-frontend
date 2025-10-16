// src/pages/LoginPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../AuthContext'; // Importamos o nosso hook de autenticação

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar o carregamento
  const navigate = useNavigate();
  const auth = useAuth(); // Usamos o hook para acessar as funções de login

  const handleLogin = async () => {
    // Evita múltiplos cliques enquanto o login está em processamento
    if (isLoading) return; 

    setError('');
    setIsLoading(true);

    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    try {
      // Usamos o axios puro aqui, pois o apiClient ainda não tem o token
      const response = await axios.post('http://127.0.0.1:8080/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const accessToken = response.data.access_token;
      
      // Entregamos o token para o AuthContext. Ele irá salvar o token,
      // buscar os dados do usuário e atualizar o estado global.
      await auth.login(accessToken);
      
      // Navegamos para o dashboard somente após o login ser processado
      navigate('/dashboard'); 

    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.status === 401 ? 'Email ou senha incorretos.' : 'Ocorreu um erro no servidor.');
      } else {
        setError('Não foi possível conectar ao servidor.');
      }
    } finally {
      setIsLoading(false); // Libera o botão, independentemente do resultado
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 3,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: 'white'
        }}
      >
        <Typography component="h1" variant="h5">
          Bem-vindo ao AGA
        </Typography>
        
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Endereço de E-mail"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()} // Permite login com Enter
          />
          <Button
            type="button"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, backgroundColor: '#00a6e0' }}
            onClick={handleLogin}
            disabled={isLoading} // Desabilita o botão durante o carregamento
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default LoginPage;