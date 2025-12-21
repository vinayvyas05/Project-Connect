import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../features/auth/services/authService';
import AuthForm from '../features/auth/components/AuthForm';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      // Logic: After registration, we automatically log them in
      login(data.user, data.token); 
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <AuthForm type="register" onSubmit={handleRegister} isLoading={loading} />
    </div>
  );
};

export default Register;