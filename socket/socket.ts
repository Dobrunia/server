import { Server } from 'socket.io';
import * as http from 'http';
import 'dotenv/config';

export function initSocket(app, PORT) {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: [process.env.CORS_ORIGIN, `${process.env.CLIENT_HOST}:${process.env.CLIENT_PORT}`],
    },
  });
  io.on('connection', (socket) => {
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
  server.listen(PORT, () => {
    console.log('Server running on Port ', PORT);
  });
}
