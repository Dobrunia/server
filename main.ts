import express from 'express';
import cors from 'cors';
import { router } from './router/router';
import cookieParser from 'cookie-parser';
import { checkHeader } from './middlewares/auth';
import { initSocket } from './socket/socket';

const server = express();
server.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  }),
);
server.use(express.json());
server.use(cookieParser());
server.use('/api', router);
// server.use(checkHeader);
const PORT = 5000;

const start = async () => {
  try {
    initSocket(server, PORT);
    // server.listen(PORT, () => {
    //   console.log('server started on port - ' + PORT);
    // });
  } catch (e) {
    console.log('Ошибка: ' + e);
  }
};
start();
