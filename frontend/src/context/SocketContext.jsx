import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Connect with JWT auth
    socketRef.current = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("[Socket] connection error:", err.message);
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
}

/** Returns the raw socket ref — call socketRef.current to use it */
export const useSocket = () => useContext(SocketContext);
