import dotenv from 'dotenv';
dotenv.config({path: '.env.production'});
import express from 'express';
import cors from 'cors';
import { router } from './router/router.js';
import cookieParser from 'cookie-parser';
import { logErrors, clientErrorHandler, errorHandler } from './middlewares/error.js';
import { initSocket } from './socket/socket.js';

const server = express();
server.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN,
  }),
);
server.use(express.json());
server.use(cookieParser(process.env.SECRET_COOKIE_KEY));
server.use('/api', router);
server.use(logErrors);
server.use(clientErrorHandler);
server.use(errorHandler);

const start = async () => {
  try {
    initSocket(server, process.env.SERVER_PORT);
    // server.listen(PORT, () => {
    //   console.log('server started on port - ' + PORT);
    // });
  } catch (e) {
    console.log('Ошибка: ' + e);
  }
};
start();