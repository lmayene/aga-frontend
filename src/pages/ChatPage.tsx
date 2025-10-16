import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, TextField, IconButton, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import apiClient from '../api';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

interface Agent {
  id: number;
  name: string;
}

function ChatPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!agentId) return;
      setIsLoading(true);
      try {
        const agentPromise = apiClient.get(`/agentes/${agentId}`);
        const historyPromise = apiClient.get(`/chat/${agentId}/history`);
        const [agentResponse, historyResponse] = await Promise.all([agentPromise, historyPromise]);

        setAgent(agentResponse.data);

        if (historyResponse.data.length > 0) {
          setMessages(historyResponse.data);
        } else {
          setMessages([{ sender: 'assistant', text: `Olá! Sou ${agentResponse.data.name}. Como posso te ajudar hoje?` }]);
        }

      } catch (err) {
        console.error("Erro ao buscar dados do chat:", err);
        setError("Não foi possível carregar os dados. Tente voltar para a galeria.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [agentId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isResponding]);

  const handleSend = async () => {
    if (!input.trim() || isResponding) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsResponding(true);

    try {
      const response = await apiClient.post(`/chat/${agentId}`, { message: userMessage.text });
      const assistantMessage: Message = { sender: 'assistant', text: response.data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Erro na chamada de chat:", err);
      const errorMessage: Message = { sender: 'assistant', text: 'Desculpe, ocorreu um erro ao processar sua mensagem.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsResponding(false);
    }
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="md">
        <Box sx={{ my: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
                <Typography variant="h4" component="h1">{agent ? agent.name : 'Carregando Agente...'}</Typography>
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            <Paper elevation={2} sx={{ height: '60vh', overflowY: 'auto', p: 2, mb: 2, backgroundColor: '#fafafa' }}>
                {messages.map((message, index) => (
                    <Box key={index} sx={{ mb: 2, display: 'flex', justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                        <Paper elevation={1} sx={{ p: 1.5, backgroundColor: message.sender === 'user' ? '#00a6e0' : '#ffffff', color: message.sender === 'user' ? 'white' : 'black', maxWidth: '70%', borderRadius: message.sender === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px' }}>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{message.text}</Typography>
                        </Paper>
                    </Box>
                ))}
                {isResponding && <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}><CircularProgress size={20} /></Box>}
                <div ref={chatEndRef} />
            </Paper>
            <Box sx={{ display: 'flex' }}>
                <TextField fullWidth variant="outlined" placeholder="Digite sua mensagem..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !isResponding && handleSend()} disabled={isResponding}/>
                <IconButton color="primary" aria-label="send" onClick={handleSend} disabled={isResponding} sx={{ p: '10px', ml: 1, backgroundColor: '#00a6e0', '&:hover': { backgroundColor: '#008bb5' } }}>
                    <SendIcon sx={{ color: 'white' }} />
                </IconButton>
            </Box>
        </Box>
    </Container>
  );
}

export default ChatPage;