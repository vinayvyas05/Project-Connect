import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { status } = useAuth();

  // If already logged in, send them to the dashboard
  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;