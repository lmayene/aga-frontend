import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, Button, Container, TextField, Typography, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import apiClient from '../api';
import { useAuth } from '../AuthContext';

interface Client {
  id: number;
  name: string;
}

function EditAgentPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // Pega o usuário logado
  
  // Estados do formulário
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [instructions, setInstructions] = useState('');

  // Estados de controle da página
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados específicos para o admin
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');

  // Efeito para buscar os dados do agente E a lista de clientes (se for admin)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Busca os dados do agente que estamos editando
        const agentResponse = await apiClient.get(`/agentes/${agentId}`);
        setName(agentResponse.data.name);
        setGoal(agentResponse.data.goal);
        setInstructions(agentResponse.data.instructions);
        setSelectedClientId(agentResponse.data.client.id.toString()); // Pré-seleciona o cliente atual

        // Se o usuário for admin, busca a lista de todos os clientes
        if (user?.role === 'admin') {
          const clientsResponse = await apiClient.get('/clients/');
          setClients(clientsResponse.data);
        }
      } catch (err) {
        setError('Não foi possível carregar os dados do agente.');
      } finally {
        setLoading(false);
      }
    };
    if (user) { // Só roda depois que as informações do usuário forem carregadas
      fetchInitialData();
    }
  }, [agentId, user]);

  const handleSubmit = async () => {
    if (!name || !instructions) {
      setError('O nome e as instruções do agente são obrigatórios.');
      return;
    }
    setError('');

    try {
      const agentUpdateData: {
        name: string;
        goal: string;
        instructions: string;
        client_id?: number;
      } = { name, goal, instructions };

      // Se for admin, inclui o client_id selecionado no payload da requisição
      if (user?.role === 'admin') {
        agentUpdateData.client_id = parseInt(selectedClientId);
      }
      
      await apiClient.put(`/agentes/${agentId}`, agentUpdateData);
      navigate('/dashboard');
    } catch (err) {
      setError('Não foi possível salvar as alterações.');
    }
  };

  if (loading) return <CircularProgress />;
  if (error && !name) return <Alert severity="error">{error}</Alert>;

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mt: 2 }}>
        <Typography component="h1" variant="h4" gutterBottom>Editar Agente: {name}</Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        <Box component="form" noValidate sx={{ mt: 1 }}>

          {/* Seletor de Cliente renderizado apenas para admins */}
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
          <TextField margin="normal" fullWidth label="Meta" value={goal} onChange={(e) => setGoal(e.target.value)} />
          <TextField margin="normal" required fullWidth label="Instruções" multiline rows={10} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          <Button type="button" variant="contained" sx={{ mt: 3, mb: 2, backgroundColor: '#00a6e0' }} onClick={handleSubmit}>Salvar Alterações</Button>
          <Button type="button" variant="outlined" sx={{ mt: 3, mb: 2, ml: 1 }} onClick={() => navigate('/dashboard')}>Cancelar</Button>
        </Box>
      </Box>
    </Container>
  );
}

export default EditAgentPage;