import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Alert, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../api';
import { useAuth } from '../AuthContext';

interface Client {
  id: number;
  name: string;
}

interface Agent {
  id: number;
  name: string;
  goal: string;
  instructions: string;
  client: Client;
}

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setError('');
        setLoading(true);
        const response = await apiClient.get('/agentes/');
        setAgents(response.data);
      } catch (err) {
        console.error("Erro ao buscar agentes:", err);
        setError('Não foi possível carregar os agentes. Tente recarregar a página.');
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (agent: Agent) => {
    setAgentToDelete(agent);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDeleteDialog(false);
    setAgentToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!agentToDelete) return;
    try {
      await apiClient.delete(`/agentes/${agentToDelete.id}`);
      setAgents(prevAgents => prevAgents.filter(a => a.id !== agentToDelete.id));
    } catch (err) {
      console.error("Erro ao deletar agente", err);
      setError("Não foi possível deletar o agente.");
    } finally {
      handleCloseDialog();
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container maxWidth="lg"><Alert severity="error" sx={{ mt: 2 }}>{error}</Alert></Container>;
  }

  return (
    <Container component="main" maxWidth="lg">
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Typography component="h1" variant="h4">Galeria de Agentes</Typography>
          <Button variant="contained" sx={{ backgroundColor: '#00a6e0' }} onClick={() => navigate('/agentes/novo')}>
            + Criar Novo Agente
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth variant="outlined" placeholder="Pesquisar agentes por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          />
        </Box>
        
        <Grid container spacing={3}>
          {filteredAgents.map((agent) => (
            <Grid item key={agent.id} xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
              <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: 1 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">{agent.name}</Typography>
                  {user?.role === 'admin' && (
                    <Typography variant="caption" color="text.secondary" display="block">Cliente: {agent.client.name}</Typography>
                  )}
                  <Typography sx={{ mt: 1.5, color: 'text.secondary' }}>{agent.goal}</Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <div>
                    <Button size="small" sx={{ color: '#00a6e0' }} onClick={() => navigate(`/chat/${agent.id}`)}>Conversar</Button>
                    <Button size="small" color="secondary" onClick={() => navigate(`/agentes/edit/${agent.id}`)}>Editar</Button>
                  </div>
                  <IconButton size="small" onClick={() => handleDeleteClick(agent)} aria-label="deletar">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você tem certeza que deseja deletar o agente "{agentToDelete?.name}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error">Deletar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default DashboardPage;