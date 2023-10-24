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
      //userId: socket.id,
      userId: (socket as any).userId,
      chatId: (socket as any).chatId,
    });
    // console.log((socket as any).chatId);
    socket.join((socket as any).chatId);//думаю тут нужно подключать не к майлу 'dobruniak@rambler.rulents@mail.ru' (socket as any).email
    socket.on('private message', ({ content, to }) => {
      //console.log(to);
      //TODO:: если чат не новый чатайди число, то просто сохраняем месседж в базу. Иначе создаем чат, добавляем обоих себеседников в чат и сохраняем месседж и после этого нужно пересоздать группу сокета с новым чатайди
      socket.to(to).emit('private message', {
        content,
        from: (socket as any).userId,
      });
      //console.log('первое получ сервером ' + (socket as any).userId + to);
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
