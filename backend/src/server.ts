import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';

import { logger } from './middlewares/log';
import { MongoDB } from './utils/MongoDB';
import { registerSocketHandlers } from './utils/sockets/socketRegister';

const app: express.Application = express();
const server = http.createServer(app);

// 資料庫連線實例
export const DB = new MongoDB({
  name: process.env.DBUSER as string,
  password: process.env.DBPASSWORD as string,
  host: process.env.DBHOST as string,
  dbName: process.env.DBNAME as string
});

// CORS 設定
app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
  exposedHeaders: ['Content-Disposition'],
  preflightContinue: false,
}));

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 呼叫註冊函式，將 IO 傳入
registerSocketHandlers(io);

// 測試路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/test.html'));
});

async function startServer() {
  try {
    await DB.connect();
    logger.info('MongoDB connected successfully');

    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      logger.info('listening on *:' + port);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();