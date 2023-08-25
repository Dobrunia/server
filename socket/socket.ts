import { Server } from 'socket.io';
import * as http from 'http';

export function initSocket(app, PORT) {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: ['http://127.0.0.1:3000', 'http://localhost:3000'],
    },
  });
  io.on('connection', (socket) => {
    // notify existing users
    console.log('connection');
    socket.broadcast.emit('user connected', {
      //обработать статус
      userID: socket.id,
      username: (socket as any).username,
    });
    socket.on('private message', ({ content, to }) => {
      socket.to(to).emit('private message', {
        content,
        from: (socket as any).username,
      });
      console.log('первое получ сервером ' + (socket as any).username + to);
    });
  });

  io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    console.log('io.use ' + username);
    if (!username) {
      return next(new Error('invalid username'));
    }
    (socket as any).username = username;
    next();
  });
//   server.listen(PORT, () => {
//     console.log('Server running on Port ', PORT);  
//   });
}
