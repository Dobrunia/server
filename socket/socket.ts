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
    // console.log(socket);
    socket.broadcast.emit('user connected', {
      //обработать статус
      //userID: socket.id,
      userID: (socket as any).email,
    });
    socket.join((socket as any).email);//думаю тут нужно подключать не к майлу 'dobruniak@rambler.rulents@mail.ru'
    socket.on('private message', ({ content, to }) => {
      socket.to(to).emit('private message', {
        content,
        from: (socket as any).email,
      });
      console.log('первое получ сервером ' + (socket as any).email + to);
    });
  });

  io.use((socket, next) => {
    const email = socket.handshake.auth.email;
    console.log('io.use ' + email);
    if (!email) {
      return next(new Error('invalid username'));
    }
    (socket as any).email = email;
    next();
  });
  server.listen(PORT, () => {
    console.log('Server running on Port ', PORT);
  });
}
