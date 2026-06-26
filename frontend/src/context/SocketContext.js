'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(SOCKET_URL, {
      auth: { userId: user.id, username: user.username },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('new-notification', (notification) => {
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('new-notification', { detail: notification });
        window.dispatchEvent(event);
      }
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
