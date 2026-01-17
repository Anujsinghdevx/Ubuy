import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io({
      path: '/api/socketio',
    });

    return () => {
      socket.current?.disconnect();
    };
  }, []);

  return socket;
};
