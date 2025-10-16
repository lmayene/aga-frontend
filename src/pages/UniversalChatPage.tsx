import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Box, Container, TextField, IconButton, Typography, Paper, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import { useAuth } from '../AuthContext';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

function UniversalChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate(); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setMessages([
        { sender: 'assistant', text: `Olá, ${user.name || user.email}! Este é o Chat Geral. Faça uma pergunta e eu tentarei encontrar o melhor agente para a tarefa.` }
      ]);
    }
  }, [user]);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isResponding) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsResponding(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const simulatedResponse: Message = { 
      sender: 'assistant', 
      text: "A funcionalidade de roteamento inteligente de agentes ainda está em desenvolvimento. No futuro, eu analisaria sua pergunta e a enviaria para o agente especialista correto." 
    };
    setMessages(prev => [...prev, simulatedResponse]);
    setIsResponding(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 2 }}>
        {/* --- CABEÇALHO COM BOTÃO "VOLTAR" --- */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Chat Geral
          </Typography>
        </Box>
        
        <Paper elevation={2} sx={{ height: '60vh', overflowY: 'auto', p: 2, mb: 2, backgroundColor: '#fafafa' }}>
          {messages.map((message, index) => (
            <Box key={index} sx={{ mb: 2, display: 'flex', justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <Paper elevation={1} sx={{ p: 1.5, backgroundColor: message.sender === 'user' ? '#00a6e0' : '#ffffff', color: message.sender === 'user' ? 'white' : 'black', maxWidth: '70%', borderRadius: message.sender === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px', }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{message.text}</Typography>
              </Paper>
            </Box>
          ))}
          {isResponding && <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}><CircularProgress size={20} /></Box>}
          <div ref={chatEndRef} />
        </Paper>

        <Box sx={{ display: 'flex' }}>
          <TextField
            fullWidth variant="outlined" placeholder="Digite sua pergunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isResponding && handleSend()}
            disabled={isResponding}
          />
          <IconButton 
            color="primary" aria-label="send" onClick={handleSend} disabled={isResponding}
            sx={{ p: '10px', ml: 1, backgroundColor: '#00a6e0', '&:hover': { backgroundColor: '#008bb5' } }}
          >
            <SendIcon sx={{ color: 'white' }} />
          </IconButton>
        </Box>
      </Box>
    </Container>
  );
}

export default UniversalChatPage;