// src/pages/api/socket.ts
import { Server as IOServer } from 'socket.io';
import type { NextApiRequest } from 'next';
import type { NextApiResponseServerIO } from '@/types/next.d.ts';

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('🔌 Initializing Socket.io server...');

    const httpServer = res.socket.server;
    const io = new IOServer(httpServer, {
      path: '/api/socketio',
    });

    io.on('connection', (socket) => {
      console.log('✅ Socket connected:', socket.id);

      socket.on('bid', (data) => {
        console.log('📨 New bid:', data);
        socket.broadcast.emit('new-bid', data);
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
