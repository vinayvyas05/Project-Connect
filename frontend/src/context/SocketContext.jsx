import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, status } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    let newSocket;

    // Only connect if the user is authenticated
    if (status === 'authenticated' && user) {
      newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'), // Sent to auth.socket.js middleware
        },
      });

      setSocket(newSocket);

      // Example of a global listener (e.g., tracking online users)
      newSocket.on('users:online', (users) => {
        setOnlineUsers(users);
      });

      // Cleanup on logout or unmount
      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [status, user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);