import { Server } from 'socket.io';
import * as http from 'http';
import { config } from '../config.js';
import {
  saveMessageToDb,
  saveNewMessageNotification,
  updateUserStatus,
} from '../services/sqlwrapper.js';

let io;

export function initSocket(app) {
  const server = http.createServer(app);
  io = new Server(server, {
    cors: {
      origin: [config.cors],
    },
  });
  io.on('connection', async (socket) => {
    await updateUserStatus((socket as any).userId);
    // console.log('user connected: '+  (socket as any).userId);
    socket.broadcast.emit('user connected', {
      userId: (socket as any).userId,
    });
    socket.on('join', (chatId) => {
      //console.log('user joined chatId: '+ chatId +" user: "+  (socket as any).userId + " socket: "+ socket.id);
      socket.join(chatId.toString());
    });
    socket.on('private message', async ({ content, to }) => {
      //console.log(content);
      let DATA = {
        content,
        sendBy: (socket as any).userId,
        chatId: to,
        datetime: new Date(),
      };
      // let notifData = {
      //   user_id_from: (socket as any).userId,
      //   chat_id_to: to,
      //   message_content: content,
      // }
      await saveMessageToDb(DATA);
      //await saveNewMessageNotification(notifData);
      io.to(to.toString()).emit('private message', {
        content,
        from: (socket as any).userId,
      });
    });
  });

  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error('invalid username'));
    }
    (socket as any).userId = userId;
    next();
  });
  server.listen(config.port, () => {
    console.log('Server running on Port ', config.port);
  });
}
