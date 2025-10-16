import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  AppBar, Box, CssBaseline, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Toolbar, Typography, IconButton, Divider, 
  Avatar, Menu, MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCommentIcon from '@mui/icons-material/AddComment';
import ChatIcon from '@mui/icons-material/Chat';
import apiClient from '../api';
import { useAuth } from '../AuthContext';

const drawerWidth = 280;

interface Conversation {
  id: number;
  agent: {
    id: number;
    name: string;
  }
}

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); 
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]); 
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const convResponse = await apiClient.get('/conversations/');
        setConversations(convResponse.data);
      } catch (error) {
        console.error("Erro ao buscar conversas.", error);
      }
    };
    if (user) {
      fetchConversations();
    }
  }, [user, location.key]); 

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  
  const handleLogout = () => {
    handleClose(); 
    logout();      
    navigate('/'); 
  };

  const drawerContent = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/dashboard">
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Galeria de Agentes" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/chat-geral">
            <ListItemIcon><AddCommentIcon /></ListItemIcon>
            <ListItemText primary="Chat Geral" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <Typography sx={{ p: 2, fontWeight: 'bold', color: 'text.secondary', fontSize: '0.9rem' }}>CONVERSAS</Typography>
      <List>
        {/* Mapeamos a lista de conversas, não de agentes */}
        {conversations.map((convo) => (
          <ListItem key={convo.id} disablePadding>
            <ListItemButton component={RouterLink} to={`/chat/${convo.agent.id}`}>
              <ListItemIcon><ChatIcon sx={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary={convo.agent.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${isDrawerOpen ? drawerWidth : 0}px)` },
          marginLeft: { sm: `${isDrawerOpen ? drawerWidth : 0}px` },
          transition: (theme) => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: '#ffffff', color: '#1a1a1a', boxShadow: 'none', borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            AGA
          </Typography>
          <div>
            <IconButton onClick={handleMenu} size="small" sx={{ p: 0 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#00a6e0' }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }} open={Boolean(anchorEl)}
              onClose={handleClose} sx={{ mt: '5px' }}
            >
              <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{user?.name || 'Usuário'}</Typography>
                <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout}>Sair</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="persistent" anchor="left" open={isDrawerOpen}
        sx={{
          width: drawerWidth, flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #e0e0e0' },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box 
        component="main" 
        sx={{ 
            flexGrow: 1, p: 3, 
            transition: (theme) => theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: `-${drawerWidth}px`,
            ...(isDrawerOpen && {
                transition: (theme) => theme.transitions.create('margin', {
                    easing: theme.transitions.easing.easeOut,
                    duration: theme.transitions.duration.enteringScreen,
                }),
                marginLeft: 0,
            }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default MainLayout;