import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="animate-pulse text-lg font-semibold">Verifying Session...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    // Redirect to login but save the current location so we can send them back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;