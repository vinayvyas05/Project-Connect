import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../features/auth/services/authService';
import AuthForm from '../features/auth/components/AuthForm';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      login(data.user, data.token); // Updates AuthContext
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <AuthForm type="login" onSubmit={handleLogin} isLoading={loading} />
    </div>
  );
};

export default Login;