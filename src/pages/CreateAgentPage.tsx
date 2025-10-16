import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import apiClient from '../api';
import { useAuth } from '../AuthContext';

// Interface para os dados do cliente que virão da API
interface Client {
  id: number;
  name: string;
}

function CreateAgentPage() {
  const { user } = useAuth(); // Pega o usuário do nosso estado global
  const navigate = useNavigate();

  // Estados para os campos do formulário
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');

  // Estados específicos para o admin
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');

  // Busca a lista de clientes SE o usuário for um admin
  useEffect(() => {
    if (user?.role === 'admin') {
      apiClient.get('/clients/')
        .then(response => {
          setClients(response.data);
        })
        .catch(err => {
          console.error("Erro ao buscar clientes", err);
          setError("Não foi possível carregar a lista de clientes.");
        });
    }
  }, [user]); 

  const handleSubmit = async () => {
    if (!name || !instructions) {
      setError('O nome e as instruções do agente são obrigatórios.');
      return;
    }
    setError('');

    try {
      const agentData: {
        name: string;
        goal: string;
        instructions: string;
        client_id?: number;
      } = { name, goal, instructions };

      if (user?.role === 'admin') {
        if (!selectedClientId) {
          setError('Como administrador, você deve selecionar um cliente.');
          return;
        }
        agentData.client_id = parseInt(selectedClientId);
      }

      await apiClient.post('/agentes/', agentData);
      navigate('/dashboard');

    } catch (err) {
      console.error("Erro ao criar agente:", err);
      setError('Não foi possível criar o agente. Tente novamente.');
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mt: 2 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Criar Novo Agente
        </Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        <Box component="form" noValidate sx={{ mt: 1 }}>

          {/* --- SELETOR DE CLIENTE RENDERIZADO CONDICIONALMENTE --- */}
          {user?.role === 'admin' && (
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="client-select-label">Cliente</InputLabel>
              <Select
                labelId="client-select-label"
                value={selectedClientId}
                label="Cliente"
                onChange={(e) => setSelectedClientId(e.target.value as string)}
              >
                {clients.map(client => (
                  <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField margin="normal" required fullWidth label="Nome do Agente" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField margin="normal" fullWidth label="Meta (Objetivo principal do agente)" value={goal} onChange={(e) => setGoal(e.target.value)} />
          <TextField margin="normal" required fullWidth label="Instruções (Este é o prompt principal que o agente seguirá)" multiline rows={10} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          
          <Button type="button" variant="contained" sx={{ mt: 3, mb: 2, backgroundColor: '#00a6e0' }} onClick={handleSubmit}>
            Salvar Agente
          </Button>
          <Button type="button" variant="outlined" sx={{ mt: 3, mb: 2, ml: 1 }} onClick={() => navigate('/dashboard')}>
            Cancelar
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default CreateAgentPage;