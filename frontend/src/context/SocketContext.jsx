import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Connect with JWT auth
    // Strip '/api' from the URL if it exists, as sockets connect to the base server.
    const socketUrl = import.meta.env.VITE_URL.replace(/\/api$/, "");
    
    socketRef.current = io(socketUrl, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("[Socket] connection error:", err.message);
      setIsConnected(false);
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socketRef, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

/** Returns { socketRef, isConnected } — use socketRef.current for the raw socket */
export const useSocket = () => useContext(SocketContext);
