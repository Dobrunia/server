import express from 'express';
import cors from 'cors';
import { router } from './router/router.js';
import cookieParser from 'cookie-parser';
import { logErrors, clientErrorHandler, errorHandler } from './middlewares/error.js';
import { initSocket } from './socket/socket.js';
import {config} from './config.js';

const server = express();
server.use(
  cors({
    credentials: true,
    origin: config.cors,
  }),
);
server.use(express.json());
server.use(cookieParser());
server.use('/api', router);
server.use(logErrors);
server.use(clientErrorHandler);
server.use(errorHandler);

const start = async () => {
  try {
    initSocket(server);
  } catch (e) {
    console.log('Ошибка: ' + e);
  }
};
start();