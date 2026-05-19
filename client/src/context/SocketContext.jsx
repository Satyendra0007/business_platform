import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { getToken } from '../lib/api';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Some auth implementations store token directly in user object, others in localStorage
    const token = user?.token || getToken();

    if (user && token) {
      const socketInstance = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5004', {
        auth: { token },
      });

      setSocket(socketInstance);

      socketInstance.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });

      return () => {
        socketInstance.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
