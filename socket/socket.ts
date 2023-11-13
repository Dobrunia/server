import { Server } from 'socket.io';
import * as http from 'http';
import { config } from '../config.js';

export function initSocket(app) {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: [config.cors],
    },
  });
  io.on('connection', (socket) => {
    if ((socket as any).chatId) {
      socket.broadcast.emit('user connected', {
        userId: (socket as any).userId,
        chatId: (socket as any).chatId,
      });
      socket.join((socket as any).chatId);
      socket.on('private message', ({ content, to }) => {
        socket.to(to).emit('private message', {
          content,
          from: (socket as any).userId,
        });
      });
    } else {
      socket.broadcast.emit('user online', {
        userId: (socket as any).userId, //сохранять в бд
      });
    }
  });

  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    const chatId = socket.handshake.auth.chatId;
    if (!userId) {
      return next(new Error('invalid username'));
    }
    (socket as any).userId = userId;
    (socket as any).chatId = chatId;
    next();
  });
  server.listen(config.port, () => {
    console.log('Server running on Port ', config.port);
  });
}
