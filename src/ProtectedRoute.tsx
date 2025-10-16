import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  // Verifica se o "crachá digital" existe no armazenamento do navegador
  const token = localStorage.getItem('authToken');

  // Se o token NÃO existir, redireciona para a página de login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Se o token existir, permite o acesso à página solicitada
  return <Outlet />;
}

export default ProtectedRoute;