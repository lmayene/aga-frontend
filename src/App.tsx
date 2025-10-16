import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import CreateAgentPage from './pages/CreateAgentPage';
import ChatPage from './pages/ChatPage';
import EditAgentPage from './pages/EditAgentPage'; 
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './AuthContext';
import UniversalChatPage from './pages/UniversalChatPage';

function App() {
  return (
    <>
      <CssBaseline />
      <AuthProvider> {/* Envolve toda a aplicação para que o estado de login seja global */}
        <Routes>
          {/* Rota pública: qualquer um pode acessar */}
          <Route path="/" element={<LoginPage />} />

          {/* Ninho de Rotas Protegidas: só podem ser acessadas por usuários logados */}
          <Route element={<ProtectedRoute />}>
            {/* Ninho de Layout: todas as páginas aqui dentro terão a barra lateral e a barra superior */}
            <Route element={<MainLayout />}>
              
              {/* As páginas específicas que aparecerão na área de conteúdo */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/agentes/novo" element={<CreateAgentPage />} />
              <Route path="/agentes/edit/:agentId" element={<EditAgentPage />} />
              <Route path="/chat/:agentId" element={<ChatPage />} />
              <Route path="/chat-geral" element={<UniversalChatPage />} />
              
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </>
  )
}

export default App;