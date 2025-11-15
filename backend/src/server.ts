import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { logger } from './middlewares/log';
import { MongoDB } from './utils/MongoDB';
import { registerSocketHandlers } from './sockets/handler';

require('dotenv').config();
const socket = require('socket.io');

const app: express.Application = express();
const server = http.createServer(app);

export const DB = new MongoDB({
  name:process.env.DBUSER as string,
  password:process.env.DBPASSWORD as string,
  host:process.env.DBHOST as string,
  dbName:process.env.DBNAME as string
});

app.use(cors({
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "optionsSuccessStatus": 200,
  "exposedHeaders": ['Content-Disposition'],
  "preflightContinue": false,
}));

// middlewares
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({ extended: false }))

// socket.io setup
const io = socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
registerSocketHandlers(io);

// routes for testing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/test.html'));
});

async function startServer() {
  await DB.connect(); 

  server.listen(process.env.PORT, () => {
    logger.info('listening on *:'+ process.env.PORT);
  });
}

startServer();